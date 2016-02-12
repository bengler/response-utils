'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global document */

var url = require('url');
var removeQueryParameter = require('./util/remove-query-parameter');

var KINDS = ['imagestream', 'conversation', 'question', 'procon'];
var STRIP_HASHTAG = /[^a-z0-9\-_æøå]/ig;

var EmbedConfig = function () {
  _createClass(EmbedConfig, null, [{
    key: 'normalizeHashTag',
    value: function normalizeHashTag(hashTag) {
      return hashTag.replace(STRIP_HASHTAG, '');
    }
  }, {
    key: 'fromDomNode',
    value: function fromDomNode(domNode) {
      var dattrs = require('./util/data-attrs');
      return EmbedConfig.fromDataAttributes(dattrs(domNode));
    }
  }, {
    key: 'fromDataAttributes',
    value: function fromDataAttributes(dataAttributes) {
      var autocast = require('./util/autocast');
      var data = autocast.object(dataAttributes);
      return new EmbedConfig(data);
    }
  }, {
    key: 'toDataAttributes',
    value: function toDataAttributes(config) {

      var attributes = {
        'data-sprig-component': 'response',
        'data-kind': config.kind,
        'data-title': config.title,
        'data-publication': config.publication,
        'data-article-id': config.article.id,
        'data-article-title': config.article.title,
        'data-article-url': config.article.url
      };

      if ('autoSubscribe' in config) {
        attributes['data-auto-subscribe'] = config.autoSubscribe;
      }

      if ('category' in config) {
        attributes['data-category'] = config.category;
      }

      if ('previewCount' in config) {
        attributes['data-preview-count'] = config.previewCount;
      }

      if ('likes' in config) {
        attributes['data-likes-kind'] = config.likes.kind;
        if ('label' in config.likes) {
          attributes['data-likes-label-default'] = config.likes.label.default;
          attributes['data-likes-label-given'] = config.likes.label.given;
        }
      }

      if (config.kind === 'imagestream') {
        if ('hashTag' in config) {
          attributes['data-hash-tag'] = config.hashTag;
        }
        if ('sharing' in config) {
          attributes['data-enable-image-sharing'] = config.sharing.enableImageSharing;
          attributes['data-facebook-app-id'] = config.sharing.facebookAppId;
        }
      }
      return attributes;
    }
  }, {
    key: 'toEmbedTagHTML',
    value: function toEmbedTagHTML(config) {
      var attrs = EmbedConfig.toDataAttributes(config);
      var serializedAttrs = Object.keys(attrs).map(function (attr) {
        return attr + '=' + attrs[attr];
      }).join(' ');
      return '<div ' + serializedAttrs + '></div>';
    }
  }, {
    key: 'toTopicDocument',
    value: function toTopicDocument(config) {
      var doc = {
        article_id: config.article.id, // eslint-disable-line camelcase
        article_title: config.article.title, // eslint-disable-line camelcase
        article_url: config.article.url, // eslint-disable-line camelcase
        title: config.title,
        kind: config.kind,
        publication: config.publication
      };

      if (config.sharing) {
        doc.sharing = {
          enable_image_sharing: config.sharing.enableImageSharing // eslint-disable-line camelcase
        };
        if (config.sharing.facebook) {
          doc.sharing.facebook = {
            app_id: config.sharing.facebook.appId // eslint-disable-line camelcase
          };
        }
      }
      if ('previewCount' in config) {
        doc.previewCount = config.previewCount;
      }
      if ('autoSubscribe' in config) {
        doc.auto_subscribe = config.autoSubscribe; // eslint-disable-line camelcase
      }
      if ('category' in config) {
        doc.category = config.category;
      }
      if (config.likes) {
        doc.likes = {
          kind: config.likes.kind,
          verb: config.likes.verb
        };
        if (config.likes.label) {
          doc.likes.label = {
            default: config.likes.label.default,
            given: config.likes.label.given
          };
        }
      }
      if (config.kind === 'imagestream') {
        doc.hash_tag = config.hashTag; // eslint-disable-line camelcase
      }
      return doc;
    }
  }]);

  function EmbedConfig(config) {
    _classCallCheck(this, EmbedConfig);

    this.config = config;
  }

  _createClass(EmbedConfig, [{
    key: 'parse',
    value: function parse() {
      var warnings = [];
      var errors = [];

      var config = this.config;
      var title = config.title;
      var kind = config.kind;
      var previewCount = config.previewCount;
      var publication = config.publication;
      var articleId = config.articleId;
      var enableImageSharing = config.enableImageSharing;
      var facebookAppId = config.facebookAppId;
      var likesKind = config.likesKind;
      var likesLabelDefault = config.likesLabelDefault;
      var likesLabelGiven = config.likesLabelGiven;
      var category = config.category;
      var articleTitle = config.articleTitle;
      var articleUrl = config.articleUrl;
      var hashTag = config.hashTag;
      var autoSubscribe = config.autoSubscribe;


      if (!articleTitle) {
        warning('article-title', 'Missing recommended attribute data-article-title. Falling back to page title');
        articleTitle = document.title;
      }

      if (!publication) {
        error('data-publication', 'Missing required attribute publication');
      }

      if (!kind) {
        error('kind', 'Missing required attribute data-kind');
      } else if (KINDS.indexOf(kind) === -1) {
        error('kind', 'Invalid response kind ' + JSON.stringify(kind) + ' Must be one of ' + KINDS.join(', '));
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

          warning('hash-tag', 'Found invalid characters in hashtag.\n          Hashtags can only contain alphanumeric characters or "-" and "_". Leading hashes is not needed.\n          HashTag will be normalized to: ' + hashTag + '.');
        }
      }

      if (articleUrl) {
        var parsedArticleUrl = undefined;
        try {
          parsedArticleUrl = url.parse(articleUrl, true, true);
        } catch (err) {} // eslint-disable-line no-empty

        if (!parsedArticleUrl || !parsedArticleUrl.protocol || !parsedArticleUrl.host) {
          warning('article-url', 'The specified article-url has an invalid value: \'' + articleUrl + '\'.\n        The article URL must be a fully qualified url (including http://).\n        Using current location (' + document.location.href + ') as fallback for now.');

          // Remove response_auth_trace from article url (if it is originating from document.location.href)
          articleUrl = document.location.href;
        }
      } else {
        warning('article-url', 'Missing attribute data-article-url The article URL must be a fully qualified url (including http://).\n        Using current location (' + document.location.href + ') as fallback for now.');
        articleUrl = document.location.href;
      }

      if (autoSubscribe) {
        autoSubscribe = autoSubscribe.replace(' ', '').split(',').filter(function (subscriber) {
          if (subscriber.indexOf('@') > 0 || /^\d+$/.test(subscriber)) {
            return true;
          }
          warning('autoSubscribe', 'Subscriber \'' + subscriber + '\' is neither a valid email address nor a valid ID.');
          return false;
        });
      }

      if (category) {
        if (category.indexOf(' ') > 0) {
          warning('category', 'Category \'' + category + '\' should not include a whitespace.');
        }
      }

      var result = {
        config: {
          kind: kind,
          title: title,
          publication: publication,
          article: {
            id: String(articleId),
            title: articleTitle,
            url: removeQueryParameter(articleUrl, 'response_auth_trace')
          },
          sharing: {
            facebook: {}
          },
          autoSubscribe: autoSubscribe,
          category: category
        },
        valid: errors.length == 0,
        warnings: warnings,
        errors: errors
      };

      if (previewCount || previewCount === 0) {
        result.config.previewCount = previewCount;
      }

      if (likesKind || likesLabelDefault || likesLabelGiven) {
        var likesCfg = result.config.likes = {};

        if (likesKind) {
          likesCfg.kind = likesKind;
        }
        if (likesLabelDefault || likesLabelGiven) {
          likesCfg.label = {
            default: likesLabelDefault,
            given: likesLabelGiven
          };
        }
      }

      if (kind === 'imagestream') {
        if (hashTag) {
          result.config.hashTag = hashTag;
        }
        if (enableImageSharing) {
          result.config.sharing.enableImageSharing = true;
          if (facebookAppId) {
            result.config.sharing.facebook.appId = facebookAppId;
          }
        }
      }

      return result;

      function warning(attribute, message) {
        warnings.push({ message: message, attribute: attribute });
      }

      function error(attribute, message) {
        var err = new Error(message);
        err.dataAttibute = attribute;
        errors.push(err);
      }
    }
  }]);

  return EmbedConfig;
}();

module.exports = EmbedConfig;