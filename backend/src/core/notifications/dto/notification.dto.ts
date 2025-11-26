import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  PAYMENT_REMINDER = 'reminder',
  PAYMENT_OVERDUE = 'overdue',
  PAYMENT_SUCCESS = 'success',
  ESCROW_RELEASE = 'escrow_release',
  CONTRACT_EXPIRING = 'contract_expiring',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

export class NotificationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  contractId: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty({ enum: NotificationType })
  notificationType: NotificationType;

  @ApiProperty()
  scheduledFor: Date;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: NotificationStatus })
  status: NotificationStatus;

  @ApiProperty({ required: false })
  sentAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export interface SendNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, any>;
}

export interface PushNotificationResult {
  success: boolean;
  receiptId?: string;
  error?: string;
}

export interface EmailNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SMSNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}



