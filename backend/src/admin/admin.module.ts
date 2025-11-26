import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FacilitatorsModule } from '../facilitators/facilitators.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, FacilitatorsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}


