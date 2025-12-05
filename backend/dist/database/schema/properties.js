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
    get properties () {
        return properties;
    },
    get propertyStatusEnum () {
        return propertyStatusEnum;
    },
    get propertyTypeEnum () {
        return propertyTypeEnum;
    },
    get units () {
        return units;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _users = require("./users");
const propertyTypeEnum = (0, _pgcore.pgEnum)('property_type', [
    'apartment',
    'house',
    'condo',
    'studio',
    'duplex'
]);
const propertyStatusEnum = (0, _pgcore.pgEnum)('property_status', [
    'active',
    'inactive',
    'maintenance'
]);
const properties = (0, _pgcore.pgTable)('properties', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    landlordId: (0, _pgcore.uuid)('landlord_id').references(()=>_users.users.id).notNull(),
    facilitatorId: (0, _pgcore.uuid)('facilitator_id').references(()=>_users.users.id),
    name: (0, _pgcore.varchar)('name', {
        length: 255
    }).notNull(),
    address: (0, _pgcore.text)('address').notNull(),
    city: (0, _pgcore.varchar)('city', {
        length: 100
    }).notNull(),
    state: (0, _pgcore.varchar)('state', {
        length: 100
    }).notNull(),
    zipCode: (0, _pgcore.varchar)('zip_code', {
        length: 10
    }),
    country: (0, _pgcore.varchar)('country', {
        length: 100
    }).notNull(),
    propertyType: propertyTypeEnum('property_type').notNull(),
    description: (0, _pgcore.text)('description'),
    totalUnits: (0, _pgcore.integer)('total_units').default(1),
    images: (0, _pgcore.text)('images').array(),
    amenities: (0, _pgcore.text)('amenities').array(),
    status: propertyStatusEnum('status').default('active'),
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow()
});
const units = (0, _pgcore.pgTable)('units', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    propertyId: (0, _pgcore.uuid)('property_id').references(()=>properties.id).notNull(),
    unitNumber: (0, _pgcore.varchar)('unit_number', {
        length: 50
    }).notNull(),
    bedrooms: (0, _pgcore.integer)('bedrooms').notNull(),
    bathrooms: (0, _pgcore.decimal)('bathrooms', {
        precision: 3,
        scale: 1
    }).notNull(),
    squareFootage: (0, _pgcore.decimal)('square_footage', {
        precision: 10,
        scale: 2
    }),
    rent: (0, _pgcore.decimal)('rent', {
        precision: 10,
        scale: 2
    }).notNull(),
    deposit: (0, _pgcore.decimal)('deposit', {
        precision: 10,
        scale: 2
    }),
    description: (0, _pgcore.text)('description'),
    images: (0, _pgcore.text)('images').array(),
    amenities: (0, _pgcore.text)('amenities').array(),
    isAvailable: (0, _pgcore.boolean)('is_available').default(true),
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow()
});

//# sourceMappingURL=properties.js.map