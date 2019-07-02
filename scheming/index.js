const { BoxPlot, ViolinPlot, computeStats } = require("@vx/stats");
const { scaleLinear } = require("@vx/scale");
const ReactDOMServer = require("react-dom/server");
const { Group } = require("@vx/group");
const React = require("react");
const url = require("url");
const stats = require("stats-lite");

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request) {
  let response;
  if (request.method === "GET") {
    const parsedURL = url.parse(request.url, true);
    const stringJson = parsedURL.query.json;
    if (stringJson === undefined) {
      return new Response("Expected JSON data in url for GET request", {
        status: 400,
      });
    }
    const json = JSON.parse(stringJson);
    if (json.chartType !== "boxplot") {
      return new Response(`Unsupported chartType: ${json.chartType}`, {
        status: 500,
      });
    }
    if (json.data == undefined) {
      return new Response(`Expected JSON field: data`, {
        status: 500,
      });
    }

    const output = ReactDOMServer.renderToStaticMarkup(
      <BoxPlotSVG
        data={json.data}
        labels={json.labels != undefined ? json.labels : []}
        title={json.title != undefined ? json.title : ""}
      />
    );
    console.log(output);
    response = new Response(output, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
      status: 200,
    });
  } else {
    response = new Response("Expected GET", { status: 500 });
  }
  return response;
}

function BoxPlotSVG(props) {
  const {
    data,
    labels,
    title,
    start = 60,
    boxWidth = 20,
    padding = 80,
  } = props;
  let svgData = [],
    dataLabels = [];
  let height = data.length * (boxWidth + padding) + start; //width is defined later
  const colors = ["#009E73", "#56B4E9", "#E69F00", "#0072B2", "#D55E00"];

  let maxValue = data[0][0],
    minValue = data[0][0];

  for (let i = 0; i < data.length; i++) {
    const { boxPlot: boxPlotData } = computeStats(data[i]);
    if (maxValue < boxPlotData.max) {
      maxValue = boxPlotData.max;
    }
    if (minValue < boxPlotData.min) {
      minValue = boxPlotData.min;
    }
  }

  const scale = scaleLinear({
    rangeRound: [0, 150],
    domain: [minValue - 1, maxValue + 1],
  });

  for (let i = 0; i < data.length; i++) {
    const { boxPlot, binData } = computeStats(data[i]);
    const median = stats.median(data[i]);

    if (i < labels.length) {
      const y = start + padding * i,
        x = scale(boxPlot.max);
      svgData.push(
        <text y={y} x={x}>
          {labels[i]}
        </text>
      );
    }

    svgData.push(
      <ViolinPlot
        data={binData}
        stroke={colors[i % colors.length]}
        top={start - 10 + padding * i}
        width={boxWidth + 20}
        valueScale={scale}
        fill="#fff"
        fillOpacity={0}
        horizontal
      />
    );
    svgData.push(
      <BoxPlot
        data={boxPlot}
        min={boxPlot.min}
        max={boxPlot.max}
        top={start + padding * i}
        firstQuartile={stats.percentile(data[i], 0.25)}
        thirdQuartile={stats.percentile(data[i], 0.75)}
        median={median}
        boxWidth={boxWidth}
        fill={colors[i % colors.length]}
        fillOpacity={0.3}
        stroke={colors[i % colors.length]}
        strokeWidth={2}
        valueScale={scale}
        outliers={[]}
        horizontal
      />
    );
    // svgData.push(
    //   <line
    //     y1={start + 10 + padding * i - boxWidth}
    //     x1={scale(median)}
    //     y2={start + 10 + padding * i + boxWidth}
    //     x2={scale(median)}
    //     stroke={colors[i % colors.length]}
    //     stroke-width={3}
    //   />
    // );
    for (let j = 0; j < data[i].length; j++) {
      let yVal = start + boxWidth / 2 + padding * i;
      svgData.push(
        <circle
          cy={yVal}
          cx={scale(data[i][j])}
          r="4"
          fill={colors[i % colors.length]}
        />
      );
      dataLabels.push(
        <DataPointLabel
          y1={start + 5 + padding * i - boxWidth}
          x1={scale(data[i][j])}
          y2={yVal}
          x2={scale(data[i][j])}
          value={data[i][j]}
        />
      );
    }
  }

  let width = 2 * scale(minValue) + 2 * Math.abs(scale(maxValue)) + 50;

  relax(dataLabels, height);
  return (
    <svg
      width={width}
      height={height}
      xmlns={"http://www.w3.org/2000/svg"}
      version={"1.1"}
      left="150"
    >
      <text x={width / 2 - (title.length / 2) * 13} y={10} font-weight="bold">
        {title}
      </text>
      <Group left={150} top={5}>
        {dataLabels}
        {svgData}
      </Group>
    </svg>
  );
}

function relax(data, height, count = 0) {
  var spacing = 12;
  var dy = 2;
  var repeat = true;
  data.forEach(function(dA, i) {
    var yA = dA.props.x1;
    data.forEach(function(dB, j) {
      var yB = dB.props.x1;
      if (i === j) {
        return;
      }
      if (dA.props.y1 != dB.props.y1) {
        return;
      }
      diff = yA - yB;
      if (Math.abs(diff) > spacing) {
        return;
      }
      repeat = true;
      magnitude = diff > 0 ? 1 : -1;
      adjust = magnitude * dy;
      dA.props.x1 = yA + adjust;
      dB.props.x1 = yB - adjust;
      dB.props.x1 = dB.props.x1 > height ? height : dB.props.x1;
      dA.props.x1 = dA.props.x1 > height ? height : dA.props.x1;
    });
  });
  if (repeat && count++ < 4) {
    relax(data, height, count);
  }
}

function DataPointLabel(props) {
  const { value, y1, x1, y2, x2 } = props;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={"#ccc"} />
      <text
        x={x1}
        y={y1 - 2}
        font-size={12}
        text-anchor="end"
        transform={`rotate(45, ${x1}, ${y1})`}
      >
        {value}
      </text>
    </g>
  );
}
