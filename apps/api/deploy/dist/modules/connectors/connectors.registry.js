"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConnectorRegistry_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorRegistry = void 0;
const common_1 = require("@nestjs/common");
let ConnectorRegistry = ConnectorRegistry_1 = class ConnectorRegistry {
    logger = new common_1.Logger(ConnectorRegistry_1.name);
    connectors = new Map();
    register(plugin) {
        const key = plugin.provider.toLowerCase();
        if (this.connectors.has(key)) {
            this.logger.warn(`Overwriting existing connector registration for provider: ${plugin.provider}`);
        }
        this.connectors.set(key, plugin);
        this.logger.log(`Registered connector: ${plugin.name} (${plugin.provider})`);
    }
    get(provider) {
        return this.connectors.get(provider.toLowerCase());
    }
    getAll() {
        return Array.from(this.connectors.values());
    }
    has(provider) {
        return this.connectors.has(provider.toLowerCase());
    }
};
exports.ConnectorRegistry = ConnectorRegistry;
exports.ConnectorRegistry = ConnectorRegistry = ConnectorRegistry_1 = __decorate([
    (0, common_1.Injectable)()
], ConnectorRegistry);
