// =============================================================================
// CampusOS Shared Types — Inlined from @campusos/shared
// =============================================================================

// ---- Enums ---------------------------------------------------------------

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  SUPPORT = 'SUPPORT',
  OBSERVER = 'OBSERVER',
}

export enum MembershipRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum PlanTier {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
  DELETED = 'DELETED',
}

export enum AccountProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  MICROSOFT = 'microsoft',
  SAML = 'saml',
  OIDC = 'oidc',
  CREDENTIALS = 'credentials',
}

export enum VerificationTokenType {
  EMAIL = 'email',
  PASSWORD_RESET = 'password_reset',
  INVITATION = 'invitation',
}

// ---- User ----------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  memberships: TenantMembership[];
}

// ---- Tenant --------------------------------------------------------------

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  planId: string | null;
  plan?: Plan | null;
  status: TenantStatus;
  settings: Record<string, unknown>;
  logo: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantMembership {
  id: string;
  userId: string;
  tenantId: string;
  role: MembershipRole;
  permissions: string[];
  joinedAt: Date;
  tenant?: Tenant;
  user?: User;
}

// ---- Plan ----------------------------------------------------------------

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  price: number;
  currency: string;
  features: Record<string, unknown>;
  maxUsers: number;
  maxConnectors: number;
  maxStorageMb: number;
  aiCreditsMonthly: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Auth ----------------------------------------------------------------

export interface AuthAccount {
  id: string;
  userId: string;
  type: AccountProvider;
  provider: string;
  providerAccountId: string;
  refreshToken: string | null;
  accessToken: string | null;
  expiresAt: number | null;
  tokenType: string | null;
  scope: string | null;
  idToken: string | null;
  sessionState: string | null;
}

export interface AuthSession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  tenantName: string;
  tenantSlug: string;
}

// ---- API Responses -------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ---- Health --------------------------------------------------------------

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  uptime: number;
  timestamp: string;
  services?: Record<string, HealthServiceStatus>;
}

export interface HealthServiceStatus {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
}

// ---- Constants ------------------------------------------------------------

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_INVITE: 'users:invite',
  TENANTS_VIEW: 'tenants:view',
  TENANTS_CREATE: 'tenants:create',
  TENANTS_EDIT: 'tenants:edit',
  TENANTS_DELETE: 'tenants:delete',
  STUDENTS_VIEW: 'students:view',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_EDIT: 'students:edit',
  STUDENTS_DELETE: 'students:delete',
  COURSES_VIEW: 'courses:view',
  COURSES_CREATE: 'courses:create',
  COURSES_EDIT: 'courses:edit',
  COURSES_DELETE: 'courses:delete',
  FACULTY_VIEW: 'faculty:view',
  FACULTY_CREATE: 'faculty:create',
  FACULTY_EDIT: 'faculty:edit',
  FACULTY_DELETE: 'faculty:delete',
  DEPARTMENTS_VIEW: 'departments:view',
  DEPARTMENTS_CREATE: 'departments:create',
  DEPARTMENTS_EDIT: 'departments:edit',
  DEPARTMENTS_DELETE: 'departments:delete',
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  AI_ACCESS: 'ai:access',
  AI_ADMIN: 'ai:admin',
  CONNECTORS_VIEW: 'connectors:view',
  CONNECTORS_MANAGE: 'connectors:manage',
  AUDIT_VIEW: 'audit:view',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(PERMISSIONS) as Permission[],
  [UserRole.TENANT_ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE, PERMISSIONS.USERS_INVITE,
    PERMISSIONS.STUDENTS_VIEW, PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.STUDENTS_EDIT, PERMISSIONS.STUDENTS_DELETE,
    PERMISSIONS.COURSES_VIEW, PERMISSIONS.COURSES_CREATE,
    PERMISSIONS.COURSES_EDIT, PERMISSIONS.COURSES_DELETE,
    PERMISSIONS.FACULTY_VIEW, PERMISSIONS.FACULTY_CREATE,
    PERMISSIONS.FACULTY_EDIT, PERMISSIONS.FACULTY_DELETE,
    PERMISSIONS.DEPARTMENTS_VIEW, PERMISSIONS.DEPARTMENTS_CREATE,
    PERMISSIONS.DEPARTMENTS_EDIT, PERMISSIONS.DEPARTMENTS_DELETE,
    PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.AI_ACCESS, PERMISSIONS.AI_ADMIN,
    PERMISSIONS.CONNECTORS_VIEW, PERMISSIONS.CONNECTORS_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
  ],
  [UserRole.INSTRUCTOR]: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.STUDENTS_VIEW, PERMISSIONS.COURSES_VIEW, PERMISSIONS.COURSES_EDIT, PERMISSIONS.AI_ACCESS, PERMISSIONS.ANALYTICS_VIEW],
  [UserRole.STUDENT]: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.COURSES_VIEW, PERMISSIONS.AI_ACCESS],
  [UserRole.PARENT]: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.STUDENTS_VIEW],
  [UserRole.SUPPORT]: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.USERS_VIEW, PERMISSIONS.TENANTS_VIEW, PERMISSIONS.STUDENTS_VIEW, PERMISSIONS.COURSES_VIEW, PERMISSIONS.FACULTY_VIEW, PERMISSIONS.AUDIT_VIEW],
  [UserRole.OBSERVER]: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.ANALYTICS_VIEW],
};

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  SLUG_ALREADY_EXISTS: 'SLUG_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;
