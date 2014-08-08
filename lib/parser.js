var newline = /\r?\n|\r/g,
  escapeRegExp = function (string) {
      // source: https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
      return string.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
    },
  trimQuotes = function (str) {
      return str.replace(/^['"]/g, '').replace(/['"]$/g, '');
    };

/**
 * Constructor
 */
function Parser (keywords) {
  if (!keywords) {
    keywords = ['_', 'gettext', 'ngettext:1,2'];
  }

  if (typeof keywords === 'string') {
    keywords = [keywords];
  }

  var parts,
    specPattern = /([^:]+)(?::(\d)(?:,(\d))?)?/,
    indexify = function (idx) {
        return parseInt(idx, 10) - 1;
      };

  this.keywords = keywords.reduce(function (result, keyword) {
      parts = keyword.match(specPattern);

      result[parts[1]] = [parts[2] ? indexify(parts[2]) : 0];

      if (parts[3]) {
        result[parts[1]].push(indexify(parts[3]));
      }

      return result;
    }, {});

  this.expressionPattern = new RegExp([
    '\\{\\{ *',
    '(' + Object.keys(this.keywords).map(escapeRegExp).join('|') + ')',
    ' ([^\\}\\}]*)',
    ' *\\}\\}'
    ].join(''), 'g');

  this.paramPattern = new RegExp('([\'"][^\'"]*[\'"]|[^\'" ]+)', 'g');
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
    keywords = this.keywords,
    keyword,
    params,
    msgid;

  while ((match = this.expressionPattern.exec(template)) !== null) {
    keyword = match[1];
    params = match[2].match(this.paramPattern).map(trimQuotes);

    msgid = params[keywords[keyword][0]];

    result[msgid] = result[msgid] || {line: []};
    result[msgid].line.push(template.substr(0, match.index).split(newline).length);

    if (keywords[keyword].length > 1) {
      result[msgid].plural = result[msgid].plural || params[keywords[keyword][1]];
    }
  }

  return result;
};

module.exports = Parser;
