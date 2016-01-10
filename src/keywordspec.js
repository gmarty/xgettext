var specPattern = / *([^:,]+) *(?::([^, ]+)(?:,([^, ]+))?)? */g,
  onlyDigits = /^\d+$/;

function indexify (idx) {
  return parseInt(idx, 10) - 1;
}

function addToSpec (spec, keyword) {
  var parts;

  while ((parts = specPattern.exec(keyword)) !== null) {
    // non-digit positions are ignored (pgettext, dpgettext)
    spec[parts[1]] = [onlyDigits.test(parts[2]) ? indexify(parts[2]) : 0];

    if (parts[3] && onlyDigits.test(parts[3])) {
      spec[parts[1]].push(indexify(parts[3]));
    }
  }

  return spec;
}

module.exports = function createKeywordspec(spec) {
  if (typeof spec === 'string') {
    spec = [spec];
  }

  return spec.reduce(addToSpec, {});
};
