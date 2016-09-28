/* eslint-env mocha */

var path = require('path')
var render = require('..')
var expect = require('chai').expect

var syncTag = path.join(__dirname, '/tags/sync.js')
var asyncTag = path.join(__dirname, '/tags/async.js')
var mountTag = path.join(__dirname, '/tags/mount.js')
var nestedTag = path.join(__dirname, '/tags/nested.js')
var asyncChain = path.join(__dirname, '/tags/async-chain.js')
var longRunningTag = path.join(__dirname, '/tags/long-running.js')

describe('riot-ssr', function () {
  it('should render asynchronously', function (done) {
    render(asyncTag, {}, function (result) {
      expect(result).to.equal('<async>ok</async>')
      done()
    })
  })

  it('should render synchronously', function () {
    var result = render(syncTag, {})
    expect(result).to.equal('<sync>ok</sync>')
  })

  it('should render synchronously when a callback is given', function (done) {
    render(syncTag, {}, function (result) {
      expect(result).to.equal('<sync>ok</sync>')
      done()
    })
  })

  it('should work with just a tag name given (instead of full path)', function () {
    var result = render('sync', {})
    expect(result).to.equal('<sync>ok</sync>')
  })

  it('should handle relative path', function () {
    expect(render('./tags/sync.js')).to.equal('<sync>ok</sync>')
    expect(render('../test/tags/sync.js')).to.equal('<sync>ok</sync>')
  })

  it('should allow to skip opts argument', function () {
    var result = render(syncTag)
    expect(result).to.equal('<sync>ok</sync>')
  })

  it('should allow to use callback as second argument', function (done) {
    render(asyncTag, function (result) {
      expect(result).to.equal('<async>ok</async>')
      done()
    })
  })

  it('should support nested tags with multiple async calls', function (done) {
    render(nestedTag, {}, function (result) {
      expect(result).to.equal(
        '<nested><sync>ok</sync><async>ok</async>ok</nested>'
      )
      done()
    })
  })

  it('should wait until async chain is finished', function (done) {
    render(asyncChain, {}, function (result) {
      expect(result).to.equal('<async-chain>ok</async-chain>')
      done()
    })
  })

  it('should allow to `riot.mount()` a tag from inside of another tag', function (done) {
    render(mountTag, {}, function (result) {
      expect(result).to.equal(
        '<mount><div name="target" data-is="mount-child" riot-tag="mount-child">ok<async>ok</async></div></mount>'
      )
      done()
    })
  })

  it('should handle long running simultanouse async calls', function (done) {
    this.timeout(5000)

    for (var i = 1; i <= 10; i++) {
      (function (i) {
        var timeout = i * 100
        setTimeout(function () {
          var opts = { value: timeout }
          render(longRunningTag, opts, function (result) {
            expect(result).to.equal('<long-running>' + timeout + '</long-running>')
            if (i === 10) {
              done()
            }
          })
        }, timeout)
      })(i)
    }
  })
})
