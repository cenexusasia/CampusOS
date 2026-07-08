import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  /**
   * Add a job to the specified queue.
   * Returns the Job if Redis is available, or null with a warning if not.
   */
  async addJob<T = any>(
    queueName: string,
    data: T,
    opts?: object,
  ): Promise<Job<T> | null> {
    try {
      // Create an ad-hoc queue for the given name so we don't need
      // @InjectQueue decorators for every possible queue.
      const queue = new Queue(queueName, {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
        },
      });
      const job = await queue.add(queueName, data, opts);
      await queue.close();
      return job as Job<T>;
    } catch (error: any) {
      this.logger.warn(
        `Failed to add job to queue "${queueName}": ${error.message ?? error}. Redis may be unavailable.`,
      );
      return null;
    }
  }

  /**
   * Get the status of a job in the specified queue.
   * Returns 'unavailable' when Redis is unreachable.
   */
  async getJobStatus(
    queueName: string,
    jobId: string,
  ): Promise<string | null> {
    try {
      const queue = new Queue(queueName, {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
        },
      });
      const job = await queue.getJob(jobId);
      await queue.close();

      if (!job) return null;

      const state = await job.getState();
      const progress = job.progress;
      const failedReason = job.failedReason;

      return JSON.stringify({
        id: job.id,
        name: job.name,
        state,
        progress,
        failedReason,
        timestamp: job.timestamp,
        finishedOn: job.finishedOn,
        processedOn: job.processedOn,
        attemptsMade: job.attemptsMade,
        data: job.data,
        returnvalue: job.returnvalue,
      });
    } catch (error: any) {
      this.logger.warn(
        `Failed to get job status from queue "${queueName}": ${error.message ?? error}. Redis may be unavailable.`,
      );
      return null;
    }
  }
}
