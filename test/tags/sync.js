var riot = require('riot/riot.js')

module.exports = riot.tag('sync', '<p>{value}</p>', function(opts) {
  this.value = 'ok'
})
