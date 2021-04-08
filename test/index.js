const xgettext = require('..');
const assert = require('assert');
const gt = require('gettext-parser');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(path.join(__dirname, '/../tmp'));
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

describe('API', function () {
  it('should run with default parameters', function (done) {
    xgettext(['test/fixtures/template.hbs'], { output: '-' }, function (po) {
      const context = gt.po.parse(po).translations[''];

      assert('Image description' in context);

      let comment = context['This is a fixed sentence'].comments;

      assert(comment.reference);
      assert.strictEqual(comment.reference, 'test/fixtures/template.hbs:2');

      comment = context['Image description'].comments;

      assert(comment.reference.match('test/fixtures/template.hbs:5'));
      assert(comment.reference.match('test/fixtures/template.hbs:8'));

      done();
    });
  });
  it('should parse an empty template', function (done) {
    xgettext(['test/fixtures/fixed.hbs'], { output: '-' }, function (po) {
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
    ], { output: '-' }, function (po) {
      const context = gt.po.parse(po).translations[''];
      const str = JSON.stringify(context);

      assert(str.indexOf('test/fixtures/empty.hbs') < 0);
      assert(str.indexOf('test/fixtures/fixed.hbs') < 0);

      assert('Inside subdir' in context);

      const comment = context['This is a fixed sentence'].comments;

      assert(comment.reference.match('test/fixtures/template.hbs:2'));
      assert(comment.reference.match('test/fixtures/repeat.hbs:2'));

      done();
    });
  });
  it('should handle plural expressions', function (done) {
    xgettext(['test/fixtures/plural.hbs'], { output: '-' }, function (po) {
      const context = gt.po.parse(po).translations[''];

      assert(context !== undefined);
      assert.strictEqual(context.quote.msgid_plural, 'quotes');
      assert.strictEqual(context.quote.msgstr.length, 2);

      done();
    });
  });
  it('should handle different translation contexts in single file', function (done) {
    xgettext(['test/fixtures/contexts.hbs'], { output: '-' }, function (po) {
      const translations = gt.po.parse(po).translations;

      assert(translations !== undefined);
      assert('menu' in translations);
      assert('body' in translations);
      assert('Localized string' in translations.menu);
      assert('Localized string' in translations.body);
      assert.strictEqual(translations.menu['Localized string'].msgctxt, 'menu');
      assert.strictEqual(translations.body['Localized string'].msgctxt, 'body');

      done();
    });
  });
  it('should handle translation contexts along with simple strings', function (done) {
    xgettext(['test/fixtures/contexts-mixed.hbs'], { output: '-' }, function (po) {
      const translations = gt.po.parse(po).translations;

      assert(translations !== undefined);
      assert('menu' in translations);
      assert('' in translations);
      assert('Localized string' in translations.menu);
      assert('Localized string' in translations['']);
      assert.strictEqual(translations.menu['Localized string'].msgctxt, 'menu');
      assert(!translations['']['Localized string'].msgctxt);

      done();
    });
  });
  it('should handle plural strings with translation contexts', function (done) {
    xgettext(['test/fixtures/contexts-plural.hbs'], {
      output: '-',
      keyword: 'npgettext:1c,2,3'
    }, function (po) {
      const translations = gt.po.parse(po).translations;

      assert(translations !== undefined);
      assert('menu' in translations);
      assert('item' in translations.menu);
      assert.strictEqual(translations.menu.item.msgid, 'item');
      assert.strictEqual(translations.menu.item.msgid_plural, 'items');
      assert.strictEqual(translations.menu.item.msgstr.length, 2);
      assert.strictEqual(translations.menu.item.msgctxt, 'menu');

      done();
    });
  });
  it('should handle non-ascii input', function (done) {
    xgettext(['test/fixtures/non-ascii.hbs'], { output: '-' }, function (po) {
      const context = gt.po.parse(po, 'utf-8').translations[''];

      assert('Строка' in context);

      done();
    });
  });
  it('should traverse files relative to different root directories', function (done) {
    xgettext(['template.hbs'], {
      directory: ['test/fixtures'],
      output: '-'
    }, function (po) {
      const context = gt.po.parse(po).translations[''];

      assert('Image description' in context);

      done();
    });
  });
  it('should write output to a file', function (done) {
    xgettext(['test/fixtures/template.hbs'], {
      output: 'tmp/output.po'
    }, function () {
      fs.readFile('tmp/output.po', 'utf8', function (err, data) {
        if (err) {
          throw err;
        }

        const context = gt.po.parse(data).translations[''];

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
        if (err) {
          throw err;
        }

        const context = gt.po.parse(data).translations[''];

        assert('Image description' in context);
        assert('Inside subdir' in context);

        done();
      });
    });
  });
  it('should merge output with contexts with an existing file', function (done) {
    xgettext(['test/fixtures/contexts-mixed.hbs'], {
      output: 'tmp/output.po'
    }, function (po1) {
      xgettext(['test/fixtures/contexts-mixed.hbs'], {
        output: 'tmp/output.po',
        'join-existing': true
      }, function (po2) {
        assert(po1.toString('utf8') === po2.toString('utf8'));

        done();
      });
    });
  });
  it('should handle no keywords', function (done) {
    xgettext(['test/fixtures/keyword.hbs'], {
      keyword: [true],
      output: '-'
    }, function (po) {
      const context = gt.po.parse(po).translations[''];

      assert(context === undefined);

      xgettext(['test/fixtures/plural.hbs'], {
        keyword: [true],
        output: '-'
      }, function (po) {
        const context = gt.po.parse(po).translations[''];

        assert(context === undefined);

        done();
      });
    });
  });
  it('should handle keywordspec', function (done) {
    xgettext(['test/fixtures/keyword.hbs'], {
      keyword: ['i18n', '$'],
      output: '-'
    }, function (po) {
      const context = gt.po.parse(po).translations[''];

      assert('Image description' in context);
      assert('regex escaped keyword' in context);
      assert(Object.keys(context).length === 4);

      xgettext(['test/fixtures/plural.hbs'], {
        keyword: ['i18n:1,2', 'order:2,3'],
        output: '-'
      }, function (po) {
        const context = gt.po.parse(po).translations[''];

        assert.strictEqual(context.keyword.msgid_plural, 'keywords');
        assert.strictEqual(context.difference.msgid_plural, 'differences');
        assert(Object.keys(context).length === 5);

        done();
      });
    });
  });
  it('should handle no-location option', function (done) {
    xgettext(['test/fixtures/repeat.hbs'], {
      'no-location': true,
      output: '-'
    }, function (po) {
      const context = gt.po.parse(po).translations[''];
      const comment = context['This is a fixed sentence'].comments || {};

      assert(comment.reference === undefined);

      done();
    });
  });
  it('should handle sort-output option', function (done) {
    xgettext(['test/fixtures/unsorted.hbs'], {
      'sort-output': true,
      output: '-'
    }, function (po) {
      const poFileContent = po.toString('utf8');
      assert(poFileContent.indexOf('Text 1') < poFileContent.indexOf('Text 2'));
      assert(poFileContent.indexOf('Text 2') < poFileContent.indexOf('Text 3'));

      done();
    });
  });
  it('should handle windows-style paths', function (done) {
    xgettext(['test\\fixtures\\repeat.hbs'], {
      output: '-'
    }, function (po) {
      const context = gt.po.parse(po).translations[''];
      const comment = context['This is a fixed sentence'].comments || {};

      assert(comment.reference === 'test/fixtures/repeat.hbs:2');

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
