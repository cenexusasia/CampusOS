"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemporalModule = void 0;
const common_1 = require("@nestjs/common");
const temporal_service_1 = require("./temporal.service");
const temporal_controller_1 = require("./temporal.controller");
const queue_module_1 = require("../queue/queue.module");
let TemporalModule = class TemporalModule {
};
exports.TemporalModule = TemporalModule;
exports.TemporalModule = TemporalModule = __decorate([
    (0, common_1.Module)({
        imports: [queue_module_1.QueueModule],
        controllers: [temporal_controller_1.TemporalController],
        providers: [temporal_service_1.TemporalService],
        exports: [temporal_service_1.TemporalService],
    })
], TemporalModule);
