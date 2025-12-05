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
    get paymentHistory () {
        return paymentHistory;
    },
    get paymentMethodEnum () {
        return paymentMethodEnum;
    },
    get paymentStatusEnum () {
        return paymentStatusEnum;
    },
    get payments () {
        return payments;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _users = require("./users");
const _properties = require("./properties");
const _tenantinvitations = require("./tenant-invitations");
const paymentStatusEnum = (0, _pgcore.pgEnum)('payment_status', [
    'pending',
    'paid',
    'overdue',
    'partial'
]);
const paymentMethodEnum = (0, _pgcore.pgEnum)('payment_method', [
    'bank_transfer',
    'cash',
    'check',
    'online',
    'card'
]);
const payments = (0, _pgcore.pgTable)('payments', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    // References
    landlordId: (0, _pgcore.uuid)('landlord_id').references(()=>_users.users.id).notNull(),
    tenantId: (0, _pgcore.uuid)('tenant_id').references(()=>_users.users.id).notNull(),
    propertyId: (0, _pgcore.uuid)('property_id').references(()=>_properties.properties.id).notNull(),
    unitId: (0, _pgcore.uuid)('unit_id').references(()=>_properties.units.id).notNull(),
    tenantInvitationId: (0, _pgcore.uuid)('tenant_invitation_id').references(()=>_tenantinvitations.tenantInvitations.id),
    // Payment details
    amount: (0, _pgcore.decimal)('amount', {
        precision: 10,
        scale: 2
    }).notNull(),
    amountPaid: (0, _pgcore.decimal)('amount_paid', {
        precision: 10,
        scale: 2
    }).default('0.00'),
    dueDate: (0, _pgcore.timestamp)('due_date').notNull(),
    paidDate: (0, _pgcore.timestamp)('paid_date'),
    // Payment info
    paymentType: (0, _pgcore.varchar)('payment_type', {
        length: 50
    }).default('rent'),
    paymentMethod: paymentMethodEnum('payment_method'),
    status: paymentStatusEnum('status').default('pending'),
    // Additional info
    description: (0, _pgcore.text)('description'),
    notes: (0, _pgcore.text)('notes'),
    receiptNumber: (0, _pgcore.varchar)('receipt_number', {
        length: 100
    }),
    // Payment gateway info
    paystackReference: (0, _pgcore.varchar)('paystack_reference', {
        length: 255
    }),
    paystackStatus: (0, _pgcore.varchar)('paystack_status', {
        length: 50
    }),
    paymentGateway: (0, _pgcore.varchar)('payment_gateway', {
        length: 50
    }).default('paystack'),
    // Tracking
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow()
});
const paymentHistory = (0, _pgcore.pgTable)('payment_history', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    paymentId: (0, _pgcore.uuid)('payment_id').references(()=>payments.id).notNull(),
    // What changed
    action: (0, _pgcore.varchar)('action', {
        length: 50
    }).notNull(),
    previousStatus: paymentStatusEnum('previous_status'),
    newStatus: paymentStatusEnum('new_status'),
    // Amount changes
    previousAmount: (0, _pgcore.decimal)('previous_amount', {
        precision: 10,
        scale: 2
    }),
    newAmount: (0, _pgcore.decimal)('new_amount', {
        precision: 10,
        scale: 2
    }),
    // Additional info
    notes: (0, _pgcore.text)('notes'),
    performedBy: (0, _pgcore.uuid)('performed_by').references(()=>_users.users.id),
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow()
});

//# sourceMappingURL=payments.js.map