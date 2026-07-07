import type { NotificationPreference } from './email.service';
export declare class NotificationPreferencesService {
    private readonly logger;
    getPreferences(userId: string, tenantId: string): Promise<NotificationPreference | null>;
    updatePreferences(userId: string, tenantId: string, preferences: Partial<Omit<NotificationPreference, 'id' | 'userId' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Promise<NotificationPreference>;
    resetToDefaults(userId: string, tenantId: string): Promise<NotificationPreference>;
}
