import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../database/database.module';
import { payments, tenantInvitations, users, properties, units, NewPayment } from '../database/schema';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  /**
   * Generate monthly payment records for accepted tenant invitations
   * This should be called when a tenant accepts an invitation
   */
  async generatePaymentSchedule(tenantInvitationId: string) {
    try {
      // Get the tenant invitation details
      const [invitation] = await this.db
        .select()
        .from(tenantInvitations)
        .where(eq(tenantInvitations.id, tenantInvitationId));

      if (!invitation || invitation.status !== 'accepted') {
        throw new Error('Tenant invitation not found or not accepted');
      }

      const moveInDate = new Date(invitation.leaseStartDate);
      const leaseEnd = new Date(invitation.leaseEndDate);
      const monthlyRent = parseFloat(invitation.monthlyRent);

      console.log(`Generating payment schedule for tenant from ${moveInDate.toISOString()} to ${leaseEnd.toISOString()}`);

      // Generate monthly payments from move-in date
      const paymentsToCreate: NewPayment[] = [];
      let currentPaymentDate = new Date(moveInDate);

      const today = new Date();
      
      // First payment (move-in month) - if move-in date is today or in the past, mark as paid
      while (currentPaymentDate <= leaseEnd) {
        const dueDate = new Date(currentPaymentDate);
        const isFirstPayment = currentPaymentDate.getTime() === moveInDate.getTime();
        
        // If tenant moved in today or earlier, they should have paid for that month
        let status = 'pending';
        let amountPaid = '0.00';
        let paidDate: Date | null = null;
        
        if (isFirstPayment && moveInDate <= today) {
          status = 'paid';
          amountPaid = monthlyRent.toFixed(2);
          paidDate = new Date(moveInDate);
          console.log(`Marking first payment as paid since tenant moved in on ${moveInDate.toDateString()}`);
        }
        
        paymentsToCreate.push({
          landlordId: invitation.landlordId,
          tenantId: invitation.tenantId!,
          propertyId: invitation.propertyId,
          unitId: invitation.unitId,
          tenantInvitationId: invitation.id,
          amount: monthlyRent.toFixed(2),
          amountPaid: amountPaid,
          dueDate: dueDate,
          paidDate: paidDate,
          paymentType: 'rent',
          status: status as any,
          description: `Monthly rent for ${dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        } as NewPayment);

        // Move to next month (same day of next month)
        currentPaymentDate.setMonth(currentPaymentDate.getMonth() + 1);
      }

      console.log(`Creating ${paymentsToCreate.length} payment records`);

      // Insert all payment records
      if (paymentsToCreate.length > 0) {
        const result = await this.db.insert(payments).values(paymentsToCreate);
        console.log(`Successfully inserted ${paymentsToCreate.length} payment records`);
      }

      return paymentsToCreate;
    } catch (error) {
      console.error('Error generating payment schedule:', error);
      throw error;
    }
  }

  /**
   * Get upcoming payments (due in next 7 days) for a landlord
   */
  async getUpcomingPayments(landlordId: string) {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const upcomingPayments = await this.db
        .select({
          payment: payments,
          tenant: users,
          property: properties,
          unit: units,
        })
        .from(payments)
        .leftJoin(users, eq(payments.tenantId, users.id))
        .leftJoin(properties, eq(payments.propertyId, properties.id))
        .leftJoin(units, eq(payments.unitId, units.id))
        .where(and(
          eq(payments.landlordId, landlordId),
          eq(payments.status, 'pending'),
          gte(payments.dueDate, today),
          lte(payments.dueDate, nextWeek)
        ));

      return upcomingPayments;
    } catch (error) {
      console.error('Error getting upcoming payments:', error);
      throw error;
    }
  }

  /**
   * Get overdue payments for a landlord
   */
  async getOverduePayments(landlordId: string) {
    try {
      const today = new Date();

      const overduePayments = await this.db
        .select({
          payment: payments,
          tenant: users,
          property: properties,
          unit: units,
        })
        .from(payments)
        .leftJoin(users, eq(payments.tenantId, users.id))
        .leftJoin(properties, eq(payments.propertyId, properties.id))
        .leftJoin(units, eq(payments.unitId, units.id))
        .where(and(
          eq(payments.landlordId, landlordId),
          eq(payments.status, 'pending'),
          lte(payments.dueDate, today)
        ));

      return overduePayments;
    } catch (error) {
      console.error('Error getting overdue payments:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics for landlord dashboard
   */
  async getPaymentStats(landlordId: string) {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

      console.log(`Getting payment stats for landlord ${landlordId} for year ${currentYear}`);

      // Get upcoming payments (next 7 days) - pending payments due within 7 days
      const upcomingPayments = await this.db
        .select()
        .from(payments)
        .where(and(
          eq(payments.landlordId, landlordId),
          eq(payments.status, 'pending'),
          gte(payments.dueDate, today),
          lte(payments.dueDate, nextWeek)
        ));

      const upcomingCount = upcomingPayments.length;
      const upcomingAmount = upcomingPayments.reduce((sum, payment) => {
        return sum + parseFloat(payment.amount || '0');
      }, 0);

      console.log(`Upcoming payments: ${upcomingCount} payments totaling ${upcomingAmount}`);

      // Get overdue payments - pending payments that are past due date
      const overduePayments = await this.db
        .select()
        .from(payments)
        .where(and(
          eq(payments.landlordId, landlordId),
          eq(payments.status, 'pending'),
          lte(payments.dueDate, today)
        ));

      const overdueAmount = overduePayments.reduce((sum, payment) => {
        const amount = parseFloat(payment.amount || '0');
        const amountPaid = parseFloat(payment.amountPaid || '0');
        return sum + (amount - amountPaid);
      }, 0);
      const overdueTenants = new Set(overduePayments.map(p => p.tenantId)).size;

      console.log(`Overdue payments: ${overduePayments.length} payments totaling ${overdueAmount} from ${overdueTenants} tenants`);

      // Get rent collected this year - all payments marked as paid this year
      const paidPayments = await this.db
        .select()
        .from(payments)
        .where(and(
          eq(payments.landlordId, landlordId),
          eq(payments.status, 'paid')
        ));

      // Filter by year in JavaScript to handle null paidDate
      const paidThisYear = paidPayments.filter(payment => {
        if (!payment.paidDate) return false;
        const paidDate = new Date(payment.paidDate);
        return paidDate >= yearStart && paidDate <= yearEnd;
      });

      const rentCollected = paidThisYear.reduce((sum, payment) => {
        return sum + parseFloat(payment.amountPaid || '0');
      }, 0);

      console.log(`Rent collected this year: ${rentCollected} from ${paidThisYear.length} payments`);

      const stats = {
        upcomingPayments: upcomingCount,
        upcomingPaymentsCombined: upcomingAmount,
        outstandingRent: overdueAmount,
        outstandingRentTenants: overdueTenants,
        rentCollected,
      };

      console.log('Final payment stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw error;
    }
  }

  /**
   * Process a payment - mark payment as paid and update status
   */
  async processPayment(paymentId: string, amountPaid: number, paymentMethod?: string, notes?: string) {
    try {
      const [payment] = await this.db
        .select()
        .from(payments)
        .where(eq(payments.id, paymentId));

      if (!payment) {
        throw new Error('Payment not found');
      }

      const totalAmount = parseFloat(payment.amount);
      const previousAmountPaid = parseFloat(payment.amountPaid || '0');
      const newAmountPaid = previousAmountPaid + amountPaid;
      
      let status = 'partial';
      if (newAmountPaid >= totalAmount) {
        status = 'paid';
      }

      console.log(`Processing payment ${paymentId}: ${amountPaid} added, total now ${newAmountPaid}/${totalAmount}, status: ${status}`);

      // Update payment record
      await this.db
        .update(payments)
        .set({
          amountPaid: newAmountPaid.toString(),
          status: status as any,
          paidDate: status === 'paid' ? new Date() : payment.paidDate,
          paymentMethod: paymentMethod as any || payment.paymentMethod,
          notes: notes || payment.notes,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

      return { 
        success: true, 
        newStatus: status,
        totalPaid: newAmountPaid,
        remainingAmount: totalAmount - newAmountPaid
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Get all payments for a tenant
   */
  async getTenantPayments(tenantId: string) {
    try {
      const tenantPayments = await this.db
        .select({
          payment: payments,
          property: properties,
          unit: units,
        })
        .from(payments)
        .leftJoin(properties, eq(payments.propertyId, properties.id))
        .leftJoin(units, eq(payments.unitId, units.id))
        .where(eq(payments.tenantId, tenantId))
        .orderBy(payments.dueDate);

      return tenantPayments;
    } catch (error) {
      console.error('Error getting tenant payments:', error);
      throw error;
    }
  }

  /**
   * Get all payments for a landlord
   */
  async getLandlordPayments(landlordId: string) {
    try {
      const landlordPayments = await this.db
        .select({
          payment: payments,
          tenant: users,
          property: properties,
          unit: units,
        })
        .from(payments)
        .leftJoin(users, eq(payments.tenantId, users.id))
        .leftJoin(properties, eq(payments.propertyId, properties.id))
        .leftJoin(units, eq(payments.unitId, units.id))
        .where(eq(payments.landlordId, landlordId))
        .orderBy(payments.dueDate);

      return landlordPayments;
    } catch (error) {
      console.error('Error getting landlord payments:', error);
      throw error;
    }
  }

  /**
   * Update overdue payments status
   * This should be run periodically to mark pending payments as overdue
   */
  async updateOverduePayments() {
    try {
      const today = new Date();

      const result = await this.db
        .update(payments)
        .set({
          status: 'overdue',
          updatedAt: new Date(),
        })
        .where(and(
          eq(payments.status, 'pending'),
          lte(payments.dueDate, today)
        ));

      console.log('Updated overdue payments');
      return result;
    } catch (error) {
      console.error('Error updating overdue payments:', error);
      throw error;
    }
  }

  /**
   * Record a payment after successful verification
   */
  async recordPayment(paymentData: {
    tenantId: string;
    amount: number;
    reference: string;
    paymentMethod: string;
    status: string;
    paidAt: Date;
    metadata?: any;
  }) {
    try {
      // Find the pending payment for this tenant and amount to mark as paid
      const [existingPayment] = await this.db
        .select()
        .from(payments)
        .where(and(
          eq(payments.tenantId, paymentData.tenantId),
          eq(payments.status, 'pending'),
          eq(payments.amount, paymentData.amount.toString())
        ))
        .limit(1);

      if (existingPayment) {
        // Update existing payment
        const result = await this.db
          .update(payments)
          .set({
            status: paymentData.status,
            amountPaid: paymentData.amount.toString(),
            paidDate: paymentData.paidAt,
            paymentMethod: paymentData.paymentMethod,
            reference: paymentData.reference,
            metadata: paymentData.metadata,
            updatedAt: new Date(),
          })
          .where(eq(payments.id, existingPayment.id));

        console.log('Payment updated successfully:', paymentData.reference);
        return result;
      } else {
        // Create new payment record
        const result = await this.db
          .insert(payments)
          .values({
            tenantId: paymentData.tenantId,
            amount: paymentData.amount.toString(),
            amountPaid: paymentData.amount.toString(),
            status: paymentData.status,
            paidDate: paymentData.paidAt,
            paymentMethod: paymentData.paymentMethod,
            reference: paymentData.reference,
            metadata: paymentData.metadata,
            dueDate: paymentData.paidAt, // Use paid date as due date for ad-hoc payments
            createdAt: new Date(),
            updatedAt: new Date(),
          });

        console.log('Payment recorded successfully:', paymentData.reference);
        return result;
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }
}