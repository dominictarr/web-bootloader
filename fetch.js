var BinaryXHR = require('binary-xhr')
var hasHash = /([A-Za-z0-9\/+]{43}=)\.sha256/
var isUrl = /^https?:\/\//

var u = require('./util')

//before calling this, always check whether you alread have
//a file with this hash.
exports = module.exports = function (url, cb) {
  var id = exports.isSecureUrl(secure_url)
  if(!id)
    return cb(new Error('is not a secure url:'+secure_url))

  BinaryXHR(secure_url, function (err, data) {
    if(err)
      return cb(new Error('could not retrive secure url:'+err))
    if(!data || !data.length)
      return cb(new Error('empty response from:  '+secure_url))
    u.hash(data, function (err, _id) {
      if(_id !== id) cb(u.HashError(_id, id))

      cb(null, data, id)
    })
  })
}

exports.isSecureUrl = function (string) {
  var h = hasHash.exec(string)
  return isUrl.test(string) && h && h[1]
}


