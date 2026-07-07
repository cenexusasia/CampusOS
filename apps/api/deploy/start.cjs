const Module = require('module');
const path = require('path');
const fs = require('fs');

const orig = Module._resolveFilename;

Module._resolveFilename = function (req, parent) {
  if (req === '@campusos/shared') {
    const p = path.resolve(__dirname, '..', '..', 'dist', 'shared.js');
    if (fs.existsSync(p)) return p;
  }
  return orig.call(this, req, parent);
};

const main = path.resolve(__dirname, '..', '..', 'dist', 'main.js');
require(main);
