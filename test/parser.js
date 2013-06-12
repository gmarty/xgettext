var parser = require('../lib/parser'),
  assert = require("assert"),
  fs = require('fs'),
  path = require('path');

var templatePath = path.join(__dirname, 'fixtures/template.hbs'),
  template = fs.readFileSync(templatePath, 'utf8');

describe('#parser()', function () {
  it('should parse a template', function () {
    var result = parser(template);
    assert(typeof result === 'object', 'no object returned');
    assert.equal(Object.keys(result).length, 2, 'invalid amount of keys returned');
  });
});
