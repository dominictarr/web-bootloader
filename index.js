;(function () {
'use strict'

var BinaryXHR = require('binary-xhr')
var toBase64 = require('arraybuffer-base64')
var input_file = require('hyperfile')
var Progress = require('hyperprogress')

var prog = Progress()
var running = false

window.WebBoot = {
  scorchedEarth: scorchedEarth,
  reinitialize: reinitialize,
  add: add,
  run: run,
  version: require('./package.json').version
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
    
  }
  var text = localStorage[APPNAME+'_version_'+id]
  hash(new TextEncoder('utf8').encode(text), function (err, _id) {
    if(id !== _id) {
      //LOCAL STORAGE CORRUPTED
      cb(new Error('localStorage is corrupted'))
    }
    else {
      var script = document.createElement('script')
      running = true
      script.textContent = text
      document.head.appendChild(script) //run javascript.
    }
  })

}

function add_buffer (buf, _id, cb) {
  prog.next('verifying hash:'+_id)
  hash(buf, function (err, id) {
    if(err)
      return prog.fail(err, 'hash failed')

    if(_id && _id !== id)
      return prog.fail(new Error('secure url is invalid'))

    localStorage[APPNAME+'_version_'+id] = new TextDecoder('utf8').decode(buf)
    localStorage[APPNAME+'_current'] = id

    var versions = parse(localStorage[APPNAME+'_versions']) || {}
    versions[Date.now()] = id
    localStorage[APPNAME+'_versions'] = JSON.stringify(versions)

    cb(null, id)
  })

}

function add (secure_url, cb) {
  if(!(isUrl.test(secure_url) && hasHash.test(secure_url)))
    return cb(new Error('is not a secure url:'+secure_url))
  var id = hasHash.exec(secure_url)[1]
  BinaryXHR(secure_url, function (err, buf) {
    if(err)
      return prog.fail(err, 'could not retrive secure url')
    if(!buf)
      return prog.fail(new Error('could not retrive:\n  '+secure_url))

    add_buffer(buf, id, cb)
  })
}

function h (tag, content) {
  var el = document.createElement(tag)
  if(content)
    content.forEach(function (e) {
      if(e) el.appendChild('string' == typeof e ? document.createTextNode(e) : e)
    })
  return el
}

function btn (label, action) {
  var b = document.createElement('button')
  b.textContent = label
  b.onclick = action
  return b
}

//display some UI about current versions loaded.
//optionally load a new script from a file.
if(parts.length && parts[0] === APPNAME+'_INIT' || !localStorage[APPNAME+'_current']) {
  prog.next('no code to run: paste #{secure_url} to a javascript file.')

  var obj = parse(localStorage[APPNAME+'_versions'])
  var versions = []
  for(var ts in obj) versions.push({ts: ts, hash: obj[ts]})

  document.body.appendChild(
    h('div', [
      h('h2', ['current versions']),
      h('ul', versions.map(function (op) {
        var el = h('li', [
          op.hash, ' ',
          new Date(+op.ts).toISOString(),
          localStorage[APPNAME+'_current'] === op.hash ? '*' : '',
          btn('delete', function () {
            delete localStorage[APPNAME+'_version_'+op.hash]
            delete obj[op.ts]
            localStorage[APPNAME+'_versions'] = JSON.stringify(obj)
            el.remove()
          }),
          btn('run', function () {
            localStorage[APPNAME+'_current'] = op.hash
            location.hash = ''
            run(op.hash)
          })
        ])
        return el
      }))
    ])
  )

  document.body.appendChild(input_file(function (buf) {
    add_buffer(buf, null, function (err, id) {
      if(err) prog.fail(err)
      else run(id)
    })
  }))
}

else if(parts.length && isUrl.test(parts[0]) && hasHash.test(parts[0])) {
  var id = hasHash.exec(parts[0])[1]
  var _hash = '#'+parts.slice(1).join('#')

  function _run (id) {
    window.location.hash = _hash; run(id)
  }

  prog.next('detected secure url:'+ parts[0])

  var current = localStorage[APPNAME+'_current']
  if(current && current !== id)
    if(!confirm("this action updates code to:"+id + "\nclick 'cancel' to continue with current version"))
      return _run(current)

  //check if we already have this data.
  if(localStorage[APPNAME+'_version_'+id]) {
    prog.next('loading local version')
    _run(id)
  } else {
    prog.next('retriving secure url:'+parts[0])
    add(parts[0], function (err, id) {
      if(err) return prog.fail(err)

      prog.next('loading secure javascript')
      //returned data is correct. save, then run.
      _run(id)

    })
  }
}
else if(localStorage[APPNAME+'_current']) {
  run(localStorage[APPNAME+'_current'])
}
else {
  prog.next('no code to run: paste #{secure_url} to a javascript file.')
}

})();




