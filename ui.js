var h = require('hscrpt')
var input_file = require('hyperfile')
var Progress = require('hyperprogress')
var u = require('./util')
var prog = Progress()

//split the hash.
var parts = window.location.hash.split('#').slice(1)
var QUOTA = 5*1024*1024

var human = require('human-time')

module.exports = function (appname, wb) {
  document.body.appendChild(prog)

  function nice_error(err, msg) {
    if(err.name && err.message && err.stack)
      return err
    if('object' !== typeof err)
      return new Error(msg+JSON.stringify(err))
  }

  function btn (label, action) {
    return h('button', {onclick: action}, [label])
  }

  function kb (bytes) {
    return (Math.round((bytes / 1024) * 100)/100) + 'k'
  }

//  var isElectron = typeof process !== 'undefined'
//      && process.env && process.env[appname+'_INIT']

  function handleQuota(err, data, id) {
    if(err
      && err.name == "QuotaExceededError"
      && confirm ('adding: '+id+' exceedes quota, clear cache?')
    ) {
      wb.prune(data.length, function (err) {
        if(err) throw prog.fail(err)
        wb.add(data, id, function (err) {
          if(err) throw prog.fail(err)
          wb.run(id, function (err) {
            if(err) throw prog.fail(err)
          })
        })
      })
    }
    else if(!err) wb.run(id, function (err) {
        if(err) throw prog.fail(err)
      })
    else
      throw prog.fail(err)
  }

  ;(function redraw () {
    wb.versions(function (err, log) {
      if(err) throw prog.fail(err)
      document.body.innerHTML = ''
      if(log.length && !wb.isInit())
        return wb.run(log[0].value, function (err) {
          if(err) throw prog.fail(err)
        })

      document.body.appendChild(
        h('div', {classList: 'WebBoot'}, [
          ( !log.length
          ? h('h2', 'please enter secure-url or select file to run')
          : h('ol', {classList: 'WebBoot__recent'}, log.map(function (v) {
              return h('li', [
                h('code', [v.value]),
                h('label',
                  { title: new Date(v.ts).toString() },
                  [ ' (loaded ', human(new Date(v.ts)), ') ']
                ),
                h('div', [
                  btn('run', function () {
                    wb.run(v.value)
                  }),
                  btn('revert', function () {
                    wb.revert(v.ts, function (err) {
                      if(err) throw prog.fail(err)
                      redraw()
                    })
                  })
                ])
              ])
            }))
          ),

          //paste a secure url into this text input
          h('input', {
            placeholder: 'enter secure url',
            onchange: function (ev) {
              //else, download it. if that succeeds,
              //add to store, if success, run.
              //if that fails, offer to clean up, or fail.
              //add to store, if success, run.

              //this can fail from quota exceeded.
              //check whether we have this already, if so, run it.
              var url = ev.target.value

              wb.install(url, handleQuota)
            }
          }),

          //or select a local file to run
          input_file(function (data) {
            wb.add(data, function (err, id) {
              handleQuota(err, data, id)
            })
          })
        ])
      )
    })
  })()

}













