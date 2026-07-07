export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    TENANT_ADMIN = "TENANT_ADMIN",
    INSTRUCTOR = "INSTRUCTOR",
    STUDENT = "STUDENT",
    PARENT = "PARENT",
    SUPPORT = "SUPPORT",
    OBSERVER = "OBSERVER"
}
export declare enum MembershipRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
}
export declare enum PlanTier {
    STARTER = "STARTER",
    PROFESSIONAL = "PROFESSIONAL",
    ENTERPRISE = "ENTERPRISE"
}
export declare enum TenantStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    TRIAL = "TRIAL",
    DELETED = "DELETED"
}
export interface PaginationParams {
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}
export interface HealthResponse {
    status: 'ok' | 'degraded' | 'error';
    version: string;
    uptime: number;
    timestamp: string;
    services?: Record<string, any>;
}
export type Permission = string;
export declare const PERMISSIONS: Record<string, string>;
export declare const ROLE_PERMISSIONS: Record<string, string[]>;
export declare const ERROR_CODES: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly CONFLICT: "CONFLICT";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly TENANT_NOT_FOUND: "TENANT_NOT_FOUND";
    readonly USER_NOT_FOUND: "USER_NOT_FOUND";
    readonly EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS";
    readonly SLUG_ALREADY_EXISTS: "SLUG_ALREADY_EXISTS";
    readonly INVALID_CREDENTIALS: "INVALID_CREDENTIALS";
    readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
};
