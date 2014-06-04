// Turns a dash-separated string into a camelCased string
// I.e. camelify('some-thing') === 'someThing'
function camelify(str) {
  return str.replace(/-(.){1}/g, function(_, c) {return c.toUpperCase()})
}

// A cross browser reliable way of reading data attributes of an element
// Returns just strings for values
function dattrs(el) {
  var data = {};
  for (var attrs = el.attributes, i = 0, len = attrs.length; i < len; i++) {
    var attr = attrs[i];
    if (attr.name.substring(0,5) != 'data-') {
      continue;
    }
    data[camelify(attr.name.substring(5))] = attr.value;
  }
  return data;
}

module.exports = dattrs;