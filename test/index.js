var xgettext = require('..'),
  assert = require('assert'),
  gt = require('gettext-parser'),
  fs = require('fs'),
  path = require('path');

var tmpDir = path.resolve(__dirname + '/../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

describe('API', function () {
  it('should run with default parameters', function (done) {
    xgettext(['test/fixtures/template.hbs'], {output: '-'}, function (po) {
      var context = gt.po.parse(po).translations[''];

      assert('Image description' in context);

      var comment = context['This is a fixed sentence'].comments;

      assert(comment.reference);
      assert.equal(comment.reference, 'test/fixtures/template.hbs:2');

      comment = context['Image description'].comments;

      assert(comment.reference.match('test/fixtures/template.hbs:5'));
      assert(comment.reference.match('test/fixtures/template.hbs:8'));

      done();
    });
  });
  it('should parse an empty template', function (done) {
    xgettext(['test/fixtures/fixed.hbs'], {output: '-'}, function (po) {
      assert(!po);

      done();
    });
  });
  it('should parse multiple files', function (done) {
    xgettext([
      'test/fixtures/template.hbs',
      'test/fixtures/dir/template.hbs',
      'test/fixtures/empty.hbs',
      'test/fixtures/fixed.hbs',
      'test/fixtures/repeat.hbs'
    ], {output: '-'}, function (po) {
      var context = gt.po.parse(po).translations[''];
      var str = JSON.stringify(context);

      assert(str.indexOf('test/fixtures/empty.hbs') < 0);
      assert(str.indexOf('test/fixtures/fixed.hbs') < 0);

      assert('Inside subdir' in context);

      var comment = context['This is a fixed sentence'].comments;

      assert(comment.reference.match('test/fixtures/template.hbs:2'));
      assert(comment.reference.match('test/fixtures/repeat.hbs:2'));

      done();
    });
  });
  it('should handle plural expressions', function (done) {
    xgettext(['test/fixtures/plural.hbs'], {output: '-'}, function (po) {
      var context = gt.po.parse(po).translations[''];

      assert(context !== undefined);
      assert.equal(context.quote.msgid_plural, 'quotes');
      assert.equal(context.quote.msgstr.length, 2);

      done();
    });
  });
  it('should handle different translation contexts in single file', function (done) {
    xgettext(['test/fixtures/contexts.hbs'], {output: '-'}, function (po) {
      var translations = gt.po.parse(po).translations;

      assert(translations !== undefined);
      assert('menu' in translations);
      assert('body' in translations);
      assert('Localized string' in translations.menu);
      assert('Localized string' in translations.body);
      assert.equal(translations.menu['Localized string'].msgctxt, 'menu');
      assert.equal(translations.body['Localized string'].msgctxt, 'body');

      done();
    });
  });
  it('should handle translation contexts along with simple strings', function (done) {
    xgettext(['test/fixtures/contexts-mixed.hbs'], {output: '-'}, function (po) {
      var translations = gt.po.parse(po).translations;

      assert(translations !== undefined);
      assert('menu' in translations);
      assert('' in translations);
      assert('Localized string' in translations.menu);
      assert('Localized string' in translations['']);
      assert.equal(translations.menu['Localized string'].msgctxt, 'menu');
      assert(!translations['']['Localized string'].msgctxt);

      done();
    });
  });
  it('should handle plural strings with translation contexts', function (done) {
    xgettext(['test/fixtures/contexts-plural.hbs'], {output: '-'}, function (po) {
      var translations = gt.po.parse(po).translations;

      assert(translations !== undefined);
      assert('menu' in translations);
      assert('item' in translations.menu);
      assert.equal(translations.menu.item.msgid, 'item');
      assert.equal(translations.menu.item.msgid_plural, 'items');
      assert.equal(translations.menu.item.msgstr.length, 2);
      assert.equal(translations.menu.item.msgctxt, 'menu');

      done();
    });
  });
  it('should handle non-ascii input', function (done) {
    xgettext(['test/fixtures/non-ascii.hbs'], {output: '-'}, function (po) {
      var context = gt.po.parse(po, 'utf-8').translations[''];

      assert('Строка' in context);

      done();
    });
  });
  it('should traverse files relative to different root directories', function (done) {
    xgettext(['template.hbs'], {
      directory: ['test/fixtures'],
      output: '-'
    }, function (po) {
      var context = gt.po.parse(po).translations[''];

      assert('Image description' in context);

      done();
    });
  });
  it('should write output to a file', function (done) {
    xgettext(['test/fixtures/template.hbs'], {
      output: 'tmp/output.po'
    }, function () {
      fs.readFile('tmp/output.po', 'utf8', function (err, data) {
        var context = gt.po.parse(data).translations[''];

        assert('Image description' in context);

        done();
      });
    });
  });
  it('should merge output with an existing file', function (done) {
    xgettext(['test/fixtures/dir/template.hbs'], {
      output: 'tmp/output.po',
      'join-existing': true
    }, function () {
      fs.readFile('tmp/output.po', 'utf8', function (err, data) {
        var context = gt.po.parse(data).translations[''];

        assert('Image description' in context);
        assert('Inside subdir' in context);

        done();
      });
    });
  });
  it('should handle keywordspec', function (done) {
    xgettext(['test/fixtures/keyword.hbs'], {
      keyword: ['i18n', '$'],
      output: '-'
    }, function (po) {
      var context = gt.po.parse(po).translations[''];

      assert('Image description' in context);
      assert('regex escaped keyword' in context);

      xgettext(['test/fixtures/plural.hbs'], {
        keyword: ['i18n:1,2', 'order:2,3'],
        output: '-'
      }, function (po) {
        var context = gt.po.parse(po).translations[''];

        assert.equal(context.keyword.msgid_plural, 'keywords');
        assert.equal(context.difference.msgid_plural, 'differences');

        done();
      });
    });
  });
  it('should handle no-location option', function (done) {
    xgettext(['test/fixtures/repeat.hbs'], {
      'no-location': true,
      output: '-'
    }, function (po) {
      var context = gt.po.parse(po).translations[''];
      var comment = context['This is a fixed sentence'].comments || {};

      assert(comment.reference === undefined);

      done();
    });
  });
  it('should handle force-po option', function (done) {
    xgettext(['test/fixtures/fixed.hbs'], {
      'force-po': true,
      output: '-'
    }, function (po) {
      assert(po);

      done();
    });
  });
});
