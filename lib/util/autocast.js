"use strict";

module.exports = autocast;
module.exports.object = object;
module.exports.array = array;

function array(arr) {
  return arr.map(function (value) {
    return autocast(arr[value]);
  });
}

function object(obj) {
  return Object.keys(obj).reduce(function (parsed, key) {
    parsed[key] = autocast(obj[key]);
    return parsed;
  }, {});
}

var VALUE_MAP = {
  true: true,
  false: false,
  null: null
};

function autocast(value) {
  // As seen in https://github.com/jquery/jquery/blob/master/src/data.js#L34
  if (value in VALUE_MAP) {
    return VALUE_MAP[value];
  }
  // Only convert to a number if it doesn't change the string
  if ("" + +value === value) {
    return +value;
  }
  return value;
}