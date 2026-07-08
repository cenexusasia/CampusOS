export declare class AIController {
    chat(body: {
        model?: string;
        system?: string;
        messages: {
            role: string;
            content: string;
        }[];
    }): Promise<{
        content: any;
        finishReason: any;
        usage: {
            promptTokens: any;
            completionTokens: any;
            totalTokens: any;
        };
    }>;
}
