# riot-ssr
[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

Synchronous/Asynchronous server-side rendering of RiotJS tags. Works well with nested tags and multiple async calls.

## Installation

```
npm install --save riot-ssr
```

## Usage example

```js
const render = require('riot-ssr')

// synchronously
let rendered = render('path/or/name/of/my.tag', opts)

// asynchronously (can be used for sync tags as well)
render('path/or/name/of/my.tag', opts, function(rendered) {
  // ... do something with `rendered`
})
```

In order to make the renderer to wait untill all of your asynchronous stuff will be completed, you need to run `this.asyncStart()` before your async calls and `this.asyncEnd()` after they are ready (or better see higher level approach below). You can use this functions as many times you want (for your every async call), but they must to always go together.

```html
<some-component>
  <p>{ result }</p>
  <script>
    this.asyncStart() // registering a new async call and waiting until it's finished
    someAsyncFunction(result => {
      this.result = result
      this.update() // updating the tag
      this.asyncEnd() // async call is completed
    })
  </script>
</some-component>
```

### Higher level approach

The previous example is a really low-level. It is recommended that you would create a mixin or extend `riot.Tag` prototype.

Here is how I'm personally using it:

```js
// add `someAsyncFunction` method to every tag
riot.Tag.prototype.someAsyncFunction = function(callback) {
  this.asyncStart()

  // Something async
  setTimeout(() => {
    callback('Hello world!')
    this.asyncEnd()
  }, 100)
}
```

```html
<some-component>
  <p>{ result }</p>
  <script>
    // no `asyncStart` or `asyncEnd` required
    this.someAsyncFunction(result => {
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
