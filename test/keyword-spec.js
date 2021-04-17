const Keywordspec = require('../src/keyword-spec');
const assert = require('assert');

describe('Keywordspec', function () {
  it('should parse a string', function () {
    const spec = Keywordspec('gettext');

    assert('gettext' in spec.spec);
    assert(!spec.noDefaults);
    assert.deepStrictEqual(spec.spec.gettext.slice(0), [0]);
  });

  it('should parse a boolean', function () {
    const spec = Keywordspec(true);

    assert(Object.keys(spec.spec).length === 0);
    assert(spec.noDefaults);
  });

  it('should parse an array', function () {
    const spec = Keywordspec(['gettext']);

    assert('gettext' in spec.spec);
    assert(!spec.noDefaults);
    assert.deepStrictEqual(spec.spec.gettext.slice(0), [0]);
  });

  it('should parse an array with a boolean', function () {
    const spec = Keywordspec(['gettext', true]);

    assert('gettext' in spec.spec);
    assert(spec.noDefaults);
    assert.deepStrictEqual(spec.spec.gettext.slice(0), [0]);
  });

  it('should parse parameter positions', function () {
    const spec = Keywordspec('i18n:2,3');

    assert('i18n' in spec.spec);
    assert(!spec.noDefaults);
    assert.deepStrictEqual(spec.spec.i18n.slice(0), [1, 2]);
  });

  it('should parse multiple keywords', function () {
    const spec = Keywordspec('_, gettext, dgettext:2, dcgettext:2, ngettext:1,2, dngettext:2,3, pgettext:1c,2, dpgettext:2c,3');

    assert('_' in spec.spec);
    assert.deepStrictEqual(spec.spec._.slice(0), [0]);
    assert('ngettext' in spec.spec);
    assert.deepStrictEqual(spec.spec.ngettext.slice(0), [0, 1]);
    assert(!spec.noDefaults);
  });

  it('should parse context position', function () {
    const spec = Keywordspec('gettext, ngettext:1,2, pgettext:1c,2, npgettext:2c,3,4');

    assert('pgettext' in spec.spec);
    assert.deepStrictEqual(spec.spec.pgettext.slice(0), [1]);
    assert(spec.spec.pgettext.msgctxt === 0);
    assert('npgettext' in spec.spec);
    assert.deepStrictEqual(spec.spec.npgettext.slice(0), [2, 3]);
    assert(spec.spec.npgettext.msgctxt === 1);
    assert(!spec.noDefaults);
  });
});
