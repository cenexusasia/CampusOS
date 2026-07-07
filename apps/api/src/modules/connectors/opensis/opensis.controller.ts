import { Controller, Get, Post, Delete, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OpenSISService, type OpenSISConfig } from './opensis.service';

@ApiTags('Connectors - OpenSIS')
@Controller('connectors/opensis')
export class OpenSISController {
  constructor(private readonly openSISService: OpenSISService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect to an OpenSIS instance' })
  @ApiQuery({ name: 'tenantId', required: true })
  async connect(@Body() config: OpenSISConfig, @Query('tenantId') tenantId: string) {
    return this.openSISService.connect(config, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List OpenSIS connections' })
  @ApiQuery({ name: 'tenantId', required: true })
  async list(@Query('tenantId') tenantId: string) {
    return this.openSISService.listConnections(tenantId);
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync data from an OpenSIS connection' })
  async sync(@Param('id') id: string) {
    return this.openSISService.sync(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect an OpenSIS instance' })
  async disconnect(@Param('id') id: string): Promise<void> {
    return this.openSISService.disconnect(id);
  }
}
