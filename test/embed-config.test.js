const EmbedConfig = require('..').EmbedConfig
const expect = require('expect.js')

global.document = {
  title: 'Foo title',
  location: {
    href: 'http://foo.bar/baz'
  }
}

const examples = require('./tag-examples')

describe('EmbedConfig', () => {

  describe('parse()', () => {
    it('valid dataAttributes is valid', () => {
      examples.valid.forEach(dataAttrs => {
        const config = EmbedConfig.fromDataAttributes(dataAttrs)
        const result = config.parse()
        if (!result.valid) {
          console.log(dataAttrs, result)
        }

        expect(result.valid).to.be(true)
      })
    })

    it('invalid dataAttributes are invalid', () => {
      examples.invalid.forEach(dataAttrs => {
        const config = EmbedConfig.fromDataAttributes(dataAttrs)
        const result = config.parse()
        expect(result.valid).not.to.be(true)
      })
    })

    it('guesses sane defaults and recovers from common misconfigurations', () => {
      const result = EmbedConfig.fromDataAttributes({
        articleId: 'foo',
        kind: 'conversation'
      }).parse()

      expect(result.config.article.title).to.be(document.title)
      expect(result.config.article.url).to.be(document.location.href)

    })

    describe('autoSubscribe', () => {
      it('should allow email addresses in the autoSubscribe field', () => {
        const result = EmbedConfig.fromDataAttributes({
          kind: 'conversation',
          autoSubscribe: 'line@example.com,lars@example.com'
        }).parse()
        expect(result.config.autoSubscribe).to.be.an(Array)
        expect(result.config.autoSubscribe.length).to.be(2)
        expect(result.config.autoSubscribe).to.contain('line@example.com')
        expect(result.config.autoSubscribe).to.contain('lars@example.com')
      })

      it('should allow IDs in the autoSubscribe field', () => {
        const result = EmbedConfig.fromDataAttributes({
          kind: 'conversation',
          autoSubscribe: 'line@example.com,234'
        }).parse()
        expect(result.config.autoSubscribe.length).to.be(2)
        expect(result.config.autoSubscribe).to.contain('line@example.com')
        expect(result.config.autoSubscribe).to.contain('234')
      })

      it('should remove messed up content in the autoSubscribe field', () => {
        const result = EmbedConfig.fromDataAttributes({
          kind: 'conversation',
          autoSubscribe: 'line@example.com,lars.example.com,busegutten'
        }).parse()
        expect(result.config.autoSubscribe.length).to.be(1)
        expect(result.config.autoSubscribe).to.contain('line@example.com')
      })
    })

    describe('category', () => {
      it('should allow a string in the category field', () => {
        const result = EmbedConfig.fromDataAttributes({kind: 'procon', category: 'opinion'}).parse()
        expect(result.config.category).to.be('opinion')
      })
    })

    describe('articleId', () => {
      it('should allow strings as IDs', () => {
        const result = EmbedConfig.fromDataAttributes({kind: 'conversation', articleId: 'foobar'}).parse()
        expect(result.config.article.id).to.be('foobar')
      })

      it('should parse ID to string even if it looks like a number', () => {
        const result = EmbedConfig.fromDataAttributes({kind: 'conversation', articleId: '12345'}).parse()
        expect(result.config.article.id).to.be.a('string')
      })

      it('should parse ID to string even if it looks like a number', () => {
        const result = EmbedConfig.fromDataAttributes({
          kind: 'conversation', articleId: '23.49238923893289238492384983212345'
        }).parse()
        expect(result.config.article.id).to.be.a('string')
      })
    })

    describe('articleUrl', () => {
      it('removes any auth_trace parameter from url', () => {
        // Note: The response_auth_trace parameter is added by a workaround for an issue w/window.open not working in
        // ios webviews and used to keep track of what action the user might was doing when she left the page.
        const attrs = {
          articleId: 'foo',
          kind: 'conversation',
          articleUrl: 'http://foo.bar?response_auth_trace=34892'
        }
        const result = EmbedConfig.fromDataAttributes(attrs).parse()
        expect(result.config.article.url).not.to.contain('response_auth_trace')
      })
    })

    describe('hashTag', () => {
      it('returns hashTag for imagestreams only', () => {
        ['conversation', 'procon', 'question']
          .map(kind => {
            return {
              articleId: 'foo',
              kind: kind,
              hashTag: 'Foo'
            }
          })
          .forEach(attrs => {
            const result = EmbedConfig.fromDataAttributes(attrs).parse()
            expect(result.config).to.not.have.key('hashTag')
          })
      })

      it("doesn't include hashTag if it was blank", () => {
        const attrs = {
          articleId: 'foo',
          kind: 'imagestream',
          hashTag: ''
        }
        const result = EmbedConfig.fromDataAttributes(attrs).parse()
        expect(result.config).to.not.have.key('hashTag')
      })

      it('removes leading hashes from hashTag', () => {
        const attrs = {
          articleId: 'foo',
          kind: 'imagestream',
          hashTag: '##foo'
        }
        const result = EmbedConfig.fromDataAttributes(attrs).parse()
        expect(result.config).to.have.key('hashTag')
        expect(result.config.hashTag).to.be('foo')
      })

      it('removes other special characters from hashTag', () => {
        const attrs = {
          articleId: 'foo',
          kind: 'imagestream',
          hashTag: '##f$o.o#'
        }
        const result = EmbedConfig.fromDataAttributes(attrs).parse()
        expect(result.config).to.have.key('hashTag')
        expect(result.config.hashTag).to.be('foo')
      })
      it('passes through the previewCount option', () => {
        const attrs = {
          articleId: 'foo',
          kind: 'imagestream',
          previewCount: 2
        }
        const result = EmbedConfig.fromDataAttributes(attrs).parse()
        expect(result.config.previewCount).to.be(2)
      })
    })
  })
})
