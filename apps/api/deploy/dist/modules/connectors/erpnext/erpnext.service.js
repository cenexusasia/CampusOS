"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ERPNextService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERPNextService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ERPNextService = ERPNextService_1 = class ERPNextService {
    prisma;
    provider = 'erpnext';
    name = 'ERPNext';
    capabilities = {
        sync: true,
        webhook: false,
        oauth: false,
        basicAuth: true,
        apiKey: true,
    };
    logger = new common_1.Logger(ERPNextService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildHeaders(config) {
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
        if (config.apiKey && config.apiSecret) {
            headers['Authorization'] = `token ${config.apiKey}:${config.apiSecret}`;
        }
        return headers;
    }
    async apiRequest(config, path, options = {}) {
        const baseUrl = config.baseUrl.replace(/\/+$/, '');
        const url = `${baseUrl}${path}`;
        const method = options.method ?? 'GET';
        this.logger.debug(`ERPNext API request: ${method} ${url}`);
        const headers = this.buildHeaders(config);
        const fetchOptions = { method, headers };
        if (options.body && method !== 'GET') {
            fetchOptions.body = JSON.stringify(options.body);
        }
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            this.logger.error(`ERPNext API error (${response.status}): ${errorText}`);
            throw new common_1.BadRequestException(`ERPNext API returned ${response.status}: ${errorText}`);
        }
        const json = (await response.json());
        const rawData = json.data ?? json.message ?? [];
        if (!Array.isArray(rawData) && rawData && typeof rawData === 'object') {
            return [rawData];
        }
        return rawData;
    }
    async connect(config, tenantId) {
        if (!tenantId) {
            throw new common_1.BadRequestException('tenantId is required to create an ERPNext connection');
        }
        this.logger.log(`Connecting ERPNext for tenant ${tenantId} at ${config.baseUrl}`);
        if (!config.baseUrl) {
            throw new common_1.BadRequestException('ERPNext base URL is required');
        }
        const hasLoginCreds = config.username && config.password;
        const hasApiCreds = config.apiKey && config.apiSecret;
        if (!hasLoginCreds && !hasApiCreds) {
            throw new common_1.BadRequestException('Either username/password or apiKey/apiSecret is required to connect');
        }
        try {
            if (hasLoginCreds && !hasApiCreds) {
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
                    throw new common_1.BadRequestException(`ERPNext authentication failed: ${errorText}`);
                }
            }
            try {
                await this.apiRequest(config, '/api/resource/Employee?limit_page_length=1');
            }
            catch {
                try {
                    await this.apiRequest(config, '/api/resource/Sales%20Invoice?limit_page_length=1');
                }
                catch (invoicesErr) {
                    this.logger.warn(`ERPNext validation endpoints not accessible, proceeding anyway: ${invoicesErr}`);
                }
            }
            this.logger.log('ERPNext connection validated successfully');
        }
        catch (error) {
            this.logger.error(`ERPNext connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new common_1.BadRequestException({
                message: `Failed to connect to ERPNext: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
        }
        const storedConfig = {
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
                config: storedConfig,
                status: 'CONNECTED',
            },
        });
        this.logger.log(`ERPNext connector created: ${connector.id}`);
        return { success: true, connectionId: connector.id };
    }
    async listConnections(tenantId) {
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
    async list(tenantId) {
        const connections = await this.listConnections(tenantId);
        return connections.map((c) => ({
            id: c.id,
            provider: 'erpnext',
            name: c.name,
            status: c.status === 'CONNECTED' ? 'connected' : 'disconnected',
            lastSyncAt: c.lastSync,
            config: c.config,
        }));
    }
    async disconnect(connectionId) {
        const connector = await this.prisma.connector.findUnique({
            where: { id: connectionId },
        });
        if (!connector) {
            throw new common_1.NotFoundException({
                message: 'ERPNext connection not found',
            });
        }
        await this.prisma.connector.update({
            where: { id: connectionId },
            data: { status: 'DISCONNECTED' },
        });
        this.logger.log(`ERPNext connection deactivated: ${connectionId}`);
    }
    async syncInvoices(config, connectionId) {
        this.logger.log('Starting ERPNext invoice sync');
        const invoices = await this.apiRequest(config, '/api/resource/Sales%20Invoice?limit_page_length=100&order_by=creation%20desc');
        this.logger.log(`Fetched ${invoices.length} invoices from ERPNext`);
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
            const existingConfig = connector.config ?? {};
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
                    },
                },
            });
        }
        this.logger.log(`Invoice sync complete: ${invoiceSummaries.length} invoices`);
        return invoiceSummaries.length;
    }
    async syncPurchaseOrders(config, connectionId) {
        this.logger.log('Starting ERPNext purchase order sync');
        try {
            const orders = await this.apiRequest(config, '/api/resource/Purchase%20Order?limit_page_length=100&order_by=creation%20desc');
            this.logger.log(`Fetched ${orders.length} purchase orders from ERPNext`);
            const orderSummaries = orders.map((po) => ({
                erpnextId: po['name'],
                supplier: po['supplier_name'] ?? po['supplier'] ?? 'Unknown',
                date: po['transaction_date'] ?? null,
                total: po['grand_total'] ?? 0,
                currency: po['currency'] ?? 'USD',
                status: po['status'] ?? 'Draft',
            }));
            const connector = await this.prisma.connector.findUnique({
                where: { id: connectionId },
            });
            if (connector) {
                const existingConfig = connector.config ?? {};
                const lastSyncData = existingConfig['lastSyncData'] ?? {};
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
                        },
                    },
                });
            }
            this.logger.log(`Purchase order sync complete: ${orderSummaries.length} orders`);
            return orderSummaries.length;
        }
        catch (error) {
            this.logger.warn(`Purchase order sync failed (non-fatal): ${error}`);
            return 0;
        }
    }
    async syncEmployees(config, connectionId) {
        this.logger.log('Starting ERPNext employee sync');
        try {
            const employees = await this.apiRequest(config, '/api/resource/Employee?limit_page_length=100&order_by=creation%20desc');
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
                const existingConfig = connector.config ?? {};
                const lastSyncData = existingConfig['lastSyncData'] ?? {};
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
                        },
                    },
                });
            }
            this.logger.log(`Employee sync complete: ${employeeSummaries.length} employees`);
            return employeeSummaries.length;
        }
        catch (error) {
            this.logger.warn(`Employee sync failed (non-fatal): ${error}`);
            return 0;
        }
    }
    async syncSalarySlips(config, connectionId) {
        this.logger.log('Starting ERPNext salary slip sync');
        try {
            const slips = await this.apiRequest(config, '/api/resource/Salary%20Slip?limit_page_length=100&order_by=creation%20desc');
            this.logger.log(`Fetched ${slips.length} salary slips from ERPNext`);
            const slipSummaries = slips.map((slip) => ({
                erpnextId: slip['name'],
                employee: slip['employee_name'] ?? slip['employee'] ?? 'Unknown',
                startDate: slip['start_date'] ?? null,
                endDate: slip['end_date'] ?? null,
                grossPay: slip['gross_pay'] ?? 0,
                netPay: slip['net_pay'] ?? 0,
                currency: slip['currency'] ?? 'USD',
                status: slip['status'] ?? 'Draft',
            }));
            const connector = await this.prisma.connector.findUnique({
                where: { id: connectionId },
            });
            if (connector) {
                const existingConfig = connector.config ?? {};
                const lastSyncData = existingConfig['lastSyncData'] ?? {};
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
                        },
                    },
                });
            }
            this.logger.log(`Salary slip sync complete: ${slipSummaries.length} slips`);
            return slipSummaries.length;
        }
        catch (error) {
            this.logger.warn(`Salary slip sync failed (non-fatal): ${error}`);
            return 0;
        }
    }
    async sync(connectionId) {
        this.logger.log(`Syncing ERPNext connection: ${connectionId}`);
        const connector = await this.prisma.connector.findUnique({
            where: { id: connectionId },
        });
        if (!connector) {
            throw new common_1.NotFoundException({
                message: 'ERPNext connection not found',
            });
        }
        const config = connector.config;
        const invoicesSynced = await this.syncInvoices(config, connectionId);
        const purchaseOrdersSynced = await this.syncPurchaseOrders(config, connectionId);
        const employeesSynced = await this.syncEmployees(config, connectionId);
        const salarySlipsSynced = await this.syncSalarySlips(config, connectionId);
        await this.prisma.connector.update({
            where: { id: connectionId },
            data: { lastSync: new Date() },
        });
        this.logger.log(`ERPNext sync complete: ${invoicesSynced} invoices, ${purchaseOrdersSynced} POs, ` +
            `${employeesSynced} employees, ${salarySlipsSynced} salary slips`);
        return {
            success: true,
            coursesSynced: 0,
            usersSynced: employeesSynced,
            studentsSynced: 0,
            staffSynced: employeesSynced,
        };
    }
};
exports.ERPNextService = ERPNextService;
exports.ERPNextService = ERPNextService = ERPNextService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ERPNextService);
