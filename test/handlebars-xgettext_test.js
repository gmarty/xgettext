var parse = require('..'),
  gt = require('gettext-parser'),
  fs = require('fs'),
  path = require('path');

var tmpDir = path.resolve(__dirname + '/../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

exports.INPUT = {
  'default': function (test) {
    test.expect(4);

    parse('test/fixtures/template.hbs', null, function (po) {
      var context = gt.po.parse(po).translations[''];

      test.ok('Image description' in context, 'Result does not contain expected msgid');

      var comment = context['This is a fixed sentence'].comments;
      test.ok(comment.reference, 'Source (path + line number) reference missing');
      test.equal(comment.reference, 'test/fixtures/template.hbs:2', 'Source (path + line number) mismatch');

      comment = context['Image description'].comments;
      test.deepEqual(comment.reference.split('\n'), [
          'test/fixtures/template.hbs:4',
          'test/fixtures/template.hbs:7'
        ], 'Repeated msgid in one file is not tracked');

      test.done();
    });
  },
  'empty': function (test) {
    test.expect(1);

    parse('test/fixtures/fixed.hbs', null, function (po) {
      test.ok(!po, 'No output expected');

      test.done();
    });
  },
  'multiple files': function (test) {
    test.expect(4);

    parse([
      'test/fixtures/template.hbs',
      'test/fixtures/dir/template.hbs',
      'test/fixtures/empty.hbs',
      'test/fixtures/fixed.hbs',
      'test/fixtures/repeat.hbs'
    ], null, function (po) {
      var context = gt.po.parse(po).translations[''];
      var str = JSON.stringify(context);

      test.ok(str.indexOf('test/fixtures/empty.hbs') < 0, 'Reference to empty template found');
      test.ok(str.indexOf('test/fixtures/fixed.hbs') < 0, 'Reference to template without translatable content found');

      test.ok('Inside subdir' in context, 'Result does not contain msgid from subdir');

      var comment = context['This is a fixed sentence'].comments;
      test.deepEqual(comment.reference.split('\n'), [
          'test/fixtures/template.hbs:2',
          'test/fixtures/repeat.hbs:2'
        ], 'Repeated msgid is not tracked');

      test.done();
    });
  },
  'plural': function (test) {
    test.expect(2);

    parse('test/fixtures/plural.hbs', null, function (po) {
      var context = gt.po.parse(po).translations[''];

      test.ok(context !== undefined, 'Result should not be empty');
      test.equal(context.book.msgid_plural, 'books', 'Result should contain plural form');

      test.done();
    });
  },
  'nonAscii': function (test) {
    test.expect(1);

    parse('test/fixtures/non-ascii.hbs', null, function (po) {
      var context = gt.po.parse(po, 'utf-8').translations[''];

      test.ok('Строка' in context, 'Result does not contain expected msgid');

      test.done();
    });
  }
};
exports.PARAMETER = {
  'directory': function (test) {
    test.expect(1);

    parse(null, {
      directory: 'test/fixtures'
    }, function (po) {
      var context = gt.po.parse(po).translations[''];

      test.ok('Image description' in context, 'Result does not contain expected msgid');

      test.done();
    });
  },
  'output': function (test) {
    test.expect(1);

    parse('test/fixtures/template.hbs', {
      output: 'tmp/output.po'
    }, function () {
      var context = gt.po.parse(fs.readFileSync('tmp/output.po')).translations[''];

      test.ok('Image description' in context, 'Result does not contain expected msgid');

      test.done();
    });
  },
  'keyword': function (test) {
    test.expect(1);

    parse('test/fixtures/keyword.hbs', {
      keyword: 'i18n'
    }, function (po) {
      var context = gt.po.parse(po).translations[''];

      test.ok('Image description' in context, 'Result does not contain expected msgid');

      test.done();
    });
  },
  'force-po': function (test) {
    test.expect(1);

    parse('test/fixtures/fixed.hbs', {
      'force-po': true
    }, function (po) {
      test.ok(po, 'No output returned');

      test.done();
    });
  }
};
