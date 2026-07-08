import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ConnectorsService } from './connectors.service';

@ApiTags('Connectors')
@Controller('connectors')
export class ConnectorsController {
  private readonly logger = new Logger(ConnectorsController.name);

  constructor(private readonly connectorsService: ConnectorsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all configured connectors for the current tenant' })
  async list(@CurrentUser() user: JwtPayload) {
    this.logger.log(`Fetching connectors for tenant: ${user.tenantId}`);
    return this.connectorsService.listByTenant(user.tenantId!);
  }
}
