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

  var dir = options._[0],
    po = options._[1],
    source,
    destination = new Gettext(),
    parser = new Parser(options.keyword),
    strings = {},
    gtDomain = null,
    gtContext = false;

  if (options['join-existing']) {
    source = new Gettext();
    source.addTextdomain(gtDomain, fs.readFileSync(po));
  }

  readdirp({root: dir}, function(err, res) {
    if (err) {
      throw err;
    }

    var template,
      relativePath;

    res.files.forEach(function (file) {
      template = fs.readFileSync(file.fullPath, options['from-code']);
      relativePath = file.path.split(path.sep).join('/');

      _.each(parser.parse(template), function (line, str) {
        strings[str] = strings[str] || {};
        strings[str][relativePath] = (strings[str][relativePath] || []).concat(line);
      });
    });

    destination.addTextdomain(gtDomain);

    function _test (memo, lines, file) {
      lines.forEach(function (line) {
        memo.push(file + ':' + line);
      });
      return memo;
    }

    for (var str in strings) {
      destination.setTranslation(gtDomain, gtContext, str, source ? source.gettext(str) : null);
      destination.setComment(gtDomain, gtContext, str, {code: _.reduce(strings[str], _test, []).join('\n')});
    }

    fs.writeFile(po, destination.compilePO(), callback);
  });
}

module.exports = parse;
