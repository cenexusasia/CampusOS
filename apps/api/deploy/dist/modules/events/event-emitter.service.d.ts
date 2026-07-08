import { QueueService } from '../queue/queue.service';
export type EventHandler = (payload: any, tenantId: string) => Promise<void>;
export declare class EventEmitterService {
    private readonly queueService;
    private readonly logger;
    private readonly handlers;
    private readonly EVENT_QUEUE;
    constructor(queueService: QueueService);
    emit(event: string, payload: any, tenantId: string): Promise<void>;
    on(event: string, handler: EventHandler): Promise<void>;
    off(event: string, handler: EventHandler): void;
    runInProcessHandlers(event: string, payload: any, tenantId: string): Promise<void>;
}
