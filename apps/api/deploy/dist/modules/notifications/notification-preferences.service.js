"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NotificationPreferencesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreferencesService = void 0;
const common_1 = require("@nestjs/common");
let NotificationPreferencesService = NotificationPreferencesService_1 = class NotificationPreferencesService {
    logger = new common_1.Logger(NotificationPreferencesService_1.name);
    async getPreferences(userId, tenantId) {
        this.logger.log(`Fetching notification preferences for user ${userId} in tenant ${tenantId}`);
        return null;
    }
    async updatePreferences(userId, tenantId, preferences) {
        this.logger.log(`Updating notification preferences for user ${userId} in tenant ${tenantId}`);
        const updated = {
            id: `pref_${Date.now()}`,
            tenantId,
            userId,
            emailNotifications: preferences.emailNotifications ?? true,
            inAppNotifications: preferences.inAppNotifications ?? true,
            digestFrequency: preferences.digestFrequency ?? 'instant',
            categories: preferences.categories ?? {
                system: true,
                academic: true,
                financial: false,
                communication: true,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return updated;
    }
    async resetToDefaults(userId, tenantId) {
        this.logger.log(`Resetting notification preferences for user ${userId} in tenant ${tenantId}`);
        return this.updatePreferences(userId, tenantId, {});
    }
};
exports.NotificationPreferencesService = NotificationPreferencesService;
exports.NotificationPreferencesService = NotificationPreferencesService = NotificationPreferencesService_1 = __decorate([
    (0, common_1.Injectable)()
], NotificationPreferencesService);
