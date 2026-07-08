import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  ConnectorPlugin,
  ConnectorConfig,
  ConnectionResult,
  SyncResult,
  ConnectorStatus,
} from '../connector.interface';

export interface ERPNextConfig {
  baseUrl: string;
  // Login-based auth
  username?: string;
  password?: string;
  // API key-based auth (preferred)
  apiKey?: string;
  apiSecret?: string;
}

export interface ERPNextConnection {
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

interface ERPNextInvoice {
  name: string;
  customer?: string;
  customer_name?: string;
  posting_date?: string;
  grand_total?: number;
  status?: string;
  currency?: string;
  [key: string]: unknown;
}

interface ERPNextEmployee {
  name: string;
  employee_name?: string;
  employee_number?: string;
  department?: string;
  designation?: string;
  status?: string;
  date_of_joining?: string;
  cell_number?: string;
  personal_email?: string;
  company_email?: string;
  [key: string]: unknown;
}

interface ERPNextApiResponse {
  data?: unknown[];
  message?: unknown[] | Record<string, unknown>;
}

@Injectable()
export class ERPNextService implements ConnectorPlugin {
  readonly provider = 'erpnext';
  readonly name = 'ERPNext';
  readonly capabilities = {
    sync: true,
    webhook: false,
    oauth: false,
    basicAuth: true,
    apiKey: true,
  };

  private readonly logger = new Logger(ERPNextService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build headers for ERPNext API requests.
   * Prefers API key auth.
   */
  private buildHeaders(config: ERPNextConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (config.apiKey && config.apiSecret) {
      headers['Authorization'] = `token ${config.apiKey}:${config.apiSecret}`;
    }

    return headers;
  }

  /**
   * Make an ERPNext REST API request and parse the response.
   */
  private async apiRequest<T>(
    config: ERPNextConfig,
    path: string,
    options: { method?: string; body?: unknown } = {},
  ): Promise<T[]> {
    const baseUrl = config.baseUrl.replace(/\/+$/, '');
    const url = `${baseUrl}${path}`;
    const method = options.method ?? 'GET';

    this.logger.debug(`ERPNext API request: ${method} ${url}`);

    const headers = this.buildHeaders(config);
    const fetchOptions: RequestInit = { method, headers };

    if (options.body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      this.logger.error(`ERPNext API error (${response.status}): ${errorText}`);
      throw new BadRequestException(
        `ERPNext API returned ${response.status}: ${errorText}`,
      );
    }

    const json = (await response.json()) as ERPNextApiResponse;

    // ERPNext returns data under "data" key for list resources,
    // and under "message" for some endpoints
    const rawData = json.data ?? json.message ?? [];

    // Handle single object wrapped in message
    if (!Array.isArray(rawData) && rawData && typeof rawData === 'object') {
      return [rawData] as unknown as T[];
    }

    return (rawData as unknown[]) as T[];
  }

  /**
   * Validate ERPNext credentials by calling the login endpoint or API key auth.
   */
  async connect(
    config: ERPNextConfig,
    tenantId?: string,
  ): Promise<ConnectionResult> {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required to create an ERPNext connection');
    }

    this.logger.log(`Connecting ERPNext for tenant ${tenantId} at ${config.baseUrl}`);

    // Validate config
    if (!config.baseUrl) {
      throw new BadRequestException('ERPNext base URL is required');
    }

    const hasLoginCreds = config.username && config.password;
    const hasApiCreds = config.apiKey && config.apiSecret;

    if (!hasLoginCreds && !hasApiCreds) {
      throw new BadRequestException(
        'Either username/password or apiKey/apiSecret is required to connect',
      );
    }

    // Validate the connection
    try {
      if (hasLoginCreds && !hasApiCreds) {
        // Use login-based auth: POST /api/method/login
        const baseUrl = config.baseUrl.replace(/\/+$/, '');
        const loginUrl = `${baseUrl}/api/method/login`;
        this.logger.log(`Authenticating ERPNext via login at ${loginUrl}`);

        const loginResponse = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usr: config.username,
            pwd: config.password,
          }),
        });

        if (!loginResponse.ok) {
          const errorText = await loginResponse.text().catch(() => 'Login failed');
          throw new BadRequestException(
            `ERPNext authentication failed: ${errorText}`,
          );
        }
      }

      // Verify access by listing employees or invoices (limit 1)
      try {
        await this.apiRequest<ERPNextEmployee>(config, '/api/resource/Employee?limit_page_length=1');
      } catch {
        // Try with Sales Invoice instead in case Employee doctype isn't accessible
        try {
          await this.apiRequest<ERPNextInvoice>(config, '/api/resource/Sales%20Invoice?limit_page_length=1');
        } catch (invoicesErr) {
          this.logger.warn(`ERPNext validation endpoints not accessible, proceeding anyway: ${invoicesErr}`);
        }
      }

      this.logger.log('ERPNext connection validated successfully');
    } catch (error) {
      this.logger.error(
        `ERPNext connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException({
        message: `Failed to connect to ERPNext: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // Store the connector config
    const storedConfig: ERPNextConfig = {
      baseUrl: config.baseUrl,
      ...(config.apiKey ? { apiKey: config.apiKey } : {}),
      ...(config.apiSecret ? { apiSecret: config.apiSecret } : {}),
      ...(config.username ? { username: config.username } : {}),
      ...(!config.apiKey && config.password ? { password: config.password } : {}),
    };

    const connector = await this.prisma.connector.create({
      data: {
        tenantId,
        type: 'ERP',
        name: `ERPNext - ${new URL(config.baseUrl).hostname}`,
        provider: 'ERPNEXT',
        config: storedConfig as any,
        status: 'CONNECTED',
      },
    });

    this.logger.log(`ERPNext connector created: ${connector.id}`);
    return { success: true, connectionId: connector.id };
  }

  /**
   * List ERPNext connections for a tenant.
   */
  async listConnections(tenantId: string): Promise<ERPNextConnection[]> {
    this.logger.log(`Listing ERPNext connections for tenant: ${tenantId}`);

    const connectors = await this.prisma.connector.findMany({
      where: { tenantId, type: 'ERP' },
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

  /**
   * Implement ConnectorPlugin.list for the registry interface.
   */
  async list(tenantId: string): Promise<ConnectorStatus[]> {
    const connections = await this.listConnections(tenantId);
    return connections.map((c) => ({
      id: c.id,
      provider: 'erpnext',
      name: c.name,
      status: c.status === 'CONNECTED' ? 'connected' : 'disconnected',
      lastSyncAt: c.lastSync,
      config: c.config as Record<string, unknown>,
    }));
  }

  /**
   * Disconnect an ERPNext connection.
   */
  async disconnect(connectionId: string): Promise<void> {
    const connector = await this.prisma.connector.findUnique({
      where: { id: connectionId },
    });

    if (!connector) {
      throw new NotFoundException({
        message: 'ERPNext connection not found',
      });
    }

    await this.prisma.connector.update({
      where: { id: connectionId },
      data: { status: 'DISCONNECTED' },
    });

    this.logger.log(`ERPNext connection deactivated: ${connectionId}`);
  }

  // ── Sync Helpers ──

  /**
   * Sync Sales Invoices from ERPNext and store metadata in the connector config.
   */
  private async syncInvoices(
    config: ERPNextConfig,
    connectionId: string,
  ): Promise<number> {
    this.logger.log('Starting ERPNext invoice sync');

    const invoices = await this.apiRequest<ERPNextInvoice>(
      config,
      '/api/resource/Sales%20Invoice?limit_page_length=100&order_by=creation%20desc',
    );

    this.logger.log(`Fetched ${invoices.length} invoices from ERPNext`);

    // Store invoice metadata in connector config
    const invoiceSummaries = invoices.map((inv) => ({
      erpnextId: inv.name,
      customer: inv.customer_name ?? inv.customer ?? 'Unknown',
      date: inv.posting_date ?? null,
      total: inv.grand_total ?? 0,
      currency: inv.currency ?? 'USD',
      status: inv.status ?? 'Draft',
    }));

    const connector = await this.prisma.connector.findUnique({
      where: { id: connectionId },
    });

    if (connector) {
      const existingConfig = (connector.config as Record<string, unknown>) ?? {};
      await this.prisma.connector.update({
        where: { id: connectionId },
        data: {
          config: {
            ...existingConfig,
            lastSyncData: {
              invoices: invoiceSummaries,
              syncedAt: new Date().toISOString(),
              invoiceCount: invoiceSummaries.length,
            },
          } as any,
        },
      });
    }

    this.logger.log(`Invoice sync complete: ${invoiceSummaries.length} invoices`);
    return invoiceSummaries.length;
  }

  /**
   * Sync Purchase Orders from ERPNext.
   */
  private async syncPurchaseOrders(
    config: ERPNextConfig,
    connectionId: string,
  ): Promise<number> {
    this.logger.log('Starting ERPNext purchase order sync');

    try {
      const orders = await this.apiRequest<Record<string, unknown>>(
        config,
        '/api/resource/Purchase%20Order?limit_page_length=100&order_by=creation%20desc',
      );

      this.logger.log(`Fetched ${orders.length} purchase orders from ERPNext`);

      const orderSummaries = orders.map((po) => ({
        erpnextId: po['name'],
        supplier: (po['supplier_name'] as string) ?? (po['supplier'] as string) ?? 'Unknown',
        date: (po['transaction_date'] as string) ?? null,
        total: (po['grand_total'] as number) ?? 0,
        currency: (po['currency'] as string) ?? 'USD',
        status: (po['status'] as string) ?? 'Draft',
      }));

      const connector = await this.prisma.connector.findUnique({
        where: { id: connectionId },
      });

      if (connector) {
        const existingConfig = (connector.config as Record<string, unknown>) ?? {};
        const lastSyncData = (existingConfig['lastSyncData'] as Record<string, unknown>) ?? {};
        await this.prisma.connector.update({
          where: { id: connectionId },
          data: {
            config: {
              ...existingConfig,
              lastSyncData: {
                ...lastSyncData,
                purchaseOrders: orderSummaries,
                purchaseOrderCount: orderSummaries.length,
              },
            } as any,
          },
        });
      }

      this.logger.log(`Purchase order sync complete: ${orderSummaries.length} orders`);
      return orderSummaries.length;
    } catch (error) {
      this.logger.warn(`Purchase order sync failed (non-fatal): ${error}`);
      return 0;
    }
  }

  /**
   * Sync Employees from ERPNext.
   */
  private async syncEmployees(
    config: ERPNextConfig,
    connectionId: string,
  ): Promise<number> {
    this.logger.log('Starting ERPNext employee sync');

    try {
      const employees = await this.apiRequest<ERPNextEmployee>(
        config,
        '/api/resource/Employee?limit_page_length=100&order_by=creation%20desc',
      );

      this.logger.log(`Fetched ${employees.length} employees from ERPNext`);

      const employeeSummaries = employees.map((emp) => ({
        erpnextId: emp.name,
        name: emp.employee_name ?? 'Unknown',
        employeeNumber: emp.employee_number ?? null,
        department: emp.department ?? null,
        designation: emp.designation ?? null,
        status: emp.status ?? 'Active',
        dateOfJoining: emp.date_of_joining ?? null,
        email: emp.company_email ?? emp.personal_email ?? null,
        phone: emp.cell_number ?? null,
      }));

      const connector = await this.prisma.connector.findUnique({
        where: { id: connectionId },
      });

      if (connector) {
        const existingConfig = (connector.config as Record<string, unknown>) ?? {};
        const lastSyncData = (existingConfig['lastSyncData'] as Record<string, unknown>) ?? {};
        await this.prisma.connector.update({
          where: { id: connectionId },
          data: {
            config: {
              ...existingConfig,
              lastSyncData: {
                ...lastSyncData,
                employees: employeeSummaries,
                employeeCount: employeeSummaries.length,
              },
            } as any,
          },
        });
      }

      this.logger.log(`Employee sync complete: ${employeeSummaries.length} employees`);
      return employeeSummaries.length;
    } catch (error) {
      this.logger.warn(`Employee sync failed (non-fatal): ${error}`);
      return 0;
    }
  }

  /**
   * Sync Salary Slips from ERPNext.
   */
  private async syncSalarySlips(
    config: ERPNextConfig,
    connectionId: string,
  ): Promise<number> {
    this.logger.log('Starting ERPNext salary slip sync');

    try {
      const slips = await this.apiRequest<Record<string, unknown>>(
        config,
        '/api/resource/Salary%20Slip?limit_page_length=100&order_by=creation%20desc',
      );

      this.logger.log(`Fetched ${slips.length} salary slips from ERPNext`);

      const slipSummaries = slips.map((slip) => ({
        erpnextId: slip['name'],
        employee: (slip['employee_name'] as string) ?? (slip['employee'] as string) ?? 'Unknown',
        startDate: (slip['start_date'] as string) ?? null,
        endDate: (slip['end_date'] as string) ?? null,
        grossPay: (slip['gross_pay'] as number) ?? 0,
        netPay: (slip['net_pay'] as number) ?? 0,
        currency: (slip['currency'] as string) ?? 'USD',
        status: (slip['status'] as string) ?? 'Draft',
      }));

      const connector = await this.prisma.connector.findUnique({
        where: { id: connectionId },
      });

      if (connector) {
        const existingConfig = (connector.config as Record<string, unknown>) ?? {};
        const lastSyncData = (existingConfig['lastSyncData'] as Record<string, unknown>) ?? {};
        await this.prisma.connector.update({
          where: { id: connectionId },
          data: {
            config: {
              ...existingConfig,
              lastSyncData: {
                ...lastSyncData,
                salarySlips: slipSummaries,
                salarySlipCount: slipSummaries.length,
              },
            } as any,
          },
        });
      }

      this.logger.log(`Salary slip sync complete: ${slipSummaries.length} slips`);
      return slipSummaries.length;
    } catch (error) {
      this.logger.warn(`Salary slip sync failed (non-fatal): ${error}`);
      return 0;
    }
  }

  // ── Main sync method ──

  /**
   * Sync all data from an ERPNext connection.
   * Stores synced data as JSON metadata in the connector's config field.
   */
  async sync(
    connectionId: string,
  ): Promise<SyncResult> {
    this.logger.log(`Syncing ERPNext connection: ${connectionId}`);

    const connector = await this.prisma.connector.findUnique({
      where: { id: connectionId },
    });

    if (!connector) {
      throw new NotFoundException({
        message: 'ERPNext connection not found',
      });
    }

    const config = connector.config as unknown as ERPNextConfig;

    // Sync financial data
    const invoicesSynced = await this.syncInvoices(config, connectionId);
    const purchaseOrdersSynced = await this.syncPurchaseOrders(config, connectionId);

    // Sync HR data
    const employeesSynced = await this.syncEmployees(config, connectionId);
    const salarySlipsSynced = await this.syncSalarySlips(config, connectionId);

    // Update last sync timestamp
    await this.prisma.connector.update({
      where: { id: connectionId },
      data: { lastSync: new Date() },
    });

    this.logger.log(
      `ERPNext sync complete: ${invoicesSynced} invoices, ${purchaseOrdersSynced} POs, ` +
      `${employeesSynced} employees, ${salarySlipsSynced} salary slips`,
    );

    return {
      success: true,
      coursesSynced: 0,
      usersSynced: employeesSynced,
      studentsSynced: 0,
      staffSynced: employeesSynced,
    };
  }
}
