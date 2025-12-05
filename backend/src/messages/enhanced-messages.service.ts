import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { CreateMessageDto, CreateMaintenanceRequestDto } from './dto/message.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { 
  messages, 
  maintenanceRequests, 
  Message, 
  MaintenanceRequest, 
  NewMessage, 
  NewMaintenanceRequest 
} from '../database/schema/messages';
import { users } from '../database/schema/users';
import { properties } from '../database/schema/properties';
import { tenantInvitations } from '../database/schema/tenant-invitations';
import { eq, or, and, desc, asc } from 'drizzle-orm';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/notification.dto';

@Injectable()
export class EnhancedMessagesService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly notificationsService: NotificationsService
  ) {}

  /**
   * Create a message with facilitator routing
   * If tenant sends to landlord and property has facilitator, route to facilitator instead
   */
  async createWithFacilitatorRouting(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      // Get sender info
      const [sender] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, senderId));

      if (!sender) {
        throw new NotFoundException('Sender not found');
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
      const [receiver] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, finalReceiverId));

      if (!receiver) {
        throw new NotFoundException('Receiver not found');
      }

      const messageData: NewMessage = {
        senderId,
        receiverId: finalReceiverId,
        subject: createMessageDto.subject,
        content: createMessageDto.content,
      };

      const [message] = await this.db.insert(messages).values(messageData).returning();
      return message;
    } catch (error) {
      console.error('Error creating message with facilitator routing:', error);
      throw error;
    }
  }

  /**
   * Get facilitator ID for tenant message routing
   */
  private async getFacilitatorForTenantMessage(tenantId: string, intendedReceiverId: string): Promise<string | null> {
    try {
      // Find the property where tenant is assigned and has a facilitator
      const tenantProperty = await this.db
        .select({
          propertyId: properties.id,
          facilitatorId: properties.facilitatorId,
          landlordId: properties.landlordId,
        })
        .from(tenantInvitations)
        .leftJoin(properties, eq(properties.id, tenantInvitations.propertyId))
        .where(and(
          eq(tenantInvitations.tenantId, tenantId),
          eq(tenantInvitations.status, 'accepted')
        ))
        .limit(1);

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
   */
  async createMaintenanceRequestWithRouting(
    tenantId: string, 
    createMaintenanceRequestDto: CreateMaintenanceRequestDto
  ): Promise<MaintenanceRequest> {
    try {
      // Get tenant's property and check for facilitator
      const tenantProperty = await this.db
        .select({
          propertyId: properties.id,
          landlordId: properties.landlordId,
          facilitatorId: properties.facilitatorId,
        })
        .from(tenantInvitations)
        .leftJoin(properties, eq(properties.id, tenantInvitations.propertyId))
        .where(and(
          eq(tenantInvitations.tenantId, tenantId),
          eq(tenantInvitations.status, 'accepted')
        ))
        .limit(1);

      if (!tenantProperty.length) {
        throw new NotFoundException('No active property found for tenant');
      }

      const { propertyId, landlordId, facilitatorId } = tenantProperty[0];

      // Assign to facilitator if available, otherwise to landlord
      const assignedTo = facilitatorId || landlordId;

      const requestData: NewMaintenanceRequest = {
        tenantId,
        landlordId,
        propertyId,
        title: createMaintenanceRequestDto.title,
        description: createMaintenanceRequestDto.description,
        priority: createMaintenanceRequestDto.priority || 'medium',
        images: createMaintenanceRequestDto.images || [],
        assignedTo, // This will be facilitator if available
      };

      const [request] = await this.db.insert(maintenanceRequests).values(requestData).returning();

      console.log(`Maintenance request created and assigned to ${facilitatorId ? 'facilitator' : 'landlord'}: ${assignedTo}`);
      
      // Send notification to assigned person
      try {
        const [tenant] = await this.db
          .select({ firstName: users.firstName, lastName: users.lastName })
          .from(users)
          .where(eq(users.id, tenantId));

        const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : 'A tenant';
        const priorityEmoji = requestData.priority === 'urgent' ? '🚨 ' : requestData.priority === 'high' ? '⚠️ ' : '';

        await this.notificationsService.sendNotification(
          assignedTo,
          `${priorityEmoji}New Maintenance Request`,
          `${tenantName} reported: ${requestData.title}`,
          {
            type: 'maintenance',
            id: request.id,
            screen: 'MaintenanceDetail',
            priority: requestData.priority,
          },
          NotificationType.MAINTENANCE
        );
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
   */
  async getFacilitatorConversations(facilitatorId: string) {
    try {
      // Get all properties assigned to this facilitator
      const facilitatorProperties = await this.db
        .select({ id: properties.id })
        .from(properties)
        .where(eq(properties.facilitatorId, facilitatorId));

      const propertyIds = facilitatorProperties.map(p => p.id);

      if (propertyIds.length === 0) {
        return [];
      }

      // Get all tenants for these properties
      const propertyTenants = await this.db
        .select({
          tenantId: tenantInvitations.tenantId,
          propertyId: tenantInvitations.propertyId,
          landlordId: tenantInvitations.landlordId,
        })
        .from(tenantInvitations)
        .where(and(
          eq(tenantInvitations.status, 'accepted'),
          or(...propertyIds.map(id => eq(tenantInvitations.propertyId, id)))
        ));

      // Get messages where facilitator is involved OR messages between tenants and landlords of their properties
      const relevantMessages = await this.db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
          content: messages.content,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(
          or(
            // Messages to/from facilitator
            eq(messages.senderId, facilitatorId),
            eq(messages.receiverId, facilitatorId),
            // Messages between tenants and landlords for facilitator's properties
            ...propertyTenants.flatMap(pt => [
              and(eq(messages.senderId, pt.tenantId), eq(messages.receiverId, pt.landlordId)),
              and(eq(messages.senderId, pt.landlordId), eq(messages.receiverId, pt.tenantId))
            ])
          )
        )
        .orderBy(desc(messages.createdAt));

      // Group conversations
      const conversationsMap = new Map();
      
      for (const message of relevantMessages) {
        let conversationKey: string;
        let otherUserId: string;

        if (message.senderId === facilitatorId) {
          otherUserId = message.receiverId;
          conversationKey = `${facilitatorId}-${message.receiverId}`;
        } else if (message.receiverId === facilitatorId) {
          otherUserId = message.senderId;
          conversationKey = `${message.senderId}-${facilitatorId}`;
        } else {
          // Message between tenant and landlord - create a group conversation key
          const tenant = propertyTenants.find(pt => 
            pt.tenantId === message.senderId || pt.tenantId === message.receiverId
          );
          if (tenant) {
            conversationKey = `property-${tenant.propertyId}-${tenant.tenantId}-${tenant.landlordId}`;
            otherUserId = message.senderId === tenant.tenantId ? tenant.landlordId : tenant.tenantId;
          } else {
            continue;
          }
        }

        if (!conversationsMap.has(conversationKey)) {
          // Get the other user's details
          const [otherUser] = await this.db
            .select({
              firstName: users.firstName,
              lastName: users.lastName,
              role: users.role,
            })
            .from(users)
            .where(eq(users.id, otherUserId));

          if (otherUser) {
            conversationsMap.set(conversationKey, {
              conversationKey,
              otherUserId,
              otherUserName: otherUser.firstName,
              otherUserLastName: otherUser.lastName,
              otherUserRole: otherUser.role,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
              isGroupConversation: conversationKey.startsWith('property-'),
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
   */
  async getFacilitatorMaintenanceRequests(facilitatorId: string) {
    try {
      return this.db
        .select({
          id: maintenanceRequests.id,
          title: maintenanceRequests.title,
          description: maintenanceRequests.description,
          priority: maintenanceRequests.priority,
          status: maintenanceRequests.status,
          images: maintenanceRequests.images,
          createdAt: maintenanceRequests.createdAt,
          updatedAt: maintenanceRequests.updatedAt,
          tenantName: users.firstName,
          tenantLastName: users.lastName,
          propertyName: properties.name,
          propertyAddress: properties.address,
        })
        .from(maintenanceRequests)
        .leftJoin(users, eq(users.id, maintenanceRequests.tenantId))
        .leftJoin(properties, eq(properties.id, maintenanceRequests.propertyId))
        .where(eq(maintenanceRequests.assignedTo, facilitatorId))
        .orderBy(desc(maintenanceRequests.createdAt));
    } catch (error) {
      console.error('Error getting facilitator maintenance requests:', error);
      throw error;
    }
  }

  /**
   * Update maintenance request status (facilitator can update)
   */
  async updateMaintenanceRequestStatus(
    requestId: string, 
    status: string, 
    facilitatorId: string,
    notes?: string
  ) {
    try {
      // Verify facilitator is assigned to this request
      const [request] = await this.db
        .select()
        .from(maintenanceRequests)
        .where(eq(maintenanceRequests.id, requestId));

      if (!request) {
        throw new NotFoundException('Maintenance request not found');
      }

      if (request.assignedTo !== facilitatorId) {
        throw new ForbiddenException('You are not assigned to this maintenance request');
      }

      // Update the request
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (status === 'completed') {
        updateData.completedAt = new Date();
      }

      const [updatedRequest] = await this.db
        .update(maintenanceRequests)
        .set(updateData)
        .where(eq(maintenanceRequests.id, requestId))
        .returning();

      // Send notification message to tenant about status update
      if (notes) {
        await this.db.insert(messages).values({
          senderId: facilitatorId,
          receiverId: request.tenantId,
          subject: `Maintenance Request Update: ${request.title}`,
          content: `Your maintenance request status has been updated to "${status}". ${notes}`,
        });
      }

      // Send push notification to tenant
      try {
        const statusEmoji = status === 'completed' ? '✅ ' : status === 'in_progress' ? '🔧 ' : '📋 ';
        const statusText = status.replace('_', ' ').toUpperCase();

        await this.notificationsService.sendNotification(
          request.tenantId,
          `${statusEmoji}Maintenance Update`,
          `Your request "${request.title}" is now ${statusText}`,
          {
            type: 'maintenance',
            id: requestId,
            screen: 'MaintenanceDetail',
            status,
          },
          NotificationType.MAINTENANCE
        );
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
   */
  async updateMaintenanceRequestPriority(
    requestId: string, 
    priority: string, 
    userId: string,
    notes?: string
  ) {
    try {
      // Get the request
      const [request] = await this.db
        .select()
        .from(maintenanceRequests)
        .where(eq(maintenanceRequests.id, requestId));

      if (!request) {
        throw new NotFoundException('Maintenance request not found');
      }

      // Update the priority
      const [updatedRequest] = await this.db
        .update(maintenanceRequests)
        .set({
          priority,
          updatedAt: new Date(),
        })
        .where(eq(maintenanceRequests.id, requestId))
        .returning();

      // Send notification to tenant about priority change
      if (notes) {
        await this.db.insert(messages).values({
          senderId: userId,
          receiverId: request.tenantId,
          subject: `Maintenance Request Priority Updated: ${request.title}`,
          content: `The priority of your maintenance request has been updated to "${priority}". ${notes}`,
        });
      }

      // Send push notification to tenant
      try {
        const priorityEmoji = priority === 'urgent' ? '🚨 ' : priority === 'high' ? '⚠️ ' : priority === 'medium' ? '📋 ' : '✅ ';

        await this.notificationsService.sendNotification(
          request.tenantId,
          `${priorityEmoji}Priority Updated`,
          `Your request "${request.title}" priority changed to ${priority.toUpperCase()}`,
          {
            type: 'maintenance',
            id: requestId,
            screen: 'MaintenanceDetail',
            priority,
          },
          NotificationType.MAINTENANCE
        );
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
   */
  async getTenantPropertyFacilitator(tenantId: string) {
    try {
      const tenantProperty = await this.db
        .select({
          facilitatorId: properties.facilitatorId,
          facilitatorFirstName: users.firstName,
          facilitatorLastName: users.lastName,
          facilitatorEmail: users.email,
          propertyName: properties.name,
        })
        .from(tenantInvitations)
        .leftJoin(properties, eq(properties.id, tenantInvitations.propertyId))
        .leftJoin(users, eq(users.id, properties.facilitatorId))
        .where(and(
          eq(tenantInvitations.tenantId, tenantId),
          eq(tenantInvitations.status, 'accepted')
        ))
        .limit(1);

      if (!tenantProperty.length || !tenantProperty[0].facilitatorId) {
        return null;
      }

      const facilitator = tenantProperty[0];
      return {
        id: facilitator.facilitatorId,
        firstName: facilitator.facilitatorFirstName,
        lastName: facilitator.facilitatorLastName,
        email: facilitator.facilitatorEmail,
        propertyName: facilitator.propertyName,
      };
    } catch (error) {
      console.error('Error getting tenant property facilitator:', error);
      return null;
    }
  }

  /**
   * Add comment to maintenance request
   */
  async addMaintenanceComment(
    requestId: string,
    userId: string,
    comment: string
  ) {
    try {
      // Get the request to find tenant and assigned person
      const [request] = await this.db
        .select()
        .from(maintenanceRequests)
        .where(eq(maintenanceRequests.id, requestId));

      if (!request) {
        throw new NotFoundException('Maintenance request not found');
      }

      // Get user info
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Determine receiver based on who is commenting
      let receiverId: string;
      if (userId === request.tenantId) {
        // Tenant commenting - send to assigned person (facilitator or landlord)
        receiverId = request.assignedTo;
      } else {
        // Landlord/facilitator commenting - send to tenant
        receiverId = request.tenantId;
      }

      // Create message as comment
      await this.db.insert(messages).values({
        senderId: userId,
        receiverId,
        subject: `Comment on: ${request.title}`,
        content: comment,
      });

      // Send push notification
      try {
        await this.notificationsService.sendNotification(
          receiverId,
          `💬 New Comment`,
          `${user.firstName} ${user.lastName}: ${comment.substring(0, 100)}${comment.length > 100 ? '...' : ''}`,
          {
            type: 'maintenance',
            id: requestId,
            screen: 'MaintenanceDetail',
          },
          NotificationType.MAINTENANCE
        );
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
          createdAt: new Date(),
        },
      };
    } catch (error) {
      console.error('Error adding maintenance comment:', error);
      throw error;
    }
  }

  /**
   * Get maintenance request with full details including comments
   */
  async getMaintenanceRequestById(requestId: string, userId: string) {
    try {
      const [request] = await this.db
        .select({
          id: maintenanceRequests.id,
          title: maintenanceRequests.title,
          description: maintenanceRequests.description,
          priority: maintenanceRequests.priority,
          status: maintenanceRequests.status,
          images: maintenanceRequests.images,
          createdAt: maintenanceRequests.createdAt,
          updatedAt: maintenanceRequests.updatedAt,
          completedAt: maintenanceRequests.completedAt,
          tenantId: maintenanceRequests.tenantId,
          landlordId: maintenanceRequests.landlordId,
          assignedTo: maintenanceRequests.assignedTo,
          propertyId: maintenanceRequests.propertyId,
          tenantFirstName: users.firstName,
          tenantLastName: users.lastName,
          propertyName: properties.name,
          propertyAddress: properties.address,
        })
        .from(maintenanceRequests)
        .leftJoin(users, eq(users.id, maintenanceRequests.tenantId))
        .leftJoin(properties, eq(properties.id, maintenanceRequests.propertyId))
        .where(eq(maintenanceRequests.id, requestId));

      if (!request) {
        throw new NotFoundException('Maintenance request not found');
      }

      // Get property facilitator details (only show if property has facilitator)
      let assignedToDetails: { name: string; role: any } | null = null;
      const [propertyDetails] = await this.db
        .select({
          facilitatorId: properties.facilitatorId,
        })
        .from(properties)
        .where(eq(properties.id, request.propertyId));

      // Only set assignedToDetails if property has a facilitator
      if (propertyDetails?.facilitatorId) {
        const [facilitator] = await this.db
          .select({
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
          })
          .from(users)
          .where(eq(users.id, propertyDetails.facilitatorId));

        if (facilitator) {
          assignedToDetails = {
            name: `${facilitator.firstName} ${facilitator.lastName}`,
            role: facilitator.role,
          };
        }
      }

      // Get comments (messages related to this maintenance request)
      // Comments are messages with subject containing the request title
      const relatedMessages = await this.db
        .select({
          id: messages.id,
          content: messages.content,
          createdAt: messages.createdAt,
          senderId: messages.senderId,
          senderFirstName: users.firstName,
          senderLastName: users.lastName,
        })
        .from(messages)
        .leftJoin(users, eq(users.id, messages.senderId))
        .where(
          or(
            and(
              eq(messages.senderId, request.tenantId),
              eq(messages.receiverId, request.assignedTo)
            ),
            and(
              eq(messages.senderId, request.assignedTo),
              eq(messages.receiverId, request.tenantId)
            )
          )
        )
        .orderBy(asc(messages.createdAt));

      const comments = relatedMessages
        .filter(msg => msg.content && msg.content.trim().length > 0)
        .map(msg => ({
          id: msg.id,
          comment: msg.content,
          author: `${msg.senderFirstName} ${msg.senderLastName}`,
          authorName: `${msg.senderFirstName} ${msg.senderLastName}`,
          userName: `${msg.senderFirstName} ${msg.senderLastName}`,
          createdAt: msg.createdAt,
        }));

      return {
        ...request,
        tenant: {
          firstName: request.tenantFirstName,
          lastName: request.tenantLastName,
        },
        property: {
          name: request.propertyName,
          address: request.propertyAddress,
        },
        assignedToDetails,
        comments,
      };
    } catch (error) {
      console.error('Error getting maintenance request by ID:', error);
      throw error;
    }
  }
}



