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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    prisma;
    logger = new common_1.Logger(WebhooksService_1.name);
    MAX_RETRIES = 3;
    BASE_DELAY_MS = 1000;
    REQUEST_TIMEOUT_MS = 10_000;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async register(tenantId, event, url, secret) {
        this.logger.log(`Registering webhook for tenant ${tenantId}, event "${event}" -> ${url}`);
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
    async unregister(id, tenantId) {
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
    async listByTenant(tenantId) {
        return this.prisma.webhook.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getLogs(webhookId, tenantId) {
        const webhook = await this.prisma.webhook.findFirst({
            where: { id: webhookId, tenantId },
        });
        if (!webhook) {
            throw new common_1.NotFoundException('Webhook not found');
        }
        return this.prisma.webhookLog.findMany({
            where: { webhookId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async deliver(event, payload, tenantId) {
        const webhooks = await this.prisma.webhook.findMany({
            where: {
                tenantId,
                event,
                active: true,
            },
        });
        if (webhooks.length === 0) {
            this.logger.debug(`No active webhooks for event "${event}" on tenant ${tenantId}`);
            return;
        }
        this.logger.log(`Delivering event "${event}" to ${webhooks.length} webhook(s) for tenant ${tenantId}`);
        const payloadJson = JSON.stringify(payload);
        await Promise.allSettled(webhooks.map((wh) => this.deliverToWebhook(wh, payloadJson)));
    }
    async deliverToWebhook(webhook, payloadJson) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                const startTime = Date.now();
                const headers = {
                    'Content-Type': 'application/json',
                    'X-Webhook-Event': webhook.event,
                    'X-Webhook-Delivery': `attempt-${attempt}`,
                    'User-Agent': 'CampusOS-Webhook/1.0',
                };
                if (webhook.secret) {
                    const signature = this.signPayload(payloadJson, webhook.secret);
                    headers['X-Webhook-Signature'] = signature;
                    headers['X-Webhook-Signature-Algorithm'] = 'sha256';
                }
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT_MS);
                const response = await fetch(webhook.url, {
                    method: 'POST',
                    headers,
                    body: payloadJson,
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                const duration = Date.now() - startTime;
                const responseBody = await response.text();
                await this.logDelivery(webhook.id, response.status, responseBody.slice(0, 1000), duration);
                if (response.ok) {
                    this.logger.debug(`Webhook ${webhook.id} delivered successfully (${response.status}) in ${duration}ms`);
                    return;
                }
                lastError = new Error(`HTTP ${response.status}: ${responseBody.slice(0, 200)}`);
                if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                    this.logger.warn(`Webhook ${webhook.id} returned client error ${response.status}, not retrying`);
                    return;
                }
            }
            catch (error) {
                lastError = error;
                if (error.name === 'AbortError') {
                    this.logger.warn(`Webhook ${webhook.id} timed out after ${this.REQUEST_TIMEOUT_MS}ms (attempt ${attempt}/${this.MAX_RETRIES})`);
                }
                else {
                    this.logger.warn(`Webhook ${webhook.id} delivery failed (attempt ${attempt}/${this.MAX_RETRIES}): ${error.message}`);
                }
            }
            if (attempt < this.MAX_RETRIES) {
                const delay = this.BASE_DELAY_MS * Math.pow(2, attempt - 1);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        this.logger.error(`Webhook ${webhook.id} failed after ${this.MAX_RETRIES} attempts: ${lastError?.message}`);
    }
    signPayload(payload, secret) {
        return (0, node_crypto_1.createHmac)('sha256', secret).update(payload).digest('hex');
    }
    async logDelivery(webhookId, status, response, duration) {
        try {
            await this.prisma.webhookLog.create({
                data: {
                    webhookId,
                    status,
                    response,
                    duration,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to log webhook delivery: ${error.message}`);
        }
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhooksService);
