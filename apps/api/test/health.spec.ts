import { describe, it, expect } from 'vitest';

describe('Health endpoint', () => {
  it('should return 200 with status ok', async () => {
    const response = await fetch('http://localhost:3001/api/v1/health');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('timestamp');
  });
});
