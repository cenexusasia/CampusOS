"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ConnectorsModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorsModule = void 0;
const common_1 = require("@nestjs/common");
const google_module_1 = require("./google/google.module");
const moodle_module_1 = require("./moodle/moodle.module");
const opensis_module_1 = require("./opensis/opensis.module");
const erpnext_module_1 = require("./erpnext/erpnext.module");
const connectors_controller_1 = require("./connectors.controller");
const connectors_service_1 = require("./connectors.service");
const connectors_registry_1 = require("./connectors.registry");
const moodle_service_1 = require("./moodle/moodle.service");
const opensis_service_1 = require("./opensis/opensis.service");
const google_service_1 = require("./google/google.service");
const erpnext_service_1 = require("./erpnext/erpnext.service");
let ConnectorsModule = ConnectorsModule_1 = class ConnectorsModule {
    registry;
    moodleService;
    openSISService;
    googleService;
    erpnextService;
    logger = new common_1.Logger(ConnectorsModule_1.name);
    constructor(registry, moodleService, openSISService, googleService, erpnextService) {
        this.registry = registry;
        this.moodleService = moodleService;
        this.openSISService = openSISService;
        this.googleService = googleService;
        this.erpnextService = erpnextService;
    }
    onModuleInit() {
        const services = [
            this.moodleService,
            this.openSISService,
            this.googleService,
            this.erpnextService,
        ];
        const names = ['Moodle', 'OpenSIS', 'Google', 'ERPNext'];
        let registered = 0;
        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            const name = names[i];
            if (service && typeof service.provider === 'string') {
                this.registry.register(service);
                registered++;
            }
            else {
                this.logger.warn(`Skipping connector registration for ${name}: service or provider missing`);
            }
        }
        this.logger.log(`Registered ${registered}/${services.length} connectors in the ConnectorRegistry`);
    }
};
exports.ConnectorsModule = ConnectorsModule;
exports.ConnectorsModule = ConnectorsModule = ConnectorsModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [google_module_1.GoogleModule, moodle_module_1.MoodleModule, opensis_module_1.OpenSISModule, erpnext_module_1.ERPNextModule],
        controllers: [connectors_controller_1.ConnectorsController],
        providers: [connectors_service_1.ConnectorsService, connectors_registry_1.ConnectorRegistry],
        exports: [google_module_1.GoogleModule, moodle_module_1.MoodleModule, opensis_module_1.OpenSISModule, erpnext_module_1.ERPNextModule, connectors_service_1.ConnectorsService, connectors_registry_1.ConnectorRegistry],
    }),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [connectors_registry_1.ConnectorRegistry,
        moodle_service_1.MoodleService,
        opensis_service_1.OpenSISService,
        google_service_1.GoogleService,
        erpnext_service_1.ERPNextService])
], ConnectorsModule);
