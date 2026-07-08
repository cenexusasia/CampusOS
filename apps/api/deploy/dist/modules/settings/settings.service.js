"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const shared_1 = require("@campusos/shared");
let SettingsService = SettingsService_1 = class SettingsService {
    prisma;
    logger = new common_1.Logger(SettingsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTenantSettings(tenantId) {
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
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.TENANT_NOT_FOUND,
                message: 'Tenant not found',
            });
        }
        return tenant;
    }
    async updateTenantSettings(tenantId, data) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant) {
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.TENANT_NOT_FOUND,
                message: 'Tenant not found',
            });
        }
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.domain !== undefined)
            updateData.domain = data.domain;
        if (data.logo !== undefined)
            updateData.logo = data.logo;
        if (data.settings !== undefined) {
            const currentSettings = typeof tenant.settings === 'object' && tenant.settings !== null
                ? tenant.settings
                : {};
            updateData.settings = {
                ...currentSettings,
                ...data.settings,
                branding: {
                    ...(currentSettings?.branding ?? {}),
                    ...(data.settings.branding ?? {}),
                },
                features: {
                    ...(currentSettings?.features ?? {}),
                    ...(data.settings.features ?? {}),
                },
            };
        }
        const updated = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: updateData,
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
    async getNotificationSettings(userId) {
        const settings = await this.prisma.notificationSetting.findMany({
            where: { userId },
        });
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
    async updateNotificationSetting(userId, channel, enabled) {
        if (!['IN_APP', 'EMAIL', 'PUSH', 'SMS'].includes(channel)) {
            throw new common_1.BadRequestException({
                code: shared_1.ERROR_CODES.VALIDATION_ERROR,
                message: `Invalid notification channel: ${channel}`,
            });
        }
        return this.prisma.notificationSetting.upsert({
            where: { userId_channel: { userId, channel } },
            create: { userId, channel, enabled },
            update: { enabled },
        });
    }
    async getConnectors(tenantId) {
        return this.prisma.connector.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getPlan(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { planId: true },
        });
        if (!tenant) {
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.TENANT_NOT_FOUND,
                message: 'Tenant not found',
            });
        }
        if (!tenant.planId) {
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
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
