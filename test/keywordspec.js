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
    var spec = Keywordspec('i18n:1,2');

    assert('i18n' in spec);
    assert.deepEqual(spec.i18n, [0, 1]);
  });
});
