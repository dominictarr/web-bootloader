var u = require('./util')

/*
  this uses localStorage, so it doesn't need async,
  but i used async api anyway,
  so it will be easy to switch to indexeddb.
*/

module.exports = function (prefix, storage) {
  //pass in non-local storage, to make testing easy.
  storage = storage || localStorage
  var log
  function _append (data, cb) {
    var log = u.parse(storage[prefix]) || []
    log.unshift(data)
    storage[prefix] = JSON.stringify(log)
    cb(null, data)
  }

  function filtered (log) {
    var revert = null
    var output = []
    for(var i = 0; i < log.length; i++) {
      var item = log[i]
      if(revert && revert <= item.ts) //this op was reverted.
        ;
      else if(item.revert)
        revert = item.revert
      else
        output.push(item)
    }
    return output
  }

  function getLog() {
    return u.parse(storage[prefix]) || []
  }

  return log = {
    head: function (cb) {
      cb(null, filtered(getLog())[0])
    },
    filtered: function (cb) {
      cb(null, filtered(getLog()))
    },
    unfiltered: function (cb) {
      cb(null, getLog())
    },
    append: function (data, cb) {
      _append({value: data, ts: Date.now()}, cb)
    },
    revert: function (ts, cb) {
      if(!ts) return cb(new Error('log.revert: must provide ts to revert to'))
      _append({revert: ts, ts: Date.now()}, function (err) {
        if(err) cb(err)
        else cb(null, filtered(getLog())[0])
      })
    },
    destroy: function (cb) {
      delete storage[prefix]
      cb()
    }
  }
}


