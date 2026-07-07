"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
exports.createNestApp = createNestApp;
exports.default = handler;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_1 = __importDefault(require("express"));
const platform_express_1 = require("@nestjs/platform-express");
const app_module_1 = require("./app.module");
function setupSwagger(app) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('CampusOS API')
        .setDescription('AI Operating System for Educational Institutions')
        .setVersion('0.1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter JWT token' }, 'access-token')
        .addApiKey({ type: 'apiKey', name: 'X-Tenant-Id', in: 'header', description: 'Tenant identifier' }, 'tenant-id')
        .addTag('Health', 'Health check endpoints')
        .addTag('Auth', 'Authentication endpoints')
        .addTag('Users', 'User management')
        .addTag('Tenants', 'Tenant management')
        .addTag('Courses', 'Course management')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true, tagsSorter: 'alpha', operationsSorter: 'alpha' },
        customSiteTitle: 'CampusOS API Documentation',
        customCss: '.swagger-ui .topbar { display: none }',
    });
}
async function createNestApp(expressInstance) {
    const adapter = expressInstance ? new platform_express_1.ExpressAdapter(expressInstance) : undefined;
    const app = await core_1.NestFactory.create(app_module_1.AppModule, adapter);
    const configService = app.get(config_1.ConfigService);
    const globalPrefix = configService.get('API_GLOBAL_PREFIX', 'api/v1');
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: configService.get('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
    });
    app.use((0, compression_1.default)());
    app.setGlobalPrefix(globalPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true }, validateCustomDecorators: true }));
    setupSwagger(app);
    await app.init();
    if (expressInstance) {
        return expressInstance;
    }
    const appInstance = app;
    return appInstance;
}
async function bootstrap() {
    const app = await createNestApp();
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('API_PORT', 3001);
    await app.listen(port);
    console.log(`\n🚀 CampusOS API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs at http://localhost:${port}/api/docs\n`);
}
let cachedHandler;
async function handler(req, res) {
    if (!cachedHandler) {
        const expressApp = (0, express_1.default)();
        cachedHandler = await createNestApp(expressApp);
    }
    cachedHandler(req, res);
}
if (!process.env['VERCEL']) {
    void bootstrap();
}
