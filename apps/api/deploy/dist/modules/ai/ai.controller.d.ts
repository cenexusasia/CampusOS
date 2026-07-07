import { AIService } from './ai.service';
export declare class AIController {
    private readonly aiService;
    constructor(aiService: AIService);
    chat(body: {
        model?: string;
        system?: string;
        messages: {
            role: string;
            content: string;
        }[];
    }): Promise<import("./ai.service").GenerateResult>;
}
