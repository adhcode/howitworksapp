import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { CreateMessageDto, CreateMaintenanceRequestDto } from './dto/message.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { messages, maintenanceRequests, Message, MaintenanceRequest, NewMessage, NewMaintenanceRequest } from '../database/schema/messages';
import { users } from '../database/schema/users';
import { properties } from '../database/schema/properties';
import { eq, or, and, desc, asc } from 'drizzle-orm';

@Injectable()
export class MessagesService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async create(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    // Verify receiver exists
    const [receiver] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, createMessageDto.receiverId));

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    const messageData: NewMessage = {
      senderId,
      receiverId: createMessageDto.receiverId,
      subject: createMessageDto.subject,
      content: createMessageDto.content,
    };

    const [message] = await this.db.insert(messages).values(messageData).returning();
    return message;
  }

  async getConversations(userId: string) {
    try {
      // Get all messages where user is sender or receiver
      const userMessages = await this.db
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
            eq(messages.senderId, userId),
            eq(messages.receiverId, userId)
          )
        )
        .orderBy(desc(messages.createdAt));

      // Group by other user and get latest message
      const conversationsMap = new Map();
      
      for (const message of userMessages) {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        
        if (!conversationsMap.has(otherUserId)) {
          // Get the other user's details
          const [otherUser] = await this.db
            .select({
              firstName: users.firstName,
              lastName: users.lastName,
            })
            .from(users)
            .where(eq(users.id, otherUserId));

          if (otherUser) {
            conversationsMap.set(otherUserId, {
              otherUserId,
              otherUserName: otherUser.firstName,
              otherUserLastName: otherUser.lastName,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
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

  async getConversation(
    userId: string, 
    otherUserId: string, 
    paginationDto: PaginationDto
  ) {
    const { page = 1, limit = 20 } = paginationDto;
    const offset = (page - 1) * limit;

    const conversation = await this.db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        subject: messages.subject,
        content: messages.content,
        status: messages.status,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        senderName: users.firstName,
        senderLastName: users.lastName,
      })
      .from(messages)
      .leftJoin(users, eq(users.id, messages.senderId))
      .where(
        or(
          and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
          and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId))
        )
      )
      .orderBy(asc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return conversation;
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    // Verify user is the receiver of the message
    const [message] = await this.db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException('You can only mark your own messages as read');
    }

    const [updatedMessage] = await this.db
      .update(messages)
      .set({ 
        isRead: true, 
        readAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(messages.id, messageId))
      .returning();

    return updatedMessage;
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const unreadMessages = await this.db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );

    return { count: unreadMessages.length };
  }

  // Maintenance Request methods
  async createMaintenanceRequest(
    tenantId: string, 
    createMaintenanceRequestDto: CreateMaintenanceRequestDto
  ): Promise<MaintenanceRequest> {
    // For now, get the first available property and its landlord
    // This should be improved with proper tenant-property relationships
    const tenantProperty = await this.db
      .select({
        propertyId: properties.id,
        landlordId: properties.landlordId,
      })
      .from(properties)
      .limit(1);

    if (!tenantProperty.length) {
      throw new NotFoundException('No properties available');
    }

    const { propertyId, landlordId } = tenantProperty[0];

    const requestData: NewMaintenanceRequest = {
      tenantId,
      landlordId,
      propertyId,
      title: createMaintenanceRequestDto.title,
      description: createMaintenanceRequestDto.description,
      priority: createMaintenanceRequestDto.priority || 'medium',
      images: createMaintenanceRequestDto.images || [],
    };

    const [request] = await this.db.insert(maintenanceRequests).values(requestData).returning();
    return request;
  }

  async getMaintenanceRequests(userId: string, role: string) {
    const whereCondition = role === 'tenant' 
      ? eq(maintenanceRequests.tenantId, userId)
      : eq(maintenanceRequests.landlordId, userId);

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
      })
      .from(maintenanceRequests)
      .leftJoin(users, eq(users.id, maintenanceRequests.tenantId))
      .leftJoin(properties, eq(properties.id, maintenanceRequests.propertyId))
      .where(whereCondition)
      .orderBy(desc(maintenanceRequests.createdAt));
  }
} 