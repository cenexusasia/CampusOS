import { WebhooksService } from './webhooks.service';
import { RegisterWebhookDto } from './dto/register-webhook.dto';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    register(req: any, dto: RegisterWebhookDto): Promise<import("./webhooks.service").Webhook>;
    list(req: any): Promise<import("./webhooks.service").Webhook[]>;
    unregister(req: any, id: string): Promise<{
        message: string;
    }>;
    getLogs(req: any, id: string): Promise<import("./webhooks.service").WebhookLogEntry[]>;
}
