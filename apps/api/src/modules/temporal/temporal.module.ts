import { Module } from '@nestjs/common';
import { TemporalService } from './temporal.service';
import { TemporalController } from './temporal.controller';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [TemporalController],
  providers: [TemporalService],
  exports: [TemporalService],
})
export class TemporalModule {}
