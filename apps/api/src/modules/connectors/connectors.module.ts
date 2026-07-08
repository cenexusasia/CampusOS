import { Module } from '@nestjs/common';
import { GoogleModule } from './google/google.module';
import { MoodleModule } from './moodle/moodle.module';
import { OpenSISModule } from './opensis/opensis.module';
import { ConnectorsController } from './connectors.controller';
import { ConnectorsService } from './connectors.service';

@Module({
  imports: [GoogleModule, MoodleModule, OpenSISModule],
  controllers: [ConnectorsController],
  providers: [ConnectorsService],
  exports: [GoogleModule, MoodleModule, OpenSISModule, ConnectorsService],
})
export class ConnectorsModule {}
