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
exports.AgentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const agent_service_1 = require("./agent.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
class ExecuteGoalDto {
    goal;
}
let AgentsController = class AgentsController {
    agentService;
    constructor(agentService) {
        this.agentService = agentService;
    }
    async executeGoal(req, dto) {
        if (!dto.goal || dto.goal.trim().length === 0) {
            throw new common_1.BadRequestException('Goal is required');
        }
        const tenantId = req.tenantId ?? req.user?.tenantId;
        const userId = req.user?.sub ?? req.user?.id;
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant context is required');
        }
        return this.agentService.executeGoal(dto.goal, {
            tenantId,
            userId,
        });
    }
};
exports.AgentsController = AgentsController;
__decorate([
    (0, common_1.Post)('execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute a goal-driven multi-step AI agent task',
        description: 'Breaks a natural-language goal into steps, executes each step using available tools (knowledge search, courses, students, notifications, analytics), and returns step-by-step results with a final summary.',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ExecuteGoalDto]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "executeGoal", null);
exports.AgentsController = AgentsController = __decorate([
    (0, swagger_1.ApiTags)('AI Agents'),
    (0, common_1.Controller)('api/v1/agents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentsController);
