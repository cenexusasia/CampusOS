import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@api/common/decorators/permissions.decorator';
import { ROLE_PERMISSIONS } from '@campusos/shared';
import type { Permission, UserRole } from '@campusos/shared';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      return false;
    }

    const userRoles = user.roles as UserRole[];

    // Collect all permissions from all user roles
    const userPermissions = new Set<Permission>();
    for (const role of userRoles) {
      const rolePerms = ROLE_PERMISSIONS[role];
      if (rolePerms) {
        for (const perm of rolePerms) {
          userPermissions.add(perm);
        }
      }
    }

    return requiredPermissions.every((perm) => userPermissions.has(perm));
  }
}
