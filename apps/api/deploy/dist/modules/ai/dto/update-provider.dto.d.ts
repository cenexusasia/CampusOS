export interface UpdateProviderDto {
    name?: string;
    type?: string;
    apiKey?: string;
    baseUrl?: string;
    models?: string[];
    isActive?: boolean;
}
