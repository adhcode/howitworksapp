import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { EnhancedMessagesService } from './enhanced-messages.service';
import { MessagesController } from './messages.controller';
import { MaintenanceController } from './maintenance.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MessagesController, MaintenanceController],
  providers: [MessagesService, EnhancedMessagesService],
  exports: [MessagesService, EnhancedMessagesService],
})
export class MessagesModule {} 