/**
 * handlebars-xgettext
 * Extract translatable strings from Handlebars templates.
 *
 * \@todo Parse output PO file to look for duplicates with extracted strings.
 * \@todo Update API to be able to call from node files.
 * \@todo Check multilines strings.
 * \@todo Add source file, line number and comments.
 * \@todo Parse ngettext and other gettext functions (dgettext, npgettext...).
 * \@todo Use a parser/compiler (See https://github.com/duaneg/ajs-xgettext).
 * \@todo Handle mustache tpl as well? e.g. `{{#i}}Translatable string{{/i}}`
 */
var fs = require('fs'),
  readdirp = require('readdirp'),
  _ = require('underscore');

// Basic constants.
/** @const */
var line_start = 'msgid "';
/** @const */
var line_end = '"\nmsgstr ""\n\n';

/**
 * Parse the templates from a directory and save the i18n strings to a PO file.
 *
 * @param {Object} options A configuration object containing cli options.
 */
function parse(options) {
  options = _.extend({
      'from-code': 'utf8',
      'join-existing': false,
      'keyword': ['gettext', '_']
    }, options);

  var dir = options._[0] || options.dir,
    dstFile = options._[1] || options.dstFile,
    keys = Object.create(null),
    poContent = (options['join-existing'] ? '' : getHeader()) + '\n',
    splitPattern = RegExp('\\{\\{(?:' + options.keyword.join('|') + ') "', 'g');

  dir = dir.replace(/\/+$/, ''); // Remove trailing slash.

  readdirp({root: dir}, function (err, res) {
    if (err) throw err;

    files = res.files.map(function (file) {
      return file.fullPath;
    });

    // We need to sort out files to keep the extracted strings order.
    files.sort();

    files.forEach(function(file) {
      var data = fs.readFileSync(file, options['from-code']),
        i;

      newKeys = extract_i18n(data, splitPattern);
      for (i in newKeys) {
        keys[i] = newKeys[i];
      }
    });

    var i;
    for (i in keys) {
      poContent += line_start + keys[i] + line_end;
    }

    var streamOpt = {
        flags: options['join-existing'] ? 'a' : 'w',
        encoding: options['from-code']
      },
      stream = fs.createWriteStream(dstFile, streamOpt);

    stream.write(poContent);
  });
}

/**
 * Given a Handlebars template returns the list of i18n strings.
 *
 * @param {string} data The content of a HBS template.
 * @param {RegEx} splitPattern The regex pattern to split the template string.
 * @return {Object.<string, string>} The list of all translatable strings.
 */
var extract_i18n = function(data, splitPattern) {
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

/**
 * Generate a standard PO header.
 *
 * @return {String} A header for PO files.
 */
var getHeader = function() {
  var now = new Date();

  return [
    '# SOME DESCRIPTIVE TITLE.',
    "# Copyright (C) YEAR THE PACKAGE'S COPYRIGHT HOLDER",
    '# This file is distributed under the same license as the PACKAGE package.',
    '# FIRST AUTHOR <EMAIL@ADDRESS>, YEAR.',
    '#',
    '#, fuzzy',
    'msgid ""',
    'msgstr ""',
    '"Project-Id-Version: PACKAGE VERSION\\n"',
    '"Report-Msgid-Bugs-To: \\n"',
    '"POT-Creation-Date: ' +
        now.getFullYear() +
        '-' +
        (now.getMonth() + 1) +
        '-' +
        now.getDate() +
        ' ' +
        now.getHours() +
        ':' +
        now.getMinutes() +
        (now.getTimezoneOffset() > 0 ? '-' : '+') +
        (now.getTimezoneOffset() / -6 * 10) +
        '\\n"',
    '"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"',
    '"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"',
    '"Language-Team: LANGUAGE <LL@li.org>\\n"',
    '"Language: \\n"',
    '"MIME-Version: 1.0\\n"',
    '"Content-Type: text/plain; charset=CHARSET\\n"',
    '"Content-Transfer-Encoding: 8bit\\n"',
    '',
    ''
  ].join('\n');
};

module.exports = parse;
