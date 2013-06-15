var parser = require('../lib/parser'),
  fs = require('fs'),
  path = require('path');

var templatePath = path.join(__dirname, 'fixtures/template.hbs'),
  template = fs.readFileSync(templatePath, 'utf8');

exports.parser = function (test) {
  test.expect(2);

  var result = parser(template);
  test.equal(typeof result, 'object', 'no object returned');
  test.equal(Object.keys(result).length, 2, 'invalid amount of keys returned');

  test.done();
};
