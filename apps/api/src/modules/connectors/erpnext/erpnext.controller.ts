import { Controller, Get, Post, Delete, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ERPNextService, type ERPNextConfig } from './erpnext.service';

@ApiTags('Connectors - ERPNext')
@Controller('connectors/erpnext')
export class ERPNextController {
  constructor(private readonly erpnextService: ERPNextService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect to an ERPNext instance' })
  @ApiQuery({ name: 'tenantId', required: true })
  async connect(@Body() config: ERPNextConfig, @Query('tenantId') tenantId: string) {
    return this.erpnextService.connect(config, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List ERPNext connections' })
  @ApiQuery({ name: 'tenantId', required: true })
  async list(@Query('tenantId') tenantId: string) {
    return this.erpnextService.listConnections(tenantId);
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync financial and HR data from an ERPNext connection' })
  async sync(@Param('id') id: string) {
    return this.erpnextService.sync(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect an ERPNext instance' })
  async disconnect(@Param('id') id: string): Promise<void> {
    return this.erpnextService.disconnect(id);
  }
}
