var riot = require('riot/riot.js')
require('./sync')
require('./async')

module.exports = riot.tag('nested',
  '<div><sync></sync><async></async>{value}</div>',
  function(opts) {
    var self = this
    self.value = ''
    self.asyncStart()
    setTimeout(function() {
      self.value = 'ok'
      self.update()
      self.asyncEnd()
    }, 10)
  }
)
