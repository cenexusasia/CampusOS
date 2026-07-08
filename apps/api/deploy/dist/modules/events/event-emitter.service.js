"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventEmitterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitterService = void 0;
const common_1 = require("@nestjs/common");
const queue_service_1 = require("../queue/queue.service");
let EventEmitterService = EventEmitterService_1 = class EventEmitterService {
    queueService;
    logger = new common_1.Logger(EventEmitterService_1.name);
    handlers = new Map();
    EVENT_QUEUE = 'events';
    constructor(queueService) {
        this.queueService = queueService;
    }
    async emit(event, payload, tenantId) {
        try {
            const job = await this.queueService.addJob(this.EVENT_QUEUE, { event, payload, tenantId }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
            });
            if (job) {
                this.logger.debug(`Event "${event}" queued as job ${job.id} for tenant ${tenantId}`);
            }
            else {
                this.logger.warn(`Event "${event}" could not be queued (Redis unavailable). Falling back to in-process handlers for tenant ${tenantId}.`);
                await this.runInProcessHandlers(event, payload, tenantId);
            }
        }
        catch (error) {
            this.logger.warn(`Failed to queue event "${event}": ${error.message ?? error}. Running in-process handlers.`);
            await this.runInProcessHandlers(event, payload, tenantId);
        }
    }
    async on(event, handler) {
        const existing = this.handlers.get(event) ?? [];
        existing.push(handler);
        this.handlers.set(event, existing);
        this.logger.debug(`Handler registered for event "${event}"`);
    }
    off(event, handler) {
        const existing = this.handlers.get(event);
        if (!existing)
            return;
        const filtered = existing.filter((h) => h !== handler);
        if (filtered.length === 0) {
            this.handlers.delete(event);
        }
        else {
            this.handlers.set(event, filtered);
        }
        this.logger.debug(`Handler removed for event "${event}"`);
    }
    async runInProcessHandlers(event, payload, tenantId) {
        const handlers = this.handlers.get(event) ?? [];
        if (handlers.length === 0)
            return;
        this.logger.debug(`Running ${handlers.length} in-process handler(s) for event "${event}"`);
        await Promise.allSettled(handlers.map((handler) => handler(payload, tenantId).catch((err) => {
            this.logger.error(`In-process handler failed for event "${event}": ${err.message}`);
        })));
    }
};
exports.EventEmitterService = EventEmitterService;
exports.EventEmitterService = EventEmitterService = EventEmitterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService])
], EventEmitterService);
