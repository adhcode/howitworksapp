import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EscrowService } from './escrow.service';

@Module({
  imports: [DatabaseModule],
  providers: [EscrowService],
  exports: [EscrowService],
})
export class EscrowModule {}



