/**
 * Railway start script — resolves @campusos/shared alias and boots the API.
 */
const Module = require('module');
const path = require('path');
const fs = require('fs');

const orig = Module._resolveFilename;

Module._resolveFilename = function (req, parent) {
  if (req === '@campusos/shared') {
    const p = path.resolve(__dirname, 'apps', 'api', 'deploy', 'dist', 'shared.js');
    if (fs.existsSync(p)) return p;
  }
  return orig.call(this, req, parent);
};

require('./apps/api/deploy/dist/main');
