import { Injectable, Logger } from '@nestjs/common';
import type {
  ConnectorPlugin,
  ConnectorConfig,
  ConnectionResult,
  SyncResult,
  ConnectorStatus,
} from '../connector.interface';

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface GoogleConnection {
  id: string;
  tenantId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GoogleService implements ConnectorPlugin {
  readonly provider = "google";
  readonly name = "Google";
  readonly capabilities = {
    sync: true,
    webhook: false,
    oauth: true,
    basicAuth: false,
    apiKey: false,
  };

  private readonly logger = new Logger(GoogleService.name);

  private readonly defaultScopes = [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.rosters.readonly",
    "https://www.googleapis.com/auth/classroom.profile.emails",
  ];

  getAuthUrl(config: GoogleConfig): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: (config.scopes ?? this.defaultScopes).join(" "),
      access_type: "offline",
      prompt: "consent",
    });
    return "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
  }

  async exchangeCode(code: string, config: GoogleConfig): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    this.logger.log("Exchanging auth code for tenant using client ID: " + config.clientId);
    return {
      accessToken: "placeholder_access_token",
      refreshToken: "placeholder_refresh_token",
      expiresIn: 3600,
    };
  }

  async connect(config: GoogleConfig & { tenantId?: string }, tenantId?: string): Promise<ConnectionResult> {
    const resolvedTenantId = tenantId ?? (config as unknown as Record<string, string>).tenantId;
    this.logger.log("Google connect initiated for tenant: " + resolvedTenantId);
    const authUrl = this.getAuthUrl(config);
    return {
      success: true,
      connectionId: "google-oauth-" + resolvedTenantId + "-" + Date.now(),
      siteInfo: { authUrl },
    };
  }

  async listConnections(tenantId: string): Promise<GoogleConnection[]> {
    this.logger.log("Listing Google connections for tenant: " + tenantId);
    return [];
  }

  async disconnect(connectionId: string): Promise<void> {
    this.logger.log("Disconnecting Google connection: " + connectionId);
  }

  async sync(connectionId: string, _options?: { force?: boolean; type?: string }): Promise<SyncResult> {
    this.logger.log("Syncing Google Classroom connection: " + connectionId);
    return { success: true, coursesSynced: 0, usersSynced: 0 };
  }

  async list(tenantId: string): Promise<ConnectorStatus[]> {
    const connections = await this.listConnections(tenantId);
    return connections.map((c) => ({
      id: c.id,
      provider: "google",
      name: "Google - " + c.email,
      status: c.isActive ? "connected" : "disconnected",
      lastSyncAt: null,
      config: { email: c.email },
    }));
  }
}
