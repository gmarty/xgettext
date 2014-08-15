var newline = /\r?\n|\r/g,
  escapeRegExp = function (string) {
      // source: https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
      return string.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
    },
  trimQuotes = function (str) {
      return str.replace(/^['"]/g, '').replace(/['"]$/g, '');
    },
  paramPattern = new RegExp('([\'"][^\'"]*[\'"]|[^\'" ]+)', 'g');

/**
 * Constructor
 * @param Object keywordSpec An object with keywords as keys and parameter indexes as values
 */
function Parser (keywordSpec) {
  keywordSpec = keywordSpec || {
      _: [0],
      gettext: [0],
      ngettext: [0, 1]
    };

  if (typeof keywordSpec !== 'object') {
    throw 'Invalid keyword spec';
  }

  this.keywordSpec = keywordSpec;

  this.expressionPattern = new RegExp([
    '\\{\\{ *',
    '(' + Object.keys(this.keywordSpec).map(escapeRegExp).join('|') + ')',
    ' ([^\\}\\}]*)',
    ' *\\}\\}'
    ].join(''), 'g');
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
    keyword,
    params,
    msgid;

  while ((match = this.expressionPattern.exec(template)) !== null) {
    keyword = match[1];
    params = match[2].match(paramPattern).map(trimQuotes);

    msgid = params[this.keywordSpec[keyword][0]];

    result[msgid] = result[msgid] || {line: []};
    result[msgid].line.push(template.substr(0, match.index).split(newline).length);

    if (this.keywordSpec[keyword].length > 1) {
      result[msgid].plural = result[msgid].plural || params[this.keywordSpec[keyword][1]];
    }
  }

  return result;
};

module.exports = Parser;
