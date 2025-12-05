"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MessagesService", {
    enumerable: true,
    get: function() {
        return MessagesService;
    }
});
const _common = require("@nestjs/common");
const _databasemodule = require("../database/database.module");
const _messages = require("../database/schema/messages");
const _users = require("../database/schema/users");
const _properties = require("../database/schema/properties");
const _drizzleorm = require("drizzle-orm");
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
let MessagesService = class MessagesService {
    async create(senderId, createMessageDto) {
        // Verify receiver exists
        const [receiver] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, createMessageDto.receiverId));
        if (!receiver) {
            throw new _common.NotFoundException('Receiver not found');
        }
        const messageData = {
            senderId,
            receiverId: createMessageDto.receiverId,
            subject: createMessageDto.subject,
            content: createMessageDto.content
        };
        const [message] = await this.db.insert(_messages.messages).values(messageData).returning();
        return message;
    }
    async getConversations(userId) {
        try {
            // Get all messages where user is sender or receiver
            const userMessages = await this.db.select({
                id: _messages.messages.id,
                senderId: _messages.messages.senderId,
                receiverId: _messages.messages.receiverId,
                content: _messages.messages.content,
                createdAt: _messages.messages.createdAt
            }).from(_messages.messages).where((0, _drizzleorm.or)((0, _drizzleorm.eq)(_messages.messages.senderId, userId), (0, _drizzleorm.eq)(_messages.messages.receiverId, userId))).orderBy((0, _drizzleorm.desc)(_messages.messages.createdAt));
            // Group by other user and get latest message
            const conversationsMap = new Map();
            for (const message of userMessages){
                const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
                if (!conversationsMap.has(otherUserId)) {
                    // Get the other user's details
                    const [otherUser] = await this.db.select({
                        firstName: _users.users.firstName,
                        lastName: _users.users.lastName
                    }).from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, otherUserId));
                    if (otherUser) {
                        conversationsMap.set(otherUserId, {
                            otherUserId,
                            otherUserName: otherUser.firstName,
                            otherUserLastName: otherUser.lastName,
                            lastMessage: message.content,
                            lastMessageTime: message.createdAt
                        });
                    }
                }
            }
            return Array.from(conversationsMap.values());
        } catch (error) {
            console.error('Error getting conversations:', error);
            return [];
        }
    }
    async getConversation(userId, otherUserId, paginationDto) {
        const { page = 1, limit = 20 } = paginationDto;
        const offset = (page - 1) * limit;
        const conversation = await this.db.select({
            id: _messages.messages.id,
            senderId: _messages.messages.senderId,
            receiverId: _messages.messages.receiverId,
            subject: _messages.messages.subject,
            content: _messages.messages.content,
            status: _messages.messages.status,
            isRead: _messages.messages.isRead,
            createdAt: _messages.messages.createdAt,
            senderName: _users.users.firstName,
            senderLastName: _users.users.lastName
        }).from(_messages.messages).leftJoin(_users.users, (0, _drizzleorm.eq)(_users.users.id, _messages.messages.senderId)).where((0, _drizzleorm.or)((0, _drizzleorm.and)((0, _drizzleorm.eq)(_messages.messages.senderId, userId), (0, _drizzleorm.eq)(_messages.messages.receiverId, otherUserId)), (0, _drizzleorm.and)((0, _drizzleorm.eq)(_messages.messages.senderId, otherUserId), (0, _drizzleorm.eq)(_messages.messages.receiverId, userId)))).orderBy((0, _drizzleorm.asc)(_messages.messages.createdAt)).limit(limit).offset(offset);
        return conversation;
    }
    async markAsRead(messageId, userId) {
        // Verify user is the receiver of the message
        const [message] = await this.db.select().from(_messages.messages).where((0, _drizzleorm.eq)(_messages.messages.id, messageId));
        if (!message) {
            throw new _common.NotFoundException('Message not found');
        }
        if (message.receiverId !== userId) {
            throw new _common.ForbiddenException('You can only mark your own messages as read');
        }
        const [updatedMessage] = await this.db.update(_messages.messages).set({
            isRead: true,
            readAt: new Date(),
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_messages.messages.id, messageId)).returning();
        return updatedMessage;
    }
    async getUnreadCount(userId) {
        const unreadMessages = await this.db.select().from(_messages.messages).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_messages.messages.receiverId, userId), (0, _drizzleorm.eq)(_messages.messages.isRead, false)));
        return {
            count: unreadMessages.length
        };
    }
    // Maintenance Request methods
    async createMaintenanceRequest(tenantId, createMaintenanceRequestDto) {
        // For now, get the first available property and its landlord
        // This should be improved with proper tenant-property relationships
        const tenantProperty = await this.db.select({
            propertyId: _properties.properties.id,
            landlordId: _properties.properties.landlordId
        }).from(_properties.properties).limit(1);
        if (!tenantProperty.length) {
            throw new _common.NotFoundException('No properties available');
        }
        const { propertyId, landlordId } = tenantProperty[0];
        const requestData = {
            tenantId,
            landlordId,
            propertyId,
            title: createMaintenanceRequestDto.title,
            description: createMaintenanceRequestDto.description,
            priority: createMaintenanceRequestDto.priority || 'medium',
            images: createMaintenanceRequestDto.images || []
        };
        const [request] = await this.db.insert(_messages.maintenanceRequests).values(requestData).returning();
        return request;
    }
    async getMaintenanceRequests(userId, role) {
        const whereCondition = role === 'tenant' ? (0, _drizzleorm.eq)(_messages.maintenanceRequests.tenantId, userId) : (0, _drizzleorm.eq)(_messages.maintenanceRequests.landlordId, userId);
        return this.db.select({
            id: _messages.maintenanceRequests.id,
            title: _messages.maintenanceRequests.title,
            description: _messages.maintenanceRequests.description,
            priority: _messages.maintenanceRequests.priority,
            status: _messages.maintenanceRequests.status,
            images: _messages.maintenanceRequests.images,
            createdAt: _messages.maintenanceRequests.createdAt,
            updatedAt: _messages.maintenanceRequests.updatedAt,
            tenantName: _users.users.firstName,
            tenantLastName: _users.users.lastName,
            propertyName: _properties.properties.name
        }).from(_messages.maintenanceRequests).leftJoin(_users.users, (0, _drizzleorm.eq)(_users.users.id, _messages.maintenanceRequests.tenantId)).leftJoin(_properties.properties, (0, _drizzleorm.eq)(_properties.properties.id, _messages.maintenanceRequests.propertyId)).where(whereCondition).orderBy((0, _drizzleorm.desc)(_messages.maintenanceRequests.createdAt));
    }
    constructor(db){
        this.db = db;
    }
};
MessagesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], MessagesService);

//# sourceMappingURL=messages.service.js.map