'use strict'

const riot = require('riot')
const sdom = require('riot/lib/server/sdom')
require('riot/lib/server') // support for .tag files

/**
 * Render synchronously
 */
function render(tag_path, opts) {
  const tag = createTag(tag_path, opts)
  return _render(tag)
}

/**
 * Render asynchronously
 */
function renderAsync(tag_path, opts, callback) {
  setupAsyncListener.call(this)

  const tag = createTag(tag_path, opts)

  this._onReady(function() {
    const rendered = _render(tag)
    callback(rendered)
  })
}

/**
 * Require tag if path is given
 */
function requireTag(tag_path) {
  let tag_name = tag_path

  if (~tag_name.indexOf('/')) {
    tag_name = require(tag_name)
    tag_name = tag_name.default || tag_name
  }

  return tag_name
}

/**
 * Create tag instance
 */
function createTag(tag_path, opts) {
  const tag_name = requireTag(tag_path)
  const root = document.createElement(tag_name)
  const tag = riot.mount(root, opts)[0]

  return tag
}

/**
 * Render tag instance
 */
function _render(tag) {
  const html = sdom.serialize(tag.root)

  // unmount the tag avoiding memory leaks
  tag.unmount()

  return html
}

/**
 * Listen for ready enents
 */
function _onReady(callback) {
  let stack = this._onready_stack = this._onready_stack || []

  stack.push(callback)

  if (this.ready || this.async_counter === 0) {
    ready.call(this)
  }
}

/**
 * Fire ready event now
 */
function ready() {
  this.ready = true

  if (this._onready_stack && this._onready_stack.length) {
    while (this._onready_stack[0]) {
      this._onready_stack.shift()()
    }
  }
}

function setupAsyncListener() {
  this.ready = false

  this.async_counter = 0

  // Use `this.asyncStart()` in your tags to register every async action
  riot.Tag.prototype.asyncStart = () => {
    this.ready = false
    this.async_counter++
  }

  // After async action is completed/failed, do `this.asyncEnd()` in your tags
  riot.Tag.prototype.asyncEnd = () => {
    this.async_counter--

    // All async actions are completed
    if (this.async_counter === 0) {
      ready.call(this)
    }
  }
}

module.exports = function() {
  return function(req, res, next) {
    res.riotSSR = {}
    res.riotSSR.render = render
    res.riotSSR.renderAsync = renderAsync
    res.riotSSR._onReady = _onReady
    next()
  }
}
