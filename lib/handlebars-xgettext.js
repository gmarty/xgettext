/**
 * handlebars-xgettext
 * Extract translatable strings from Handlebars templates.
 */

var fs = require('fs'),
  path = require('path'),
  readdirp = require('readdirp'),
  _ = require('underscore'),
  Parser = require('./parser'),
  Gettext = require('node-gettext');

/**
 * Parse the templates from a directory and save the i18n strings to a PO file.
 *
 * @param {Object} options A configuration object containing cli options.
 * @param {Function} callback An optional callback method.
 */
function parse(options, callback) {
  if (options === undefined ||
    (typeof options === 'string' && arguments.length < 2)) {
    throw new Error('Missing parameters');
  }

  // handle legacy arguments (dir, dstFile)
  if (typeof options === 'string') {
    // convert arguments to argv style options
    options = {
      _: [options, callback]
    };
  }

  options = _.extend({
    'from-code': 'utf8',
    'join-existing': false
  }, options);

  var gettext = new Gettext(),
    dir = options._[0],
    dstFile = options._[1],
    parser = new Parser(options.keyword),
    strings = {};

  dir = dir.replace(/\/+$/, ''); // Remove trailing slash.

  readdirp({root: dir}, function(err, res) {
    if (err) {
      throw err;
    }

    res.files.map(function (file) {
        return file.fullPath;
      })
      .forEach(function (file) {
        strings[path.relative(dir, file)] = parser.parse(fs.readFileSync(file, options['from-code']));
      });

    gettext.addTextdomain(null);

    for (var file in strings) {
      for (var str in strings[file]) {
        gettext.setTranslation(null, null, str);
        gettext.setComment(null, null, str, {
          code: file + ':' + strings[file][str]
        });
      }
    }

    fs.writeFile(dstFile, gettext.compilePO(), callback);
  });
}

module.exports = parse;
