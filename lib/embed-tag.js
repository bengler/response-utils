var url = require("url");
var removeQueryParameter = require("./util/remove-query-parameter");

var KINDS = ['imagestream', 'conversation', 'question', 'procon'];
var STRIP_HASHTAG = /[^a-z0-9\-_æøå]/g;

var EmbedConfig = (function(){
  
  EmbedConfig.fromDomNode = function(domNode) {
    var dattrs = require("./util/data-attrs");
    return EmbedConfig.fromDataAttributes(dattrs(domNode));
  }

  EmbedConfig.fromDataAttributes = function(dataAttributes) {
    var autocast = require("./util/autocast");
    var data = autocast.object(dataAttributes);
    return new EmbedConfig(data);
  }

  function EmbedConfig(config) {
    this.config = config;
  }

  EmbedConfig.prototype.parse = function() {
    var warnings = [];
    var errors = [];

    var config = this.config;
    var title = config.title, kind = config.kind, hashTag = config.hashTag, articleTitle = config.articleTitle, articleUrl = config.articleUrl, articleId = config.articleId;

    if (!articleTitle) {
      warning('article-title', 'Missing recommended attribute data-article-title. Falling back to page title');
      articleTitle = document.title;
    }

    if (!config.kind) {
      error('kind', 'Missing required attribute data-kind');
    }
    else if (KINDS.indexOf(kind) === -1) {
      error('kind', (("Invalid response kind " + (JSON.stringify(kind))) + (" Must be one of " + (KINDS.join(", "))) + ""));
    }

    if (!articleId) {
      error('article-id', 'Missing required attribute data-article-id');
    }

    if (!title) {
      warning('title', 'Missing title');
    }

    if (kind !== 'imagestream' && hashTag) {
      warning('hash-tag', 'Hash tag given on non-imagestream response type');
    }

    if (kind === 'imagestream') {
      if (STRIP_HASHTAG.test(hashTag)) {
        hashTag = hashTag.replace(STRIP_HASHTAG, '');

        warning('hash-tag', (("Found invalid characters in hashtag.\
\n          Hashtags can only contain alphanumeric characters or \"-\" and \"_\". Leading hashes is not needed.\
\n          HashTag will be normalized to: " + hashTag) + "."));
        
      }
      warning('hash-tag', 'Hash tag given on non-imagestream response type');
    }

    if (!articleUrl) {
      warning('article-url', (("Missing attribute data-article-url The article URL must be a fully qualified url (including http://).\
\n        Using current location (" + (document.location.href)) + ") as fallback for now."));
      articleUrl = document.location.href;
    }
    else {
      var parsedArticleUrl;
      try {
        parsedArticleUrl = url.parse(articleUrl, true, true);
      }
      catch (e) {
      }

      if (!parsedArticleUrl || !parsedArticleUrl.protocol || parsedArticleUrl.host) {
        warning('article-url', (("The specified article-url has an invalid value: '" + articleUrl) + ("'.\
\n        The article URL must be a fully qualified url (including http://).\
\n        Using current location (" + (document.location.href)) + ") as fallback for now."));

        // Remove response_auth_trace from article url (if it is originating from document.location.href)
        articleUrl = document.location.href;
      }

    }

    var result = {
      config: {
        kind: kind,
        title: title,
        article: {
          id: ''+articleId,
          title: articleTitle,
          url: removeQueryParameter(articleUrl, 'response_auth_trace')
        }
      },
      valid: errors.length == 0,
      warnings: warnings,
      errors: errors
    };

    if (kind === 'imagestream' && hashTag) {
      result.config.hashTag = hashTag
    }

    return result;

    function warning(attribute, message) {
      warnings.push({message: message, attribute: attribute});
    }

    function error(attribute, message) {
      var e = new Error(message);
      e.dataAttibute = attribute;
      errors.push(e);
    }
  }
;return EmbedConfig;})();

module.exports = EmbedConfig;
