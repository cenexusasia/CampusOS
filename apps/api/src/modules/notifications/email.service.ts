import { Injectable, Logger } from '@nestjs/common';

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

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async send(options: EmailOptions): Promise<{ success: boolean; messageId: string }> {
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    this.logger.log(`[EmailService] Sending email to: ${recipients}`);
    this.logger.log(`[EmailService] Subject: ${options.subject}`);

    // TODO: Integrate with nodemailer when SMTP config is available
    // const transporter = nodemailer.createTransport({ ... });
    // const info = await transporter.sendMail({ ... });

    // Placeholder: log to console
    console.log('\n=== EMAIL (placeholder) ===');
    console.log(`To: ${recipients}`);
    if (options.cc) {
      const cc = Array.isArray(options.cc) ? options.cc.join(', ') : options.cc;
      console.log(`CC: ${cc}`);
    }
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.body}`);
    console.log('===========================\n');

    return { success: true, messageId: `email_${Date.now()}` };
  }

  async sendBatch(optionsList: EmailOptions[]): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const options of optionsList) {
      try {
        await this.send(options);
        sent++;
      } catch (error) {
        this.logger.error(`Failed to send email to ${options.to}: ${error}`);
        failed++;
      }
    }

    return { sent, failed };
  }

  async verifyConnection(): Promise<boolean> {
    // TODO: Verify SMTP connection when configured
    this.logger.log('[EmailService] SMTP not configured — using console placeholder');
    return true;
  }
}
