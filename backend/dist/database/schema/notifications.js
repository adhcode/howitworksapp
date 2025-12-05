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
    get notifications () {
        return notifications;
    },
    get notificationsRelations () {
        return notificationsRelations;
    },
    get pushTokens () {
        return pushTokens;
    },
    get pushTokensRelations () {
        return pushTokensRelations;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _users = require("./users");
const _drizzleorm = require("drizzle-orm");
const pushTokens = (0, _pgcore.pgTable)('push_tokens', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, _pgcore.uuid)('user_id').references(()=>_users.users.id, {
        onDelete: 'cascade'
    }).notNull(),
    token: (0, _pgcore.varchar)('token', {
        length: 255
    }).unique().notNull(),
    deviceType: (0, _pgcore.varchar)('device_type', {
        length: 50
    }),
    deviceName: (0, _pgcore.varchar)('device_name', {
        length: 255
    }),
    isActive: (0, _pgcore.boolean)('is_active').default(true).notNull(),
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow().notNull(),
    lastUsedAt: (0, _pgcore.timestamp)('last_used_at')
});
const notifications = (0, _pgcore.pgTable)('notifications', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, _pgcore.uuid)('user_id').references(()=>_users.users.id, {
        onDelete: 'cascade'
    }).notNull(),
    title: (0, _pgcore.varchar)('title', {
        length: 255
    }).notNull(),
    body: (0, _pgcore.text)('body').notNull(),
    data: (0, _pgcore.jsonb)('data'),
    type: (0, _pgcore.varchar)('type', {
        length: 50
    }),
    isRead: (0, _pgcore.boolean)('is_read').default(false).notNull(),
    sentAt: (0, _pgcore.timestamp)('sent_at').defaultNow().notNull(),
    readAt: (0, _pgcore.timestamp)('read_at'),
    pushSent: (0, _pgcore.boolean)('push_sent').default(false).notNull(),
    pushSentAt: (0, _pgcore.timestamp)('push_sent_at')
});
const pushTokensRelations = (0, _drizzleorm.relations)(pushTokens, ({ one })=>({
        user: one(_users.users, {
            fields: [
                pushTokens.userId
            ],
            references: [
                _users.users.id
            ]
        })
    }));
const notificationsRelations = (0, _drizzleorm.relations)(notifications, ({ one })=>({
        user: one(_users.users, {
            fields: [
                notifications.userId
            ],
            references: [
                _users.users.id
            ]
        })
    }));

//# sourceMappingURL=notifications.js.map