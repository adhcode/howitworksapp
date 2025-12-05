import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import { BUSINESS_RULES } from '../../shared/constants/business-rules.constant';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  SendNotificationPayload,
  PushNotificationResult,
  EmailNotificationResult,
  SMSNotificationResult,
  NotificationType,
} from './dto/notification.dto';

/**
 * NOTIFICATION SENDER SERVICE
 * 
 * Handles sending notifications through multiple channels:
 * 1. Push notifications (Expo) - Primary channel
 * 2. Email - Secondary channel
 * 3. SMS - Critical alerts only (overdue payments)
 * 
 * Key responsibilities:
 * 1. Send push notifications to mobile app
 * 2. Send email notifications
 * 3. Send SMS for critical alerts
 * 4. Handle notification failures and retries
 * 5. Track delivery status
 */
@Injectable()
export class NotificationSenderService {
  private readonly logger = new Logger(NotificationSenderService.name);

  constructor(
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * SEND MULTI-CHANNEL NOTIFICATION
   * 
   * Sends notification through all enabled channels based on business rules.
   * 
   * Channel priority:
   * 1. Push (if user has push token)
   * 2. Email (always)
   * 3. SMS (overdue only)
   * 
   * @param payload - Notification details
   * @param userEmail - User's email
   * @param userPhone - User's phone (optional, for SMS)
   * @param pushToken - User's Expo push token (optional, for push notifications)
   */
  async sendMultiChannelNotification(
    payload: SendNotificationPayload,
    userEmail: string,
    userPhone?: string,
    pushToken?: string
  ): Promise<void> {
    this.logger.log(`📬 Sending ${payload.type} notification to user ${payload.userId}`);

    const results = {
      push: null as PushNotificationResult | null,
      email: null as EmailNotificationResult | null,
      sms: null as SMSNotificationResult | null,
    };

    // 1. Push Notification (if enabled and user has token)
    if (BUSINESS_RULES.NOTIFICATION_CHANNELS.PUSH.enabled && pushToken) {
      results.push = await this.sendPushNotification(pushToken, payload);
      
      if (results.push.success) {
        this.logger.log(`✅ Push notification sent`);
      } else {
        this.logger.warn(`⚠️ Push notification failed: ${results.push.error}`);
      }
    }

    // 2. Email Notification (always send)
    if (BUSINESS_RULES.NOTIFICATION_CHANNELS.EMAIL.enabled) {
      // Extract first name from payload data if available
      const firstName = payload.data?.firstName || 'User';
      results.email = await this.sendEmailNotification(userEmail, payload, firstName);
      
      if (results.email.success) {
        this.logger.log(`✅ Email notification sent`);
      } else {
        this.logger.warn(`⚠️ Email notification failed: ${results.email.error}`);
      }
    }

    // 3. SMS Notification (overdue only)
    const isOverdueNotification = payload.type === NotificationType.PAYMENT_OVERDUE;
    
    if (
      BUSINESS_RULES.NOTIFICATION_CHANNELS.SMS.enabled &&
      BUSINESS_RULES.NOTIFICATION_CHANNELS.SMS.overdueOnly &&
      isOverdueNotification &&
      userPhone
    ) {
      results.sms = await this.sendSMSNotification(userPhone, payload);
      
      if (results.sms.success) {
        this.logger.log(`✅ SMS notification sent`);
      } else {
        this.logger.warn(`⚠️ SMS notification failed: ${results.sms.error}`);
      }
    }

    // Log summary
    const successCount = Object.values(results).filter(r => r?.success).length;
    const attemptCount = Object.values(results).filter(r => r !== null).length;
    
    this.logger.log(`📊 Notification summary: ${successCount}/${attemptCount} channels succeeded`);
  }

  /**
   * SEND PUSH NOTIFICATION
   * 
   * Sends push notification via Expo Push Notification service.
   * 
   * @param pushToken - Expo push token
   * @param payload - Notification payload
   * @returns Result with receipt ID or error
   */
  async sendPushNotification(
    pushToken: string,
    payload: SendNotificationPayload
  ): Promise<PushNotificationResult> {
    try {
      this.logger.log(`📱 Sending push notification to token: ${pushToken.substring(0, 20)}...`);

      // Use the integrated NotificationsService for Expo push notifications
      await this.notificationsService.sendPushNotificationToToken(
        pushToken,
        payload.title,
        payload.message,
        payload.data
      );
      
      const receiptId = `push_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      this.logger.log(`📱 Push notification sent. Receipt: ${receiptId}`);
      
      return {
        success: true,
        receiptId,
      };
    } catch (error) {
      this.logger.error(`❌ Push notification failed: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * SEND EMAIL NOTIFICATION
   * 
   * Sends email notification via email service.
   * 
   * @param email - User's email address
   * @param payload - Notification payload
   * @param firstName - User's first name
   * @returns Result with message ID or error
   */
  async sendEmailNotification(
    email: string,
    payload: SendNotificationPayload,
    firstName: string = 'User'
  ): Promise<EmailNotificationResult> {
    try {
      this.logger.log(`📧 Sending email to: ${email}`);

      // Use payment reminder email method for payment notifications
      await this.emailService.sendPaymentReminderEmail(
        email,
        firstName,
        payload.title,
        payload.message,
        payload.data?.amount,
        payload.data?.dueDate
      );

      this.logger.log(`📧 Email sent successfully to ${email}`);

      return {
        success: true,
        messageId: `email_${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`❌ Email notification failed: ${error.message}`, error.stack);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * SEND SMS NOTIFICATION
   * 
   * Sends SMS notification for critical alerts (overdue payments).
   * 
   * @param phone - User's phone number
   * @param payload - Notification payload
   * @returns Result with message ID or error
   */
  async sendSMSNotification(
    phone: string,
    payload: SendNotificationPayload
  ): Promise<SMSNotificationResult> {
    try {
      this.logger.log(`📱 Sending SMS to: ${phone}`);

      // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
      // const client = new Twilio(accountSid, authToken);
      // const message = await client.messages.create({
      //   body: `${payload.title}\n\n${payload.message}`,
      //   to: phone,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      // });
      //
      // return {
      //   success: true,
      //   messageId: message.sid,
      // };

      // Mock implementation for development
      const mockMessageId = `sms_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      this.logger.log(`📱 [MOCK] SMS sent. Message ID: ${mockMessageId}`);
      this.logger.log(`   To: ${phone}`);
      this.logger.log(`   Content: ${payload.title}\n   ${payload.message}`);

      return {
        success: true,
        messageId: mockMessageId,
      };
    } catch (error) {
      this.logger.error(`❌ SMS notification failed: ${error.message}`, error.stack);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * FORMAT EMAIL HTML
   * 
   * Creates formatted HTML email body.
   * 
   * @param payload - Notification payload
   * @returns HTML string
   */
  private formatEmailHTML(payload: SendNotificationPayload): string {
    let urgencyColor = '#3498db'; // Blue for info
    
    if (payload.type === NotificationType.PAYMENT_OVERDUE) {
      urgencyColor = '#e74c3c'; // Red for overdue
    } else if (payload.type === NotificationType.PAYMENT_REMINDER) {
      urgencyColor = '#f39c12'; // Orange for reminder
    } else if (payload.type === NotificationType.PAYMENT_SUCCESS) {
      urgencyColor = '#27ae60'; // Green for success
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: ${urgencyColor};
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: ${urgencyColor};
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${payload.title}</h2>
            </div>
            <div class="content">
              <p>${payload.message}</p>
              ${payload.data?.amount ? `<p><strong>Amount: $${payload.data.amount}</strong></p>` : ''}
              ${payload.data?.dueDate ? `<p><strong>Due Date: ${new Date(payload.data.dueDate).toLocaleDateString()}</strong></p>` : ''}
              <a href="${process.env.MOBILE_APP_DEEP_LINK || '#'}" class="button">Open Homezy App</a>
            </div>
            <div class="footer">
              <p>This is an automated message from Homezy</p>
              <p>© ${new Date().getFullYear()} Homezy. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * SEND PAYMENT REMINDER
   * 
   * Convenience method for sending payment reminders.
   * 
   * @param userId - Tenant user ID
   * @param userEmail - Tenant email
   * @param amount - Payment amount
   * @param dueDate - Payment due date
   * @param daysUntilDue - Days until payment is due
   * @param userPhone - Tenant phone (optional)
   * @param pushToken - Expo push token (optional)
   */
  async sendPaymentReminder(
    userId: string,
    userEmail: string,
    amount: number,
    dueDate: Date,
    daysUntilDue: number,
    userPhone?: string,
    pushToken?: string
  ): Promise<void> {
    let type: NotificationType;
    let title: string;
    let message: string;

    if (daysUntilDue < 0) {
      // Overdue
      const daysOverdue = Math.abs(daysUntilDue);
      type = NotificationType.PAYMENT_OVERDUE;
      title = `Rent Payment Overdue - ${daysOverdue} Day${daysOverdue > 1 ? 's' : ''}`;
      message = `Your rent payment of $${amount} was due ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago. Please make payment immediately to avoid penalties.`;
    } else if (daysUntilDue === 0) {
      // Due today
      type = NotificationType.PAYMENT_REMINDER;
      title = 'Rent Payment Due Today';
      message = `Your rent payment of $${amount} is due today. Please make payment before the end of the day.`;
    } else {
      // Upcoming
      type = NotificationType.PAYMENT_REMINDER;
      title = `Rent Payment Reminder - Due in ${daysUntilDue} Day${daysUntilDue > 1 ? 's' : ''}`;
      message = `Friendly reminder: Your rent payment of $${amount} is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}.`;
    }

    const payload: SendNotificationPayload = {
      userId,
      title,
      message,
      type,
      data: {
        amount,
        dueDate: dueDate.toISOString(),
        daysUntilDue,
      },
    };

    await this.sendMultiChannelNotification(payload, userEmail, userPhone, pushToken);
  }
}

