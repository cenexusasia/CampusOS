import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@api/prisma/prisma.service';
import { ERROR_CODES } from '@campusos/shared';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantMemberships: {
          include: { tenant: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException({
        code: ERROR_CODES.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      memberships: user.tenantMemberships.map((m) => ({
        id: m.id,
        role: m.role,
        tenantId: m.tenantId,
        tenant: m.tenant
          ? { id: m.tenant.id, name: m.tenant.name, slug: m.tenant.slug }
          : null,
      })),
    };
  }

  async updateMe(userId: string, data: { name?: string; image?: string | null }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException({
        code: ERROR_CODES.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
    };
  }
}
