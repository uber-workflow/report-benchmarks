var iqr = require("compute-iqr");
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  const commentString = "[//]: # (BOXPLOT)";
  app.on("pull_request.opened", async context => {
    const [base_checks, head_checks] = await Promise.all([
      context.github.checks.listForRef(
        context.repo({
          check_name: "Benchmarks",
          status: "completed",
          filter: "latest",
          ref: context.payload.pull_request.base.sha,
        })
      ),
      context.github.checks.listForRef(
        context.repo({
          check_name: "Benchmarks",
          status: "completed",
          filter: "latest",
          ref: context.payload.pull_request.head.sha,
        })
      ),
    ]);

    if (
      !(await cliHasChanged(
        context,
        context.payload.pull_request.head.sha,
        context.payload.pull_request.base.sha
      ))
    )
      return;

    if (head_checks.data.total_count < 1) {
      return context.github.issues.createComment(
        context.issue({
          body: `${commentString}\nBenchmark hasn't finished running yet on HEAD commit, this comment will update after it completes`,
        })
      );
    }
    // issues is a terrible name, issues and pull requests use the same api for comments
    return context.github.issues.createComment(
      context.issue({
        body: generateCommentBody(
          base_checks.data.total_count > 0
            ? JSON.parse(base_checks.data.check_runs[0].output.text)
            : "",
          JSON.parse(head_checks.data.check_runs[0].output.text)
        ),
      })
    );
  });

  app.on("check_run.completed", async context => {
    if (context.payload.check_run.name !== "Benchmarks") {
      return;
    }
    const head_sha = context.payload.check_run.head_sha;

    let pull_requests = context.payload.check_run.pull_requests;
    const pull_request = pull_requests.find(pr => {
      return pr.head.sha == head_sha;
    });

    if (pull_request == undefined) {
      return;
    }
    if (!(await cliHasChanged(context, head_sha, pull_request.base.sha)))
      return;

    const head_checks = context.payload.check_run.output;
    const [base_checks, comments] = await Promise.all([
      context.github.checks.listForRef(
        context.repo({
          check_name: "Benchmarks",
          status: "completed",
          filter: "latest",
          ref: pull_request.base.sha,
        })
      ),
      context.github.issues.listComments(
        context.repo({
          number: pull_request.number,
        })
      ),
    ]);

    const comment = comments.data.find(cmt => {
      return cmt.body.startsWith(commentString);
    });

    const commentBody = generateCommentBody(
      base_checks.data.total_count > 0
        ? JSON.parse(base_checks.data.check_runs[0].output.text)
        : "",
      JSON.parse(head_checks.text)
    );
    if (comment == undefined) {
      return context.github.issues.createComment(
        context.repo({
          number: pull_request.number,
          body: commentBody,
        })
      );
    } else {
      return context.github.issues.updateComment(
        context.repo({
          comment_id: comment.id,
          body: commentBody,
        })
      );
    }
  });

  function generateCommentBody(base_json, head_json) {
    let imageStrings = [],
      medianDeltas = [],
      medianDurations = [],
      titles = [],
      iqrs = [];
    if (base_json.version == head_json.version) {
      for (let i = 0; i < head_json.data.length; i++) {
        const chart = {
          chartType: "boxplot",
          title: head_json.data[i].build,
          labels: [`head`, `base`],
          data: [head_json.data[i].time, base_json.data[i].time],
        };
        titles.push(head_json.data[i].build);
        medianDeltas.push(
          median(head_json.data[i].time) - median(base_json.data[i].time)
        );
        medianDurations.push(median(head_json.data[i].time));
        iqrs.push(iqr(head_json.data[i].time));
        imageStrings.push(
          ` [Boxplot](${process.env.CHART_URL}/?json=${encodeURIComponent(
            JSON.stringify(chart)
          )})`
        );
      }
    } else {
      // if the versions are different we need more complex logic
      for (let i = 0; i < head_json.data.length; i++) {
        const chart = {
          chartType: "boxplot",
          title: head_json.data[i].build,
          labels: [`head`, `base`],
          data: [head_json.data[i].time],
        };
        if (base_json.data != undefined) {
          const base_data = base_json.data.find(build => {
            return build.build == data[i].build;
          });
          if (base_data != undefined && base_data.time != undefined) {
            data.push(base_data.time);
          }
        }

        imageStrings.push(
          ` [Boxplot](${process.env.CHART_URL}/?json=${encodeURIComponent(
            JSON.stringify(chart)
          )})`
        );
      }
    }
    return `${commentString}\n**fusion-cli Benchmarks**\n_Here's how your change impacted the build times of apps:_
      \n${createTableString(
        titles,
        ["∆ Median", "Median (head)", "IQR (head)", "Chart"],
        [medianDeltas, medianDurations, iqrs, imageStrings]
      )}`;
  }

  async function cliHasChanged(context, headSha, baseSha) {
    const [headTarballHashes, baseTarballHashes] = await Promise.all([
      context.github.checks.listForRef(
        context.repo({
          check_name: "Package tarball hashes",
          status: "completed",
          filter: "latest",
          ref: headSha,
        })
      ),
      context.github.checks.listForRef(
        context.repo({
          check_name: "Package tarball hashes",
          status: "completed",
          filter: "latest",
          ref: baseSha,
        })
      ),
    ]);
    return (
      headTarballHashes.data.total_count > 0 &&
      baseTarballHashes.data.total_count > 0 &&
      JSON.parse(headTarballHashes.data.check_runs[0].output.text).packages[
        "fusion-cli"
      ].shasum !==
        JSON.parse(baseTarballHashes.data.check_runs[0].output.text).packages[
          "fusion-cli"
        ].shasum
    );
  }
  app.on("issues.edited", async context => {
    postStatus(context.github);
    return true;
  });
  app.on("issues.opened", async context => {
    postStatus(context.github);
    return true;
  });
};

async function postStatus(github) {
  const sha = "0f94d2fb1e1623cea039fce97b7aa265f029e608";
  await github.checks.create({
    owner: "LambStack",
    repo: "my-first-app",
    name: "Package tarball hashes",
    head_sha: sha,
    status: "completed",
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    conclusion: "success",
    output: {
      title: "Package tarball hashes",
      summary: "Package tarball hashes",
      text: string,
    },
  });
  await github.checks.create({
    owner: "LambStack",
    repo: "my-first-app",
    name: "Benchmarks",
    head_sha: sha,
    status: "completed",
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    conclusion: "success",
    output: {
      title: "Benchmarks",
      summary: "Benchmarks",
      text: string2,
    },
  });
}

const string2 = `{"version":1,"fixture":"bQjudngTw3YGY3IuhLHwELAG5fo=","data":[{"build":"cached","time":[5039,4994,5006,4986,5063]},{"build":"uncached","time":[78712,72361,71898,71876,71871]},{"build":"incremental","time":[2726,2890,2753,2898,2804]},{"build":"production","time":[115983,114604,113994,115035,114898]}]}`;

const string = `{
"schema_version": 1,
"packages": {
"jazelle": {
"shasum": "d3a18e22acf2a45d3cea26e6980b8d8968c6efee",
"localDependencies": []
},
"fusion-tokens": {
"shasum": "20eb22d3d54670421451ef890374271b8bed7b81",
"localDependencies": [
"fusion-core"
]
},
"fusion-test-utils": {
"shasum": "75269dc624c71338df1e4c747d156a4cfd345881",
"localDependencies": [
"fusion-core"
]
},
"fusion-scaffolder": {
"shasum": "eebf7f78c2fb8c1ce9ae011d41743eac302d5a66",
"localDependencies": []
},
"fusion-rpc-redux": {
"shasum": "53106da718caf3335162723c4a37d5f2e1498c46",
"localDependencies": []
},
"fusion-react": {
"shasum": "ec396a26ac3eca39e1b2c81cfdbcc8d5426ba94d",
"localDependencies": [
"fusion-core"
]
},
"fusion-plugin-universal-logger": {
"shasum": "0da0cda86b09d00a7e1a32ef6449dcd7d36d9492",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"fusion-plugin-universal-events": {
"shasum": "f0cf279ea514adda803fcb050f05a62f12268fba",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"fusion-plugin-universal-events-react": {
"shasum": "f9e1da94530f43077c7f7efc1ffab977229fcae6",
"localDependencies": [
"fusion-plugin-universal-events",
"fusion-test-utils",
"fusion-react"
]
},
"fusion-plugin-styletron-react": {
"shasum": "b8dd13f7d01203418a144ff22cbf7589bd368ea8",
"localDependencies": [
"fusion-core"
]
},
"fusion-plugin-service-worker": {
"shasum": "4fed83726b0d4025bfd24bf106c6f34b76aaab8a",
"localDependencies": [
"fusion-cli",
"fusion-core",
"fusion-tokens"
]
},
"fusion-plugin-rpc": {
"shasum": "847362527a99dcd01f39c5fa05c78565a747a030",
"localDependencies": [
"fusion-core",
"fusion-plugin-universal-events",
"fusion-tokens"
]
},
"fusion-plugin-rpc-redux-react": {
"shasum": "aca39863cbea05e0c19679660d81667a36ea4a66",
"localDependencies": [
"fusion-rpc-redux",
"fusion-plugin-rpc",
"fusion-plugin-react-redux",
"fusion-react"
]
},
"fusion-plugin-redux-action-emitter-enhancer": {
"shasum": "19e102efeffe73b189756c809426536742700e22",
"localDependencies": [
"fusion-core",
"fusion-plugin-universal-events"
]
},
"fusion-plugin-react-router": {
"shasum": "e52e72108890e68f387bdfe3881f399e065219b3",
"localDependencies": [
"fusion-core",
"fusion-plugin-universal-events"
]
},
"fusion-plugin-react-redux": {
"shasum": "95a473b0e3066b8052e7beec8ccaeea8824cf1c9",
"localDependencies": [
"fusion-core"
]
},
"fusion-plugin-react-helmet-async": {
"shasum": "fabcc8bd533d6ede547a2ab0c633fdb744ff0c62",
"localDependencies": [
"fusion-core"
]
},
"fusion-plugin-node-performance-emitter": {
"shasum": "17da947e4d9270ca8a084824de48b98c57d936d7",
"localDependencies": [
"fusion-core",
"fusion-plugin-universal-events"
]
},
"fusion-plugin-jwt": {
"shasum": "0a47e3e2086f11e7c56736332ec84aa4ddf7db96",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"fusion-plugin-introspect": {
"shasum": "51db547d6a3707a8c9f8ec4ffca358e3086fe897",
"localDependencies": [
"fusion-core"
]
},
"fusion-plugin-i18n": {
"shasum": "151faee0ed79e3e513d40c88398e35ad8b338533",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"fusion-plugin-i18n-react": {
"shasum": "b33589e28f1dfe0dabecba894bd00032f6418fd1",
"localDependencies": [
"fusion-plugin-i18n",
"fusion-core",
"fusion-react"
]
},
"fusion-plugin-http-handler": {
"shasum": "1e96abd5218bb30c3c5a968b55e397fa62458172",
"localDependencies": [
"fusion-core"
]
},
"fusion-plugin-font-loader-react": {
"shasum": "5f4127bdf857ae33b1ac00e1168add656787e85f",
"localDependencies": [
"fusion-react",
"fusion-core"
]
},
"fusion-plugin-error-handling": {
"shasum": "000c5086638a39dd27cfe755553a75b704f2d9e1",
"localDependencies": [
"fusion-core"
]
},
"fusion-plugin-csrf-protection": {
"shasum": "8f7b75735acfab9a9cf0e072539641945e0f848b",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"fusion-plugin-connected-react-router": {
"shasum": "e50660f546db0ee21f3856683fb86a5349cf374b",
"localDependencies": [
"fusion-plugin-react-redux",
"fusion-core",
"fusion-plugin-react-router"
]
},
"fusion-plugin-browser-performance-emitter": {
"shasum": "f0b5c9c1831194b4af8e0b36f9f53d3e78f8e899",
"localDependencies": [
"fusion-core"
]
},
"fusion-plugin-apollo": {
"shasum": "8ac1c97b6f07e7b28467c84ad7142d8389ff2429",
"localDependencies": [
"fusion-core",
"fusion-react",
"fusion-tokens"
]
},
"fusion-core": {
"shasum": "d6e9cffa997897fe4299fa7c5656b71535d15da4",
"localDependencies": []
},
"fusion-cli": {
"shasum": "755d7faffae11ad94c46673e196695fed7dcaa6b@",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"eslint-config-fusion": {
"shasum": "d8755c8aa203a573955c9cf538afa4914e087a0d",
"localDependencies": []
},
"create-fusion-plugin": {
"shasum": "6d8efd4d17b71f4171def46e8eeb2d7de4ef9463",
"localDependencies": [
"fusion-scaffolder"
]
},
"create-fusion-app": {
"shasum": "491e9c1dacea9678e7e56c9ee5446e9246dba331",
"localDependencies": [
"fusion-scaffolder"
]
},
"fusion-plugin-web-app-manifest": {
"shasum": "ee7995fcfd8b47fca9dc26ff3c95978997b3d308",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-web-rpc-compat": {
"shasum": "0dd635f74b7ea08510f8a023f8a8bebf3e327a03",
"localDependencies": [
"fusion-core",
"fusion-plugin-rpc"
]
},
"@uber/fusion-plugin-universal-m3-compat": {
"shasum": "5d40eb0913a59ca1f0536c3c12632365907a02dc",
"localDependencies": [
"@uber/fusion-plugin-m3",
"fusion-core"
]
},
"@uber/fusion-plugin-universal-logger-compat": {
"shasum": "d97900f25f52687e3acf43b800d4a81aadcdfe44",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-uber-xhr-compat": {
"shasum": "e1c57d8fbb07eb0ccc50287c96a7536c2a7a1650",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-tracer": {
"shasum": "664913f23c9fb040dcc60a7bcc5ce8346a4fb12b",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-tealium": {
"shasum": "15c8a9b3d599be0baa7829c717bcc554b2913edf",
"localDependencies": [
"@uber/fusion-analyticsjs-utils",
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-tealium-react": {
"shasum": "5b8cfd1fd03b6685a8dbee23ab7fa27960761521",
"localDependencies": [
"@uber/fusion-plugin-tealium",
"fusion-react",
"fusion-tokens"
]
},
"@uber/fusion-plugin-tchannel": {
"shasum": "0211ca5f27554cfe05481cdc5bcb99144b088647",
"localDependencies": [
"@uber/fusion-plugin-m3",
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-secure-headers": {
"shasum": "198f144d83dd1ef649bc1d1de698840bb9ce64e3",
"localDependencies": [
"fusion-core"
]
},
"@uber/fusion-plugin-secrets": {
"shasum": "ba2e1db860c62cadc8ea1208020c02ff30ba9147",
"localDependencies": [
"fusion-core"
]
},
"@uber/fusion-plugin-s3-asset-proxying": {
"shasum": "0833d6f2d3cf1210d47fec96b48a6fcaded1ba8a",
"localDependencies": [
"fusion-core"
]
},
"@uber/fusion-plugin-rosetta": {
"shasum": "cbbe3284c72d33df04dbd1f310ff4fb0d7ceffc2",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-react-router-v3-compat": {
"shasum": "4c00cd3e3b699cc95516c03d1ca6b16d44793ae8",
"localDependencies": [
"fusion-core",
"fusion-plugin-react-router"
]
},
"@uber/fusion-plugin-proxy-compat": {
"shasum": "7319adbf801e0f86e1a6b41f6436009050377223",
"localDependencies": [
"@uber/fusion-plugin-galileo",
"@uber/fusion-plugin-tracer",
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-page-skeleton-compat": {
"shasum": "0cfe76fcdf446bcd65889727954a752ba31d3fa6",
"localDependencies": [
"fusion-core"
]
},
"@uber/fusion-plugin-marketing": {
"shasum": "acc98e0ba94db6dded382289f8c4fa40e504b86f",
"localDependencies": [
"@uber/fusion-plugin-heatpipe",
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-magellan": {
"shasum": "5f416532784e18e4dd2762fdca68df63ab9d69a3",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-m3": {
"shasum": "e5ead1fc64a29a9ec4fc8495fb8c111f7b14fae8",
"localDependencies": [
"fusion-core",
"fusion-plugin-universal-events"
]
},
"@uber/fusion-plugin-m3-react": {
"shasum": "279318b8845a05bd4460cb488a9270acca3265e3",
"localDependencies": [
"@uber/fusion-plugin-m3",
"fusion-react"
]
},
"@uber/fusion-plugin-logtron": {
"shasum": "3f62f9da02b93d6c327c14c99284c0da5e7817cb",
"localDependencies": [
"@uber/fusion-plugin-m3",
"fusion-core",
"fusion-plugin-universal-events",
"fusion-tokens"
]
},
"@uber/fusion-plugin-logtron-react": {
"shasum": "84e8df54a9fdda60c1bb85745be445296507d772",
"localDependencies": [
"@uber/fusion-plugin-logtron",
"fusion-react",
"fusion-tokens"
]
},
"@uber/fusion-plugin-initial-state-compat": {
"shasum": "0279c6205019f62838d2b22ebbbe032970866165",
"localDependencies": [
"fusion-core"
]
},
"@uber/fusion-plugin-heatpipe": {
"shasum": "cdb80ab174bc22b27eebe30116b0f46518c66920",
"localDependencies": [
"fusion-core",
"fusion-plugin-universal-events",
"fusion-tokens"
]
},
"@uber/fusion-plugin-google-analytics": {
"shasum": "b8edb824a72395c23e88c8f0cc9cafc236ae65f9",
"localDependencies": [
"fusion-core"
]
},
"@uber/fusion-plugin-google-analytics-react": {
"shasum": "5fae753547f864eccecb28bfccd755d446ab053d",
"localDependencies": [
"@uber/fusion-plugin-google-analytics",
"fusion-react"
]
},
"@uber/fusion-plugin-galileo": {
"shasum": "bd1ee732d0b14883cf7dc2af5c6350e4af364281",
"localDependencies": [
"@uber/fusion-plugin-m3",
"@uber/fusion-plugin-tracer",
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-flipr": {
"shasum": "a9b3b7d021e6a05486799b8697f31a264c302d03",
"localDependencies": [
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-feature-toggles": {
"shasum": "5d44070aeaf7a8b5bf904bd72e091d29547baa59",
"localDependencies": [
"@uber/fusion-plugin-atreyu",
"fusion-core"
]
},
"@uber/fusion-plugin-feature-toggles-react": {
"shasum": "7a86be3d6aa90cd238ae6fc22c407aec24270e62",
"localDependencies": [
"@uber/fusion-plugin-feature-toggles",
"fusion-core",
"fusion-react"
]
},
"@uber/fusion-plugin-events-adapter": {
"shasum": "3b67b815a0562c0c952fcda4f244579c77daf645",
"localDependencies": [
"@uber/fusion-plugin-analytics-session",
"@uber/fusion-plugin-auth-headers",
"@uber/fusion-plugin-heatpipe",
"@uber/fusion-plugin-m3",
"fusion-core",
"fusion-plugin-i18n",
"fusion-plugin-universal-events",
"fusion-tokens"
]
},
"@uber/fusion-plugin-error-handling": {
"shasum": "3fb602359971f323eb72e0e03255306af469ee61",
"localDependencies": [
"@uber/fusion-plugin-m3",
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-bedrock-compat": {
"shasum": "c53b3033d87f3c06e0dce0fa062feabccd3351cc",
"localDependencies": [
"@uber/fusion-plugin-atreyu",
"@uber/fusion-plugin-flipr",
"@uber/fusion-plugin-galileo",
"@uber/fusion-plugin-m3",
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-auth-headers": {
"shasum": "707f253ad7213b13834018cbacf8a3629de9e6cb",
"localDependencies": [
"fusion-core"
]
},
"@uber/fusion-plugin-atreyu": {
"shasum": "24cec753348699a224831df5822503938905a632",
"localDependencies": [
"@uber/fusion-plugin-galileo",
"@uber/fusion-plugin-m3",
"@uber/fusion-plugin-tchannel",
"@uber/fusion-plugin-tracer",
"fusion-core",
"fusion-tokens"
]
},
"@uber/fusion-plugin-analytics-session": {
"shasum": "5b572f369fe136ba11735b066404eef915718c58",
"localDependencies": [
"fusion-core"
]
},
"@uber/fusion-migrate": {
"shasum": "8862bc3a4ebbd9a390fe3e12a693dd08c96945e0",
"localDependencies": []
},
"@uber/fusion-metrics": {
"shasum": "9c25ae543d59160208458f162db5169dbf84a7c2",
"localDependencies": [
"fusion-plugin-introspect"
]
},
"@uber/fusion-legacy-styling-compat-mixin": {
"shasum": "126351023f4a123b1bbb50db9d23ff43cdf250f9",
"localDependencies": []
},
"@uber/fusion-dev-cli": {
"shasum": "c616f04034f8ae80074a62482d1447aa3fb1b9ad",
"localDependencies": []
},
"@uber/fusion-analyticsjs-utils": {
"shasum": "9351a4028c85374029e004d88ddc7c2a871e04f6",
"localDependencies": []
},
"@uber/fusion-plugin-graphql-logging-middleware": {
"shasum": "b3a2183dfbd31c0c1274e5b07e1faee5627ad83f",
"localDependencies": [
"@uber/fusion-plugin-m3",
"@uber/fusion-plugin-tracer",
"fusion-core",
"fusion-plugin-apollo",
"fusion-tokens"
]
},
"@uber/fusion-plugin-graphql-metrics": {
"shasum": "b93642c3efb8bddf103379fc86dfcf33f4e9b51d",
"localDependencies": [
"@uber/fusion-plugin-m3",
"@uber/fusion-plugin-tracer",
"fusion-core",
"fusion-plugin-apollo",
"fusion-tokens"
]
},
"@uber/create-uber-web": {
"shasum": "688f05e05db33f408736e65b2893605e876596bf",
"localDependencies": []
}
}
}`;

function createTableString(topTitles, sideTitles, data) {
  let outString =
    "|[Help](https://docs.google.com/document/d/18TpXOEkjlfSVKfjdwJJZSe59Ju4U66sn4oH6egq1O84/edit?usp=sharing)|";
  for (let i = 0; i < topTitles.length; i++) {
    outString += `${topTitles[i]} |`;
  }
  outString += "\n|";
  for (let i = 0; i <= topTitles.length; i++) {
    outString += " ---------------- |";
  }
  outString += "\n|";
  for (let i = 0; i < data.length; i++) {
    outString += `${sideTitles[i]} |`;
    for (let j = 0; j < data[i].length; j++) {
      outString += `${data[i][j]} |`;
    }
    outString += "\n";
  }
  return outString;
}

function median(values) {
  if (values.length === 0) return 0;

  values.sort(function(a, b) {
    return a - b;
  });
  var mid = values.length / 2;

  return mid % 1 ? values[mid - 0.5] : (values[mid - 1] + values[mid]) / 2;
}
