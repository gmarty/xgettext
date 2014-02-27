var Parser = require('../lib/parser'),
  fs = require('fs');

var parser = new Parser();

exports.parser = {
  'default': function (test) {
    test.expect(3);

    var templatePath = __dirname + '/fixtures/template.hbs',
      template = fs.readFileSync(templatePath, 'utf8'),
      result = parser.parse(template);

    test.equal(typeof result, 'object', 'No object returned');
    test.equal(Object.keys(result).length, 5, 'Invalid amount of strings returned');
    test.equal(result['Image description'].line.length, 2, 'Invalid amount of lines returned for string');

    test.done();
  },
  'plural': function (test) {
    test.expect(1);

    var templatePath = __dirname + '/fixtures/plural.hbs',
      template = fs.readFileSync(templatePath, 'utf8'),
      result = parser.parse(template);

    test.equal(Object.keys(result).length, 1, 'Invalid amount of strings returned');

    test.done();
  },
  'arguments': function (test) {
    test.expect(1);

    var templatePath = __dirname + '/fixtures/arguments.hbs',
      template = fs.readFileSync(templatePath, 'utf8'),
      result = parser.parse(template);

    test.equal(Object.keys(result).length, 1, 'Invalid amount of strings returned');

    test.done();

  }
};
