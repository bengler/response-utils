module.exports = {
  valid: [
    {
      publication: "agurknytt",
      kind: 'imagestream',
      articleId: '2432332342',
      articleTitle: 'foo',
      articleUrl: 'http://foo.bar/baz'
    },
    {
      publication: "potetnytt",
      kind: 'conversation',
      articleId: '241.32332342'
    },
    {
      publication: "løknytt",
      kind: 'question',
      articleId: '2432332342'
    },
    {
      publication: "tomatnytt",
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