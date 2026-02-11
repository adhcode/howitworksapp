"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "artisans", {
    enumerable: true,
    get: function() {
        return artisans;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _users = require("./users");
const artisans = (0, _pgcore.pgTable)('artisans', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    fullName: (0, _pgcore.varchar)('full_name', {
        length: 255
    }).notNull(),
    phoneNumber: (0, _pgcore.varchar)('phone_number', {
        length: 20
    }).notNull(),
    email: (0, _pgcore.varchar)('email', {
        length: 255
    }),
    address: (0, _pgcore.text)('address').notNull(),
    city: (0, _pgcore.varchar)('city', {
        length: 100
    }).notNull(),
    state: (0, _pgcore.varchar)('state', {
        length: 100
    }).notNull(),
    specialty: (0, _pgcore.varchar)('specialty', {
        length: 100
    }).notNull(),
    yearsOfExperience: (0, _pgcore.integer)('years_of_experience').notNull(),
    refereeName: (0, _pgcore.varchar)('referee_name', {
        length: 255
    }).notNull(),
    refereePhone: (0, _pgcore.varchar)('referee_phone', {
        length: 20
    }).notNull(),
    additionalSkills: (0, _pgcore.text)('additional_skills'),
    availability: (0, _pgcore.varchar)('availability', {
        length: 50
    }).default('Full-time'),
    status: (0, _pgcore.varchar)('status', {
        length: 20
    }).default('pending'),
    referredByFacilitatorId: (0, _pgcore.uuid)('referred_by_facilitator_id').references(()=>_users.users.id, {
        onDelete: 'set null'
    }),
    adminNotes: (0, _pgcore.text)('admin_notes'),
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow()
});

//# sourceMappingURL=artisans.js.map