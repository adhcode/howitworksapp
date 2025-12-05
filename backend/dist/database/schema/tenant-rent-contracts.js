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
    get contractStatusEnum () {
        return contractStatusEnum;
    },
    get landlordEscrowBalances () {
        return landlordEscrowBalances;
    },
    get landlordPayoutTypeEnum () {
        return landlordPayoutTypeEnum;
    },
    get notificationStatusEnum () {
        return notificationStatusEnum;
    },
    get notificationTypeEnum () {
        return notificationTypeEnum;
    },
    get paymentNotifications () {
        return paymentNotifications;
    },
    get tenantRentContracts () {
        return tenantRentContracts;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _users = require("./users");
const _properties = require("./properties");
const landlordPayoutTypeEnum = (0, _pgcore.pgEnum)('landlord_payout_type', [
    'monthly',
    'yearly'
]);
const contractStatusEnum = (0, _pgcore.pgEnum)('contract_status', [
    'active',
    'expired',
    'terminated'
]);
const notificationTypeEnum = (0, _pgcore.pgEnum)('notification_type', [
    'reminder',
    'overdue',
    'success'
]);
const notificationStatusEnum = (0, _pgcore.pgEnum)('notification_status', [
    'pending',
    'sent',
    'failed'
]);
const tenantRentContracts = (0, _pgcore.pgTable)('tenant_rent_contracts', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    // References
    tenantId: (0, _pgcore.uuid)('tenant_id').references(()=>_users.users.id).notNull(),
    landlordId: (0, _pgcore.uuid)('landlord_id').references(()=>_users.users.id).notNull(),
    propertyId: (0, _pgcore.uuid)('property_id').references(()=>_properties.properties.id).notNull(),
    unitId: (0, _pgcore.uuid)('unit_id').references(()=>_properties.units.id).notNull(),
    // Contract details
    monthlyAmount: (0, _pgcore.decimal)('monthly_amount', {
        precision: 10,
        scale: 2
    }).notNull(),
    expiryDate: (0, _pgcore.timestamp)('expiry_date').notNull(),
    landlordPayoutType: landlordPayoutTypeEnum('landlord_payout_type').notNull(),
    // Payment scheduling
    nextPaymentDue: (0, _pgcore.timestamp)('next_payment_due').notNull(),
    transitionStartDate: (0, _pgcore.timestamp)('transition_start_date').notNull(),
    // Status and metadata
    status: contractStatusEnum('status').default('active').notNull(),
    isExistingTenant: (0, _pgcore.boolean)('is_existing_tenant').default(false).notNull(),
    originalExpiryDate: (0, _pgcore.timestamp)('original_expiry_date'),
    // Tracking
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow().notNull()
});
const landlordEscrowBalances = (0, _pgcore.pgTable)('landlord_escrow_balances', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    // References
    landlordId: (0, _pgcore.uuid)('landlord_id').references(()=>_users.users.id).notNull(),
    contractId: (0, _pgcore.uuid)('contract_id').references(()=>tenantRentContracts.id).notNull(),
    // Balance tracking
    totalEscrowed: (0, _pgcore.decimal)('total_escrowed', {
        precision: 10,
        scale: 2
    }).default('0.00').notNull(),
    monthsAccumulated: (0, _pgcore.integer)('months_accumulated').default(0).notNull(),
    expectedReleaseDate: (0, _pgcore.timestamp)('expected_release_date').notNull(),
    // Release tracking
    isReleased: (0, _pgcore.boolean)('is_released').default(false).notNull(),
    releasedAt: (0, _pgcore.timestamp)('released_at'),
    releasedAmount: (0, _pgcore.decimal)('released_amount', {
        precision: 10,
        scale: 2
    }),
    // Tracking
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow().notNull()
});
const paymentNotifications = (0, _pgcore.pgTable)('payment_notifications', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    // References
    contractId: (0, _pgcore.uuid)('contract_id').references(()=>tenantRentContracts.id).notNull(),
    tenantId: (0, _pgcore.uuid)('tenant_id').references(()=>_users.users.id).notNull(),
    // Notification details
    notificationType: notificationTypeEnum('notification_type').notNull(),
    scheduledFor: (0, _pgcore.timestamp)('scheduled_for').notNull(),
    sentAt: (0, _pgcore.timestamp)('sent_at'),
    // Notification content
    title: (0, _pgcore.varchar)('title', {
        length: 255
    }).notNull(),
    message: (0, _pgcore.text)('message').notNull(),
    // Delivery tracking
    status: notificationStatusEnum('status').default('pending').notNull(),
    expoReceiptId: (0, _pgcore.varchar)('expo_receipt_id', {
        length: 255
    }),
    // Tracking
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow().notNull()
});

//# sourceMappingURL=tenant-rent-contracts.js.map