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
var OpenSISService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSISService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const promise_1 = __importDefault(require("mysql2/promise"));
function extractArray(data, key) {
    if (Array.isArray(data))
        return data;
    if (data && typeof data === 'object') {
        const obj = data;
        if (Array.isArray(obj.data))
            return obj.data;
        if (Array.isArray(obj[key]))
            return obj[key];
    }
    return [];
}
let OpenSISService = OpenSISService_1 = class OpenSISService {
    prisma;
    logger = new common_1.Logger(OpenSISService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeConfig(config) {
        const normalized = { ...config };
        if (!normalized.dbHost && normalized.mysqlHost) {
            normalized.dbHost = normalized.mysqlHost;
        }
        if (!normalized.dbPort && normalized.mysqlPort) {
            normalized.dbPort = normalized.mysqlPort;
        }
        if (!normalized.dbUser && normalized.mysqlUser) {
            normalized.dbUser = normalized.mysqlUser;
        }
        if (!normalized.dbPassword && normalized.mysqlPassword) {
            normalized.dbPassword = normalized.mysqlPassword;
        }
        if (!normalized.dbName && normalized.mysqlDatabase) {
            normalized.dbName = normalized.mysqlDatabase;
        }
        return normalized;
    }
    async connect(config, tenantId) {
        config = this.normalizeConfig(config);
        this.logger.log(`Connecting OpenSIS for tenant ${tenantId} at ${config.apiUrl}`);
        let validatedBy;
        try {
            const response = await fetch(config.apiUrl, {
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                validatedBy = 'REST';
                this.logger.log(`OpenSIS REST API validated at: ${config.apiUrl}`);
            }
        }
        catch (restError) {
            this.logger.warn(`OpenSIS REST API not available, trying MySQL: ${restError instanceof Error ? restError.message : 'Unknown error'}`);
        }
        if (!validatedBy && config.dbHost) {
            try {
                const connection = await promise_1.default.createConnection({
                    host: config.dbHost,
                    port: config.dbPort ?? 3306,
                    user: config.dbUser ?? 'root',
                    password: config.dbPassword ?? '',
                    database: config.dbName ?? 'opensis',
                    connectTimeout: 5000,
                });
                await connection.ping();
                await connection.end();
                validatedBy = 'MySQL';
                this.logger.log(`OpenSIS MySQL connection validated at: ${config.dbHost}`);
            }
            catch (dbError) {
                this.logger.error(`OpenSIS MySQL connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
                throw new common_1.BadRequestException({
                    message: `Failed to connect to OpenSIS: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
                });
            }
        }
        if (!validatedBy) {
            throw new common_1.BadRequestException({
                message: 'Could not validate OpenSIS connection. No REST API available and no MySQL config provided.',
            });
        }
        const connector = await this.prisma.connector.create({
            data: {
                tenantId,
                type: 'SIS',
                name: `OpenSIS - School ${config.schoolId}`,
                provider: 'OPENSIS',
                config: config,
                status: 'CONNECTED',
            },
        });
        this.logger.log(`OpenSIS connector created: ${connector.id} (validated via ${validatedBy})`);
        return { success: true, connectionId: connector.id, validatedBy };
    }
    async listConnections(tenantId) {
        this.logger.log(`Listing OpenSIS connections for tenant: ${tenantId}`);
        const connectors = await this.prisma.connector.findMany({
            where: { tenantId, type: 'SIS' },
            orderBy: { createdAt: 'desc' },
        });
        return connectors.map((c) => ({
            id: c.id,
            tenantId: c.tenantId,
            type: c.type,
            name: c.name,
            provider: c.provider,
            status: c.status,
            config: this.normalizeConfig(c.config),
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
                message: 'OpenSIS connection not found',
            });
        }
        await this.prisma.connector.update({
            where: { id: connectionId },
            data: { status: 'DISCONNECTED' },
        });
        this.logger.log(`OpenSIS connection deactivated: ${connectionId}`);
    }
    async syncViaRestApi(config, tenantId) {
        this.logger.log('Attempting OpenSIS sync via REST API');
        const headers = {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
        };
        if (config.apiSecret) {
            headers['X-API-Secret'] = config.apiSecret;
        }
        let studentsSynced = 0;
        let staffSynced = 0;
        let coursesSynced = 0;
        try {
            const studentsResp = await fetch(`${config.apiUrl}/students?school_id=${config.schoolId}`, { headers });
            if (studentsResp.ok) {
                const studentsData = await studentsResp.json();
                const students = extractArray(studentsData, 'students');
                studentsSynced = await this.upsertStudents(students, tenantId);
            }
        }
        catch (err) {
            this.logger.warn(`REST students endpoint failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        try {
            const staffResp = await fetch(`${config.apiUrl}/staff?school_id=${config.schoolId}`, { headers });
            if (staffResp.ok) {
                const staffData = await staffResp.json();
                const staff = extractArray(staffData, 'staff');
                staffSynced = await this.upsertStaff(staff, tenantId);
            }
        }
        catch (err) {
            this.logger.warn(`REST staff endpoint failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        try {
            const coursesResp = await fetch(`${config.apiUrl}/courses?school_id=${config.schoolId}`, { headers });
            if (coursesResp.ok) {
                const coursesData = await coursesResp.json();
                const courses = extractArray(coursesData, 'courses');
                coursesSynced = await this.upsertCourses(courses, tenantId);
            }
        }
        catch (err) {
            this.logger.warn(`REST courses endpoint failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        return { studentsSynced, staffSynced, coursesSynced };
    }
    async syncViaMySQL(config, tenantId) {
        this.logger.log('Syncing OpenSIS via MySQL fallback');
        if (!config.dbHost) {
            throw new common_1.BadRequestException({
                message: 'MySQL host is required for database fallback sync',
            });
        }
        const connection = await promise_1.default.createConnection({
            host: config.dbHost,
            port: config.dbPort ?? 3306,
            user: config.dbUser ?? 'root',
            password: config.dbPassword ?? '',
            database: config.dbName ?? 'opensis',
        });
        let studentsSynced = 0;
        let staffSynced = 0;
        let coursesSynced = 0;
        try {
            const [tables] = await connection.execute(`SHOW TABLES`);
            const tableNames = tables.map((t) => Object.values(t)[0]);
            this.logger.log(`OpenSIS MySQL tables found: ${tableNames.join(', ')}`);
            const studentTable = this.findTable(tableNames, ['students', 'student', 'pupil']);
            if (studentTable) {
                const [students] = await connection.execute(`SELECT * FROM \`${studentTable}\``);
                const mapped = students.map((row) => ({
                    id: row.id ?? row.student_id ?? 0,
                    student_id: String(row.student_id ?? row.id ?? ''),
                    first_name: row.first_name ?? row.firstname ?? row.fname ?? '',
                    last_name: row.last_name ?? row.lastname ?? row.lname ?? '',
                    email: row.email ?? null,
                    grade_level: row.grade_level ?? row.grade ?? null,
                }));
                studentsSynced = await this.upsertStudents(mapped, tenantId);
            }
            const staffTable = this.findTable(tableNames, ['staff', 'users', 'employees', 'teachers']);
            if (staffTable) {
                const [staff] = await connection.execute(`SELECT * FROM \`${staffTable}\``);
                const mapped = staff.map((row) => ({
                    id: row.id ?? row.staff_id ?? 0,
                    staff_id: String(row.staff_id ?? row.id ?? ''),
                    first_name: row.first_name ?? row.firstname ?? row.fname ?? '',
                    last_name: row.last_name ?? row.lastname ?? row.lname ?? '',
                    email: row.email ?? null,
                    title: row.title ?? row.profile ?? null,
                }));
                staffSynced = await this.upsertStaff(mapped, tenantId);
            }
            const courseTable = this.findTable(tableNames, [
                'courses', 'course', 'course_subjects', 'subjects',
            ]);
            if (courseTable) {
                const [courses] = await connection.execute(`SELECT * FROM \`${courseTable}\``);
                const mapped = courses.map((row) => ({
                    id: row.id ?? row.course_id ?? 0,
                    course_id: String(row.course_id ?? row.id ?? ''),
                    title: row.title ?? row.course_title ?? row.name ?? '',
                    short_name: row.short_name ?? row.subject ?? null,
                    subject: row.subject ?? null,
                    credits: row.credits ? Number(row.credits) : undefined,
                    description: row.description ?? null,
                }));
                coursesSynced = await this.upsertCourses(mapped, tenantId);
            }
        }
        finally {
            await connection.end();
        }
        return { studentsSynced, staffSynced, coursesSynced };
    }
    findTable(existingTables, candidates) {
        for (const candidate of candidates) {
            if (existingTables.includes(candidate)) {
                return candidate;
            }
        }
        return null;
    }
    async upsertStudents(students, tenantId) {
        let count = 0;
        for (const student of students) {
            const email = student.email ?? `opensis-student-${student.id}@placeholder.local`;
            const name = `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() || `Student ${student.id}`;
            await this.prisma.user.upsert({
                where: { email },
                update: { name },
                create: { email, name },
            });
            count++;
            this.logger.debug(`Synced OpenSIS student: ${name} (${email})`);
        }
        return count;
    }
    async upsertStaff(staff, tenantId) {
        let count = 0;
        for (const member of staff) {
            const email = member.email ?? `opensis-staff-${member.id}@placeholder.local`;
            const name = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim() || `Staff ${member.id}`;
            await this.prisma.user.upsert({
                where: { email },
                update: { name },
                create: { email, name },
            });
            count++;
            this.logger.debug(`Synced OpenSIS staff: ${name} (${email})`);
        }
        return count;
    }
    async upsertCourses(courses, tenantId) {
        let count = 0;
        for (const course of courses) {
            const courseCode = course.course_id || course.short_name || `opensis-${course.id}`;
            const courseName = course.title || `Course ${course.id}`;
            await this.prisma.course.upsert({
                where: {
                    tenantId_code: {
                        tenantId,
                        code: courseCode,
                    },
                },
                update: {
                    name: courseName,
                    description: course.description || null,
                    credits: course.credits ?? undefined,
                },
                create: {
                    tenantId,
                    code: courseCode,
                    name: courseName,
                    description: course.description || null,
                    credits: course.credits ?? undefined,
                },
            });
            count++;
            this.logger.debug(`Synced OpenSIS course: ${courseName} (${courseCode})`);
        }
        return count;
    }
    async sync(connectionId) {
        this.logger.log(`Syncing OpenSIS connection: ${connectionId}`);
        const connector = await this.prisma.connector.findUnique({
            where: { id: connectionId },
        });
        if (!connector) {
            throw new common_1.NotFoundException({
                message: 'OpenSIS connection not found',
            });
        }
        const config = this.normalizeConfig(connector.config);
        let result;
        result = await this.syncViaRestApi(config, connector.tenantId);
        if (result.studentsSynced === 0 && result.staffSynced === 0 && result.coursesSynced === 0) {
            this.logger.log('REST API sync returned no results, falling back to MySQL');
            result = await this.syncViaMySQL(config, connector.tenantId);
        }
        await this.prisma.connector.update({
            where: { id: connectionId },
            data: { lastSync: new Date() },
        });
        this.logger.log(`OpenSIS sync complete: ${result.studentsSynced} students, ${result.staffSynced} staff, ${result.coursesSynced} courses`);
        return result;
    }
};
exports.OpenSISService = OpenSISService;
exports.OpenSISService = OpenSISService = OpenSISService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OpenSISService);
