var Parser = require('../lib/parser'),
  fs = require('fs');

exports.parser = {
  'constructor': function (test) {
    var parser;

    parser = new Parser();
    test.equal(typeof parser.keywords, 'object', 'Keywords have not been set');

    parser = new Parser('gettext:1');
    test.equal(typeof parser.keywords, 'object', 'Keywords have not been set');
    test.ok(parser.keywords.gettext, 'Keywords have not been set');

    parser = new Parser(['ngettext:1,3']);
    test.equal(typeof parser.keywords, 'object', 'Keywords have not been set');
    test.equal(parser.keywords.ngettext.length, 2, 'Spec parameter has not been parsed');

    parser = new Parser(['i18n', 'ngettext:1,3']);
    test.equal(typeof parser.keywords, 'object', 'Keywords have not been set');
    test.ok(parser.keywords.i18n && parser.keywords.ngettext, 'Keywords have not been set');

    test.done();
  },
  'default': function (test) {
    test.expect(3);

    var parser = new Parser(),
      templatePath = __dirname + '/fixtures/template.hbs',
      template = fs.readFileSync(templatePath, 'utf8'),
      result = parser.parse(template);

    test.equal(typeof result, 'object', 'No object returned');
    test.equal(Object.keys(result).length, 6, 'Invalid amount of strings returned');
    test.equal(result['Image description'].line.length, 2, 'Invalid amount of lines returned for string');

    test.done();
  },
  'plural': function (test) {
    test.expect(1);

    var parser = new Parser(),
      templatePath = __dirname + '/fixtures/plural.hbs',
      template = fs.readFileSync(templatePath, 'utf8'),
      result = parser.parse(template);

    test.equal(Object.keys(result).length, 2, 'Invalid amount of strings returned');

    test.done();
  }
};
