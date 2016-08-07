var h = require('hscrpt')
var input_file = require('hyperfile')
var Progress = require('hyperprogress')
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
                ' at ',
                h('a', {
                  href: '#',
                  title: new Date(v.ts).toString()
                }, [human(new Date(v.ts))]),
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
              wb.installAndRun(ev.target.value, function (err) {
                //assume this is a secure url
                if(err) throw prog.fail(err)
              })
            }
          }),

          //or select a local file to run
          input_file(function (buf) {
            wb.add(buf, function (err, id) {
              if(err) throw prog.fail(err)
              wb.run(id, function (err) {
                if(err) throw prog.fail(err)
                //this will not callback if it successfully runs.
              })
            })
          })
        ])
      )
    })
  })()

//  var isInit = (
//    !WebBoot.current() ||
//    parts.length && parts[0] === APPNAME+'_INIT' ||
//    isElectron
//  )
//
//  //display some UI about current versions loaded.
//  //optionally load a new script from a file.
//  prog.next('no code to run: paste #{secure_url} to a javascript file.')
//  var total = 0
//  if(isInit) {
//    var versions = h('div', []),
//
//    wb.
//
//      h('h2', ['current versions']),
//        h('ul', versions.map(function (op) {
//          total += op.size
//          var el = h('li', [
//            h('div', [
//              'hash:'+op.hash,
//              ' ',
//              'loaded:'+new Date(+op.ts).toISOString(),
//              ' ',
//              localStorage[APPNAME+'_current'] === op.hash ? '(current)' : '',
//              ' ',
//              'size:'+kb(op.size),
//              h('div', [
//                btn('delete', function () {
//                  WebBoot.remove(op.hash)
//                  el.remove()
//                }),
//                btn('run', function () {
//                  localStorage[APPNAME+'_current'] = op.hash
//                  location.hash = ''
//                  run(op.hash)
//                })
//              ])
//            ])
//          ])
//          return el
//        })),
//        "Total Size:", kb(total)
//
//
//    document.body.appendChild(h('div', [
//      versions,

//    ]))
//
//  }
//  else if(parts.length && isUrl.test(parts[0]) && hasHash.test(parts[0])) {
//
//  var id = hasHash.exec(parts[0])[1]
//  var _hash = '#'+parts.slice(1).join('#')
//
//  function _run (id) {
//    window.location.hash = _hash; run(id)
//  }
//
//  prog.next('detected secure url:'+ parts[0])
//
//  if(WebBoot.current() && WebBoot.current() !== id)
//    if(!confirm("this action updates code to:"+id + "\nclick 'cancel' to continue with current version"))
//      return _run(current)
//
//  //check if we already have this data.
//  if(WebBoot.has(id)) {
//    prog.next('loading local version')
//    _run(id)
//  } else {
//    prog.next('retriving secure url:'+parts[0])
//    add(parts[0], function (err, id) {
//      if(err) return prog.fail(err)
//
//      prog.next('loading secure javascript')
//      //returned data is correct. save, then run.
//      _run(id)
//
//    })
//  }
//}
//else if(WebBoot.current())
//  run(WebBoot.current())
//else {
//  prog.next('no code to run: paste #{secure_url} to a javascript file.')
//  console.log(parts, isUrl.test(parts[0]), hasHash.test(parts[0]))
//}
//
}





















