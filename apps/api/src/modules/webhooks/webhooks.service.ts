import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';

export interface Webhook {
  id: string;
  tenantId: string;
  event: string;
  url: string;
  secret: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookLogEntry {
  id: string;
  webhookId: string;
  status: number;
  response: string | null;
  duration: number;
  createdAt: Date;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY_MS = 1000; // 1s base for exponential backoff
  private readonly REQUEST_TIMEOUT_MS = 10_000;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register a new webhook for a tenant + event combination.
   */
  async register(
    tenantId: string,
    event: string,
    url: string,
    secret?: string,
  ): Promise<Webhook> {
    this.logger.log(
      `Registering webhook for tenant ${tenantId}, event "${event}" -> ${url}`,
    );

    const webhook = await this.prisma.webhook.create({
      data: {
        tenantId,
        event,
        url,
        secret: secret ?? null,
        active: true,
      },
    });

    return webhook;
  }

  /**
   * Remove a webhook by id, scoped to tenant.
   */
  async unregister(id: string, tenantId: string): Promise<boolean> {
    const existing = await this.prisma.webhook.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return false;
    }

    await this.prisma.webhook.delete({ where: { id } });
    this.logger.log(`Webhook ${id} removed for tenant ${tenantId}`);
    return true;
  }

  /**
   * List all webhooks for a tenant.
   */
  async listByTenant(tenantId: string): Promise<Webhook[]> {
    return this.prisma.webhook.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get delivery logs for a webhook, scoped to tenant.
   */
  async getLogs(
    webhookId: string,
    tenantId: string,
  ): Promise<WebhookLogEntry[]> {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id: webhookId, tenantId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return this.prisma.webhookLog.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Deliver a payload to all webhooks registered for the given event + tenant.
   * Called by the BullMQ worker (or directly from the event emitter).
   */
  async deliver(event: string, payload: any, tenantId: string): Promise<void> {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        tenantId,
        event,
        active: true,
      },
    });

    if (webhooks.length === 0) {
      this.logger.debug(
        `No active webhooks for event "${event}" on tenant ${tenantId}`,
      );
      return;
    }

    this.logger.log(
      `Delivering event "${event}" to ${webhooks.length} webhook(s) for tenant ${tenantId}`,
    );

    const payloadJson = JSON.stringify(payload);

    await Promise.allSettled(
      webhooks.map((wh) => this.deliverToWebhook(wh, payloadJson)),
    );
  }

  /**
   * Deliver to a single webhook with retry logic.
   */
  private async deliverToWebhook(
    webhook: Webhook,
    payloadJson: string,
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const startTime = Date.now();

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Webhook-Event': webhook.event,
          'X-Webhook-Delivery': `attempt-${attempt}`,
          'User-Agent': 'CampusOS-Webhook/1.0',
        };

        // Add HMAC signature if secret is configured
        if (webhook.secret) {
          const signature = this.signPayload(payloadJson, webhook.secret);
          headers['X-Webhook-Signature'] = signature;
          headers['X-Webhook-Signature-Algorithm'] = 'sha256';
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.REQUEST_TIMEOUT_MS,
        );

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: payloadJson,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        const responseBody = await response.text();

        // Log the delivery
        await this.logDelivery(
          webhook.id,
          response.status,
          responseBody.slice(0, 1000), // truncate to 1KB
          duration,
        );

        if (response.ok) {
          this.logger.debug(
            `Webhook ${webhook.id} delivered successfully (${response.status}) in ${duration}ms`,
          );
          return; // success
        }

        lastError = new Error(
          `HTTP ${response.status}: ${responseBody.slice(0, 200)}`,
        );

        // Don't retry client errors (4xx) other than 429
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          this.logger.warn(
            `Webhook ${webhook.id} returned client error ${response.status}, not retrying`,
          );
          return;
        }
      } catch (error: any) {
        lastError = error;

        if (error.name === 'AbortError') {
          this.logger.warn(
            `Webhook ${webhook.id} timed out after ${this.REQUEST_TIMEOUT_MS}ms (attempt ${attempt}/${this.MAX_RETRIES})`,
          );
        } else {
          this.logger.warn(
            `Webhook ${webhook.id} delivery failed (attempt ${attempt}/${this.MAX_RETRIES}): ${error.message}`,
          );
        }
      }

      // Exponential backoff before retry
      if (attempt < this.MAX_RETRIES) {
        const delay = this.BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // All retries exhausted
    this.logger.error(
      `Webhook ${webhook.id} failed after ${this.MAX_RETRIES} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Sign a payload with HMAC-SHA256.
   */
  private signPayload(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Log a delivery attempt to the database.
   */
  private async logDelivery(
    webhookId: string,
    status: number,
    response: string,
    duration: number,
  ): Promise<void> {
    try {
      await this.prisma.webhookLog.create({
        data: {
          webhookId,
          status,
          response,
          duration,
        },
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to log webhook delivery: ${error.message}`,
      );
    }
  }
}
