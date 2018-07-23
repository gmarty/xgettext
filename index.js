'use strict';

var fs = require('fs');
var path = require('path');
var gt = require('gettext-parser');
var async = require('async');
var createKeywordSpec = require('./src/keyword-spec');
var objectAssign = require('object-assign');

/**
 * Simple is object check.
 *
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 *
 * @param target
 * @param source
 */
function mergeDeep(target, source) {
  var dummy;

  if (isObject(target) && isObject(source)) {
    for (var key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          dummy = {};
          dummy[key] = {};
          objectAssign(target, dummy);
        }
        mergeDeep(target[key], source[key]);
      } else {
        dummy = {};
        dummy[key] = source[key];
        objectAssign(target, dummy);
      }
    }
  }
  return target;
}

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

  options['output'] = options['output'] || 'messages.po';
  options.directory = options.directory || ['.'];
  options.keyword = options.keyword || [];
  options['from-code'] = options['from-code'] || 'utf8';
  options['force-po'] = options['force-po'] || false;
  options['join-existing'] = options['join-existing'] || false;

  if (typeof options.keyword === 'string') {
    options.keyword = [options.keyword];
  }

  if (typeof options.directory === 'string') {
    options.directory = [options.directory];
  }

  var parsers = {};
  var getParser = function (name, keywordSpec) {
    name = name.trim().toLowerCase();

    if (!parsers[name]) {
      var Parser = require('gettext-' + name);

      if (Object.keys(keywordSpec).length > 0) {
        parsers[name] = new Parser(keywordSpec);
      } else if (Parser.keywordSpec) {
        parsers[name] = new Parser(Parser.keywordSpec);
      } else {
        parsers[name] = new Parser();
      }
    }

    return parsers[name];
  };

  var keywordSpec = createKeywordSpec(options.keyword);
  var translations = Object.create(null);

  var parseTemplate = function (parser, template, linePrefixer) {
    var strings = parser.parse(template);

    for (var key in strings) {
      if (strings.hasOwnProperty(key)) {
        var msgctxt = strings[key].msgctxt || '';
        var context = translations[msgctxt] || (translations[msgctxt] = {});
        var msgid = strings[key].msgid || key;
        context[msgid] = context[msgid] || {msgid: msgid, comments: {}};

        if (msgctxt) {
          context[msgid].msgctxt = strings[key].msgctxt;
        }

        if (strings[key].plural) {
          context[msgid].msgid_plural = context[msgid].msgid_plural || strings[key].plural;
          context[msgid].msgstr = ['', ''];
        }

        if (!options['no-location']) {
          context[msgid].comments.reference = (context[msgid].comments.reference || '')
            .split('\n')
            .concat(strings[key].line.map(linePrefixer))
            .join('\n')
            .trim('\n');
        }
      }
    }
  };

  var output = function () {
    if (cb) {
      if (Object.keys(translations).length > 0 || options['force-po']) {
        var existing = {};
        var writeToStdout = options.output === '-' || options.output === '/dev/stdout';

        if (!writeToStdout && options['join-existing']) {
          try {
            fs.accessSync(options.output, fs.F_OK);
            existing = gt.po.parse(fs.readFileSync(options.output, {
              encoding: options['from-code']
            }));
          } catch (e) {
            // ignore non-existing file
          }

          mergeDeep(translations, existing.translations);
        }

        var po = gt.po.compile({
          charset: options['from-code'],
          headers: {
            'content-type': 'text/plain; charset=' + options['from-code']
          },
          translations: translations
        });

        if (writeToStdout) {
          cb(po);
        } else {
          fs.writeFile(options.output, po, function (err) {
            if (err) {
              throw err;
            }

            cb(po);
          });
        }
      } else {
        cb();
      }
    }
  };

  if (typeof input === 'string') {
    parseTemplate(getParser(options.language, keywordSpec), input, function (line) {
      return 'standard input:' + line;
    });

    output();
  } else {
    var addPath = function (path) {
      return function (line) {
        return path + ':' + line;
      };
    };

    if (options['files-from']) {
      input = fs.readFileSync(options['files-from'], options['from-code'])
        .split('\n')
        .filter(function (line) {
          return line.trim().length > 0;
        });
    }

    var files = options.directory.reduce(function (result, directory) {
      return result.concat(input.map(function (file) {
        return path.join(directory, file.replace(/\\/g, path.sep));
      }));
    }, []);

    async.parallel(files.map(function (file) {
      return function (cb) {
        fs.readFile(path.resolve(file), options['from-code'], function (err, res) {
          if (err) {
            throw err;
          }

          var extension = path.extname(file);
          var language = options.language || xgettext.languages[extension];

          if (!language) {
            throw 'No language specified for extension \'' + extension + '\'.';
          }

          parseTemplate(getParser(language, keywordSpec), res, addPath(file.replace(/\\/g, '/')));

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
  '.ejs': 'EJS',
  '.njk': 'Nunjucks'
};

module.exports = xgettext;
