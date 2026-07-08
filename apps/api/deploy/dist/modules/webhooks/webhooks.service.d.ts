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
export declare class WebhooksService {
    private readonly prisma;
    private readonly logger;
    private readonly MAX_RETRIES;
    private readonly BASE_DELAY_MS;
    private readonly REQUEST_TIMEOUT_MS;
    constructor(prisma: PrismaService);
    register(tenantId: string, event: string, url: string, secret?: string): Promise<Webhook>;
    unregister(id: string, tenantId: string): Promise<boolean>;
    listByTenant(tenantId: string): Promise<Webhook[]>;
    getLogs(webhookId: string, tenantId: string): Promise<WebhookLogEntry[]>;
    deliver(event: string, payload: any, tenantId: string): Promise<void>;
    private deliverToWebhook;
    private signPayload;
    private logDelivery;
}
