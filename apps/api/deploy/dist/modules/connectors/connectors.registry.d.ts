import type { ConnectorPlugin } from './connector.interface';
export declare class ConnectorRegistry {
    private readonly logger;
    private connectors;
    register(plugin: ConnectorPlugin): void;
    get(provider: string): ConnectorPlugin | undefined;
    getAll(): ConnectorPlugin[];
    has(provider: string): boolean;
}
