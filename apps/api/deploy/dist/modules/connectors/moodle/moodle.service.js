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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MoodleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const promise_1 = __importDefault(require("mysql2/promise"));
let MoodleService = MoodleService_1 = class MoodleService {
    prisma;
    provider = 'MOODLE';
    name = 'Moodle';
    capabilities = { sync: true, webhook: false, oauth: false, basicAuth: false, apiKey: false };
    logger = new common_1.Logger(MoodleService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    getConfig(config) {
        return {
            mysqlHost: config.mysqlHost ?? 'localhost',
            mysqlUser: config.mysqlUser ?? 'root',
            mysqlPassword: config.mysqlPassword ?? '',
            mysqlDatabase: config.mysqlDatabase ?? 'moodle',
            moodleUrl: config.moodleUrl ?? 'http://localhost:8080',
        };
    }
    async createMysqlConnection(config) {
        const cfg = this.getConfig(config);
        const connection = await promise_1.default.createConnection({
            host: cfg.mysqlHost,
            user: cfg.mysqlUser,
            password: cfg.mysqlPassword,
            database: cfg.mysqlDatabase,
        });
        return connection;
    }
    async connect(config, tenantId) {
        const cfg = this.getConfig(config);
        this.logger.log(`Connecting Moodle for tenant ${tenantId} at ${cfg.mysqlHost}/${cfg.mysqlDatabase}`);
        let connection = null;
        try {
            connection = await this.createMysqlConnection(config);
            const [rows] = await connection.execute('SELECT COUNT(*) AS course_count FROM mdl_course');
            const courseCount = rows[0]?.course_count ?? 0;
            const siteInfo = {
                database: cfg.mysqlDatabase,
                host: cfg.mysqlHost,
                moodleUrl: cfg.moodleUrl,
                coursesFound: courseCount,
            };
            this.logger.log(`Moodle MySQL connection validated: ${courseCount} courses found`);
        }
        catch (error) {
            this.logger.error(`Moodle MySQL connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new common_1.BadRequestException({
                message: `Failed to connect to Moodle MySQL: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
        }
        finally {
            if (connection) {
                await connection.end();
            }
        }
        const connector = await this.prisma.connector.create({
            data: {
                tenantId,
                type: 'LMS',
                name: `Moodle - ${cfg.moodleUrl}`,
                provider: 'MOODLE',
                config: cfg,
                status: 'CONNECTED',
            },
        });
        this.logger.log(`Moodle connector created: ${connector.id}`);
        return { success: true, connectionId: connector.id };
    }
    async list(tenantId) {
        return this.listConnections(tenantId);
    }
    async listConnections(tenantId) {
        this.logger.log(`Listing Moodle connections for tenant: ${tenantId}`);
        const connectors = await this.prisma.connector.findMany({
            where: { tenantId, type: 'LMS' },
            orderBy: { createdAt: 'desc' },
        });
        return connectors.map((c) => ({
            id: c.id,
            tenantId: c.tenantId,
            type: c.type,
            name: c.name,
            provider: c.provider,
            status: c.status,
            config: c.config,
            lastSync: c.lastSync,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        }));
    }
    async disconnect(connectionId) {
        const connector = await this.prisma.connector.findUnique({
            where: { id: connectionId },
        });
        if (!connector) {
            throw new common_1.NotFoundException({
                message: 'Moodle connection not found',
            });
        }
        await this.prisma.connector.update({
            where: { id: connectionId },
            data: { status: 'DISCONNECTED' },
        });
        this.logger.log(`Moodle connection deactivated: ${connectionId}`);
    }
    async syncCourses(config, tenantId) {
        this.logger.log('Starting Moodle course sync via MySQL');
        const connection = await this.createMysqlConnection(config);
        let syncedCount = 0;
        try {
            const [rows] = await connection.execute('SELECT id, fullname, summary, visible FROM mdl_course');
            const courses = rows;
            for (const course of courses) {
                const courseCode = String(course.id);
                const courseName = course.fullname || `Course ${course.id}`;
                await this.prisma.course.upsert({
                    where: {
                        tenantId_code: {
                            tenantId,
                            code: courseCode,
                        },
                    },
                    update: {
                        name: courseName,
                        description: course.summary || null,
                        status: course.visible === 0 ? 'ARCHIVED' : 'ACTIVE',
                    },
                    create: {
                        tenantId,
                        code: courseCode,
                        name: courseName,
                        description: course.summary || null,
                        status: course.visible === 0 ? 'ARCHIVED' : 'ACTIVE',
                    },
                });
                syncedCount++;
                this.logger.debug(`Synced Moodle course: ${courseName} (${courseCode})`);
            }
        }
        finally {
            await connection.end();
        }
        this.logger.log(`Moodle course sync complete: ${syncedCount} courses`);
        return syncedCount;
    }
    async syncUsers(config, tenantId) {
        this.logger.log('Starting Moodle user sync via MySQL');
        const connection = await this.createMysqlConnection(config);
        let syncedCount = 0;
        try {
            const [userRows] = await connection.execute('SELECT id, username, firstname, lastname, email FROM mdl_user WHERE deleted = 0');
            const users = userRows;
            const [enrolRows] = await connection.execute(`SELECT ue.userid AS user_id, e.courseid AS course_id
         FROM mdl_user_enrolments ue
         INNER JOIN mdl_enrol e ON e.id = ue.enrolid`);
            const enrolments = enrolRows;
            const courseUserMap = new Map();
            for (const enrol of enrolments) {
                if (!courseUserMap.has(enrol.course_id)) {
                    courseUserMap.set(enrol.course_id, new Set());
                }
                courseUserMap.get(enrol.course_id).add(enrol.user_id);
            }
            for (const user of users) {
                const email = user.email || `moodle-user-${user.id}@placeholder.local`;
                const name = `${user.firstname || ''} ${user.lastname || ''}`.trim() ||
                    user.username ||
                    `User ${user.id}`;
                await this.prisma.user.upsert({
                    where: { email },
                    update: { name },
                    create: { email, name },
                });
                syncedCount++;
                this.logger.debug(`Synced Moodle user: ${name} (${email})`);
            }
        }
        finally {
            await connection.end();
        }
        this.logger.log(`Moodle user sync complete: ${syncedCount} users`);
        return syncedCount;
    }
    async sync(connectionId) {
        this.logger.log(`Syncing Moodle connection: ${connectionId}`);
        const connector = await this.prisma.connector.findUnique({
            where: { id: connectionId },
        });
        if (!connector) {
            throw new common_1.NotFoundException({
                message: 'Moodle connection not found',
            });
        }
        const config = connector.config;
        const coursesSynced = await this.syncCourses(config, connector.tenantId);
        const usersSynced = await this.syncUsers(config, connector.tenantId);
        await this.prisma.connector.update({
            where: { id: connectionId },
            data: { lastSync: new Date() },
        });
        this.logger.log(`Moodle sync complete: ${coursesSynced} courses, ${usersSynced} users`);
        return { coursesSynced, usersSynced };
    }
};
exports.MoodleService = MoodleService;
exports.MoodleService = MoodleService = MoodleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MoodleService);
