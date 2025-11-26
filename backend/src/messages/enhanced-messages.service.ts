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

@Injectable()
export class EnhancedMessagesService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

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

      return updatedRequest;
    } catch (error) {
      console.error('Error updating maintenance request status:', error);
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
}



