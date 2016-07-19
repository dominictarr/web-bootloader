# web-bootloader

prototype bootloader for the offline web.

The goal of this module is to allow an offline web app
to be securely loaded, and then later updated,
without exposing a backdoor to the server.

other modules exploring this space:

* https://github.com/substack/hyperboot
* https://github.com/substack/slugboot
* https://github.com/feross/infinite-app-cache

A web app is an app that is _reinstalled_ every time it is run.
Appcache & ServiceWorker allow a webapp to become an app with
an automatic updater, that updates when a new version is available.
But an autoupdater is essentially a _backdoor_. It can be used
to add security, but it can also take it away.

We want to take _that_ away - so that the user can have control
over the update process. Then we can be secure even if the server
is compromised.

Making the bootloader secure also makes it more difficult to update.
For this reason, it's very important that the bootloader is as simple
as possible.

## bootload process

web-bootloader supports loading a single javascript file,
that must have an expected hash.

When the page loads, `web-bootloader` checks whether the
url hash fragment (after `#`) is a url containing a base64 hash.
urls without a hash are not supported. If the app already
has a copy of that file, it loads from local copy.
Else, a the new code is loaded from the url, if the response
does not have the correct hash, the response is discarded,
and the previous version is run.

``` js
//secure_url is a url containing a hash.
//this tells where to get the js bundle,
//and also what it must be.

if(secure_url) {
  //extract hash from url.
  var id = getHash(secure_url)
  //check if we already know this.
  if(store[id])
    run(id)
  else
    load(secure_url, function (err, src) {
      if(id != hash(src))
        fail('corrupt response')
      else {
        store[id] = src
        run(id)
      }
    })
}
else if(store.current_version) {
  run(store.current_version)
}
else
  usage()
```


## License

MIT














