'use strict'

const expect = require('chai').expect
const riotSSR = require('..')

const sync_tag_path = __dirname + '/tags/sync.js'
const async_tag_path = __dirname + '/tags/async.js'

var pretendServer = function(callback, callback2) {
  var req = {}
  var res = {}
  var next = function() {}

  callback(req, res, next)
  callback2(req, res, next)
}


describe('riot-ssr', function() {
  it('should render asynchronously', function(done) {
    pretendServer(riotSSR(), function(req, res) {
      res.riotSSR.renderAsync(async_tag_path, {}, function(rendered) {
        expect(rendered).to.equal('<async><p>ok</p></async>')
        done()
      })
    })
  })

  it('should render synchronous tag with `renderAsync`', function(done) {
    pretendServer(riotSSR(), function(req, res) {
      res.riotSSR.renderAsync(sync_tag_path, {}, function(rendered) {
        expect(rendered).to.equal('<sync><p>ok</p></sync>')
        done()
      })
    })
  })

  it('should render synchronous tag with `render`', function(done) {
    pretendServer(riotSSR(), function(req, res) {
      const rendered = res.riotSSR.render(sync_tag_path, {});
      expect(rendered).to.equal('<sync><p>ok</p></sync>')
      done()
    })
  })
})
