"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantInvitationsService", {
    enumerable: true,
    get: function() {
        return TenantInvitationsService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _databasemodule = require("../database/database.module");
const _schema = require("../database/schema");
const _usersservice = require("../users/users.service");
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
let TenantInvitationsService = class TenantInvitationsService {
    generateInvitationToken() {
        // Generate a 6-digit alphanumeric code (easier for users to type)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for(let i = 0; i < 6; i++){
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    async createInvitation(invitationData) {
        // Check if unit exists and is available
        const [unit] = await this.db.select().from(_schema.units).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.units.id, invitationData.unitId), (0, _drizzleorm.eq)(_schema.units.propertyId, invitationData.propertyId), (0, _drizzleorm.eq)(_schema.units.isAvailable, true)));
        if (!unit) {
            throw new _common.BadRequestException('Unit not found or not available');
        }
        // Check if there's already a pending invitation for this email and unit
        const existingInvitation = await this.db.select().from(_schema.tenantInvitations).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.tenantInvitations.email, invitationData.email), (0, _drizzleorm.eq)(_schema.tenantInvitations.unitId, invitationData.unitId), (0, _drizzleorm.eq)(_schema.tenantInvitations.status, 'pending')));
        if (existingInvitation.length > 0) {
            throw new _common.BadRequestException('An invitation for this email and unit already exists');
        }
        // Generate invitation token
        const invitationToken = this.generateInvitationToken();
        // Set expiration date (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        // Debug logging to check the landlordId
        console.log('=== TENANT INVITATION DEBUG ===');
        console.log('Received landlordId:', invitationData.landlordId);
        console.log('Invitation data:', JSON.stringify(invitationData, null, 2));
        console.log('=== END DEBUG ===');
        // Build enhanced notes with contract information
        let enhancedNotes = invitationData.notes || '';
        if (invitationData.landlordPayoutType) {
            enhancedNotes += `${enhancedNotes ? ', ' : ''}Landlord Payout: ${invitationData.landlordPayoutType}`;
        }
        if (invitationData.isExistingTenant !== undefined) {
            enhancedNotes += `${enhancedNotes ? ', ' : ''}Existing Tenant: ${invitationData.isExistingTenant}`;
        }
        if (invitationData.originalExpiryDate) {
            enhancedNotes += `${enhancedNotes ? ', ' : ''}Original Expiry: ${invitationData.originalExpiryDate}`;
        }
        const newInvitation = {
            invitationToken,
            landlordId: invitationData.landlordId,
            propertyId: invitationData.propertyId,
            unitId: invitationData.unitId,
            firstName: invitationData.firstName,
            lastName: invitationData.lastName,
            email: invitationData.email,
            phone: invitationData.phone || '',
            emergencyContact: invitationData.nextOfKinName || null,
            emergencyPhone: invitationData.nextOfKinPhone || null,
            leaseStartDate: new Date(invitationData.leaseStartDate),
            leaseEndDate: new Date(invitationData.leaseEndDate),
            monthlyRent: invitationData.monthlyRent.toString(),
            securityDeposit: invitationData.securityDeposit?.toString() || null,
            notes: enhancedNotes || null,
            expiresAt
        };
        // Create the invitation record with explicit field mapping
        const insertData = {
            invitationToken: invitationToken,
            landlordId: invitationData.landlordId,
            propertyId: invitationData.propertyId,
            unitId: invitationData.unitId,
            firstName: invitationData.firstName,
            lastName: invitationData.lastName,
            email: invitationData.email,
            phone: invitationData.phone || '',
            emergencyContact: invitationData.nextOfKinName || null,
            emergencyPhone: invitationData.nextOfKinPhone || null,
            leaseStartDate: new Date(invitationData.leaseStartDate),
            leaseEndDate: new Date(invitationData.leaseEndDate),
            monthlyRent: invitationData.monthlyRent.toString(),
            securityDeposit: invitationData.securityDeposit?.toString() || null,
            notes: enhancedNotes || null,
            expiresAt: expiresAt
        };
        console.log('Insert data:', JSON.stringify(insertData, null, 2));
        const [invitation] = await this.db.insert(_schema.tenantInvitations).values(insertData).returning();
        // Mark unit as reserved (optional - you might want to keep it available until accepted)
        // await this.db
        //   .update(units)
        //   .set({ isAvailable: false })
        //   .where(eq(units.id, invitationData.unitId));
        return invitation;
    }
    async getInvitationByToken(token) {
        const [invitation] = await this.db.select({
            invitation: _schema.tenantInvitations,
            property: _schema.properties,
            unit: _schema.units
        }).from(_schema.tenantInvitations).leftJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.tenantInvitations.propertyId, _schema.properties.id)).leftJoin(_schema.units, (0, _drizzleorm.eq)(_schema.tenantInvitations.unitId, _schema.units.id)).where((0, _drizzleorm.eq)(_schema.tenantInvitations.invitationToken, token));
        if (!invitation) {
            return null;
        }
        return {
            ...invitation.invitation,
            property: invitation.property,
            unit: invitation.unit
        };
    }
    async acceptInvitation(token, tenantId) {
        const invitation = await this.getInvitationByToken(token);
        if (!invitation) {
            throw new _common.NotFoundException('Invitation not found');
        }
        if (invitation.status !== 'pending') {
            throw new _common.BadRequestException('Invitation is no longer valid');
        }
        if (new Date() > invitation.expiresAt) {
            throw new _common.BadRequestException('Invitation has expired');
        }
        // Update invitation status
        const [updatedInvitation] = await this.db.update(_schema.tenantInvitations).set({
            status: 'accepted',
            tenantId,
            acceptedAt: new Date(),
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.tenantInvitations.invitationToken, token)).returning();
        // Mark unit as occupied
        await this.db.update(_schema.units).set({
            isAvailable: false
        }).where((0, _drizzleorm.eq)(_schema.units.id, invitation.unitId));
        // Create lease record
        try {
            // Format dates as strings for date fields (not timestamp)
            const startDate = new Date(invitation.leaseStartDate);
            const endDate = new Date(invitation.leaseEndDate);
            await this.db.insert(_schema.leases).values({
                tenantId,
                landlordId: invitation.landlordId,
                propertyId: invitation.propertyId,
                unitId: invitation.unitId,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                monthlyRent: invitation.monthlyRent,
                securityDeposit: invitation.securityDeposit,
                status: 'active',
                signedAt: new Date()
            });
            console.log('✅ Lease created successfully for tenant:', tenantId);
        } catch (error) {
            console.error('❌ Error creating lease:', error);
        // Don't fail the invitation acceptance if lease creation fails
        }
        // Create rent contract if landlord payout preference is specified in notes
        try {
            await this.createRentContractFromInvitation(updatedInvitation, invitation);
        } catch (error) {
            console.error('Error creating rent contract:', error);
        // Don't fail the invitation acceptance if rent contract creation fails
        }
        // Payment schedules are now handled through the tenant_rent_contracts table
        // See ContractsService for creating contracts which manage payment schedules
        console.log('Payment schedules are now managed through rent contracts');
        return updatedInvitation;
    }
    /**
   * Create rent contract from accepted invitation
   */ async createRentContractFromInvitation(invitation, invitationDetails) {
        // Parse landlord payout preference and existing tenant status from notes
        const notes = invitation.notes || '';
        let landlordPayoutType = 'monthly'; // default
        let isExistingTenant = false;
        let originalExpiryDate = null;
        // Parse notes for contract information
        // Expected format: "Payment Frequency: Monthly, Landlord Payout: yearly, Existing Tenant: true, Original Expiry: 2024-06-30"
        if (notes.includes('Landlord Payout:')) {
            const payoutMatch = notes.match(/Landlord Payout:\s*(monthly|yearly)/i);
            if (payoutMatch) {
                landlordPayoutType = payoutMatch[1].toLowerCase();
            }
        }
        if (notes.includes('Existing Tenant:')) {
            const existingMatch = notes.match(/Existing Tenant:\s*(true|false)/i);
            if (existingMatch) {
                isExistingTenant = existingMatch[1].toLowerCase() === 'true';
            }
        }
        if (notes.includes('Original Expiry:')) {
            const expiryMatch = notes.match(/Original Expiry:\s*(\d{4}-\d{2}-\d{2})/);
            if (expiryMatch) {
                originalExpiryDate = new Date(expiryMatch[1]);
            }
        }
        // Only create rent contract if we have the necessary information
        if (notes.includes('Landlord Payout:')) {
            // Import TenantPaymentService dynamically to avoid circular dependency
            const { TenantPaymentService } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../tenant-rent-contracts/tenant-payment.service")));
            const tenantPaymentService = new TenantPaymentService(this.db);
            const contractData = {
                tenantId: invitation.tenantId,
                landlordId: invitation.landlordId,
                propertyId: invitation.propertyId,
                unitId: invitation.unitId,
                monthlyAmount: parseFloat(invitation.monthlyRent),
                expiryDate: invitation.leaseEndDate.toISOString(),
                landlordPayoutType: landlordPayoutType,
                isExistingTenant,
                originalExpiryDate: originalExpiryDate?.toISOString()
            };
            await tenantPaymentService.createRentContract(contractData);
            console.log('Rent contract created successfully for invitation:', invitation.id);
        }
    }
    async getInvitationsByLandlord(landlordId) {
        try {
            console.log('🗄️ Querying database for invitations with landlordId:', landlordId);
            const invitations = await this.db.select({
                invitation: _schema.tenantInvitations,
                tenant: _schema.users
            }).from(_schema.tenantInvitations).leftJoin(_schema.users, (0, _drizzleorm.eq)(_schema.tenantInvitations.tenantId, _schema.users.id)).where((0, _drizzleorm.eq)(_schema.tenantInvitations.landlordId, landlordId));
            console.log('🗄️ Database returned', invitations.length, 'invitations');
            // Merge invitation and tenant data, using real email if tenant has accepted
            const enrichedInvitations = invitations.map(({ invitation, tenant })=>({
                    ...invitation,
                    // Override with real tenant data if they've accepted
                    email: tenant?.email || invitation.email,
                    phone: tenant?.phoneNumber || invitation.phone,
                    // Add flag to indicate if using real data
                    hasAcceptedAccount: !!tenant
                }));
            return enrichedInvitations;
        } catch (error) {
            console.error('❌ Error getting invitations by landlord:', error);
            return [];
        }
    }
    async getAcceptedTenantsByLandlord(landlordId) {
        try {
            console.log('🔍 Getting accepted tenants for landlord:', landlordId);
            const acceptedInvitations = await this.db.select({
                invitation: _schema.tenantInvitations,
                property: _schema.properties,
                unit: _schema.units
            }).from(_schema.tenantInvitations).leftJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.tenantInvitations.propertyId, _schema.properties.id)).leftJoin(_schema.units, (0, _drizzleorm.eq)(_schema.tenantInvitations.unitId, _schema.units.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.tenantInvitations.landlordId, landlordId), (0, _drizzleorm.eq)(_schema.tenantInvitations.status, 'accepted')));
            console.log('🔍 Found accepted invitations:', acceptedInvitations.length);
            const result = acceptedInvitations.map((result)=>({
                    // Flatten invitation data to top level for easier access
                    id: result.invitation.id,
                    propertyId: result.invitation.propertyId,
                    unitId: result.invitation.unitId,
                    firstName: result.invitation.firstName,
                    lastName: result.invitation.lastName,
                    email: result.invitation.email,
                    phone: result.invitation.phone,
                    monthlyRent: result.invitation.monthlyRent,
                    securityDeposit: result.invitation.securityDeposit,
                    status: result.invitation.status,
                    leaseStartDate: result.invitation.leaseStartDate,
                    leaseEndDate: result.invitation.leaseEndDate,
                    createdAt: result.invitation.createdAt,
                    updatedAt: result.invitation.updatedAt,
                    // Include nested objects
                    property: result.property,
                    unit: result.unit
                }));
            console.log('🔍 Returning tenants:', result);
            return result;
        } catch (error) {
            console.error('❌ Error getting accepted tenants:', error);
            return [];
        }
    }
    async cancelInvitation(invitationId, landlordId) {
        const [invitation] = await this.db.select().from(_schema.tenantInvitations).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.tenantInvitations.id, invitationId), (0, _drizzleorm.eq)(_schema.tenantInvitations.landlordId, landlordId)));
        if (!invitation) {
            throw new _common.NotFoundException('Invitation not found');
        }
        await this.db.update(_schema.tenantInvitations).set({
            status: 'cancelled',
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.tenantInvitations.id, invitationId));
    }
    async validateInvitationToken(token) {
        const invitation = await this.getInvitationByToken(token);
        if (!invitation) {
            return false;
        }
        if (invitation.status !== 'pending') {
            return false;
        }
        if (new Date() > invitation.expiresAt) {
            // Mark as expired
            await this.db.update(_schema.tenantInvitations).set({
                status: 'expired',
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_schema.tenantInvitations.invitationToken, token));
            return false;
        }
        return true;
    }
    constructor(db, usersService){
        this.db = db;
        this.usersService = usersService;
    }
};
TenantInvitationsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _usersservice.UsersService === "undefined" ? Object : _usersservice.UsersService
    ])
], TenantInvitationsService);

//# sourceMappingURL=tenant-invitations.service.js.map