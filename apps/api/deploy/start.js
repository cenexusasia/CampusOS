const path = require('path');
const tsConfigPaths = require('tsconfig-paths');

// Register path alias for @campusos/shared -> ./dist/shared
tsConfigPaths.register({
  baseUrl: __dirname,
  paths: {
    '@campusos/shared': ['dist/shared'],
  },
});

// Start the app
require('./dist/main');
