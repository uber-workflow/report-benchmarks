"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "BoxPlot", {
  enumerable: true,
  get: function get() {
    return _BoxPlot.default;
  }
});
Object.defineProperty(exports, "ViolinPlot", {
  enumerable: true,
  get: function get() {
    return _ViolinPlot.default;
  }
});
Object.defineProperty(exports, "computeStats", {
  enumerable: true,
  get: function get() {
    return _computeStats.default;
  }
});

var _BoxPlot = _interopRequireDefault(require("./boxplot/BoxPlot"));

var _ViolinPlot = _interopRequireDefault(require("./violinplot/ViolinPlot"));

var _computeStats = _interopRequireDefault(require("./util/computeStats"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }