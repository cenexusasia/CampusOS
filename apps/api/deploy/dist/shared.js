"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.ROLE_PERMISSIONS = exports.PERMISSIONS = exports.TenantStatus = exports.PlanTier = exports.MembershipRole = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["TENANT_ADMIN"] = "TENANT_ADMIN";
    UserRole["INSTRUCTOR"] = "INSTRUCTOR";
    UserRole["STUDENT"] = "STUDENT";
    UserRole["PARENT"] = "PARENT";
    UserRole["SUPPORT"] = "SUPPORT";
    UserRole["OBSERVER"] = "OBSERVER";
})(UserRole || (exports.UserRole = UserRole = {}));
var MembershipRole;
(function (MembershipRole) {
    MembershipRole["OWNER"] = "OWNER";
    MembershipRole["ADMIN"] = "ADMIN";
    MembershipRole["MEMBER"] = "MEMBER";
})(MembershipRole || (exports.MembershipRole = MembershipRole = {}));
var PlanTier;
(function (PlanTier) {
    PlanTier["STARTER"] = "STARTER";
    PlanTier["PROFESSIONAL"] = "PROFESSIONAL";
    PlanTier["ENTERPRISE"] = "ENTERPRISE";
})(PlanTier || (exports.PlanTier = PlanTier = {}));
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["ACTIVE"] = "ACTIVE";
    TenantStatus["SUSPENDED"] = "SUSPENDED";
    TenantStatus["TRIAL"] = "TRIAL";
    TenantStatus["DELETED"] = "DELETED";
})(TenantStatus || (exports.TenantStatus = TenantStatus = {}));
exports.PERMISSIONS = {};
exports.ROLE_PERMISSIONS = {};
exports.ERROR_CODES = { VALIDATION_ERROR: 'VALIDATION_ERROR', UNAUTHORIZED: 'UNAUTHORIZED', FORBIDDEN: 'FORBIDDEN', NOT_FOUND: 'NOT_FOUND', CONFLICT: 'CONFLICT', INTERNAL_ERROR: 'INTERNAL_ERROR', TENANT_NOT_FOUND: 'TENANT_NOT_FOUND', USER_NOT_FOUND: 'USER_NOT_FOUND', EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS', SLUG_ALREADY_EXISTS: 'SLUG_ALREADY_EXISTS', INVALID_CREDENTIALS: 'INVALID_CREDENTIALS', TOKEN_EXPIRED: 'TOKEN_EXPIRED', RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED' };
