var decoder = new TextDecoder('utf8')
var encoder = new TextEncoder('utf8')
var u = exports
u.toUtf8 = function (data) {
  return 'string' == typeof data ? data : decoder.decode(data)
}

u.toBuffer = function (data) {
  return 'string' !== typeof data
    ? data
    : new Uint8Array(encoder.encode(data))
}

u.toBase64 = require('arraybuffer-base64')

u.hash = function (data, cb) {
  window.crypto.subtle.digest(
    {  name: "SHA-256" },
    u.toBuffer(data)
  )
  .then(function(hash){
    return cb(null, exports.toBase64(new Uint8Array(hash)))
  })
  .catch(function(err){
      cb(err)
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








