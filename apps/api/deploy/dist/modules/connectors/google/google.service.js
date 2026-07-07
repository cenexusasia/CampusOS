"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GoogleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleService = void 0;
const common_1 = require("@nestjs/common");
let GoogleService = GoogleService_1 = class GoogleService {
    logger = new common_1.Logger(GoogleService_1.name);
    defaultScopes = [
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.rosters.readonly',
        'https://www.googleapis.com/auth/classroom.profile.emails',
    ];
    getAuthUrl(config) {
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: 'code',
            scope: (config.scopes ?? this.defaultScopes).join(' '),
            access_type: 'offline',
            prompt: 'consent',
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
    async exchangeCode(code, config) {
        this.logger.log(`Exchanging auth code for tenant using client ID: ${config.clientId}`);
        return {
            accessToken: 'placeholder_access_token',
            refreshToken: 'placeholder_refresh_token',
            expiresIn: 3600,
        };
    }
    async listConnections(tenantId) {
        this.logger.log(`Listing Google connections for tenant: ${tenantId}`);
        return [];
    }
    async disconnect(connectionId) {
        this.logger.log(`Disconnecting Google connection: ${connectionId}`);
    }
};
exports.GoogleService = GoogleService;
exports.GoogleService = GoogleService = GoogleService_1 = __decorate([
    (0, common_1.Injectable)()
], GoogleService);
