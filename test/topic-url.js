var topicUrl = require('..').topicUrl

var expect = require('expect.js')
var url = require('url')

describe('topicUrl', function () {
  describe('#fromConfig', function () {
    context('invalid config passed fromConfig({config})', function () {
      var errorExpectations = [
        {
          it: 'requires a publication',
          config: {},
          message: 'The response config object must have a `publication` property'
        },
        {
          it: 'requires a kind',
          config: {publication: 'oa'},
          message: 'The response config object must have a `kind` property'
        },
        {
          it: 'requires a an article',
          config: {publication: 'oa', kind: 'imagestream'},
          message: 'The response config object must have a `article` property with an `id` property'
        },
        {
          it: 'requires a an article id',
          config: {publication: 'oa', kind: 'imagestream', article: {}},
          message: 'The response config.article object must have an `id` property'
        }
      ]
      errorExpectations.forEach(function (err) {
        it(err.it +' to throw ' + err.message, function () {
          expect(function () {
            topicUrl.fromConfig(err.config)
          }).to.throwError(function (e) {
            expect(e.message).to.eql(err.message)
          })
        })
      })
    })
    context('valid config passed fromConfig({config})', function () {
      var expectations = [
        {
          it: 'accepts the minimum viable config object',
          config: {
            publication: 'oa',
            kind: 'imagestream',
            article: {
              id: 1337
            }
          },
          url: '/topics/oa/imagestream/1337'
        },
        {
          it: 'escapes weird characters from the article id',
          config: {
            publication: 'oa',
            kind: 'imagestream',
            article: {
              id: 'as?df=&#'
            }
          },
          url: '/topics/oa/imagestream/' + encodeURIComponent('as?df=&#')
        },
        {
          it: 'accepts long strange float-like values for article id',
          config: {
            publication: 'oa',
            kind: 'imagestream',
            article: {
              id: '1.232323432333294743987894787337'
            }
          },
          url: '/topics/oa/imagestream/1.232323432333294743987894787337'
        }
      ]
      expectations.forEach(function (expectation) {
        it(expectation.it, function () {
            expect(url.format(topicUrl.fromConfig(expectation.config))).to.eql(expectation.url)
          })
      })
    })
  })
});
