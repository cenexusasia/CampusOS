/**
 * Railway start script — resolves @campusos/shared alias and boots the API.
 */
const Module = require('module');
const path = require('path');
const fs = require('fs');

// Set DeepSeek API key from Railway env or .env file
if (!process.env.DEEPSEEK_API_KEY) {
  const envPath = path.resolve(__dirname, 'apps', 'api', 'deploy', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const [key, ...rest] = line.split('=');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = rest.join('=').trim();
      }
    }
  }
}

const orig = Module._resolveFilename;

Module._resolveFilename = function (req, parent) {
  if (req === '@campusos/shared') {
    const p = path.resolve(__dirname, 'apps', 'api', 'deploy', 'dist', 'shared.js');
    if (fs.existsSync(p)) return p;
  }
  return orig.call(this, req, parent);
};

require('./apps/api/deploy/dist/main');
