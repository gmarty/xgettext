var fs = require('fs'),
  path = require('path'),
  gt = require('gettext-parser'),
  async = require('async'),
  Keywordspec = require('./src/keywordspec');

/**
 * Parse input and save the i18n strings to a PO file.
 *
 * @param Array|String input Array of files to parse or input string
 * @param Object options Options
 * @param Function cb Callback
 */
function xgettext(input, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  options = options || {};

  if (!input) {
    throw 'No input specified';
  }

  if (!options.language && typeof input === 'string') {
    throw 'Language is required';
  }

  options['from-code'] = options['from-code'] || 'utf8';
  options['force-po'] = options['force-po'] || false;
  options.keyword = options.keyword || [];

  if (typeof options.keyword === 'string') {
    options.keyword = [options.keyword];
  }

  var parsers = {},
    getParser = function (name, spec) {
      name = name.trim().toLowerCase();

      if (!parsers[name]) {
        var Parser = require('gettext-' + name);

        parsers[name] = Object.keys(spec).length > 0 ? new Parser(spec) : new Parser();
      }

      return parsers[name];
    },
    spec = Keywordspec(options.keyword),
    context = {};

  var parseTemplate = function (parser, template, linePrefixer) {
    var strings = parser.parse(template);

    for (var msgid in strings) {
      if (strings.hasOwnProperty(msgid)) {
        context[msgid] = context[msgid] || {msgid: msgid, comments: {}};

        if (strings[msgid].plural) {
          context[msgid].msgid_plural = context[msgid].msgid_plural || strings[msgid].plural;
          context[msgid].msgstr = ['', ''];
        }

        if (!options['no-location']) {
          context[msgid].comments.reference = (context[msgid].comments.reference || '')
            .split('\n')
            .concat(strings[msgid].line.map(linePrefixer))
            .join('\n')
            .trim('\n');
        }
      }
    }
  };

  var output = function () {
    if (cb) {
      if (Object.keys(context).length > 0 || options['force-po']) {
        var po = gt.po.compile({
          charset: options['from-code'],
          headers: {
            'content-type': 'text/plain; charset=' + options['from-code']
          },
          translations: {
            '': context
          }
        });

        if (options.output) {
          fs.writeFile(options.output, po, function (err) {
            if (err) {
              throw err;
            }

            cb(po);
          });
        } else {
          cb(po);
        }
      } else {
        cb();
      }
    }
  };

  if (typeof input === 'string') {
    parseTemplate(getParser(options.language, spec), input, function (line) {
      return 'standard input:' + line;
    });

    output();
  } else {
    var addPath = function (path) {
      return function (line) {
        return path + ':' + line;
      };
    };

    var files = (options.directory || ['.']).reduce(function (result, directory) {
      return result.concat(input.map(function (file) {
        return path.join(directory, file);
      }));
    }, []);

    async.parallel(files.map(function (file) {
      return function (cb) {
        fs.readFile(path.resolve(file), options['from-code'], function (err, res) {
          if (err) {
            throw err;
          }

          var extension = path.extname(file),
            language = options.language || xgettext.languages[extension];

          if (!language) {
            throw 'No language specified for extension \'' + extension + '\'.';
          }

          parseTemplate(getParser(language, spec), res, addPath(file.replace(/\\/, '/')));

          cb();
        });
      };
    }), output);
  }
}

xgettext.languages = {
  '.hbs': 'Handlebars',
  '.swig': 'Swig',
  '.volt': 'Volt',
  '.ejs': 'EJS'
};

module.exports = xgettext;
