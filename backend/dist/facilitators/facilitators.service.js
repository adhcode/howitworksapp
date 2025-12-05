"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FacilitatorsService", {
    enumerable: true,
    get: function() {
        return FacilitatorsService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _bcryptjs = /*#__PURE__*/ _interop_require_wildcard(require("bcryptjs"));
const _crypto = /*#__PURE__*/ _interop_require_wildcard(require("crypto"));
const _databasemodule = require("../database/database.module");
const _schema = require("../database/schema");
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
let FacilitatorsService = class FacilitatorsService {
    /**
   * Create a new facilitator user
   */ async createFacilitator(createFacilitatorDto) {
        try {
            // Check if email already exists
            const existingUser = await this.db.select().from(_schema.users).where((0, _drizzleorm.eq)(_schema.users.email, createFacilitatorDto.email)).limit(1);
            if (existingUser.length > 0) {
                throw new _common.BadRequestException('Email already exists');
            }
            // Hash password before storing
            const hashedPassword = await _bcryptjs.hash(createFacilitatorDto.password, 10);
            // Create facilitator user
            const [facilitator] = await this.db.insert(_schema.users).values({
                ...createFacilitatorDto,
                password: hashedPassword,
                role: 'facilitator',
                isActive: true,
                isEmailVerified: true
            }).returning();
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
   */ async getAllFacilitators() {
        try {
            const facilitators = await this.db.select({
                id: _schema.users.id,
                firstName: _schema.users.firstName,
                lastName: _schema.users.lastName,
                email: _schema.users.email,
                phoneNumber: _schema.users.phoneNumber,
                isActive: _schema.users.isActive,
                lastLoginAt: _schema.users.lastLoginAt,
                createdAt: _schema.users.createdAt
            }).from(_schema.users).where((0, _drizzleorm.eq)(_schema.users.role, 'facilitator')).orderBy((0, _drizzleorm.desc)(_schema.users.createdAt));
            // Get property counts for each facilitator
            const facilitatorsWithCounts = await Promise.all(facilitators.map(async (facilitator)=>{
                const [propertyCount] = await this.db.select({
                    count: (0, _drizzleorm.count)()
                }).from(_schema.properties).where((0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitator.id));
                return {
                    ...facilitator,
                    assignedProperties: Number(propertyCount?.count || 0)
                };
            }));
            console.log('Facilitators with property counts:', facilitatorsWithCounts);
            return facilitatorsWithCounts;
        } catch (error) {
            console.error('Error getting facilitators:', error);
            throw error;
        }
    }
    /**
   * Get facilitator by ID
   */ async getFacilitatorById(facilitatorId) {
        try {
            const [facilitator] = await this.db.select({
                id: _schema.users.id,
                firstName: _schema.users.firstName,
                lastName: _schema.users.lastName,
                email: _schema.users.email,
                phoneNumber: _schema.users.phoneNumber,
                nextOfKinName: _schema.users.nextOfKinName,
                nextOfKinPhone: _schema.users.nextOfKinPhone,
                nextOfKinRelationship: _schema.users.nextOfKinRelationship,
                isActive: _schema.users.isActive,
                lastLoginAt: _schema.users.lastLoginAt,
                createdAt: _schema.users.createdAt
            }).from(_schema.users).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.users.id, facilitatorId), (0, _drizzleorm.eq)(_schema.users.role, 'facilitator')));
            if (!facilitator) {
                throw new _common.NotFoundException('Facilitator not found');
            }
            return facilitator;
        } catch (error) {
            console.error('Error getting facilitator:', error);
            throw error;
        }
    }
    /**
   * Assign facilitator to property
   */ async assignFacilitatorToProperty(assignDto, adminId) {
        try {
            // Verify admin role
            const [admin] = await this.db.select().from(_schema.users).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.users.id, adminId), (0, _drizzleorm.eq)(_schema.users.role, 'admin')));
            if (!admin) {
                throw new _common.ForbiddenException('Only admins can assign facilitators');
            }
            // Verify facilitator exists and is active
            const [facilitator] = await this.db.select().from(_schema.users).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.users.id, assignDto.facilitatorId), (0, _drizzleorm.eq)(_schema.users.role, 'facilitator'), (0, _drizzleorm.eq)(_schema.users.isActive, true)));
            if (!facilitator) {
                throw new _common.NotFoundException('Active facilitator not found');
            }
            // Verify property exists
            const [property] = await this.db.select().from(_schema.properties).where((0, _drizzleorm.eq)(_schema.properties.id, assignDto.propertyId));
            if (!property) {
                throw new _common.NotFoundException('Property not found');
            }
            // Update property with facilitator assignment
            const [updatedProperty] = await this.db.update(_schema.properties).set({
                facilitatorId: assignDto.facilitatorId,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_schema.properties.id, assignDto.propertyId)).returning();
            return {
                success: true,
                message: `Facilitator ${facilitator.firstName} ${facilitator.lastName} assigned to property ${property.name}`,
                property: updatedProperty,
                facilitator: {
                    id: facilitator.id,
                    firstName: facilitator.firstName,
                    lastName: facilitator.lastName,
                    email: facilitator.email
                }
            };
        } catch (error) {
            console.error('Error assigning facilitator:', error);
            throw error;
        }
    }
    /**
   * Remove facilitator from property
   */ async removeFacilitatorFromProperty(propertyId, adminId) {
        try {
            // Verify admin role
            const [admin] = await this.db.select().from(_schema.users).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.users.id, adminId), (0, _drizzleorm.eq)(_schema.users.role, 'admin')));
            if (!admin) {
                throw new _common.ForbiddenException('Only admins can remove facilitators');
            }
            // Update property to remove facilitator
            const [updatedProperty] = await this.db.update(_schema.properties).set({
                facilitatorId: null,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_schema.properties.id, propertyId)).returning();
            if (!updatedProperty) {
                throw new _common.NotFoundException('Property not found');
            }
            return {
                success: true,
                message: 'Facilitator removed from property',
                property: updatedProperty
            };
        } catch (error) {
            console.error('Error removing facilitator:', error);
            throw error;
        }
    }
    /**
   * Get properties assigned to a facilitator
   */ async getFacilitatorProperties(facilitatorId) {
        try {
            const facilitatorProperties = await this.db.select({
                id: _schema.properties.id,
                name: _schema.properties.name,
                address: _schema.properties.address,
                city: _schema.properties.city,
                state: _schema.properties.state,
                propertyType: _schema.properties.propertyType,
                totalUnits: _schema.properties.totalUnits,
                status: _schema.properties.status,
                landlordId: _schema.properties.landlordId,
                landlordFirstName: _schema.users.firstName,
                landlordLastName: _schema.users.lastName,
                landlordEmail: _schema.users.email,
                createdAt: _schema.properties.createdAt
            }).from(_schema.properties).leftJoin(_schema.users, (0, _drizzleorm.eq)(_schema.users.id, _schema.properties.landlordId)).where((0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId)).orderBy((0, _drizzleorm.desc)(_schema.properties.createdAt));
            // Transform to include full landlord name
            return facilitatorProperties.map((prop)=>({
                    ...prop,
                    landlordName: prop.landlordFirstName && prop.landlordLastName ? `${prop.landlordFirstName} ${prop.landlordLastName}` : null
                }));
        } catch (error) {
            console.error('Error getting facilitator properties:', error);
            throw error;
        }
    }
    /**
   * Reset facilitator password
   */ async resetPassword(facilitatorId) {
        try {
            // Generate temporary password
            const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await _bcryptjs.hash(tempPassword, 10);
            // Update password in database
            await this.db.update(_schema.users).set({
                password: hashedPassword,
                updatedAt: new Date()
            }).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.users.id, facilitatorId), (0, _drizzleorm.eq)(_schema.users.role, 'facilitator')));
            return {
                tempPassword
            };
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }
    /**
   * Update facilitator details
   */ async updateFacilitator(facilitatorId, updateData) {
        try {
            const [facilitator] = await this.db.update(_schema.users).set({
                ...updateData,
                updatedAt: new Date()
            }).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.users.id, facilitatorId), (0, _drizzleorm.eq)(_schema.users.role, 'facilitator'))).returning({
                id: _schema.users.id,
                firstName: _schema.users.firstName,
                lastName: _schema.users.lastName,
                email: _schema.users.email,
                phoneNumber: _schema.users.phoneNumber,
                nextOfKinName: _schema.users.nextOfKinName,
                nextOfKinPhone: _schema.users.nextOfKinPhone,
                nextOfKinRelationship: _schema.users.nextOfKinRelationship,
                isActive: _schema.users.isActive,
                lastLoginAt: _schema.users.lastLoginAt,
                createdAt: _schema.users.createdAt
            });
            if (!facilitator) {
                throw new _common.NotFoundException('Facilitator not found');
            }
            return facilitator;
        } catch (error) {
            console.error('Error updating facilitator:', error);
            throw error;
        }
    }
    /**
   * Get facilitator dashboard statistics
   */ async getFacilitatorStats(facilitatorId) {
        try {
            // Get assigned properties count
            const assignedProperties = await this.db.select().from(_schema.properties).where((0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId));
            // Get pending maintenance requests for facilitator's properties
            const pendingMaintenanceRequests = await this.db.select().from(_schema.maintenanceRequests).leftJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.properties.id, _schema.maintenanceRequests.propertyId)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId), (0, _drizzleorm.eq)(_schema.maintenanceRequests.status, 'pending')));
            // Get unread messages for facilitator
            const unreadMessages = await this.db.select().from(_schema.messages).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.messages.receiverId, facilitatorId), (0, _drizzleorm.eq)(_schema.messages.isRead, false)));
            // Get total tenants from active rent contracts for facilitator's properties
            const { tenantRentContracts } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../database/schema")));
            const activeTenantsQuery = await this.db.select({
                tenantId: tenantRentContracts.tenantId
            }).from(tenantRentContracts).leftJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.properties.id, tenantRentContracts.propertyId)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId), (0, _drizzleorm.eq)(tenantRentContracts.status, 'active')));
            const totalTenants = activeTenantsQuery.length;
            return {
                assignedProperties: assignedProperties.length,
                pendingMaintenanceRequests: pendingMaintenanceRequests.length,
                unreadMessages: unreadMessages.length,
                totalTenants
            };
        } catch (error) {
            console.error('Error getting facilitator stats:', error);
            throw error;
        }
    }
    /**
   * Get tenants for facilitator's assigned properties
   */ async getFacilitatorTenants(facilitatorId) {
        try {
            const tenants = await this.db.select({
                id: _schema.users.id,
                firstName: _schema.users.firstName,
                lastName: _schema.users.lastName,
                email: _schema.users.email,
                phoneNumber: _schema.users.phoneNumber,
                propertyName: _schema.properties.name,
                propertyId: _schema.properties.id,
                unitNumber: _schema.units.unitNumber,
                rentAmount: _schema.leases.monthlyRent,
                leaseStartDate: _schema.leases.startDate,
                leaseEndDate: _schema.leases.endDate,
                leaseStatus: _schema.leases.status
            }).from(_schema.leases).innerJoin(_schema.users, (0, _drizzleorm.eq)(_schema.users.id, _schema.leases.tenantId)).innerJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.properties.id, _schema.leases.propertyId)).innerJoin(_schema.units, (0, _drizzleorm.eq)(_schema.units.id, _schema.leases.unitId)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId), (0, _drizzleorm.eq)(_schema.leases.status, 'active'))).orderBy((0, _drizzleorm.desc)(_schema.leases.createdAt));
            // Add payment status (this would need to be calculated based on payment records)
            const tenantsWithStatus = tenants.map((tenant)=>({
                    ...tenant,
                    status: 'paid'
                }));
            return tenantsWithStatus;
        } catch (error) {
            console.error('Error getting facilitator tenants:', error);
            throw error;
        }
    }
    /**
   * Get property details for facilitator (only if assigned to them)
   */ async getFacilitatorPropertyById(propertyId, facilitatorId) {
        try {
            const [property] = await this.db.select({
                id: _schema.properties.id,
                name: _schema.properties.name,
                address: _schema.properties.address,
                city: _schema.properties.city,
                state: _schema.properties.state,
                country: _schema.properties.country,
                propertyType: _schema.properties.propertyType,
                totalUnits: _schema.properties.totalUnits,
                description: _schema.properties.description,
                landlordId: _schema.properties.landlordId,
                facilitatorId: _schema.properties.facilitatorId,
                createdAt: _schema.properties.createdAt,
                updatedAt: _schema.properties.updatedAt,
                landlord: {
                    id: _schema.users.id,
                    firstName: _schema.users.firstName,
                    lastName: _schema.users.lastName,
                    email: _schema.users.email,
                    phoneNumber: _schema.users.phoneNumber
                }
            }).from(_schema.properties).leftJoin(_schema.users, (0, _drizzleorm.eq)(_schema.properties.landlordId, _schema.users.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.id, propertyId), (0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId))).limit(1);
            if (!property) {
                throw new _common.NotFoundException('Property not found or not assigned to you');
            }
            return property;
        } catch (error) {
            console.error('Error getting facilitator property:', error);
            throw error;
        }
    }
    /**
   * Get units for facilitator property
   */ async getFacilitatorPropertyUnits(propertyId, facilitatorId) {
        try {
            // First verify the property is assigned to this facilitator
            const [property] = await this.db.select().from(_schema.properties).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.id, propertyId), (0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId))).limit(1);
            if (!property) {
                throw new _common.NotFoundException('Property not found or not assigned to you');
            }
            // Query units with active lease information
            const unitsData = await this.db.select({
                id: _schema.units.id,
                unitNumber: _schema.units.unitNumber,
                rent: _schema.units.rent,
                tenantId: _schema.leases.tenantId,
                tenantFirstName: _schema.users.firstName,
                tenantLastName: _schema.users.lastName
            }).from(_schema.units).leftJoin(_schema.leases, (0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.units.id, _schema.leases.unitId), (0, _drizzleorm.eq)(_schema.leases.status, 'active'))).leftJoin(_schema.users, (0, _drizzleorm.eq)(_schema.leases.tenantId, _schema.users.id)).where((0, _drizzleorm.eq)(_schema.units.propertyId, propertyId)).orderBy(_schema.units.unitNumber);
            return unitsData.map((unit)=>({
                    id: unit.id,
                    unitNumber: unit.unitNumber,
                    status: unit.tenantId ? 'occupied' : 'vacant',
                    rentAmount: Number(unit.rent),
                    tenantId: unit.tenantId,
                    tenantName: unit.tenantFirstName && unit.tenantLastName ? `${unit.tenantFirstName} ${unit.tenantLastName}` : null,
                    propertyId
                }));
        } catch (error) {
            console.error('Error getting facilitator property units:', error);
            throw error;
        }
    }
    /**
   * Get tenants for facilitator property
   */ async getFacilitatorPropertyTenants(propertyId, facilitatorId) {
        try {
            // First verify the property is assigned to this facilitator
            const [property] = await this.db.select().from(_schema.properties).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.id, propertyId), (0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId))).limit(1);
            if (!property) {
                throw new _common.NotFoundException('Property not found or not assigned to you');
            }
            // Query tenants with active leases
            const tenantsData = await this.db.select({
                id: _schema.users.id,
                firstName: _schema.users.firstName,
                lastName: _schema.users.lastName,
                email: _schema.users.email,
                phoneNumber: _schema.users.phoneNumber,
                unitNumber: _schema.units.unitNumber,
                monthlyRent: _schema.leases.monthlyRent,
                leaseEndDate: _schema.leases.endDate
            }).from(_schema.leases).innerJoin(_schema.users, (0, _drizzleorm.eq)(_schema.leases.tenantId, _schema.users.id)).innerJoin(_schema.units, (0, _drizzleorm.eq)(_schema.leases.unitId, _schema.units.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.leases.propertyId, propertyId), (0, _drizzleorm.eq)(_schema.leases.status, 'active'))).orderBy(_schema.units.unitNumber);
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
            console.error('Error getting facilitator property tenants:', error);
            throw error;
        }
    }
    /**
   * Get all maintenance requests for facilitator's assigned properties
   */ async getFacilitatorMaintenanceRequests(facilitatorId) {
        try {
            // Get all properties assigned to this facilitator
            const facilitatorProperties = await this.db.select({
                id: _schema.properties.id
            }).from(_schema.properties).where((0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId));
            if (facilitatorProperties.length === 0) {
                return [];
            }
            const propertyIds = facilitatorProperties.map((p)=>p.id);
            // Query maintenance requests for facilitator's properties
            const maintenanceData = await this.db.select({
                id: _schema.maintenanceRequests.id,
                title: _schema.maintenanceRequests.title,
                description: _schema.maintenanceRequests.description,
                status: _schema.maintenanceRequests.status,
                priority: _schema.maintenanceRequests.priority,
                images: _schema.maintenanceRequests.images,
                createdAt: _schema.maintenanceRequests.createdAt,
                completedAt: _schema.maintenanceRequests.completedAt,
                propertyName: _schema.properties.name,
                tenantFirstName: (0, _drizzleorm.sql)`tenant.first_name`,
                tenantLastName: (0, _drizzleorm.sql)`tenant.last_name`,
                unitNumber: (0, _drizzleorm.sql)`unit.unit_number`
            }).from(_schema.maintenanceRequests).innerJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.maintenanceRequests.propertyId, _schema.properties.id)).leftJoin((0, _drizzleorm.sql)`users AS tenant`, (0, _drizzleorm.sql)`${_schema.maintenanceRequests.tenantId} = tenant.id`).leftJoin((0, _drizzleorm.sql)`leases AS active_lease`, (0, _drizzleorm.sql)`active_lease.tenant_id = tenant.id AND active_lease.property_id = ${_schema.maintenanceRequests.propertyId} AND active_lease.status = 'active'`).leftJoin((0, _drizzleorm.sql)`units AS unit`, (0, _drizzleorm.sql)`active_lease.unit_id = unit.id`).where((0, _drizzleorm.sql)`${_schema.maintenanceRequests.propertyId} IN (${_drizzleorm.sql.join(propertyIds.map((id)=>(0, _drizzleorm.sql)`${id}`), (0, _drizzleorm.sql)`, `)})`).orderBy((0, _drizzleorm.sql)`${_schema.maintenanceRequests.createdAt} DESC`);
            return maintenanceData.map((request)=>({
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
                    completedAt: request.completedAt
                }));
        } catch (error) {
            console.error('Error getting facilitator maintenance requests:', error);
            return [];
        }
    }
    /**
   * Get maintenance requests for facilitator property
   */ async getFacilitatorPropertyMaintenance(propertyId, facilitatorId) {
        try {
            // First verify the property is assigned to this facilitator
            const [property] = await this.db.select().from(_schema.properties).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.id, propertyId), (0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId))).limit(1);
            if (!property) {
                throw new _common.NotFoundException('Property not found or not assigned to you');
            }
            // Query maintenance requests with tenant and unit info
            const maintenanceData = await this.db.select({
                id: _schema.maintenanceRequests.id,
                title: _schema.maintenanceRequests.title,
                description: _schema.maintenanceRequests.description,
                status: _schema.maintenanceRequests.status,
                priority: _schema.maintenanceRequests.priority,
                createdAt: _schema.maintenanceRequests.createdAt,
                completedAt: _schema.maintenanceRequests.completedAt,
                tenantFirstName: (0, _drizzleorm.sql)`tenant.first_name`,
                tenantLastName: (0, _drizzleorm.sql)`tenant.last_name`,
                unitNumber: (0, _drizzleorm.sql)`unit.unit_number`,
                assignedToFirstName: (0, _drizzleorm.sql)`assigned_admin.first_name`,
                assignedToLastName: (0, _drizzleorm.sql)`assigned_admin.last_name`
            }).from(_schema.maintenanceRequests).leftJoin((0, _drizzleorm.sql)`users AS tenant`, (0, _drizzleorm.sql)`${_schema.maintenanceRequests.tenantId} = tenant.id`).leftJoin((0, _drizzleorm.sql)`leases AS active_lease`, (0, _drizzleorm.sql)`active_lease.tenant_id = tenant.id AND active_lease.property_id = ${propertyId} AND active_lease.status = 'active'`).leftJoin((0, _drizzleorm.sql)`units AS unit`, (0, _drizzleorm.sql)`active_lease.unit_id = unit.id`).leftJoin((0, _drizzleorm.sql)`users AS assigned_admin`, (0, _drizzleorm.sql)`${_schema.maintenanceRequests.assignedTo} = assigned_admin.id`).where((0, _drizzleorm.eq)(_schema.maintenanceRequests.propertyId, propertyId)).orderBy((0, _drizzleorm.sql)`${_schema.maintenanceRequests.createdAt} DESC`);
            return maintenanceData.map((request)=>({
                    id: request.id,
                    issue: request.title,
                    description: request.description,
                    status: request.status,
                    priority: request.priority || 'medium',
                    tenant: request.tenantFirstName && request.tenantLastName ? `${request.tenantFirstName} ${request.tenantLastName}` : 'Unknown',
                    unit: request.unitNumber || 'N/A',
                    assignedAdmin: request.assignedToFirstName && request.assignedToLastName ? `${request.assignedToFirstName} ${request.assignedToLastName}` : 'Unassigned',
                    createdAt: request.createdAt,
                    resolvedAt: request.status === 'completed' ? request.completedAt : null
                }));
        } catch (error) {
            console.error('Error getting facilitator property maintenance:', error);
            return [];
        }
    }
    /**
   * Get payments for facilitator property
   */ async getFacilitatorPropertyPayments(propertyId, facilitatorId) {
        try {
            // First verify the property is assigned to this facilitator
            const [property] = await this.db.select().from(_schema.properties).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.id, propertyId), (0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId))).limit(1);
            if (!property) {
                throw new _common.NotFoundException('Property not found or not assigned to you');
            }
            // Query payments with tenant and unit info
            const paymentsData = await this.db.select({
                id: _schema.payments.id,
                amount: _schema.payments.amount,
                amountPaid: _schema.payments.amountPaid,
                dueDate: _schema.payments.dueDate,
                paidDate: _schema.payments.paidDate,
                status: _schema.payments.status,
                tenantFirstName: (0, _drizzleorm.sql)`tenant.first_name`,
                tenantLastName: (0, _drizzleorm.sql)`tenant.last_name`,
                unitNumber: _schema.units.unitNumber
            }).from(_schema.payments).innerJoin((0, _drizzleorm.sql)`users AS tenant`, (0, _drizzleorm.sql)`${_schema.payments.tenantId} = tenant.id`).innerJoin(_schema.units, (0, _drizzleorm.eq)(_schema.payments.unitId, _schema.units.id)).where((0, _drizzleorm.eq)(_schema.payments.propertyId, propertyId)).orderBy((0, _drizzleorm.sql)`${_schema.payments.dueDate} DESC`);
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
            console.error('Error getting facilitator property payments:', error);
            return [];
        }
    }
    /**
   * Get facilitator for a specific property
   */ async getPropertyFacilitator(propertyId) {
        try {
            const [propertyWithFacilitator] = await this.db.select({
                facilitatorId: _schema.properties.facilitatorId,
                facilitatorFirstName: _schema.users.firstName,
                facilitatorLastName: _schema.users.lastName,
                facilitatorEmail: _schema.users.email,
                facilitatorPhone: _schema.users.phoneNumber
            }).from(_schema.properties).leftJoin(_schema.users, (0, _drizzleorm.eq)(_schema.users.id, _schema.properties.facilitatorId)).where((0, _drizzleorm.eq)(_schema.properties.id, propertyId));
            if (!propertyWithFacilitator) {
                throw new _common.NotFoundException('Property not found');
            }
            return propertyWithFacilitator.facilitatorId ? {
                id: propertyWithFacilitator.facilitatorId,
                firstName: propertyWithFacilitator.facilitatorFirstName,
                lastName: propertyWithFacilitator.facilitatorLastName,
                email: propertyWithFacilitator.facilitatorEmail,
                phoneNumber: propertyWithFacilitator.facilitatorPhone
            } : null;
        } catch (error) {
            console.error('Error getting property facilitator:', error);
            throw error;
        }
    }
    /**
   * Update facilitator status (activate/deactivate)
   */ async updateFacilitatorStatus(facilitatorId, isActive, adminId) {
        try {
            // Verify admin role
            const [admin] = await this.db.select().from(_schema.users).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.users.id, adminId), (0, _drizzleorm.eq)(_schema.users.role, 'admin')));
            if (!admin) {
                throw new _common.ForbiddenException('Only admins can update facilitator status');
            }
            // Update facilitator status
            const [updatedFacilitator] = await this.db.update(_schema.users).set({
                isActive,
                updatedAt: new Date()
            }).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.users.id, facilitatorId), (0, _drizzleorm.eq)(_schema.users.role, 'facilitator'))).returning();
            if (!updatedFacilitator) {
                throw new _common.NotFoundException('Facilitator not found');
            }
            // If deactivating, remove from all assigned properties
            if (!isActive) {
                await this.db.update(_schema.properties).set({
                    facilitatorId: null,
                    updatedAt: new Date()
                }).where((0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId));
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
   */ async addMaintenanceComment(facilitatorId, maintenanceId, commentText) {
        try {
            // Get the maintenance request and verify facilitator has access
            const [request] = await this.db.select({
                id: _schema.maintenanceRequests.id,
                propertyId: _schema.maintenanceRequests.propertyId,
                comments: _schema.maintenanceRequests.comments
            }).from(_schema.maintenanceRequests).innerJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.maintenanceRequests.propertyId, _schema.properties.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.maintenanceRequests.id, maintenanceId), (0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId)));
            if (!request) {
                throw new _common.NotFoundException('Maintenance request not found or access denied');
            }
            // Get facilitator info
            const [facilitator] = await this.db.select({
                firstName: _schema.users.firstName,
                lastName: _schema.users.lastName
            }).from(_schema.users).where((0, _drizzleorm.eq)(_schema.users.id, facilitatorId));
            // Create new comment
            const newComment = {
                id: _crypto.randomUUID(),
                authorId: facilitatorId,
                authorName: `${facilitator.firstName} ${facilitator.lastName}`,
                authorRole: 'facilitator',
                text: commentText,
                createdAt: new Date().toISOString()
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
            const updatedComments = [
                ...existingComments,
                newComment
            ];
            // Update the maintenance request with new comment
            await this.db.update(_schema.maintenanceRequests).set({
                comments: JSON.stringify(updatedComments)
            }).where((0, _drizzleorm.eq)(_schema.maintenanceRequests.id, maintenanceId));
            console.log('✅ Facilitator comment added successfully:', newComment.id);
            return newComment;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    }
    /**
   * Get maintenance request details (Facilitator)
   */ async getMaintenanceRequestDetails(facilitatorId, maintenanceId) {
        try {
            const [request] = await this.db.select({
                id: _schema.maintenanceRequests.id,
                title: _schema.maintenanceRequests.title,
                description: _schema.maintenanceRequests.description,
                status: _schema.maintenanceRequests.status,
                priority: _schema.maintenanceRequests.priority,
                images: _schema.maintenanceRequests.images,
                comments: _schema.maintenanceRequests.comments,
                createdAt: _schema.maintenanceRequests.createdAt,
                completedAt: _schema.maintenanceRequests.completedAt,
                propertyId: _schema.properties.id,
                propertyName: _schema.properties.name,
                unitNumber: (0, _drizzleorm.sql)`unit.unit_number`,
                reporterFirstName: (0, _drizzleorm.sql)`reporter.first_name`,
                reporterLastName: (0, _drizzleorm.sql)`reporter.last_name`,
                reporterRole: (0, _drizzleorm.sql)`reporter.role`
            }).from(_schema.maintenanceRequests).innerJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.maintenanceRequests.propertyId, _schema.properties.id)).leftJoin((0, _drizzleorm.sql)`units AS unit`, (0, _drizzleorm.sql)`unit.id = ${_schema.maintenanceRequests.unitId}`).leftJoin((0, _drizzleorm.sql)`users AS reporter`, (0, _drizzleorm.sql)`${_schema.maintenanceRequests.tenantId} = reporter.id`).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.maintenanceRequests.id, maintenanceId), (0, _drizzleorm.eq)(_schema.properties.facilitatorId, facilitatorId)));
            if (!request) {
                throw new _common.NotFoundException('Maintenance request not found or access denied');
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
                reportedBy: request.reporterRole === 'landlord' ? `${request.reporterFirstName} ${request.reporterLastName} (Landlord)` : request.reporterRole === 'tenant' ? `${request.reporterFirstName} ${request.reporterLastName} (Tenant)` : 'Unknown',
                reporterType: request.reporterRole,
                hasFacilitator: true,
                assignedFacilitator: 'You'
            };
        } catch (error) {
            console.error('Error getting maintenance request details:', error);
            throw error;
        }
    }
    constructor(db){
        this.db = db;
    }
};
FacilitatorsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], FacilitatorsService);

//# sourceMappingURL=facilitators.service.js.map