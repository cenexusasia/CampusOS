import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import mysql from 'mysql2/promise';

/** Attempt to extract an array from an API response, checking common wrapper keys. */
function extractArray<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj[key])) return obj[key] as T[];
  }
  return [];
}

export interface OpenSISConfig {
  apiUrl: string;
  apiKey: string;
  apiSecret?: string;
  schoolId: string;
  // MySQL fallback connection params
  dbHost?: string;
  dbPort?: number;
  dbUser?: string;
  dbPassword?: string;
  dbName?: string;
}

export interface OpenSISConnection {
  id: string;
  tenantId: string;
  type: string;
  name: string;
  provider: string;
  status: string;
  config: unknown;
  lastSync: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OpenSISStudent {
  id: number;
  student_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  grade_level?: string;
}

interface OpenSISStaff {
  id: number;
  staff_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  title?: string;
}

interface OpenSISCourse {
  id: number;
  course_id?: string;
  title?: string;
  short_name?: string;
  subject?: string;
  credits?: number;
  description?: string;
}

@Injectable()
export class OpenSISService {
  private readonly logger = new Logger(OpenSISService.name);

  constructor(private readonly prisma: PrismaService) {}

  async connect(
    config: OpenSISConfig,
    tenantId: string,
  ): Promise<{ success: boolean; connectionId: string; validatedBy?: string }> {
    this.logger.log(`Connecting OpenSIS for tenant ${tenantId} at ${config.apiUrl}`);

    let validatedBy: string | undefined;

    // Try REST API first
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
    } catch (restError) {
      this.logger.warn(`OpenSIS REST API not available, trying MySQL: ${restError instanceof Error ? restError.message : 'Unknown error'}`);
    }

    // Fall back to MySQL
    if (!validatedBy && config.dbHost) {
      try {
        const connection = await mysql.createConnection({
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
      } catch (dbError) {
        this.logger.error(`OpenSIS MySQL connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        throw new BadRequestException({
          message: `Failed to connect to OpenSIS: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
        });
      }
    }

    if (!validatedBy) {
      throw new BadRequestException({
        message: 'Could not validate OpenSIS connection. No REST API available and no MySQL config provided.',
      });
    }

    const connector = await this.prisma.connector.create({
      data: {
        tenantId,
        type: 'SIS',
        name: `OpenSIS - School ${config.schoolId}`,
        provider: 'OPENSIS',
        config: config as any,
        status: 'CONNECTED',
      },
    });

    this.logger.log(`OpenSIS connector created: ${connector.id} (validated via ${validatedBy})`);
    return { success: true, connectionId: connector.id, validatedBy };
  }

  async listConnections(tenantId: string): Promise<OpenSISConnection[]> {
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
      config: c.config,
      lastSync: c.lastSync,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async disconnect(connectionId: string): Promise<void> {
    const connector = await this.prisma.connector.findUnique({
      where: { id: connectionId },
    });

    if (!connector) {
      throw new NotFoundException({
        message: 'OpenSIS connection not found',
      });
    }

    await this.prisma.connector.update({
      where: { id: connectionId },
      data: { status: 'DISCONNECTED' },
    });

    this.logger.log(`OpenSIS connection deactivated: ${connectionId}`);
  }

  // ── REST API sync (attempted first) ──

  private async syncViaRestApi(
    config: OpenSISConfig,
    tenantId: string,
  ): Promise<{ studentsSynced: number; staffSynced: number; coursesSynced: number }> {
    this.logger.log('Attempting OpenSIS sync via REST API');

    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    };

    if (config.apiSecret) {
      headers['X-API-Secret'] = config.apiSecret;
    }

    let studentsSynced = 0;
    let staffSynced = 0;
    let coursesSynced = 0;

    // Fetch students
    try {
      const studentsResp = await fetch(`${config.apiUrl}/students?school_id=${config.schoolId}`, { headers });
      if (studentsResp.ok) {
        const studentsData: unknown = await studentsResp.json();
        const students: OpenSISStudent[] = extractArray<OpenSISStudent>(
          studentsData, 'students',
        );
        studentsSynced = await this.upsertStudents(students, tenantId);
      }
    } catch (err) {
      this.logger.warn(`REST students endpoint failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Fetch staff
    try {
      const staffResp = await fetch(`${config.apiUrl}/staff?school_id=${config.schoolId}`, { headers });
      if (staffResp.ok) {
        const staffData: unknown = await staffResp.json();
        const staff: OpenSISStaff[] = extractArray<OpenSISStaff>(
          staffData, 'staff',
        );
        staffSynced = await this.upsertStaff(staff, tenantId);
      }
    } catch (err) {
      this.logger.warn(`REST staff endpoint failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Fetch courses
    try {
      const coursesResp = await fetch(`${config.apiUrl}/courses?school_id=${config.schoolId}`, { headers });
      if (coursesResp.ok) {
        const coursesData: unknown = await coursesResp.json();
        const courses: OpenSISCourse[] = extractArray<OpenSISCourse>(
          coursesData, 'courses',
        );
        coursesSynced = await this.upsertCourses(courses, tenantId);
      }
    } catch (err) {
      this.logger.warn(`REST courses endpoint failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return { studentsSynced, staffSynced, coursesSynced };
  }

  // ── MySQL fallback sync ──

  private async syncViaMySQL(
    config: OpenSISConfig,
    tenantId: string,
  ): Promise<{ studentsSynced: number; staffSynced: number; coursesSynced: number }> {
    this.logger.log('Syncing OpenSIS via MySQL fallback');

    if (!config.dbHost) {
      throw new BadRequestException({
        message: 'MySQL host is required for database fallback sync',
      });
    }

    const connection = await mysql.createConnection({
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
      // Detect available tables
      const [tables] = await connection.execute<mysql.RowDataPacket[]>(
        `SHOW TABLES`,
      );
      const tableNames = tables.map((t) => Object.values(t)[0] as string);
      this.logger.log(`OpenSIS MySQL tables found: ${tableNames.join(', ')}`);

      // Sync students — try common table names
      const studentTable = this.findTable(tableNames, ['students', 'student', 'pupil']);
      if (studentTable) {
        const [students] = await connection.execute<mysql.RowDataPacket[]>(
          `SELECT * FROM \`${studentTable}\``,
        );
        const mapped: OpenSISStudent[] = students.map((row) => ({
          id: row.id ?? row.student_id ?? 0,
          student_id: String(row.student_id ?? row.id ?? ''),
          first_name: row.first_name ?? row.firstname ?? row.fname ?? '',
          last_name: row.last_name ?? row.lastname ?? row.lname ?? '',
          email: row.email ?? null,
          grade_level: row.grade_level ?? row.grade ?? null,
        }));
        studentsSynced = await this.upsertStudents(mapped, tenantId);
      }

      // Sync staff — try common table names
      const staffTable = this.findTable(tableNames, ['staff', 'users', 'employees', 'teachers']);
      if (staffTable) {
        const [staff] = await connection.execute<mysql.RowDataPacket[]>(
          `SELECT * FROM \`${staffTable}\``,
        );
        const mapped: OpenSISStaff[] = staff.map((row) => ({
          id: row.id ?? row.staff_id ?? 0,
          staff_id: String(row.staff_id ?? row.id ?? ''),
          first_name: row.first_name ?? row.firstname ?? row.fname ?? '',
          last_name: row.last_name ?? row.lastname ?? row.lname ?? '',
          email: row.email ?? null,
          title: row.title ?? row.profile ?? null,
        }));
        staffSynced = await this.upsertStaff(mapped, tenantId);
      }

      // Sync courses — try common table names
      const courseTable = this.findTable(tableNames, [
        'courses', 'course', 'course_subjects', 'subjects',
      ]);
      if (courseTable) {
        const [courses] = await connection.execute<mysql.RowDataPacket[]>(
          `SELECT * FROM \`${courseTable}\``,
        );
        const mapped: OpenSISCourse[] = courses.map((row) => ({
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
    } finally {
      await connection.end();
    }

    return { studentsSynced, staffSynced, coursesSynced };
  }

  // ── Helpers ──

  private findTable(existingTables: string[], candidates: string[]): string | null {
    for (const candidate of candidates) {
      if (existingTables.includes(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  private async upsertStudents(
    students: OpenSISStudent[],
    tenantId: string,
  ): Promise<number> {
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

  private async upsertStaff(
    staff: OpenSISStaff[],
    tenantId: string,
  ): Promise<number> {
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

  private async upsertCourses(
    courses: OpenSISCourse[],
    tenantId: string,
  ): Promise<number> {
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

  // ── Main sync method ──

  async sync(
    connectionId: string,
  ): Promise<{
    studentsSynced: number;
    staffSynced: number;
    coursesSynced: number;
  }> {
    this.logger.log(`Syncing OpenSIS connection: ${connectionId}`);

    const connector = await this.prisma.connector.findUnique({
      where: { id: connectionId },
    });

    if (!connector) {
      throw new NotFoundException({
        message: 'OpenSIS connection not found',
      });
    }

    const config = connector.config as unknown as OpenSISConfig;

    let result: { studentsSynced: number; staffSynced: number; coursesSynced: number };

    // Try REST API first
    result = await this.syncViaRestApi(config, connector.tenantId);

    // If REST yielded nothing, try MySQL fallback
    if (result.studentsSynced === 0 && result.staffSynced === 0 && result.coursesSynced === 0) {
      this.logger.log('REST API sync returned no results, falling back to MySQL');
      result = await this.syncViaMySQL(config, connector.tenantId);
    }

    await this.prisma.connector.update({
      where: { id: connectionId },
      data: { lastSync: new Date() },
    });

    this.logger.log(
      `OpenSIS sync complete: ${result.studentsSynced} students, ${result.staffSynced} staff, ${result.coursesSynced} courses`,
    );
    return result;
  }
}
