var parse = require('..'),
  Gettext = require('node-gettext'),
  fs = require('fs'),
  path = require('path');

var tmpDir = path.resolve(__dirname + '/../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

var gt,
  keys,
  comment;

exports.INPUT = {
  'default': function (test) {
    test.expect(4);

    parse('test/fixtures/default/template.hbs', null, function (po) {
      gt = new Gettext();
      gt.addTextdomain(null, po);
      keys = gt.listKeys(null);

      test.ok(keys.indexOf('Image description') >= 0, 'Result does not contain expected msgid');

      comment = gt.getComment(null, false, 'This is a fixed sentence');
      test.ok(comment.code, 'Source (path + line number) reference missing');
      test.equal(comment.code, 'test/fixtures/default/template.hbs:2', 'Source (path + line number) mismatch');

      comment = gt.getComment(null, false, 'Image description');
      test.deepEqual(comment.code.split('\n'), [
          'test/fixtures/default/template.hbs:4',
          'test/fixtures/default/template.hbs:7'
        ], 'Repeated msgid in one file is not tracked');

      test.done();
    });

  },
  'multiple files': function (test) {
    test.expect(4);

    parse([
      'test/fixtures/default/template.hbs',
      'test/fixtures/default/dir/template.hbs',
      'test/fixtures/default/empty.hbs',
      'test/fixtures/default/fixed.hbs',
      'test/fixtures/default/repeat.hbs'
    ], null, function (po) {
      gt = new Gettext();
      gt.addTextdomain(null, po);
      keys = gt.listKeys(null);

      test.ok(po.toString('utf8').indexOf('test/fixtures/default/empty.hbs') < 0, 'Reference to empty template found');
      test.ok(po.toString('utf8').indexOf('test/fixtures/default/fixed.hbs') < 0, 'Reference to template without translatable content found');

      test.ok(keys.indexOf('Inside subdir') >= 0, 'Result does not contain msgid from subdir');

      comment = gt.getComment(null, false, 'This is a fixed sentence');
      test.deepEqual(comment.code.split('\n'), [
          'test/fixtures/default/template.hbs:2',
          'test/fixtures/default/repeat.hbs:2'
        ], 'Repeated msgid is not tracked');

      test.done();
    });
  }
};

exports.PARAMETER = {
  'directory': function (test) {
    test.expect(1);

    parse(null, {
      directory: 'test/fixtures/default'
    }, function (po) {
      gt = new Gettext();
      gt.addTextdomain(null, po);
      keys = gt.listKeys(null);

      test.ok(keys.indexOf('Image description') >= 0, 'Result does not contain expected msgid');

      test.done();
    });
  },
  'output': function (test) {
    test.expect(1);

    parse('test/fixtures/default/template.hbs', {
      output: 'tmp/output.po'
    }, function () {
      gt = new Gettext();
      gt.addTextdomain(null, fs.readFileSync('tmp/output.po'));
      keys = gt.listKeys(null);

      test.ok(keys.indexOf('Image description') >= 0, 'Result does not contain expected msgid');

      test.done();
    });
  },
  'keyword': function (test) {
    test.expect(1);

    parse('test/fixtures/keyword/template.hbs', {
      keyword: 'i18n'
    }, function (po) {
      gt = new Gettext();
      gt.addTextdomain(null, po);
      keys = gt.listKeys(null);

      test.ok(keys.indexOf('Image description') >= 0, 'Result does not contain expected msgid');

      test.done();
    });
  }
};
