"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuidSchema = exports.createConnectorSchema = exports.createInvitationSchema = exports.changePasswordSchema = exports.updateProfileSchema = exports.paginationSchema = exports.updateTenantSchema = exports.createTenantSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').max(255),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters').max(100),
});
exports.registerSchema = zod_1.z
    .object({
    email: zod_1.z.string().email('Invalid email address').max(255),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/, 'Password must contain uppercase, lowercase, number, and special character'),
    confirmPassword: zod_1.z.string(),
    name: zod_1.z.string().min(1, 'Name is required').max(255),
    tenantName: zod_1.z.string().min(1, 'Tenant name is required').max(255),
    tenantSlug: zod_1.z
        .string()
        .min(1, 'Tenant slug is required')
        .max(50)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.createTenantSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(255),
    slug: zod_1.z
        .string()
        .min(1, 'Slug is required')
        .max(50)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    domain: zod_1.z.string().max(255).optional(),
    planId: zod_1.z.string().uuid('Invalid plan ID').optional(),
});
exports.updateTenantSchema = exports.createTenantSchema.partial().extend({
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'TRIAL', 'DELETED']).optional(),
    settings: zod_1.z.record(zod_1.z.unknown()).optional(),
    logo: zod_1.z.string().url().nullable().optional(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    perPage: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.string().max(50).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
    search: zod_1.z.string().max(255).optional(),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    image: zod_1.z.string().url().nullable().optional(),
});
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/, 'Password must contain uppercase, lowercase, number, and special character'),
    confirmNewPassword: zod_1.z.string(),
})
    .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
});
exports.createInvitationSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').max(255),
    role: zod_1.z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT', 'PARENT', 'SUPPORT', 'OBSERVER']),
});
exports.createConnectorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(255),
    type: zod_1.z.string().min(1, 'Type is required').max(50),
    config: zod_1.z.record(zod_1.z.unknown()).default({}),
});
exports.uuidSchema = zod_1.z.string().uuid('Invalid UUID');
