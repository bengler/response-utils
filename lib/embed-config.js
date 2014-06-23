var url = require("url");
var removeQueryParameter = require("./util/remove-query-parameter");

var KINDS = ['imagestream', 'conversation', 'question', 'procon'];
var STRIP_HASHTAG = /[^a-z0-9\-_æøå]/ig;

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

  EmbedConfig.toDataAttributes = function(config) {

    var attributes = {
      "data-sprig-component": 'response',
      "data-kind": config.kind,
      "data-title": config.title,
      "data-publication": config.publication,
      "data-article-id": config.article.id,
      "data-article-title": config.article.title,
      "data-article-url": config.article.url,
    };

    if ('likes' in config) {
      attributes["data-likes-kind"] = config.likes.kind;
      attributes["data-likes-verb"] = config.likes.verb;
    }

    if (config.kind === 'imagestream') {
      if ('hashTag' in config) {
        attributes["data-hash-tag"] = config.hashTag;
      }
      if ('sharing' in config) {
        attributes['data-enable-image-sharing'] = config.sharing.enableImageSharing;
        attributes['data-facebook-app-id'] = config.sharing.facebookAppId;
      }
    }
    return attributes;
  }

  EmbedConfig.toEmbedTagHTML = function(config) {
    var attrs = EmbedConfig.toDataAttributes(config);
    var serializedAttrs = Object.keys(attrs).map(function(attr) {return (("" + attr) + ("=" + (attrs[attr])) + "")}).join(" ");
    return (("<div " + serializedAttrs) + "></div>")
  }

  EmbedConfig.toTopicDocument = function(config) {
    var doc = {
      article_id: config.article.id,
      article_title: config.article.title,
      article_url: config.article.url,
      title: config.title,
      kind: config.kind,
      publication: config.publication
    };

    if (config.sharing) {
      doc.sharing = {
        enable_image_sharing: config.sharing.enableImageSharing,
      }
      if (config.sharing.facebook) {
        doc.sharing.facebook = {
          app_id: config.sharing.facebook.appId
        }
      }
    }
    if (config.likes) {
      doc.likes = {
        kind: config.likes.kind,
        verb: config.likes.verb
      }
    }
    if (config.kind === 'imagestream') {
      doc.hash_tag = config.hashTag;
    }
    return doc;
  }

  function EmbedConfig(config) {
    this.config = config;
  }

  EmbedConfig.prototype.parse = function() {
    var warnings = [];
    var errors = [];

    var config = this.config;
    var title = config.title, kind = config.kind, hashTag = config.hashTag, publication = config.publication, articleTitle = config.articleTitle, articleUrl = config.articleUrl, articleId = config.articleId, enableImageSharing = config.enableImageSharing, facebookAppId = config.facebookAppId, likesKind = config.likesKind, likesVerb = config.likesVerb;

    if (!articleTitle) {
      warning('article-title', 'Missing recommended attribute data-article-title. Falling back to page title');
      articleTitle = document.title;
    }

    if (!publication) {
      error('data-publication', 'Missing required attribute publication');
    }

    if (!kind) {
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

      if (!parsedArticleUrl || !parsedArticleUrl.protocol || !parsedArticleUrl.host) {
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
        publication: publication,
        article: {
          id: ''+articleId,
          title: articleTitle,
          url: removeQueryParameter(articleUrl, 'response_auth_trace')
        },
        sharing: {
          facebook: {}
        },
      },
      valid: errors.length == 0,
      warnings: warnings,
      errors: errors
    };

    if (likesKind || likesVerb) {
      result.config.likes = {
        kind: likesKind,
        verb: likesVerb
      };
    }

    if (kind === 'imagestream') {
      if (hashTag) {
        result.config.hashTag = hashTag
      }
      if (enableImageSharing) {
        result.config.sharing.enableImageSharing = true;
        if (!facebookAppId) {
          warning('facebook-app-id', ("Please provide a facebook app id when enabling image sharing"))
        }
        else {
          result.config.sharing.facebook.appId = facebookAppId
        }
      }
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
