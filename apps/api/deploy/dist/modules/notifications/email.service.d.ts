export interface EmailOptions {
    to: string | string[];
    subject: string;
    body: string;
    html?: string;
    cc?: string | string[];
    bcc?: string | string[];
}
export interface NotificationPreference {
    id: string;
    tenantId: string;
    userId: string;
    emailNotifications: boolean;
    inAppNotifications: boolean;
    digestFrequency: 'instant' | 'daily' | 'weekly' | 'never';
    categories: {
        system: boolean;
        academic: boolean;
        financial: boolean;
        communication: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare class EmailService {
    private readonly logger;
    private transporter;
    private readonly isConfigured;
    constructor();
    private get fromAddress();
    send(options: EmailOptions): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendBatch(optionsList: EmailOptions[]): Promise<{
        sent: number;
        failed: number;
    }>;
    sendWelcomeEmail(to: string, userName: string, tenantName: string): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendPasswordReset(to: string, resetToken: string, userName: string): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendInvitation(to: string, organizationName: string, role: string, inviteLink: string): Promise<{
        success: boolean;
        messageId: string;
    }>;
    verifyConnection(): Promise<boolean>;
}
