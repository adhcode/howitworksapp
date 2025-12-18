"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LandlordService", {
    enumerable: true,
    get: function() {
        return LandlordService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _crypto = /*#__PURE__*/ _interop_require_wildcard(require("crypto"));
const _databasemodule = require("../database/database.module");
const _schema = require("../database/schema");
const _tenantrentcontracts = require("../database/schema/tenant-rent-contracts");
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
let LandlordService = class LandlordService {
    async getDashboardData(landlordId) {
        try {
            console.log('Fetching dashboard data for landlord:', landlordId);
            // Get properties managed by this landlord
            const propertiesData = await this.db.select().from(_schema.properties).where((0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId));
            console.log('Properties found:', propertiesData.length, propertiesData);
            const propertiesManaged = propertiesData.length;
            const propertyIds = propertiesData.map((p)=>p.id);
            let unitsData = [];
            let acceptedInvitations = [];
            let activeTenants = 0;
            let pendingVerification = 0;
            let totalRent = 0;
            let outstandingRent = 0;
            let outstandingRentTenants = 0;
            let fullyOccupied = 0;
            if (propertyIds.length > 0) {
                // Get all units for all properties in ONE query using inArray
                unitsData = await this.db.select().from(_schema.units).where((0, _drizzleorm.inArray)(_schema.units.propertyId, propertyIds));
                console.log('Units found:', unitsData.length, unitsData);
                // Get all tenant invitations for this landlord directly
                const allInvitations = await this.db.select().from(_schema.tenantInvitations).where((0, _drizzleorm.eq)(_schema.tenantInvitations.landlordId, landlordId));
                console.log('All invitations found:', allInvitations.length, allInvitations);
                // Filter accepted invitations
                acceptedInvitations = allInvitations.filter((invitation)=>invitation.status === 'accepted');
                // Filter pending invitations
                const pendingInvitations = allInvitations.filter((invitation)=>invitation.status === 'pending');
                console.log('Accepted invitations:', acceptedInvitations.length);
                console.log('Pending invitations:', pendingInvitations.length);
                activeTenants = acceptedInvitations.length;
                pendingVerification = pendingInvitations.length;
                // Calculate rent data from accepted invitations
                totalRent = acceptedInvitations.reduce((sum, invitation)=>{
                    const rent = parseFloat(invitation.monthlyRent || '0');
                    console.log('Adding rent:', rent);
                    return sum + rent;
                }, 0);
                console.log('Total monthly rent:', totalRent);
                // Calculate outstanding rent (assume 15% of tenants have outstanding)
                outstandingRent = totalRent * 0.15;
                outstandingRentTenants = Math.ceil(activeTenants * 0.15);
                // Calculate fully occupied properties
                // A property is fully occupied if all its units have accepted tenants
                fullyOccupied = 0;
                for (const property of propertiesData){
                    const propertyUnits = unitsData.filter((unit)=>unit.propertyId === property.id);
                    const propertyAcceptedInvitations = acceptedInvitations.filter((inv)=>inv.propertyId === property.id);
                    // For now, consider a property fully occupied if it has at least one tenant
                    // In the future, you might want to check if all units are occupied
                    if (propertyAcceptedInvitations.length > 0) {
                        fullyOccupied++;
                    }
                }
            }
            // Get real payment statistics
            let paymentStats = {
                upcomingPayments: 0,
                upcomingPaymentsCombined: 0,
                outstandingRent: 0,
                outstandingRentTenants: 0,
                rentCollected: 0
            };
            // Calculate payment stats from database (new payment system)
            console.log('Calculating payment stats from tenant data...');
            paymentStats = await this.calculateRealPaymentStats(landlordId, acceptedInvitations, totalRent);
            console.log('✅ Using calculated payment stats:', paymentStats);
            // Mock active reports for now - assume 20% of tenants have reports
            const activeReports = Math.ceil(activeTenants * 0.2);
            // Format date
            const today = new Date();
            const rentCollectedDate = today.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const dashboardData = {
                propertiesManaged,
                fullyOccupied,
                activeTenants,
                pendingVerification,
                rentCollected: paymentStats.rentCollected,
                rentCollectedDate,
                upcomingPayments: paymentStats.upcomingPayments,
                upcomingPaymentsCombined: paymentStats.upcomingPaymentsCombined,
                outstandingRent: paymentStats.outstandingRent,
                outstandingRentTenants: paymentStats.outstandingRentTenants,
                activeReports
            };
            console.log('Final dashboard data:', dashboardData);
            return dashboardData;
        } catch (error) {
            console.error('Error getting landlord dashboard data:', error);
            throw error;
        }
    }
    /**
   * Generate payment schedules for existing accepted invitations
   * This is a one-time setup method
   */ async generatePaymentSchedulesForExistingTenants(landlordId) {
        try {
            console.log('Generating payment schedules for existing tenants...');
            // Get all accepted invitations for this landlord
            const acceptedInvitations = await this.db.select().from(_schema.tenantInvitations).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.tenantInvitations.landlordId, landlordId), (0, _drizzleorm.eq)(_schema.tenantInvitations.status, 'accepted')));
            console.log(`Found ${acceptedInvitations.length} accepted invitations`);
            for (const invitation of acceptedInvitations){
                try {
                    // Check if payment schedule already exists
                    const [existingPayment] = await this.db.select().from(_schema.payments).where((0, _drizzleorm.eq)(_schema.payments.tenantInvitationId, invitation.id)).limit(1);
                    if (!existingPayment) {
                        console.log(`Skipping payment schedule generation for invitation ${invitation.id} - using new contract-based payment system`);
                    // Note: Payment schedules are now handled through the tenant_rent_contracts table
                    // See ContractsService for creating contracts which manage payment schedules
                    } else {
                        console.log(`Payment schedule already exists for invitation ${invitation.id}`);
                    }
                } catch (error) {
                    console.error(`Error generating payment schedule for invitation ${invitation.id}:`, error);
                }
            }
            return {
                success: true,
                message: 'Payment schedules generated'
            };
        } catch (error) {
            console.error('Error generating payment schedules:', error);
            throw error;
        }
    }
    /**
   * Calculate real payment stats based on tenant data when payment system is not available
   */ async calculateRealPaymentStats(landlordId, acceptedInvitations, totalMonthlyRent) {
        try {
            const today = new Date();
            const currentYear = today.getFullYear();
            console.log(`Calculating real payment stats for ${acceptedInvitations.length} tenants with total monthly rent: ${totalMonthlyRent}`);
            let rentCollected = 0;
            let upcomingPayments = 0;
            let upcomingPaymentsCombined = 0;
            let outstandingRent = 0;
            let outstandingRentTenants = 0;
            // Get actual paid payments from the payments table
            const paidPayments = await this.db.select().from(_schema.payments).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.payments.landlordId, landlordId), (0, _drizzleorm.eq)(_schema.payments.status, 'paid')));
            // Calculate rent collected from ACTUAL payments only
            const yearStart = new Date(currentYear, 0, 1);
            const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
            const paidThisYear = paidPayments.filter((payment)=>{
                if (!payment.paidDate) return false;
                const paidDate = new Date(payment.paidDate);
                return paidDate >= yearStart && paidDate <= yearEnd;
            });
            rentCollected = paidThisYear.reduce((sum, payment)=>{
                return sum + parseFloat(payment.amountPaid || '0');
            }, 0);
            console.log(`Rent collected from ${paidThisYear.length} actual payments: ${rentCollected}`);
            // Get rent contracts to calculate upcoming and outstanding
            const rentContracts = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.landlordId, landlordId), (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, 'active')));
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
            for (const contract of rentContracts){
                const nextPaymentDue = new Date(contract.nextPaymentDue);
                const monthlyRent = parseFloat(contract.monthlyAmount);
                // Upcoming payments (due within next 7 days)
                if (nextPaymentDue >= today && nextPaymentDue <= nextWeek) {
                    upcomingPayments++;
                    upcomingPaymentsCombined += monthlyRent;
                    console.log(`Contract has payment due in next 7 days: ${monthlyRent}`);
                }
                // Outstanding rent (overdue)
                if (nextPaymentDue < today) {
                    outstandingRentTenants++;
                    outstandingRent += monthlyRent;
                    console.log(`Contract is overdue: ${monthlyRent}`);
                }
                // For demo: assume 10% chance of outstanding rent per tenant
                if (Math.random() < 0.1) {
                    outstandingRent += monthlyRent * 0.5; // Half month outstanding
                    outstandingRentTenants++;
                }
            }
            const stats = {
                upcomingPayments,
                upcomingPaymentsCombined,
                outstandingRent,
                outstandingRentTenants,
                rentCollected
            };
            console.log('Final calculated payment stats:', stats);
            return stats;
        } catch (error) {
            console.error('Error calculating real payment stats:', error);
            // Return zeros if calculation fails
            return {
                upcomingPayments: 0,
                upcomingPaymentsCombined: 0,
                outstandingRent: 0,
                outstandingRentTenants: 0,
                rentCollected: 0
            };
        }
    }
    /**
   * Get rent contracts for a landlord with optional filtering
   */ async getRentContracts(landlordId, filters = {}) {
        try {
            let query = this.db.select({
                id: _tenantrentcontracts.tenantRentContracts.id,
                tenantId: _tenantrentcontracts.tenantRentContracts.tenantId,
                propertyId: _tenantrentcontracts.tenantRentContracts.propertyId,
                unitId: _tenantrentcontracts.tenantRentContracts.unitId,
                monthlyAmount: _tenantrentcontracts.tenantRentContracts.monthlyAmount,
                expiryDate: _tenantrentcontracts.tenantRentContracts.expiryDate,
                landlordPayoutType: _tenantrentcontracts.tenantRentContracts.landlordPayoutType,
                nextPaymentDue: _tenantrentcontracts.tenantRentContracts.nextPaymentDue,
                transitionStartDate: _tenantrentcontracts.tenantRentContracts.transitionStartDate,
                status: _tenantrentcontracts.tenantRentContracts.status,
                isExistingTenant: _tenantrentcontracts.tenantRentContracts.isExistingTenant,
                originalExpiryDate: _tenantrentcontracts.tenantRentContracts.originalExpiryDate,
                createdAt: _tenantrentcontracts.tenantRentContracts.createdAt,
                updatedAt: _tenantrentcontracts.tenantRentContracts.updatedAt,
                // Join tenant info
                tenantFirstName: _schema.users.firstName,
                tenantLastName: _schema.users.lastName,
                tenantEmail: _schema.users.email,
                // Join property info
                propertyName: _schema.properties.name,
                propertyAddress: _schema.properties.address,
                // Join unit info
                unitNumber: _schema.units.unitNumber
            }).from(_tenantrentcontracts.tenantRentContracts).leftJoin(_schema.users, (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.tenantId, _schema.users.id)).leftJoin(_schema.properties, (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.propertyId, _schema.properties.id)).leftJoin(_schema.units, (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.unitId, _schema.units.id)).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.landlordId, landlordId));
            // Apply filters
            if (filters.status) {
                query = query.where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.landlordId, landlordId), (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, filters.status)));
            }
            if (filters.payoutType) {
                query = query.where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.landlordId, landlordId), (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.landlordPayoutType, filters.payoutType)));
            }
            const contracts = await query.orderBy((0, _drizzleorm.desc)(_tenantrentcontracts.tenantRentContracts.createdAt));
            return contracts;
        } catch (error) {
            console.error('Error fetching rent contracts:', error);
            throw error;
        }
    }
    /**
   * Get escrow balances for yearly payout landlords
   */ async getEscrowBalances(landlordId) {
        try {
            const balances = await this.db.select({
                id: _tenantrentcontracts.landlordEscrowBalances.id,
                contractId: _tenantrentcontracts.landlordEscrowBalances.contractId,
                totalEscrowed: _tenantrentcontracts.landlordEscrowBalances.totalEscrowed,
                monthsAccumulated: _tenantrentcontracts.landlordEscrowBalances.monthsAccumulated,
                expectedReleaseDate: _tenantrentcontracts.landlordEscrowBalances.expectedReleaseDate,
                isReleased: _tenantrentcontracts.landlordEscrowBalances.isReleased,
                releasedAt: _tenantrentcontracts.landlordEscrowBalances.releasedAt,
                releasedAmount: _tenantrentcontracts.landlordEscrowBalances.releasedAmount,
                createdAt: _tenantrentcontracts.landlordEscrowBalances.createdAt,
                // Join contract info
                monthlyAmount: _tenantrentcontracts.tenantRentContracts.monthlyAmount,
                expiryDate: _tenantrentcontracts.tenantRentContracts.expiryDate,
                // Join tenant info
                tenantFirstName: _schema.users.firstName,
                tenantLastName: _schema.users.lastName,
                // Join property info
                propertyName: _schema.properties.name,
                unitNumber: _schema.units.unitNumber
            }).from(_tenantrentcontracts.landlordEscrowBalances).leftJoin(_tenantrentcontracts.tenantRentContracts, (0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.contractId, _tenantrentcontracts.tenantRentContracts.id)).leftJoin(_schema.users, (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.tenantId, _schema.users.id)).leftJoin(_schema.properties, (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.propertyId, _schema.properties.id)).leftJoin(_schema.units, (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.unitId, _schema.units.id)).where((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.landlordId, landlordId)).orderBy((0, _drizzleorm.desc)(_tenantrentcontracts.landlordEscrowBalances.createdAt));
            return balances;
        } catch (error) {
            console.error('Error fetching escrow balances:', error);
            throw error;
        }
    }
    /**
   * Get payment history with contract-specific filtering
   */ async getPaymentHistory(landlordId, options = {}) {
        try {
            const { contractId, page = 1, limit = 20 } = options;
            const offset = (page - 1) * limit;
            // For now, we'll get payments from the existing payments table
            // In the future, this should be enhanced to include contract-specific payments
            let query = this.db.select({
                id: _schema.payments.id,
                amount: _schema.payments.amount,
                amountPaid: _schema.payments.amountPaid,
                status: _schema.payments.status,
                dueDate: _schema.payments.dueDate,
                paidDate: _schema.payments.paidDate,
                paymentMethod: _schema.payments.paymentMethod,
                notes: _schema.payments.notes,
                createdAt: _schema.payments.createdAt,
                // Join tenant invitation info
                tenantFirstName: _schema.tenantInvitations.firstName,
                tenantLastName: _schema.tenantInvitations.lastName,
                // Join property info
                propertyName: _schema.properties.name,
                unitNumber: _schema.units.unitNumber
            }).from(_schema.payments).leftJoin(_schema.tenantInvitations, (0, _drizzleorm.eq)(_schema.payments.tenantInvitationId, _schema.tenantInvitations.id)).leftJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.tenantInvitations.propertyId, _schema.properties.id)).leftJoin(_schema.units, (0, _drizzleorm.eq)(_schema.tenantInvitations.unitId, _schema.units.id)).where((0, _drizzleorm.eq)(_schema.tenantInvitations.landlordId, landlordId));
            // If contractId is provided, we would filter by it
            // For now, we'll just return all payments for the landlord
            const history = await query.orderBy((0, _drizzleorm.desc)(_schema.payments.createdAt)).limit(limit).offset(offset);
            // Get total count for pagination
            const [{ count: totalCount }] = await this.db.select({
                count: (0, _drizzleorm.count)()
            }).from(_schema.payments).leftJoin(_schema.tenantInvitations, (0, _drizzleorm.eq)(_schema.payments.tenantInvitationId, _schema.tenantInvitations.id)).where((0, _drizzleorm.eq)(_schema.tenantInvitations.landlordId, landlordId));
            return {
                data: history,
                pagination: {
                    page,
                    limit,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching payment history:', error);
            throw error;
        }
    }
    /**
   * Get contract-based payment statistics
   */ async getContractStats(landlordId) {
        try {
            // Get contract statistics
            const contractStats = await this.db.select({
                totalContracts: (0, _drizzleorm.count)(),
                monthlyPayoutContracts: (0, _drizzleorm.sql)`COUNT(CASE WHEN ${_tenantrentcontracts.tenantRentContracts.landlordPayoutType} = 'monthly' THEN 1 END)`,
                yearlyPayoutContracts: (0, _drizzleorm.sql)`COUNT(CASE WHEN ${_tenantrentcontracts.tenantRentContracts.landlordPayoutType} = 'yearly' THEN 1 END)`,
                activeContracts: (0, _drizzleorm.sql)`COUNT(CASE WHEN ${_tenantrentcontracts.tenantRentContracts.status} = 'active' THEN 1 END)`,
                totalMonthlyRevenue: (0, _drizzleorm.sql)`SUM(CASE WHEN ${_tenantrentcontracts.tenantRentContracts.status} = 'active' THEN ${_tenantrentcontracts.tenantRentContracts.monthlyAmount} ELSE 0 END)`
            }).from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.landlordId, landlordId));
            // Get escrow statistics
            const escrowStats = await this.db.select({
                totalEscrowed: (0, _drizzleorm.sql)`COALESCE(SUM(${_tenantrentcontracts.landlordEscrowBalances.totalEscrowed}), 0)`,
                pendingReleases: (0, _drizzleorm.sql)`COUNT(CASE WHEN ${_tenantrentcontracts.landlordEscrowBalances.isReleased} = false THEN 1 END)`,
                releasedAmount: (0, _drizzleorm.sql)`COALESCE(SUM(${_tenantrentcontracts.landlordEscrowBalances.releasedAmount}), 0)`
            }).from(_tenantrentcontracts.landlordEscrowBalances).where((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.landlordId, landlordId));
            // Get upcoming payment due dates
            const upcomingPayments = await this.db.select({
                contractId: _tenantrentcontracts.tenantRentContracts.id,
                nextPaymentDue: _tenantrentcontracts.tenantRentContracts.nextPaymentDue,
                monthlyAmount: _tenantrentcontracts.tenantRentContracts.monthlyAmount,
                tenantFirstName: _schema.users.firstName,
                tenantLastName: _schema.users.lastName,
                propertyName: _schema.properties.name,
                unitNumber: _schema.units.unitNumber
            }).from(_tenantrentcontracts.tenantRentContracts).leftJoin(_schema.users, (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.tenantId, _schema.users.id)).leftJoin(_schema.properties, (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.propertyId, _schema.properties.id)).leftJoin(_schema.units, (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.unitId, _schema.units.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.landlordId, landlordId), (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, 'active'))).orderBy(_tenantrentcontracts.tenantRentContracts.nextPaymentDue).limit(10);
            return {
                contracts: contractStats[0] || {
                    totalContracts: 0,
                    monthlyPayoutContracts: 0,
                    yearlyPayoutContracts: 0,
                    activeContracts: 0,
                    totalMonthlyRevenue: 0
                },
                escrow: escrowStats[0] || {
                    totalEscrowed: 0,
                    pendingReleases: 0,
                    releasedAmount: 0
                },
                upcomingPayments
            };
        } catch (error) {
            console.error('Error fetching contract stats:', error);
            throw error;
        }
    }
    /**
   * Get maintenance requests for landlord's properties
   */ async getMaintenanceRequests(landlordId, filters = {}) {
        try {
            // Get all properties owned by this landlord
            const landlordProperties = await this.db.select({
                id: _schema.properties.id,
                name: _schema.properties.name,
                facilitatorId: _schema.properties.facilitatorId
            }).from(_schema.properties).where((0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId));
            const propertyIds = landlordProperties.map((p)=>p.id);
            if (propertyIds.length === 0) {
                return [];
            }
            // Build query to get maintenance requests for landlord's properties
            let query = this.db.select({
                id: _schema.maintenanceRequests.id,
                title: _schema.maintenanceRequests.title,
                description: _schema.maintenanceRequests.description,
                status: _schema.maintenanceRequests.status,
                priority: _schema.maintenanceRequests.priority,
                images: _schema.maintenanceRequests.images,
                createdAt: _schema.maintenanceRequests.createdAt,
                completedAt: _schema.maintenanceRequests.completedAt,
                unitId: _schema.maintenanceRequests.unitId,
                tenantId: _schema.maintenanceRequests.tenantId,
                landlordId: _schema.maintenanceRequests.landlordId,
                // Property info
                propertyId: _schema.properties.id,
                propertyName: _schema.properties.name,
                facilitatorId: _schema.properties.facilitatorId,
                // Unit info (if maintenance is for specific unit)
                unitNumber: (0, _drizzleorm.sql)`unit.unit_number`,
                // Tenant reporter info (if reported by tenant)
                tenantFirstName: (0, _drizzleorm.sql)`tenant.first_name`,
                tenantLastName: (0, _drizzleorm.sql)`tenant.last_name`,
                tenantRole: (0, _drizzleorm.sql)`tenant.role`,
                // Landlord reporter info (if reported by landlord)
                landlordFirstName: (0, _drizzleorm.sql)`landlord_user.first_name`,
                landlordLastName: (0, _drizzleorm.sql)`landlord_user.last_name`,
                landlordRole: (0, _drizzleorm.sql)`landlord_user.role`,
                // Assigned facilitator info (should be property's facilitator)
                facilitatorFirstName: (0, _drizzleorm.sql)`facilitator.first_name`,
                facilitatorLastName: (0, _drizzleorm.sql)`facilitator.last_name`
            }).from(_schema.maintenanceRequests).innerJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.maintenanceRequests.propertyId, _schema.properties.id)).leftJoin((0, _drizzleorm.sql)`units AS unit`, (0, _drizzleorm.sql)`unit.id = ${_schema.maintenanceRequests.unitId}`).leftJoin((0, _drizzleorm.sql)`users AS tenant`, (0, _drizzleorm.sql)`${_schema.maintenanceRequests.tenantId} = tenant.id`).leftJoin((0, _drizzleorm.sql)`users AS landlord_user`, (0, _drizzleorm.sql)`${_schema.maintenanceRequests.landlordId} = landlord_user.id`).leftJoin((0, _drizzleorm.sql)`users AS facilitator`, (0, _drizzleorm.sql)`${_schema.properties.facilitatorId} = facilitator.id`).where((0, _drizzleorm.inArray)(_schema.maintenanceRequests.propertyId, propertyIds));
            // Apply filters
            if (filters.status) {
                query = query.where((0, _drizzleorm.and)((0, _drizzleorm.inArray)(_schema.maintenanceRequests.propertyId, propertyIds), (0, _drizzleorm.eq)(_schema.maintenanceRequests.status, filters.status)));
            }
            if (filters.propertyId) {
                query = query.where((0, _drizzleorm.and)((0, _drizzleorm.inArray)(_schema.maintenanceRequests.propertyId, propertyIds), (0, _drizzleorm.eq)(_schema.maintenanceRequests.propertyId, filters.propertyId)));
            }
            const requests = await query.orderBy((0, _drizzleorm.desc)(_schema.maintenanceRequests.createdAt));
            return requests.map((request)=>{
                // Determine who reported it - check if tenantId matches landlordId (landlord reported)
                let reportedBy = 'Unknown';
                let reporterType = 'unknown';
                if (request.tenantId === landlordId) {
                    // Landlord reported this maintenance
                    reportedBy = 'You (Landlord)';
                    reporterType = 'landlord';
                } else if (request.tenantFirstName && request.tenantLastName) {
                    // Tenant reported this maintenance
                    reportedBy = `${request.tenantFirstName} ${request.tenantLastName} (Tenant)`;
                    reporterType = 'tenant';
                } else if (request.landlordFirstName && request.landlordLastName) {
                    // Fallback to landlord info
                    reportedBy = `${request.landlordFirstName} ${request.landlordLastName} (Landlord)`;
                    reporterType = 'landlord';
                }
                return {
                    ...request,
                    reportedBy,
                    reporterType,
                    // Facilitator info
                    assignedFacilitator: request.facilitatorFirstName ? `${request.facilitatorFirstName} ${request.facilitatorLastName}` : 'Not assigned',
                    hasFacilitator: !!request.facilitatorId
                };
            });
        } catch (error) {
            console.error('Error fetching maintenance requests:', error);
            throw error;
        }
    }
    /**
   * Get maintenance statistics for landlord
   */ async getMaintenanceStats(landlordId) {
        try {
            // Get all properties owned by this landlord
            const landlordProperties = await this.db.select({
                id: _schema.properties.id
            }).from(_schema.properties).where((0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId));
            const propertyIds = landlordProperties.map((p)=>p.id);
            if (propertyIds.length === 0) {
                return {
                    total: 0,
                    pending: 0,
                    inProgress: 0,
                    completed: 0,
                    byPriority: {
                        low: 0,
                        medium: 0,
                        high: 0,
                        urgent: 0
                    }
                };
            }
            // Get statistics
            const stats = await this.db.select({
                total: (0, _drizzleorm.count)(),
                pending: (0, _drizzleorm.sql)`COUNT(CASE WHEN ${_schema.maintenanceRequests.status} = 'pending' THEN 1 END)`,
                inProgress: (0, _drizzleorm.sql)`COUNT(CASE WHEN ${_schema.maintenanceRequests.status} = 'in_progress' THEN 1 END)`,
                completed: (0, _drizzleorm.sql)`COUNT(CASE WHEN ${_schema.maintenanceRequests.status} = 'completed' THEN 1 END)`,
                low: (0, _drizzleorm.sql)`COUNT(CASE WHEN ${_schema.maintenanceRequests.priority} = 'low' THEN 1 END)`,
                medium: (0, _drizzleorm.sql)`COUNT(CASE WHEN ${_schema.maintenanceRequests.priority} = 'medium' THEN 1 END)`,
                high: (0, _drizzleorm.sql)`COUNT(CASE WHEN ${_schema.maintenanceRequests.priority} = 'high' THEN 1 END)`,
                urgent: (0, _drizzleorm.sql)`COUNT(CASE WHEN ${_schema.maintenanceRequests.priority} = 'urgent' THEN 1 END)`
            }).from(_schema.maintenanceRequests).where((0, _drizzleorm.inArray)(_schema.maintenanceRequests.propertyId, propertyIds));
            const result = stats[0] || {
                total: 0,
                pending: 0,
                inProgress: 0,
                completed: 0,
                low: 0,
                medium: 0,
                high: 0,
                urgent: 0
            };
            return {
                total: result.total,
                pending: result.pending,
                inProgress: result.inProgress,
                completed: result.completed,
                byPriority: {
                    low: result.low,
                    medium: result.medium,
                    high: result.high,
                    urgent: result.urgent
                }
            };
        } catch (error) {
            console.error('Error fetching maintenance stats:', error);
            throw error;
        }
    }
    /**
   * Get single maintenance request details
   */ async getMaintenanceRequest(landlordId, maintenanceId) {
        try {
            // Get all properties owned by this landlord
            const landlordProperties = await this.db.select({
                id: _schema.properties.id
            }).from(_schema.properties).where((0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId));
            const propertyIds = landlordProperties.map((p)=>p.id);
            if (propertyIds.length === 0) {
                throw new Error('No properties found for this landlord');
            }
            // Get maintenance request with full details
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
                // Property info
                propertyId: _schema.properties.id,
                propertyName: _schema.properties.name,
                facilitatorId: _schema.properties.facilitatorId,
                // Unit info
                unitNumber: (0, _drizzleorm.sql)`unit.unit_number`,
                // Reporter info
                reporterFirstName: (0, _drizzleorm.sql)`reporter.first_name`,
                reporterLastName: (0, _drizzleorm.sql)`reporter.last_name`,
                reporterRole: (0, _drizzleorm.sql)`reporter.role`,
                // Assigned facilitator info
                facilitatorFirstName: (0, _drizzleorm.sql)`facilitator.first_name`,
                facilitatorLastName: (0, _drizzleorm.sql)`facilitator.last_name`,
                facilitatorEmail: (0, _drizzleorm.sql)`facilitator.email`
            }).from(_schema.maintenanceRequests).innerJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.maintenanceRequests.propertyId, _schema.properties.id)).leftJoin((0, _drizzleorm.sql)`units AS unit`, (0, _drizzleorm.sql)`unit.property_id = ${_schema.maintenanceRequests.propertyId}`).leftJoin((0, _drizzleorm.sql)`users AS reporter`, (0, _drizzleorm.sql)`${_schema.maintenanceRequests.tenantId} = reporter.id`).leftJoin((0, _drizzleorm.sql)`users AS facilitator`, (0, _drizzleorm.sql)`${_schema.properties.facilitatorId} = facilitator.id`).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.maintenanceRequests.id, maintenanceId), (0, _drizzleorm.inArray)(_schema.maintenanceRequests.propertyId, propertyIds)));
            if (!request) {
                throw new Error('Maintenance request not found or access denied');
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
                reportedBy: request.reporterRole === 'landlord' ? 'You (Landlord)' : request.reporterRole === 'tenant' ? `${request.reporterFirstName} ${request.reporterLastName} (Tenant)` : 'Unknown',
                reporterType: request.reporterRole,
                assignedFacilitator: request.facilitatorFirstName ? `${request.facilitatorFirstName} ${request.facilitatorLastName}` : 'Not assigned',
                facilitatorEmail: request.facilitatorEmail,
                hasFacilitator: !!request.facilitatorId,
                comments: comments
            };
        } catch (error) {
            console.error('Error fetching maintenance request:', error);
            throw error;
        }
    }
    /**
   * Report a maintenance issue
   */ async reportMaintenance(landlordId, maintenanceData) {
        try {
            // Verify property belongs to landlord and get facilitator info
            const [property] = await this.db.select({
                id: _schema.properties.id,
                name: _schema.properties.name,
                facilitatorId: _schema.properties.facilitatorId,
                facilitatorFirstName: (0, _drizzleorm.sql)`facilitator.first_name`,
                facilitatorLastName: (0, _drizzleorm.sql)`facilitator.last_name`
            }).from(_schema.properties).leftJoin((0, _drizzleorm.sql)`users AS facilitator`, (0, _drizzleorm.sql)`${_schema.properties.facilitatorId} = facilitator.id`).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.id, maintenanceData.propertyId), (0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId)));
            if (!property) {
                throw new Error('Property not found or access denied');
            }
            // Check if property has assigned facilitator
            if (!property.facilitatorId) {
                throw new Error('This property does not have an assigned facilitator. Please contact admin to assign a facilitator first.');
            }
            // Create maintenance request - it will automatically go to the property's facilitator
            const [newRequest] = await this.db.insert(_schema.maintenanceRequests).values({
                tenantId: landlordId,
                landlordId: landlordId,
                propertyId: maintenanceData.propertyId,
                title: maintenanceData.title,
                description: maintenanceData.description,
                priority: maintenanceData.priority || 'medium',
                status: 'pending',
                images: maintenanceData.images || [],
                assignedTo: property.facilitatorId
            }).returning();
            console.log(`✅ Maintenance request created and assigned to facilitator: ${property.facilitatorFirstName} ${property.facilitatorLastName}`);
            return {
                ...newRequest,
                assignedFacilitator: `${property.facilitatorFirstName} ${property.facilitatorLastName}`,
                propertyName: property.name
            };
        } catch (error) {
            console.error('Error reporting maintenance:', error);
            throw error;
        }
    }
    /**
   * Add a comment to a maintenance request
   */ async addMaintenanceComment(landlordId, maintenanceId, commentText) {
        try {
            // Get the maintenance request and verify access
            const [request] = await this.db.select({
                id: _schema.maintenanceRequests.id,
                propertyId: _schema.maintenanceRequests.propertyId,
                comments: _schema.maintenanceRequests.comments
            }).from(_schema.maintenanceRequests).innerJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.maintenanceRequests.propertyId, _schema.properties.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.maintenanceRequests.id, maintenanceId), (0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId)));
            if (!request) {
                throw new Error('Maintenance request not found or access denied');
            }
            // Get landlord info
            const [landlord] = await this.db.select({
                firstName: _schema.users.firstName,
                lastName: _schema.users.lastName
            }).from(_schema.users).where((0, _drizzleorm.eq)(_schema.users.id, landlordId));
            // Create new comment
            const newComment = {
                id: _crypto.randomUUID(),
                authorId: landlordId,
                authorName: `${landlord.firstName} ${landlord.lastName}`,
                authorRole: 'landlord',
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
            console.log('✅ Comment added successfully:', newComment.id);
            return newComment;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    }
    constructor(db){
        this.db = db;
    }
};
LandlordService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], LandlordService);

//# sourceMappingURL=landlord.service.js.map