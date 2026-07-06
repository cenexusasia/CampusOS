// =============================================================================
// CampusOS Shared Constants
// =============================================================================

import { UserRole, MembershipRole, PlanTier } from '../types';

// ---- Roles -----------------------------------------------------------------

export const ROLES = {
  SUPER_ADMIN: UserRole.SUPER_ADMIN,
  TENANT_ADMIN: UserRole.TENANT_ADMIN,
  INSTRUCTOR: UserRole.INSTRUCTOR,
  STUDENT: UserRole.STUDENT,
  PARENT: UserRole.PARENT,
  SUPPORT: UserRole.SUPPORT,
  OBSERVER: UserRole.OBSERVER,
} as const;

export const MEMBERSHIP_ROLES = {
  OWNER: MembershipRole.OWNER,
  ADMIN: MembershipRole.ADMIN,
  MEMBER: MembershipRole.MEMBER,
} as const;

export const PLAN_TIERS = {
  STARTER: PlanTier.STARTER,
  PROFESSIONAL: PlanTier.PROFESSIONAL,
  ENTERPRISE: PlanTier.ENTERPRISE,
} as const;

// ---- Permissions -----------------------------------------------------------

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',

  // Users
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_INVITE: 'users:invite',

  // Tenants
  TENANTS_VIEW: 'tenants:view',
  TENANTS_CREATE: 'tenants:create',
  TENANTS_EDIT: 'tenants:edit',
  TENANTS_DELETE: 'tenants:delete',

  // Students
  STUDENTS_VIEW: 'students:view',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_EDIT: 'students:edit',
  STUDENTS_DELETE: 'students:delete',

  // Courses
  COURSES_VIEW: 'courses:view',
  COURSES_CREATE: 'courses:create',
  COURSES_EDIT: 'courses:edit',
  COURSES_DELETE: 'courses:delete',

  // Faculty
  FACULTY_VIEW: 'faculty:view',
  FACULTY_CREATE: 'faculty:create',
  FACULTY_EDIT: 'faculty:edit',
  FACULTY_DELETE: 'faculty:delete',

  // Departments
  DEPARTMENTS_VIEW: 'departments:view',
  DEPARTMENTS_CREATE: 'departments:create',
  DEPARTMENTS_EDIT: 'departments:edit',
  DEPARTMENTS_DELETE: 'departments:delete',

  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',

  // AI
  AI_ACCESS: 'ai:access',
  AI_ADMIN: 'ai:admin',

  // Connectors
  CONNECTORS_VIEW: 'connectors:view',
  CONNECTORS_MANAGE: 'connectors:manage',

  // Audit
  AUDIT_VIEW: 'audit:view',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role-based permission sets
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [UserRole.TENANT_ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_INVITE,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.STUDENTS_EDIT,
    PERMISSIONS.STUDENTS_DELETE,
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.COURSES_CREATE,
    PERMISSIONS.COURSES_EDIT,
    PERMISSIONS.COURSES_DELETE,
    PERMISSIONS.FACULTY_VIEW,
    PERMISSIONS.FACULTY_CREATE,
    PERMISSIONS.FACULTY_EDIT,
    PERMISSIONS.FACULTY_DELETE,
    PERMISSIONS.DEPARTMENTS_VIEW,
    PERMISSIONS.DEPARTMENTS_CREATE,
    PERMISSIONS.DEPARTMENTS_EDIT,
    PERMISSIONS.DEPARTMENTS_DELETE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.AI_ACCESS,
    PERMISSIONS.AI_ADMIN,
    PERMISSIONS.CONNECTORS_VIEW,
    PERMISSIONS.CONNECTORS_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
  ],
  [UserRole.INSTRUCTOR]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.COURSES_EDIT,
    PERMISSIONS.AI_ACCESS,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  [UserRole.STUDENT]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.AI_ACCESS,
  ],
  [UserRole.PARENT]: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.STUDENTS_VIEW],
  [UserRole.SUPPORT]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.TENANTS_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.FACULTY_VIEW,
    PERMISSIONS.AUDIT_VIEW,
  ],
  [UserRole.OBSERVER]: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.ANALYTICS_VIEW],
};

// ---- HTTP Status Codes -----------------------------------------------------

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ---- Error Codes -----------------------------------------------------------

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

// ---- Configuration ---------------------------------------------------------

export const DEFAULTS = {
  PAGINATION_PAGE: 1,
  PAGINATION_PER_PAGE: 20,
  PAGINATION_MAX_PER_PAGE: 100,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,
  SESSION_MAX_AGE_MS: 30 * 24 * 60 * 60 * 1000, // 30 days
  INVITATION_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  VERIFICATION_TOKEN_EXPIRY_MS: 24 * 60 * 60 * 1000, // 24 hours
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024, // 100MB
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const;
