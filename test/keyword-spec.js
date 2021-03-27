const Keywordspec = require('../src/keyword-spec');
const assert = require('assert');

describe('Keywordspec', function () {
  it('should parse a string', function () {
    const spec = Keywordspec('gettext');

    assert('gettext' in spec);
    assert.deepStrictEqual(spec.gettext.slice(0), [0]);
  });

  it('should parse an array', function () {
    const spec = Keywordspec(['gettext']);

    assert('gettext' in spec);
    assert.deepStrictEqual(spec.gettext.slice(0), [0]);
  });

  it('should parse parameter positions', function () {
    const spec = Keywordspec('i18n:2,3');

    assert('i18n' in spec);
    assert.deepStrictEqual(spec.i18n.slice(0), [1, 2]);
  });

  it('should parse multiple keywords', function () {
    const spec = Keywordspec('_, gettext, dgettext:2, dcgettext:2, ngettext:1,2, dngettext:2,3, pgettext:1c,2, dpgettext:2c,3');

    assert('_' in spec);
    assert.deepStrictEqual(spec._.slice(0), [0]);
    assert('ngettext' in spec);
    assert.deepStrictEqual(spec.ngettext.slice(0), [0, 1]);
  });

  it('should parse context position', function () {
    const spec = Keywordspec('gettext, ngettext:1,2, pgettext:1c,2, npgettext:2c,3,4');

    assert('pgettext' in spec);
    assert.deepStrictEqual(spec.pgettext.slice(0), [1]);
    assert(spec.pgettext.msgctxt === 0);
    assert('npgettext' in spec);
    assert.deepStrictEqual(spec.npgettext.slice(0), [2, 3]);
    assert(spec.npgettext.msgctxt === 1);
  });
});
