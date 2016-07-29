var fs = require('fs')
var path = require('path')

var index = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')

var manifest = require('./cache')(index)

module.exports = function (req, res, next) {
  if(req.url == '/')
    res.end(index)
  else if(req.url == '/manifest.appcache')
    res.end(manifest)
  else if(next)
    next()
  else res.writeHead(404), res.end('404!')
}

if(!module.parent)
  require('http').createServer(module.exports).listen(45789)





