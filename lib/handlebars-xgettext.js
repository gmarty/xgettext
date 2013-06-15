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
    keys = Object.create(null),
    parser = new Parser(options.keyword);

  dir = dir.replace(/\/+$/, ''); // Remove trailing slash.

  readdirp({root: dir}, function(err, res) {
    if (err) {
      throw err;
    }

    var files = res.files.map(function (file) {
        return file.fullPath;
      }),
      newKeys,
      data;

    // We need to sort out files to keep the extracted strings order.
    files.sort();

    files.forEach(function (file) {
      data = fs.readFileSync(file, options['from-code']);

      newKeys = parser.parse(data);

      for (var i in newKeys) {
        keys[i] = newKeys[i];
      }
    });

    gettext.addTextdomain(null);

    for (var key in keys) {
      gettext.setTranslation(null, null, keys[key]);
    }

    fs.writeFile(dstFile, gettext.compilePO(), callback);
  });
}

module.exports = parse;
