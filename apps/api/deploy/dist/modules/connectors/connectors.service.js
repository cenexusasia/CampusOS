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
var ConnectorsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const connectors_registry_1 = require("./connectors.registry");
let ConnectorsService = ConnectorsService_1 = class ConnectorsService {
    prisma;
    registry;
    logger = new common_1.Logger(ConnectorsService_1.name);
    constructor(prisma, registry) {
        this.prisma = prisma;
        this.registry = registry;
    }
    async listByTenant(tenantId) {
        this.logger.log(`Listing connectors for tenant: ${tenantId}`);
        const connectors = await this.prisma.connector.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'asc' },
        });
        return connectors.map((connector) => ({
            id: connector.id,
            provider: connector.provider,
            name: connector.name,
            status: connector.status,
            lastSyncAt: connector.lastSync,
            config: this.stripSecrets(connector.config),
        }));
    }
    async getConnectorStatuses(tenantId) {
        const plugins = this.registry.getAll();
        const results = [];
        for (const plugin of plugins) {
            try {
                const statuses = await plugin.list(tenantId);
                results.push(...statuses);
            }
            catch (error) {
                this.logger.error(`Failed to list ${plugin.provider} connections: ${error}`);
            }
        }
        return results;
    }
    getConnector(provider) {
        return this.registry.get(provider);
    }
    stripSecrets(config) {
        if (!config || typeof config !== 'object') {
            return {};
        }
        const sensitiveKeys = ['apiKey', 'api_key', 'apiSecret', 'api_secret', 'secret', 'token', 'password', 'accessToken', 'access_token', 'refreshToken', 'refresh_token', 'clientSecret', 'client_secret'];
        const sanitized = {};
        for (const [key, value] of Object.entries(config)) {
            if (sensitiveKeys.includes(key)) {
                sanitized[key] = '***REDACTED***';
            }
            else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                sanitized[key] = this.stripSecrets(value);
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
};
exports.ConnectorsService = ConnectorsService;
exports.ConnectorsService = ConnectorsService = ConnectorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        connectors_registry_1.ConnectorRegistry])
], ConnectorsService);
