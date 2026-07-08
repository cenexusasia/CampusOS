import { Injectable, Logger } from '@nestjs/common';

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
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateResult {
  content: string;
  finishReason: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export interface EmbedResult {
  embedding: number[];
  tokens: number;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  async generate(options: GenerateOptions, config: AIProviderConfig): Promise<GenerateResult> {
    const { generateText } = await import('ai');

    let model: any;
    const modelName = options.model ?? config.models[0] ?? 'gpt-4o';

    switch (config.provider) {
      case 'openai': {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const client = createOpenAI({ apiKey: config.apiKey });
        model = client(modelName);
        break;
      }
      case 'anthropic': {
        const { createAnthropic } = await import('@ai-sdk/anthropic');
        const client = createAnthropic({ apiKey: config.apiKey });
        model = client(modelName);
        break;
      }
      case 'google': {
        const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
        const client = createGoogleGenerativeAI({ apiKey: config.apiKey });
        model = client(modelName);
        break;
      }
      case 'openrouter': {
        const { createOpenAICompatible } = await import('@ai-sdk/openai-compatible');
        const client = createOpenAICompatible({
          name: 'openrouter',
          baseURL: config.baseUrl ?? 'https://openrouter.ai/api/v1',
          apiKey: config.apiKey,
        });
        model = client(modelName);
        break;
      }
      case 'deepseek': {
        const { createOpenAICompatible } = await import('@ai-sdk/openai-compatible');
        const client = createOpenAICompatible({
          name: 'deepseek',
          baseURL: config.baseUrl ?? 'https://api.deepseek.com/v1',
          apiKey: config.apiKey,
        });
        model = client(modelName);
        break;
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
    } as any);

    return {
      content: result.text,
      finishReason: result.finishReason,
      usage: {
        promptTokens: (result.usage as any)?.promptTokens ?? 0,
        completionTokens: (result.usage as any)?.completionTokens ?? 0,
        totalTokens: (result.usage as any)?.totalTokens ?? 0,
      },
    };
  }

  async embed(texts: string[], config: AIProviderConfig): Promise<EmbedResult[]> {
    if (config.provider === 'openai') {
      const { createOpenAI } = await import('@ai-sdk/openai');
      const { embedMany } = await import('ai');
      const client = createOpenAI({ apiKey: config.apiKey });
      const model = client.embedding('text-embedding-3-small');
      const result = await embedMany({ model, values: texts });
      return result.embeddings.map((e: any, i: number) => ({
        embedding: e,
        tokens: (result.usage as any)?.tokens ?? Math.ceil(texts[i]?.length ?? 0 / 4),
      }));
    }
    throw new Error(`Embedding not supported for provider: ${config.provider}`);
  }
}
