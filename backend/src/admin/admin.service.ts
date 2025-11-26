import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { eq, and, or, ilike, count, sql, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as bcrypt from 'bcryptjs';
import { DATABASE_CONNECTION } from '../database/database.module';
import { users } from '../database/schema/users';
import { properties, units } from '../database/schema/properties';
import { payments } from '../database/schema/payments';
import { maintenanceRequests, messages } from '../database/schema/messages';
import { leases } from '../database/schema/leases';
import { tenantInvitations } from '../database/schema/tenant-invitations';
import { CreateUserDto, UpdateUserDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<any>,
  ) {}

  async getDashboardStats() {
    try {
      console.log('🔍 Fetching real dashboard stats from database...');
      
      // Get user counts by role (only query for roles that exist in database)
      const [userStats] = await this.db
        .select({
          totalLandlords: sql<number>`count(case when role = 'landlord' then 1 end)`,
          totalTenants: sql<number>`count(case when role = 'tenant' then 1 end)`,
          totalAdmins: sql<number>`count(case when role = 'admin' then 1 end)`,
        })
        .from(users);

      // Get property stats
      const [propertyStats] = await this.db
        .select({
          totalProperties: count(),
          totalUnits: sql<number>`sum(total_units)`,
        })
        .from(properties);

      // TODO: Get more complex stats from other tables when available:
      // - occupiedUnits from leases/units table
      // - totalRentCollected from payments table  
      // - pendingPayments from payments table
      // - activeMaintenanceRequests from maintenance_requests table

      // Get facilitator stats
      const [facilitatorStats] = await this.db
        .select({
          totalFacilitators: sql<number>`count(case when role = 'facilitator' then 1 end)`,
          activeFacilitators: sql<number>`count(case when role = 'facilitator' and is_active = true then 1 end)`,
        })
        .from(users);

      // Get properties with facilitators assigned
      const [facilitatorPropertyStats] = await this.db
        .select({
          propertiesWithFacilitators: sql<number>`count(case when facilitator_id is not null then 1 end)`,
        })
        .from(properties);

      const stats = {
        totalProperties: Number(propertyStats?.totalProperties || 0),
        totalLandlords: Number(userStats?.totalLandlords || 0),
        totalTenants: Number(userStats?.totalTenants || 0),
        totalFacilitators: Number(facilitatorStats?.totalFacilitators || 0),
        activeFacilitators: Number(facilitatorStats?.activeFacilitators || 0),
        propertiesWithFacilitators: Number(facilitatorPropertyStats?.propertiesWithFacilitators || 0),
        totalUnits: Number(propertyStats?.totalUnits || 0),
        occupiedUnits: 0, // TODO: Calculate from lease/tenant data when available
        vacantUnits: Number(propertyStats?.totalUnits || 0), // For now, assume all units are vacant
        totalRentCollected: 0, // TODO: Calculate from payments table when available
        pendingPayments: 0, // TODO: Calculate from payments table when available
        activeMaintenanceRequests: 0, // TODO: Calculate from maintenance_requests table when available
      };
      
      console.log('📊 Real dashboard stats from database:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fall back to basic stats if database query fails
      return {
        totalProperties: 0,
        totalLandlords: 0,
        totalTenants: 0,
        totalFacilitators: 0,
        totalUnits: 0,
        occupiedUnits: 0,
        vacantUnits: 0,
        totalRentCollected: 0,
        pendingPayments: 0,
        activeMaintenanceRequests: 0,
      };
    }
  }

  async getRevenueAnalytics(timeframe: string = '12m') {
    try {
      console.log('🔍 Fetching real revenue analytics from database...');
      
      // Get current date and calculate timeframe
      const now = new Date();
      const monthsBack = parseInt(timeframe.replace('m', '')) || 12;
      const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);
      
      console.log(`Querying revenue data from ${startDate.toISOString()} to ${now.toISOString()}`);
      
      // Query payments by month for the specified timeframe
      const revenueData = await this.db
        .select({
          month: sql<string>`TO_CHAR(paid_date, 'Mon')`,
          year: sql<number>`EXTRACT(YEAR FROM paid_date)`,
          amount: sql<number>`COALESCE(SUM(amount_paid), 0)`,
        })
        .from(payments)
        .where(
          and(
            sql`paid_date >= ${startDate}`,
            sql`paid_date <= ${now}`,
            eq(payments.status, 'paid')
          )
        )
        .groupBy(sql`DATE_TRUNC('month', paid_date)`, sql`TO_CHAR(paid_date, 'Mon')`, sql`EXTRACT(YEAR FROM paid_date)`)
        .orderBy(sql`DATE_TRUNC('month', paid_date)`);

      console.log('📊 Revenue analytics data:', revenueData);

      // If no data, return empty array
      if (revenueData.length === 0) {
        console.log('No payment data found, returning empty array');
        return { monthlyData: [] };
      }

      return {
        monthlyData: revenueData.map(row => ({
          month: row.month,
          amount: Number(row.amount),
        }))
      };
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      // Return empty data instead of throwing error
      return { monthlyData: [] };
    }
  }

  async getMaintenanceAnalytics(timeframe: string = '12m') {
    try {
      console.log('🔍 Fetching real maintenance analytics from database...');
      
      // Get current date and calculate timeframe
      const now = new Date();
      const monthsBack = parseInt(timeframe.replace('m', '')) || 12;
      const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);
      
      console.log(`Querying maintenance data from ${startDate.toISOString()} to ${now.toISOString()}`);
      
      // Query maintenance requests by month and status for the specified timeframe
      const maintenanceData = await this.db
        .select({
          month: sql<string>`TO_CHAR(created_at, 'Mon')`,
          year: sql<number>`EXTRACT(YEAR FROM created_at)`,
          pending: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
          inProgress: sql<number>`COUNT(CASE WHEN status = 'in_progress' THEN 1 END)`,
          completed: sql<number>`COUNT(CASE WHEN status = 'completed' THEN 1 END)`,
          cancelled: sql<number>`COUNT(CASE WHEN status = 'cancelled' THEN 1 END)`,
        })
        .from(maintenanceRequests)
        .where(
          and(
            sql`created_at >= ${startDate}`,
            sql`created_at <= ${now}`
          )
        )
        .groupBy(sql`DATE_TRUNC('month', created_at)`, sql`TO_CHAR(created_at, 'Mon')`, sql`EXTRACT(YEAR FROM created_at)`)
        .orderBy(sql`DATE_TRUNC('month', created_at)`);

      console.log('📊 Maintenance analytics data:', maintenanceData);

      // If no data, return empty array
      if (maintenanceData.length === 0) {
        console.log('No maintenance request data found, returning empty array');
        return { monthlyData: [] };
      }

      return {
        monthlyData: maintenanceData.map(row => ({
          month: row.month,
          open: Number(row.pending), // Map "pending" to "open" for frontend compatibility
          inProgress: Number(row.inProgress),
          resolved: Number(row.completed), // Map "completed" to "resolved" for frontend compatibility
        }))
      };
    } catch (error) {
      console.error('Error fetching maintenance analytics:', error);
      // Return empty data instead of throwing error
      return { monthlyData: [] };
    }
  }



  async getUsers(options: {
    page: number;
    limit: number;
    role?: string;
    search?: string;
  }) {
    const { page, limit, role, search } = options;
    const offset = (page - 1) * limit;

    try {
      // Build where condition
      let finalWhereCondition;
      
      if (role && search) {
        finalWhereCondition = and(
          eq(users.role, role as any),
          sql`${users.firstName} ILIKE ${`%${search}%`} OR ${users.lastName} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`}`
        );
      } else if (role) {
        finalWhereCondition = eq(users.role, role as any);
      } else if (search) {
        finalWhereCondition = sql`${users.firstName} ILIKE ${`%${search}%`} OR ${users.lastName} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`}`;
      } else {
        finalWhereCondition = undefined;
      }

      // Execute queries
      const dataQuery = this.db
        .select()
        .from(users)
        .where(finalWhereCondition)
        .limit(limit)
        .offset(offset)
        .orderBy(users.createdAt);

      const countQuery = this.db
        .select({ count: count() })
        .from(users)
        .where(finalWhereCondition);

      const [data, totalResult] = await Promise.all([
        dataQuery,
        countQuery,
      ]);

      const total = totalResult[0]?.count || 0;

      return {
        data: data.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }),
        meta: {
          page,
          limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      // Check if user already exists
      const existingUser = await this.db
        .select()
        .from(users)
        .where(eq(users.email, createUserDto.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

      // Create user
      const [newUser] = await this.db
        .insert(users)
        .values({
          ...createUserDto,
          password: hashedPassword,
          isEmailVerified: true, // Admin-created users are auto-verified
        })
        .returning();

      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      const [updatedUser] = await this.db
        .update(users)
        .set({
          ...updateUserDto,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      const [deletedUser] = await this.db
        .delete(users)
        .where(eq(users.id, id))
        .returning();

      if (!deletedUser) {
        throw new NotFoundException('User not found');
      }

      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async toggleUserStatus(id: string) {
    try {
      // First get the current user
      const [currentUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      // Toggle the status
      const [updatedUser] = await this.db
        .update(users)
        .set({
          isActive: !currentUser.isActive,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  async getProperties(options: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const { page, limit, search } = options;
    const offset = (page - 1) * limit;

    try {
      // Build where condition for search
      const searchCondition = search 
        ? sql`${properties.name} ILIKE ${`%${search}%`} OR ${properties.address} ILIKE ${`%${search}%`}`
        : undefined;

      // Execute queries with facilitator join
      const landlordAlias = users;
      const facilitatorAlias = sql`facilitator`;
      
      const dataQuery = this.db
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
          images: properties.images,
          amenities: properties.amenities,
          status: properties.status,
          landlordId: properties.landlordId,
          facilitatorId: properties.facilitatorId,
          createdAt: properties.createdAt,
          updatedAt: properties.updatedAt,
          landlordName: sql<string>`${landlordAlias.firstName} || ' ' || ${landlordAlias.lastName}`,
          landlordEmail: landlordAlias.email,
          facilitatorName: sql<string>`facilitator.first_name || ' ' || facilitator.last_name`,
          facilitatorEmail: sql<string>`facilitator.email`,
        })
        .from(properties)
        .leftJoin(landlordAlias, eq(properties.landlordId, landlordAlias.id))
        .leftJoin(sql`users AS facilitator`, sql`${properties.facilitatorId} = facilitator.id`)
        .where(searchCondition)
        .limit(limit)
        .offset(offset)
        .orderBy(properties.createdAt);

      const countQuery = this.db
        .select({ count: count() })
        .from(properties)
        .where(searchCondition);

      const [data, totalResult] = await Promise.all([
        dataQuery,
        countQuery,
      ]);

      const total = totalResult[0]?.count || 0;

      return {
        data,
        meta: {
          page,
          limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async assignFacilitatorToProperty(propertyId: string, facilitatorId: string) {
    try {
      // Verify facilitator exists and has correct role
      const [facilitator] = await this.db
        .select()
        .from(users)
        .where(and(eq(users.id, facilitatorId), eq(users.role, 'facilitator')))
        .limit(1);

      if (!facilitator) {
        throw new NotFoundException('Facilitator not found');
      }

      // Update property
      const [updatedProperty] = await this.db
        .update(properties)
        .set({
          facilitatorId,
          updatedAt: new Date(),
        })
        .where(eq(properties.id, propertyId))
        .returning();

      if (!updatedProperty) {
        throw new NotFoundException('Property not found');
      }

      return updatedProperty;
    } catch (error) {
      console.error('Error assigning facilitator to property:', error);
      throw error;
    }
  }

  async removeFacilitatorFromProperty(propertyId: string) {
    try {
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

      return updatedProperty;
    } catch (error) {
      console.error('Error removing facilitator from property:', error);
      throw error;
    }
  }

  // Analytics methods (mock implementations for now)
  async getPropertyAnalytics(timeframe: string) {
    // TODO: Implement real analytics based on timeframe
    return {
      totalProperties: 24,
      newProperties: 3,
      propertiesWithFacilitators: 18,
      averageUnitsPerProperty: 6.5,
    };
  }

  // Property Detail Methods
  async getPropertyById(id: string) {
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
          images: properties.images,
          amenities: properties.amenities,
          status: properties.status,
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
        .where(eq(properties.id, id))
        .limit(1);

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      // Get facilitator info if assigned
      let facilitator: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
      } | null = null;
      if (property.facilitatorId) {
        const [facilitatorData] = await this.db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            phoneNumber: users.phoneNumber,
          })
          .from(users)
          .where(eq(users.id, property.facilitatorId))
          .limit(1);
        
        facilitator = facilitatorData;
      }

      return {
        ...property,
        facilitator,
      };
    } catch (error) {
      console.error('Error fetching property by ID:', error);
      throw error;
    }
  }

  async getPropertyUnits(propertyId: string) {
    try {
      // Query units with active lease information
      const unitsData = await this.db
        .select({
          id: units.id,
          unitNumber: units.unitNumber,
          bedrooms: units.bedrooms,
          bathrooms: units.bathrooms,
          rent: units.rent,
          isAvailable: units.isAvailable,
          propertyId: units.propertyId,
          // Lease information
          tenantId: leases.tenantId,
          leaseStatus: leases.status,
          // Tenant information
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

      // Transform to match frontend expectations
      return unitsData.map(unit => ({
        id: unit.id,
        unitNumber: unit.unitNumber,
        status: unit.tenantId ? 'occupied' : 'vacant',
        rentAmount: Number(unit.rent),
        tenantId: unit.tenantId,
        tenantName: unit.tenantFirstName && unit.tenantLastName 
          ? `${unit.tenantFirstName} ${unit.tenantLastName}`
          : null,
        propertyId: unit.propertyId,
      }));
    } catch (error) {
      console.error('Error fetching property units:', error);
      throw error;
    }
  }

  async getPropertyTenants(propertyId: string) {
    try {
      // Query tenants with active leases for this property
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
          leaseStatus: leases.status,
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

      // Transform to match frontend expectations
      // TODO: Calculate actual payment status from payments table
      return tenantsData.map(tenant => ({
        id: tenant.id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phoneNumber: tenant.phoneNumber,
        unitNumber: tenant.unitNumber,
        rentAmount: Number(tenant.monthlyRent),
        leaseEndDate: tenant.leaseEndDate,
        status: 'paid', // Default for now, should be calculated from payments
      }));
    } catch (error) {
      console.error('Error fetching property tenants:', error);
      throw error;
    }
  }

  async getPropertyMaintenance(propertyId: string) {
    try {
      // Query maintenance requests for this property with tenant and unit info
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

      // Transform the data to match frontend expectations
      return maintenanceData.map(request => ({
        id: request.id,
        issue: request.title,
        description: request.description,
        status: request.status,
        priority: request.priority || 'medium',
        images: request.images || [],
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
      console.error('Error fetching property maintenance:', error);
      return [];
    }
  }

  async getPropertyPayments(propertyId: string) {
    try {
      // Query payments for this property with tenant and unit info
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

      // Transform the data to match frontend expectations
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
      console.error('Error fetching property payments:', error);
      return [];
    }
  }

  async getAllMaintenanceRequests(filters: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  } = {}) {
    try {
      const { status, priority, page = 1, limit = 50 } = filters;
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions: any[] = [];
      if (status) {
        conditions.push(eq(maintenanceRequests.status, status as any));
      }
      if (priority) {
        conditions.push(eq(maintenanceRequests.priority, priority as any));
      }

      // First, let's try a simple query to see if we can get basic maintenance requests
      console.log('🔍 Fetching maintenance requests with filters:', { status, priority, page, limit });
      
      // Simple query first - just get maintenance requests with property info
      const query = this.db
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
          propertyId: properties.id,
          tenantId: maintenanceRequests.tenantId,
          landlordId: maintenanceRequests.landlordId,
          assignedTo: maintenanceRequests.assignedTo,
        })
        .from(maintenanceRequests)
        .innerJoin(properties, eq(maintenanceRequests.propertyId, properties.id))
        .orderBy(sql`${maintenanceRequests.createdAt} DESC`)
        .limit(limit)
        .offset(offset);

      const maintenanceData = conditions.length > 0 
        ? await query.where(and(...conditions))
        : await query;

      console.log(`📊 Found ${maintenanceData.length} maintenance requests`);
      console.log('Sample data:', maintenanceData.slice(0, 2));

      // For now, let's get tenant and admin names separately to avoid complex joins
      const transformedData: any[] = [];
      
      for (const request of maintenanceData) {
        // Get tenant info and unit number
        let tenantName = 'Unknown';
        let unitNumber = 'N/A';
        if (request.tenantId) {
          try {
            const [tenant] = await this.db
              .select({
                firstName: users.firstName,
                lastName: users.lastName,
              })
              .from(users)
              .where(eq(users.id, request.tenantId))
              .limit(1);
            
            if (tenant) {
              tenantName = `${tenant.firstName} ${tenant.lastName}`;
            }

            // Get the unit number for this tenant in this property
            const [lease] = await this.db
              .select({
                unitNumber: units.unitNumber,
              })
              .from(leases)
              .innerJoin(units, eq(leases.unitId, units.id))
              .where(
                and(
                  eq(leases.tenantId, request.tenantId),
                  eq(leases.propertyId, request.propertyId),
                  eq(leases.status, 'active')
                )
              )
              .limit(1);
            
            if (lease) {
              unitNumber = lease.unitNumber;
            }
          } catch (error) {
            console.error('Error fetching tenant/unit info:', error);
          }
        }

        // Get assigned admin info
        let assignedAdmin = 'Unassigned';
        if (request.assignedTo) {
          try {
            const [admin] = await this.db
              .select({
                firstName: users.firstName,
                lastName: users.lastName,
              })
              .from(users)
              .where(eq(users.id, request.assignedTo))
              .limit(1);
            
            if (admin) {
              assignedAdmin = `${admin.firstName} ${admin.lastName}`;
            }
          } catch (error) {
            console.error('Error fetching admin:', error);
          }
        }

        transformedData.push({
          id: request.id,
          issue: request.title,
          description: request.description,
          status: request.status,
          priority: request.priority || 'medium',
          images: request.images || [],
          propertyName: request.propertyName,
          propertyId: request.propertyId,
          tenant: tenantName,
          unit: unitNumber,
          assignedAdmin,
          createdAt: request.createdAt,
          resolvedAt: request.status === 'completed' ? request.completedAt : null,
        });
      }

      console.log('✅ Transformed maintenance data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching all maintenance requests:', error);
      return [];
    }
  }

  // Admin Message Methods
  async getAdminConversations(adminId: string) {
    try {
      // Get all messages where admin is sender or receiver
      const adminMessages = await this.db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
          content: messages.content,
          subject: messages.subject,
          isRead: messages.isRead,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(
          or(
            eq(messages.senderId, adminId),
            eq(messages.receiverId, adminId)
          )
        )
        .orderBy(sql`${messages.createdAt} DESC`);

      // Group by other user and get latest message
      const conversationsMap = new Map();
      
      for (const message of adminMessages) {
        const otherUserId = message.senderId === adminId ? message.receiverId : message.senderId;
        
        if (!conversationsMap.has(otherUserId)) {
          // Get the other user's details
          const [otherUser] = await this.db
            .select({
              firstName: users.firstName,
              lastName: users.lastName,
              role: users.role,
            })
            .from(users)
            .where(eq(users.id, otherUserId));

          if (otherUser) {
            // Count unread messages from this user
            const unreadMessages = await this.db
              .select()
              .from(messages)
              .where(
                and(
                  eq(messages.senderId, otherUserId),
                  eq(messages.receiverId, adminId),
                  eq(messages.isRead, false)
                )
              );

            conversationsMap.set(otherUserId, {
              id: otherUserId,
              name: `${otherUser.firstName} ${otherUser.lastName}`,
              role: otherUser.role,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
              unreadCount: unreadMessages.length,
              isOwn: message.senderId === adminId,
            });
          }
        }
      }

      return Array.from(conversationsMap.values());
    } catch (error) {
      console.error('Error getting admin conversations:', error);
      return [];
    }
  }

  async getAdminConversation(
    adminId: string, 
    otherUserId: string, 
    pagination: { page: number; limit: number }
  ) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const conversation = await this.db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
          subject: messages.subject,
          content: messages.content,
          isRead: messages.isRead,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(
          or(
            and(eq(messages.senderId, adminId), eq(messages.receiverId, otherUserId)),
            and(eq(messages.senderId, otherUserId), eq(messages.receiverId, adminId))
          )
        )
        .orderBy(sql`${messages.createdAt} ASC`)
        .limit(limit)
        .offset(offset);

      // Mark messages from other user as read
      await this.db
        .update(messages)
        .set({ 
          isRead: true, 
          readAt: new Date(),
          updatedAt: new Date() 
        })
        .where(
          and(
            eq(messages.senderId, otherUserId),
            eq(messages.receiverId, adminId),
            eq(messages.isRead, false)
          )
        );

      return conversation.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        content: msg.content,
        subject: msg.subject,
        timestamp: msg.createdAt,
        isOwn: msg.senderId === adminId,
        isRead: msg.isRead,
      }));
    } catch (error) {
      console.error('Error getting admin conversation:', error);
      return [];
    }
  }

  async sendAdminMessage(
    adminId: string, 
    messageDto: { receiverId: string; subject?: string; content: string }
  ) {
    try {
      // Verify receiver exists
      const [receiver] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, messageDto.receiverId));

      if (!receiver) {
        throw new NotFoundException('Receiver not found');
      }

      const messageData = {
        senderId: adminId,
        receiverId: messageDto.receiverId,
        subject: messageDto.subject || 'Message from Admin',
        content: messageDto.content,
      };

      const [message] = await this.db.insert(messages).values(messageData).returning();
      return message;
    } catch (error) {
      console.error('Error sending admin message:', error);
      throw error;
    }
  }

  async getAdminUnreadCount(adminId: string) {
    try {
      const unreadMessages = await this.db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.receiverId, adminId),
            eq(messages.isRead, false)
          )
        );

      return { count: unreadMessages.length };
    } catch (error) {
      console.error('Error getting admin unread count:', error);
      return { count: 0 };
    }
  }

}
