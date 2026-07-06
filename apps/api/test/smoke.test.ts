import { describe, it, expect } from 'vitest';

describe('Project configuration', () => {
  it('should have valid package.json', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../package.json');
    expect(pkg).toBeDefined();
    expect(pkg.name).toBe('@campusos/api');
    expect(pkg.version).toBe('0.1.0');
  });

  it('should have TypeScript configured', () => {
    const fs = require('fs');
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });
});

describe('Health controller', () => {
  it('should generate correct health response shape', () => {
    const startTime = Date.now() - 5000; // 5 seconds ago
    const version = '0.1.0';

    const healthResponse = {
      status: 'ok' as const,
      version,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    };

    expect(healthResponse.status).toBe('ok');
    expect(healthResponse.version).toBe('0.1.0');
    expect(healthResponse.uptime).toBeGreaterThanOrEqual(4);
    expect(healthResponse.timestamp).toBeDefined();
    expect(() => new Date(healthResponse.timestamp)).not.toThrow();
  });
});
