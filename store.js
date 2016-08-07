var u = require('./util')

module.exports = function (prefix) {
  return {
    get: function (id, cb) {
      var data = localStorage[prefix+'_versions_'+id]
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
        console.log(data, _id)
        if(err) cb(err)
        else if(id && _id !== id) cb(u.HashError(_id, id))
        else {
          try { localStorage[prefix+'_versions_'+_id] = u.toUtf8(data) }
          catch(err) { return cb(err) } //this will be quota error
          console.log('SAVE', prefix+'_versions_'+_id, u.toUtf8(data).substring(0, 20))
          cb(null, _id)
        }
      })
    },

    has: function (id, cb) {
      return cb(null, !!localStorage[APPNAME+'_versions_'+id])
    },

    rm: function (id, cb) {
      delete localStorage[prefix+'_versions_'+id]
      var versions = u.parse(localStorage[prefix+'_versions']) || {}
      for(var ts in versions)
        if(versions[ts] === id) delete obj[ts]
      localStorage[prefix+'_versions'] = JSON.stringify(obj)
      cb()
    },


    ls: function (cb) {
      var p = prefix + '_versions_'
      var versions = u.parse(localStorage[prefix+'_versions']) || {}
      var ary = []
      for(var ts in versions) {
        var data = localStorage[p+versions[ts]]
        var size = data && data.length || 0
        if(!data) delete versions[ts]
        else ary.push({
          id: versions[ts], size: size, ts: ts
        })
      }
      cb(null, ary)
    },

    destroy: function (cb) {
      var versions = u.parse(localStorage[prefix+'_versions']) || {}
      for(var ts in versions)
        delete localStorage[p+versions[ts]]
      delete localStorage[prefix+'_versions']
      cb()
    }
  }
}






