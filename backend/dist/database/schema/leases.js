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
    get leaseStatusEnum () {
        return leaseStatusEnum;
    },
    get leases () {
        return leases;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _users = require("./users");
const _properties = require("./properties");
const leaseStatusEnum = (0, _pgcore.pgEnum)('lease_status', [
    'active',
    'expired',
    'terminated',
    'pending'
]);
const leases = (0, _pgcore.pgTable)('leases', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, _pgcore.uuid)('tenant_id').references(()=>_users.users.id).notNull(),
    landlordId: (0, _pgcore.uuid)('landlord_id').references(()=>_users.users.id).notNull(),
    propertyId: (0, _pgcore.uuid)('property_id').references(()=>_properties.properties.id).notNull(),
    unitId: (0, _pgcore.uuid)('unit_id').references(()=>_properties.units.id).notNull(),
    startDate: (0, _pgcore.date)('start_date').notNull(),
    endDate: (0, _pgcore.date)('end_date').notNull(),
    monthlyRent: (0, _pgcore.decimal)('monthly_rent', {
        precision: 10,
        scale: 2
    }).notNull(),
    securityDeposit: (0, _pgcore.decimal)('security_deposit', {
        precision: 10,
        scale: 2
    }),
    status: leaseStatusEnum('status').default('pending'),
    terms: (0, _pgcore.text)('terms'),
    signedAt: (0, _pgcore.timestamp)('signed_at'),
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow()
});

//# sourceMappingURL=leases.js.map