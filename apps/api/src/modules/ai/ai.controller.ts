import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('AI')
@Controller('ai')
@Throttle({ default: { ttl: 60000, limit: 20 } })
export class AIController {
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate AI response via DeepSeek' })
  async chat(@Body() body: { model?: string; system?: string; messages: { role: string; content: string }[] }) {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error(
        'DEEPSEEK_API_KEY environment variable is not set. ' +
        'Please configure it in your environment (e.g. Railway dashboard, .env file) and restart the application.',
      );
    }
    const model = body.model ?? 'deepseek-chat';
    
    const messages: any[] = body.messages.map(m => ({ role: m.role, content: m.content }));
    if (body.system) {
      messages.unshift({ role: 'system', content: body.system });
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`DeepSeek API error ${response.status}: ${errBody}`);
    }

    const data = await response.json() as any;
    const choice = data.choices?.[0];

    return {
      content: choice?.message?.content ?? '',
      finishReason: choice?.finish_reason ?? 'stop',
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }
}
