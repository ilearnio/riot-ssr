/* eslint-env mocha */

var path = require('path')
var render = require('..')
var expect = require('chai').expect

var sync_tag = path.join(__dirname, '/tags/sync.js')
var async_tag = path.join(__dirname, '/tags/async.js')
var mount_tag = path.join(__dirname, '/tags/mount.js')
var nested_tag = path.join(__dirname, '/tags/nested.js')
var async_chain = path.join(__dirname, '/tags/async-chain.js')
var long_running_tag = path.join(__dirname, '/tags/long-running.js')

describe('riot-ssr', function () {
  it('should render asynchronously', function (done) {
    render(async_tag, {}, function (result) {
      expect(result).to.equal('<async>ok</async>')
      done()
    })
  })

  it('should render synchronously', function (done) {
    var result = render(sync_tag, {})
    expect(result).to.equal('<sync>ok</sync>')
    done()
  })

  it('should render synchronously when a callback is given', function (done) {
    render(sync_tag, {}, function (result) {
      expect(result).to.equal('<sync>ok</sync>')
      done()
    })
  })

  it('should work with just a tag name given (instead of full path)', function (done) {
    var result = render('sync', {})
    expect(result).to.equal('<sync>ok</sync>')
    done()
  })

  it('should allow to skip opts argument', function (done) {
    var result = render(sync_tag)
    expect(result).to.equal('<sync>ok</sync>')
    done()
  })

  it('should allow to use callback as second argument', function (done) {
    render(async_tag, function (result) {
      expect(result).to.equal('<async>ok</async>')
      done()
    })
  })

  it('should support nested tags with multiple async calls', function (done) {
    render(nested_tag, {}, function (result) {
      expect(result).to.equal(
        '<nested><sync>ok</sync><async>ok</async>ok</nested>'
      )
      done()
    })
  })

  it('should wait until all async chain is finished', function (done) {
    render(async_chain, {}, function (result) {
      expect(result).to.equal('<async-chain>ok</async-chain>')
      done()
    })
  })

  it('should allow to `riot.mount()` a tag from inside of another tag', function (done) {
    render(mount_tag, {}, function (result) {
      expect(result).to.equal(
        '<mount><div name="target" riot-tag="mount-child">ok<async>ok</async></div></mount>'
      )
      done()
    })
  })

  it('should handle long running simultanouse async calls', function (done) {
    this.timeout(5000)

    var timeout

    for (var i = 0; i < 10; i++) {
      timeout = i * 100

      setTimeout(function () {
        var opts = { value: timeout }
        render(long_running_tag, opts, function (result) {
          expect(result).to.equal('<long-running>' + timeout + '</long-running>')
          if (i === 10) done()
        })
      }, timeout)
    }
  })

  it('should handle relative path', function () {
    expect(render('./tags/sync.js')).to.equal('<sync>ok</sync>')
    expect(render('../test/tags/sync.js')).to.equal('<sync>ok</sync>')
  })
})
