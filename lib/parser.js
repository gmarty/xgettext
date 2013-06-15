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
Parser.prototype.parse = function (data) {
  var keys = Object.create(null),
    splitPattern = new RegExp('\\{\\{(?:' + this.keywords.join('|') + ') "', 'g'),
    array = data.split(splitPattern);

  for (var i = 1, length = array.length; i < length; i++) {
    var line = array[i].split('');

    for (var j = 1, len = line.length; j < len; j++) {
      // Look for " but not for \".
      // \@todo Check if the previous slash is not escaped.
      if (line[j] === '"' && line[j - 1] !== '\\') {
        break;
      }
    }

    line = line.slice(0, j).join('');
    // The value is a string ATM, but might be an array in the future.
    keys[line] = line;
  }

  return keys;
};

module.exports = Parser;
