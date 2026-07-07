import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationsController } from './notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [EmailService, NotificationPreferencesService],
  exports: [EmailService, NotificationPreferencesService],
})
export class NotificationsModule {}
