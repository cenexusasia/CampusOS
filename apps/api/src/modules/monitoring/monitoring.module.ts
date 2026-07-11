import { Module, Global, Logger } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';

@Global()
@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService, Logger],
  exports: [MonitoringService],
})
export class MonitoringModule {}
