var fs = require('fs'),
  path = require('path'),
  readdirp = require('readdirp'),
  Parser = require('./parser'),
  gt = require("gettext-parser");

/**
 * Parse input and save the i18n strings to a PO file.
 *
 * @param Array|String input Array of files to parse or input string
 * @param Object options
 * @param Function callback
 */
function parse(input, options, callback) {
  options = options || {};

  if (!input && !options.directory && !options['files-from']) {
    throw 'No input specified';
  }

  options['from-code'] = options['from-code'] || 'utf8';
  options['force-po'] = options['force-po'] || false;

  var context = {},
    po;

  function parseFiles (files) {
    var parser = new Parser(options.keyword),
      strings,
      template,
      relativePath;

    function addPath (path) {
      return function addLine (line) {
        return path + ':' + line;
      };
    }

    files.forEach(function (file) {
      template = fs.readFileSync(path.resolve(file), options['from-code']);
      relativePath = file.split(path.sep).join('/');
      strings = parser.parse(template);

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
              .concat(strings[msgid].line.map(addPath(relativePath)))
              .join('\n')
              .trim('\n');
          }
        }
      }
    });
  }

  function parseTemplate (template) {
    var parser = new Parser(options.keyword),
      strings;

    function prefixLine (line) {
      return 'standard input:' + line;
    }

    strings = parser.parse(template);

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
            .concat(strings[msgid].line.map(prefixLine))
            .join('\n')
            .trim('\n');
        }
      }
    }
  }

  function output () {
    if (callback) {
      if (Object.keys(context).length > 0 || options['force-po']) {
        po = gt.po.compile({
          charset: options['from-code'],
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
    if (typeof input === 'string') {
      parseTemplate(input);
    } else {
      parseFiles(input);
    }
    output();
  }
}

module.exports = parse;
