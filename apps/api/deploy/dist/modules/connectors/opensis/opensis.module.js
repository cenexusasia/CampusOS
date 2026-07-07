"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSISModule = void 0;
const common_1 = require("@nestjs/common");
const opensis_controller_1 = require("./opensis.controller");
const opensis_service_1 = require("./opensis.service");
let OpenSISModule = class OpenSISModule {
};
exports.OpenSISModule = OpenSISModule;
exports.OpenSISModule = OpenSISModule = __decorate([
    (0, common_1.Module)({
        controllers: [opensis_controller_1.OpenSISController],
        providers: [opensis_service_1.OpenSISService],
        exports: [opensis_service_1.OpenSISService],
    })
], OpenSISModule);
