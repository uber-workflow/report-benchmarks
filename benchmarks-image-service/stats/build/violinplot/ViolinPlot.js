"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ViolinPlot;

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _scale = require("@vx/scale");

var _d3Shape = require("d3-shape");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

ViolinPlot.propTypes = {
  left: _propTypes.default.number,
  top: _propTypes.default.number,
  className: _propTypes.default.string,
  data: _propTypes.default.array.isRequired,
  width: _propTypes.default.number,
  count: _propTypes.default.func,
  value: _propTypes.default.func,
  valueScale: _propTypes.default.func,
  horizontal: _propTypes.default.bool,
  children: _propTypes.default.func
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
      count = _ref$count === void 0 ? function (d) {
    return d.count;
  } : _ref$count,
      _ref$value = _ref.value,
      value = _ref$value === void 0 ? function (d) {
    return d.value;
  } : _ref$value,
      valueScale = _ref.valueScale,
      horizontal = _ref.horizontal,
      children = _ref.children,
      restProps = _objectWithoutProperties(_ref, ["left", "top", "className", "data", "width", "count", "value", "valueScale", "horizontal", "children"]);

  var center = (horizontal ? top : left) + width / 2;
  var binCounts = data.map(function (bin) {
    return bin.count;
  });
  var widthScale = (0, _scale.scaleLinear)({
    rangeRound: [0, width / 2],
    domain: [0, Math.max.apply(Math, _toConsumableArray(binCounts))]
  });
  var path = '';

  if (horizontal) {
    var topCurve = (0, _d3Shape.line)().x(function (d) {
      return valueScale(value(d));
    }).y(function (d) {
      return center - widthScale(count(d));
    }).curve(_d3Shape.curveCardinal);
    var bottomCurve = (0, _d3Shape.line)().x(function (d) {
      return valueScale(value(d));
    }).y(function (d) {
      return center + widthScale(count(d));
    }).curve(_d3Shape.curveCardinal);
    var topCurvePath = topCurve(data);
    var bottomCurvePath = bottomCurve(_toConsumableArray(data).reverse());
    path = "".concat(topCurvePath, " ").concat(bottomCurvePath.replace('M', 'L'), " Z");
  } else {
    var rightCurve = (0, _d3Shape.line)().x(function (d) {
      return center + widthScale(count(d));
    }).y(function (d) {
      return valueScale(value(d));
    }).curve(_d3Shape.curveCardinal);
    var leftCurve = (0, _d3Shape.line)().x(function (d) {
      return center - widthScale(count(d));
    }).y(function (d) {
      return valueScale(value(d));
    }).curve(_d3Shape.curveCardinal);
    var rightCurvePath = rightCurve(data);
    var leftCurvePath = leftCurve(_toConsumableArray(data).reverse());
    path = "".concat(rightCurvePath, " ").concat(leftCurvePath.replace('M', 'L'), " Z");
  }

  if (children) return children({
    path: path
  });
  return _react.default.createElement("path", _extends({
    className: (0, _classnames.default)('vx-violin', className),
    d: path
  }, restProps));
}