var EmbedConfig = require("..");

var expect = require("expect.js");
var test = require("tap").test;

global.document = {
  title: "Foo title",
  location: {
    href: "http://foo.bar/baz"
  }
};

var examples = require("./examples");

describe("EmbedConfig", function () {

  describe('parse()', function () {
    it("valid dataAttributes is valid", function () {
      examples.valid.forEach(function (dataAttrs) {
        var config = EmbedConfig.fromDataAttributes(dataAttrs);
        var result = config.parse();
        expect(result.valid).to.be(true)
      })
    });

    it("invalid dataAttributes are invalid", function () {
      examples.invalid.forEach(function (dataAttrs) {
        var config = EmbedConfig.fromDataAttributes(dataAttrs);
        var result = config.parse();
        expect(result.valid).not.to.be(true)
      })
    });

    it('guesses sane defaults and recovers from common misconfigurations', function () {
      var result = EmbedConfig.fromDataAttributes({
        articleId: 'foo',
        kind: 'conversation'
      }).parse();

      expect(result.config.article.title).to.be(document.title);
      expect(result.config.article.url).to.be(document.location.href);

    });

    describe('articleId', function () {
      it("should allow strings as IDs", function () {
        var result = EmbedConfig.fromDataAttributes({kind: 'conversation', articleId: 'foobar'}).parse();
        expect(result.config.article.id).to.be('foobar');
      });

      it("should parse ID to string even if it looks like a number", function () {
        var result = EmbedConfig.fromDataAttributes({kind: 'conversation', articleId: '12345'}).parse();
        expect(result.config.article.id).to.be.a('string');
      });

      it("should parse ID to string even if it looks like a number", function () {
        var result = EmbedConfig.fromDataAttributes({
          kind: 'conversation', articleId: '23.49238923893289238492384983212345'
        }).parse();
        expect(result.config.article.id).to.be.a('string');
      })
    });

    describe('articleUrl', function() {
      it('removes any auth_trace parameter from url', function () {
        // Note: The response_auth_trace parameter is added by a workaround for an issue w/window.open not working in
        // ios webviews and used to keep track of what action the user might was doing when she left the page.
        var attrs = {
          articleId: 'foo',
          kind: 'conversation',
          articleUrl: 'http://foo.bar?response_auth_trace=34892'
        };
        var result = EmbedConfig.fromDataAttributes(attrs).parse();
        expect(result.config.article.url).not.to.contain('response_auth_trace');
      });
    });

    describe('hashTag', function() {
      it('returns hashTag for imagestreams only', function () {
        ['conversation', 'procon', 'question']
          .map(function (kind) {
            return {
              articleId: 'foo',
              kind: kind,
              hashTag: 'Foo'
            }
          })
          .forEach(function (attrs) {
            var result = EmbedConfig.fromDataAttributes(attrs).parse();
            expect(result.config).to.not.have.key('hashTag');
          });
      });

      it("doesn't include hashTag if it was blank", function () {
        var attrs = {
          articleId: 'foo',
          kind: 'imagestream',
          hashTag: ''
        };
        var result = EmbedConfig.fromDataAttributes(attrs).parse();
        expect(result.config).to.not.have.key('hashTag');
      });

      it("removes leading hashes from hashTag", function () {
        var attrs = {
          articleId: 'foo',
          kind: 'imagestream',
          hashTag: '##foo'
        };
        var result = EmbedConfig.fromDataAttributes(attrs).parse();
        expect(result.config).to.have.key('hashTag');
        expect(result.config.hashTag).to.be('foo');
      });

      it("removes other special characters from hashTag", function () {
        var attrs = {
          articleId: 'foo',
          kind: 'imagestream',
          hashTag: '##f$o.o#'
        };
        var result = EmbedConfig.fromDataAttributes(attrs).parse();
        expect(result.config).to.have.key('hashTag');
        expect(result.config.hashTag).to.be('foo');
      });      
    })
  });
});