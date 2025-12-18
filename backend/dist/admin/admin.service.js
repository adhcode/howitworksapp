"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdminService", {
    enumerable: true,
    get: function() {
        return AdminService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _nodepostgres = require("drizzle-orm/node-postgres");
const _bcryptjs = /*#__PURE__*/ _interop_require_wildcard(require("bcryptjs"));
const _databasemodule = require("../database/database.module");
const _users = require("../database/schema/users");
const _properties = require("../database/schema/properties");
const _payments = require("../database/schema/payments");
const _messages = require("../database/schema/messages");
const _leases = require("../database/schema/leases");
const _tenantinvitations = require("../database/schema/tenant-invitations");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
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
let AdminService = class AdminService {
    async getDashboardStats() {
        try {
            console.log('🔍 Fetching real dashboard stats from database...');
            // Get user counts by role (only query for roles that exist in database)
            const [userStats] = await this.db.select({
                totalLandlords: (0, _drizzleorm.sql)`count(case when role = 'landlord' then 1 end)`,
                totalTenants: (0, _drizzleorm.sql)`count(case when role = 'tenant' then 1 end)`,
                totalAdmins: (0, _drizzleorm.sql)`count(case when role = 'admin' then 1 end)`
            }).from(_users.users);
            // Get property stats
            const [propertyStats] = await this.db.select({
                totalProperties: (0, _drizzleorm.count)()
            }).from(_properties.properties);
            // Get actual units count from units table (not from properties.totalUnits)
            const [unitsStats] = await this.db.select({
                totalUnits: (0, _drizzleorm.count)()
            }).from(_properties.units);
            // Get occupied units (units with accepted tenant invitations)
            const [occupiedUnitsStats] = await this.db.select({
                occupiedUnits: (0, _drizzleorm.count)()
            }).from(_tenantinvitations.tenantInvitations).where((0, _drizzleorm.eq)(_tenantinvitations.tenantInvitations.status, 'accepted'));
            // TODO: Get more complex stats from other tables when available:
            // - totalRentCollected from payments table  
            // - pendingPayments from payments table
            // - activeMaintenanceRequests from maintenance_requests table
            // Get facilitator stats
            const [facilitatorStats] = await this.db.select({
                totalFacilitators: (0, _drizzleorm.sql)`count(case when role = 'facilitator' then 1 end)`,
                activeFacilitators: (0, _drizzleorm.sql)`count(case when role = 'facilitator' and is_active = true then 1 end)`
            }).from(_users.users);
            // Get properties with facilitators assigned
            const [facilitatorPropertyStats] = await this.db.select({
                propertiesWithFacilitators: (0, _drizzleorm.sql)`count(case when facilitator_id is not null then 1 end)`
            }).from(_properties.properties);
            const totalUnits = Number(unitsStats?.totalUnits || 0);
            const occupiedUnits = Number(occupiedUnitsStats?.occupiedUnits || 0);
            const stats = {
                totalProperties: Number(propertyStats?.totalProperties || 0),
                totalLandlords: Number(userStats?.totalLandlords || 0),
                totalTenants: Number(userStats?.totalTenants || 0),
                totalFacilitators: Number(facilitatorStats?.totalFacilitators || 0),
                activeFacilitators: Number(facilitatorStats?.activeFacilitators || 0),
                propertiesWithFacilitators: Number(facilitatorPropertyStats?.propertiesWithFacilitators || 0),
                totalUnits,
                occupiedUnits,
                vacantUnits: totalUnits - occupiedUnits,
                totalRentCollected: 0,
                pendingPayments: 0,
                activeMaintenanceRequests: 0
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
                activeMaintenanceRequests: 0
            };
        }
    }
    async getRevenueAnalytics(timeframe = '12m') {
        try {
            console.log('🔍 Fetching real revenue analytics from database...');
            // Get current date and calculate timeframe
            const now = new Date();
            const monthsBack = parseInt(timeframe.replace('m', '')) || 12;
            const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);
            console.log(`Querying revenue data from ${startDate.toISOString()} to ${now.toISOString()}`);
            // Query payments by month for the specified timeframe
            const revenueData = await this.db.select({
                month: (0, _drizzleorm.sql)`TO_CHAR(paid_date, 'Mon')`,
                year: (0, _drizzleorm.sql)`EXTRACT(YEAR FROM paid_date)`,
                amount: (0, _drizzleorm.sql)`COALESCE(SUM(amount_paid), 0)`
            }).from(_payments.payments).where((0, _drizzleorm.and)((0, _drizzleorm.sql)`paid_date >= ${startDate}`, (0, _drizzleorm.sql)`paid_date <= ${now}`, (0, _drizzleorm.eq)(_payments.payments.status, 'paid'))).groupBy((0, _drizzleorm.sql)`DATE_TRUNC('month', paid_date)`, (0, _drizzleorm.sql)`TO_CHAR(paid_date, 'Mon')`, (0, _drizzleorm.sql)`EXTRACT(YEAR FROM paid_date)`).orderBy((0, _drizzleorm.sql)`DATE_TRUNC('month', paid_date)`);
            console.log('📊 Revenue analytics data:', revenueData);
            // If no data, return empty array
            if (revenueData.length === 0) {
                console.log('No payment data found, returning empty array');
                return {
                    monthlyData: []
                };
            }
            return {
                monthlyData: revenueData.map((row)=>({
                        month: row.month,
                        amount: Number(row.amount)
                    }))
            };
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
            // Return empty data instead of throwing error
            return {
                monthlyData: []
            };
        }
    }
    async getMaintenanceAnalytics(timeframe = '12m') {
        try {
            console.log('🔍 Fetching real maintenance analytics from database...');
            // Get current date and calculate timeframe
            const now = new Date();
            const monthsBack = parseInt(timeframe.replace('m', '')) || 12;
            const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);
            console.log(`Querying maintenance data from ${startDate.toISOString()} to ${now.toISOString()}`);
            // Query maintenance requests by month and status for the specified timeframe
            const maintenanceData = await this.db.select({
                month: (0, _drizzleorm.sql)`TO_CHAR(created_at, 'Mon')`,
                year: (0, _drizzleorm.sql)`EXTRACT(YEAR FROM created_at)`,
                pending: (0, _drizzleorm.sql)`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
                inProgress: (0, _drizzleorm.sql)`COUNT(CASE WHEN status = 'in_progress' THEN 1 END)`,
                completed: (0, _drizzleorm.sql)`COUNT(CASE WHEN status = 'completed' THEN 1 END)`,
                cancelled: (0, _drizzleorm.sql)`COUNT(CASE WHEN status = 'cancelled' THEN 1 END)`
            }).from(_messages.maintenanceRequests).where((0, _drizzleorm.and)((0, _drizzleorm.sql)`created_at >= ${startDate}`, (0, _drizzleorm.sql)`created_at <= ${now}`)).groupBy((0, _drizzleorm.sql)`DATE_TRUNC('month', created_at)`, (0, _drizzleorm.sql)`TO_CHAR(created_at, 'Mon')`, (0, _drizzleorm.sql)`EXTRACT(YEAR FROM created_at)`).orderBy((0, _drizzleorm.sql)`DATE_TRUNC('month', created_at)`);
            console.log('📊 Maintenance analytics data:', maintenanceData);
            // If no data, return empty array
            if (maintenanceData.length === 0) {
                console.log('No maintenance request data found, returning empty array');
                return {
                    monthlyData: []
                };
            }
            return {
                monthlyData: maintenanceData.map((row)=>({
                        month: row.month,
                        open: Number(row.pending),
                        inProgress: Number(row.inProgress),
                        resolved: Number(row.completed)
                    }))
            };
        } catch (error) {
            console.error('Error fetching maintenance analytics:', error);
            // Return empty data instead of throwing error
            return {
                monthlyData: []
            };
        }
    }
    async getUsers(options) {
        const { page, limit, role, search } = options;
        const offset = (page - 1) * limit;
        try {
            // Build where condition
            let finalWhereCondition;
            if (role && search) {
                finalWhereCondition = (0, _drizzleorm.and)((0, _drizzleorm.eq)(_users.users.role, role), (0, _drizzleorm.sql)`${_users.users.firstName} ILIKE ${`%${search}%`} OR ${_users.users.lastName} ILIKE ${`%${search}%`} OR ${_users.users.email} ILIKE ${`%${search}%`}`);
            } else if (role) {
                finalWhereCondition = (0, _drizzleorm.eq)(_users.users.role, role);
            } else if (search) {
                finalWhereCondition = (0, _drizzleorm.sql)`${_users.users.firstName} ILIKE ${`%${search}%`} OR ${_users.users.lastName} ILIKE ${`%${search}%`} OR ${_users.users.email} ILIKE ${`%${search}%`}`;
            } else {
                finalWhereCondition = undefined;
            }
            // Execute queries
            const dataQuery = this.db.select().from(_users.users).where(finalWhereCondition).limit(limit).offset(offset).orderBy(_users.users.createdAt);
            const countQuery = this.db.select({
                count: (0, _drizzleorm.count)()
            }).from(_users.users).where(finalWhereCondition);
            const [data, totalResult] = await Promise.all([
                dataQuery,
                countQuery
            ]);
            const total = totalResult[0]?.count || 0;
            // If fetching landlords, add properties count for each
            let enrichedData = data.map((user)=>{
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
            if (role === 'landlord') {
                // Get properties count for each landlord
                const landlordIds = enrichedData.map((u)=>u.id);
                if (landlordIds.length > 0) {
                    const propertiesCounts = await this.db.select({
                        landlordId: _properties.properties.landlordId,
                        count: (0, _drizzleorm.count)()
                    }).from(_properties.properties).where((0, _drizzleorm.inArray)(_properties.properties.landlordId, landlordIds)).groupBy(_properties.properties.landlordId);
                    const countsMap = new Map(propertiesCounts.map((pc)=>[
                            pc.landlordId,
                            Number(pc.count)
                        ]));
                    enrichedData = enrichedData.map((user)=>({
                            ...user,
                            propertiesCount: countsMap.get(user.id) || 0
                        }));
                } else {
                    enrichedData = enrichedData.map((user)=>({
                            ...user,
                            propertiesCount: 0
                        }));
                }
            }
            return {
                data: enrichedData,
                meta: {
                    page,
                    limit,
                    total: Number(total),
                    totalPages: Math.ceil(Number(total) / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }
    async createUser(createUserDto) {
        try {
            // Check if user already exists
            const existingUser = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.email, createUserDto.email)).limit(1);
            if (existingUser.length > 0) {
                throw new _common.ConflictException('User with this email already exists');
            }
            // Hash password
            const hashedPassword = await _bcryptjs.hash(createUserDto.password, 12);
            // Create user
            const [newUser] = await this.db.insert(_users.users).values({
                ...createUserDto,
                password: hashedPassword,
                isEmailVerified: true
            }).returning();
            const { password, ...userWithoutPassword } = newUser;
            return userWithoutPassword;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    async getUserById(id) {
        try {
            const [user] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, id)).limit(1);
            if (!user) {
                throw new _common.NotFoundException('User not found');
            }
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }
    async updateUser(id, updateUserDto) {
        try {
            const [updatedUser] = await this.db.update(_users.users).set({
                ...updateUserDto,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_users.users.id, id)).returning();
            if (!updatedUser) {
                throw new _common.NotFoundException('User not found');
            }
            const { password, ...userWithoutPassword } = updatedUser;
            return userWithoutPassword;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
    async deleteUser(id) {
        try {
            const [deletedUser] = await this.db.delete(_users.users).where((0, _drizzleorm.eq)(_users.users.id, id)).returning();
            if (!deletedUser) {
                throw new _common.NotFoundException('User not found');
            }
            return {
                message: 'User deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
    async toggleUserStatus(id) {
        try {
            // First get the current user
            const [currentUser] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, id)).limit(1);
            if (!currentUser) {
                throw new _common.NotFoundException('User not found');
            }
            // Toggle the status
            const [updatedUser] = await this.db.update(_users.users).set({
                isActive: !currentUser.isActive,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_users.users.id, id)).returning();
            const { password, ...userWithoutPassword } = updatedUser;
            return userWithoutPassword;
        } catch (error) {
            console.error('Error toggling user status:', error);
            throw error;
        }
    }
    async getProperties(options) {
        const { page, limit, search } = options;
        const offset = (page - 1) * limit;
        try {
            // Build where condition for search
            const searchCondition = search ? (0, _drizzleorm.sql)`${_properties.properties.name} ILIKE ${`%${search}%`} OR ${_properties.properties.address} ILIKE ${`%${search}%`}` : undefined;
            // Execute queries with facilitator join
            const landlordAlias = _users.users;
            const facilitatorAlias = (0, _drizzleorm.sql)`facilitator`;
            const dataQuery = this.db.select({
                id: _properties.properties.id,
                name: _properties.properties.name,
                address: _properties.properties.address,
                city: _properties.properties.city,
                state: _properties.properties.state,
                country: _properties.properties.country,
                propertyType: _properties.properties.propertyType,
                totalUnits: _properties.properties.totalUnits,
                description: _properties.properties.description,
                images: _properties.properties.images,
                amenities: _properties.properties.amenities,
                status: _properties.properties.status,
                landlordId: _properties.properties.landlordId,
                facilitatorId: _properties.properties.facilitatorId,
                createdAt: _properties.properties.createdAt,
                updatedAt: _properties.properties.updatedAt,
                landlordName: (0, _drizzleorm.sql)`${landlordAlias.firstName} || ' ' || ${landlordAlias.lastName}`,
                landlordEmail: landlordAlias.email,
                facilitatorName: (0, _drizzleorm.sql)`facilitator.first_name || ' ' || facilitator.last_name`,
                facilitatorEmail: (0, _drizzleorm.sql)`facilitator.email`
            }).from(_properties.properties).leftJoin(landlordAlias, (0, _drizzleorm.eq)(_properties.properties.landlordId, landlordAlias.id)).leftJoin((0, _drizzleorm.sql)`users AS facilitator`, (0, _drizzleorm.sql)`${_properties.properties.facilitatorId} = facilitator.id`).where(searchCondition).limit(limit).offset(offset).orderBy(_properties.properties.createdAt);
            const countQuery = this.db.select({
                count: (0, _drizzleorm.count)()
            }).from(_properties.properties).where(searchCondition);
            const [data, totalResult] = await Promise.all([
                dataQuery,
                countQuery
            ]);
            const total = totalResult[0]?.count || 0;
            return {
                data,
                meta: {
                    page,
                    limit,
                    total: Number(total),
                    totalPages: Math.ceil(Number(total) / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching properties:', error);
            throw error;
        }
    }
    async assignFacilitatorToProperty(propertyId, facilitatorId) {
        try {
            // Verify facilitator exists and has correct role
            const [facilitator] = await this.db.select().from(_users.users).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_users.users.id, facilitatorId), (0, _drizzleorm.eq)(_users.users.role, 'facilitator'))).limit(1);
            if (!facilitator) {
                throw new _common.NotFoundException('Facilitator not found');
            }
            // Update property
            const [updatedProperty] = await this.db.update(_properties.properties).set({
                facilitatorId,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_properties.properties.id, propertyId)).returning();
            if (!updatedProperty) {
                throw new _common.NotFoundException('Property not found');
            }
            return updatedProperty;
        } catch (error) {
            console.error('Error assigning facilitator to property:', error);
            throw error;
        }
    }
    async removeFacilitatorFromProperty(propertyId) {
        try {
            const [updatedProperty] = await this.db.update(_properties.properties).set({
                facilitatorId: null,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_properties.properties.id, propertyId)).returning();
            if (!updatedProperty) {
                throw new _common.NotFoundException('Property not found');
            }
            return updatedProperty;
        } catch (error) {
            console.error('Error removing facilitator from property:', error);
            throw error;
        }
    }
    // Analytics methods (mock implementations for now)
    async getPropertyAnalytics(timeframe) {
        // TODO: Implement real analytics based on timeframe
        return {
            totalProperties: 24,
            newProperties: 3,
            propertiesWithFacilitators: 18,
            averageUnitsPerProperty: 6.5
        };
    }
    // Property Detail Methods
    async getPropertyById(id) {
        try {
            const [property] = await this.db.select({
                id: _properties.properties.id,
                name: _properties.properties.name,
                address: _properties.properties.address,
                city: _properties.properties.city,
                state: _properties.properties.state,
                country: _properties.properties.country,
                propertyType: _properties.properties.propertyType,
                totalUnits: _properties.properties.totalUnits,
                description: _properties.properties.description,
                images: _properties.properties.images,
                amenities: _properties.properties.amenities,
                status: _properties.properties.status,
                landlordId: _properties.properties.landlordId,
                facilitatorId: _properties.properties.facilitatorId,
                createdAt: _properties.properties.createdAt,
                updatedAt: _properties.properties.updatedAt,
                landlord: {
                    id: _users.users.id,
                    firstName: _users.users.firstName,
                    lastName: _users.users.lastName,
                    email: _users.users.email,
                    phoneNumber: _users.users.phoneNumber
                }
            }).from(_properties.properties).leftJoin(_users.users, (0, _drizzleorm.eq)(_properties.properties.landlordId, _users.users.id)).where((0, _drizzleorm.eq)(_properties.properties.id, id)).limit(1);
            if (!property) {
                throw new _common.NotFoundException('Property not found');
            }
            // Get facilitator info if assigned
            let facilitator = null;
            if (property.facilitatorId) {
                const [facilitatorData] = await this.db.select({
                    id: _users.users.id,
                    firstName: _users.users.firstName,
                    lastName: _users.users.lastName,
                    email: _users.users.email,
                    phoneNumber: _users.users.phoneNumber
                }).from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, property.facilitatorId)).limit(1);
                facilitator = facilitatorData;
            }
            return {
                ...property,
                facilitator
            };
        } catch (error) {
            console.error('Error fetching property by ID:', error);
            throw error;
        }
    }
    async getPropertyUnits(propertyId) {
        try {
            // Query units with active lease information
            const unitsData = await this.db.select({
                id: _properties.units.id,
                unitNumber: _properties.units.unitNumber,
                bedrooms: _properties.units.bedrooms,
                bathrooms: _properties.units.bathrooms,
                rent: _properties.units.rent,
                isAvailable: _properties.units.isAvailable,
                propertyId: _properties.units.propertyId,
                // Lease information
                tenantId: _leases.leases.tenantId,
                leaseStatus: _leases.leases.status,
                // Tenant information
                tenantFirstName: _users.users.firstName,
                tenantLastName: _users.users.lastName
            }).from(_properties.units).leftJoin(_leases.leases, (0, _drizzleorm.and)((0, _drizzleorm.eq)(_properties.units.id, _leases.leases.unitId), (0, _drizzleorm.eq)(_leases.leases.status, 'active'))).leftJoin(_users.users, (0, _drizzleorm.eq)(_leases.leases.tenantId, _users.users.id)).where((0, _drizzleorm.eq)(_properties.units.propertyId, propertyId)).orderBy(_properties.units.unitNumber);
            // Transform to match frontend expectations
            return unitsData.map((unit)=>({
                    id: unit.id,
                    unitNumber: unit.unitNumber,
                    status: unit.tenantId ? 'occupied' : 'vacant',
                    rentAmount: Number(unit.rent),
                    tenantId: unit.tenantId,
                    tenantName: unit.tenantFirstName && unit.tenantLastName ? `${unit.tenantFirstName} ${unit.tenantLastName}` : null,
                    propertyId: unit.propertyId
                }));
        } catch (error) {
            console.error('Error fetching property units:', error);
            throw error;
        }
    }
    async getPropertyTenants(propertyId) {
        try {
            // Query tenants with active leases for this property
            const tenantsData = await this.db.select({
                id: _users.users.id,
                firstName: _users.users.firstName,
                lastName: _users.users.lastName,
                email: _users.users.email,
                phoneNumber: _users.users.phoneNumber,
                unitNumber: _properties.units.unitNumber,
                monthlyRent: _leases.leases.monthlyRent,
                leaseEndDate: _leases.leases.endDate,
                leaseStatus: _leases.leases.status
            }).from(_leases.leases).innerJoin(_users.users, (0, _drizzleorm.eq)(_leases.leases.tenantId, _users.users.id)).innerJoin(_properties.units, (0, _drizzleorm.eq)(_leases.leases.unitId, _properties.units.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_leases.leases.propertyId, propertyId), (0, _drizzleorm.eq)(_leases.leases.status, 'active'))).orderBy(_properties.units.unitNumber);
            // Transform to match frontend expectations
            // TODO: Calculate actual payment status from payments table
            return tenantsData.map((tenant)=>({
                    id: tenant.id,
                    firstName: tenant.firstName,
                    lastName: tenant.lastName,
                    email: tenant.email,
                    phoneNumber: tenant.phoneNumber,
                    unitNumber: tenant.unitNumber,
                    rentAmount: Number(tenant.monthlyRent),
                    leaseEndDate: tenant.leaseEndDate,
                    status: 'paid'
                }));
        } catch (error) {
            console.error('Error fetching property tenants:', error);
            throw error;
        }
    }
    async getPropertyMaintenance(propertyId) {
        try {
            // Query maintenance requests for this property with tenant and unit info
            const maintenanceData = await this.db.select({
                id: _messages.maintenanceRequests.id,
                title: _messages.maintenanceRequests.title,
                description: _messages.maintenanceRequests.description,
                status: _messages.maintenanceRequests.status,
                priority: _messages.maintenanceRequests.priority,
                images: _messages.maintenanceRequests.images,
                createdAt: _messages.maintenanceRequests.createdAt,
                completedAt: _messages.maintenanceRequests.completedAt,
                tenantFirstName: (0, _drizzleorm.sql)`tenant.first_name`,
                tenantLastName: (0, _drizzleorm.sql)`tenant.last_name`,
                unitNumber: (0, _drizzleorm.sql)`unit.unit_number`,
                assignedToFirstName: (0, _drizzleorm.sql)`assigned_admin.first_name`,
                assignedToLastName: (0, _drizzleorm.sql)`assigned_admin.last_name`
            }).from(_messages.maintenanceRequests).leftJoin((0, _drizzleorm.sql)`users AS tenant`, (0, _drizzleorm.sql)`${_messages.maintenanceRequests.tenantId} = tenant.id`).leftJoin((0, _drizzleorm.sql)`leases AS active_lease`, (0, _drizzleorm.sql)`active_lease.tenant_id = tenant.id AND active_lease.property_id = ${propertyId} AND active_lease.status = 'active'`).leftJoin((0, _drizzleorm.sql)`units AS unit`, (0, _drizzleorm.sql)`active_lease.unit_id = unit.id`).leftJoin((0, _drizzleorm.sql)`users AS assigned_admin`, (0, _drizzleorm.sql)`${_messages.maintenanceRequests.assignedTo} = assigned_admin.id`).where((0, _drizzleorm.eq)(_messages.maintenanceRequests.propertyId, propertyId)).orderBy((0, _drizzleorm.sql)`${_messages.maintenanceRequests.createdAt} DESC`);
            // Transform the data to match frontend expectations
            return maintenanceData.map((request)=>({
                    id: request.id,
                    issue: request.title,
                    description: request.description,
                    status: request.status,
                    priority: request.priority || 'medium',
                    images: request.images || [],
                    tenant: request.tenantFirstName && request.tenantLastName ? `${request.tenantFirstName} ${request.tenantLastName}` : 'Unknown',
                    unit: request.unitNumber || 'N/A',
                    assignedAdmin: request.assignedToFirstName && request.assignedToLastName ? `${request.assignedToFirstName} ${request.assignedToLastName}` : 'Unassigned',
                    createdAt: request.createdAt,
                    resolvedAt: request.status === 'completed' ? request.completedAt : null
                }));
        } catch (error) {
            console.error('Error fetching property maintenance:', error);
            return [];
        }
    }
    async getPropertyPayments(propertyId) {
        try {
            // Query payments for this property with tenant and unit info
            const paymentsData = await this.db.select({
                id: _payments.payments.id,
                amount: _payments.payments.amount,
                amountPaid: _payments.payments.amountPaid,
                dueDate: _payments.payments.dueDate,
                paidDate: _payments.payments.paidDate,
                status: _payments.payments.status,
                tenantFirstName: (0, _drizzleorm.sql)`tenant.first_name`,
                tenantLastName: (0, _drizzleorm.sql)`tenant.last_name`,
                unitNumber: _properties.units.unitNumber
            }).from(_payments.payments).innerJoin((0, _drizzleorm.sql)`users AS tenant`, (0, _drizzleorm.sql)`${_payments.payments.tenantId} = tenant.id`).innerJoin(_properties.units, (0, _drizzleorm.eq)(_payments.payments.unitId, _properties.units.id)).where((0, _drizzleorm.eq)(_payments.payments.propertyId, propertyId)).orderBy((0, _drizzleorm.sql)`${_payments.payments.dueDate} DESC`);
            // Transform the data to match frontend expectations
            return paymentsData.map((payment)=>{
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
                    lastPayment: payment.paidDate
                };
            });
        } catch (error) {
            console.error('Error fetching property payments:', error);
            return [];
        }
    }
    async getAllMaintenanceRequests(filters = {}) {
        try {
            const { status, priority, page = 1, limit = 50 } = filters;
            const offset = (page - 1) * limit;
            // Build where conditions
            const conditions = [];
            if (status) {
                conditions.push((0, _drizzleorm.eq)(_messages.maintenanceRequests.status, status));
            }
            if (priority) {
                conditions.push((0, _drizzleorm.eq)(_messages.maintenanceRequests.priority, priority));
            }
            // First, let's try a simple query to see if we can get basic maintenance requests
            console.log('🔍 Fetching maintenance requests with filters:', {
                status,
                priority,
                page,
                limit
            });
            // Simple query first - just get maintenance requests with property info
            const query = this.db.select({
                id: _messages.maintenanceRequests.id,
                title: _messages.maintenanceRequests.title,
                description: _messages.maintenanceRequests.description,
                status: _messages.maintenanceRequests.status,
                priority: _messages.maintenanceRequests.priority,
                images: _messages.maintenanceRequests.images,
                createdAt: _messages.maintenanceRequests.createdAt,
                completedAt: _messages.maintenanceRequests.completedAt,
                propertyName: _properties.properties.name,
                propertyId: _properties.properties.id,
                tenantId: _messages.maintenanceRequests.tenantId,
                landlordId: _messages.maintenanceRequests.landlordId,
                assignedTo: _messages.maintenanceRequests.assignedTo
            }).from(_messages.maintenanceRequests).innerJoin(_properties.properties, (0, _drizzleorm.eq)(_messages.maintenanceRequests.propertyId, _properties.properties.id)).orderBy((0, _drizzleorm.sql)`${_messages.maintenanceRequests.createdAt} DESC`).limit(limit).offset(offset);
            const maintenanceData = conditions.length > 0 ? await query.where((0, _drizzleorm.and)(...conditions)) : await query;
            console.log(`📊 Found ${maintenanceData.length} maintenance requests`);
            console.log('Sample data:', maintenanceData.slice(0, 2));
            // For now, let's get tenant and admin names separately to avoid complex joins
            const transformedData = [];
            for (const request of maintenanceData){
                // Get tenant info and unit number
                let tenantName = 'Unknown';
                let unitNumber = 'N/A';
                if (request.tenantId) {
                    try {
                        const [tenant] = await this.db.select({
                            firstName: _users.users.firstName,
                            lastName: _users.users.lastName
                        }).from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, request.tenantId)).limit(1);
                        if (tenant) {
                            tenantName = `${tenant.firstName} ${tenant.lastName}`;
                        }
                        // Get the unit number for this tenant in this property
                        const [lease] = await this.db.select({
                            unitNumber: _properties.units.unitNumber
                        }).from(_leases.leases).innerJoin(_properties.units, (0, _drizzleorm.eq)(_leases.leases.unitId, _properties.units.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_leases.leases.tenantId, request.tenantId), (0, _drizzleorm.eq)(_leases.leases.propertyId, request.propertyId), (0, _drizzleorm.eq)(_leases.leases.status, 'active'))).limit(1);
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
                        const [admin] = await this.db.select({
                            firstName: _users.users.firstName,
                            lastName: _users.users.lastName
                        }).from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, request.assignedTo)).limit(1);
                        if (admin) {
                            assignedAdmin = `${admin.firstName} ${admin.lastName}`;
                        }
                    } catch (error) {
                        console.error('Error fetching admin:', error);
                    }
                }
                // Get facilitator info from property
                let facilitatorName = 'No facilitator assigned';
                let facilitatorEmail = null;
                let facilitatorPhone = null;
                try {
                    const [property] = await this.db.select({
                        facilitatorId: _properties.properties.facilitatorId
                    }).from(_properties.properties).where((0, _drizzleorm.eq)(_properties.properties.id, request.propertyId)).limit(1);
                    if (property?.facilitatorId) {
                        const [facilitator] = await this.db.select({
                            firstName: _users.users.firstName,
                            lastName: _users.users.lastName,
                            email: _users.users.email,
                            phoneNumber: _users.users.phoneNumber
                        }).from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, property.facilitatorId)).limit(1);
                        if (facilitator) {
                            facilitatorName = `${facilitator.firstName} ${facilitator.lastName}`;
                            facilitatorEmail = facilitator.email;
                            facilitatorPhone = facilitator.phoneNumber;
                        }
                    }
                } catch (error) {
                    console.error('Error fetching facilitator:', error);
                }
                transformedData.push({
                    id: request.id,
                    issue: request.title,
                    title: request.title,
                    description: request.description,
                    status: request.status,
                    priority: request.priority || 'medium',
                    images: request.images || [],
                    propertyName: request.propertyName,
                    propertyId: request.propertyId,
                    reportedBy: tenantName,
                    tenant: tenantName,
                    unitNumber: unitNumber,
                    unit: unitNumber,
                    assignedAdmin,
                    facilitatorName,
                    facilitatorEmail,
                    facilitatorPhone,
                    createdAt: request.createdAt,
                    resolvedAt: request.status === 'completed' ? request.completedAt : null
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
    async getAdminConversations(adminId) {
        try {
            // Get all messages where admin is sender or receiver
            const adminMessages = await this.db.select({
                id: _messages.messages.id,
                senderId: _messages.messages.senderId,
                receiverId: _messages.messages.receiverId,
                content: _messages.messages.content,
                subject: _messages.messages.subject,
                isRead: _messages.messages.isRead,
                createdAt: _messages.messages.createdAt
            }).from(_messages.messages).where((0, _drizzleorm.or)((0, _drizzleorm.eq)(_messages.messages.senderId, adminId), (0, _drizzleorm.eq)(_messages.messages.receiverId, adminId))).orderBy((0, _drizzleorm.sql)`${_messages.messages.createdAt} DESC`);
            // Group by other user and get latest message
            const conversationsMap = new Map();
            for (const message of adminMessages){
                const otherUserId = message.senderId === adminId ? message.receiverId : message.senderId;
                if (!conversationsMap.has(otherUserId)) {
                    // Get the other user's details
                    const [otherUser] = await this.db.select({
                        firstName: _users.users.firstName,
                        lastName: _users.users.lastName,
                        role: _users.users.role
                    }).from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, otherUserId));
                    if (otherUser) {
                        // Count unread messages from this user
                        const unreadMessages = await this.db.select().from(_messages.messages).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_messages.messages.senderId, otherUserId), (0, _drizzleorm.eq)(_messages.messages.receiverId, adminId), (0, _drizzleorm.eq)(_messages.messages.isRead, false)));
                        conversationsMap.set(otherUserId, {
                            id: otherUserId,
                            name: `${otherUser.firstName} ${otherUser.lastName}`,
                            role: otherUser.role,
                            lastMessage: message.content,
                            lastMessageTime: message.createdAt,
                            unreadCount: unreadMessages.length,
                            isOwn: message.senderId === adminId
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
    async getAdminConversation(adminId, otherUserId, pagination) {
        try {
            const { page = 1, limit = 20 } = pagination;
            const offset = (page - 1) * limit;
            const conversation = await this.db.select({
                id: _messages.messages.id,
                senderId: _messages.messages.senderId,
                receiverId: _messages.messages.receiverId,
                subject: _messages.messages.subject,
                content: _messages.messages.content,
                isRead: _messages.messages.isRead,
                createdAt: _messages.messages.createdAt
            }).from(_messages.messages).where((0, _drizzleorm.or)((0, _drizzleorm.and)((0, _drizzleorm.eq)(_messages.messages.senderId, adminId), (0, _drizzleorm.eq)(_messages.messages.receiverId, otherUserId)), (0, _drizzleorm.and)((0, _drizzleorm.eq)(_messages.messages.senderId, otherUserId), (0, _drizzleorm.eq)(_messages.messages.receiverId, adminId)))).orderBy((0, _drizzleorm.sql)`${_messages.messages.createdAt} ASC`).limit(limit).offset(offset);
            // Mark messages from other user as read
            await this.db.update(_messages.messages).set({
                isRead: true,
                readAt: new Date(),
                updatedAt: new Date()
            }).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_messages.messages.senderId, otherUserId), (0, _drizzleorm.eq)(_messages.messages.receiverId, adminId), (0, _drizzleorm.eq)(_messages.messages.isRead, false)));
            return conversation.map((msg)=>({
                    id: msg.id,
                    senderId: msg.senderId,
                    content: msg.content,
                    subject: msg.subject,
                    timestamp: msg.createdAt,
                    isOwn: msg.senderId === adminId,
                    isRead: msg.isRead
                }));
        } catch (error) {
            console.error('Error getting admin conversation:', error);
            return [];
        }
    }
    async sendAdminMessage(adminId, messageDto) {
        try {
            // Verify receiver exists
            const [receiver] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, messageDto.receiverId));
            if (!receiver) {
                throw new _common.NotFoundException('Receiver not found');
            }
            const messageData = {
                senderId: adminId,
                receiverId: messageDto.receiverId,
                subject: messageDto.subject || 'Message from Admin',
                content: messageDto.content
            };
            const [message] = await this.db.insert(_messages.messages).values(messageData).returning();
            return message;
        } catch (error) {
            console.error('Error sending admin message:', error);
            throw error;
        }
    }
    async getAdminUnreadCount(adminId) {
        try {
            const unreadMessages = await this.db.select().from(_messages.messages).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_messages.messages.receiverId, adminId), (0, _drizzleorm.eq)(_messages.messages.isRead, false)));
            return {
                count: unreadMessages.length
            };
        } catch (error) {
            console.error('Error getting admin unread count:', error);
            return {
                count: 0
            };
        }
    }
    constructor(db){
        this.db = db;
    }
};
AdminService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _nodepostgres.NodePgDatabase === "undefined" ? Object : _nodepostgres.NodePgDatabase
    ])
], AdminService);

//# sourceMappingURL=admin.service.js.map