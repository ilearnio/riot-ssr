# riot-ssr
[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Synchronous/Asynchronous server-side rendering of [RiotJS](http://riotjs.com) tags. Based on the official `render` method from Riot's compiler.

The entire idea of rendering tags asynchronously is based around two additional functions that it adds to your every tag by extending `riot.Tag.prototype`, those are `asyncStart` and `asyncEnd`. In order to make the renderer to wait untill your async code will be finished, you need to call `this.asyncStart()` before it starts and `this.asyncEnd()` respectively when it ends. You can call these functions as many times you want in all your tags, just remember that they must always go together. If you started an async action it should be ended, otherways it will wait for it forever.

## Features

* Supports nested tags
* Supports multiple async calls and complex async chains
* Correctly handles multiple simultanouse requests
* Allows to `riot.mount()` tags from inside of another tags ([see tests for example](https://github.com/ilearnio/riot-ssr/blob/master/test/tags/mount.js))
* Great tests coverage

## Installation

```
npm install --save riot-ssr
```

## Usage example

```js
const render = require('riot-ssr')

// Render asynchronously (can be used for sync tags as well)
render('path/or/name/of/my.tag', opts, function (rendered) {
  // ... do something with `rendered`
})
```

```html
<some-component>
  <p>{ result }</p>
  <script>
    if (IS_SERVER) this.asyncStart() // registering a new async call and waiting until it's finished
    someAsyncFunction(result => {
      this.result = result
      this.update() // updating the tag
      if (IS_SERVER) this.asyncEnd() // async call is completed
    })
  </script>
</some-component>
```

### Higher level approach

The previous example is kind of low-level. It is recommended that you would create wrapper that would call `asyncStart` and `asyncEnd` for you. It can be a pure function, Riot mixin or whatever you think is best. Example:

```js
// add `someAsyncFunction` method to every tag
function someAsyncFunction (tag, callback) {
  if (IS_SERVER) tag.asyncStart()

  // Something async
  setTimeout(() => {
    callback('Hello world!')
    if (IS_SERVER) tag.asyncEnd()
  }, 100)
}
```

```html
<some-component>
  <p>{ result }</p>
  <script>
    // no `asyncStart` or `asyncEnd` required
    someAsyncFunction(this, (result) => {
      this.result = result // -> 'Hello world!'
      this.update()
    })
  </script>
</some-component>
```

[npm-image]: https://img.shields.io/npm/v/riot-ssr.svg
[npm-url]: https://npmjs.org/package/riot-ssr
[travis-image]: https://img.shields.io/travis/ilearnio/riot-ssr/master.svg
[travis-url]: https://travis-ci.org/ilearnio/riot-ssr
