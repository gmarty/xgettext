var specPattern = / *([^:,]+) *(?::([^, ]+(?:,[^, ]+)*))? */g,
  contextPattern = /^(\d)+c$/;

function indexify (idx) {
  return parseInt(idx, 10) - 1;
}

function addToSpec (spec, item) {
  var parts;

  while ((parts = specPattern.exec(item)) !== null) {
    var keyword = parts[1];
    var positions = {position: 0};

    if (parts[2]) {
      positions = parts[2]
        .trim()
        .split(/ ?, ?/)
        .reduce(function (positions, position) {
          var context = position.match(contextPattern);

          if (context) {
            positions.context = indexify(context[1]);
          } else if (!('position' in positions)) {
            positions.position = indexify(position);
          } else {
            positions.plural = indexify(position);
          }

          return positions;
        }, {});
    }

    // support <= 3.1 position array format
    spec[keyword] = [positions.position];

    if (positions.plural) {
      spec[keyword].push(positions.plural);
    }

    Object.assign(spec[keyword], positions);
  }

  return spec;
}

module.exports = function createKeywordspec (spec) {
  if (typeof spec === 'string') {
    spec = [spec];
  }

  return spec.reduce(addToSpec, {});
};
