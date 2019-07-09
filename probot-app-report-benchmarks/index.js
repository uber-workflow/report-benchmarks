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
    if (context.payload.check_run.name != "Benchmarks") {
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
        context.issue({
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
    let imageStrings = [];
    if (base_json.version == head_json.version) {
      for (let i = 0; i < head_json.data.length; i++) {
        const chart = {
          chartType: "boxplot",
          title: head_json.data[i].build,
          labels: [`head`, `base`],
          data: [head_json.data[i].time, base_json.data[i].time],
        };
        imageStrings.push(
          ` ![Boxplot](${process.env.CHART_URL}/?json=${encodeURIComponent(
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
          ` ![Boxplot](${process.env.CHART_URL}/?json=${encodeURIComponent(
            JSON.stringify(chart)
          )})`
        );
      }
    }
    return `${commentString}\n${imageStrings.join(" ")}`;
  }
};
