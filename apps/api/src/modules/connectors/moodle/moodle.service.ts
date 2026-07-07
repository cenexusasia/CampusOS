import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import mysql, { type Connection } from 'mysql2/promise';

export interface MoodleConfig {
  mysqlHost?: string;
  mysqlUser?: string;
  mysqlPassword?: string;
  mysqlDatabase?: string;
  moodleUrl?: string;
}

export interface MoodleConnection {
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

interface MoodleCourse {
  id: number;
  fullname: string;
  summary?: string;
  visible: number;
}

interface MoodleUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface MoodleEnrolment {
  user_id: number;
  course_id: number;
}

@Injectable()
export class MoodleService {
  private readonly logger = new Logger(MoodleService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getConfig(config: MoodleConfig): Required<MoodleConfig> {
    return {
      mysqlHost: config.mysqlHost ?? 'localhost',
      mysqlUser: config.mysqlUser ?? 'root',
      mysqlPassword: config.mysqlPassword ?? '',
      mysqlDatabase: config.mysqlDatabase ?? 'moodle',
      moodleUrl: config.moodleUrl ?? 'http://localhost:8080',
    };
  }

  private async createMysqlConnection(config: MoodleConfig): Promise<Connection> {
    const cfg = this.getConfig(config);

    const connection = await mysql.createConnection({
      host: cfg.mysqlHost,
      user: cfg.mysqlUser,
      password: cfg.mysqlPassword,
      database: cfg.mysqlDatabase,
    });

    return connection;
  }

  async connect(
    config: MoodleConfig,
    tenantId: string,
  ): Promise<{ success: boolean; connectionId: string; siteInfo?: unknown }> {
    const cfg = this.getConfig(config);
    this.logger.log(`Connecting Moodle for tenant ${tenantId} at ${cfg.mysqlHost}/${cfg.mysqlDatabase}`);

    let connection: Connection | null = null;

    try {
      connection = await this.createMysqlConnection(config);

      // Verify the connection works by checking core tables exist
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT COUNT(*) AS course_count FROM mdl_course',
      );

      const courseCount = rows[0]?.course_count ?? 0;
      const siteInfo = {
        database: cfg.mysqlDatabase,
        host: cfg.mysqlHost,
        moodleUrl: cfg.moodleUrl,
        coursesFound: courseCount,
      };

      this.logger.log(`Moodle MySQL connection validated: ${courseCount} courses found`);
    } catch (error) {
      this.logger.error(
        `Moodle MySQL connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException({
        message: `Failed to connect to Moodle MySQL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
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
        config: cfg as any,
        status: 'CONNECTED',
      },
    });

    this.logger.log(`Moodle connector created: ${connector.id}`);
    return { success: true, connectionId: connector.id };
  }

  async listConnections(tenantId: string): Promise<MoodleConnection[]> {
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

  async disconnect(connectionId: string): Promise<void> {
    const connector = await this.prisma.connector.findUnique({
      where: { id: connectionId },
    });

    if (!connector) {
      throw new NotFoundException({
        message: 'Moodle connection not found',
      });
    }

    await this.prisma.connector.update({
      where: { id: connectionId },
      data: { status: 'DISCONNECTED' },
    });

    this.logger.log(`Moodle connection deactivated: ${connectionId}`);
  }

  async syncCourses(
    config: MoodleConfig,
    tenantId: string,
  ): Promise<number> {
    this.logger.log('Starting Moodle course sync via MySQL');

    const connection = await this.createMysqlConnection(config);
    let syncedCount = 0;

    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT id, fullname, summary, visible FROM mdl_course',
      );

      const courses: MoodleCourse[] = rows as MoodleCourse[];

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
    } finally {
      await connection.end();
    }

    this.logger.log(`Moodle course sync complete: ${syncedCount} courses`);
    return syncedCount;
  }

  async syncUsers(
    config: MoodleConfig,
    tenantId: string,
  ): Promise<number> {
    this.logger.log('Starting Moodle user sync via MySQL');

    const connection = await this.createMysqlConnection(config);
    let syncedCount = 0;

    try {
      // Step 1: Get all users from mdl_user
      const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT id, username, firstname, lastname, email FROM mdl_user WHERE deleted = 0',
      );

      const users: MoodleUser[] = userRows as MoodleUser[];

      // Step 2: Get all enrolments by joining mdl_user_enrolments + mdl_enrol
      const [enrolRows] = await connection.execute<mysql.RowDataPacket[]>(
        `SELECT ue.userid AS user_id, e.courseid AS course_id
         FROM mdl_user_enrolments ue
         INNER JOIN mdl_enrol e ON e.id = ue.enrolid`,
      );

      const enrolments: MoodleEnrolment[] = enrolRows as MoodleEnrolment[];

      // Step 3: Build a map of course_id → set of user_ids
      const courseUserMap = new Map<number, Set<number>>();
      for (const enrol of enrolments) {
        if (!courseUserMap.has(enrol.course_id)) {
          courseUserMap.set(enrol.course_id, new Set());
        }
        courseUserMap.get(enrol.course_id)!.add(enrol.user_id);
      }

      // Step 4: Upsert users into the database
      for (const user of users) {
        const email = user.email || `moodle-user-${user.id}@placeholder.local`;
        const name =
          `${user.firstname || ''} ${user.lastname || ''}`.trim() ||
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
    } finally {
      await connection.end();
    }

    this.logger.log(`Moodle user sync complete: ${syncedCount} users`);
    return syncedCount;
  }

  async sync(
    connectionId: string,
  ): Promise<{ coursesSynced: number; usersSynced: number }> {
    this.logger.log(`Syncing Moodle connection: ${connectionId}`);

    const connector = await this.prisma.connector.findUnique({
      where: { id: connectionId },
    });

    if (!connector) {
      throw new NotFoundException({
        message: 'Moodle connection not found',
      });
    }

    const config = connector.config as unknown as MoodleConfig;

    const coursesSynced = await this.syncCourses(config, connector.tenantId);
    const usersSynced = await this.syncUsers(config, connector.tenantId);

    await this.prisma.connector.update({
      where: { id: connectionId },
      data: { lastSync: new Date() },
    });

    this.logger.log(`Moodle sync complete: ${coursesSynced} courses, ${usersSynced} users`);
    return { coursesSynced, usersSynced };
  }
}
