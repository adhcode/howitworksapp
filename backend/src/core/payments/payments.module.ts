import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { ContractsModule } from '../contracts/contracts.module';
import { EscrowModule } from '../escrow/escrow.module';
import { WalletModule } from '../wallet/wallet.module';
import { PaymentProcessorService } from './payment-processor.service';
import { PaystackService } from './paystack.service';
import { PaymentsController } from './payments.controller';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [
    ConfigModule, // For Paystack keys
    DatabaseModule,
    ContractsModule,
    EscrowModule,
    WalletModule, // Landlord wallet management
  ],
  controllers: [
    PaymentsController,
    WebhooksController, // Handles Paystack webhooks
  ],
  providers: [
    PaymentProcessorService,
    PaystackService, // Paystack API integration
  ],
  exports: [PaymentProcessorService, PaystackService],
})
export class PaymentsModule {}

