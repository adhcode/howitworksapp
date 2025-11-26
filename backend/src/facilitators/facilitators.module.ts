import { Module } from '@nestjs/common';
import { FacilitatorsController } from './facilitators.controller';
import { FacilitatorsService } from './facilitators.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FacilitatorsController],
  providers: [FacilitatorsService],
  exports: [FacilitatorsService],
})
export class FacilitatorsModule {}


