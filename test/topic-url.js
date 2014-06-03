var topicUrl = require("..").topicUrl;

var expect = require("expect.js");
var test = require("tap").test;

describe("topicUrl", function () {
  describe("#fromConfig", function () {
    context('invalid config passed fromConfig({config})', function () {
      var errorExpectations = [
        {
          it: "requires a publication",
          config: {},
          message: 'The response config object must have a `publication` property'
        },
        {
          it: "requires a kind",
          config: {publication: 'oa'},
          message: 'The response config object must have a `kind` property'
        },
        {
          it: "requires a an article",
          config: {publication: 'oa', kind: 'imagestream'},
          message: 'The response config object must have a `article` property with an `id` property'
        },
        {
          it: "requires a an article id",
          config: {publication: 'oa', kind: 'imagestream', article: {}},
          message: 'The response config.article object must have an `id` property'
        }
      ];
      errorExpectations.forEach(function (err) {
        it(err.it +" to throw " + err.message, function () {
          expect(function () {
            topicUrl.fromConfig(err.config)
          }).to.throwError(function(e) {
              expect(e.message).to.eql(err.message)
            });
        });
      });
    });
    context('valid config passed fromConfig({config})', function () {
      var expectations = [
        {
          it: "accepts the minimum viable config object",
          config: {
            publication: 'oa',
            kind: 'imagestream',
            article: {
              id: 1337
            }
          },
          url: '/topics/oa/imagestream/1337?title=&article_url=&article_title='
        },
        {
          it: "builds the topic url",
          config: {
            publication: 'oa',
            kind: 'imagestream',
            article: {
              id: 1337,
              title: 'Foo bar article title'
            }
          },
          url: '/topics/oa/imagestream/1337?title=&article_url=&article_title=Foo%20bar%20article%20title'
        },
        {
          it: "properly escapes the article url",
          config: {
            publication: 'oa',
            kind: 'imagestream',
            article: {
              id: '1337',
              url: 'http://example.com/this/is?an=url&with&a=querystring'
            }
          },
          url: '/topics/oa/imagestream/1337?title=&article_url=http%3A%2F%2Fexample.com%2Fthis%2Fis%3Fan%3Durl%26with%26a%3Dquerystring&article_title='
        },
        {
          it: "escapes anything from article url, really",
          config: {
            publication: 'oa',
            kind: 'imagestream',
            article: {
              id: '1337',
              url: '&an=url&with&a=querystring'
            }
          },
          url: '/topics/oa/imagestream/1337?title=&article_url=%26an%3Durl%26with%26a%3Dquerystring&article_title='
        },
        {
          it: "accepts long strange float-like values for article id",
          config: {
            publication: 'oa',
            kind: 'imagestream',
            article: {
              id: '1.232323432333294743987894787337'
            }
          },
          url: '/topics/oa/imagestream/1.232323432333294743987894787337?title=&article_url=&article_title='
        },
        {
          it: "escapes title parameter too",
          config: {
            title: 'this is response title',
            publication: 'oa',
            kind: 'imagestream',
            article: {
              id: '1337'
            }
          },
          url: '/topics/oa/imagestream/1337?title=this%20is%20response%20title&article_url=&article_title='
        }
      ];
      expectations.forEach(function (expectation) {
          it(expectation.it, function () {
          expect(topicUrl.fromConfig(expectation.config)).to.eql(expectation.url);
        });
      });
    });
  });
});