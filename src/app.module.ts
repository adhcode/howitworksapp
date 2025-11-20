import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { PropertiesModule } from './properties/properties.module';
import { TenantInvitationsModule } from './tenant-invitations/tenant-invitations.module';
import { TenantsModule } from './tenants/tenants.module';
import { LandlordModule } from './landlord/landlord.module';
import { MessagesModule } from './messages/messages.module';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';
import { FacilitatorsModule } from './facilitators/facilitators.module';

// NEW CORE MODULES (Clean Architecture)
import { ContractsModule } from './core/contracts/contracts.module';
import { PaymentsModule as CorePaymentsModule } from './core/payments/payments.module';
import { EscrowModule } from './core/escrow/escrow.module';
import { NotificationsModule } from './core/notifications/notifications.module';

// OLD MODULES (Deprecated - will be removed)
// import { TenantRentContractsModule } from './tenant-rent-contracts/tenant-rent-contracts.module';
// import { PaymentsModule as OldPaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    EmailModule,
    PropertiesModule,
    TenantInvitationsModule,
    TenantsModule,
    LandlordModule,
    MessagesModule,
    UploadModule,
    AdminModule,
    FacilitatorsModule,
    
    // NEW CORE MODULES (Clean Architecture)
    ContractsModule,
    CorePaymentsModule,
    EscrowModule,
    NotificationsModule,
    
    // OLD MODULES (Commented out - being replaced)
    // TenantRentContractsModule,
    // OldPaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
