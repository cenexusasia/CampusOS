"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsModule = exports.EVENTS = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_service_1 = require("./event-emitter.service");
exports.EVENTS = {
    COURSE_CREATED: 'course.created',
    STUDENT_ENROLLED: 'student.enrolled',
    KNOWLEDGE_UPLOADED: 'knowledge.uploaded',
    CONNECTOR_SYNCED: 'connector.synced',
    AGENT_EXECUTED: 'agent.executed',
};
let EventsModule = class EventsModule {
};
exports.EventsModule = EventsModule;
exports.EventsModule = EventsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [event_emitter_service_1.EventEmitterService],
        exports: [event_emitter_service_1.EventEmitterService],
    })
], EventsModule);
