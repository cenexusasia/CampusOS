export enum UserRole { SUPER_ADMIN = 'SUPER_ADMIN', TENANT_ADMIN = 'TENANT_ADMIN', INSTRUCTOR = 'INSTRUCTOR', STUDENT = 'STUDENT', PARENT = 'PARENT', SUPPORT = 'SUPPORT', OBSERVER = 'OBSERVER' }
export enum MembershipRole { OWNER = 'OWNER', ADMIN = 'ADMIN', MEMBER = 'MEMBER' }
export enum PlanTier { STARTER = 'STARTER', PROFESSIONAL = 'PROFESSIONAL', ENTERPRISE = 'ENTERPRISE' }
export enum TenantStatus { ACTIVE = 'ACTIVE', SUSPENDED = 'SUSPENDED', TRIAL = 'TRIAL', DELETED = 'DELETED' }
export interface PaginationParams { page?: number; perPage?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; search?: string }
export interface HealthResponse { status: 'ok' | 'degraded' | 'error'; version: string; uptime: number; timestamp: string; services?: Record<string, any> }
export type Permission = string;
export const PERMISSIONS = {} as Record<string, string>;
export const ROLE_PERMISSIONS = {} as Record<string, string[]>;
export const ERROR_CODES = { VALIDATION_ERROR: 'VALIDATION_ERROR', UNAUTHORIZED: 'UNAUTHORIZED', FORBIDDEN: 'FORBIDDEN', NOT_FOUND: 'NOT_FOUND', CONFLICT: 'CONFLICT', INTERNAL_ERROR: 'INTERNAL_ERROR', TENANT_NOT_FOUND: 'TENANT_NOT_FOUND', USER_NOT_FOUND: 'USER_NOT_FOUND', EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS', SLUG_ALREADY_EXISTS: 'SLUG_ALREADY_EXISTS', INVALID_CREDENTIALS: 'INVALID_CREDENTIALS', TOKEN_EXPIRED: 'TOKEN_EXPIRED', RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED' } as const;
