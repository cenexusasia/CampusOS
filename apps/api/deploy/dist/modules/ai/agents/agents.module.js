"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsModule = void 0;
const common_1 = require("@nestjs/common");
const agent_service_1 = require("./agent.service");
const agents_controller_1 = require("./agents.controller");
const knowledge_module_1 = require("../../knowledge/knowledge.module");
const courses_module_1 = require("../../courses/courses.module");
const students_module_1 = require("../../students/students.module");
const notifications_module_1 = require("../../notifications/notifications.module");
const analytics_module_1 = require("../../analytics/analytics.module");
let AgentsModule = class AgentsModule {
};
exports.AgentsModule = AgentsModule;
exports.AgentsModule = AgentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            knowledge_module_1.KnowledgeModule,
            courses_module_1.CoursesModule,
            students_module_1.StudentsModule,
            notifications_module_1.NotificationsModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [agents_controller_1.AgentsController],
        providers: [agent_service_1.AgentService],
        exports: [agent_service_1.AgentService],
    })
], AgentsModule);
