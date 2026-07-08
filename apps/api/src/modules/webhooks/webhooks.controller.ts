import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WebhooksService } from './webhooks.service';
import { RegisterWebhookDto } from './dto/register-webhook.dto';

@ApiTags('Webhooks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a webhook URL for an event type' })
  @ApiResponse({ status: 201, description: 'Webhook registered successfully' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Request() req: any, @Body() dto: RegisterWebhookDto) {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      // Extract tenant from memberships if not on request directly
      const tenantId = req.user.tenantId || req.user.tenantIds?.[0];
    }
    return this.webhooksService.register(tenantId, dto.event, dto.url, dto.secret);
  }

  @Get()
  @ApiOperation({ summary: 'List webhooks for the current tenant' })
  @ApiResponse({ status: 200, description: 'Webhooks retrieved successfully' })
  async list(@Request() req: any) {
    const tenantId = req.user.tenantId || req.user.tenantIds?.[0];
    return this.webhooksService.listByTenant(tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook removed successfully' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async unregister(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId || req.user.tenantIds?.[0];
    const deleted = await this.webhooksService.unregister(id, tenantId);
    if (!deleted) {
      throw new NotFoundException('Webhook not found');
    }
    return { message: 'Webhook removed successfully' };
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'View delivery logs for a webhook' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async getLogs(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId || req.user.tenantIds?.[0];
    const logs = await this.webhooksService.getLogs(id, tenantId);
    return logs;
  }
}
