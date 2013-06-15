var Parser = require('../lib/parser'),
  fs = require('fs');

var parser = new Parser();

var templatePath = __dirname + '/fixtures/basic/template.hbs',
  template = fs.readFileSync(templatePath, 'utf8');

exports.parser = function (test) {
  test.expect(2);

  var result = parser.parse(template);

  test.equal(typeof result, 'object', 'no object returned');
  test.equal(Object.keys(result).length, 2, 'invalid amount of keys returned');

  test.done();
};
