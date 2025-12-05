// Simple script to generate payment schedules for existing tenants
// This can be run once to set up the payment system
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "generatePaymentSchedules", {
    enumerable: true,
    get: function() {
        return generatePaymentSchedules;
    }
});
const _core = require("@nestjs/core");
const _appmodule = require("../app.module");
const _paymentsservice = require("./payments.service");
const _databasemodule = require("../database/database.module");
const _schema = require("../database/schema");
const _drizzleorm = require("drizzle-orm");
async function generatePaymentSchedules() {
    const app = await _core.NestFactory.createApplicationContext(_appmodule.AppModule);
    const paymentsService = app.get(_paymentsservice.PaymentsService);
    const db = app.get(_databasemodule.DATABASE_CONNECTION);
    try {
        console.log('Finding all accepted tenant invitations...');
        // Get all accepted invitations
        const acceptedInvitations = await db.select().from(_schema.tenantInvitations).where((0, _drizzleorm.eq)(_schema.tenantInvitations.status, 'accepted'));
        console.log(`Found ${acceptedInvitations.length} accepted invitations`);
        for (const invitation of acceptedInvitations){
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
    } finally{
        await app.close();
    }
}
// Run the script
if (require.main === module) {
    generatePaymentSchedules().catch(console.error);
}

//# sourceMappingURL=generate-payments-script.js.map