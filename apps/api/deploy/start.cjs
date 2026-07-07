/**
 * Start script for Railway deployment.
 * Resolves @campusos/shared module alias before booting the app.
 */
const Module = require('module');
const path = require('path');
const fs = require('fs');

const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, parent) {
  if (request === '@campusos/shared') {
    // Try deploy/dist first, then apps/api/dist as fallback
    const candidates = [
      path.resolve(__dirname, 'dist', 'shared.js'),
      path.resolve(__dirname, '..', 'apps', 'api', 'dist', 'shared.js'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
  }
  return originalResolve.call(this, request, parent);
};

require('./dist/main');
