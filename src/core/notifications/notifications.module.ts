import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EmailModule } from '../../email/email.module';
import { NotificationSenderService } from './notification-sender.service';
import { NotificationScheduler } from './notification.scheduler';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationsController } from '../../notifications/notifications.controller';

@Module({
  imports: [DatabaseModule, EmailModule],
  controllers: [NotificationsController],
  providers: [NotificationSenderService, NotificationScheduler, NotificationsService],
  exports: [NotificationSenderService, NotificationsService],
})
export class NotificationsModule {}



