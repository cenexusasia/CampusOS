import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@campusos/shared';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTenantSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        logo: true,
        status: true,
        settings: true,
        planId: true,
        plan: {
          select: {
            id: true,
            name: true,
            tier: true,
            features: true,
            maxUsers: true,
            maxConnectors: true,
            maxStorageMb: true,
            aiCreditsMonthly: true,
          },
        },
        _count: {
          select: {
            memberships: true,
            courses: true,
            connectors: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException({
        code: ERROR_CODES.TENANT_NOT_FOUND,
        message: 'Tenant not found',
      });
    }

    return tenant;
  }

  async updateTenantSettings(
    tenantId: string,
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
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException({
        code: ERROR_CODES.TENANT_NOT_FOUND,
        message: 'Tenant not found',
      });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.domain !== undefined) updateData.domain = data.domain;
    if (data.logo !== undefined) updateData.logo = data.logo;

    if (data.settings !== undefined) {
      const currentSettings =
        typeof tenant.settings === 'object' && tenant.settings !== null
          ? (tenant.settings as Record<string, unknown>)
          : {};

      updateData.settings = {
        ...currentSettings,
        ...data.settings,
        branding: {
          ...((currentSettings as any)?.branding ?? {}),
          ...(data.settings.branding ?? {}),
        },
        features: {
          ...((currentSettings as any)?.features ?? {}),
          ...(data.settings.features ?? {}),
        },
      };
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: updateData as any,
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        logo: true,
        status: true,
        settings: true,
      },
    });

    this.logger.log(`Tenant settings updated: ${tenantId}`);
    return updated;
  }

  async getNotificationSettings(userId: string) {
    const settings = await this.prisma.notificationSetting.findMany({
      where: { userId },
    });

    // Return defaults for channels not yet configured
    const channels = ['IN_APP', 'EMAIL', 'PUSH', 'SMS'];
    const configuredChannels = new Set(settings.map((s) => s.channel));

    return channels.map((channel) => {
      const existing = settings.find((s) => s.channel === channel);
      return {
        id: existing?.id ?? null,
        channel,
        enabled: existing?.enabled ?? (channel === 'IN_APP' || channel === 'EMAIL'),
      };
    });
  }

  async updateNotificationSetting(
    userId: string,
    channel: string,
    enabled: boolean,
  ) {
    if (!['IN_APP', 'EMAIL', 'PUSH', 'SMS'].includes(channel)) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Invalid notification channel: ${channel}`,
      });
    }

    return this.prisma.notificationSetting.upsert({
      where: { userId_channel: { userId, channel } },
      create: { userId, channel, enabled },
      update: { enabled },
    });
  }

  async getConnectors(tenantId: string) {
    return this.prisma.connector.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlan(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { planId: true },
    });

    if (!tenant) {
      throw new NotFoundException({
        code: ERROR_CODES.TENANT_NOT_FOUND,
        message: 'Tenant not found',
      });
    }

    if (!tenant.planId) {
      // Return a default free plan shape
      return {
        name: 'Free',
        tier: 'FREE',
        features: {
          aiAssistant: true,
          analytics: false,
          connectors: false,
          customBranding: false,
        },
        maxUsers: 10,
        maxConnectors: 0,
        maxStorageMb: 512,
        aiCreditsMonthly: 100,
      };
    }

    return this.prisma.plan.findUnique({
      where: { id: tenant.planId },
    });
  }
}
