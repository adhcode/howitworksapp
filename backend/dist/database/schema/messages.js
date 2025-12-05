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
    get maintenanceRequests () {
        return maintenanceRequests;
    },
    get messageStatusEnum () {
        return messageStatusEnum;
    },
    get messages () {
        return messages;
    },
    get requestPriorityEnum () {
        return requestPriorityEnum;
    },
    get requestStatusEnum () {
        return requestStatusEnum;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _users = require("./users");
const _properties = require("./properties");
const messageStatusEnum = (0, _pgcore.pgEnum)('message_status', [
    'sent',
    'delivered',
    'read'
]);
const requestStatusEnum = (0, _pgcore.pgEnum)('request_status', [
    'pending',
    'in_progress',
    'completed',
    'cancelled'
]);
const requestPriorityEnum = (0, _pgcore.pgEnum)('request_priority', [
    'low',
    'medium',
    'high',
    'urgent'
]);
const messages = (0, _pgcore.pgTable)('messages', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    senderId: (0, _pgcore.uuid)('sender_id').references(()=>_users.users.id).notNull(),
    receiverId: (0, _pgcore.uuid)('receiver_id').references(()=>_users.users.id).notNull(),
    subject: (0, _pgcore.varchar)('subject', {
        length: 255
    }),
    content: (0, _pgcore.text)('content').notNull(),
    status: messageStatusEnum('status').default('sent'),
    isRead: (0, _pgcore.boolean)('is_read').default(false),
    readAt: (0, _pgcore.timestamp)('read_at'),
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow()
});
const maintenanceRequests = (0, _pgcore.pgTable)('maintenance_requests', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, _pgcore.uuid)('tenant_id').references(()=>_users.users.id).notNull(),
    landlordId: (0, _pgcore.uuid)('landlord_id').references(()=>_users.users.id).notNull(),
    propertyId: (0, _pgcore.uuid)('property_id').references(()=>_properties.properties.id).notNull(),
    unitId: (0, _pgcore.uuid)('unit_id'),
    title: (0, _pgcore.varchar)('title', {
        length: 255
    }).notNull(),
    description: (0, _pgcore.text)('description').notNull(),
    priority: requestPriorityEnum('priority').default('medium'),
    status: requestStatusEnum('status').default('pending'),
    images: (0, _pgcore.text)('images').array(),
    comments: (0, _pgcore.text)('comments').default('[]'),
    assignedTo: (0, _pgcore.uuid)('assigned_to').references(()=>_users.users.id),
    completedAt: (0, _pgcore.timestamp)('completed_at'),
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow()
});

//# sourceMappingURL=messages.js.map