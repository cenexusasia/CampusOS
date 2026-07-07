import { Controller, Get, Post, Delete, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MoodleService, type MoodleConfig } from './moodle.service';

@ApiTags('Connectors - Moodle')
@Controller('connectors/moodle')
export class MoodleController {
  constructor(private readonly moodleService: MoodleService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect to a Moodle instance via LTI' })
  @ApiQuery({ name: 'tenantId', required: true })
  async connect(@Body() config: MoodleConfig, @Query('tenantId') tenantId: string) {
    return this.moodleService.connect(config, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List Moodle connections' })
  @ApiQuery({ name: 'tenantId', required: true })
  async list(@Query('tenantId') tenantId: string) {
    return this.moodleService.listConnections(tenantId);
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync data from a Moodle connection' })
  async sync(@Param('id') id: string) {
    return this.moodleService.sync(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect a Moodle instance' })
  async disconnect(@Param('id') id: string): Promise<void> {
    return this.moodleService.disconnect(id);
  }
}
