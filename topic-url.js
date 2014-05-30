
var querystring = require("querystring");
var url = require("url");
function fromConfig(config) {

  if (!config.publication) throw new Error("The response config object must have a `publication` property");
  if (!config.kind) throw new Error("The response config object must have a `kind` property");
  if (!config.article) throw new Error("The response config object must have a `article` property with an `id` property");
  if (!config.article.id) throw new Error("The response config.article object must have an `id` property");

  var qs = {
    title: config.title,
    article_url: config.article.url,
    article_title: config.article.title
  };

  if (config.hash_tag) {
    qs.hash_tag = config.hash_tag
  }
  return ['/topics',config.publication, config.kind, config.article.id].join("/")+'?'+querystring.stringify(qs)
}

module.exports = {
  // Takes a response configuration and returns the topic url for it
  fromConfig: fromConfig
};
