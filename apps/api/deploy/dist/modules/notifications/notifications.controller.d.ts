import { EmailService, type EmailOptions } from './email.service';
import { NotificationPreferencesService } from './notification-preferences.service';
export declare class NotificationsController {
    private readonly emailService;
    private readonly preferencesService;
    constructor(emailService: EmailService, preferencesService: NotificationPreferencesService);
    sendEmail(options: EmailOptions): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendBatch(optionsList: EmailOptions[]): Promise<{
        sent: number;
        failed: number;
    }>;
    verifyEmail(): Promise<{
        connected: boolean;
    }>;
    getPreferences(userId: string, tenantId: string): Promise<import("./email.service").NotificationPreference | null>;
    updatePreferences(userId: string, tenantId: string, preferences: Record<string, unknown>): Promise<import("./email.service").NotificationPreference>;
    resetPreferences(userId: string, tenantId: string): Promise<import("./email.service").NotificationPreference>;
}
