# Response utils

A set of utitilties for response:

1. `topicUrl.fromConfig()` returns a topic url for a given response config
1. `EmbedTagParser` Parses a response embed tag and returns a config object.

## Response embed tag parser


## Response embed tag parser

Read and validate response embed config from different sources

### Example: Read an embed config from `data-attributes` of a DOM element

### Embed tag element

```html
<div data-kind="imagestream"
     data-hash-tag="#banan"
     data-title="Vis oss dine egne bananbilder!"
     data-article-id="1337"
     data-article-title="Jon (15) fant banan i fruktdisken"
     data-article-url="http://www.banan.no/article1337.ece"
  >
</div>
```

### Parse config from element

```javascript


var EmbedTag = require("response-util").EmbedTag;
// OR: var EmbedTag = require("response-util/embed-tag");

var embedTag = new EmbedTag.fromElement(element);

var result = embedTag.parse()

// result is now an object that looks like this:

{
  // The configuration read from the element
  config: {
    kind: 'imagestream',
    hashTag: 'banan',
    title: 'Vis oss dine egne bananbilder',
    article: {
      id: '1337',
      title: 'Jon (15) fant banan i fruktdisken',
      url: 'http://www.banan.no/article1337.ece'
    }
  }
  
  // Any errors that occurred while reading configuration. If this is not empty, the response embed 
  // can not be initialized
  errors: [],

  // Any warnings that occurred while reading configuration.
  // If this is not empty, the response embed can be intialized, but some configuration values are 
  // probably just guesses
  warnings: []
}

```

Errors are instances of the Error class, hand has an additional `attribute` property which refers to
the corresponding data-attribute that had the wrong value


## Development

### Getting started:

     $ npm install

### Build

Remember to build project before bumping version and pushing a new version

     $ npm run build

You can also watch source files and build project when a file changes with

     $ gulp watch

### Run tests

     $ npm test
