export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  tenantName?: string;
  tenantSlug?: string;
}
