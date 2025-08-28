// Simple script to generate payment schedules for existing tenants
// This can be run once to set up the payment system

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PaymentsService } from './payments.service';
import { DATABASE_CONNECTION } from '../database/database.module';
import { tenantInvitations } from '../database/schema';
import { eq } from 'drizzle-orm';

async function generatePaymentSchedules() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const paymentsService = app.get(PaymentsService);
  const db = app.get(DATABASE_CONNECTION);

  try {
    console.log('Finding all accepted tenant invitations...');
    
    // Get all accepted invitations
    const acceptedInvitations = await db
      .select()
      .from(tenantInvitations)
      .where(eq(tenantInvitations.status, 'accepted'));

    console.log(`Found ${acceptedInvitations.length} accepted invitations`);

    for (const invitation of acceptedInvitations) {
      try {
        console.log(`Generating payment schedule for invitation ${invitation.id} (${invitation.firstName} ${invitation.lastName})`);
        await paymentsService.generatePaymentSchedule(invitation.id);
        console.log('✅ Payment schedule generated successfully');
      } catch (error) {
        console.error(`❌ Error generating payment schedule for invitation ${invitation.id}:`, error.message);
      }
    }

    console.log('✅ Payment schedule generation completed');
  } catch (error) {
    console.error('❌ Error in payment schedule generation:', error);
  } finally {
    await app.close();
  }
}

// Run the script
if (require.main === module) {
  generatePaymentSchedules().catch(console.error);
}

export { generatePaymentSchedules };