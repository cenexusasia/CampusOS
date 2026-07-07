import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getTenantSettings(tenantId: string): Promise<{
        status: string;
        plan: {
            id: string;
            name: string;
            tier: string;
            features: import("@prisma/client/runtime/library").JsonValue;
            maxUsers: number;
            maxConnectors: number;
            maxStorageMb: number;
            aiCreditsMonthly: number;
        } | null;
        id: string;
        name: string;
        slug: string;
        domain: string | null;
        logo: string | null;
        planId: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue;
        _count: {
            connectors: number;
            courses: number;
            memberships: number;
        };
    }>;
    updateTenantSettings(tenantId: string, data: {
        name?: string;
        domain?: string;
        logo?: string | null;
        settings?: {
            branding?: {
                primaryColor?: string;
                logo?: string | null;
            };
            locale?: string;
            timezone?: string;
            features?: {
                aiAssistant?: boolean;
                analytics?: boolean;
                connectors?: boolean;
                customBranding?: boolean;
            };
        };
    }): Promise<{
        status: string;
        id: string;
        name: string;
        slug: string;
        domain: string | null;
        logo: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getNotificationSettings(userId: string): Promise<{
        id: string | null;
        channel: string;
        enabled: boolean;
    }[]>;
    updateNotificationSetting(userId: string, channel: string, enabled: boolean): Promise<{
        id: string;
        userId: string;
        channel: string;
        enabled: boolean;
    }>;
    getConnectors(tenantId: string): Promise<{
        status: string;
        type: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        provider: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        lastSync: Date | null;
    }[]>;
    getPlan(tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tier: string;
        price: number;
        currency: string;
        features: import("@prisma/client/runtime/library").JsonValue;
        maxUsers: number;
        maxConnectors: number;
        maxStorageMb: number;
        aiCreditsMonthly: number;
    } | {
        name: string;
        tier: string;
        features: {
            aiAssistant: boolean;
            analytics: boolean;
            connectors: boolean;
            customBranding: boolean;
        };
        maxUsers: number;
        maxConnectors: number;
        maxStorageMb: number;
        aiCreditsMonthly: number;
    } | null>;
}
