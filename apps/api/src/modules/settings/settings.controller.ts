import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('tenant')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get tenant settings' })
  @ApiQuery({ name: 'tenantId', required: true })
  getTenantSettings(@Query('tenantId') tenantId: string) {
    return this.settingsService.getTenantSettings(tenantId);
  }

  @Put('tenant')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update tenant settings' })
  @ApiQuery({ name: 'tenantId', required: true })
  updateTenantSettings(
    @Query('tenantId') tenantId: string,
    @Body()
    data: {
      name?: string;
      domain?: string;
      logo?: string | null;
      settings?: {
        branding?: { primaryColor?: string; logo?: string | null };
        locale?: string;
        timezone?: string;
        features?: {
          aiAssistant?: boolean;
          analytics?: boolean;
          connectors?: boolean;
          customBranding?: boolean;
        };
      };
    },
  ) {
    return this.settingsService.updateTenantSettings(tenantId, data);
  }

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get notification settings for current user' })
  @ApiQuery({ name: 'userId', required: true })
  getNotificationSettings(@Query('userId') userId: string) {
    return this.settingsService.getNotificationSettings(userId);
  }

  @Put('notifications/:channel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a notification channel setting' })
  @ApiQuery({ name: 'userId', required: true })
  updateNotificationSetting(
    @Query('userId') userId: string,
    @Param('channel') channel: string,
    @Body('enabled') enabled: boolean,
  ) {
    return this.settingsService.updateNotificationSetting(
      userId,
      channel,
      enabled,
    );
  }

  @Get('connectors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get tenant connectors' })
  @ApiQuery({ name: 'tenantId', required: true })
  getConnectors(@Query('tenantId') tenantId: string) {
    return this.settingsService.getConnectors(tenantId);
  }

  @Get('plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current tenant plan' })
  @ApiQuery({ name: 'tenantId', required: true })
  getPlan(@Query('tenantId') tenantId: string) {
    return this.settingsService.getPlan(tenantId);
  }
}
