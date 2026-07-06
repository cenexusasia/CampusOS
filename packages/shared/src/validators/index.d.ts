import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    name: z.ZodString;
    tenantName: z.ZodString;
    tenantSlug: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    tenantName: string;
    tenantSlug: string;
}, {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    tenantName: string;
    tenantSlug: string;
}>, {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    tenantName: string;
    tenantSlug: string;
}, {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    tenantName: string;
    tenantSlug: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const createTenantSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    domain: z.ZodOptional<z.ZodString>;
    planId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    domain?: string | undefined;
    planId?: string | undefined;
}, {
    name: string;
    slug: string;
    domain?: string | undefined;
    planId?: string | undefined;
}>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export declare const updateTenantSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    domain: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    planId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "SUSPENDED", "TRIAL", "DELETED"]>>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    logo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "SUSPENDED" | "TRIAL" | "DELETED" | undefined;
    name?: string | undefined;
    slug?: string | undefined;
    domain?: string | undefined;
    planId?: string | undefined;
    settings?: Record<string, unknown> | undefined;
    logo?: string | null | undefined;
}, {
    status?: "ACTIVE" | "SUSPENDED" | "TRIAL" | "DELETED" | undefined;
    name?: string | undefined;
    slug?: string | undefined;
    domain?: string | undefined;
    planId?: string | undefined;
    settings?: Record<string, unknown> | undefined;
    logo?: string | null | undefined;
}>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    perPage: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    perPage: number;
    sortOrder: "asc" | "desc";
    sortBy?: string | undefined;
    search?: string | undefined;
}, {
    page?: number | undefined;
    perPage?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    search?: string | undefined;
}>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    image?: string | null | undefined;
}, {
    name?: string | undefined;
    image?: string | null | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export declare const changePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmNewPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export declare const createInvitationSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<["ADMIN", "INSTRUCTOR", "STUDENT", "PARENT", "SUPPORT", "OBSERVER"]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "INSTRUCTOR" | "STUDENT" | "PARENT" | "SUPPORT" | "OBSERVER" | "ADMIN";
}, {
    email: string;
    role: "INSTRUCTOR" | "STUDENT" | "PARENT" | "SUPPORT" | "OBSERVER" | "ADMIN";
}>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export declare const createConnectorSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodString;
    config: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: string;
    name: string;
    config: Record<string, unknown>;
}, {
    type: string;
    name: string;
    config?: Record<string, unknown> | undefined;
}>;
export type CreateConnectorInput = z.infer<typeof createConnectorSchema>;
export declare const uuidSchema: z.ZodString;
