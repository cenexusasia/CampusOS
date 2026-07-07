import { Module } from '@nestjs/common';
import { GoogleModule } from './google/google.module';
import { MoodleModule } from './moodle/moodle.module';
import { OpenSISModule } from './opensis/opensis.module';

@Module({
  imports: [GoogleModule, MoodleModule, OpenSISModule],
  exports: [GoogleModule, MoodleModule, OpenSISModule],
})
export class ConnectorsModule {}
