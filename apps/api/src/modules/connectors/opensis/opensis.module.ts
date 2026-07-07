import { Module } from '@nestjs/common';
import { OpenSISController } from './opensis.controller';
import { OpenSISService } from './opensis.service';

@Module({
  controllers: [OpenSISController],
  providers: [OpenSISService],
  exports: [OpenSISService],
})
export class OpenSISModule {}
