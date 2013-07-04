var Parser = require('../lib/parser'),
  fs = require('fs');

var parser = new Parser();

var templatePath = __dirname + '/fixtures/template.hbs',
  template = fs.readFileSync(templatePath, 'utf8');

exports.parser = function (test) {
  test.expect(3);

  var result = parser.parse(template);

  test.equal(typeof result, 'object', 'No object returned');
  test.equal(Object.keys(result).length, 5, 'Invalid amount of strings returned');
  test.equal(result['Image description'].length, 2, 'Invalid amount of lines returned for string');

  test.done();
};
