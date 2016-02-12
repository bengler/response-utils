'use strict';

var url = require('url');

module.exports = removeQueryParameter;
// Takes an url and a query parameter and returns the url with the parameter removed
function removeQueryParameter(_url, parameter) {
  var parsed = url.parse(_url, true, true);

  if (parameter in parsed.query) {
    delete parsed.search;
    delete parsed.query[parameter];
  }

  return url.format(parsed);
}