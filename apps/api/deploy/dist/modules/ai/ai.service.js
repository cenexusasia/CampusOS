"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var AIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
let AIService = AIService_1 = class AIService {
    logger = new common_1.Logger(AIService_1.name);
    async generate(options, config) {
        const { generateText } = await Promise.resolve().then(() => __importStar(require('ai')));
        let model;
        const modelName = options.model ?? config.models[0] ?? 'gpt-4o';
        switch (config.provider) {
            case 'openai': {
                const { createOpenAI } = await Promise.resolve().then(() => __importStar(require('@ai-sdk/openai')));
                const client = createOpenAI({ apiKey: config.apiKey });
                model = client(modelName);
                break;
            }
            case 'anthropic': {
                const { createAnthropic } = await Promise.resolve().then(() => __importStar(require('@ai-sdk/anthropic')));
                const client = createAnthropic({ apiKey: config.apiKey });
                model = client(modelName);
                break;
            }
            case 'google': {
                const { createGoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@ai-sdk/google')));
                const client = createGoogleGenerativeAI({ apiKey: config.apiKey });
                model = client(modelName);
                break;
            }
            case 'openrouter': {
                const { createOpenAICompatible } = await Promise.resolve().then(() => __importStar(require('@ai-sdk/openai-compatible')));
                const client = createOpenAICompatible({
                    name: 'openrouter',
                    baseURL: config.baseUrl ?? 'https://openrouter.ai/api/v1',
                    apiKey: config.apiKey,
                });
                model = client(modelName);
                break;
            }
            case 'deepseek': {
                const apiKey = config.apiKey;
                const baseUrl = config.baseUrl ?? 'https://api.deepseek.com/v1';
                const modelName2 = options.model ?? config.models[0] ?? 'deepseek-chat';
                const response = await fetch(`${baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: modelName2,
                        messages: options.messages.map((m) => ({ role: m.role, content: m.content })),
                        system: options.system,
                        temperature: options.temperature ?? 0.7,
                        max_tokens: options.maxTokens ?? 4096,
                    }),
                });
                if (!response.ok) {
                    const errBody = await response.text();
                    throw new Error(`DeepSeek API error ${response.status}: ${errBody}`);
                }
                const data = await response.json();
                const choice = data.choices?.[0];
                const finishReason = choice?.finish_reason ?? 'stop';
                return {
                    content: choice?.message?.content ?? '',
                    finishReason,
                    usage: {
                        promptTokens: data.usage?.prompt_tokens ?? 0,
                        completionTokens: data.usage?.completion_tokens ?? 0,
                        totalTokens: data.usage?.total_tokens ?? 0,
                    },
                };
            }
            default:
                throw new Error(`Unknown provider: ${config.provider}`);
        }
        const result = await generateText({
            model,
            system: options.system,
            messages: options.messages.map((m) => ({
                role: m.role,
                content: m.content,
            })),
            temperature: options.temperature ?? 0.7,
            maxTokens: options.maxTokens ?? 4096,
        });
        return {
            content: result.text,
            finishReason: result.finishReason,
            usage: {
                promptTokens: result.usage?.promptTokens ?? 0,
                completionTokens: result.usage?.completionTokens ?? 0,
                totalTokens: result.usage?.totalTokens ?? 0,
            },
        };
    }
    async embed(texts, config) {
        if (config.provider === 'openai') {
            const { createOpenAI } = await Promise.resolve().then(() => __importStar(require('@ai-sdk/openai')));
            const { embedMany } = await Promise.resolve().then(() => __importStar(require('ai')));
            const client = createOpenAI({ apiKey: config.apiKey });
            const model = client.embedding('text-embedding-3-small');
            const result = await embedMany({ model, values: texts });
            return result.embeddings.map((e, i) => ({
                embedding: e,
                tokens: result.usage?.tokens ?? Math.ceil(texts[i]?.length ?? 0 / 4),
            }));
        }
        throw new Error(`Embedding not supported for provider: ${config.provider}`);
    }
};
exports.AIService = AIService;
exports.AIService = AIService = AIService_1 = __decorate([
    (0, common_1.Injectable)()
], AIService);
