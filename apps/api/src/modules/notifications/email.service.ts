import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

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
  private transporter: Transporter | null = null;
  private readonly isConfigured: boolean;

  constructor() {
    const smtpPass = process.env.SMTP_PASS;
    this.isConfigured = !!smtpPass;

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
        auth: {
          user: process.env.SMTP_USER || '',
          pass: smtpPass,
        },
      });

      this.logger.log(
        `[EmailService] SMTP configured: ${process.env.SMTP_HOST || 'smtp.sendgrid.net'}:${process.env.SMTP_PORT || '587'}`,
      );
    } else {
      this.logger.warn(
        '[EmailService] SMTP_PASS not set — using console fallback for email sending',
      );
    }
  }

  private get fromAddress(): string {
    return process.env.SMTP_FROM || 'noreply@campusos.com';
  }

  async send(options: EmailOptions): Promise<{ success: boolean; messageId: string }> {
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    if (this.transporter && this.isConfigured) {
      try {
        const info = await this.transporter.sendMail({
          from: this.fromAddress,
          to: options.to,
          cc: options.cc,
          bcc: options.bcc,
          subject: options.subject,
          text: options.body,
          html: options.html,
        });

        this.logger.log(
          `[EmailService] Email sent to: ${recipients} — MessageID: ${info.messageId}`,
        );

        return { success: true, messageId: info.messageId };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`[EmailService] Failed to send email to ${recipients}: ${errorMessage}`);
        throw error;
      }
    }

    // Console fallback when SMTP is not configured
    this.logger.log(`[EmailService] (console) Sending email to: ${recipients}`);
    this.logger.log(`[EmailService] (console) Subject: ${options.subject}`);

    console.log('\n=== EMAIL (console fallback) ===');
    console.log(`To: ${recipients}`);
    if (options.cc) {
      const cc = Array.isArray(options.cc) ? options.cc.join(', ') : options.cc;
      console.log(`CC: ${cc}`);
    }
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.body}`);
    console.log('=================================\n');

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
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`[EmailService] Failed to send email to ${options.to}: ${errorMessage}`);
        failed++;
      }
    }

    return { sent, failed };
  }

  async sendWelcomeEmail(
    to: string,
    userName: string,
    tenantName: string,
  ): Promise<{ success: boolean; messageId: string }> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a56db;">Welcome to CampusOS, ${userName}!</h1>
        <p>You have been added to <strong>${tenantName}</strong>.</p>
        <p>Your account is ready to use. Log in to get started with your personalized dashboard, AI-powered tools, and workflow automation.</p>
        <a href="${appUrl}/login"
           style="display: inline-block; padding: 12px 24px; background-color: #1a56db; color: #ffffff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Log In to CampusOS
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          If you have any questions, please contact your institution administrator.
        </p>
      </div>
    `;

    return this.send({
      to,
      subject: `Welcome to CampusOS — ${tenantName}`,
      body: `Welcome to CampusOS, ${userName}!\n\nYou have been added to ${tenantName}.\n\nLog in at ${appUrl}/login`,
      html,
    });
  }

  async sendPasswordReset(
    to: string,
    resetToken: string,
    userName: string,
  ): Promise<{ success: boolean; messageId: string }> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a56db;">Reset Your Password</h1>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your CampusOS password. Click the button below to create a new password:</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #1a56db; color: #ffffff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          Link not working? Copy and paste this URL into your browser:<br/>
          <span style="color: #1a56db;">${resetUrl}</span>
        </p>
      </div>
    `;

    return this.send({
      to,
      subject: 'Reset Your CampusOS Password',
      body: `Hi ${userName},\n\nWe received a request to reset your CampusOS password.\n\nReset your password here: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request a password reset, please ignore this email.`,
      html,
    });
  }

  async sendInvitation(
    to: string,
    organizationName: string,
    role: string,
    inviteLink: string,
  ): Promise<{ success: boolean; messageId: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a56db;">You're Invited!</h1>
        <p>You have been invited to join <strong>${organizationName}</strong> on CampusOS as a <strong>${role}</strong>.</p>
        <p>CampusOS provides AI-powered dashboards, workflow automation, and integrated learning tools for your institution.</p>
        <a href="${inviteLink}"
           style="display: inline-block; padding: 12px 24px; background-color: #1a56db; color: #ffffff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Accept Invitation
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          This invitation was sent by ${organizationName}. If you were not expecting this invitation, you can safely ignore this email.
        </p>
      </div>
    `;

    return this.send({
      to,
      subject: `You're Invited to Join ${organizationName} on CampusOS`,
      body: `You have been invited to join ${organizationName} on CampusOS as a ${role}.\n\nAccept your invitation here: ${inviteLink}\n\nIf you were not expecting this invitation, you can safely ignore this email.`,
      html,
    });
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('[EmailService] SMTP not configured — cannot verify connection');
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('[EmailService] SMTP connection verified successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[EmailService] SMTP connection verification failed: ${errorMessage}`);
      return false;
    }
  }
}
