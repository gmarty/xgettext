var parse = require('..'),
  Gettext = require('node-gettext'),
  fs = require('fs'),
  path = require('path');

var tmpDir = path.resolve(__dirname + '/../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

var source,
  destination,
  gettext,
  keys,
  comment;

exports.PARAMETER = {
  "default": function (test) {
    test.expect(6);

    test.throws(parse);

    test.throws(function () {
      parse(__dirname + '/fixtures');
    });

    source = __dirname + '/fixtures/default';
    destination = tmpDir + '/default.po';

    parse({
      _: [source, destination]
    }, function () {
      gettext = new Gettext();
      gettext.addTextdomain(null, fs.readFileSync(destination));
      keys = gettext.listKeys(null);

      test.ok(keys.indexOf('Image description') >= 0, 'Result does not contain expected msgid');

      comment = gettext.getComment(null, false, 'Image description');
      test.deepEqual(comment.code.split('\n'), ['template.hbs:4', 'template.hbs:7'], 'Repeated msgid in one file is not tracked');

      comment = gettext.getComment(null, false, 'This is a fixed sentence');
      test.deepEqual(comment.code.split('\n'), ['repeat.hbs:2', 'template.hbs:2'], 'Repeated msgid in different files not tracked');

      comment = gettext.getComment(null, false, 'Inside subdir');
      test.equal(comment.code, 'dir/template.hbs:2', 'Subdir result missing or at wrong line number');

      test.done();
    });
  },
  "keyword": function (test) {
    test.expect(1);

    source = __dirname + '/fixtures/keyword';
    destination = tmpDir + '/keyword.po';

    parse({
      _: [source, destination],
      keyword: 'i18n'
    }, function () {
      gettext = new Gettext();
      gettext.addTextdomain(null, fs.readFileSync(destination));
      keys = gettext.listKeys(null);

      test.ok(keys.indexOf('Image description') >= 0, 'Result does not contain expected msgid');

      test.done();
    });
  },
  "join-existing": function (test) {
    test.expect(3);

    source = __dirname + '/fixtures/join';
    destination = tmpDir + '/default.po';

    gettext = new Gettext();
    gettext.addTextdomain(null, fs.readFileSync(destination));
    gettext.setTranslation(null, false, "This is a fixed sentence", "This is the translation of the sentence");
    fs.writeFileSync(destination, gettext.compilePO(null));

    parse({
      _: [source, destination],
      'join-existing': true
    }, function () {
      gettext = new Gettext();
      gettext.addTextdomain(null, fs.readFileSync(destination));
      keys = gettext.listKeys(null);

      comment = gettext.getComment(null, false, 'This is a fixed sentence');
      test.equal(comment.code, 'template.hbs:4', 'Result does not have msgid at new line number');

      test.ok(keys.indexOf('This is a new sentence') >= 0, 'Result does not contain expected msgid');

      test.equal(gettext.gettext('This is a fixed sentence'), 'This is the translation of the sentence', 'Translation is no longer available');

      test.done();
    });
  }
};
