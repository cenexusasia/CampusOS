import { OnModuleInit } from '@nestjs/common';
import { ConnectorRegistry } from './connectors.registry';
import { MoodleService } from './moodle/moodle.service';
import { OpenSISService } from './opensis/opensis.service';
import { GoogleService } from './google/google.service';
export declare class ConnectorsModule implements OnModuleInit {
    private readonly registry;
    private readonly moodleService;
    private readonly openSISService;
    private readonly googleService;
    private readonly logger;
    constructor(registry: ConnectorRegistry, moodleService: MoodleService, openSISService: OpenSISService, googleService: GoogleService);
    onModuleInit(): void;
}
