import { z } from 'zod';

// =============================================================================
// CampusOS Shared Zod Validators
// =============================================================================

// ---- Auth Schemas -----------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address').max(255),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
        'Password must contain uppercase, lowercase, number, and special character',
      ),
    confirmPassword: z.string(),
    name: z.string().min(1, 'Name is required').max(255),
    tenantName: z.string().min(1, 'Tenant name is required').max(255),
    tenantSlug: z
      .string()
      .min(1, 'Tenant slug is required')
      .max(50)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must contain only lowercase letters, numbers, and hyphens',
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// ---- Tenant Schemas ---------------------------------------------------------

export const createTenantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens',
    ),
  domain: z.string().max(255).optional(),
  planId: z.string().uuid('Invalid plan ID').optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

export const updateTenantSchema = createTenantSchema.partial().extend({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'TRIAL', 'DELETED']).optional(),
  settings: z.record(z.unknown()).optional(),
  logo: z.string().url().nullable().optional(),
});

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;

// ---- Pagination & Sorting ---------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().max(255).optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ---- User Schemas -----------------------------------------------------------

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  image: z.string().url().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
        'Password must contain uppercase, lowercase, number, and special character',
      ),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ---- Invitation Schemas -----------------------------------------------------

export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  role: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT', 'PARENT', 'SUPPORT', 'OBSERVER']),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

// ---- Connector Schemas ------------------------------------------------------

export const createConnectorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: z.string().min(1, 'Type is required').max(50),
  config: z.record(z.unknown()).default({}),
});

export type CreateConnectorInput = z.infer<typeof createConnectorSchema>;

// ---- Utility Schemas --------------------------------------------------------

export const uuidSchema = z.string().uuid('Invalid UUID');
