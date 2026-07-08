import { Injectable, Logger } from '@nestjs/common';
import type { ConnectorPlugin } from './connector.interface';

@Injectable()
export class ConnectorRegistry {
  private readonly logger = new Logger(ConnectorRegistry.name);
  private connectors = new Map<string, ConnectorPlugin>();

  register(plugin: ConnectorPlugin): void {
    if (!plugin || !plugin.provider) {
      this.logger.warn('Attempted to register connector with missing provider — skipping');
      return;
    }
    const key = plugin.provider.toLowerCase();
    if (this.connectors.has(key)) {
      this.logger.warn(`Overwriting existing connector registration for provider: ${plugin.provider}`);
    }
    this.connectors.set(key, plugin);
    this.logger.log(`Registered connector: ${plugin.name} (${plugin.provider})`);
  }

  get(provider: string): ConnectorPlugin | undefined {
    return this.connectors.get(provider.toLowerCase());
  }

  getAll(): ConnectorPlugin[] {
    return Array.from(this.connectors.values());
  }

  has(provider: string): boolean {
    return this.connectors.has(provider.toLowerCase());
  }
}
