import { Group } from "@vx/group";
import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { scaleLinear } from "@vx/scale";
import { line, curveCardinal } from "d3-shape";

function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread()
  );
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++)
      arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (
    Symbol.iterator in Object(iter) ||
    Object.prototype.toString.call(iter) === "[object Arguments]"
  )
    return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function verticalToHorizontal(_ref) {
  var x1 = _ref.x1,
    x2 = _ref.x2,
    y1 = _ref.y1,
    y2 = _ref.y2;
  return {
    x1: y1,
    x2: y2,
    y1: x1,
    y2: x2,
  };
}

BoxPlot.propTypes = {
  left: PropTypes.number,
  top: PropTypes.number,
  className: PropTypes.string,
  max: PropTypes.number,
  min: PropTypes.number,
  firstQuartile: PropTypes.number,
  thirdQuartile: PropTypes.number,
  median: PropTypes.number,
  boxWidth: PropTypes.number,
  fill: PropTypes.string,
  fillOpacity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  stroke: PropTypes.string,
  strokeWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  rx: PropTypes.number,
  ry: PropTypes.number,
  valueScale: PropTypes.func,
  outliers: PropTypes.array,
  horizontal: PropTypes.bool,
  medianProps: PropTypes.object,
  maxProps: PropTypes.object,
  minProps: PropTypes.object,
  boxProps: PropTypes.object,
  outlierProps: PropTypes.object,
  container: PropTypes.bool,
  containerProps: PropTypes.object,
  children: PropTypes.func,
};
function BoxPlot(_ref2) {
  var _ref2$left = _ref2.left,
    left = _ref2$left === void 0 ? 0 : _ref2$left,
    _ref2$top = _ref2.top,
    top = _ref2$top === void 0 ? 0 : _ref2$top,
    className = _ref2.className,
    max = _ref2.max,
    min = _ref2.min,
    firstQuartile = _ref2.firstQuartile,
    thirdQuartile = _ref2.thirdQuartile,
    median = _ref2.median,
    boxWidth = _ref2.boxWidth,
    fill = _ref2.fill,
    fillOpacity = _ref2.fillOpacity,
    stroke = _ref2.stroke,
    strokeWidth = _ref2.strokeWidth,
    _ref2$rx = _ref2.rx,
    rx = _ref2$rx === void 0 ? 2 : _ref2$rx,
    _ref2$ry = _ref2.ry,
    ry = _ref2$ry === void 0 ? 2 : _ref2$ry,
    valueScale = _ref2.valueScale,
    _ref2$outliers = _ref2.outliers,
    outliers = _ref2$outliers === void 0 ? [] : _ref2$outliers,
    horizontal = _ref2.horizontal,
    _ref2$medianProps = _ref2.medianProps,
    medianProps = _ref2$medianProps === void 0 ? {} : _ref2$medianProps,
    _ref2$maxProps = _ref2.maxProps,
    maxProps = _ref2$maxProps === void 0 ? {} : _ref2$maxProps,
    _ref2$minProps = _ref2.minProps,
    minProps = _ref2$minProps === void 0 ? {} : _ref2$minProps,
    _ref2$boxProps = _ref2.boxProps,
    boxProps = _ref2$boxProps === void 0 ? {} : _ref2$boxProps,
    _ref2$outlierProps = _ref2.outlierProps,
    outlierProps = _ref2$outlierProps === void 0 ? {} : _ref2$outlierProps,
    _ref2$container = _ref2.container,
    container = _ref2$container === void 0 ? false : _ref2$container,
    _ref2$containerProps = _ref2.containerProps,
    containerProps =
      _ref2$containerProps === void 0 ? {} : _ref2$containerProps,
    children = _ref2.children;
  var offset = horizontal ? top : left;
  var center = offset + boxWidth / 2;
  var valueRange = valueScale.range();
  var boxplot = {
    valueRange: valueRange,
    center: center,
    offset: offset,
    boxWidth: boxWidth,
    max: {
      x1: center - boxWidth / 4,
      x2: center + boxWidth / 4,
      y1: valueScale(max),
      y2: valueScale(max),
    },
    maxToThird: {
      x1: center,
      x2: center,
      y1: valueScale(max),
      y2: valueScale(thirdQuartile),
    },
    median: {
      x1: offset,
      x2: offset + boxWidth,
      y1: valueScale(median),
      y2: valueScale(median),
    },
    minToFirst: {
      x1: center,
      x2: center,
      y1: valueScale(firstQuartile),
      y2: valueScale(min),
    },
    min: {
      x1: center - boxWidth / 4,
      x2: center + boxWidth / 4,
      y1: valueScale(min),
      y2: valueScale(min),
    },
    box: {
      x1: offset,
      x2: boxWidth,
      y1: valueScale(thirdQuartile),
      y2: Math.abs(valueScale(thirdQuartile) - valueScale(firstQuartile)),
    },
    container: {
      x1: offset,
      x2: boxWidth,
      y1: Math.min.apply(Math, _toConsumableArray(valueRange)),
      y2: Math.abs(valueRange[0] - valueRange[1]),
    },
  };

  if (horizontal) {
    boxplot.max = verticalToHorizontal(boxplot.max);
    boxplot.maxToThird = verticalToHorizontal(boxplot.maxToThird);
    boxplot.box.y1 = valueScale(firstQuartile);
    boxplot.box = verticalToHorizontal(boxplot.box);
    boxplot.median = verticalToHorizontal(boxplot.median);
    boxplot.minToFirst = verticalToHorizontal(boxplot.minToFirst);
    boxplot.min = verticalToHorizontal(boxplot.min);
    boxplot.container = verticalToHorizontal(boxplot.container);
    boxplot.container.y1 = Math.min.apply(Math, _toConsumableArray(valueRange));
  }

  if (children) return children(boxplot);
  return React.createElement(
    Group,
    {
      className: classnames("vx-boxplot", className),
    },
    outliers.map(function(d, i) {
      var cx = horizontal ? valueScale(d) : center;
      var cy = horizontal ? center : valueScale(d);
      return React.createElement(
        "circle",
        _extends(
          {
            key: "vx-boxplot-outlier-".concat(i),
            className: "vx-boxplot-outlier",
            cx: cx,
            cy: cy,
            r: 4,
            stroke: stroke,
            strokeWidth: strokeWidth,
            fill: fill,
            fillOpacity: fillOpacity,
          },
          outlierProps
        )
      );
    }),
    React.createElement(
      "line",
      _extends(
        {
          className: "vx-boxplot-max",
          x1: boxplot.max.x1,
          y1: boxplot.max.y1,
          x2: boxplot.max.x2,
          y2: boxplot.max.y2,
          stroke: stroke,
          strokeWidth: strokeWidth,
        },
        maxProps
      )
    ),
    React.createElement("line", {
      className: "vx-boxplot-max-to-third",
      x1: boxplot.maxToThird.x1,
      y1: boxplot.maxToThird.y1,
      x2: boxplot.maxToThird.x2,
      y2: boxplot.maxToThird.y2,
      stroke: stroke,
      strokeWidth: strokeWidth,
    }),
    React.createElement(
      "rect",
      _extends(
        {
          className: "vx-boxplot-box",
          x: boxplot.box.x1,
          y: boxplot.box.y1,
          width: boxplot.box.x2,
          height: boxplot.box.y2,
          stroke: stroke,
          strokeWidth: strokeWidth,
          fill: fill,
          fillOpacity: fillOpacity,
          rx: rx,
          ry: ry,
        },
        boxProps
      )
    ),
    React.createElement(
      "line",
      _extends(
        {
          className: "vx-boxplot-median",
          x1: boxplot.median.x1,
          y1: boxplot.median.y1,
          x2: boxplot.median.x2,
          y2: boxplot.median.y2,
          stroke: stroke,
          strokeWidth: strokeWidth,
        },
        medianProps
      )
    ),
    React.createElement("line", {
      className: "vx-boxplot-min-to-first",
      x1: boxplot.minToFirst.x1,
      y1: boxplot.minToFirst.y1,
      x2: boxplot.minToFirst.x2,
      y2: boxplot.minToFirst.y2,
      stroke: stroke,
      strokeWidth: strokeWidth,
    }),
    React.createElement(
      "line",
      _extends(
        {
          className: "vx-boxplot-min",
          x1: boxplot.min.x1,
          y1: boxplot.min.y1,
          x2: boxplot.min.x2,
          y2: boxplot.min.y2,
          stroke: stroke,
          strokeWidth: strokeWidth,
        },
        minProps
      )
    ),
    container &&
      React.createElement(
        "rect",
        _extends(
          {
            x: boxplot.container.x1,
            y: boxplot.container.y1,
            width: boxplot.container.x2,
            height: boxplot.container.y2,
            fillOpacity: "0",
          },
          containerProps
        )
      )
  );
}

ViolinPlot.propTypes = {
  left: PropTypes.number,
  top: PropTypes.number,
  className: PropTypes.string,
  data: PropTypes.array.isRequired,
  width: PropTypes.number,
  count: PropTypes.func,
  value: PropTypes.func,
  valueScale: PropTypes.func,
  horizontal: PropTypes.bool,
  children: PropTypes.func,
};
function ViolinPlot(_ref) {
  var _ref$left = _ref.left,
    left = _ref$left === void 0 ? 0 : _ref$left,
    _ref$top = _ref.top,
    top = _ref$top === void 0 ? 0 : _ref$top,
    className = _ref.className,
    data = _ref.data,
    width = _ref.width,
    _ref$count = _ref.count,
    count =
      _ref$count === void 0
        ? function(d) {
            return d.count;
          }
        : _ref$count,
    _ref$value = _ref.value,
    value =
      _ref$value === void 0
        ? function(d) {
            return d.value;
          }
        : _ref$value,
    valueScale = _ref.valueScale,
    horizontal = _ref.horizontal,
    children = _ref.children,
    restProps = _objectWithoutProperties(_ref, [
      "left",
      "top",
      "className",
      "data",
      "width",
      "count",
      "value",
      "valueScale",
      "horizontal",
      "children",
    ]);

  var center = (horizontal ? top : left) + width / 2;
  var binCounts = data.map(function(bin) {
    return bin.count;
  });
  var widthScale = scaleLinear({
    rangeRound: [0, width / 2],
    domain: [0, Math.max.apply(Math, _toConsumableArray(binCounts))],
  });
  var path = "";

  if (horizontal) {
    var topCurve = line()
      .x(function(d) {
        return valueScale(value(d));
      })
      .y(function(d) {
        return center - widthScale(count(d));
      })
      .curve(curveCardinal);
    var bottomCurve = line()
      .x(function(d) {
        return valueScale(value(d));
      })
      .y(function(d) {
        return center + widthScale(count(d));
      })
      .curve(curveCardinal);
    var topCurvePath = topCurve(data);
    var bottomCurvePath = bottomCurve(_toConsumableArray(data).reverse());
    path = ""
      .concat(topCurvePath, " ")
      .concat(bottomCurvePath.replace("M", "L"), " Z");
  } else {
    var rightCurve = line()
      .x(function(d) {
        return center + widthScale(count(d));
      })
      .y(function(d) {
        return valueScale(value(d));
      })
      .curve(curveCardinal);
    var leftCurve = line()
      .x(function(d) {
        return center - widthScale(count(d));
      })
      .y(function(d) {
        return valueScale(value(d));
      })
      .curve(curveCardinal);
    var rightCurvePath = rightCurve(data);
    var leftCurvePath = leftCurve(_toConsumableArray(data).reverse());
    path = ""
      .concat(rightCurvePath, " ")
      .concat(leftCurvePath.replace("M", "L"), " Z");
  }

  if (children)
    return children({
      path: path,
    });
  return React.createElement(
    "path",
    _extends(
      {
        className: classnames("vx-violin", className),
        d: path,
      },
      restProps
    )
  );
}

function computeStats(numericalArray) {
  var points = _toConsumableArray(numericalArray).sort(function(a, b) {
    return a - b;
  });

  var sampleSize = points.length;
  var firstQuartile = points[Math.round(sampleSize / 4)];
  var thirdQuartile = points[Math.round((3 * sampleSize) / 4)];
  var IQR = thirdQuartile - firstQuartile;
  var min = firstQuartile - 1.5 * IQR;
  var max = thirdQuartile + 1.5 * IQR;
  var outliers = points.filter(function(p) {
    return p < min || p > max;
  });
  var binWidth = 2 * IQR * Math.pow(sampleSize - outliers.length, -1 / 3);
  var binNum = Math.round((max - min) / binWidth);
  var actualBinWidth = (max - min) / binNum;
  var bins = Array(binNum + 2).fill(0);
  var values = Array(binNum + 2).fill(min);

  for (var i = 1; i <= binNum; i += 1) {
    values[i] += actualBinWidth * (i - 0.5);
  }

  values[values.length - 1] = max;
  points
    .filter(function(p) {
      return p >= min && p <= max;
    })
    .forEach(function(p) {
      bins[Math.floor((p - min) / actualBinWidth) + 1] += 1;
    });
  var binData = values.map(function(v, i) {
    return {
      value: v,
      count: bins[i],
    };
  });
  var boxPlot = {
    min: min,
    firstQuartile: firstQuartile,
    median: points[Math.round(sampleSize / 2)],
    thirdQuartile: thirdQuartile,
    max: max,
    outliers: outliers,
  };
  return {
    boxPlot: boxPlot,
    binData: binData,
  };
}

export { BoxPlot, ViolinPlot, computeStats };
