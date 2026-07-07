"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const requestId = request.headers['x-request-id'];
        let status;
        let code;
        let message;
        let details = undefined;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                code = this.statusToCode(status);
            }
            else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const resp = exceptionResponse;
                message = resp['message'] || exception.message;
                code = resp['code'] || this.statusToCode(status);
                details = resp['errors'] || resp['details'];
            }
            else {
                message = exception.message;
                code = this.statusToCode(status);
            }
        }
        else if (exception instanceof Error) {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            code = 'INTERNAL_ERROR';
            message = 'An unexpected error occurred';
            this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack, { requestId, path: request.url });
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            code = 'INTERNAL_ERROR';
            message = 'An unexpected error occurred';
            this.logger.error(`Unknown exception type: ${String(exception)}`, { requestId, path: request.url });
        }
        const body = {
            success: false,
            error: {
                code,
                message,
                ...(details !== undefined && typeof details === 'object' && details !== null ? { details } : {}),
            },
            meta: {
                timestamp: new Date().toISOString(),
                path: request.url,
                ...(requestId && { requestId }),
            },
        };
        response.status(status).json(body);
    }
    statusToCode(status) {
        switch (status) {
            case common_1.HttpStatus.BAD_REQUEST:
                return 'BAD_REQUEST';
            case common_1.HttpStatus.UNAUTHORIZED:
                return 'UNAUTHORIZED';
            case common_1.HttpStatus.FORBIDDEN:
                return 'FORBIDDEN';
            case common_1.HttpStatus.NOT_FOUND:
                return 'NOT_FOUND';
            case common_1.HttpStatus.CONFLICT:
                return 'CONFLICT';
            case common_1.HttpStatus.UNPROCESSABLE_ENTITY:
                return 'VALIDATION_ERROR';
            case common_1.HttpStatus.TOO_MANY_REQUESTS:
                return 'RATE_LIMIT_EXCEEDED';
            case common_1.HttpStatus.INTERNAL_SERVER_ERROR:
                return 'INTERNAL_ERROR';
            case common_1.HttpStatus.SERVICE_UNAVAILABLE:
                return 'SERVICE_UNAVAILABLE';
            default:
                return 'UNKNOWN_ERROR';
        }
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
