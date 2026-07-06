import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { HealthResponse } from '../shared';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();
  private readonly version = process.env['npm_package_version'] || '0.1.0';

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns the current health status of the API' })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        version: { type: 'string', example: '0.1.0' },
        uptime: { type: 'number', example: 123456 },
        timestamp: { type: 'string', example: '2025-01-01T00:00:00.000Z' },
      },
    },
  })
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      version: this.version,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }
}
