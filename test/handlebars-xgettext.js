var parse = require('..'),
  assert = require("assert");

describe('#parse()', function () {
  it('should throw an error when called without parameters', function () {
    assert.throws(parse);
  });
  it('should throw an error when only an inputdir is specified', function () {
    assert.throws(function () {
      parse('./test/fixtures/');
    });
  });
});