
var u = exports

u.toUtf8 = function (data) {
  return 'string' == typeof data ? data : new Buffer(data).toString('utf8')
}

u.toBuffer = function (data) {
  return 'string' !== typeof data
    ? data
    : new Buffer(data)
}

u.toBase64 = require('arraybuffer-base64')

var crypto = require('crypto')

u.hash = function (data, cb) {
  setImmediate(function () {
    cb(null,
      crypto.createHash('sha256').update(data).digest('base64')
    )
  })
}

u.parse = function (str) {
  try {
    return JSON.parse(str)
  } catch (_) { }
}

u.HashError = function (_id, id) {
  return new Error('incorrect hash:'+_id+'\n expected:'+id)
}




