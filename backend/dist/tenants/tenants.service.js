"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantsService", {
    enumerable: true,
    get: function() {
        return TenantsService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
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
let TenantsService = class TenantsService {
    async getTenantData(userId) {
        try {
            // Get payment data which has accurate totalDue calculation
            const paymentData = await this.getTenantPayments(userId);
            // Get contract data for property info
            const contractData = await this.getTenantRentContract(userId);
            if (!contractData || !contractData.contract) {
                throw new _common.NotFoundException('Tenant data not found');
            }
            const contract = contractData.contract;
            return {
                property: {
                    name: contract.property?.name || 'Unknown Property',
                    unit: `Unit ${contract.unit?.unitNumber || 'N/A'}`
                },
                totalDue: paymentData.totalDue,
                dueDate: paymentData.dueDate,
                tenant: {
                    firstName: '',
                    lastName: ''
                },
                monthsDue: paymentData.monthsDue,
                monthlyRent: paymentData.monthlyRent,
                totalPaid: paymentData.totalPaid || 0
            };
        } catch (error) {
            console.error('Error getting tenant data:', error);
            throw error;
        }
    }
    async getTenantPayments(userId) {
        try {
            // Find the tenant's accepted invitation with property and unit data
            const [tenantInvitation] = await this.db.select({
                invitation: _schema.tenantInvitations,
                property: _schema.properties,
                unit: _schema.units
            }).from(_schema.tenantInvitations).leftJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.tenantInvitations.propertyId, _schema.properties.id)).leftJoin(_schema.units, (0, _drizzleorm.eq)(_schema.tenantInvitations.unitId, _schema.units.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.tenantInvitations.tenantId, userId), (0, _drizzleorm.eq)(_schema.tenantInvitations.status, 'accepted')));
            if (!tenantInvitation) {
                throw new _common.NotFoundException('Tenant payment data not found');
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
                    day: 'numeric'
                });
            } else {
                // Move-in date is in the future, no payments due yet
                nextDueDate = moveInDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            // Calculate total paid from successful payments
            const paidPayments = await this.db.select().from(_schema.payments).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.payments.tenantId, userId), (0, _drizzleorm.eq)(_schema.payments.status, 'paid')));
            const totalPaid = paidPayments.reduce((sum, payment)=>{
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
                    day: 'numeric'
                })
            };
        } catch (error) {
            console.error('Error getting tenant payments:', error);
            throw error;
        }
    }
    async getPaymentHistory(userId) {
        try {
            const history = await this.db.select({
                id: _schema.payments.id,
                amount: _schema.payments.amount,
                status: _schema.payments.status,
                paymentMethod: _schema.payments.paymentMethod,
                paidDate: _schema.payments.paidDate,
                createdAt: _schema.payments.createdAt,
                description: _schema.payments.description,
                paystackReference: _schema.payments.paystackReference,
                paystackStatus: _schema.payments.paystackStatus
            }).from(_schema.payments).where((0, _drizzleorm.eq)(_schema.payments.tenantId, userId)).orderBy((0, _drizzleorm.sql)`${_schema.payments.createdAt} DESC`).limit(50);
            return history;
        } catch (error) {
            console.error('Error getting payment history:', error);
            return [];
        }
    }
    async getTenantReports(userId) {
        try {
            // TODO: Implement reports when payment and maintenance systems are ready
            return [];
        } catch (error) {
            console.error('Error getting tenant reports:', error);
            throw error;
        }
    }
    async getTenantComplaints(userId) {
        try {
            const { maintenanceRequests } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../database/schema")));
            const { desc, sql } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("drizzle-orm")));
            // Get maintenance requests created by this tenant
            const requests = await this.db.select({
                id: maintenanceRequests.id,
                title: maintenanceRequests.title,
                description: maintenanceRequests.description,
                status: maintenanceRequests.status,
                priority: maintenanceRequests.priority,
                images: maintenanceRequests.images,
                createdAt: maintenanceRequests.createdAt,
                completedAt: maintenanceRequests.completedAt,
                // Property info
                propertyName: sql`property.name`,
                // Unit info
                unitNumber: sql`unit.unit_number`,
                // Facilitator info
                facilitatorFirstName: sql`facilitator.first_name`,
                facilitatorLastName: sql`facilitator.last_name`
            }).from(maintenanceRequests).leftJoin(sql`properties AS property`, sql`${maintenanceRequests.propertyId} = property.id`).leftJoin(sql`units AS unit`, sql`unit.id = ${maintenanceRequests.unitId}`).leftJoin(sql`users AS facilitator`, sql`${maintenanceRequests.assignedTo} = facilitator.id`).where(sql`${maintenanceRequests.tenantId} = ${userId}`).orderBy(desc(maintenanceRequests.createdAt));
            return requests.map((request)=>({
                    ...request,
                    assignedFacilitator: request.facilitatorFirstName ? `${request.facilitatorFirstName} ${request.facilitatorLastName}` : 'Not assigned'
                }));
        } catch (error) {
            console.error('Error getting tenant complaints:', error);
            throw error;
        }
    }
    async getComplaintDetail(complaintId, userId) {
        try {
            const { maintenanceRequests } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../database/schema")));
            const { eq, and, sql } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("drizzle-orm")));
            // Get maintenance request details
            const [request] = await this.db.select({
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
                propertyId: sql`property.id`,
                propertyName: sql`property.name`,
                // Unit info
                unitNumber: sql`unit.unit_number`,
                // Facilitator info
                facilitatorId: sql`facilitator.id`,
                facilitatorFirstName: sql`facilitator.first_name`,
                facilitatorLastName: sql`facilitator.last_name`,
                facilitatorEmail: sql`facilitator.email`
            }).from(maintenanceRequests).leftJoin(sql`properties AS property`, sql`${maintenanceRequests.propertyId} = property.id`).leftJoin(sql`units AS unit`, sql`unit.id = ${maintenanceRequests.unitId}`).leftJoin(sql`users AS facilitator`, sql`${maintenanceRequests.assignedTo} = facilitator.id`).where(and(eq(maintenanceRequests.id, complaintId), sql`${maintenanceRequests.tenantId} = ${userId}`));
            if (!request) {
                throw new Error('Maintenance request not found or access denied');
            }
            return {
                ...request,
                assignedFacilitator: request.facilitatorFirstName ? `${request.facilitatorFirstName} ${request.facilitatorLastName}` : 'Not assigned',
                hasFacilitator: !!request.facilitatorId
            };
        } catch (error) {
            console.error('Error getting complaint detail:', error);
            throw error;
        }
    }
    async submitComplaint(complaintData, userId) {
        try {
            const { maintenanceRequests } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../database/schema")));
            const { eq, and, sql } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("drizzle-orm")));
            // Get tenant's property info
            const [tenantInvitation] = await this.db.select({
                propertyId: _schema.tenantInvitations.propertyId,
                unitId: _schema.tenantInvitations.unitId,
                facilitatorId: sql`property.facilitator_id`
            }).from(_schema.tenantInvitations).leftJoin(sql`properties AS property`, sql`${_schema.tenantInvitations.propertyId} = property.id`).where(and(eq(_schema.tenantInvitations.tenantId, userId), eq(_schema.tenantInvitations.status, 'accepted'))).limit(1);
            if (!tenantInvitation) {
                throw new Error('No active tenancy found');
            }
            // Create maintenance request
            const [newRequest] = await this.db.insert(maintenanceRequests).values({
                tenantId: userId,
                landlordId: null,
                propertyId: tenantInvitation.propertyId,
                unitId: tenantInvitation.unitId,
                title: complaintData.title,
                description: complaintData.description,
                priority: complaintData.priority || 'medium',
                status: 'pending',
                images: complaintData.images || [],
                assignedTo: tenantInvitation.facilitatorId
            }).returning();
            return newRequest;
        } catch (error) {
            console.error('Error submitting complaint:', error);
            throw error;
        }
    }
    async getTenantRentContract(userId) {
        try {
            // Find the tenant's active rent contract
            const [contractData] = await this.db.select({
                contract: _tenantrentcontracts.tenantRentContracts,
                property: _schema.properties,
                unit: _schema.units
            }).from(_tenantrentcontracts.tenantRentContracts).leftJoin(_schema.properties, (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.propertyId, _schema.properties.id)).leftJoin(_schema.units, (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.unitId, _schema.units.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.tenantId, userId), (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, 'active'))).limit(1);
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
                    name: contractData.property?.name || 'Unknown Property'
                },
                unit: {
                    unitNumber: contractData.unit?.unitNumber || 'N/A'
                }
            };
            // Calculate arrears if existing tenant
            let arrearsInfo = null;
            if (contractData.contract.isExistingTenant) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const transition = new Date(contractData.contract.transitionStartDate);
                transition.setHours(0, 0, 0, 0);
                // If transition date is in the past, calculate arrears
                if (transition < today) {
                    let monthsOverdue = 0;
                    let checkDate = new Date(transition);
                    while(checkDate < today){
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
            const { desc } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("drizzle-orm")));
            const paymentHistory = await this.db.select().from(_schema.payments).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.payments.tenantId, userId), (0, _drizzleorm.eq)(_schema.payments.status, 'paid'))).orderBy(desc(_schema.payments.paidDate)).limit(10);
            const result = {
                contract,
                arrears: arrearsInfo,
                paymentHistory: paymentHistory || []
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
    constructor(db){
        this.db = db;
    }
};
TenantsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], TenantsService);

//# sourceMappingURL=tenants.service.js.map