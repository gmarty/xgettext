var parse = require('..'),
  fs = require('fs'),
  path = require('path');

var tmpDir = path.resolve(__dirname + '/../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

function inFile(path, string) {
  var content = fs.readFileSync(path, 'utf8');
  return !!content.match(string);
}

// test with minimum parameters
exports.basic = function (test) {
  test.expect(3);

  test.throws(parse);

  test.throws(function () {
    parse(__dirname + '/fixtures');
  });

  var source = __dirname + '/fixtures/basic',
    destination = tmpDir + '/basic.po';

  parse({
    _: [source, destination]
  }, function () {
    test.ok(inFile(destination, 'Image description'), 'Result does not contain expected msgid');
    test.done();
  });
};

// test with custom keyword (handlebars helper name)
exports.keyword = function (test) {
  test.expect(1);

  var source = __dirname + '/fixtures/keyword',
    destination = tmpDir + '/keyword.po';

  parse({
    _: [source, destination],
    keyword: 'i18n'
  }, function () {
    test.ok(inFile(destination, 'Image description'), 'Result does not contain expected msgid');
    test.done();
  });
};
