var path = require('path')
var riot = require('riot')
var sdom = require('riot/lib/server/sdom')
require('riot/lib/server') // support for .tag files

/**
 * Render a tag synchronously or asynchronously.
 * Runs asynchronously if a callback is passed
 *
 * @param {String} tagPath
 * @param {Object} opts
 * @param {Function} callback (optional)
 * @returns {String|Void} html
 */

function render (tagPath, opts, callback) {
  opts = opts || {}

  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }

  var isAsync = typeof callback === 'function'

  var tag = createTag(tagPath, opts, isAsync && onReady)

  if (isAsync) {
    // In case there was no `asyncStart` or `asyncEnd`
    // calls in tags. They must be fired at least once
    if (!tag.ssr) {
      tag.asyncStart()
      tag.asyncEnd()
    }
  } else {
    return _render(tag)
  }

  function onReady () {
    if (!tag) return setImmediate(onReady)
    var rendered = _render(tag)
    callback(rendered)
  }
}

/**
 * Render tag instance
 *
 * @returns {String} html
 */
function _render (tag) {
  var html = sdom.serialize(tag.root)

  // unmount the tag avoiding memory leaks
  tag.unmount()

  return html
}

/**
 * Creates and mounts a tag instance
 *
 * @param {String} tagPath
 * @returns {String} html
 */

function createTag (tagPath, opts, onReady) {
  if (onReady) {
    //
    // Extend `riot.Tag.prototype` first, so that it would
    // contain required `asyncStart` and `asyncEnd`
    //

    riot.Tag.prototype.asyncStart = function () {
      var root = getRootTag(this)

      // Use the root tag as the storage, which will be set
      // up once when `asyncStart` will be called for the
      // first time
      root.ssr || (root.ssr = {
        asyncCounter: 0,
        onReadyStack: [onReady],
        ready: false
      })

      if (root.ssr.ready) {
        throw new Error('Calling `tag.asyncStart()` after rendered result ' +
          'was already returned')
      }

      root.ssr.asyncCounter++
    }

    if (!riot.Tag.prototype.asyncEnd) {
      riot.Tag.prototype.asyncEnd = function () {
        var root = getRootTag(this)

        if (root.ssr.ready) return

        root.ssr.asyncCounter--

        setImmediate(function () {
          if (!root.ssr.ready && root.ssr.asyncCounter === 0) {
            // All async actions are completed
            for (var i = 0; i < root.ssr.onReadyStack.length; i++) {
              root.ssr.onReadyStack[i]()
            }
            root.ssr.ready = true
          }
        })
      }
    }
  }

  var tagName = requireTag(tagPath)
  var root = document.createElement(tagName)

  var tag = riot.mount(root, opts)[0]

  return tag
}

/**
 * Require tag if path is given
 *
 * @param {String} tagPath
 * @returns {String} tagName
 */

function requireTag (tagPath) {
  if (tagPath[0] === '.') {
    tagPath = path.join(module.parent.filename, '..', tagPath)
  }

  var tagName = tagPath

  if (~tagPath.indexOf('/')) {
    tagName = require(tagPath)
    tagName = tagName.default || tagName
  }

  return tagName
}

/**
 * Returns the root tag of a given tag
 *
 * @param {Tag} instance
 * @returns {Tag} instance
 */

function getRootTag (tag) {
  while (tag.parent || tag.opts.parent instanceof riot.Tag) {
    tag = tag.parent || tag.opts.parent
  }

  return tag
}

module.exports = render
