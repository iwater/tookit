var fs =  require('fs');
var con = fs.readFileSync(__dirname + '/gb18030-utf8.table', 'ascii');

var map = {};

function ConvertObjToFastMode(obj) {
  var anyFunction = ConvertObjToFastMode; // 任意函数都可以，用自己当然是为了省内存。
  anyFunction.prototype = obj;
}

con.split("\n").forEach(function (row) {
  'use strict';
  var _map = row.split(',');
  map[parseInt(_map[0], 16)] = parseInt(_map[1], 16);
});

ConvertObjToFastMode(map);

var iconv = exports.convert = function (buf) {
  'use strict';
  var j, i = 0, ret = [];
  if (typeof buf === 'string') {
    buf = new Buffer(buf, 'binary');
  }
  if (!Buffer.isBuffer(buf)) {
    return '';
  }
  for (j = buf.length; i < j; i++) {
    var charCode = buf[i];
    if (charCode < 128) {
      ret.push(String.fromCharCode(charCode));
    } else if (charCode & 0x80) {
      charCode = (charCode << 8) + buf[++i];
      ret.push(String.fromCharCode(map[charCode]));
    } else {
      console.log(['error'], charCode);
    }
  }
  return ret.join('');
};

// 全角转半角
exports.toASCII = function (str) {
  var code, len = str.length, out = new Array(len);
  for (var i=0; i<len; i++) {
    code = str.charCodeAt(i);
    if (code >= 65281 && code <= 65373) {
      out[i] = String.fromCharCode(code - 65248);
    } else {
      out[i] = str.charAt(i);
    }
  }
  return out.join('');
};
