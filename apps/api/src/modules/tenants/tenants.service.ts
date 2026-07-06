import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES, type PaginationParams } from '../../shared';
import type { CreateTenantDto } from './dto/create-tenant.dto';
import type { UpdateTenantDto } from './dto/update-tenant.dto';
import type { InviteUserDto } from './dto/invite-user.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.SLUG_ALREADY_EXISTS,
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

  async findAll(params: PaginationParams) {
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

  async findById(id: string) {
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
      throw new NotFoundException({
        code: ERROR_CODES.TENANT_NOT_FOUND,
        message: 'Tenant not found',
      });
    }

    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findById(id);

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.domain !== undefined) updateData.domain = dto.domain;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.settings !== undefined) updateData.settings = dto.settings as any;
    if (dto.logo !== undefined) updateData.logo = dto.logo;

    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: updateData as any,
    });

    return tenant;
  }

  async remove(id: string) {
    await this.findById(id);

    await this.prisma.tenant.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    return { success: true, message: 'Tenant marked as deleted' };
  }

  async inviteUser(tenantId: string, dto: InviteUserDto) {
    await this.findById(tenantId);

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.verificationToken.create({
      data: {
        identifier: `${tenantId}:${dto.email}`,
        token,
        expires: expiresAt,
        type: 'invitation',
      },
    });

    this.logger.log(`Invitation created for ${dto.email} to tenant ${tenantId}`);

    // In production, send email via mail service
    return {
      success: true,
      message: `Invitation sent to ${dto.email}`,
      token, // Only returned in dev; in prod this would be in the email
    };
  }

  async acceptInvitation(token: string, userId: string) {
    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      throw new NotFoundException({
        code: ERROR_CODES.TOKEN_EXPIRED,
        message: 'Invalid or expired invitation token',
      });
    }

    const [tenantId, email] = verificationToken.identifier.split(':');

    if (!tenantId) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
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

  async suspendTenant(tenantId: string) {
    await this.findById(tenantId);

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'SUSPENDED' },
    });

    return { success: true, message: 'Tenant suspended' };
  }

  async activateTenant(tenantId: string) {
    await this.findById(tenantId);

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'ACTIVE' },
    });

    return { success: true, message: 'Tenant activated' };
  }

  async getMembers(tenantId: string, params: PaginationParams) {
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

  async updateMemberRole(tenantId: string, membershipId: string, role: string) {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { id: membershipId, tenantId },
    });

    if (!membership) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'Membership not found',
      });
    }

    return this.prisma.tenantMembership.update({
      where: { id: membershipId },
      data: { role },
    });
  }

  async removeMember(tenantId: string, membershipId: string) {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { id: membershipId, tenantId },
    });

    if (!membership) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'Membership not found',
      });
    }

    await this.prisma.tenantMembership.delete({
      where: { id: membershipId },
    });

    return { success: true, message: 'Member removed' };
  }
}
