var riot = require('riot/riot.js')

module.exports = riot.tag('async-chain', '{value}', function(opts) {
  var self = this

  self.asyncStart()
  self.asyncEnd()

  self.asyncStart()
  self.asyncEnd()

  self.asyncStart()
  setTimeout(function() {
    self.asyncEnd()

    self.asyncStart()
    setTimeout(function() {
      self.value = 'ok'
      self.update()
      self.asyncEnd()
    }, 10)
  }, 10)
})
