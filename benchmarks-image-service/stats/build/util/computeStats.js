"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = computeStats;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function computeStats(numericalArray) {
  var points = _toConsumableArray(numericalArray).sort(function (a, b) {
    return a - b;
  });

  var sampleSize = points.length;
  var firstQuartile = points[Math.round(sampleSize / 4)];
  var thirdQuartile = points[Math.round(3 * sampleSize / 4)];
  var IQR = thirdQuartile - firstQuartile;
  var min = firstQuartile - 1.5 * IQR;
  var max = thirdQuartile + 1.5 * IQR;
  var outliers = points.filter(function (p) {
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
  points.filter(function (p) {
    return p >= min && p <= max;
  }).forEach(function (p) {
    bins[Math.floor((p - min) / actualBinWidth) + 1] += 1;
  });
  var binData = values.map(function (v, i) {
    return {
      value: v,
      count: bins[i]
    };
  });
  var boxPlot = {
    min: min,
    firstQuartile: firstQuartile,
    median: points[Math.round(sampleSize / 2)],
    thirdQuartile: thirdQuartile,
    max: max,
    outliers: outliers
  };
  return {
    boxPlot: boxPlot,
    binData: binData
  };
}