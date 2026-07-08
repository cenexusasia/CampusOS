import { Job } from 'bullmq';
export declare class QueueService {
    private readonly logger;
    addJob<T = any>(queueName: string, data: T, opts?: object): Promise<Job<T> | null>;
    getJobStatus(queueName: string, jobId: string): Promise<string | null>;
}
