import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../database/database.module';
import { tenantInvitations, properties, units, users, payments } from '../database/schema';

@Injectable()
export class TenantsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  async getTenantData(userId: string) {
    try {
      // Find the tenant's accepted invitation
      const [tenantInvitation] = await this.db
        .select({
          invitation: tenantInvitations,
          property: properties,
          unit: units,
          user: users,
        })
        .from(tenantInvitations)
        .leftJoin(properties, eq(tenantInvitations.propertyId, properties.id))
        .leftJoin(units, eq(tenantInvitations.unitId, units.id))
        .leftJoin(users, eq(tenantInvitations.tenantId, users.id))
        .where(and(
          eq(tenantInvitations.tenantId, userId),
          eq(tenantInvitations.status, 'accepted')
        ));

      if (!tenantInvitation) {
        throw new NotFoundException('Tenant data not found');
      }

      // Calculate payments dynamically based on move-in date
      const moveInDate = new Date(tenantInvitation.invitation.leaseStartDate);
      const monthlyRent = parseFloat(tenantInvitation.unit?.rent || tenantInvitation.invitation.monthlyRent || '0');
      const today = new Date();
      
      // Payment calculation logic
      
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
      
      // For now, assume no payments have been made (we can add payment tracking later)
      const totalPaid = 0;
      const totalDue = Math.max(0, (monthsDue * monthlyRent) - totalPaid);
      
      // Calculate total due amount

      return {
        property: {
          name: tenantInvitation.property?.name || 'Unknown Property',
          unit: `Unit ${tenantInvitation.unit?.unitNumber || 'N/A'}`,
        },
        totalDue: totalDue,
        dueDate: nextDueDate,
        tenant: {
          firstName: tenantInvitation.invitation.firstName,
          lastName: tenantInvitation.invitation.lastName,
        },
        monthsDue: monthsDue,
        monthlyRent: monthlyRent,
        totalPaid: totalPaid,
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
      
      // For now, assume no payments have been made
      const totalPaid = 0;
      const totalDue = Math.max(0, (monthsDue * monthlyRent) - totalPaid);

      return {
        totalDue,
        dueDate: nextDueDate,
        paymentHistory: [], // Empty for now - can be populated later when payment tracking is implemented
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
      // TODO: Implement complaints system with database
      // For now, return mock data
      return [
        {
          id: '1',
          title: 'Generator Not Working',
          date: 'May 5, 2025',
          status: 'In Progress',
          statusColor: '#1A2A52',
        },
        {
          id: '2',
          title: 'Leaking Kitchen Tap',
          date: 'May 6, 2025',
          status: 'Pending',
          statusColor: '#FFA500',
        },
        {
          id: '3',
          title: 'Leaking Kitchen Tap',
          date: 'May 5, 2025',
          status: 'Resolved',
          statusColor: '#4CAF50',
        },
        {
          id: '4',
          title: 'Leaking Kitchen Tap',
          date: 'May 5, 2025',
          status: 'Resolved',
          statusColor: '#4CAF50',
        },
      ];
    } catch (error) {
      console.error('Error getting tenant complaints:', error);
      throw error;
    }
  }

  async getComplaintDetail(complaintId: string, userId: string) {
    try {
      // TODO: Implement with database
      // For now, return mock data
      return {
        id: complaintId,
        title: 'Leaking Kitchen Tap',
        date: 'May 1st, 2025',
        description: 'Leaking Kitchen Tap',
        status: 'Pending',
        statusColor: '#FFA500',
        assignedFacilitator: 'Test name',
      };
    } catch (error) {
      console.error('Error getting complaint detail:', error);
      throw error;
    }
  }

  async submitComplaint(complaintData: any, userId: string) {
    try {
      // TODO: Implement with database
      // For now, return mock response
      return {
        id: Date.now().toString(),
        ...complaintData,
        userId,
        status: 'Pending',
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error submitting complaint:', error);
      throw error;
    }
  }
}