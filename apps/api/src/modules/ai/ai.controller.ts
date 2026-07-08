import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AIService } from './ai.service';

@ApiTags('AI')
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate AI response' })
  async chat(@Body() body: { model?: string; system?: string; messages: { role: string; content: string }[] }) {
    return this.aiService.generate(
      {
        model: body.model,
        system: body.system,
        messages: body.messages.map(m => ({ role: m.role as any, content: m.content })),
      },
      {
        id: 'default',
        name: 'DeepSeek',
        provider: 'deepseek',
        apiKey: process.env.DEEPSEEK_API_KEY || 'sk-216abaae29064182af776144aed845e3',
        baseUrl: 'https://api.deepseek.com/v1',
        models: ['deepseek-chat'],
        isActive: true,
      },
    );
  }
}
