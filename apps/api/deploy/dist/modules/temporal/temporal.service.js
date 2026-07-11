"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var TemporalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemporalService = void 0;
const common_1 = require("@nestjs/common");
let TemporalService = TemporalService_1 = class TemporalService {
    logger = new common_1.Logger(TemporalService_1.name);
    client = null;
    async onModuleInit() {
        try {
            const { Client } = await Promise.resolve().then(() => __importStar(require('@temporalio/client')));
            this.client = new Client({
                connection: {
                    address: process.env.TEMPORAL_HOST || 'localhost:7233',
                },
            });
            this.logger.log('Temporal client connected successfully');
        }
        catch {
            this.logger.warn('Temporal server not available — workflows will fall back to BullMQ if Redis is available');
        }
    }
    async startWorkflow(options) {
        if (!this.client) {
            this.logger.warn(`[Temporal] Fallback: workflow "${options.workflowType}" would queue via BullMQ`);
            return { workflowId: null, fallback: true };
        }
        try {
            const handle = await this.client.workflow.start(options.workflowType, {
                args: options.args,
                taskQueue: options.taskQueue,
                workflowId: options.id,
            });
            this.logger.log(`Workflow started: ${handle.workflowId}`);
            return { workflowId: handle.workflowId };
        }
        catch (err) {
            this.logger.error(`Temporal start failed: ${err.message}`);
            return { workflowId: null, fallback: true, error: err.message };
        }
    }
    async getWorkflowStatus(workflowId) {
        if (!this.client) {
            return { workflowId, status: 'UNAVAILABLE' };
        }
        try {
            const handle = this.client.workflow.getHandle(workflowId);
            const describe = await handle.describe();
            return {
                workflowId,
                status: describe.status?.name ?? 'UNKNOWN',
                result: describe.result
                    ? JSON.parse(JSON.stringify(describe.result))
                    : undefined,
            };
        }
        catch (err) {
            this.logger.error(`Failed to get workflow status: ${err.message}`);
            return { workflowId, status: 'ERROR', error: err.message };
        }
    }
};
exports.TemporalService = TemporalService;
exports.TemporalService = TemporalService = TemporalService_1 = __decorate([
    (0, common_1.Injectable)()
], TemporalService);
