var riot = require('riot')
var sdom = require('riot/lib/server/sdom')
require('riot/lib/server') // support for .tag files

/**
 * Render a tag synchronously or asynchronously.
 * Runs asynchronously if a callback is passed
 *
 * @param {string} tag_path
 * @param {object} opts
 * @param {function} callback (optional)
 * @returns {string|void} html
 */

function render(tag_path, opts, callback) {
  opts = opts || {}

  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }

  var async = typeof callback === 'function'

  var tag = createTag(tag_path, opts, async && onReady)

  if (async) {
    // In case there was no `asyncStart` or `asyncEnd`
    // calls in tags. They must be fired at least once
    if (!tag.ssr) {
      tag.asyncStart()
      tag.asyncEnd()
    }
  } else {
    return _render(tag)
  }

  function onReady() {
    if (!tag) return setImmediate(onReady)

    callback(_render(tag))
  }
}

/**
 * Render tag instance
 *
 * @returns {string} html
 */

function _render(tag) {
  var html = sdom.serialize(tag.root)

  // unmount the tag avoiding memory leaks
  tag.unmount()

  return html
}

/**
 * Creates and mounts a tag instance
 *
 * @param {string} tag_path
 * @returns {string} html
 */

function createTag(tag_path, opts, onReady) {
  if (onReady) {
    //
    // Extend `riot.Tag.prototype` first, so that it would
    // contain required `asyncStart` and `asyncEnd`
    //

    riot.Tag.prototype.asyncStart = function() {
      var root = getRootTag(this)

      // Use the root tag as the storage, which will be set
      // up once when `asyncStart` will be called for the
      // first time
      if (!root.ssr) {
        root.ssr = root.ssr || {
          async_counter: 0,
          onReady: onReady,
          ready: false
        }
      }

      if (root.ssr.ready) {
        throw Error('Calling `tag.asyncStart()` after rendered result was ' +
          'already returned')
      }

      root.ssr.async_counter++
    }

    if (!riot.Tag.prototype.asyncEnd) {
      riot.Tag.prototype.asyncEnd = function() {
        var root = getRootTag(this)

        if (root.ssr.ready) return

        root.ssr.async_counter--

        setImmediate(function() {
          if (!root.ssr.ready && root.ssr.async_counter === 0) {
            // All async actions are completed
            root.ssr.onReady()
            root.ssr.ready = true
          }
        })
      }
    }
  }

  var tag_name = requireTag(tag_path)
  var root = document.createElement(tag_name)

  return riot.mount(root, opts)[0]
}

/**
 * Require tag if path is given
 *
 * @param {string} tag_path
 * @returns {string} tag_name
 */

function requireTag(tag_path) {
  var tag_name = tag_path

  if (~tag_path.indexOf('/')) {
    tag_name = require(tag_path)
    tag_name = tag_name.default || tag_name
  }

  return tag_name
}

/**
 * Returns the root tag of a given tag
 *
 * @param {Tag} instance
 * @returns {Tag} instance
 */

function getRootTag(tag) {
  while (tag.parent) {
    tag = tag.parent
  }

  return tag
}

module.exports = render
