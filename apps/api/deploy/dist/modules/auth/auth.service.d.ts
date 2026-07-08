import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        user: any;
        tokens: TokenPair;
    }>;
    login(dto: LoginDto): Promise<{
        user: any;
        tokens: TokenPair;
    }>;
    refresh(refreshToken: string): Promise<TokenPair>;
    getProfile(userId: string): Promise<any>;
    setupMfa(userId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    verifyMfa(userId: string, code: string): Promise<boolean>;
    private generateTokens;
}
