export interface CreateProviderDto {
    name: string;
    type: string;
    apiKey: string;
    baseUrl?: string;
    models?: string[];
    isActive?: boolean;
}
