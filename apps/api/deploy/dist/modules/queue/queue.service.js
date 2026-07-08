"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
let QueueService = QueueService_1 = class QueueService {
    logger = new common_1.Logger(QueueService_1.name);
    async addJob(queueName, data, opts) {
        try {
            const queue = new bullmq_1.Queue(queueName, {
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379', 10),
                    password: process.env.REDIS_PASSWORD || undefined,
                },
            });
            const job = await queue.add(queueName, data, opts);
            await queue.close();
            return job;
        }
        catch (error) {
            this.logger.warn(`Failed to add job to queue "${queueName}": ${error.message ?? error}. Redis may be unavailable.`);
            return null;
        }
    }
    async getJobStatus(queueName, jobId) {
        try {
            const queue = new bullmq_1.Queue(queueName, {
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379', 10),
                    password: process.env.REDIS_PASSWORD || undefined,
                },
            });
            const job = await queue.getJob(jobId);
            await queue.close();
            if (!job)
                return null;
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
        }
        catch (error) {
            this.logger.warn(`Failed to get job status from queue "${queueName}": ${error.message ?? error}. Redis may be unavailable.`);
            return null;
        }
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)()
], QueueService);
