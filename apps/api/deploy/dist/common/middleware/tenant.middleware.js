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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const shared_1 = require("@campusos/shared");
let TenantMiddleware = class TenantMiddleware {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, _res, next) {
        const tenantId = req.headers['x-tenant-id'];
        if (!tenantId) {
            req.tenantId = null;
            req.tenant = null;
            next();
            return;
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant) {
            throw new common_1.BadRequestException({
                code: shared_1.ERROR_CODES.TENANT_NOT_FOUND,
                message: `Tenant with ID "${tenantId}" not found`,
            });
        }
        if (tenant.status === 'SUSPENDED') {
            throw new common_1.BadRequestException({
                code: shared_1.ERROR_CODES.FORBIDDEN,
                message: 'Tenant is suspended',
            });
        }
        req.tenantId = tenant.id;
        req.tenant = tenant;
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantMiddleware);
