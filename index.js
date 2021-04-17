'use strict';

const fs = require('fs');
const path = require('path');
const gt = require('gettext-parser');
const async = require('async');
const createKeywordSpec = require('./src/keyword-spec');
const objectAssign = require('object-assign');

/**
 * Simple is object check.
 *
 * @param item
 * @returns {boolean}
 */
function isObject (item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 *
 * @param target
 * @param source
 */
function mergeDeep (target, source) {
  let dummy;

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
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
function xgettext (input, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  options = options || {};

  if (!input) {
    throw new Error('No input specified');
  }

  if (!options.language && typeof input === 'string') {
    throw new Error('Language is required');
  }

  options.output = options.output || 'messages.po';
  options.directory = options.directory || ['.'];
  options.keyword = options.keyword || [];
  options['from-code'] = options['from-code'] || 'utf8';
  options['force-po'] = options['force-po'] || false;
  options['join-existing'] = options['join-existing'] || false;
  options['sort-output'] = options['sort-output'] || false;

  if (typeof options.keyword === 'string' || typeof options.keyword === 'boolean') {
    options.keyword = [options.keyword];
  }

  if (typeof options.directory === 'string') {
    options.directory = [options.directory];
  }

  const parsers = {};
  const getParser = function (name, keywordSpec) {
    name = name.trim().toLowerCase();

    if (!parsers[name]) {
      const Parser = require(`gettext-${name}`);
      const combinedSpecs = {};

      if (Parser.keywordSpec && !keywordSpec.noDefaults) {
        Object.assign(combinedSpecs, Parser.keywordSpec, keywordSpec.spec);
      } else {
        Object.assign(combinedSpecs, keywordSpec.spec);
      }

      parsers[name] = new Parser(combinedSpecs);
    }

    return parsers[name];
  };

  const keywordSpec = createKeywordSpec(options.keyword);
  const translations = Object.create(null);

  const parseTemplate = function (parser, template, linePrefixer) {
    const strings = parser.parse(template);

    for (const key in strings) {
      if (Object.prototype.hasOwnProperty.call(strings, key)) {
        const msgctxt = strings[key].msgctxt || '';
        const context = translations[msgctxt] || (translations[msgctxt] = {});
        const msgid = strings[key].msgid || key;
        context[msgid] = context[msgid] || { msgid: msgid, comments: {} };

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

  const output = function () {
    if (cb) {
      if (Object.keys(translations).length > 0 || options['force-po']) {
        let existing = {};
        const writeToStdout = options.output === '-' || options.output === '/dev/stdout';

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

        const po = gt.po.compile({
          charset: options['from-code'],
          headers: {
            'content-type': `text/plain; charset=${options['from-code']}`
          },
          translations: translations
        }, { sort: options['sort-output'] });

        if (writeToStdout) {
          cb(po);
        } else {
          fs.writeFile(options.output, po, err => {
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
    parseTemplate(
      getParser(options.language, keywordSpec),
      input,
      line => `standard input:${line}`
    );

    output();
  } else {
    const addPath = path => line => `${path}:${line}`;

    if (options['files-from']) {
      input = fs.readFileSync(options['files-from'], options['from-code'])
        .split('\n')
        .filter(line => line.trim().length > 0);
    }

    const files = options.directory.reduce(
      (result, directory) => result.concat(input.map(
        file => path.join(directory, file.replace(/\\/g, path.sep))
      )),
      []
    );

    async.parallel(files.map(function (file) {
      return function (cb) {
        fs.readFile(path.resolve(file), options['from-code'], (err, res) => {
          if (err) {
            throw err;
          }

          const extension = path.extname(file);
          const language = options.language || xgettext.languages[extension];

          if (!language) {
            throw new Error(`No language specified for extension '${extension}'.`);
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
