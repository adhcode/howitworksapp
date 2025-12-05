"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NotificationScheduler", {
    enumerable: true,
    get: function() {
        return NotificationScheduler;
    }
});
const _common = require("@nestjs/common");
const _schedule = require("@nestjs/schedule");
const _postgresjs = require("drizzle-orm/postgres-js");
const _drizzleorm = require("drizzle-orm");
const _databasemodule = require("../../database/database.module");
const _tenantrentcontracts = require("../../database/schema/tenant-rent-contracts");
const _schema = require("../../database/schema");
const _notificationsenderservice = require("./notification-sender.service");
const _businessrulesconstant = require("../../shared/constants/business-rules.constant");
const _dateutils = require("../../shared/utils/date.utils");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let NotificationScheduler = class NotificationScheduler {
    /**
   * DAILY CRON: SEND PAYMENT REMINDERS
   * 
   * Runs every day at 9:00 AM
   * 
   * Sends reminders for:
   * 1. Payments due in 3 days (early reminder)
   * 2. Payments due today
   * 
   * Business rule: Early reminder 3 days before due date
   */ async sendPaymentReminders() {
        this.logger.log('🔔 Starting daily payment reminder job...');
        try {
            const today = (0, _dateutils.startOfDay)(new Date());
            // 1. Get contracts with payment due in 3 days (early reminder)
            const earlyReminderDate = (0, _dateutils.addDays)(today, _businessrulesconstant.BUSINESS_RULES.PAYMENT_REMINDERS.EARLY_REMINDER_DAYS);
            const earlyReminderContracts = await this.getContractsDueOn(earlyReminderDate);
            this.logger.log(`Found ${earlyReminderContracts.length} contracts due in 3 days`);
            for (const contract of earlyReminderContracts){
                await this.sendReminderForContract(contract, 3);
            }
            // 2. Get contracts with payment due TODAY
            if (_businessrulesconstant.BUSINESS_RULES.PAYMENT_REMINDERS.DUE_TODAY_REMINDER) {
                const dueTodayContracts = await this.getContractsDueOn(today);
                this.logger.log(`Found ${dueTodayContracts.length} contracts due today`);
                for (const contract of dueTodayContracts){
                    await this.sendReminderForContract(contract, 0);
                }
            }
            this.logger.log('✅ Payment reminder job completed successfully');
        } catch (error) {
            this.logger.error(`❌ Error in payment reminder job: ${error.message}`, error.stack);
        }
    }
    /**
   * DAILY CRON: CHECK OVERDUE PAYMENTS
   * 
   * Runs every day at 10:00 AM
   * 
   * Checks for overdue payments and sends escalating reminders.
   * Sends reminders at: 1, 3, 7, 14 days overdue
   * 
   * After grace period (3 days), marks as overdue and sends:
   * - Push notification
   * - Email
   * - SMS (critical alert)
   */ async checkOverduePayments() {
        this.logger.log('⚠️ Starting overdue payment check...');
        try {
            const today = (0, _dateutils.startOfDay)(new Date());
            const gracePeriodEnd = (0, _dateutils.subDays)(today, _businessrulesconstant.BUSINESS_RULES.PAYMENT_GRACE_DAYS);
            // Get all contracts with payment overdue (past grace period)
            const overdueContracts = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, 'active'), (0, _drizzleorm.lte)(_tenantrentcontracts.tenantRentContracts.nextPaymentDue, gracePeriodEnd)));
            this.logger.log(`Found ${overdueContracts.length} overdue contracts`);
            for (const contract of overdueContracts){
                const daysOverdue = Math.abs((0, _dateutils.differenceInDays)(today, contract.nextPaymentDue));
                // Check if we should send reminder based on escalation schedule
                if (this.shouldSendOverdueReminder(daysOverdue)) {
                    this.logger.warn(`Contract ${contract.id}: ${daysOverdue} days overdue - sending reminder`);
                    await this.sendReminderForContract(contract, -daysOverdue);
                }
            }
            this.logger.log('✅ Overdue payment check completed');
        } catch (error) {
            this.logger.error(`❌ Error in overdue payment check: ${error.message}`, error.stack);
        }
    }
    /**
   * WEEKLY CRON: CHECK EXPIRING CONTRACTS
   * 
   * Runs every Sunday at 11:00 AM
   * 
   * Warns landlords and tenants about contracts expiring soon (within 30 days).
   */ async checkExpiringContracts() {
        this.logger.log('📅 Checking for expiring contracts...');
        try {
            const today = (0, _dateutils.startOfDay)(new Date());
            const thirtyDaysFromNow = (0, _dateutils.addDays)(today, 30);
            // Get contracts expiring in next 30 days
            const expiringContracts = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, 'active'), (0, _drizzleorm.lte)(_tenantrentcontracts.tenantRentContracts.expiryDate, thirtyDaysFromNow), (0, _drizzleorm.gte)(_tenantrentcontracts.tenantRentContracts.expiryDate, today)));
            this.logger.log(`Found ${expiringContracts.length} contracts expiring soon`);
            for (const contract of expiringContracts){
                const daysUntilExpiry = (0, _dateutils.differenceInDays)(contract.expiryDate, today);
                this.logger.log(`Contract ${contract.id} expires in ${daysUntilExpiry} days`);
            // TODO: Send contract expiry notifications to both tenant and landlord
            // await this.notificationSender.sendContractExpiryWarning(...)
            }
            this.logger.log('✅ Expiring contract check completed');
        } catch (error) {
            this.logger.error(`❌ Error checking expiring contracts: ${error.message}`, error.stack);
        }
    }
    /**
   * GET CONTRACTS DUE ON SPECIFIC DATE
   * 
   * Helper to find contracts with payment due on a specific date.
   * 
   * @param date - Due date to check
   * @returns Contracts with payment due
   */ async getContractsDueOn(date) {
        const startOfDate = (0, _dateutils.startOfDay)(date);
        const endOfDate = new Date(startOfDate);
        endOfDate.setHours(23, 59, 59, 999);
        return this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, 'active'), (0, _drizzleorm.gte)(_tenantrentcontracts.tenantRentContracts.nextPaymentDue, startOfDate), (0, _drizzleorm.lte)(_tenantrentcontracts.tenantRentContracts.nextPaymentDue, endOfDate)));
    }
    /**
   * SEND REMINDER FOR CONTRACT
   * 
   * Sends payment reminder notification to tenant.
   * Fetches tenant details and sends multi-channel notification.
   * 
   * @param contract - Rent contract
   * @param daysUntilDue - Days until due (negative if overdue)
   */ async sendReminderForContract(contract, daysUntilDue) {
        try {
            // Get tenant details
            const [tenant] = await this.db.select().from(_schema.users).where((0, _drizzleorm.eq)(_schema.users.id, contract.tenantId)).limit(1);
            if (!tenant) {
                this.logger.warn(`Tenant ${contract.tenantId} not found for contract ${contract.id}`);
                return;
            }
            // Get tenant's push token (if exists)
            // TODO: Add pushToken field to users table
            const pushToken = tenant.pushToken || null;
            // Send notification
            await this.notificationSender.sendPaymentReminder(tenant.id, tenant.email, parseFloat(contract.monthlyAmount), contract.nextPaymentDue, daysUntilDue, tenant.phoneNumber || undefined, pushToken);
            this.logger.log(`✅ Reminder sent to tenant ${tenant.id} (${tenant.email})`);
        } catch (error) {
            this.logger.error(`❌ Failed to send reminder for contract ${contract.id}: ${error.message}`, error.stack);
        }
    }
    /**
   * SHOULD SEND OVERDUE REMINDER
   * 
   * Determines if we should send reminder based on days overdue.
   * Only sends on specific days to avoid spam (1, 3, 7, 14 days overdue).
   * 
   * @param daysOverdue - Number of days payment is overdue
   * @returns True if should send reminder
   */ shouldSendOverdueReminder(daysOverdue) {
        return _businessrulesconstant.BUSINESS_RULES.PAYMENT_REMINDERS.OVERDUE_REMINDER_DAYS.includes(daysOverdue);
    }
    /**
   * MANUAL TRIGGER: Send reminder for specific contract
   * 
   * Allows manual triggering of reminders (useful for testing or admin actions).
   * 
   * @param contractId - Contract ID
   */ async sendManualReminder(contractId) {
        this.logger.log(`📬 Manually sending reminder for contract ${contractId}`);
        const [contract] = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, contractId)).limit(1);
        if (!contract) {
            throw new Error(`Contract ${contractId} not found`);
        }
        const today = (0, _dateutils.startOfDay)(new Date());
        const daysUntilDue = (0, _dateutils.differenceInDays)(contract.nextPaymentDue, today);
        await this.sendReminderForContract(contract, daysUntilDue);
        this.logger.log(`✅ Manual reminder sent for contract ${contractId}`);
    }
    constructor(db, notificationSender){
        this.db = db;
        this.notificationSender = notificationSender;
        this.logger = new _common.Logger(NotificationScheduler.name);
    }
};
_ts_decorate([
    (0, _schedule.Cron)('0 9 * * *'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "sendPaymentReminders", null);
_ts_decorate([
    (0, _schedule.Cron)('0 10 * * *'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "checkOverduePayments", null);
_ts_decorate([
    (0, _schedule.Cron)('0 11 * * 0'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "checkExpiringContracts", null);
NotificationScheduler = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _postgresjs.PostgresJsDatabase === "undefined" ? Object : _postgresjs.PostgresJsDatabase,
        typeof _notificationsenderservice.NotificationSenderService === "undefined" ? Object : _notificationsenderservice.NotificationSenderService
    ])
], NotificationScheduler);

//# sourceMappingURL=notification.scheduler.js.map