import { Module } from '@nestjs/common';
import { ERPNextController } from './erpnext.controller';
import { ERPNextService } from './erpnext.service';

@Module({
  controllers: [ERPNextController],
  providers: [ERPNextService],
  exports: [ERPNextService],
})
export class ERPNextModule {}
