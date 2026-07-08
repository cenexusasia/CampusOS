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
var TenantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const shared_1 = require("@campusos/shared");
const uuid_1 = require("uuid");
let TenantsService = TenantsService_1 = class TenantsService {
    prisma;
    logger = new common_1.Logger(TenantsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.tenant.findUnique({
            where: { slug: dto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: shared_1.ERROR_CODES.SLUG_ALREADY_EXISTS,
                message: 'A tenant with this slug already exists',
            });
        }
        const tenant = await this.prisma.tenant.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                domain: dto.domain,
                planId: dto.planId,
                status: 'TRIAL',
                settings: {
                    branding: {
                        primaryColor: '#2563eb',
                        logo: null,
                    },
                    locale: 'en-US',
                    timezone: 'UTC',
                    features: {
                        aiAssistant: true,
                        analytics: true,
                        connectors: false,
                        customBranding: false,
                    },
                },
            },
        });
        return tenant;
    }
    async findAll(params) {
        const page = params.page ?? 1;
        const perPage = params.perPage ?? 20;
        const skip = (page - 1) * perPage;
        const [tenants, total] = await Promise.all([
            this.prisma.tenant.findMany({
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { memberships: true },
                    },
                    plan: true,
                },
            }),
            this.prisma.tenant.count(),
        ]);
        return {
            data: tenants,
            meta: {
                page,
                perPage,
                total,
                totalPages: Math.ceil(total / perPage),
            },
        };
    }
    async findById(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                plan: true,
                _count: {
                    select: {
                        memberships: true,
                        courses: true,
                        departments: true,
                        connectors: true,
                    },
                },
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.TENANT_NOT_FOUND,
                message: 'Tenant not found',
            });
        }
        return tenant;
    }
    async update(id, dto) {
        await this.findById(id);
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.domain !== undefined)
            updateData.domain = dto.domain;
        if (dto.status !== undefined)
            updateData.status = dto.status;
        if (dto.settings !== undefined)
            updateData.settings = dto.settings;
        if (dto.logo !== undefined)
            updateData.logo = dto.logo;
        const tenant = await this.prisma.tenant.update({
            where: { id },
            data: updateData,
        });
        return tenant;
    }
    async remove(id) {
        await this.findById(id);
        await this.prisma.tenant.update({
            where: { id },
            data: { status: 'DELETED' },
        });
        return { success: true, message: 'Tenant marked as deleted' };
    }
    async inviteUser(tenantId, dto) {
        await this.findById(tenantId);
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.verificationToken.create({
            data: {
                identifier: `${tenantId}:${dto.email}`,
                token,
                expires: expiresAt,
                type: 'invitation',
            },
        });
        this.logger.log(`Invitation created for ${dto.email} to tenant ${tenantId}`);
        return {
            success: true,
            message: `Invitation sent to ${dto.email}`,
            token,
        };
    }
    async acceptInvitation(token, userId) {
        const verificationToken = await this.prisma.verificationToken.findUnique({
            where: { token },
        });
        if (!verificationToken || verificationToken.expires < new Date()) {
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.TOKEN_EXPIRED,
                message: 'Invalid or expired invitation token',
            });
        }
        const [tenantId, email] = verificationToken.identifier.split(':');
        if (!tenantId) {
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.NOT_FOUND,
                message: 'Invalid invitation',
            });
        }
        const existingMembership = await this.prisma.tenantMembership.findUnique({
            where: {
                userId_tenantId: { userId, tenantId },
            },
        });
        if (existingMembership) {
            return { success: true, message: 'Already a member of this tenant' };
        }
        await this.prisma.$transaction([
            this.prisma.tenantMembership.create({
                data: {
                    userId,
                    tenantId,
                    role: 'MEMBER',
                    permissions: [],
                },
            }),
            this.prisma.verificationToken.delete({
                where: { token },
            }),
        ]);
        return { success: true, message: 'Successfully joined tenant' };
    }
    async suspendTenant(tenantId) {
        await this.findById(tenantId);
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { status: 'SUSPENDED' },
        });
        return { success: true, message: 'Tenant suspended' };
    }
    async activateTenant(tenantId) {
        await this.findById(tenantId);
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { status: 'ACTIVE' },
        });
        return { success: true, message: 'Tenant activated' };
    }
    async getMembers(tenantId, params) {
        await this.findById(tenantId);
        const page = params.page ?? 1;
        const perPage = params.perPage ?? 20;
        const skip = (page - 1) * perPage;
        const [memberships, total] = await Promise.all([
            this.prisma.tenantMembership.findMany({
                where: { tenantId },
                skip,
                take: perPage,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            image: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: { joinedAt: 'desc' },
            }),
            this.prisma.tenantMembership.count({ where: { tenantId } }),
        ]);
        return {
            data: memberships,
            meta: {
                page,
                perPage,
                total,
                totalPages: Math.ceil(total / perPage),
            },
        };
    }
    async updateMemberRole(tenantId, membershipId, role) {
        const membership = await this.prisma.tenantMembership.findFirst({
            where: { id: membershipId, tenantId },
        });
        if (!membership) {
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.NOT_FOUND,
                message: 'Membership not found',
            });
        }
        return this.prisma.tenantMembership.update({
            where: { id: membershipId },
            data: { role },
        });
    }
    async removeMember(tenantId, membershipId) {
        const membership = await this.prisma.tenantMembership.findFirst({
            where: { id: membershipId, tenantId },
        });
        if (!membership) {
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.NOT_FOUND,
                message: 'Membership not found',
            });
        }
        await this.prisma.tenantMembership.delete({
            where: { id: membershipId },
        });
        return { success: true, message: 'Member removed' };
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = TenantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
