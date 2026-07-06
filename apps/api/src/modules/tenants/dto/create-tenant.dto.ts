export interface CreateTenantDto {
  name: string;
  slug: string;
  domain?: string;
  planId?: string;
}

export interface InviteUserDto {
  email: string;
  role: string;
}
