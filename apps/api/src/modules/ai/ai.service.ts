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
            messages: options.messages.map((m: any) => ({ role: m.role, content: m.content })),
            system: options.system,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 4096,
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`DeepSeek API error ${response.status}: ${errBody}`);
        }

        const data: any = await response.json();
        const choice: any = data.choices?.[0];
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
