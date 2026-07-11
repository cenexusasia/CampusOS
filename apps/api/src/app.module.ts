import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AIModule } from './modules/ai/ai.module';
import { ConnectorsModule } from './modules/connectors/connectors.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CoursesModule } from './modules/courses/courses.module';
import { StudentsModule } from './modules/students/students.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SettingsModule } from './modules/settings/settings.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { AgentsModule } from './modules/ai/agents/agents.module';
import { EventsModule } from './modules/events/events.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { QueueModule } from './modules/queue/queue.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { ThrottleModule } from './modules/throttle/throttle.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { MonitoringInterceptor } from './common/interceptors/monitoring.interceptor';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      cache: true,
    }),

    // Serve static files from the uploads directory
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        maxAge: '7d',
      },
    }),

    // Feature modules
    ThrottleModule,
    HealthModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    AIModule,
    AgentsModule,
    ConnectorsModule,
    NotificationsModule,
    CoursesModule,
    StudentsModule,
    AnalyticsModule,
    KnowledgeModule,
    EventsModule,
    WebhooksModule,
    QueueModule,
    SettingsModule,
    MonitoringModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MonitoringInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
