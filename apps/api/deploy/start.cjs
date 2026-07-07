/**
 * Start script for standalone Railway deployment.
 * Registers module aliases before booting the app.
 */
const Module = require('module');
const path = require('path');
const fs = require('fs');

const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, parent) {
  // Intercept @campusos/shared and resolve to the compiled shared.js
  if (request === '@campusos/shared') {
    const sharedPath = path.resolve(__dirname, 'dist', 'shared.js');
    if (fs.existsSync(sharedPath)) {
      return sharedPath;
    }
  }
  return originalResolve.call(this, request, parent);
};

// Boot the application
require('./dist/main');
