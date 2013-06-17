/**
 * Constructor
 */
function Parser(keywords) {
  if (!keywords) {
    keywords = ['gettext', '_'];
  }

  if (typeof keywords === 'string') {
    keywords = [keywords];
  }

  this.keywords = keywords;
}

/**
 * Given a Handlebars template string returns the list of i18n strings.
 *
 * @param {string} data The content of a HBS template.
 * @return {Object.<string, string>} The list of all translatable strings.
 */
Parser.prototype.parse = function (template) {
  var result = {},
    newline = /\r?\n|\r/g,
    pattern = new RegExp('\\{\\{(?:' + this.keywords.join('|') + ') "((?:\\\\.|[^"\\\\])*)"\\}\\}', 'gm'),
    match;

  while ((match = pattern.exec(template)) !== null) {
    result[RegExp.$1] = template.substr(0, match.index).match(newline).length + 1;
  }

  return result;
};

module.exports = Parser;
