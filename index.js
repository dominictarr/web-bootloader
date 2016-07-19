var BinaryXHR = require('binary-xhr')
var toBase64 = require('arraybuffer-base64')

//split the hash.

var parts = window.location.hash.split('#').slice(1)
var hasHash = /([A-Za-z0-9\/+]{43}=)\.sha256/
var isUrl = /^https?:\/\//

var APPNAME = 'SWB'

function log (msg) {
  console.log(APPNAME, msg)
}

function hash(data, cb) {
  window.crypto.subtle.digest(
    {  name: "SHA-256" },
    new Uint8Array(data)
  )
  .then(function(hash){
    return cb(null, toBase64(new Uint8Array(hash)))
  })
  .catch(function(err){
      cb(err)
  })
}

function run (id) {
  var text = localStorage[APPNAME+'_version_'+id]
  var buffer = new TextEncoder('utf8').encode(text)
  hash(buffer, function (err, hash) {
    if(localStorage.SWB_current !== hash) {
      //LOCAL STORAGE CORRUPTED
      alert('localStorage is corrupted')
    }
    else {
      var script = document.createElement('script')
      script.textContent = text
      document.head.appendChild(script) //run javascript.
    }
  })

}

if(parts.length && isUrl.test(parts[0]) && hasHash.test(parts[0])) {
  var id = hasHash.exec(parts[0])[1]
  log('detected secure url:'+ parts[0])
  //check if we already have this data.
  if(localStorage[APPNAME+'_version_'+id]) {
    run(id)
  } else
    log('GET:'+parts[0])
    BinaryXHR(parts[0], function (err, buf) {
      if(err) {
        log('did not retrive new version')
        throw err
      }
      hash(buf, function (err, _id) {
        if(id !== _id) {
          //ERROR. requested data was corrupt.
        }
        else {
          log('received correct hash:'+id)
          //returned data is correct. save, then run.
          localStorage[APPNAME+'_version_'+id] = new TextDecoder('utf8').decode(buf)
          //reload to run app
          localStorage[APPNAME+'_current'] = id
          window.location = '#' + parts.slice(1).join('#')
          window.location.reload()
        }
      })
    })
}
else if(localStorage[APPNAME+'_current']) {
  run(localStorage[APPNAME+'_current'])
}
else {
  alert('nothing to run')
}

