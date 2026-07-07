import { Controller, Get, Put, Post, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EmailService, type EmailOptions } from './email.service';
import { NotificationPreferencesService } from './notification-preferences.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly emailService: EmailService,
    private readonly preferencesService: NotificationPreferencesService,
  ) {}

  @Post('email/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send an email notification' })
  async sendEmail(@Body() options: EmailOptions) {
    return this.emailService.send(options);
  }

  @Post('email/send-batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send batch email notifications' })
  async sendBatch(@Body() optionsList: EmailOptions[]) {
    return this.emailService.sendBatch(optionsList);
  }

  @Get('email/verify')
  @ApiOperation({ summary: 'Verify email service connection' })
  async verifyEmail() {
    const connected = await this.emailService.verifyConnection();
    return { connected };
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'tenantId', required: true })
  async getPreferences(@Query('userId') userId: string, @Query('tenantId') tenantId: string) {
    return this.preferencesService.getPreferences(userId, tenantId);
  }

  @Put('preferences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'tenantId', required: true })
  async updatePreferences(
    @Query('userId') userId: string,
    @Query('tenantId') tenantId: string,
    @Body() preferences: Record<string, unknown>,
  ) {
    return this.preferencesService.updatePreferences(userId, tenantId, preferences as any);
  }

  @Post('preferences/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset notification preferences to defaults' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'tenantId', required: true })
  async resetPreferences(@Query('userId') userId: string, @Query('tenantId') tenantId: string) {
    return this.preferencesService.resetToDefaults(userId, tenantId);
  }
}
