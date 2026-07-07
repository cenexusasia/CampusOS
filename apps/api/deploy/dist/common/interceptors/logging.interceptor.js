"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger('HTTP');
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const requestId = request.headers['x-request-id'];
        const { method, url } = request;
        const startTime = Date.now();
        const logMessage = [
            `→ ${method} ${url}`,
            requestId ? `[${requestId}]` : '',
        ]
            .filter(Boolean)
            .join(' ');
        this.logger.log(logMessage);
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const elapsed = Date.now() - startTime;
                const statusCode = response.statusCode;
                this.logger.log([
                    `← ${method} ${url}`,
                    `${statusCode}`,
                    `${elapsed}ms`,
                    requestId ? `[${requestId}]` : '',
                ]
                    .filter(Boolean)
                    .join(' '));
            },
            error: (error) => {
                const elapsed = Date.now() - startTime;
                this.logger.warn([
                    `← ${method} ${url}`,
                    `ERROR`,
                    `${elapsed}ms`,
                    error.message,
                    requestId ? `[${requestId}]` : '',
                ]
                    .filter(Boolean)
                    .join(' '));
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
