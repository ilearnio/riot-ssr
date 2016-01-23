var riot = require('riot/riot.js')

module.exports = riot.tag('async-chain', '{value}', function(opts) {
  this.asyncStart()
  this.asyncEnd()

  this.asyncStart()
  this.asyncEnd()

  this.asyncStart()
  setTimeout(() => {
    this.asyncEnd()

    this.asyncStart()
    setTimeout(() => {
      this.value = 'ok'
      this.update()
      this.asyncEnd()
    }, 10)
  }, 10)
})
