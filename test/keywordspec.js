var Keywordspec = require('../src/keywordspec'),
  assert = require('assert');

describe('Keywordspec', function () {
  it('should parse a string', function () {
    var spec = Keywordspec('gettext');

    assert('gettext' in spec);
    assert.deepEqual(spec.gettext, [0]);
  });

  it('should parse an array', function () {
    var spec = Keywordspec(['gettext']);

    assert('gettext' in spec);
    assert.deepEqual(spec.gettext, [0]);
  });

  it('should parse parameter positions', function () {
    var spec = Keywordspec('i18n:2,3');

    assert('i18n' in spec);
    assert.deepEqual(spec.i18n, [1, 2]);
  });

  it('should parse multiple keywords', function () {
    var spec = Keywordspec('_, gettext, dgettext:2, dcgettext:2, ngettext:1,2, dngettext:2,3, pgettext:1c,2, dpgettext:2c,3');

    assert('_' in spec);
    assert.deepEqual(spec._, [0]);
    assert('ngettext' in spec);
    assert.deepEqual(spec.ngettext, [0,1]);
  });
});
