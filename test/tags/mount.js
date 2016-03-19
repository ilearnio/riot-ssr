var riot = require('riot/riot.js')
require('./async')

module.exports = riot.tag('mount', '<div name="target"></div>', function (opts) {
  // It's important that the child tag will contain a proper
  // `this.parent` or `this.opts.parent` property which will
  // reference to the current tag
  var _opts = { parent: this }

  riot.mount(this.target, 'mount-child', _opts)[0]
})

riot.tag('mount-child', '{value}<async></async>', function (opts) {
  var self = this

  self.value = ''

  self.asyncStart()
  setTimeout(function () {
    self.value = 'ok'
    self.update()
    self.asyncEnd()
  }, 10)
})
