import { Module, OnModuleInit, Logger, Optional } from '@nestjs/common';
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
import type { ConnectorPlugin } from './connector.interface';

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
    @Optional() private readonly openSISService?: OpenSISService,
    @Optional() private readonly googleService?: GoogleService,
    @Optional() private readonly erpnextService?: ERPNextService,
  ) {}

  onModuleInit(): void {
    const services: unknown[] = [
      this.moodleService,
      this.openSISService,
      this.googleService,
      this.erpnextService,
    ];

    const names = ['Moodle', 'OpenSIS', 'Google', 'ERPNext'];
    let registered = 0;

    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const name = names[i];
      if (service && typeof (service as any).provider === 'string') {
        this.registry.register(service as ConnectorPlugin);
        registered++;
      } else {
        this.logger.warn(`Skipping connector registration for ${name}: service or provider missing`);
      }
    }
    this.logger.log(`Registered ${registered}/${services.length} connectors in the ConnectorRegistry`);
  }
}
