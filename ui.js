var h = require('hscrpt')
var input_file = require('hyperfile')
var Progress = require('hyperprogress')
var u = require('./util')
var prog = Progress()
var SecureUrl = require('./fetch')

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

  function logFail(err) {
    if(err) throw prog.fail(err)
  }

  function handleQuota(err, data, id) {
    if(err
      && /quota/i.test(err.name)
      && confirm ('adding: '+id+' exceedes quota, clear cache?')
    ) {
      wb.prune(data.length || data.byteLength || 0, function (err) {
        if(err) throw prog.fail(err)
        wb.add(data, id, function (err) {
          if(err) throw prog.fail(err)
          wb.run(id, logFail)
        })
      })
    }
    else if(!err) wb.run(id, logFail)
    else
      throw prog.fail(err)
  }

  function clearHash (err) {
    if(err) throw prog.fail(err)
    else location.hash = location.hash.split('#').splice(2).join('#')
  }

  ;(function redraw () {
    //okay, check if the hash has a secure url in it first.
    var url = location.hash.split('#').splice(1).shift()
    var id = SecureUrl.isSecureUrl(url)
    if(!id) url = null
    wb.versions(function (err, log) {
      if(err) throw prog.fail(err)
      document.body.innerHTML = ''
      //if we have a version ready, and there is no url provided, run it.
      if(!wb.isInit()) {
        //if there is no logged versions, run the url version
        if(id && !log.length) {
          wb.installAndRun(url, clearHash)
        }
        //if there is no url, run the log version
        else if(log.length && !id)
          wb.run(log[0].value, logFail)
        //prompt if they want to upgrade to new url version.
        else if(id && log.length) {
          //if the url is the same as we would have run,
          //then just run it.
          if(log[0].value === id)
            wb.run(log[0].value, clearHash)
          else if(confirm('change version to:'+url))
            wb.installAndRun(url, clearHash)
          else
            wb.run(log[0].value, logFail)
        }
      }
      else
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
                if(err) console.log(err.name)
                handleQuota(err, data, id)
              })
            })
          ])
        )
    })
  })()

}

