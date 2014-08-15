var Parser = require('../lib/parser'),
  fs = require('fs');

exports.parser = {
  'constructor': function (test) {
    test.expect(1);

    var parser;

    parser = new Parser();
    test.ok(parser.keywordSpec.gettext.length > 0, 'Default keyword spec was not set');

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
