const topicUrl = require('..').topicUrl

const expect = require('expect.js')
const url = require('url')

describe('topicUrl', () => {
  describe('#fromConfig', () => {
    context('invalid config passed fromConfig({config})', () => {
      const errorExpectations = [
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
      errorExpectations.forEach(err => {
        it(`${err.it} to throw ${err.message}`, () => {
          expect(() => {
            topicUrl.fromConfig(err.config)
          }).to.throwError(e => {
            expect(e.message).to.eql(err.message)
          })
        })
      })
    })
    context('valid config passed fromConfig({config})', () => {
      const expectations = [
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
          url: `/topics/oa/imagestream/${encodeURIComponent('as?df=&#')}`
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

      expectations.forEach(expectation => {
        it(expectation.it, () => {
          expect(url.format(topicUrl.fromConfig(expectation.config))).to.eql(expectation.url)
        })
      })
    })
  })
})
