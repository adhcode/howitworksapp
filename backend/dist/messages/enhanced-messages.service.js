"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EnhancedMessagesService", {
    enumerable: true,
    get: function() {
        return EnhancedMessagesService;
    }
});
const _common = require("@nestjs/common");
const _databasemodule = require("../database/database.module");
const _messages = require("../database/schema/messages");
const _users = require("../database/schema/users");
const _properties = require("../database/schema/properties");
const _tenantinvitations = require("../database/schema/tenant-invitations");
const _drizzleorm = require("drizzle-orm");
const _notificationsservice = require("../notifications/notifications.service");
const _notificationdto = require("../notifications/dto/notification.dto");
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
let EnhancedMessagesService = class EnhancedMessagesService {
    /**
   * Create a message with facilitator routing
   * If tenant sends to landlord and property has facilitator, route to facilitator instead
   */ async createWithFacilitatorRouting(senderId, createMessageDto) {
        try {
            // Get sender info
            const [sender] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, senderId));
            if (!sender) {
                throw new _common.NotFoundException('Sender not found');
            }
            let finalReceiverId = createMessageDto.receiverId;
            // If sender is tenant, check if message should be routed through facilitator
            if (sender.role === 'tenant') {
                const facilitatorId = await this.getFacilitatorForTenantMessage(senderId, createMessageDto.receiverId);
                if (facilitatorId) {
                    finalReceiverId = facilitatorId;
                    console.log(`Routing tenant message from ${senderId} through facilitator ${facilitatorId} instead of ${createMessageDto.receiverId}`);
                }
            }
            // Verify final receiver exists
            const [receiver] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, finalReceiverId));
            if (!receiver) {
                throw new _common.NotFoundException('Receiver not found');
            }
            const messageData = {
                senderId,
                receiverId: finalReceiverId,
                subject: createMessageDto.subject,
                content: createMessageDto.content
            };
            const [message] = await this.db.insert(_messages.messages).values(messageData).returning();
            return message;
        } catch (error) {
            console.error('Error creating message with facilitator routing:', error);
            throw error;
        }
    }
    /**
   * Get facilitator ID for tenant message routing
   */ async getFacilitatorForTenantMessage(tenantId, intendedReceiverId) {
        try {
            // Find the property where tenant is assigned and has a facilitator
            const tenantProperty = await this.db.select({
                propertyId: _properties.properties.id,
                facilitatorId: _properties.properties.facilitatorId,
                landlordId: _properties.properties.landlordId
            }).from(_tenantinvitations.tenantInvitations).leftJoin(_properties.properties, (0, _drizzleorm.eq)(_properties.properties.id, _tenantinvitations.tenantInvitations.propertyId)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantinvitations.tenantInvitations.tenantId, tenantId), (0, _drizzleorm.eq)(_tenantinvitations.tenantInvitations.status, 'accepted'))).limit(1);
            if (tenantProperty.length > 0) {
                const property = tenantProperty[0];
                // If intended receiver is landlord and property has facilitator, route to facilitator
                if (property.landlordId === intendedReceiverId && property.facilitatorId) {
                    return property.facilitatorId;
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting facilitator for tenant message:', error);
            return null;
        }
    }
    /**
   * Create maintenance request with facilitator routing
   */ async createMaintenanceRequestWithRouting(tenantId, createMaintenanceRequestDto) {
        try {
            // Get tenant's property and check for facilitator
            const tenantProperty = await this.db.select({
                propertyId: _properties.properties.id,
                landlordId: _properties.properties.landlordId,
                facilitatorId: _properties.properties.facilitatorId
            }).from(_tenantinvitations.tenantInvitations).leftJoin(_properties.properties, (0, _drizzleorm.eq)(_properties.properties.id, _tenantinvitations.tenantInvitations.propertyId)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantinvitations.tenantInvitations.tenantId, tenantId), (0, _drizzleorm.eq)(_tenantinvitations.tenantInvitations.status, 'accepted'))).limit(1);
            if (!tenantProperty.length) {
                throw new _common.NotFoundException('No active property found for tenant');
            }
            const { propertyId, landlordId, facilitatorId } = tenantProperty[0];
            // Assign to facilitator if available, otherwise to landlord
            const assignedTo = facilitatorId || landlordId;
            const requestData = {
                tenantId,
                landlordId,
                propertyId,
                title: createMaintenanceRequestDto.title,
                description: createMaintenanceRequestDto.description,
                priority: createMaintenanceRequestDto.priority || 'medium',
                images: createMaintenanceRequestDto.images || [],
                assignedTo
            };
            const [request] = await this.db.insert(_messages.maintenanceRequests).values(requestData).returning();
            console.log(`Maintenance request created and assigned to ${facilitatorId ? 'facilitator' : 'landlord'}: ${assignedTo}`);
            // Send notification to assigned person
            try {
                const [tenant] = await this.db.select({
                    firstName: _users.users.firstName,
                    lastName: _users.users.lastName
                }).from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, tenantId));
                const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : 'A tenant';
                const priorityEmoji = requestData.priority === 'urgent' ? '🚨 ' : requestData.priority === 'high' ? '⚠️ ' : '';
                await this.notificationsService.sendNotification(assignedTo, `${priorityEmoji}New Maintenance Request`, `${tenantName} reported: ${requestData.title}`, {
                    type: 'maintenance',
                    id: request.id,
                    screen: 'MaintenanceDetail',
                    priority: requestData.priority
                }, _notificationdto.NotificationType.MAINTENANCE);
            } catch (error) {
                console.error('Error sending maintenance notification:', error);
            // Don't fail the request if notification fails
            }
            return request;
        } catch (error) {
            console.error('Error creating maintenance request with routing:', error);
            throw error;
        }
    }
    /**
   * Get conversations for facilitator (includes tenant-landlord conversations for their properties)
   */ async getFacilitatorConversations(facilitatorId) {
        try {
            // Get all properties assigned to this facilitator
            const facilitatorProperties = await this.db.select({
                id: _properties.properties.id
            }).from(_properties.properties).where((0, _drizzleorm.eq)(_properties.properties.facilitatorId, facilitatorId));
            const propertyIds = facilitatorProperties.map((p)=>p.id);
            if (propertyIds.length === 0) {
                return [];
            }
            // Get all tenants for these properties
            const propertyTenants = await this.db.select({
                tenantId: _tenantinvitations.tenantInvitations.tenantId,
                propertyId: _tenantinvitations.tenantInvitations.propertyId,
                landlordId: _tenantinvitations.tenantInvitations.landlordId
            }).from(_tenantinvitations.tenantInvitations).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantinvitations.tenantInvitations.status, 'accepted'), (0, _drizzleorm.or)(...propertyIds.map((id)=>(0, _drizzleorm.eq)(_tenantinvitations.tenantInvitations.propertyId, id)))));
            // Get messages where facilitator is involved OR messages between tenants and landlords of their properties
            const relevantMessages = await this.db.select({
                id: _messages.messages.id,
                senderId: _messages.messages.senderId,
                receiverId: _messages.messages.receiverId,
                content: _messages.messages.content,
                createdAt: _messages.messages.createdAt
            }).from(_messages.messages).where((0, _drizzleorm.or)(// Messages to/from facilitator
            (0, _drizzleorm.eq)(_messages.messages.senderId, facilitatorId), (0, _drizzleorm.eq)(_messages.messages.receiverId, facilitatorId), // Messages between tenants and landlords for facilitator's properties
            ...propertyTenants.flatMap((pt)=>[
                    (0, _drizzleorm.and)((0, _drizzleorm.eq)(_messages.messages.senderId, pt.tenantId), (0, _drizzleorm.eq)(_messages.messages.receiverId, pt.landlordId)),
                    (0, _drizzleorm.and)((0, _drizzleorm.eq)(_messages.messages.senderId, pt.landlordId), (0, _drizzleorm.eq)(_messages.messages.receiverId, pt.tenantId))
                ]))).orderBy((0, _drizzleorm.desc)(_messages.messages.createdAt));
            // Group conversations
            const conversationsMap = new Map();
            for (const message of relevantMessages){
                let conversationKey;
                let otherUserId;
                if (message.senderId === facilitatorId) {
                    otherUserId = message.receiverId;
                    conversationKey = `${facilitatorId}-${message.receiverId}`;
                } else if (message.receiverId === facilitatorId) {
                    otherUserId = message.senderId;
                    conversationKey = `${message.senderId}-${facilitatorId}`;
                } else {
                    // Message between tenant and landlord - create a group conversation key
                    const tenant = propertyTenants.find((pt)=>pt.tenantId === message.senderId || pt.tenantId === message.receiverId);
                    if (tenant) {
                        conversationKey = `property-${tenant.propertyId}-${tenant.tenantId}-${tenant.landlordId}`;
                        otherUserId = message.senderId === tenant.tenantId ? tenant.landlordId : tenant.tenantId;
                    } else {
                        continue;
                    }
                }
                if (!conversationsMap.has(conversationKey)) {
                    // Get the other user's details
                    const [otherUser] = await this.db.select({
                        firstName: _users.users.firstName,
                        lastName: _users.users.lastName,
                        role: _users.users.role
                    }).from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, otherUserId));
                    if (otherUser) {
                        conversationsMap.set(conversationKey, {
                            conversationKey,
                            otherUserId,
                            otherUserName: otherUser.firstName,
                            otherUserLastName: otherUser.lastName,
                            otherUserRole: otherUser.role,
                            lastMessage: message.content,
                            lastMessageTime: message.createdAt,
                            isGroupConversation: conversationKey.startsWith('property-')
                        });
                    }
                }
            }
            return Array.from(conversationsMap.values());
        } catch (error) {
            console.error('Error getting facilitator conversations:', error);
            return [];
        }
    }
    /**
   * Get maintenance requests for facilitator
   */ async getFacilitatorMaintenanceRequests(facilitatorId) {
        try {
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
                propertyName: _properties.properties.name,
                propertyAddress: _properties.properties.address
            }).from(_messages.maintenanceRequests).leftJoin(_users.users, (0, _drizzleorm.eq)(_users.users.id, _messages.maintenanceRequests.tenantId)).leftJoin(_properties.properties, (0, _drizzleorm.eq)(_properties.properties.id, _messages.maintenanceRequests.propertyId)).where((0, _drizzleorm.eq)(_messages.maintenanceRequests.assignedTo, facilitatorId)).orderBy((0, _drizzleorm.desc)(_messages.maintenanceRequests.createdAt));
        } catch (error) {
            console.error('Error getting facilitator maintenance requests:', error);
            throw error;
        }
    }
    /**
   * Update maintenance request status (facilitator can update)
   */ async updateMaintenanceRequestStatus(requestId, status, facilitatorId, notes) {
        try {
            // Verify facilitator is assigned to this request
            const [request] = await this.db.select().from(_messages.maintenanceRequests).where((0, _drizzleorm.eq)(_messages.maintenanceRequests.id, requestId));
            if (!request) {
                throw new _common.NotFoundException('Maintenance request not found');
            }
            if (request.assignedTo !== facilitatorId) {
                throw new _common.ForbiddenException('You are not assigned to this maintenance request');
            }
            // Update the request
            const updateData = {
                status,
                updatedAt: new Date()
            };
            if (status === 'completed') {
                updateData.completedAt = new Date();
            }
            const [updatedRequest] = await this.db.update(_messages.maintenanceRequests).set(updateData).where((0, _drizzleorm.eq)(_messages.maintenanceRequests.id, requestId)).returning();
            // Send notification message to tenant about status update
            if (notes) {
                await this.db.insert(_messages.messages).values({
                    senderId: facilitatorId,
                    receiverId: request.tenantId,
                    subject: `Maintenance Request Update: ${request.title}`,
                    content: `Your maintenance request status has been updated to "${status}". ${notes}`
                });
            }
            // Send push notification to tenant
            try {
                const statusEmoji = status === 'completed' ? '✅ ' : status === 'in_progress' ? '🔧 ' : '📋 ';
                const statusText = status.replace('_', ' ').toUpperCase();
                await this.notificationsService.sendNotification(request.tenantId, `${statusEmoji}Maintenance Update`, `Your request "${request.title}" is now ${statusText}`, {
                    type: 'maintenance',
                    id: requestId,
                    screen: 'MaintenanceDetail',
                    status
                }, _notificationdto.NotificationType.MAINTENANCE);
            } catch (error) {
                console.error('Error sending status update notification:', error);
            }
            return updatedRequest;
        } catch (error) {
            console.error('Error updating maintenance request status:', error);
            throw error;
        }
    }
    /**
   * Update maintenance request priority
   */ async updateMaintenanceRequestPriority(requestId, priority, userId, notes) {
        try {
            // Get the request
            const [request] = await this.db.select().from(_messages.maintenanceRequests).where((0, _drizzleorm.eq)(_messages.maintenanceRequests.id, requestId));
            if (!request) {
                throw new _common.NotFoundException('Maintenance request not found');
            }
            // Update the priority
            const [updatedRequest] = await this.db.update(_messages.maintenanceRequests).set({
                priority,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_messages.maintenanceRequests.id, requestId)).returning();
            // Send notification to tenant about priority change
            if (notes) {
                await this.db.insert(_messages.messages).values({
                    senderId: userId,
                    receiverId: request.tenantId,
                    subject: `Maintenance Request Priority Updated: ${request.title}`,
                    content: `The priority of your maintenance request has been updated to "${priority}". ${notes}`
                });
            }
            // Send push notification to tenant
            try {
                const priorityEmoji = priority === 'urgent' ? '🚨 ' : priority === 'high' ? '⚠️ ' : priority === 'medium' ? '📋 ' : '✅ ';
                await this.notificationsService.sendNotification(request.tenantId, `${priorityEmoji}Priority Updated`, `Your request "${request.title}" priority changed to ${priority.toUpperCase()}`, {
                    type: 'maintenance',
                    id: requestId,
                    screen: 'MaintenanceDetail',
                    priority
                }, _notificationdto.NotificationType.MAINTENANCE);
            } catch (error) {
                console.error('Error sending priority update notification:', error);
            }
            return updatedRequest;
        } catch (error) {
            console.error('Error updating maintenance request priority:', error);
            throw error;
        }
    }
    /**
   * Get tenant's property facilitator for direct communication
   */ async getTenantPropertyFacilitator(tenantId) {
        try {
            const tenantProperty = await this.db.select({
                facilitatorId: _properties.properties.facilitatorId,
                facilitatorFirstName: _users.users.firstName,
                facilitatorLastName: _users.users.lastName,
                facilitatorEmail: _users.users.email,
                propertyName: _properties.properties.name
            }).from(_tenantinvitations.tenantInvitations).leftJoin(_properties.properties, (0, _drizzleorm.eq)(_properties.properties.id, _tenantinvitations.tenantInvitations.propertyId)).leftJoin(_users.users, (0, _drizzleorm.eq)(_users.users.id, _properties.properties.facilitatorId)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantinvitations.tenantInvitations.tenantId, tenantId), (0, _drizzleorm.eq)(_tenantinvitations.tenantInvitations.status, 'accepted'))).limit(1);
            if (!tenantProperty.length || !tenantProperty[0].facilitatorId) {
                return null;
            }
            const facilitator = tenantProperty[0];
            return {
                id: facilitator.facilitatorId,
                firstName: facilitator.facilitatorFirstName,
                lastName: facilitator.facilitatorLastName,
                email: facilitator.facilitatorEmail,
                propertyName: facilitator.propertyName
            };
        } catch (error) {
            console.error('Error getting tenant property facilitator:', error);
            return null;
        }
    }
    /**
   * Add comment to maintenance request
   */ async addMaintenanceComment(requestId, userId, comment) {
        try {
            // Get the request to find tenant and assigned person
            const [request] = await this.db.select().from(_messages.maintenanceRequests).where((0, _drizzleorm.eq)(_messages.maintenanceRequests.id, requestId));
            if (!request) {
                throw new _common.NotFoundException('Maintenance request not found');
            }
            // Get user info
            const [user] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, userId));
            if (!user) {
                throw new _common.NotFoundException('User not found');
            }
            // Determine receiver based on who is commenting
            let receiverId;
            if (userId === request.tenantId) {
                // Tenant commenting - send to assigned person (facilitator or landlord)
                receiverId = request.assignedTo;
            } else {
                // Landlord/facilitator commenting - send to tenant
                receiverId = request.tenantId;
            }
            // Create message as comment
            await this.db.insert(_messages.messages).values({
                senderId: userId,
                receiverId,
                subject: `Comment on: ${request.title}`,
                content: comment
            });
            // Send push notification
            try {
                await this.notificationsService.sendNotification(receiverId, `💬 New Comment`, `${user.firstName} ${user.lastName}: ${comment.substring(0, 100)}${comment.length > 100 ? '...' : ''}`, {
                    type: 'maintenance',
                    id: requestId,
                    screen: 'MaintenanceDetail'
                }, _notificationdto.NotificationType.MAINTENANCE);
            } catch (error) {
                console.error('Error sending comment notification:', error);
            }
            return {
                success: true,
                message: 'Comment added successfully',
                comment: {
                    userId,
                    userName: `${user.firstName} ${user.lastName}`,
                    comment,
                    createdAt: new Date()
                }
            };
        } catch (error) {
            console.error('Error adding maintenance comment:', error);
            throw error;
        }
    }
    /**
   * Get maintenance request with full details including comments
   */ async getMaintenanceRequestById(requestId, userId) {
        try {
            const [request] = await this.db.select({
                id: _messages.maintenanceRequests.id,
                title: _messages.maintenanceRequests.title,
                description: _messages.maintenanceRequests.description,
                priority: _messages.maintenanceRequests.priority,
                status: _messages.maintenanceRequests.status,
                images: _messages.maintenanceRequests.images,
                createdAt: _messages.maintenanceRequests.createdAt,
                updatedAt: _messages.maintenanceRequests.updatedAt,
                completedAt: _messages.maintenanceRequests.completedAt,
                tenantId: _messages.maintenanceRequests.tenantId,
                landlordId: _messages.maintenanceRequests.landlordId,
                assignedTo: _messages.maintenanceRequests.assignedTo,
                propertyId: _messages.maintenanceRequests.propertyId,
                tenantFirstName: _users.users.firstName,
                tenantLastName: _users.users.lastName,
                propertyName: _properties.properties.name,
                propertyAddress: _properties.properties.address
            }).from(_messages.maintenanceRequests).leftJoin(_users.users, (0, _drizzleorm.eq)(_users.users.id, _messages.maintenanceRequests.tenantId)).leftJoin(_properties.properties, (0, _drizzleorm.eq)(_properties.properties.id, _messages.maintenanceRequests.propertyId)).where((0, _drizzleorm.eq)(_messages.maintenanceRequests.id, requestId));
            if (!request) {
                throw new _common.NotFoundException('Maintenance request not found');
            }
            // Get property facilitator details (only show if property has facilitator)
            let assignedToDetails = null;
            const [propertyDetails] = await this.db.select({
                facilitatorId: _properties.properties.facilitatorId
            }).from(_properties.properties).where((0, _drizzleorm.eq)(_properties.properties.id, request.propertyId));
            // Only set assignedToDetails if property has a facilitator
            if (propertyDetails?.facilitatorId) {
                const [facilitator] = await this.db.select({
                    firstName: _users.users.firstName,
                    lastName: _users.users.lastName,
                    role: _users.users.role
                }).from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, propertyDetails.facilitatorId));
                if (facilitator) {
                    assignedToDetails = {
                        name: `${facilitator.firstName} ${facilitator.lastName}`,
                        role: facilitator.role
                    };
                }
            }
            // Get comments (messages related to this maintenance request)
            // Comments are messages with subject containing the request title
            const relatedMessages = await this.db.select({
                id: _messages.messages.id,
                content: _messages.messages.content,
                createdAt: _messages.messages.createdAt,
                senderId: _messages.messages.senderId,
                senderFirstName: _users.users.firstName,
                senderLastName: _users.users.lastName
            }).from(_messages.messages).leftJoin(_users.users, (0, _drizzleorm.eq)(_users.users.id, _messages.messages.senderId)).where((0, _drizzleorm.or)((0, _drizzleorm.and)((0, _drizzleorm.eq)(_messages.messages.senderId, request.tenantId), (0, _drizzleorm.eq)(_messages.messages.receiverId, request.assignedTo)), (0, _drizzleorm.and)((0, _drizzleorm.eq)(_messages.messages.senderId, request.assignedTo), (0, _drizzleorm.eq)(_messages.messages.receiverId, request.tenantId)))).orderBy((0, _drizzleorm.asc)(_messages.messages.createdAt));
            const comments = relatedMessages.filter((msg)=>msg.content && msg.content.trim().length > 0).map((msg)=>({
                    id: msg.id,
                    comment: msg.content,
                    author: `${msg.senderFirstName} ${msg.senderLastName}`,
                    authorName: `${msg.senderFirstName} ${msg.senderLastName}`,
                    userName: `${msg.senderFirstName} ${msg.senderLastName}`,
                    createdAt: msg.createdAt
                }));
            return {
                ...request,
                tenant: {
                    firstName: request.tenantFirstName,
                    lastName: request.tenantLastName
                },
                property: {
                    name: request.propertyName,
                    address: request.propertyAddress
                },
                assignedToDetails,
                comments
            };
        } catch (error) {
            console.error('Error getting maintenance request by ID:', error);
            throw error;
        }
    }
    constructor(db, notificationsService){
        this.db = db;
        this.notificationsService = notificationsService;
    }
};
EnhancedMessagesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _notificationsservice.NotificationsService === "undefined" ? Object : _notificationsservice.NotificationsService
    ])
], EnhancedMessagesService);

//# sourceMappingURL=enhanced-messages.service.js.map