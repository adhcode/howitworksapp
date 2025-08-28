import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MaintenanceController } from './maintenance.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MessagesController, MaintenanceController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {} 