/**
 * handlebars-xgettext
 * Extract translatable strings from Handlebars templates.
 */

var fs = require('fs'),
  path = require('path'),
  readdirp = require('readdirp'),
  _ = require('underscore'),
  Parser = require('./parser'),
  gt = require("gettext-parser");

/**
 * Parse input and save the i18n strings to a PO file.
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
    'from-code': 'utf8',
    'force-po': false
  }, options);

  var context = {},
    po;

  function parseFiles (files) {
    var parser = new Parser(options.keyword),
      strings = {},
      template,
      relativePath;

    function concat (memo, lines, file) {
      lines.forEach(function (line) {
        memo.push(file + ':' + line);
      });
      return memo;
    }

    files.forEach(function (file) {
      template = fs.readFileSync(path.resolve(file), options['from-code']);
      relativePath = file.split(path.sep).join('/');

      _.each(parser.parse(template), function (line, str) {
        strings[str] = strings[str] || {};
        strings[str][relativePath] = (strings[str][relativePath] || []).concat(line);
      });
    });

    for (var str in strings) {
      if (strings.hasOwnProperty(str)) {
        context[str] = {
          'msgid': str,
          'comments': {
            'reference': _.reduce(strings[str], concat, []).join('\n')
          }
        };
      }
    }
  }

  function output () {
    if (callback) {
      if (Object.keys(context).length > 0 || options['force-po']) {
        po = gt.po.compile({
          translations: {
            '': context
          }
        });

        if (options.output) {
          fs.writeFileSync(options.output, po);
        }
      }
      callback(po);
    }
  }

  if (options.directory) {
    readdirp({root: options.directory}, function(err, res) {
      if (err) {
        throw err;
      }

      parseFiles(res.files.map(function (file) {
        return file.fullPath;
      }));

      output();
    });
  } else {
    if (files) {
      parseFiles(files);
    }
    output();
  }
}

module.exports = parse;
