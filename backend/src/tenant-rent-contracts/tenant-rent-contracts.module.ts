import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { TenantPaymentService } from './tenant-payment.service';
import { LandlordPayoutService } from './landlord-payout.service';
import { SchedulerService } from './scheduler.service';
import { TenantRentContractsController } from './tenant-rent-contracts.controller';
import { DatabaseModule } from '../database/database.module';
import { EmailModule } from '../email/email.module';
import { BusinessValidationService } from './validators/business-validation.service';
import { RentContractExceptionFilter } from './exceptions/rent-contract-exception.filter';
import { RentContractValidationPipe } from './pipes/rent-contract-validation.pipe';

@Module({
  imports: [DatabaseModule, EmailModule],
  controllers: [TenantRentContractsController],
  providers: [
    TenantPaymentService, 
    LandlordPayoutService, 
    SchedulerService,
    BusinessValidationService,
    {
      provide: APP_FILTER,
      useClass: RentContractExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: RentContractValidationPipe,
    },
  ],
  exports: [
    TenantPaymentService, 
    LandlordPayoutService, 
    SchedulerService,
    BusinessValidationService,
  ],
})
export class TenantRentContractsModule {}