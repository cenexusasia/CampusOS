import { Module, Global } from '@nestjs/common';
import { EventEmitterService } from './event-emitter.service';

// Event types for cross-module communication
export const EVENTS = {
  COURSE_CREATED: 'course.created',
  STUDENT_ENROLLED: 'student.enrolled',
  KNOWLEDGE_UPLOADED: 'knowledge.uploaded',
  CONNECTOR_SYNCED: 'connector.synced',
  AGENT_EXECUTED: 'agent.executed',
} as const;

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];

@Global()
@Module({
  providers: [EventEmitterService],
  exports: [EventEmitterService],
})
export class EventsModule {}
