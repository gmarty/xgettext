'use strict';

const objectAssign = require('object-assign');

const specPattern = / *([^:,]+) *(?::([^, ]+(?:,[^, ]+)*))? */g;
const contextPattern = /^(\d)+c$/;

function indexify (idx) {
  return parseInt(idx, 10) - 1;
}

function addToSpec (spec, item) {
  let parts;

  if (typeof item === 'boolean') {
    return spec
  }

  while ((parts = specPattern.exec(item)) !== null) {
    const keyword = parts[1];
    let positions = { msgid: 0 };

    if (parts[2]) {
      positions = parts[2]
        .trim()
        .split(/ ?, ?/)
        .reduce((positions, position) => {
          const context = position.match(contextPattern);

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
  if (typeof spec === 'string' || typeof spec === 'boolean') {
    spec = [spec];
  }

  let noDefaults = spec.filter(item => typeof item === 'boolean' && item).length > 0;

  return { spec: spec.reduce(addToSpec, {}), noDefaults: noDefaults };
};
