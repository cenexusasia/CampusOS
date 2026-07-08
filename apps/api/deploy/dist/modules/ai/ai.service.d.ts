export interface AIProviderConfig {
    id: string;
    name: string;
    provider: 'openai' | 'anthropic' | 'google' | 'openrouter' | 'deepseek';
    apiKey: string;
    baseUrl?: string;
    models: string[];
    isActive: boolean;
}
export interface GenerateOptions {
    model?: string;
    system?: string;
    messages: {
        role: 'user' | 'assistant' | 'system';
        content: string;
    }[];
    temperature?: number;
    maxTokens?: number;
}
export interface GenerateResult {
    content: string;
    finishReason: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface EmbedResult {
    embedding: number[];
    tokens: number;
}
export declare class AIService {
    private readonly logger;
    generate(options: GenerateOptions, config: AIProviderConfig): Promise<GenerateResult>;
    embed(texts: string[], config: AIProviderConfig): Promise<EmbedResult[]>;
}
