import { Module } from '@nestjs/common';
import { LandlordController } from './landlord.controller';
import { LandlordService } from './landlord.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LandlordController],
  providers: [LandlordService],
  exports: [LandlordService],
})
export class LandlordModule {}