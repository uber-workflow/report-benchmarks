const { BoxPlot, computeStats } = require("@vx/boxplot");
const { scaleLinear } = require("@vx/scale");
const { Group } = require("@vx/group");
const ReactDOMServer = require("react-dom/server");
const React = require("react");
const parseUrl = require("parse-url");

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
    const stringJson = parseUrl(request.url).query.json;
    if (stringJson === undefined) {
      return new Response("Expected JSON data in url for GET request", {
        status: 400
      });
    }
    const json = JSON.parse(stringJson);
    if (json.chartType !== "boxplot") {
      return new Response(`Unsupported chartType: ${json.chartType}`, {
        status: 500
      });
    }
    if (json.data == undefined) {
      return new Response(`Expected JSON field: data`, {
        status: 500
      });
    }

    const output = ReactDOMServer.renderToString(
      boxPlot(
        json.data,
        json.labels != undefined ? json.labels : [],
        json.title != undefined ? json.title : ""
      )
    );
    response = new Response(output, {
      headers: {
        "Content-Type": "image/svg+xml"
      },
      status: 200
    });
  } else {
    response = new Response("Expected GET", { status: 500 });
  }
  return response;
}

function boxPlot(data, labels, title) {
  let svgData = [];
  const LEFT = 40,
    BOX_WIDTH = 20,
    PADDING = 70;
  const width = data.length * (BOX_WIDTH + PADDING) + LEFT; //height is defined later

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

  const yScale = scaleLinear({
    rangeRound: [150, 0],
    domain: [minValue - 1, maxValue + 1]
  });

  for (let i = 0; i < data.length; i++) {
    const { boxPlot: boxPlotData } = computeStats(data[i]);

    if (i < labels.length) {
      svgData.push(
        <text
          y={yScale(boxPlotData.max) - 5}
          x={LEFT + PADDING * i - (labels[i].length / 2) * 6}
        >
          {labels[i]}
        </text>
      );
    }
    svgData.push(
      <BoxPlot
        data={[]}
        min={boxPlotData.min}
        max={boxPlotData.max}
        left={LEFT + PADDING * i}
        firstQuartile={boxPlotData.firstQuartile}
        thirdQuartile={boxPlotData.thirdQuartile}
        median={boxPlotData.median}
        boxWidth={BOX_WIDTH}
        fill="#73af59"
        fillOpacity={0.3}
        stroke="#73af59"
        strokeWidth={2}
        valueScale={yScale}
        outliers={[]}
      />
    );
    for (let j = 0; j < data[i].length; j++) {
      svgData.push(
        <circle
          cx={LEFT + BOX_WIDTH / 2 + PADDING * i}
          cy={yScale(data[i][j])}
          r="4"
          fill={"#73af59"}
        />
      );
      svgData.push(
        <text x={PADDING * i} y={yScale(data[i][j]) - 2} font-size={12}>
          {data[i][j]}
        </text>
      );
      svgData.unshift(
        <line
          x1={LEFT + PADDING * i - BOX_WIDTH}
          y1={yScale(data[i][j])}
          x2={LEFT + PADDING * i + BOX_WIDTH}
          y2={yScale(data[i][j])}
          stroke={"#ccc"}
        />
      );
    }
  }

  const height = 2 * yScale(minValue) + 2 * Math.abs(yScale(maxValue)) + 50;
  return (
    <svg
      width={width}
      height={height}
      xmlns={"http://www.w3.org/2000/svg"}
      version={"1.1"}
    >
      <text x={width / 2 - (title.length / 2) * 13} y={10} font-weight="bold">
        {title}
      </text>
      <Group top={title.length > 0 ? 50 : 20 - yScale(maxValue)}>
        {svgData}
      </Group>
    </svg>
  );
}
