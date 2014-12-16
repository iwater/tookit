var crypto = require('crypto');

var md5 = exports.md5 = function(data, encoding) {
  var hash = crypto.createHash('md5');
  hash.update(data);
  return hash.digest(encoding || 'hex');
};
