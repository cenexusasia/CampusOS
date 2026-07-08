"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let AIController = class AIController {
    async chat(body) {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            throw new Error('DEEPSEEK_API_KEY environment variable is not set. ' +
                'Please configure it in your environment (e.g. Railway dashboard, .env file) and restart the application.');
        }
        const model = body.model ?? 'deepseek-chat';
        const messages = body.messages.map(m => ({ role: m.role, content: m.content }));
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
        const data = await response.json();
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
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI response via DeepSeek' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "chat", null);
exports.AIController = AIController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, common_1.Controller)('ai')
], AIController);
