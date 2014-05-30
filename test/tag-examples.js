module.exports = {
  valid: [
    {
      kind: 'imagestream',
      articleId: '2432332342',
      articleTitle: 'foo',
      articleUrl: 'http://foo.bar/baz'
    },
    {
      kind: 'conversation',
      articleId: '241.32332342'
    },
    {
      kind: 'question',
      articleId: '2432332342'
    },
    {
      kind: 'procon',
      articleId: '2432332342'
    }
  ],
  invalid: [
    {
      kind: '',
      articleId: '2432332342',
      articleTitle: 'foo',
      articleUrl: 'http://foo.bar/baz'
    },
    {
      kind: 'conversation',
      articleTitle: 'foo'
    },
    { /* Empty */ }

  ]
};