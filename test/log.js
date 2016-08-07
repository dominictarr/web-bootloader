
var tape = require('tape')

var Log = require('../log')

var storage = {}
var log = Log('test', storage)

log.append({test: true}, function (err, value) {
  if(err) throw err
  log.append({b: 2}, function (err, value) {
    if(err) throw err
    console.log(value)
    log.revert(value.ts, function (err, value) {
      if(err) throw err
      console.log("UNREVERTED", value)
    })
  })
})
