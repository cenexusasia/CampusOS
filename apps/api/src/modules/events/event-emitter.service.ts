import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';

export type EventHandler = (payload: any, tenantId: string) => Promise<void>;

@Injectable()
export class EventEmitterService {
  private readonly logger = new Logger(EventEmitterService.name);
  private readonly handlers = new Map<string, EventHandler[]>();

  // Event queue name for BullMQ
  private readonly EVENT_QUEUE = 'events';

  constructor(private readonly queueService: QueueService) {}

  /**
   * Emit an event to the BullMQ queue for durable delivery.
   * Webhook workers pick up from this queue.
   * If Redis is unavailable, falls back to in-process handlers.
   */
  async emit(event: string, payload: any, tenantId: string): Promise<void> {
    try {
      const job = await this.queueService.addJob(
        this.EVENT_QUEUE,
        { event, payload, tenantId },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      );

      if (job) {
        this.logger.debug(
          `Event "${event}" queued as job ${job.id} for tenant ${tenantId}`,
        );
      } else {
        this.logger.warn(
          `Event "${event}" could not be queued (Redis unavailable). Falling back to in-process handlers for tenant ${tenantId}.`,
        );
        await this.runInProcessHandlers(event, payload, tenantId);
      }
    } catch (error: any) {
      this.logger.warn(
        `Failed to queue event "${event}": ${error.message ?? error}. Running in-process handlers.`,
      );
      await this.runInProcessHandlers(event, payload, tenantId);
    }
  }

  /**
   * Register an in-process handler for same-process subscribers.
   */
  async on(event: string, handler: EventHandler): Promise<void> {
    const existing = this.handlers.get(event) ?? [];
    existing.push(handler);
    this.handlers.set(event, existing);
    this.logger.debug(`Handler registered for event "${event}"`);
  }

  /**
   * Remove a previously registered handler.
   */
  off(event: string, handler: EventHandler): void {
    const existing = this.handlers.get(event);
    if (!existing) return;
    const filtered = existing.filter((h) => h !== handler);
    if (filtered.length === 0) {
      this.handlers.delete(event);
    } else {
      this.handlers.set(event, filtered);
    }
    this.logger.debug(`Handler removed for event "${event}"`);
  }

  /**
   * Run all in-process handlers for a given event.
   */
  async runInProcessHandlers(
    event: string,
    payload: any,
    tenantId: string,
  ): Promise<void> {
    const handlers = this.handlers.get(event) ?? [];
    if (handlers.length === 0) return;

    this.logger.debug(
      `Running ${handlers.length} in-process handler(s) for event "${event}"`,
    );

    await Promise.allSettled(
      handlers.map((handler) =>
        handler(payload, tenantId).catch((err) => {
          this.logger.error(
            `In-process handler failed for event "${event}": ${err.message}`,
          );
        }),
      ),
    );
  }
}
