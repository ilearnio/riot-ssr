# riot-ssr

Syncronous and asynchronous server-side rendering of RiotJS tags for Connect/Express

## Usage example

```js
// server.js
const app = require('connect') // or Express
const riotSSR = require('riot-ssr')

app.use(riotSSR())

// Now the `riotSSR` object is available in `res`
app.use(function(req, res, next) {
  // synchronously
  let rendered = res.riotSSR.render('path/or/name/of/my.tag', opts)

  // asynchronously
  res.riotSSR.renderAsync('path/or/name/of/my.tag', opts, function(rendered) {
    res.end(rendered)
  })
})

app.listen(3000)
```

For asynchronous SSR you need to run `this.asyncStart()` before all of your async actions and `this.asyncEnd()` after each of them (or better see higher level approach below)

```html
// some-component.tag
<some-component>
  <p>{ result }</p>
  <script>
    this.asyncStart() // registering a new async action and waiting until it's finished
    someAsyncFunction(result => {
      this.result = result
      this.update() // updating the tag
      this.asyncEnd() // async action is completed
    })
  </script>
</some-component>
```

## More higher level approach

The previous example was a really low-level. It is recommended that you would use the package with a mixin or by extending `riot.Tag` prototype.

Here is how I'm personally using it:

```js
// add `someAsyncFunction` method to every tag
riot.Tag.prototype.someAsyncFunction = function() {
  this.asyncStart()

  // Something async
  setTimeout(() => {
    this.asyncEnd()
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
