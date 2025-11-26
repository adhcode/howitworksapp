import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { eq, and, or, desc, sql } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { DATABASE_CONNECTION } from '../database/database.module';
import { users, properties, messages, maintenanceRequests, units, leases, payments } from '../database/schema';
import { CreateFacilitatorDto, AssignFacilitatorDto, FacilitatorStatsDto } from './dto/facilitator.dto';

@Injectable()
export class FacilitatorsService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  /**
   * Create a new facilitator user
   */
  async createFacilitator(createFacilitatorDto: CreateFacilitatorDto) {
    try {
      // Check if email already exists
      const existingUser = await this.db
        .select()
        .from(users)
        .where(eq(users.email, createFacilitatorDto.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new BadRequestException('Email already exists');
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(createFacilitatorDto.password, 10);

      // Create facilitator user
      const [facilitator] = await this.db
        .insert(users)
        .values({
          ...createFacilitatorDto,
          password: hashedPassword,
          role: 'facilitator',
          isActive: true,
          isEmailVerified: true, // Auto-verify facilitators created by admin
        })
        .returning();

      // Remove password from response
      const { password, ...facilitatorResponse } = facilitator;
      return facilitatorResponse;
    } catch (error) {
      console.error('Error creating facilitator:', error);
      throw error;
    }
  }

  /**
   * Get all facilitators
   */
  async getAllFacilitators() {
    try {
      // First, let's see all users
      const allUsers = await this.db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
        })
        .from(users);
      
      console.log('All users in database:', allUsers);
      
      const facilitators = await this.db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phoneNumber: users.phoneNumber,
          isActive: users.isActive,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.role, 'facilitator'))
        .orderBy(desc(users.createdAt));

      console.log('Facilitators found:', facilitators.length, facilitators);
      return facilitators;
    } catch (error) {
      console.error('Error getting facilitators:', error);
      throw error;
    }
  }

  /**
   * Get facilitator by ID
   */
  async getFacilitatorById(facilitatorId: string) {
    try {
      const [facilitator] = await this.db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phoneNumber: users.phoneNumber,
          nextOfKinName: users.nextOfKinName,
          nextOfKinPhone: users.nextOfKinPhone,
          nextOfKinRelationship: users.nextOfKinRelationship,
          isActive: users.isActive,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(and(
          eq(users.id, facilitatorId),
          eq(users.role, 'facilitator')
        ));

      if (!facilitator) {
        throw new NotFoundException('Facilitator not found');
      }

      return facilitator;
    } catch (error) {
      console.error('Error getting facilitator:', error);
      throw error;
    }
  }

  /**
   * Assign facilitator to property
   */
  async assignFacilitatorToProperty(assignDto: AssignFacilitatorDto, adminId: string) {
    try {
      // Verify admin role
      const [admin] = await this.db
        .select()
        .from(users)
        .where(and(
          eq(users.id, adminId),
          eq(users.role, 'admin')
        ));

      if (!admin) {
        throw new ForbiddenException('Only admins can assign facilitators');
      }

      // Verify facilitator exists and is active
      const [facilitator] = await this.db
        .select()
        .from(users)
        .where(and(
          eq(users.id, assignDto.facilitatorId),
          eq(users.role, 'facilitator'),
          eq(users.isActive, true)
        ));

      if (!facilitator) {
        throw new NotFoundException('Active facilitator not found');
      }

      // Verify property exists
      const [property] = await this.db
        .select()
        .from(properties)
        .where(eq(properties.id, assignDto.propertyId));

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      // Update property with facilitator assignment
      const [updatedProperty] = await this.db
        .update(properties)
        .set({
          facilitatorId: assignDto.facilitatorId,
          updatedAt: new Date(),
        })
        .where(eq(properties.id, assignDto.propertyId))
        .returning();

      return {
        success: true,
        message: `Facilitator ${facilitator.firstName} ${facilitator.lastName} assigned to property ${property.name}`,
        property: updatedProperty,
        facilitator: {
          id: facilitator.id,
          firstName: facilitator.firstName,
          lastName: facilitator.lastName,
          email: facilitator.email,
        },
      };
    } catch (error) {
      console.error('Error assigning facilitator:', error);
      throw error;
    }
  }

  /**
   * Remove facilitator from property
   */
  async removeFacilitatorFromProperty(propertyId: string, adminId: string) {
    try {
      // Verify admin role
      const [admin] = await this.db
        .select()
        .from(users)
        .where(and(
          eq(users.id, adminId),
          eq(users.role, 'admin')
        ));

      if (!admin) {
        throw new ForbiddenException('Only admins can remove facilitators');
      }

      // Update property to remove facilitator
      const [updatedProperty] = await this.db
        .update(properties)
        .set({
          facilitatorId: null,
          updatedAt: new Date(),
        })
        .where(eq(properties.id, propertyId))
        .returning();

      if (!updatedProperty) {
        throw new NotFoundException('Property not found');
      }

      return {
        success: true,
        message: 'Facilitator removed from property',
        property: updatedProperty,
      };
    } catch (error) {
      console.error('Error removing facilitator:', error);
      throw error;
    }
  }

  /**
   * Get properties assigned to a facilitator
   */
  async getFacilitatorProperties(facilitatorId: string) {
    try {
      const facilitatorProperties = await this.db
        .select({
          id: properties.id,
          name: properties.name,
          address: properties.address,
          city: properties.city,
          state: properties.state,
          propertyType: properties.propertyType,
          totalUnits: properties.totalUnits,
          status: properties.status,
          landlordId: properties.landlordId,
          landlordFirstName: users.firstName,
          landlordLastName: users.lastName,
          landlordEmail: users.email,
          createdAt: properties.createdAt,
        })
        .from(properties)
        .leftJoin(users, eq(users.id, properties.landlordId))
        .where(eq(properties.facilitatorId, facilitatorId))
        .orderBy(desc(properties.createdAt));

      // Transform to include full landlord name
      return facilitatorProperties.map(prop => ({
        ...prop,
        landlordName: prop.landlordFirstName && prop.landlordLastName 
          ? `${prop.landlordFirstName} ${prop.landlordLastName}`
          : null,
      }));
    } catch (error) {
      console.error('Error getting facilitator properties:', error);
      throw error;
    }
  }

  /**
   * Reset facilitator password
   */
  async resetPassword(facilitatorId: string): Promise<{ tempPassword: string }> {
    try {
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Update password in database
      await this.db
        .update(users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date() 
        })
        .where(and(
          eq(users.id, facilitatorId),
          eq(users.role, 'facilitator')
        ));

      return { tempPassword };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  /**
   * Update facilitator details
   */
  async updateFacilitator(facilitatorId: string, updateData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
    nextOfKinRelationship?: string;
  }) {
    try {
      const [facilitator] = await this.db
        .update(users)
        .set({ 
          ...updateData,
          updatedAt: new Date() 
        })
        .where(and(
          eq(users.id, facilitatorId),
          eq(users.role, 'facilitator')
        ))
        .returning({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phoneNumber: users.phoneNumber,
          nextOfKinName: users.nextOfKinName,
          nextOfKinPhone: users.nextOfKinPhone,
          nextOfKinRelationship: users.nextOfKinRelationship,
          isActive: users.isActive,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        });

      if (!facilitator) {
        throw new NotFoundException('Facilitator not found');
      }

      return facilitator;
    } catch (error) {
      console.error('Error updating facilitator:', error);
      throw error;
    }
  }

  /**
   * Get facilitator dashboard statistics
   */
  async getFacilitatorStats(facilitatorId: string): Promise<FacilitatorStatsDto> {
    try {
      // Get assigned properties count
      const assignedProperties = await this.db
        .select()
        .from(properties)
        .where(eq(properties.facilitatorId, facilitatorId));

      // Get pending maintenance requests for facilitator's properties
      const pendingMaintenanceRequests = await this.db
        .select()
        .from(maintenanceRequests)
        .leftJoin(properties, eq(properties.id, maintenanceRequests.propertyId))
        .where(and(
          eq(properties.facilitatorId, facilitatorId),
          eq(maintenanceRequests.status, 'pending')
        ));

      // Get unread messages for facilitator
      const unreadMessages = await this.db
        .select()
        .from(messages)
        .where(and(
          eq(messages.receiverId, facilitatorId),
          eq(messages.isRead, false)
        ));

      // Get total tenants from active rent contracts for facilitator's properties
      const { tenantRentContracts } = await import('../database/schema');
      const activeTenantsQuery = await this.db
        .select({ tenantId: tenantRentContracts.tenantId })
        .from(tenantRentContracts)
        .leftJoin(properties, eq(properties.id, tenantRentContracts.propertyId))
        .where(and(
          eq(properties.facilitatorId, facilitatorId),
          eq(tenantRentContracts.status, 'active')
        ));

      const totalTenants = activeTenantsQuery.length;

      return {
        assignedProperties: assignedProperties.length,
        pendingMaintenanceRequests: pendingMaintenanceRequests.length,
        unreadMessages: unreadMessages.length,
        totalTenants,
      };
    } catch (error) {
      console.error('Error getting facilitator stats:', error);
      throw error;
    }
  }

  /**
   * Get tenants for facilitator's assigned properties
   */
  async getFacilitatorTenants(facilitatorId: string) {
    try {
      const tenants = await this.db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phoneNumber: users.phoneNumber,
          propertyName: properties.name,
          propertyId: properties.id,
          unitNumber: units.unitNumber,
          rentAmount: leases.monthlyRent,
          leaseStartDate: leases.startDate,
          leaseEndDate: leases.endDate,
          leaseStatus: leases.status,
        })
        .from(leases)
        .innerJoin(users, eq(users.id, leases.tenantId))
        .innerJoin(properties, eq(properties.id, leases.propertyId))
        .innerJoin(units, eq(units.id, leases.unitId))
        .where(and(
          eq(properties.facilitatorId, facilitatorId),
          eq(leases.status, 'active')
        ))
        .orderBy(desc(leases.createdAt));

      // Add payment status (this would need to be calculated based on payment records)
      const tenantsWithStatus = tenants.map(tenant => ({
        ...tenant,
        status: 'paid' as const, // This should be calculated from payment records
      }));

      return tenantsWithStatus;
    } catch (error) {
      console.error('Error getting facilitator tenants:', error);
      throw error;
    }
  }

  /**
   * Get property details for facilitator (only if assigned to them)
   */
  async getFacilitatorPropertyById(propertyId: string, facilitatorId: string) {
    try {
      const [property] = await this.db
        .select({
          id: properties.id,
          name: properties.name,
          address: properties.address,
          city: properties.city,
          state: properties.state,
          country: properties.country,
          propertyType: properties.propertyType,
          totalUnits: properties.totalUnits,
          description: properties.description,
          landlordId: properties.landlordId,
          facilitatorId: properties.facilitatorId,
          createdAt: properties.createdAt,
          updatedAt: properties.updatedAt,
          landlord: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            phoneNumber: users.phoneNumber,
          },
        })
        .from(properties)
        .leftJoin(users, eq(properties.landlordId, users.id))
        .where(and(
          eq(properties.id, propertyId),
          eq(properties.facilitatorId, facilitatorId)
        ))
        .limit(1);

      if (!property) {
        throw new NotFoundException('Property not found or not assigned to you');
      }

      return property;
    } catch (error) {
      console.error('Error getting facilitator property:', error);
      throw error;
    }
  }

  /**
   * Get units for facilitator property
   */
  async getFacilitatorPropertyUnits(propertyId: string, facilitatorId: string) {
    try {
      // First verify the property is assigned to this facilitator
      const [property] = await this.db
        .select()
        .from(properties)
        .where(and(
          eq(properties.id, propertyId),
          eq(properties.facilitatorId, facilitatorId)
        ))
        .limit(1);

      if (!property) {
        throw new NotFoundException('Property not found or not assigned to you');
      }

      // Query units with active lease information
      const unitsData = await this.db
        .select({
          id: units.id,
          unitNumber: units.unitNumber,
          rent: units.rent,
          tenantId: leases.tenantId,
          tenantFirstName: users.firstName,
          tenantLastName: users.lastName,
        })
        .from(units)
        .leftJoin(
          leases,
          and(
            eq(units.id, leases.unitId),
            eq(leases.status, 'active')
          )
        )
        .leftJoin(users, eq(leases.tenantId, users.id))
        .where(eq(units.propertyId, propertyId))
        .orderBy(units.unitNumber);

      return unitsData.map(unit => ({
        id: unit.id,
        unitNumber: unit.unitNumber,
        status: unit.tenantId ? 'occupied' : 'vacant',
        rentAmount: Number(unit.rent),
        tenantId: unit.tenantId,
        tenantName: unit.tenantFirstName && unit.tenantLastName 
          ? `${unit.tenantFirstName} ${unit.tenantLastName}`
          : null,
        propertyId,
      }));
    } catch (error) {
      console.error('Error getting facilitator property units:', error);
      throw error;
    }
  }

  /**
   * Get tenants for facilitator property
   */
  async getFacilitatorPropertyTenants(propertyId: string, facilitatorId: string) {
    try {
      // First verify the property is assigned to this facilitator
      const [property] = await this.db
        .select()
        .from(properties)
        .where(and(
          eq(properties.id, propertyId),
          eq(properties.facilitatorId, facilitatorId)
        ))
        .limit(1);

      if (!property) {
        throw new NotFoundException('Property not found or not assigned to you');
      }

      // Query tenants with active leases
      const tenantsData = await this.db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phoneNumber: users.phoneNumber,
          unitNumber: units.unitNumber,
          monthlyRent: leases.monthlyRent,
          leaseEndDate: leases.endDate,
        })
        .from(leases)
        .innerJoin(users, eq(leases.tenantId, users.id))
        .innerJoin(units, eq(leases.unitId, units.id))
        .where(
          and(
            eq(leases.propertyId, propertyId),
            eq(leases.status, 'active')
          )
        )
        .orderBy(units.unitNumber);

      return tenantsData.map(tenant => ({
        id: tenant.id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phoneNumber: tenant.phoneNumber,
        unitNumber: tenant.unitNumber,
        rentAmount: Number(tenant.monthlyRent),
        leaseEndDate: tenant.leaseEndDate,
        status: 'paid', // Default for now
      }));
    } catch (error) {
      console.error('Error getting facilitator property tenants:', error);
      throw error;
    }
  }

  /**
   * Get all maintenance requests for facilitator's assigned properties
   */
  async getFacilitatorMaintenanceRequests(facilitatorId: string) {
    try {
      // Get all properties assigned to this facilitator
      const facilitatorProperties = await this.db
        .select({ id: properties.id })
        .from(properties)
        .where(eq(properties.facilitatorId, facilitatorId));

      if (facilitatorProperties.length === 0) {
        return [];
      }

      const propertyIds = facilitatorProperties.map(p => p.id);

      // Query maintenance requests for facilitator's properties
      const maintenanceData = await this.db
        .select({
          id: maintenanceRequests.id,
          title: maintenanceRequests.title,
          description: maintenanceRequests.description,
          status: maintenanceRequests.status,
          priority: maintenanceRequests.priority,
          images: maintenanceRequests.images,
          createdAt: maintenanceRequests.createdAt,
          completedAt: maintenanceRequests.completedAt,
          propertyName: properties.name,
          tenantFirstName: sql<string>`tenant.first_name`,
          tenantLastName: sql<string>`tenant.last_name`,
          unitNumber: sql<string>`unit.unit_number`,
        })
        .from(maintenanceRequests)
        .innerJoin(properties, eq(maintenanceRequests.propertyId, properties.id))
        .leftJoin(sql`users AS tenant`, sql`${maintenanceRequests.tenantId} = tenant.id`)
        .leftJoin(sql`leases AS active_lease`, sql`active_lease.tenant_id = tenant.id AND active_lease.property_id = ${maintenanceRequests.propertyId} AND active_lease.status = 'active'`)
        .leftJoin(sql`units AS unit`, sql`active_lease.unit_id = unit.id`)
        .where(sql`${maintenanceRequests.propertyId} IN (${sql.join(propertyIds.map(id => sql`${id}`), sql`, `)})`)
        .orderBy(sql`${maintenanceRequests.createdAt} DESC`);

      return maintenanceData.map(request => ({
        id: request.id,
        title: request.title,
        description: request.description,
        status: request.status,
        priority: request.priority || 'medium',
        images: request.images || [],
        propertyName: request.propertyName,
        tenantName: request.tenantFirstName,
        tenantLastName: request.tenantLastName,
        unitNumber: request.unitNumber || 'N/A',
        createdAt: request.createdAt,
        completedAt: request.completedAt,
      }));
    } catch (error) {
      console.error('Error getting facilitator maintenance requests:', error);
      return [];
    }
  }

  /**
   * Get maintenance requests for facilitator property
   */
  async getFacilitatorPropertyMaintenance(propertyId: string, facilitatorId: string) {
    try {
      // First verify the property is assigned to this facilitator
      const [property] = await this.db
        .select()
        .from(properties)
        .where(and(
          eq(properties.id, propertyId),
          eq(properties.facilitatorId, facilitatorId)
        ))
        .limit(1);

      if (!property) {
        throw new NotFoundException('Property not found or not assigned to you');
      }

      // Query maintenance requests with tenant and unit info
      const maintenanceData = await this.db
        .select({
          id: maintenanceRequests.id,
          title: maintenanceRequests.title,
          description: maintenanceRequests.description,
          status: maintenanceRequests.status,
          priority: maintenanceRequests.priority,
          createdAt: maintenanceRequests.createdAt,
          completedAt: maintenanceRequests.completedAt,
          tenantFirstName: sql<string>`tenant.first_name`,
          tenantLastName: sql<string>`tenant.last_name`,
          unitNumber: sql<string>`unit.unit_number`,
          assignedToFirstName: sql<string>`assigned_admin.first_name`,
          assignedToLastName: sql<string>`assigned_admin.last_name`,
        })
        .from(maintenanceRequests)
        .leftJoin(sql`users AS tenant`, sql`${maintenanceRequests.tenantId} = tenant.id`)
        .leftJoin(sql`leases AS active_lease`, sql`active_lease.tenant_id = tenant.id AND active_lease.property_id = ${propertyId} AND active_lease.status = 'active'`)
        .leftJoin(sql`units AS unit`, sql`active_lease.unit_id = unit.id`)
        .leftJoin(sql`users AS assigned_admin`, sql`${maintenanceRequests.assignedTo} = assigned_admin.id`)
        .where(eq(maintenanceRequests.propertyId, propertyId))
        .orderBy(sql`${maintenanceRequests.createdAt} DESC`);

      return maintenanceData.map(request => ({
        id: request.id,
        issue: request.title,
        description: request.description,
        status: request.status,
        priority: request.priority || 'medium',
        tenant: request.tenantFirstName && request.tenantLastName 
          ? `${request.tenantFirstName} ${request.tenantLastName}` 
          : 'Unknown',
        unit: request.unitNumber || 'N/A',
        assignedAdmin: request.assignedToFirstName && request.assignedToLastName
          ? `${request.assignedToFirstName} ${request.assignedToLastName}`
          : 'Unassigned',
        createdAt: request.createdAt,
        resolvedAt: request.status === 'completed' ? request.completedAt : null,
      }));
    } catch (error) {
      console.error('Error getting facilitator property maintenance:', error);
      return [];
    }
  }

  /**
   * Get payments for facilitator property
   */
  async getFacilitatorPropertyPayments(propertyId: string, facilitatorId: string) {
    try {
      // First verify the property is assigned to this facilitator
      const [property] = await this.db
        .select()
        .from(properties)
        .where(and(
          eq(properties.id, propertyId),
          eq(properties.facilitatorId, facilitatorId)
        ))
        .limit(1);

      if (!property) {
        throw new NotFoundException('Property not found or not assigned to you');
      }

      // Query payments with tenant and unit info
      const paymentsData = await this.db
        .select({
          id: payments.id,
          amount: payments.amount,
          amountPaid: payments.amountPaid,
          dueDate: payments.dueDate,
          paidDate: payments.paidDate,
          status: payments.status,
          tenantFirstName: sql<string>`tenant.first_name`,
          tenantLastName: sql<string>`tenant.last_name`,
          unitNumber: units.unitNumber,
        })
        .from(payments)
        .innerJoin(sql`users AS tenant`, sql`${payments.tenantId} = tenant.id`)
        .innerJoin(units, eq(payments.unitId, units.id))
        .where(eq(payments.propertyId, propertyId))
        .orderBy(sql`${payments.dueDate} DESC`);

      return paymentsData.map(payment => {
        const totalDue = Number(payment.amount);
        const paid = Number(payment.amountPaid);
        const balance = totalDue - paid;

        return {
          id: payment.id,
          tenantName: `${payment.tenantFirstName} ${payment.tenantLastName}`,
          unitNumber: payment.unitNumber,
          totalDue,
          paid,
          balance,
          status: payment.status,
          dueDate: payment.dueDate,
          lastPayment: payment.paidDate,
        };
      });
    } catch (error) {
      console.error('Error getting facilitator property payments:', error);
      return [];
    }
  }

  /**
   * Get facilitator for a specific property
   */
  async getPropertyFacilitator(propertyId: string) {
    try {
      const [propertyWithFacilitator] = await this.db
        .select({
          facilitatorId: properties.facilitatorId,
          facilitatorFirstName: users.firstName,
          facilitatorLastName: users.lastName,
          facilitatorEmail: users.email,
          facilitatorPhone: users.phoneNumber,
        })
        .from(properties)
        .leftJoin(users, eq(users.id, properties.facilitatorId))
        .where(eq(properties.id, propertyId));

      if (!propertyWithFacilitator) {
        throw new NotFoundException('Property not found');
      }

      return propertyWithFacilitator.facilitatorId ? {
        id: propertyWithFacilitator.facilitatorId,
        firstName: propertyWithFacilitator.facilitatorFirstName,
        lastName: propertyWithFacilitator.facilitatorLastName,
        email: propertyWithFacilitator.facilitatorEmail,
        phoneNumber: propertyWithFacilitator.facilitatorPhone,
      } : null;
    } catch (error) {
      console.error('Error getting property facilitator:', error);
      throw error;
    }
  }

  /**
   * Update facilitator status (activate/deactivate)
   */
  async updateFacilitatorStatus(facilitatorId: string, isActive: boolean, adminId: string) {
    try {
      // Verify admin role
      const [admin] = await this.db
        .select()
        .from(users)
        .where(and(
          eq(users.id, adminId),
          eq(users.role, 'admin')
        ));

      if (!admin) {
        throw new ForbiddenException('Only admins can update facilitator status');
      }

      // Update facilitator status
      const [updatedFacilitator] = await this.db
        .update(users)
        .set({
          isActive,
          updatedAt: new Date(),
        })
        .where(and(
          eq(users.id, facilitatorId),
          eq(users.role, 'facilitator')
        ))
        .returning();

      if (!updatedFacilitator) {
        throw new NotFoundException('Facilitator not found');
      }

      // If deactivating, remove from all assigned properties
      if (!isActive) {
        await this.db
          .update(properties)
          .set({
            facilitatorId: null,
            updatedAt: new Date(),
          })
          .where(eq(properties.facilitatorId, facilitatorId));
      }

      const { password, ...facilitatorResponse } = updatedFacilitator;
      return facilitatorResponse;
    } catch (error) {
      console.error('Error updating facilitator status:', error);
      throw error;
    }
  }

  /**
   * Add a comment to a maintenance request (Facilitator)
   */
  async addMaintenanceComment(facilitatorId: string, maintenanceId: string, commentText: string) {
    try {
      // Get the maintenance request and verify facilitator has access
      const [request] = await this.db
        .select({
          id: maintenanceRequests.id,
          propertyId: maintenanceRequests.propertyId,
          comments: maintenanceRequests.comments,
        })
        .from(maintenanceRequests)
        .innerJoin(properties, eq(maintenanceRequests.propertyId, properties.id))
        .where(and(
          eq(maintenanceRequests.id, maintenanceId),
          eq(properties.facilitatorId, facilitatorId)
        ));

      if (!request) {
        throw new NotFoundException('Maintenance request not found or access denied');
      }

      // Get facilitator info
      const [facilitator] = await this.db
        .select({
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(eq(users.id, facilitatorId));

      // Create new comment
      const newComment = {
        id: crypto.randomUUID(),
        authorId: facilitatorId,
        authorName: `${facilitator.firstName} ${facilitator.lastName}`,
        authorRole: 'facilitator',
        text: commentText,
        createdAt: new Date().toISOString(),
      };

      // Get existing comments or initialize empty array
      let existingComments = [];
      try {
        if (typeof request.comments === 'string') {
          existingComments = JSON.parse(request.comments);
        } else if (Array.isArray(request.comments)) {
          existingComments = request.comments;
        }
      } catch (e) {
        console.error('Error parsing existing comments:', e);
        existingComments = [];
      }
      
      const updatedComments = [...existingComments, newComment];

      // Update the maintenance request with new comment
      await this.db
        .update(maintenanceRequests)
        .set({ comments: JSON.stringify(updatedComments) })
        .where(eq(maintenanceRequests.id, maintenanceId));
      
      console.log('✅ Facilitator comment added successfully:', newComment.id);

      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Get maintenance request details (Facilitator)
   */
  async getMaintenanceRequestDetails(facilitatorId: string, maintenanceId: string) {
    try {
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
          propertyId: properties.id,
          propertyName: properties.name,
          unitNumber: sql<string>`unit.unit_number`,
          reporterFirstName: sql<string>`reporter.first_name`,
          reporterLastName: sql<string>`reporter.last_name`,
          reporterRole: sql<string>`reporter.role`,
        })
        .from(maintenanceRequests)
        .innerJoin(properties, eq(maintenanceRequests.propertyId, properties.id))
        .leftJoin(sql`units AS unit`, sql`unit.id = ${maintenanceRequests.unitId}`)
        .leftJoin(sql`users AS reporter`, sql`${maintenanceRequests.tenantId} = reporter.id`)
        .where(and(
          eq(maintenanceRequests.id, maintenanceId),
          eq(properties.facilitatorId, facilitatorId)
        ));

      if (!request) {
        throw new NotFoundException('Maintenance request not found or access denied');
      }

      // Parse comments from JSON string if needed
      let comments = [];
      try {
        if (typeof request.comments === 'string') {
          comments = JSON.parse(request.comments);
        } else if (Array.isArray(request.comments)) {
          comments = request.comments;
        }
      } catch (e) {
        console.error('Error parsing comments:', e);
        comments = [];
      }

      return {
        ...request,
        comments: comments,
        reportedBy: request.reporterRole === 'landlord' ? 
                   `${request.reporterFirstName} ${request.reporterLastName} (Landlord)` : 
                   request.reporterRole === 'tenant' ? 
                   `${request.reporterFirstName} ${request.reporterLastName} (Tenant)` : 'Unknown',
        reporterType: request.reporterRole,
        hasFacilitator: true,
        assignedFacilitator: 'You',
      };
    } catch (error) {
      console.error('Error getting maintenance request details:', error);
      throw error;
    }
  }
}



