import type { JwtPayload } from '../../modules/auth/strategies/jwt.strategy';
export declare const CurrentUser: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | keyof JwtPayload | undefined)[]) => ParameterDecorator;
export declare const CurrentTenantId: (...dataOrPipes: unknown[]) => ParameterDecorator;
