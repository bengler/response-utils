
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

function autocast(value) {
    // As seen in https://github.com/jquery/jquery/blob/master/src/data.js#L34
    return value === 'true' ? true
      : value === 'false' ? false
      : value === 'null' ? null
        // Only convert to a number if it doesn't change the string
      : +value + '' === value ? +value
      : value;
}