'use strict';

var objectAssign = require('object-assign');

var specPattern = / *([^:,]+) *(?::([^, ]+(?:,[^, ]+)*))? */g,
  contextPattern = /^(\d)+c$/;

function indexify (idx) {
  return parseInt(idx, 10) - 1;
}

function addToSpec (spec, item) {
  var parts;

  while ((parts = specPattern.exec(item)) !== null) {
    var keyword = parts[1];
    var positions = {msgid: 0};

    if (parts[2]) {
      positions = parts[2]
        .trim()
        .split(/ ?, ?/)
        .reduce(function (positions, position) {
          var context = position.match(contextPattern);

          if (context) {
            positions.msgctxt = indexify(context[1]);
          } else if (!('msgid' in positions)) {
            positions.msgid = indexify(position);
          } else {
            positions.msgid_plural = indexify(position);
          }

          return positions;
        }, {});
    }

    // support <= 3.1 position array format
    spec[keyword] = [positions.msgid];

    if (positions.msgid_plural) {
      spec[keyword].push(positions.msgid_plural);
    }

    objectAssign(spec[keyword], positions);
  }

  return spec;
}

module.exports = function createKeywordSpec (spec) {
  if (typeof spec === 'string') {
    spec = [spec];
  }

  return spec.reduce(addToSpec, {});
};
