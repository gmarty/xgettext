var parse = require('..');

exports.parameters = function (test) {
  test.expect(2);

  test.throws(parse);

  test.throws(function () {
    parse(__dirname + 'test/fixtures/');
  });

  test.done();
};
