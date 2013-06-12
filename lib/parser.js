var splitPattern = RegExp('\\{\\{(?:gettext|_) "', 'g');

/**
 * Given a Handlebars template returns the list of i18n strings.
 *
 * @param {string} data The content of a HBS template.
 * @param {RegEx} splitPattern The regex pattern to split the template string.
 * @return {Object.<string, string>} The list of all translatable strings.
 */
module.exports = parser = function(data) {
  var keys = Object.create(null),
      array = data.split(splitPattern);

  for (var i = 1, length = array.length; i < length; i++) {
    var line = array[i].split('');

    for (var j = 1, len = line.length; j < len; j++) {
      // Look for " but not for \".
      // \@todo Check if the previous slash is not escaped.
      if (line[j] == '"' && line[j - 1] != '\\') {
        break;
      }
    }

    line = line.slice(0, j).join('');
    // The value is a string ATM, but might be an array in the future.
    keys[line] = line;
  }

  return keys;
};

parser.setKeywords = function (keywords) {
  splitPattern = RegExp('\\{\\{(?:' + keywords.join('|') + ') "', 'g');
};
