import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectorRegistry } from './connectors.registry';
import type { ConnectorPlugin, ConnectorStatus } from './connector.interface';
import { Connector } from '@prisma/client';

export interface ConnectorListItem {
  id: string;
  provider: string;
  name: string;
  status: string;
  lastSyncAt: Date | null;
  config: Record<string, unknown>;
}

@Injectable()
export class ConnectorsService {
  private readonly logger = new Logger(ConnectorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: ConnectorRegistry,
  ) {}

  async listByTenant(tenantId: string): Promise<ConnectorListItem[]> {
    this.logger.log(`Listing connectors for tenant: ${tenantId}`);

    const connectors = await this.prisma.connector.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });

    return connectors.map((connector: Connector) => ({
      id: connector.id,
      provider: connector.provider,
      name: connector.name,
      status: connector.status,
      lastSyncAt: connector.lastSync,
      config: this.stripSecrets(connector.config as Record<string, unknown>),
    }));
  }

  async getConnectorStatuses(tenantId: string): Promise<ConnectorStatus[]> {
    const plugins = this.registry.getAll();
    const results: ConnectorStatus[] = [];

    for (const plugin of plugins) {
      try {
        const statuses = await plugin.list(tenantId);
        results.push(...statuses);
      } catch (error) {
        this.logger.error(`Failed to list ${plugin.provider} connections: ${error}`);
      }
    }

    return results;
  }

  getConnector(provider: string): ConnectorPlugin | undefined {
    return this.registry.get(provider);
  }

  private stripSecrets(config: Record<string, unknown>): Record<string, unknown> {
    if (!config || typeof config !== 'object') {
      return {};
    }

    const sensitiveKeys = ['apiKey', 'api_key', 'apiSecret', 'api_secret', 'secret', 'token', 'password', 'accessToken', 'access_token', 'refreshToken', 'refresh_token', 'clientSecret', 'client_secret'];

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(config)) {
      if (sensitiveKeys.includes(key)) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.stripSecrets(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
