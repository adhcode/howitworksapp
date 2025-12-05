"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get invitationStatusEnum () {
        return invitationStatusEnum;
    },
    get tenantInvitations () {
        return tenantInvitations;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _users = require("./users");
const _properties = require("./properties");
const invitationStatusEnum = (0, _pgcore.pgEnum)('invitation_status', [
    'pending',
    'accepted',
    'expired',
    'cancelled'
]);
const tenantInvitations = (0, _pgcore.pgTable)('tenant_invitations', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    invitationToken: (0, _pgcore.varchar)('invitation_token', {
        length: 255
    }).unique().notNull(),
    landlordId: (0, _pgcore.uuid)('landlord_id').references(()=>_users.users.id).notNull(),
    propertyId: (0, _pgcore.uuid)('property_id').references(()=>_properties.properties.id).notNull(),
    unitId: (0, _pgcore.uuid)('unit_id').references(()=>_properties.units.id).notNull(),
    // Pre-filled tenant information
    firstName: (0, _pgcore.varchar)('first_name', {
        length: 100
    }).notNull(),
    lastName: (0, _pgcore.varchar)('last_name', {
        length: 100
    }).notNull(),
    email: (0, _pgcore.varchar)('email', {
        length: 255
    }).notNull(),
    phone: (0, _pgcore.varchar)('phone', {
        length: 20
    }).notNull(),
    emergencyContact: (0, _pgcore.varchar)('emergency_contact', {
        length: 100
    }),
    emergencyPhone: (0, _pgcore.varchar)('emergency_phone', {
        length: 20
    }),
    // Lease information
    leaseStartDate: (0, _pgcore.timestamp)('lease_start_date').notNull(),
    leaseEndDate: (0, _pgcore.timestamp)('lease_end_date').notNull(),
    monthlyRent: (0, _pgcore.decimal)('monthly_rent', {
        precision: 10,
        scale: 2
    }).notNull(),
    securityDeposit: (0, _pgcore.decimal)('security_deposit', {
        precision: 10,
        scale: 2
    }),
    notes: (0, _pgcore.text)('notes'),
    // Invitation status and tracking
    status: invitationStatusEnum('status').default('pending'),
    tenantId: (0, _pgcore.uuid)('tenant_id').references(()=>_users.users.id),
    sentAt: (0, _pgcore.timestamp)('sent_at').defaultNow(),
    acceptedAt: (0, _pgcore.timestamp)('accepted_at'),
    expiresAt: (0, _pgcore.timestamp)('expires_at').notNull(),
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow()
});

//# sourceMappingURL=tenant-invitations.js.map