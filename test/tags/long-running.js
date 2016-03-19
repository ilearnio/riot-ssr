var riot = require('riot/riot.js')

module.exports = riot.tag('long-running', '{value}', function (opts) {
  var self = this
  self.value = ''
  self.asyncStart()
  setTimeout(function () {
    self.value = opts.value || 'ok'
    self.update()
    self.asyncEnd()
  }, 500)
})
