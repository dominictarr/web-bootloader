

var tape = require('tape')

var WB = require('../bootloader')
var Log = require('../log')
var Store = require('../store')

var crypto = require('crypto')

function setup (t, test) {
  var storage = {}
  var wb = WB('t', Store('t', storage), Log('t', storage))
  wb.add(crypto.randomBytes(1024).toString('hex'),
  function (err, id1) {
    if(err) throw err
    wb.append(id1, function (err) {
      if(err) throw err
      wb.add(crypto.randomBytes(1024).toString('hex'),
      function (err, id2) {
        if(err) throw err
        wb.append(id2, function (err) {
          if(err) throw err
          console.log(storage)
          wb.size(function (err, s) {
            if(err) throw err
            t.equal(s, (1024*4))

            test(wb, id1, id2)

          })
        })
      })
    })
  })
}

tape('test partial prune', function (t) {
  setup(t, function (wb, id1, id2) {
    wb.prune(512, function (err, removed) {
      if(err) throw err
      t.equal(removed, 2048)
      wb.has(id2, function (err, has) {
        if(err) throw err
        t.ok(has)
        t.end()
      })
    })
  })
})


tape('test exact prune', function (t) {
  setup(t, function(wb, id1, id2) {
    wb.prune(1024*2, function (err, removed) {
      if(err) throw err
      t.equal(removed, 2048)
      wb.has(id2, function (err, has) {
        if(err) throw err
        t.ok(has)
        t.end()
      })
    })
  })
})

tape('test full prune', function (t) {
  setup(t, function (wb, id1, id2) {
    wb.prune(1024*3, function (err, removed) {
      if(err) throw err
      t.equal(removed, 4096)
      wb.has(id2, function (err, has) {
        if(err) throw err
        t.notOk(has)
        t.end()
      })
    })
  })
})


tape('test over prune', function (t) {
  setup(t, function (wb, id1, id2) {
    wb.prune(1024*5, function (err, removed) {
      if(err) throw err
      t.equal(removed, 4096)
      wb.has(id2, function (err, has) {
        if(err) throw err
        t.notOk(has)
        t.end()
      })
    })
  })
})


