"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../../prisma/prisma.service");
const shared_1 = require("@campusos/shared");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException({
                code: shared_1.ERROR_CODES.EMAIL_ALREADY_EXISTS,
                message: 'A user with this email already exists',
            });
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.$transaction(async (tx) => {
            const created = await tx.user.create({
                data: {
                    email: dto.email,
                    name: dto.name,
                    passwordHash,
                },
            });
            if (dto.tenantName && dto.tenantSlug) {
                const existingTenant = await tx.tenant.findUnique({
                    where: { slug: dto.tenantSlug },
                });
                if (existingTenant) {
                    throw new common_1.ConflictException({
                        code: shared_1.ERROR_CODES.SLUG_ALREADY_EXISTS,
                        message: 'A tenant with this slug already exists',
                    });
                }
                const plan = await tx.plan.findFirst({
                    where: { tier: 'STARTER' },
                });
                const tenant = await tx.tenant.create({
                    data: {
                        name: dto.tenantName,
                        slug: dto.tenantSlug,
                        planId: plan?.id,
                        status: 'TRIAL',
                    },
                });
                await tx.tenantMembership.create({
                    data: {
                        userId: created.id,
                        tenantId: tenant.id,
                        role: 'OWNER',
                        permissions: [],
                    },
                });
            }
            return created;
        });
        const tokens = await this.generateTokens(user.id, user.email, []);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            },
            tokens,
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                tenantMemberships: {
                    include: { tenant: true },
                },
            },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException({
                code: shared_1.ERROR_CODES.INVALID_CREDENTIALS,
                message: 'Invalid email or password',
            });
        }
        const isValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException({
                code: shared_1.ERROR_CODES.INVALID_CREDENTIALS,
                message: 'Invalid email or password',
            });
        }
        const roles = user.tenantMemberships.map((m) => m.role);
        const tokens = await this.generateTokens(user.id, user.email, roles);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
            },
            tokens,
        };
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: {
                    tenantMemberships: {
                        include: { tenant: true },
                    },
                },
            });
            if (!user) {
                throw new common_1.UnauthorizedException({
                    code: shared_1.ERROR_CODES.USER_NOT_FOUND,
                    message: 'User not found',
                });
            }
            const roles = user.tenantMemberships.map((m) => m.role);
            return this.generateTokens(user.id, user.email, roles);
        }
        catch {
            throw new common_1.UnauthorizedException({
                code: shared_1.ERROR_CODES.TOKEN_EXPIRED,
                message: 'Invalid or expired refresh token',
            });
        }
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                tenantMemberships: {
                    include: { tenant: true },
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException({
                code: shared_1.ERROR_CODES.USER_NOT_FOUND,
                message: 'User not found',
            });
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: user.emailVerified,
            memberships: user.tenantMemberships.map((m) => ({
                id: m.id,
                role: m.role,
                tenantId: m.tenantId,
                tenant: m.tenant
                    ? {
                        id: m.tenant.id,
                        name: m.tenant.name,
                        slug: m.tenant.slug,
                        status: m.tenant.status,
                    }
                    : null,
            })),
            createdAt: user.createdAt,
        };
    }
    async setupMfa(userId) {
        return { secret: 'placeholder', qrCode: 'placeholder' };
    }
    async verifyMfa(userId, code) {
        return code === '123456';
    }
    async generateTokens(userId, email, roles) {
        const payload = { sub: userId, email, roles };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
            expiresIn: '7d',
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
