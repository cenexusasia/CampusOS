"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsEvent = exports.VerificationTokenType = exports.AccountProvider = exports.TenantStatus = exports.PlanTier = exports.MembershipRole = exports.UserRole = void 0;
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
var AccountProvider;
(function (AccountProvider) {
    AccountProvider["GOOGLE"] = "google";
    AccountProvider["GITHUB"] = "github";
    AccountProvider["MICROSOFT"] = "microsoft";
    AccountProvider["SAML"] = "saml";
    AccountProvider["OIDC"] = "oidc";
    AccountProvider["CREDENTIALS"] = "credentials";
})(AccountProvider || (exports.AccountProvider = AccountProvider = {}));
var VerificationTokenType;
(function (VerificationTokenType) {
    VerificationTokenType["EMAIL"] = "email";
    VerificationTokenType["PASSWORD_RESET"] = "password_reset";
    VerificationTokenType["INVITATION"] = "invitation";
})(VerificationTokenType || (exports.VerificationTokenType = VerificationTokenType = {}));
var WsEvent;
(function (WsEvent) {
    WsEvent["NOTIFICATION"] = "notification";
    WsEvent["ACTIVITY"] = "activity";
    WsEvent["STATUS_CHANGE"] = "status_change";
    WsEvent["ERROR"] = "error";
})(WsEvent || (exports.WsEvent = WsEvent = {}));
