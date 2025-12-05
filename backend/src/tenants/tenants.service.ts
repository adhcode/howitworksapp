import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../database/database.module';
import { tenantInvitations, properties, units, users, payments } from '../database/schema';
import { tenantRentContracts } from '../database/schema/tenant-rent-contracts';

@Injectable()
export class TenantsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  async getTenantData(userId: string) {
    try {
      // Get payment data which has accurate totalDue calculation
      const paymentData = await this.getTenantPayments(userId);
      
      // Get contract data for property info
      const contractData = await this.getTenantRentContract(userId);
      
      if (!contractData || !contractData.contract) {
        throw new NotFoundException('Tenant data not found');
      }
      
      const contract = contractData.contract;
      
      return {
        property: {
          name: contract.property?.name || 'Unknown Property',
          unit: `Unit ${contract.unit?.unitNumber || 'N/A'}`,
        },
        totalDue: paymentData.totalDue, // Use accurate calculation from getTenantPayments
        dueDate: paymentData.dueDate,
        tenant: {
          firstName: '', // Will be filled from user context
          lastName: '',
        },
        monthsDue: paymentData.monthsDue,
        monthlyRent: paymentData.monthlyRent,
        totalPaid: paymentData.totalPaid || 0,
      };
    } catch (error) {
      console.error('Error getting tenant data:', error);
      throw error;
    }
  }

  async getTenantPayments(userId: string) {
    try {
      // Find the tenant's accepted invitation with property and unit data
      const [tenantInvitation] = await this.db
        .select({
          invitation: tenantInvitations,
          property: properties,
          unit: units,
        })
        .from(tenantInvitations)
        .leftJoin(properties, eq(tenantInvitations.propertyId, properties.id))
        .leftJoin(units, eq(tenantInvitations.unitId, units.id))
        .where(and(
          eq(tenantInvitations.tenantId, userId),
          eq(tenantInvitations.status, 'accepted')
        ));

      if (!tenantInvitation) {
        throw new NotFoundException('Tenant payment data not found');
      }

      // Use the same calculation logic as getTenantData
      const moveInDate = new Date(tenantInvitation.invitation.leaseStartDate);
      const monthlyRent = parseFloat(tenantInvitation.unit?.rent || tenantInvitation.invitation.monthlyRent || '0');
      const today = new Date();
      
      // Calculate how many months of rent are due from move-in date to now
      let monthsDue = 0;
      let nextDueDate = 'No payments due';
      
      if (moveInDate <= today) {
        // Calculate months between move-in date and today
        const yearsDiff = today.getFullYear() - moveInDate.getFullYear();
        const monthsDiff = today.getMonth() - moveInDate.getMonth();
        monthsDue = yearsDiff * 12 + monthsDiff + 1; // +1 for current month
        
        // Next due date is the first day of next month
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        nextDueDate = nextMonth.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } else {
        // Move-in date is in the future, no payments due yet
        nextDueDate = moveInDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      
      // Calculate total paid from successful payments
      const paidPayments = await this.db
        .select()
        .from(payments)
        .where(and(
          eq(payments.tenantId, userId),
          eq(payments.status, 'paid')
        ));

      const totalPaid = paidPayments.reduce((sum, payment) => {
        return sum + parseFloat(payment.amountPaid || payment.amount || '0');
      }, 0);

      const totalExpected = monthsDue * monthlyRent;
      const totalDue = Math.max(0, totalExpected - totalPaid);

      return {
        totalDue,
        totalPaid,
        totalExpected,
        dueDate: nextDueDate,
        paymentHistory: await this.getPaymentHistory(userId),
        monthlyRent,
        monthsDue,
        moveInDate: moveInDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };
    } catch (error) {
      console.error('Error getting tenant payments:', error);
      throw error;
    }
  }

  async getPaymentHistory(userId: string) {
    try {
      const history = await this.db
        .select({
          id: payments.id,
          amount: payments.amount,
          status: payments.status,
          paymentMethod: payments.paymentMethod,
          paidDate: payments.paidDate,
          createdAt: payments.createdAt,
          description: payments.description,
          paystackReference: payments.paystackReference,
          paystackStatus: payments.paystackStatus,
        })
        .from(payments)
        .where(eq(payments.tenantId, userId))
        .orderBy(sql`${payments.createdAt} DESC`)
        .limit(50);

      return history;
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  async getTenantReports(userId: string) {
    try {
      // TODO: Implement reports when payment and maintenance systems are ready
      return [];
    } catch (error) {
      console.error('Error getting tenant reports:', error);
      throw error;
    }
  }

  async getTenantComplaints(userId: string) {
    try {
      const { maintenanceRequests } = await import('../database/schema');
      const { desc, sql } = await import('drizzle-orm');
      
      // Get maintenance requests created by this tenant
      const requests = await this.db
        .select({
          id: maintenanceRequests.id,
          title: maintenanceRequests.title,
          description: maintenanceRequests.description,
          status: maintenanceRequests.status,
          priority: maintenanceRequests.priority,
          images: maintenanceRequests.images,
          createdAt: maintenanceRequests.createdAt,
          completedAt: maintenanceRequests.completedAt,
          // Property info
          propertyName: sql<string>`property.name`,
          // Unit info
          unitNumber: sql<string>`unit.unit_number`,
          // Facilitator info
          facilitatorFirstName: sql<string>`facilitator.first_name`,
          facilitatorLastName: sql<string>`facilitator.last_name`,
        })
        .from(maintenanceRequests)
        .leftJoin(sql`properties AS property`, sql`${maintenanceRequests.propertyId} = property.id`)
        .leftJoin(sql`units AS unit`, sql`unit.id = ${maintenanceRequests.unitId}`)
        .leftJoin(sql`users AS facilitator`, sql`${maintenanceRequests.assignedTo} = facilitator.id`)
        .where(sql`${maintenanceRequests.tenantId} = ${userId}`)
        .orderBy(desc(maintenanceRequests.createdAt));

      return requests.map(request => ({
        ...request,
        assignedFacilitator: request.facilitatorFirstName 
          ? `${request.facilitatorFirstName} ${request.facilitatorLastName}` 
          : 'Not assigned',
      }));
    } catch (error) {
      console.error('Error getting tenant complaints:', error);
      throw error;
    }
  }

  async getComplaintDetail(complaintId: string, userId: string) {
    try {
      const { maintenanceRequests } = await import('../database/schema');
      const { eq, and, sql } = await import('drizzle-orm');
      
      // Get maintenance request details
      const [request] = await this.db
        .select({
          id: maintenanceRequests.id,
          title: maintenanceRequests.title,
          description: maintenanceRequests.description,
          status: maintenanceRequests.status,
          priority: maintenanceRequests.priority,
          images: maintenanceRequests.images,
          comments: maintenanceRequests.comments,
          createdAt: maintenanceRequests.createdAt,
          completedAt: maintenanceRequests.completedAt,
          // Property info
          propertyId: sql<string>`property.id`,
          propertyName: sql<string>`property.name`,
          // Unit info
          unitNumber: sql<string>`unit.unit_number`,
          // Facilitator info
          facilitatorId: sql<string>`facilitator.id`,
          facilitatorFirstName: sql<string>`facilitator.first_name`,
          facilitatorLastName: sql<string>`facilitator.last_name`,
          facilitatorEmail: sql<string>`facilitator.email`,
        })
        .from(maintenanceRequests)
        .leftJoin(sql`properties AS property`, sql`${maintenanceRequests.propertyId} = property.id`)
        .leftJoin(sql`units AS unit`, sql`unit.id = ${maintenanceRequests.unitId}`)
        .leftJoin(sql`users AS facilitator`, sql`${maintenanceRequests.assignedTo} = facilitator.id`)
        .where(and(
          eq(maintenanceRequests.id, complaintId),
          sql`${maintenanceRequests.tenantId} = ${userId}`
        ));

      if (!request) {
        throw new Error('Maintenance request not found or access denied');
      }

      return {
        ...request,
        assignedFacilitator: request.facilitatorFirstName 
          ? `${request.facilitatorFirstName} ${request.facilitatorLastName}` 
          : 'Not assigned',
        hasFacilitator: !!request.facilitatorId,
      };
    } catch (error) {
      console.error('Error getting complaint detail:', error);
      throw error;
    }
  }

  async submitComplaint(complaintData: any, userId: string) {
    try {
      const { maintenanceRequests } = await import('../database/schema');
      const { eq, and, sql } = await import('drizzle-orm');
      
      // Get tenant's property info
      const [tenantInvitation] = await this.db
        .select({
          propertyId: tenantInvitations.propertyId,
          unitId: tenantInvitations.unitId,
          facilitatorId: sql<string>`property.facilitator_id`,
        })
        .from(tenantInvitations)
        .leftJoin(sql`properties AS property`, sql`${tenantInvitations.propertyId} = property.id`)
        .where(and(
          eq(tenantInvitations.tenantId, userId),
          eq(tenantInvitations.status, 'accepted')
        ))
        .limit(1);

      if (!tenantInvitation) {
        throw new Error('No active tenancy found');
      }

      // Create maintenance request
      const [newRequest] = await this.db
        .insert(maintenanceRequests)
        .values({
          tenantId: userId,
          landlordId: null, // Tenant-reported, no landlord
          propertyId: tenantInvitation.propertyId,
          unitId: tenantInvitation.unitId,
          title: complaintData.title,
          description: complaintData.description,
          priority: complaintData.priority || 'medium',
          status: 'pending',
          images: complaintData.images || [],
          assignedTo: tenantInvitation.facilitatorId, // Auto-assign to property facilitator
        })
        .returning();

      return newRequest;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      throw error;
    }
  }

  async getTenantRentContract(userId: string) {
    try {
      // Find the tenant's active rent contract
      const [contractData] = await this.db
        .select({
          contract: tenantRentContracts,
          property: properties,
          unit: units,
        })
        .from(tenantRentContracts)
        .leftJoin(properties, eq(tenantRentContracts.propertyId, properties.id))
        .leftJoin(units, eq(tenantRentContracts.unitId, units.id))
        .where(and(
          eq(tenantRentContracts.tenantId, userId),
          eq(tenantRentContracts.status, 'active')
        ))
        .limit(1);

      if (!contractData) {
        return null; // No active contract found
      }

      const contract = {
        id: contractData.contract.id,
        monthlyAmount: contractData.contract.monthlyAmount,
        nextPaymentDue: contractData.contract.nextPaymentDue,
        expiryDate: contractData.contract.expiryDate,
        transitionStartDate: contractData.contract.transitionStartDate,
        landlordPayoutType: contractData.contract.landlordPayoutType,
        status: contractData.contract.status,
        isExistingTenant: contractData.contract.isExistingTenant,
        property: {
          name: contractData.property?.name || 'Unknown Property',
        },
        unit: {
          unitNumber: contractData.unit?.unitNumber || 'N/A',
        },
      };

      // Calculate arrears if existing tenant
      let arrearsInfo: {
        monthsOverdue: number;
        totalArrears: number;
        message: string;
      } | null = null;
      if (contractData.contract.isExistingTenant) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const transition = new Date(contractData.contract.transitionStartDate);
        transition.setHours(0, 0, 0, 0);
        
        // If transition date is in the past, calculate arrears
        if (transition < today) {
          let monthsOverdue = 0;
          let checkDate = new Date(transition);
          
          while (checkDate < today) {
            monthsOverdue++;
            checkDate.setMonth(checkDate.getMonth() + 1);
          }
          
          if (monthsOverdue > 0) {
            const monthlyAmount = parseFloat(contractData.contract.monthlyAmount);
            const totalArrears = monthsOverdue * monthlyAmount;
            
            arrearsInfo = {
              monthsOverdue,
              totalArrears,
              message: `You owe ${monthsOverdue} month${monthsOverdue > 1 ? 's' : ''} rent (₦${totalArrears.toLocaleString()}). Please pay arrears to continue.`
            };
          }
        }
      }

      // Get payment history
      const { desc } = await import('drizzle-orm');
      const paymentHistory = await this.db
        .select()
        .from(payments)
        .where(and(
          eq(payments.tenantId, userId),
          eq(payments.status, 'paid')
        ))
        .orderBy(desc(payments.paidDate))
        .limit(10);

      const result = {
        contract,
        arrears: arrearsInfo,
        paymentHistory: paymentHistory || [],
      };
      
      console.log('📤 Returning contract data for tenant:', userId);
      console.log('   Next Payment Due:', contract.nextPaymentDue);
      console.log('   Monthly Amount:', contract.monthlyAmount);
      console.log('   Arrears:', arrearsInfo ? 'YES' : 'NO');
      
      return result;
    } catch (error) {
      console.error('Error getting tenant rent contract:', error);
      return null; // Return null instead of throwing to avoid breaking the app
    }
  }
}