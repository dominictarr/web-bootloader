var u = require('./util')

module.exports = function (prefix, storage) {
  return {
    get: function (id, cb) {
      var data = storage[prefix+'_versions_'+id]
      if(data)
        u.hash(data, function (err, _id) {
          if(err) cb(err)
          else if(_id !== id) cb(u.HashError(_id, id))
          else cb(null, data)
        })
      else cb(new Error('not found:'+id))
    },

    add: function (data, id, cb) {
      if(!cb) cb = id, id = null
      u.hash(data, function (err, _id) {
        if(err) cb(err)
        else if(id && _id !== id) cb(u.HashError(_id, id))
        else {
          try {

            storage[prefix+'_versions_'+_id] = u.toUtf8(data)
          }
          catch(err) { return cb(err) } //this will be quota error
          cb(null, _id)
        }
      })
    },

    has: function (id, cb) {
      return cb(null, !!storage[prefix+'_versions_'+id])
    },

    rm: function (id, cb) {
      delete storage[prefix+'_versions_'+id]

      cb()
    },


    ls: function (cb) {
      var match = new RegExp('^'+prefix+'_versions_'), ary = []
      for(var key in storage) {
        if(match.test(key)) {
          var data = storage[key]
          ary.push({
            id: key.replace(match, ''),
            size: data && data.length || 0
          })
        }
      }
      cb(null, ary)
    },

    destroy: function (cb) {
      var match = new RegExp('^'+prefix+'_versions_')
      for(var key in storage) {
        if(match.test(key)) {
          delete storage[key]
        }
      }

      cb()
    }
  }
}















