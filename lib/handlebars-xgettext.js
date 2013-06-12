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
    moment = require('moment'),
    _ = require('underscore'),
    parser = require('./parser');

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
  if (options === undefined ||
    (typeof options === 'string' && arguments.length < 2)) {
    throw new Error('Missing parameters');
  }

  // handle legacy arguments (dir, dstFile)
  if (typeof options === 'string') {
    // convert arguments to argv style options
    options = {
      _: Array.prototype.slice.call(arguments)
    };
  }

  options = _.extend({
    'from-code': 'utf8',
    'join-existing': false,
  }, options);

  var dir = options._[0],
      dstFile = options._[1],
      keys = Object.create(null),
      poContent = (options['join-existing'] ? '' : getHeader()) + '\n';

  if (options.keyword) {
    parser.setKeywords(options.keyword);
  }

  dir = dir.replace(/\/+$/, ''); // Remove trailing slash.

  readdirp({root: dir}, function(err, res) {
    if (err) throw err;

    files = res.files.map(function(file) {
      return file.fullPath;
    });

    // We need to sort out files to keep the extracted strings order.
    files.sort();

    files.forEach(function(file) {
      var data = fs.readFileSync(file, options['from-code']),
          i;

      newKeys = parser(data);
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
 * Generate a standard PO header.
 *
 * @return {String} A header for PO files.
 */
var getHeader = function() {
  var now = moment(),
    pkg = require('../package.json'),
    lines = [
      'msgid ""',
      'msgstr ""'
    ],
    settings = {
      'Report-Msgid-Bugs-To': '',
      'POT-Creation-Date': now.format('YYYY-MM-DD HH:mmZZ'),
      'PO-Revision-Date': '',
      'Last-Translator': '',
      'Language-Team': '',
      'Language': '',
      'MIME-Version': '1.0',
      'Content-Type': 'text/plain',
      'Content-Transfer-Encoding': '8bit',
      'X-Generator': pkg.name + ' ' + pkg.version
    };

  for (var key in settings) {
    lines.push('"' + key + ': ' + settings[key] + '\\n"');
  }

  // end with blank line
  lines.push('');

  return lines.join('\n');
};

module.exports = parse;
