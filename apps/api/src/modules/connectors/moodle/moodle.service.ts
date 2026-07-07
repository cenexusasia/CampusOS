import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface MoodleConfig {
  ltiUrl: string;
  ltiConsumerKey: string;
  ltiSharedSecret: string;
  restApiUrl?: string;
  restApiToken?: string;
}

export interface MoodleConnection {
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
export class MoodleService {
  private readonly logger = new Logger(MoodleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async connect(
    config: MoodleConfig,
    tenantId: string,
  ): Promise<{ success: boolean; connectionId: string }> {
    this.logger.log(`Connecting Moodle for tenant ${tenantId} at ${config.ltiUrl}`);

    const connector = await this.prisma.connector.create({
      data: {
        tenantId,
        type: 'LMS',
        name: `Moodle - ${config.ltiUrl}`,
        provider: 'MOODLE',
        config: config as any,
        status: 'CONNECTED',
      },
    });

    this.logger.log(`Moodle connector created: ${connector.id}`);
    return { success: true, connectionId: connector.id };
  }

  async listConnections(tenantId: string): Promise<MoodleConnection[]> {
    this.logger.log(`Listing Moodle connections for tenant: ${tenantId}`);

    const connectors = await this.prisma.connector.findMany({
      where: { tenantId, type: 'LMS' },
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
        message: 'Moodle connection not found',
      });
    }

    await this.prisma.connector.update({
      where: { id: connectionId },
      data: { status: 'DISCONNECTED' },
    });

    this.logger.log(`Moodle connection deactivated: ${connectionId}`);
  }

  async sync(
    connectionId: string,
  ): Promise<{ coursesSynced: number; usersSynced: number }> {
    this.logger.log(`Syncing Moodle connection: ${connectionId}`);

    const connector = await this.prisma.connector.findUnique({
      where: { id: connectionId },
    });

    if (!connector) {
      throw new NotFoundException({
        message: 'Moodle connection not found',
      });
    }

    await this.prisma.connector.update({
      where: { id: connectionId },
      data: { lastSync: new Date() },
    });

    // TODO: Implement actual sync via REST API
    return { coursesSynced: 0, usersSynced: 0 };
  }
}
