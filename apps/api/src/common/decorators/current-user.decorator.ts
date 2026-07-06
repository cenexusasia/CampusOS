import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../../modules/auth/strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return data ? user?.[data] : user;
  },
);

export const CurrentTenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId as string | undefined;
  },
);
