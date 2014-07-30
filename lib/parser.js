var newline = /\r?\n|\r/g;

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

  this.pattern = new RegExp('\\{\\{(?:' + keywords.join('|') + ') [\'"]((?:\\\\.|[^\'"\\\\])*)[\'"](?: [\'"]((?:\\\\.|[^\'"\\\\])*)[\'"] \\w+)? ?\\}\\}', 'gm');
}

/**
 * Given a Handlebars template string returns the list of i18n strings.
 *
 * @param String template The content of a HBS template.
 * @return Object The list of translatable strings, the line(s) on which each appears and an optional plural form.
 */
Parser.prototype.parse = function (template) {
  var result = {},
    match,
    msg;

  while ((match = this.pattern.exec(template)) !== null) {
    msg = result[match[1]] = result[match[1]] || {};

    if (match[2]) {
      msg.plural = msg.plural || match[2];
    }
    msg.line = msg.line || [];
    msg.line.push(template.substr(0, match.index).split(newline).length);
  }

  return result;
};

module.exports = Parser;
