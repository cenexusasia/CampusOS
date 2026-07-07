import type { HealthResponse } from '@campusos/shared';
export declare class HealthController {
    private readonly startTime;
    private readonly version;
    getHealth(): HealthResponse;
}
