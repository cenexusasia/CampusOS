import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../shared';

@ApiTags('Monitoring')
@Controller('api/v1/metrics')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class MonitoringController {
  constructor(private readonly monitoring: MonitoringService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get metrics summary', description: 'Returns aggregated application metrics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Metrics summary',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          count: { type: 'number' },
          total: { type: 'number' },
          avg: { type: 'number' },
        },
      },
    },
  })
  getMetrics() {
    return this.monitoring.getMetricsSummary();
  }
}
