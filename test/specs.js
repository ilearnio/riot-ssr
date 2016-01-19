var render = require('..')
var expect = require('chai').expect

var sync_tag = __dirname + '/tags/sync.js'
var async_tag = __dirname + '/tags/async.js'
var nested_tag = __dirname + '/tags/nested.js'
var long_running_tag = __dirname + '/tags/long-running.js'


describe('riot-ssr', function() {

  it('should render asynchronously', function(done) {
    render(async_tag, {}, function(result) {
      expect(result).to.equal('<async><p>ok</p></async>')
      done()
    })
  })

  it('should render synchronously', function(done) {
    var result = render(sync_tag, {})
    expect(result).to.equal('<sync><p>ok</p></sync>')
    done()
  })

  it('should render synchronously when a callback is given', function(done) {
    render(sync_tag, {}, function(result) {
      expect(result).to.equal('<sync><p>ok</p></sync>')
      done()
    })
  })

  it('should work with just a tag name given (instead of full path)', function(done) {
    var result = render('sync', {})
    expect(result).to.equal('<sync><p>ok</p></sync>')
    done()
  })

  it('should allow to skip opts argument', function(done) {
    var result = render(sync_tag)
    expect(result).to.equal('<sync><p>ok</p></sync>')
    done()
  })

  it('should allow to use callback as second argument', function(done) {
    render(async_tag, function(result) {
      expect(result).to.equal('<async><p>ok</p></async>')
      done()
    })
  })

  it('should support nested tags with multiple async calls', function(done) {
    render(nested_tag, {}, function(result) {
      expect(result).to.equal(
        '<nested><div><sync><p>ok</p></sync><async><p>ok</p></async>ok</div></nested>'
      )
      done()
    })
  })

  it('should handle long running simultaneous async calls', function(done) {
    this.timeout(5000)

    var timeout

    for (var i = 0; i < 10; i++) {
      timeout = i * 100

      setTimeout(function() {

        render(long_running_tag, {}, function(result) {
          expect(result).to.equal('<long-running><p>ok</p></long-running>')
          if (i === 10) done()
        })

      }, timeout)
    }
  })

})
