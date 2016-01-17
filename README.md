# riot-ssr
[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

Synchronous and asynchronous server-side rendering of RiotJS tags for Connect/Express. Works well with nested tags and multiple async actions

## Installation

```
npm install --save riot-ssr
```

## Usage example

```js
// server.js
const app = require('connect') // or require('express')
const riotSSR = require('riot-ssr')

app.use(riotSSR())

// Now the `riotSSR` object is available in `res`
app.use(function(req, res, next) {
  // synchronously
  let rendered = res.riotSSR.render('path/or/name/of/my.tag', opts)
  res.end(rendered)

  // asynchronously
  res.riotSSR.renderAsync('path/or/name/of/my.tag', opts, function(rendered) {
    res.end(rendered)
  })
})

app.listen(3000)
```

For asynchronous `renderAsync` you need to run `this.asyncStart()` before every async action in your tags and `asyncEnd()` once they are ready (or better see higher level approach below)

```html
// some-component.tag
<some-component>
  <p>{ result }</p>
  <script>
    const asyncEnd = this.asyncStart() // registering a new async action and waiting until it's finished
    someAsyncFunction(result => {
      this.result = result
      this.update() // updating the tag
      asyncEnd() // async action is completed
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
  const asyncEnd = this.asyncStart()

  // Something async
  setTimeout(() => {
    callback()
    asyncEnd()
  }, 10)
}
```

```html
<some-component>
  <p>{ result }</p>
  <script>
    // no `asyncStart` or `asyncEnd` required
    this.someAsyncFunction(result => {
      this.result = result
      this.update()
    })
  </script>
</some-component>
```

[npm-image]: https://img.shields.io/npm/v/riot-ssr.svg
[npm-url]: https://npmjs.org/package/riot-ssr
[travis-image]: https://img.shields.io/travis/ilearnio/riot-ssr/master.svg
[travis-url]: https://travis-ci.org/ilearnio/riot-ssr
