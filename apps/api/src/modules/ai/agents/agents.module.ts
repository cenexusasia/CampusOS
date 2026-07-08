import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentsController } from './agents.controller';
import { KnowledgeModule } from '../../knowledge/knowledge.module';
import { CoursesModule } from '../../courses/courses.module';
import { StudentsModule } from '../../students/students.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { AnalyticsModule } from '../../analytics/analytics.module';

@Module({
  imports: [
    KnowledgeModule,
    CoursesModule,
    StudentsModule,
    NotificationsModule,
    AnalyticsModule,
  ],
  controllers: [AgentsController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentsModule {}
