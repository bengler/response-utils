const url = require("url");
const removeQueryParameter = require("./util/remove-query-parameter");

const KINDS = ['imagestream', 'conversation', 'question', 'procon'];
const STRIP_HASHTAG = /[^a-z0-9\-_æøå]/g;

class EmbedConfig {
  
  static fromDomNode(domNode) {
    const dattrs = require("./util/data-attrs");
    return EmbedConfig.fromDataAttributes(dattrs(domNode));
  }

  static fromDataAttributes(dataAttributes) {
    const autocast = require("./util/autocast");
    let data = autocast.object(dataAttributes);
    return new EmbedConfig(data);
  }

  static toDataAttributes(config) {
    
    var attributes = {
      "data-sprig-component": 'response',
      "data-kind": config.kind,
      "data-title": config.title,
      "data-publication": config.publication,
      "data-article-id": config.article.id,
      "data-article-title": config.article.title,
      "data-article-url": config.article.url
    };

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

  static toEmbedTagHTML(config) {
    var attrs = EmbedConfig.toDataAttributes(config);
    var serializedAttrs = Object.keys(attrs).map((attr)=> `${attr}=${attrs[attr]}`).join(" ");
    return `<div ${serializedAttrs}></div>`
  } 
  
  static toTopicDocument(config) {
    var doc = {
      article_id: config.article.id,
      article_title: config.article.title,
      article_url: config.article.url,
      title: config.title,
      kind: config.kind,
      publication: config.publication,
      sharing: config.sharing || {}
    };
    if (config.kind === 'imagestream') {
      doc.hash_tag = config.hashTag;
    }
    return doc;
  } 
  
  constructor(config) {
    this.config = config;
  }

  parse() {
    let warnings = [];
    let errors = [];

    let config = this.config;
    let {
      title,
      kind,
      hashTag,
      publication,
      articleTitle,
      articleUrl,
      articleId,
      enableImageSharing,
      facebookAppId,
    } = config;

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
      error('kind', `Invalid response kind ${JSON.stringify(kind)} Must be one of ${KINDS.join(", ")}`);
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

        warning('hash-tag', `Found invalid characters in hashtag.
          Hashtags can only contain alphanumeric characters or "-" and "_". Leading hashes is not needed.
          HashTag will be normalized to: ${hashTag}.`);        
      }
    }

    if (!articleUrl) {
      warning('article-url', `Missing attribute data-article-url The article URL must be a fully qualified url (including http://).
        Using current location (${document.location.href}) as fallback for now.`);
      articleUrl = document.location.href;
    }
    else {
      let parsedArticleUrl;
      try {
        parsedArticleUrl = url.parse(articleUrl, true, true);
      }
      catch (e) {
      }

      if (!parsedArticleUrl || !parsedArticleUrl.protocol || !parsedArticleUrl.host) {
        warning('article-url', `The specified article-url has an invalid value: '${articleUrl}'.
        The article URL must be a fully qualified url (including http://).
        Using current location (${document.location.href}) as fallback for now.`);

        // Remove response_auth_trace from article url (if it is originating from document.location.href)
        articleUrl = document.location.href;
      }

    }

    let result = {
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
        }
      },
      valid: errors.length == 0,
      warnings: warnings,
      errors: errors
    };

    if (kind === 'imagestream') {
      if (hashTag) {
        result.config.hashTag = hashTag
      }
      if (enableImageSharing) {
        result.config.sharing.enableImageSharing = true;
        if (!facebookAppId) {
          warning('facebook-app-id', `Please provide a facebook app id when enabling image sharing`)
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
      let e = new Error(message);
      e.dataAttibute = attribute;
      errors.push(e);
    }
  }
}

module.exports = EmbedConfig;