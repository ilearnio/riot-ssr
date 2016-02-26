var riot = require('riot/riot.js')

module.exports = riot.tag('sync', '{value}', function (opts) {
  this.value = 'ok'
})
