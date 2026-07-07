import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<{
        id: string;
        email: string;
        name: string | null;
        image: string | null;
        memberships: {
            id: string;
            role: string;
            tenantId: string;
            tenant: {
                id: string;
                name: string;
                slug: string;
            } | null;
        }[];
    }>;
    updateMe(req: any, data: {
        name?: string;
        image?: string | null;
    }): Promise<{
        id: string;
        email: string;
        name: string | null;
        image: string | null;
    }>;
    getUserById(id: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        image: string | null;
        createdAt: Date;
    }>;
}
