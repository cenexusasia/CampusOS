import { PrismaService } from '../../prisma/prisma.service';
import { type PaginationParams } from '@campusos/shared';
import type { CreateTenantDto } from './dto/create-tenant.dto';
import type { UpdateTenantDto } from './dto/update-tenant.dto';
import type { InviteUserDto } from './dto/invite-user.dto';
export declare class TenantsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateTenantDto): Promise<{
        status: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        logo: string | null;
        planId: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findAll(params: PaginationParams): Promise<{
        data: ({
            plan: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tier: string;
                price: number;
                currency: string;
                features: import("@prisma/client/runtime/library").JsonValue;
                maxUsers: number;
                maxConnectors: number;
                maxStorageMb: number;
                aiCreditsMonthly: number;
            } | null;
            _count: {
                memberships: number;
            };
        } & {
            status: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            domain: string | null;
            logo: string | null;
            planId: string | null;
            settings: import("@prisma/client/runtime/library").JsonValue;
        })[];
        meta: {
            page: number;
            perPage: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<{
        plan: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tier: string;
            price: number;
            currency: string;
            features: import("@prisma/client/runtime/library").JsonValue;
            maxUsers: number;
            maxConnectors: number;
            maxStorageMb: number;
            aiCreditsMonthly: number;
        } | null;
        _count: {
            connectors: number;
            courses: number;
            departments: number;
            memberships: number;
        };
    } & {
        status: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        logo: string | null;
        planId: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(id: string, dto: UpdateTenantDto): Promise<{
        status: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        logo: string | null;
        planId: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    inviteUser(tenantId: string, dto: InviteUserDto): Promise<{
        success: boolean;
        message: string;
        token: string;
    }>;
    acceptInvitation(token: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    suspendTenant(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    activateTenant(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMembers(tenantId: string, params: PaginationParams): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                image: string | null;
                createdAt: Date;
            };
        } & {
            id: string;
            userId: string;
            tenantId: string;
            role: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
            joinedAt: Date;
        })[];
        meta: {
            page: number;
            perPage: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateMemberRole(tenantId: string, membershipId: string, role: string): Promise<{
        id: string;
        userId: string;
        tenantId: string;
        role: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        joinedAt: Date;
    }>;
    removeMember(tenantId: string, membershipId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
