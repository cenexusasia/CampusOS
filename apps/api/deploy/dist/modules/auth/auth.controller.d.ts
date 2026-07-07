import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: any;
        tokens: import("./auth.service").TokenPair;
    }>;
    login(dto: LoginDto): Promise<{
        user: any;
        tokens: import("./auth.service").TokenPair;
    }>;
    refresh(dto: RefreshDto): Promise<import("./auth.service").TokenPair>;
    me(req: any): Promise<any>;
    setupMfa(req: any): Promise<{
        secret: string;
        qrCode: string;
    }>;
    verifyMfa(req: any, code: string): Promise<boolean>;
}
