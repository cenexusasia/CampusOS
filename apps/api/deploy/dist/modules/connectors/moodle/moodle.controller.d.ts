import { MoodleService, type MoodleConfig } from './moodle.service';
export declare class MoodleController {
    private readonly moodleService;
    constructor(moodleService: MoodleService);
    connect(config: MoodleConfig, tenantId: string): Promise<{
        success: boolean;
        connectionId: string;
        siteInfo?: unknown;
    }>;
    list(tenantId: string): Promise<import("./moodle.service").MoodleConnection[]>;
    sync(id: string): Promise<{
        coursesSynced: number;
        usersSynced: number;
    }>;
    disconnect(id: string): Promise<void>;
}
