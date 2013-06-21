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
 * Parse input for  save the i18n strings to a PO file.
 *
 * @param {Array} files (optional)
 * @param {Object} options (optional)
 * @param {Function(Buffer)} callback (optional)
 */
function parse(files, options, callback) {
  if (!files && !options.directory && !options['files-from']) {
    throw 'No input specified';
  }

  if (typeof files === 'string') {
    files = [files];
  }

  options = _.extend({
    'from-code': 'utf8'
  }, options);

  function parseFiles (files) {
    var gt = new Gettext(),
      parser = new Parser(options.keyword),
      strings = {},
      gtDomain = null,
      gtContext = false,
      template,
      relativePath;

    files.forEach(function (file) {
      template = fs.readFileSync(path.resolve(file), options['from-code']);
      relativePath = file.split(path.sep).join('/');

      _.each(parser.parse(template), function (line, str) {
        strings[str] = strings[str] || {};
        strings[str][relativePath] = (strings[str][relativePath] || []).concat(line);
      });
    });

    gt.addTextdomain(gtDomain);

    function concat (memo, lines, file) {
      lines.forEach(function (line) {
        memo.push(file + ':' + line);
      });
      return memo;
    }

    for (var str in strings) {
      gt.setTranslation(gtDomain, gtContext, str, null);
      gt.setComment(gtDomain, gtContext, str, {code: _.reduce(strings[str], concat, []).join('\n')});
    }

    var po = gt.compilePO();

    if (options.output) {
      fs.writeFileSync(options.output, po);
    }

    if (callback) {
      callback(po);
    }
  }

  if (files) {
    parseFiles(files);
  }

  if (options.directory) {
    readdirp({root: options.directory}, function(err, res) {
      if (err) {
        throw err;
      }
      parseFiles(res.files.map(function (file) {
        return file.fullPath;
      }));
    });
  }
}

module.exports = parse;
