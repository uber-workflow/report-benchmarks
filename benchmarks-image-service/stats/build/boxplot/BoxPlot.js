"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = BoxPlot;

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _group = require("@vx/group");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function verticalToHorizontal(_ref) {
  var x1 = _ref.x1,
      x2 = _ref.x2,
      y1 = _ref.y1,
      y2 = _ref.y2;
  return {
    x1: y1,
    x2: y2,
    y1: x1,
    y2: x2
  };
}

BoxPlot.propTypes = {
  left: _propTypes.default.number,
  top: _propTypes.default.number,
  className: _propTypes.default.string,
  max: _propTypes.default.number,
  min: _propTypes.default.number,
  firstQuartile: _propTypes.default.number,
  thirdQuartile: _propTypes.default.number,
  median: _propTypes.default.number,
  boxWidth: _propTypes.default.number,
  fill: _propTypes.default.string,
  fillOpacity: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),
  stroke: _propTypes.default.string,
  strokeWidth: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),
  rx: _propTypes.default.number,
  ry: _propTypes.default.number,
  valueScale: _propTypes.default.func,
  outliers: _propTypes.default.array,
  horizontal: _propTypes.default.bool,
  medianProps: _propTypes.default.object,
  maxProps: _propTypes.default.object,
  minProps: _propTypes.default.object,
  boxProps: _propTypes.default.object,
  outlierProps: _propTypes.default.object,
  container: _propTypes.default.bool,
  containerProps: _propTypes.default.object,
  children: _propTypes.default.func
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
      containerProps = _ref2$containerProps === void 0 ? {} : _ref2$containerProps,
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
      y2: valueScale(max)
    },
    maxToThird: {
      x1: center,
      x2: center,
      y1: valueScale(max),
      y2: valueScale(thirdQuartile)
    },
    median: {
      x1: offset,
      x2: offset + boxWidth,
      y1: valueScale(median),
      y2: valueScale(median)
    },
    minToFirst: {
      x1: center,
      x2: center,
      y1: valueScale(firstQuartile),
      y2: valueScale(min)
    },
    min: {
      x1: center - boxWidth / 4,
      x2: center + boxWidth / 4,
      y1: valueScale(min),
      y2: valueScale(min)
    },
    box: {
      x1: offset,
      x2: boxWidth,
      y1: valueScale(thirdQuartile),
      y2: Math.abs(valueScale(thirdQuartile) - valueScale(firstQuartile))
    },
    container: {
      x1: offset,
      x2: boxWidth,
      y1: Math.min.apply(Math, _toConsumableArray(valueRange)),
      y2: Math.abs(valueRange[0] - valueRange[1])
    }
  };

  if (horizontal) {
    boxplot.max = verticalToHorizontal(boxplot.max);
    boxplot.maxToThird = verticalToHorizontal(boxplot.maxToThird);
    boxplot.box = verticalToHorizontal(boxplot.box);
    boxplot.box.y1 = valueScale(firstQuartile);
    boxplot.median = verticalToHorizontal(boxplot.median);
    boxplot.minToFirst = verticalToHorizontal(boxplot.minToFirst);
    boxplot.min = verticalToHorizontal(boxplot.min);
    boxplot.container = verticalToHorizontal(boxplot.container);
    boxplot.container.y1 = Math.min.apply(Math, _toConsumableArray(valueRange));
  }

  if (children) return children(boxplot);
  return _react.default.createElement(_group.Group, {
    className: (0, _classnames.default)('vx-boxplot', className)
  }, outliers.map(function (d, i) {
    var cx = horizontal ? valueScale(d) : center;
    var cy = horizontal ? center : valueScale(d);
    return _react.default.createElement("circle", _extends({
      key: "vx-boxplot-outlier-".concat(i),
      className: "vx-boxplot-outlier",
      cx: cx,
      cy: cy,
      r: 4,
      stroke: stroke,
      strokeWidth: strokeWidth,
      fill: fill,
      fillOpacity: fillOpacity
    }, outlierProps));
  }), _react.default.createElement("line", _extends({
    className: "vx-boxplot-max",
    x1: boxplot.max.x1,
    y1: boxplot.max.y1,
    x2: boxplot.max.x2,
    y2: boxplot.max.y2,
    stroke: stroke,
    strokeWidth: strokeWidth
  }, maxProps)), _react.default.createElement("line", {
    className: "vx-boxplot-max-to-third",
    x1: boxplot.maxToThird.x1,
    y1: boxplot.maxToThird.y1,
    x2: boxplot.maxToThird.x2,
    y2: boxplot.maxToThird.y2,
    stroke: stroke,
    strokeWidth: strokeWidth
  }), _react.default.createElement("rect", _extends({
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
    ry: ry
  }, boxProps)), _react.default.createElement("line", _extends({
    className: "vx-boxplot-median",
    x1: boxplot.median.x1,
    y1: boxplot.median.y1,
    x2: boxplot.median.x2,
    y2: boxplot.median.y2,
    stroke: stroke,
    strokeWidth: strokeWidth
  }, medianProps)), _react.default.createElement("line", {
    className: "vx-boxplot-min-to-first",
    x1: boxplot.minToFirst.x1,
    y1: boxplot.minToFirst.y1,
    x2: boxplot.minToFirst.x2,
    y2: boxplot.minToFirst.y2,
    stroke: stroke,
    strokeWidth: strokeWidth
  }), _react.default.createElement("line", _extends({
    className: "vx-boxplot-min",
    x1: boxplot.min.x1,
    y1: boxplot.min.y1,
    x2: boxplot.min.x2,
    y2: boxplot.min.y2,
    stroke: stroke,
    strokeWidth: strokeWidth
  }, minProps)), container && _react.default.createElement("rect", _extends({
    x: boxplot.container.x1,
    y: boxplot.container.y1,
    width: boxplot.container.x2,
    height: boxplot.container.y2,
    fillOpacity: "0"
  }, containerProps)));
}