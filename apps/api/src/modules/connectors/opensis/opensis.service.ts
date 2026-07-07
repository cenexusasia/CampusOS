import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface OpenSISConfig {
  apiUrl: string;
  apiKey: string;
  apiSecret?: string;
  schoolId: string;
}

export interface OpenSISConnection {
  id: string;
  tenantId: string;
  type: string;
  name: string;
  provider: string;
  status: string;
  config: unknown;
  lastSync: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class OpenSISService {
  private readonly logger = new Logger(OpenSISService.name);

  constructor(private readonly prisma: PrismaService) {}

  async connect(
    config: OpenSISConfig,
    tenantId: string,
  ): Promise<{ success: boolean; connectionId: string }> {
    this.logger.log(
      `Connecting OpenSIS for tenant ${tenantId} at ${config.apiUrl}`,
    );

    const connector = await this.prisma.connector.create({
      data: {
        tenantId,
        type: 'SIS',
        name: `OpenSIS - School ${config.schoolId}`,
        provider: 'OPENSIS',
        config: config as any,
        status: 'CONNECTED',
      },
    });

    this.logger.log(`OpenSIS connector created: ${connector.id}`);
    return { success: true, connectionId: connector.id };
  }

  async listConnections(tenantId: string): Promise<OpenSISConnection[]> {
    this.logger.log(`Listing OpenSIS connections for tenant: ${tenantId}`);

    const connectors = await this.prisma.connector.findMany({
      where: { tenantId, type: 'SIS' },
      orderBy: { createdAt: 'desc' },
    });

    return connectors.map((c) => ({
      id: c.id,
      tenantId: c.tenantId,
      type: c.type,
      name: c.name,
      provider: c.provider,
      status: c.status,
      config: c.config,
      lastSync: c.lastSync,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async disconnect(connectionId: string): Promise<void> {
    const connector = await this.prisma.connector.findUnique({
      where: { id: connectionId },
    });

    if (!connector) {
      throw new NotFoundException({
        message: 'OpenSIS connection not found',
      });
    }

    await this.prisma.connector.update({
      where: { id: connectionId },
      data: { status: 'DISCONNECTED' },
    });

    this.logger.log(`OpenSIS connection deactivated: ${connectionId}`);
  }

  async sync(
    connectionId: string,
  ): Promise<{
    studentsSynced: number;
    staffSynced: number;
    coursesSynced: number;
  }> {
    this.logger.log(`Syncing OpenSIS connection: ${connectionId}`);

    const connector = await this.prisma.connector.findUnique({
      where: { id: connectionId },
    });

    if (!connector) {
      throw new NotFoundException({
        message: 'OpenSIS connection not found',
      });
    }

    await this.prisma.connector.update({
      where: { id: connectionId },
      data: { lastSync: new Date() },
    });

    // TODO: Implement actual sync via REST API
    return { studentsSynced: 0, staffSynced: 0, coursesSynced: 0 };
  }
}
