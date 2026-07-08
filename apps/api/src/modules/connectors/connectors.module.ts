import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { GoogleModule } from './google/google.module';
import { MoodleModule } from './moodle/moodle.module';
import { OpenSISModule } from './opensis/opensis.module';
import { ERPNextModule } from './erpnext/erpnext.module';
import { ConnectorsController } from './connectors.controller';
import { ConnectorsService } from './connectors.service';
import { ConnectorRegistry } from './connectors.registry';
import { MoodleService } from './moodle/moodle.service';
import { OpenSISService } from './opensis/opensis.service';
import { GoogleService } from './google/google.service';
import { ERPNextService } from './erpnext/erpnext.service';

@Module({
  imports: [GoogleModule, MoodleModule, OpenSISModule, ERPNextModule],
  controllers: [ConnectorsController],
  providers: [ConnectorsService, ConnectorRegistry],
  exports: [GoogleModule, MoodleModule, OpenSISModule, ERPNextModule, ConnectorsService, ConnectorRegistry],
})
export class ConnectorsModule implements OnModuleInit {
  private readonly logger = new Logger(ConnectorsModule.name);

  constructor(
    private readonly registry: ConnectorRegistry,
    private readonly moodleService: MoodleService,
    private readonly openSISService: OpenSISService,
    private readonly googleService: GoogleService,
    private readonly erpnextService: ERPNextService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this.moodleService);
    this.registry.register(this.openSISService);
    this.registry.register(this.googleService);
    this.registry.register(this.erpnextService);
    this.logger.log('All connectors registered in the ConnectorRegistry');
  }
}
