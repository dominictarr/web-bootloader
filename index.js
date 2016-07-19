var BinaryXHR = require('binary-xhr')
var toBase64 = require('arraybuffer-base64')

var Progress = require('hyperprogress')

var prog = Progress()
var running = false

window.WebBoot = {
  scorchedEarth: scorchedEarth,
  reinitialize: reinitialize,
  add: add,
  run: run
}

function parse (str) {
  try {
    return JSON.parse(str)
  } catch (_) { }
}

document.body.appendChild(prog)

//split the hash.

var parts = window.location.hash.split('#').slice(1)
var hasHash = /([A-Za-z0-9\/+]{43}=)\.sha256/
var isUrl = /^https?:\/\//

var APPNAME = 'SWB'
var match = new RegExp('^'+APPNAME)

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

function reinitialize () {
  for(var k in localStorage) {
    if(match.test(k))
      delete localStorage[k]
  }
}

//destroy everything
function scorchedEarth () {
  for(var k in localStorage) {
    delete localStorage[k]
  }
}

function run (id, cb) {
  //if we are already running, restart
  if(running) {
    //leave a note in local storage, and restart.
    location.hash = '#run:'+id
  }
  var text = localStorage[APPNAME+'_version_'+id]
  hash(new TextEncoder('utf8').encode(text), function (err, _id) {
    if(id !== _id) {
      //LOCAL STORAGE CORRUPTED
      cb(new Error('localStorage is corrupted'))
    }
    else {
      var script = document.createElement('script')
      script.textContent = text
      document.head.appendChild(script) //run javascript.
    }
  })

}

function add (secure_url, cb) {
  if(!(isUrl.test(secure_url) && hasHash.test(secure_url))
    return cb(new Error('is not a secure url:'+secure_url))
  var id = hasHash.exec(parts[0])[1]
  BinaryXHR(secure_url, function (err, buf) {
    if(err)
      return prog.fail(err, 'could not retrive secure url')

    hash(buf, function (err, _id) {
      if(err)
        return prog.fail(err, 'hash failed')

      if(id !== _id) {
        return prog.fail(new Error('secure url is invalid'))
      }
      cb(null, _id)
    })
  })
}

if(parts.length && isUrl.test(parts[0]) && hasHash.test(parts[0])) {
  var id = hasHash.exec(parts[0])[1]
  prog.next('detected secure url:'+ parts[0])

  //check if we already have this data.
  if(localStorage[APPNAME+'_version_'+id]) {
    prog.next('loading local version')
    run(id)
  } else
    prog.next('retriving secure url:'+parts[0])
    add(parts[0], function (err, id) {
      if(err) return prog.fail(err)

      prog.next('loading secure javascript')
      //returned data is correct. save, then run.
      localStorage[APPNAME+'_version_'+id] = new TextDecoder('utf8').decode(buf)
      localStorage[APPNAME+'_current'] = id

      var versions = parse(localStorage[APPNAME+'_versions']) || {}
      versions[Date.now()] = id
      localStorage[APPNAME+'_versions'] = JSON.stringify(versions)

      window.location = '#' + parts.slice(1).join('#')
      window.location.reload()

    })
}
else if(localStorage[APPNAME+'_current']) {
  run(localStorage[APPNAME+'_current'])
}
else {
  prog.next('no code to run: paste #{secure_url} to a javascript file.')
}

