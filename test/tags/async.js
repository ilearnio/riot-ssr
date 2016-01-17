'use strict'

const riot = require('riot/riot.js')

module.exports = riot.tag('async', '<p>{value}</p>', function(opts) {
  this.value = ''
  const asyncEnd = this.asyncStart()
  setTimeout(() => {
    this.value = 'ok'
    this.update()
    asyncEnd()
  }, 10)
})
