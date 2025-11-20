import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, lte, gte, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import * as schema from '../../database/schema';
import { tenantRentContracts } from '../../database/schema/tenant-rent-contracts';
import { users } from '../../database/schema';
import { NotificationSenderService } from './notification-sender.service';
import { BUSINESS_RULES } from '../../shared/constants/business-rules.constant';
import { startOfDay, addDays, subDays, differenceInDays } from '../../shared/utils/date.utils';

/**
 * NOTIFICATION SCHEDULER SERVICE
 * 
 * Automated notification system using cron jobs.
 * Runs daily to check payment statuses and send appropriate notifications.
 * 
 * Schedule:
 * - 9:00 AM: Send payment reminders (early reminders, due today)
 * - 10:00 AM: Check overdue payments and send escalating reminders
 * - 11:00 AM: Send contract expiry warnings
 * 
 * Key responsibilities:
 * 1. Identify contracts with upcoming payments
 * 2. Identify overdue payments
 * 3. Send multi-channel notifications
 * 4. Track notification status
 * 5. Handle escalation for repeated overdue payments
 */
@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly notificationSender: NotificationSenderService,
  ) {}

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
   */
  @Cron('0 9 * * *')
  async sendPaymentReminders(): Promise<void> {
    this.logger.log('🔔 Starting daily payment reminder job...');

    try {
      const today = startOfDay(new Date());

      // 1. Get contracts with payment due in 3 days (early reminder)
      const earlyReminderDate = addDays(today, BUSINESS_RULES.PAYMENT_REMINDERS.EARLY_REMINDER_DAYS);
      const earlyReminderContracts = await this.getContractsDueOn(earlyReminderDate);

      this.logger.log(`Found ${earlyReminderContracts.length} contracts due in 3 days`);

      for (const contract of earlyReminderContracts) {
        await this.sendReminderForContract(contract, 3);
      }

      // 2. Get contracts with payment due TODAY
      if (BUSINESS_RULES.PAYMENT_REMINDERS.DUE_TODAY_REMINDER) {
        const dueTodayContracts = await this.getContractsDueOn(today);

        this.logger.log(`Found ${dueTodayContracts.length} contracts due today`);

        for (const contract of dueTodayContracts) {
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
   */
  @Cron('0 10 * * *')
  async checkOverduePayments(): Promise<void> {
    this.logger.log('⚠️ Starting overdue payment check...');

    try {
      const today = startOfDay(new Date());
      const gracePeriodEnd = subDays(today, BUSINESS_RULES.PAYMENT_GRACE_DAYS);

      // Get all contracts with payment overdue (past grace period)
      const overdueContracts = await this.db
        .select()
        .from(tenantRentContracts)
        .where(
          and(
            eq(tenantRentContracts.status, 'active'),
            lte(tenantRentContracts.nextPaymentDue, gracePeriodEnd)
          )
        );

      this.logger.log(`Found ${overdueContracts.length} overdue contracts`);

      for (const contract of overdueContracts) {
        const daysOverdue = Math.abs(differenceInDays(today, contract.nextPaymentDue));

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
   */
  @Cron('0 11 * * 0')
  async checkExpiringContracts(): Promise<void> {
    this.logger.log('📅 Checking for expiring contracts...');

    try {
      const today = startOfDay(new Date());
      const thirtyDaysFromNow = addDays(today, 30);

      // Get contracts expiring in next 30 days
      const expiringContracts = await this.db
        .select()
        .from(tenantRentContracts)
        .where(
          and(
            eq(tenantRentContracts.status, 'active'),
            lte(tenantRentContracts.expiryDate, thirtyDaysFromNow),
            gte(tenantRentContracts.expiryDate, today)
          )
        );

      this.logger.log(`Found ${expiringContracts.length} contracts expiring soon`);

      for (const contract of expiringContracts) {
        const daysUntilExpiry = differenceInDays(contract.expiryDate, today);
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
   */
  private async getContractsDueOn(date: Date): Promise<any[]> {
    const startOfDate = startOfDay(date);
    const endOfDate = new Date(startOfDate);
    endOfDate.setHours(23, 59, 59, 999);

    return this.db
      .select()
      .from(tenantRentContracts)
      .where(
        and(
          eq(tenantRentContracts.status, 'active'),
          gte(tenantRentContracts.nextPaymentDue, startOfDate),
          lte(tenantRentContracts.nextPaymentDue, endOfDate)
        )
      );
  }

  /**
   * SEND REMINDER FOR CONTRACT
   * 
   * Sends payment reminder notification to tenant.
   * Fetches tenant details and sends multi-channel notification.
   * 
   * @param contract - Rent contract
   * @param daysUntilDue - Days until due (negative if overdue)
   */
  private async sendReminderForContract(
    contract: typeof tenantRentContracts.$inferSelect,
    daysUntilDue: number
  ): Promise<void> {
    try {
      // Get tenant details
      const [tenant] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, contract.tenantId))
        .limit(1);

      if (!tenant) {
        this.logger.warn(`Tenant ${contract.tenantId} not found for contract ${contract.id}`);
        return;
      }

      // Get tenant's push token (if exists)
      // TODO: Add pushToken field to users table
      const pushToken = (tenant as any).pushToken || null;

      // Send notification
      await this.notificationSender.sendPaymentReminder(
        tenant.id,
        tenant.email,
        parseFloat(contract.monthlyAmount),
        contract.nextPaymentDue,
        daysUntilDue,
        tenant.phoneNumber,
        pushToken
      );

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
   */
  private shouldSendOverdueReminder(daysOverdue: number): boolean {
    return (BUSINESS_RULES.PAYMENT_REMINDERS.OVERDUE_REMINDER_DAYS as readonly number[]).includes(daysOverdue);
  }

  /**
   * MANUAL TRIGGER: Send reminder for specific contract
   * 
   * Allows manual triggering of reminders (useful for testing or admin actions).
   * 
   * @param contractId - Contract ID
   */
  async sendManualReminder(contractId: string): Promise<void> {
    this.logger.log(`📬 Manually sending reminder for contract ${contractId}`);

    const [contract] = await this.db
      .select()
      .from(tenantRentContracts)
      .where(eq(tenantRentContracts.id, contractId))
      .limit(1);

    if (!contract) {
      throw new Error(`Contract ${contractId} not found`);
    }

    const today = startOfDay(new Date());
    const daysUntilDue = differenceInDays(contract.nextPaymentDue, today);

    await this.sendReminderForContract(contract, daysUntilDue);

    this.logger.log(`✅ Manual reminder sent for contract ${contractId}`);
  }
}

