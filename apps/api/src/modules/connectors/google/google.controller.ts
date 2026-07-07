import { Controller, Get, Post, Delete, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GoogleService } from './google.service';

@ApiTags('Connectors - Google')
@Controller('connectors/google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('auth-url')
  @ApiOperation({ summary: 'Get Google OAuth authorization URL' })
  @ApiQuery({ name: 'tenantId', required: true })
  getAuthUrl(@Query('tenantId') tenantId: string): { url: string } {
    const config = {
      clientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
      redirectUri: process.env['GOOGLE_REDIRECT_URI'] ?? 'http://localhost:3001/api/v1/connectors/google/callback',
      scopes: [],
    };
    return { url: this.googleService.getAuthUrl(config) };
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'tenantId', required: true })
  async handleCallback(@Query('code') code: string, @Query('tenantId') tenantId: string): Promise<{ success: boolean }> {
    const config = {
      clientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
      redirectUri: process.env['GOOGLE_REDIRECT_URI'] ?? 'http://localhost:3001/api/v1/connectors/google/callback',
      scopes: [],
    };
    await this.googleService.exchangeCode(code, config);
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: 'List connected Google accounts' })
  @ApiQuery({ name: 'tenantId', required: true })
  async list(@Query('tenantId') tenantId: string) {
    return this.googleService.listConnections(tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect a Google account' })
  async disconnect(@Param('id') id: string): Promise<void> {
    return this.googleService.disconnect(id);
  }
}
