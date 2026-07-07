import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
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
    updateMe(userId: string, data: {
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
