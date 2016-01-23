var riot = require('riot/riot.js')

module.exports = riot.tag('long-running', '{value}', function(opts) {
  // Riot v2.3.13 bug: https://github.com/riot/riot/issues/1517
  if (Object.keys(opts).length === 0
    && opts.__proto__ && Object.keys(opts.__proto__).length) {
    opts = opts.__proto__
  }

  var self = this
  self.value = ''
  self.asyncStart()
  setTimeout(function() {
    self.value = opts.value || 'ok'
    self.update()
    self.asyncEnd()
  }, 500)
})
