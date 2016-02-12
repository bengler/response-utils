'use strict';

function fromConfig(config) {

  if (!config.publication) {
    throw new Error('The response config object must have a `publication` property');
  }
  if (!config.kind) {
    throw new Error('The response config object must have a `kind` property');
  }
  if (!config.article) {
    throw new Error('The response config object must have a `article` property with an `id` property');
  }
  if (!config.article.id) {
    throw new Error('The response config.article object must have an `id` property');
  }

  return ['', 'topics', config.publication, config.kind, config.article.id].map(encodeURIComponent).join('/');
}

module.exports = {
  // Takes a response configuration and returns the topic url for it
  fromConfig: fromConfig
};