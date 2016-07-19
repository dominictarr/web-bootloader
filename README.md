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

### pseudocode

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

### user stories

#### invite codes

Alice shares wants to invite Bob to join the p2p revolution.
she generates an invite code, and creates a link containing the address of a server
hosting `web-bootloader` a _secure url_ containing the alice's recommended UI version,
and the invite code. Alice sends this to Bob via a legacy channel (email, twtr, etc)

Bob clicks on that link. his browser first loads the `web-bootloader` script, which
then loads the secure url, which then uses the invite code to join the network.

Now Bob is cryptographically linked into the network.

#### manual updates

Alice has been hacking on a new feature for her prefered UI client.
she creates a new js bundle and publishes it as a blob.
Then she posts a message announcing the new version, containing the link.
Bob (or anyone else) can then click on that link to load that version as their client.

#### automatic updates

Bob thinks the work Alice is doing is great, but doesn't want to bother manually updating.
He just _subscribes_ to her updates (for a given app), and his client updates itself.

#### temporary update

Charlie is writing an app similar to Alice's. Alice wants to try it out, but not necessarily
to use that as her main thing. This means Alice needs to have a option at somepoint when loading
the app to choose either not to persist the version, or just to run one version.

> as long as it's possible to manage versions, then Alice can select which version she wants to run,
> and remove versions she no longer wants/needs.

## License

MIT







