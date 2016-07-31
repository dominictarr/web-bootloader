module.exports = function (index) {
  return 'CACHE MANIFEST\n\nNETWORK:\n*\n#' +
    require('crypto')
      .createHash('sha256')
      .update(index, 'utf8')
      .digest('base64') + '\n'
}

if(!module.parent)
  console.log(module.exports(
    require('fs')
      .readFileSync(require('path').join(__dirname, '..', 'index.html'))
  ))
