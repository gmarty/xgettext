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
 * @param {string} template The content of a HBS template.
 * @return {Object.<string, array>} The list of translatable strings and the lines on which they appear.
 */
Parser.prototype.parse = function (template) {
  var result = {},
    newline = /\r?\n|\r/g,
    pattern = new RegExp('\\{\\{(?:' + this.keywords.join('|') + ') "((?:\\\\.|[^"\\\\])*)"\\}\\}', 'gm'),
    match;

  while ((match = pattern.exec(template)) !== null) {
    result[match[1]] = result[match[1]] || [];
    result[match[1]].push(template.substr(0, match.index).split(newline).length);
  }

  return result;
};

module.exports = Parser;
