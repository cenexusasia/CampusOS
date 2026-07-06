// =============================================================================
// CampusOS Shared Types
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

// ---- WebSocket Events ----------------------------------------------------

export enum WsEvent {
  NOTIFICATION = 'notification',
  ACTIVITY = 'activity',
  STATUS_CHANGE = 'status_change',
  ERROR = 'error',
}

export interface WsMessage<T = unknown> {
  event: WsEvent;
  tenantId: string;
  payload: T;
  timestamp: string;
}
