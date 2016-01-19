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

  if (typeof opts == 'function')
    callback = opts

  if (typeof callback !== 'function') {
    var tag = createTag(tag_path, opts)
    tag.mount()
    return _render(tag)
  } else {
    var tag = createAsyncTag(tag_path, opts, function() {
      var rendered = _render(tag)
      callback(rendered)
    })
    tag.mount()
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
 * Create tag instance
 *
 * @param {string} tag_path
 * @param {object} opts
 */

function createTag(tag_path, opts) {
  var tag_name = requireTag(tag_path)
  var root = document.createElement(tag_name)
  var tag = riot.mount(root, opts)[0]

  return tag
}

/**
 * Create asynchronous tag instance
 *
 * @param {string} tag_path
 * @param {object} opts
 * @param {function} onReady callback
 */

function createAsyncTag(tag_path, opts, onReady) {
  var root_tag = createTag(tag_path)

  // the root counter of async calls
  var root_async_counter = 0

  var ready_fired = false

  withChildren(root_tag).forEach(function(tag) {
    // counter of async calls for the current tag
    var async_counter = 0

    tag.asyncStart = function() {
      root_async_counter++
      async_counter++
    }

    tag.asyncEnd = function() {
      root_async_counter--
      async_counter--

      if (async_counter === 0 && root_async_counter === 0) {
        // All async actions are completed
        onReady()
        ready_fired = true
      }
    }
  })

  // In case there was no `asyncStart` or `asyncEnd` calls in tags
  process.nextTick(function() {
    if (!ready_fired && root_async_counter === 0) {
      onReady()
    }
  })

  return root_tag
}

/**
 * Returns an array of tags that contains the given tag and
 * all of it's children
 *
 * @param {Tag} instance
 * @returns {array}
 */

function withChildren(tag) {
  return [tag].concat(getChildrenTags(tag))
}

/**
 * Returns all children tags of the given tag recursively
 *
 * @param {Tag} instance
 * @returns {array}
 */

function getChildrenTags(tag) {
  var result = []

  for (var tag_name in tag.tags) {
    var child = tag.tags[tag_name]

    result.push(child)

    result.concat(getChildrenTags(child))
  }

  return result
}

module.exports = render
