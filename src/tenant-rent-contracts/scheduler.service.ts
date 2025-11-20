import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TenantPaymentService } from './tenant-payment.service';
import { LandlordPayoutService } from './landlord-payout.service';
import { EmailService } from '../email/email.service';
import { DATABASE_CONNECTION } from '../database/database.module';
import { eq, and, lte, gte, inArray, sql } from 'drizzle-orm';
import { 
  paymentNotifications, 
  tenantRentContracts,
  PaymentNotification,
  TenantRentContract
} from '../database/schema';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds

  constructor(
    private readonly tenantPaymentService: TenantPaymentService,
    private readonly landlordPayoutService: LandlordPayoutService,
    private readonly emailService: EmailService,
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  /**
   * Daily cron job to check for due payments
   * Runs every day at 9:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkDuePayments(): Promise<void> {
    this.logger.log('Starting daily payment due check...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      // Get all contracts with payments due today or overdue
      const contractsWithDuePayments = await this.tenantPaymentService.getContractsWithDuePayments(today);
      
      this.logger.log(`Found ${contractsWithDuePayments.length} contracts with due payments`);
      
      for (const contract of contractsWithDuePayments) {
        const dueDate = new Date(contract.nextPaymentDue);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        this.logger.log(`Contract ${contract.id}: Payment due ${dueDate.toDateString()}, ${daysOverdue} days overdue`);
        
        // Log payment due status for monitoring
        if (daysOverdue === 0) {
          this.logger.log(`Payment due today for contract ${contract.id} (Tenant: ${contract.tenantId})`);
        } else if (daysOverdue > 0) {
          this.logger.warn(`Payment overdue by ${daysOverdue} days for contract ${contract.id} (Tenant: ${contract.tenantId})`);
        }
      }
      
      this.logger.log('Daily payment due check completed successfully');
    } catch (error) {
      this.logger.error('Error during daily payment due check:', error);
    }
  }

  /**
   * Daily cron job to send payment reminders
   * Runs every day at 10:00 AM (after due payment check)
   */
  @Cron('0 10 * * *')
  async sendPaymentReminders(): Promise<void> {
    this.logger.log('Starting payment reminder notifications...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get contracts with payments due today or overdue
      const contractsWithDuePayments = await this.tenantPaymentService.getContractsWithDuePayments(today);
      
      // Also check for payments due in the next 3 days (early reminders)
      const reminderDate = new Date(today);
      reminderDate.setDate(reminderDate.getDate() + 3);
      const contractsWithUpcomingPayments = await this.tenantPaymentService.getContractsWithDuePayments(reminderDate);
      
      // Filter to get only upcoming payments (not already due)
      const upcomingOnly = contractsWithUpcomingPayments.filter(contract => {
        const dueDate = new Date(contract.nextPaymentDue);
        return dueDate > today;
      });
      
      this.logger.log(`Sending reminders for ${contractsWithDuePayments.length} due payments and ${upcomingOnly.length} upcoming payments`);
      
      // Send reminders for due/overdue payments
      for (const contract of contractsWithDuePayments) {
        await this.sendPaymentReminderNotification(contract, 'due');
      }
      
      // Send early reminders for upcoming payments
      for (const contract of upcomingOnly) {
        await this.sendPaymentReminderNotification(contract, 'upcoming');
      }
      
      this.logger.log('Payment reminder notifications completed successfully');
    } catch (error) {
      this.logger.error('Error during payment reminder notifications:', error);
    }
  }

  /**
   * Send payment reminder notification to tenant
   */
  private async sendPaymentReminderNotification(contract: any, type: 'due' | 'upcoming' | 'overdue'): Promise<void> {
    try {
      const dueDate = new Date(contract.nextPaymentDue);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let subject: string;
      let urgencyLevel: string;
      
      if (type === 'due' && daysUntilDue <= 0) {
        const daysOverdue = Math.abs(daysUntilDue);
        if (daysOverdue === 0) {
          subject = 'Rent Payment Due Today';
          urgencyLevel = 'due';
        } else {
          subject = `Rent Payment Overdue - ${daysOverdue} Day(s)`;
          urgencyLevel = 'overdue';
        }
      } else {
        subject = `Rent Payment Reminder - Due in ${daysUntilDue} Day(s)`;
        urgencyLevel = 'upcoming';
      }
      
      // For now, we'll log the notification details
      // In a production system, this would integrate with:
      // 1. Expo Push Notifications for mobile app users
      // 2. Email notifications as backup
      // 3. SMS notifications for critical overdue payments
      
      this.logger.log(`[${urgencyLevel.toUpperCase()}] Notification for Contract ${contract.id}:`);
      this.logger.log(`  Tenant: ${contract.tenantId}`);
      this.logger.log(`  Subject: ${subject}`);
      this.logger.log(`  Amount: $${contract.monthlyAmount}`);
      this.logger.log(`  Due Date: ${dueDate.toDateString()}`);
      this.logger.log(`  Days Until Due: ${daysUntilDue}`);
      
      // TODO: Implement actual notification sending
      // await this.sendExpoNotification(contract.tenantId, subject, message);
      // await this.sendEmailNotification(contract.tenantId, subject, message);
      
    } catch (error) {
      this.logger.error(`Failed to send reminder for contract ${contract.id}:`, error);
    }
  }

  /**
   * Send Expo push notification (placeholder for future implementation)
   */
  private async sendExpoNotification(tenantId: string, title: string, message: string): Promise<void> {
    // TODO: Implement Expo push notification
    // This would require:
    // 1. Expo SDK integration
    // 2. User device token storage
    // 3. Notification payload formatting
    this.logger.debug(`[EXPO] Would send to ${tenantId}: ${title} - ${message}`);
  }

  /**
   * Send email notification using existing EmailService
   */
  private async sendEmailNotification(tenantId: string, subject: string, message: string): Promise<void> {
    try {
      // TODO: Get tenant email from user service
      // For now, this is a placeholder
      // const tenantEmail = await this.userService.getUserEmail(tenantId);
      // await this.emailService.sendPaymentReminder(tenantEmail, subject, message);
      
      this.logger.debug(`[EMAIL] Would send to tenant ${tenantId}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email notification to tenant ${tenantId}:`, error);
    }
  }

  /**
   * Manual method to trigger payment due checks (for testing/admin use)
   */
  async triggerPaymentDueCheck(): Promise<void> {
    this.logger.log('Manual trigger: checking due payments...');
    await this.checkDuePayments();
  }

  /**
   * Manual method to trigger payment reminders (for testing/admin use)
   */
  async triggerPaymentReminders(): Promise<void> {
    this.logger.log('Manual trigger: sending payment reminders...');
    await this.sendPaymentReminders();
  }

  /**
   * Get summary of due payments (for admin dashboard)
   */
  async getPaymentDueSummary(): Promise<{
    totalDue: number;
    totalOverdue: number;
    contractsWithDuePayments: number;
    contractsWithOverduePayments: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const contractsWithDuePayments = await this.tenantPaymentService.getContractsWithDuePayments(today);
      
      let totalDue = 0;
      let totalOverdue = 0;
      let contractsWithOverduePayments = 0;
      
      for (const contract of contractsWithDuePayments) {
        const amount = parseFloat(contract.monthlyAmount);
        const dueDate = new Date(contract.nextPaymentDue);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        totalDue += amount;
        
        if (daysOverdue > 0) {
          totalOverdue += amount;
          contractsWithOverduePayments++;
        }
      }
      
      return {
        totalDue,
        totalOverdue,
        contractsWithDuePayments: contractsWithDuePayments.length,
        contractsWithOverduePayments,
      };
    } catch (error) {
      this.logger.error('Error getting payment due summary:', error);
      return {
        totalDue: 0,
        totalOverdue: 0,
        contractsWithDuePayments: 0,
        contractsWithOverduePayments: 0,
      };
    }
  }

  /**
   * Daily cron job to process escrow releases for yearly contract completions
   * Runs every day at 11:00 AM (after payment checks and reminders)
   */
  @Cron('0 11 * * *')
  async processEscrowReleases(): Promise<void> {
    this.logger.log('Starting daily escrow release processing...');
    
    const startTime = Date.now();
    let processedCount = 0;
    let errorCount = 0;
    
    try {
      const results = await this.executeWithRetry(
        () => this.landlordPayoutService.checkEscrowReleases(),
        'escrow release check'
      );
      
      processedCount = results.length;
      
      for (const result of results) {
        if (result.success) {
          this.logger.log(`Successfully released escrow: ${result.releasedAmount} to landlord ${result.landlordId}`);
        } else {
          errorCount++;
          this.logger.error(`Failed to release escrow ${result.escrowId}`);
        }
      }
      
      const duration = Date.now() - startTime;
      this.logger.log(`Escrow release processing completed: ${processedCount} processed, ${errorCount} errors, ${duration}ms`);
      
      // Log metrics for monitoring
      this.logOperationMetrics('escrow_releases', {
        processed: processedCount,
        errors: errorCount,
        duration,
        success: errorCount === 0
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Critical error during escrow release processing: ${error.message}`, error.stack);
      
      this.logOperationMetrics('escrow_releases', {
        processed: processedCount,
        errors: errorCount + 1,
        duration,
        success: false,
        criticalError: error.message
      });
    }
  }

  /**
   * Daily cron job to update overdue payment statuses
   * Runs every day at 12:00 PM (after all payment processing)
   */
  @Cron('0 12 * * *')
  async updateOverduePaymentStatuses(): Promise<void> {
    this.logger.log('Starting overdue payment status updates...');
    
    const startTime = Date.now();
    let updatedCount = 0;
    let errorCount = 0;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find contracts with overdue payments (nextPaymentDue < today and status is still 'active')
      const overdueContracts = await this.executeWithRetry(
        () => this.db
          .select()
          .from(tenantRentContracts)
          .where(and(
            lte(tenantRentContracts.nextPaymentDue, today),
            eq(tenantRentContracts.status, 'active')
          )),
        'overdue contracts query'
      ) as any[];
      
      this.logger.log(`Found ${overdueContracts.length} contracts with overdue payments`);
      
      for (const contract of overdueContracts) {
        try {
          const dueDate = new Date(contract.nextPaymentDue);
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysOverdue > 0) {
            // Log overdue status for monitoring
            this.logger.warn(`Contract ${contract.id} is ${daysOverdue} days overdue (Due: ${dueDate.toDateString()})`);
            
            // Update contract metadata or trigger additional actions based on overdue days
            if (daysOverdue >= 30) {
              this.logger.error(`Contract ${contract.id} is critically overdue (${daysOverdue} days)`);
              // Could trigger escalation processes here
            }
            
            updatedCount++;
          }
        } catch (error) {
          errorCount++;
          this.logger.error(`Error processing overdue contract ${contract.id}: ${error.message}`);
        }
      }
      
      const duration = Date.now() - startTime;
      this.logger.log(`Overdue status update completed: ${updatedCount} processed, ${errorCount} errors, ${duration}ms`);
      
      this.logOperationMetrics('overdue_updates', {
        processed: updatedCount,
        errors: errorCount,
        duration,
        success: errorCount === 0
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Critical error during overdue status updates: ${error.message}`, error.stack);
      
      this.logOperationMetrics('overdue_updates', {
        processed: updatedCount,
        errors: errorCount + 1,
        duration,
        success: false,
        criticalError: error.message
      });
    }
  }

  /**
   * Daily cron job to clean up old notifications
   * Runs every day at 2:00 AM (during low activity period)
   */
  @Cron('0 2 * * *')
  async cleanupNotifications(): Promise<void> {
    this.logger.log('Starting notification cleanup...');
    
    const startTime = Date.now();
    let cleanedCount = 0;
    let errorCount = 0;
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep notifications for 30 days
      
      // Clean up old sent notifications
      const sentResult = await this.executeWithRetry(
        () => this.db
          .delete(paymentNotifications)
          .where(and(
            eq(paymentNotifications.status, 'sent'),
            lte(paymentNotifications.sentAt, cutoffDate)
          )),
        'cleanup sent notifications'
      );
      
      // Clean up old failed notifications (keep for shorter period)
      const failedCutoffDate = new Date();
      failedCutoffDate.setDate(failedCutoffDate.getDate() - 7); // Keep failed for 7 days
      
      const failedResult = await this.executeWithRetry(
        () => this.db
          .delete(paymentNotifications)
          .where(and(
            eq(paymentNotifications.status, 'failed'),
            lte(paymentNotifications.createdAt, failedCutoffDate)
          )),
        'cleanup failed notifications'
      );
      
      // Update stale pending notifications (older than 24 hours) to failed
      const staleCutoffDate = new Date();
      staleCutoffDate.setHours(staleCutoffDate.getHours() - 24);
      
      const staleResult = await this.executeWithRetry(
        () => this.db
          .update(paymentNotifications)
          .set({ 
            status: 'failed',
            sentAt: new Date()
          })
          .where(and(
            eq(paymentNotifications.status, 'pending'),
            lte(paymentNotifications.scheduledFor, staleCutoffDate)
          )),
        'update stale notifications'
      );
      
      cleanedCount = ((sentResult as any)?.rowCount || 0) + ((failedResult as any)?.rowCount || 0) + ((staleResult as any)?.rowCount || 0);
      
      const duration = Date.now() - startTime;
      this.logger.log(`Notification cleanup completed: ${cleanedCount} notifications processed, ${duration}ms`);
      
      this.logOperationMetrics('notification_cleanup', {
        processed: cleanedCount,
        errors: errorCount,
        duration,
        success: true,
        details: {
          sentCleaned: (sentResult as any)?.rowCount || 0,
          failedCleaned: (failedResult as any)?.rowCount || 0,
          staleUpdated: (staleResult as any)?.rowCount || 0
        }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Critical error during notification cleanup: ${error.message}`, error.stack);
      
      this.logOperationMetrics('notification_cleanup', {
        processed: cleanedCount,
        errors: errorCount + 1,
        duration,
        success: false,
        criticalError: error.message
      });
    }
  }

  /**
   * Execute operation with retry mechanism for failed operations
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    retries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.debug(`Executing ${operationName} (attempt ${attempt}/${retries})`);
        const result = await operation();
        
        if (attempt > 1) {
          this.logger.log(`${operationName} succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        this.logger.warn(`${operationName} failed on attempt ${attempt}: ${error.message}`);
        
        if (attempt < retries) {
          const delay = this.retryDelay * attempt; // Exponential backoff
          this.logger.log(`Retrying ${operationName} in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }
    
    this.logger.error(`${operationName} failed after ${retries} attempts`);
    throw lastError || new Error(`${operationName} failed`);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log operation metrics for monitoring and alerting
   */
  private logOperationMetrics(operation: string, metrics: {
    processed: number;
    errors: number;
    duration: number;
    success: boolean;
    criticalError?: string;
    details?: any;
  }): void {
    const logLevel = metrics.success ? 'log' : 'error';
    const message = `[METRICS] ${operation}: ${JSON.stringify(metrics)}`;
    
    this.logger[logLevel](message);
    
    // In a production environment, this could also:
    // 1. Send metrics to monitoring systems (Prometheus, DataDog, etc.)
    // 2. Trigger alerts for critical errors
    // 3. Update health check endpoints
    // 4. Store metrics in time-series database
  }

  /**
   * Manual method to trigger escrow release processing (for testing/admin use)
   */
  async triggerEscrowReleases(): Promise<void> {
    this.logger.log('Manual trigger: processing escrow releases...');
    await this.processEscrowReleases();
  }

  /**
   * Manual method to trigger overdue status updates (for testing/admin use)
   */
  async triggerOverdueUpdates(): Promise<void> {
    this.logger.log('Manual trigger: updating overdue payment statuses...');
    await this.updateOverduePaymentStatuses();
  }

  /**
   * Manual method to trigger notification cleanup (for testing/admin use)
   */
  async triggerNotificationCleanup(): Promise<void> {
    this.logger.log('Manual trigger: cleaning up notifications...');
    await this.cleanupNotifications();
  }

  /**
   * Get scheduler health status and metrics
   */
  async getSchedulerHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastOperations: {
      escrowReleases?: Date;
      overdueUpdates?: Date;
      notificationCleanup?: Date;
      paymentChecks?: Date;
      paymentReminders?: Date;
    };
    metrics: {
      totalContracts: number;
      activeContracts: number;
      overdueContracts: number;
      pendingNotifications: number;
    };
  }> {
    try {
      // Get basic contract metrics
      const [contractStats] = await this.db
        .select({
          total: sql<string>`COUNT(*)`,
          active: sql<string>`COUNT(*) FILTER (WHERE status = 'active')`,
        })
        .from(tenantRentContracts);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [overdueStats] = await this.db
        .select({
          overdue: sql<string>`COUNT(*) FILTER (WHERE next_payment_due < ${today} AND status = 'active')`,
        })
        .from(tenantRentContracts);

      const [notificationStats] = await this.db
        .select({
          pending: sql<string>`COUNT(*) FILTER (WHERE status = 'pending')`,
        })
        .from(paymentNotifications);

      return {
        status: 'healthy', // Could implement more sophisticated health checks
        lastOperations: {
          // These would be tracked in a separate metrics table in production
        },
        metrics: {
          totalContracts: parseInt(contractStats?.total || '0'),
          activeContracts: parseInt(contractStats?.active || '0'),
          overdueContracts: parseInt(overdueStats?.overdue || '0'),
          pendingNotifications: parseInt(notificationStats?.pending || '0'),
        }
      };
    } catch (error) {
      this.logger.error(`Error getting scheduler health: ${error.message}`, error.stack);
      return {
        status: 'unhealthy',
        lastOperations: {},
        metrics: {
          totalContracts: 0,
          activeContracts: 0,
          overdueContracts: 0,
          pendingNotifications: 0,
        }
      };
    }
  }
}