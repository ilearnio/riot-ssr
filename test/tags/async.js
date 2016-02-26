var riot = require('riot/riot.js')

module.exports = riot.tag('async', '{value}', function (opts) {
  var self = this
  self.value = ''
  self.asyncStart()
  setTimeout(function () {
    self.value = 'ok'
    self.update()
    self.asyncEnd()
  }, 10)
})
