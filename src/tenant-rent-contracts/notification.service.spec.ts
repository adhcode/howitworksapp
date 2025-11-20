import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EmailService } from '../email/email.service';
import { DATABASE_CONNECTION } from '../database/database.module';

// Mock Expo SDK
const mockExpo = {
  sendPushNotificationsAsync: jest.fn(),
  chunkPushNotifications: jest.fn(),
  isExpoPushToken: jest.fn(),
};

jest.mock('expo-server-sdk', () => {
  return {
    Expo: jest.fn().mockImplementation(() => mockExpo),
  };
});

describe('NotificationService', () => {
  let service: NotificationService;
  let emailService: jest.Mocked<EmailService>;
  let mockDb: any;
  let loggerSpy: jest.SpyInstance;

  const mockContract = {
    id: 'contract-123',
    tenantId: 'tenant-123',
    landlordId: 'landlord-123',
    monthlyAmount: '2500.00',
    nextPaymentDue: new Date('2024-02-01T00:00:00.000Z'),
    expiryDate: new Date('2025-12-31T23:59:59.000Z'),
  };

  const mockTenant = {
    id: 'tenant-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
    expoPushToken: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  };

  beforeEach(async () => {
    const mockEmailService = {
      sendPaymentReminder: jest.fn(),
      sendPaymentConfirmation: jest.fn(),
      sendEscrowReleaseNotification: jest.fn(),
    };

    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: EmailService, useValue: mockEmailService },
        { provide: DATABASE_CONNECTION, useValue: mockDb },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    emailService = module.get(EmailService);

    // Mock logger to avoid console output during tests
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('schedulePaymentReminder', () => {
    it('should schedule a payment reminder notification', async () => {
      const scheduledFor = new Date('2024-01-29T09:00:00.000Z');
      
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([mockTenant]);
      
      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockResolvedValue({ success: true });

      await service.schedulePaymentReminder(mockContract.id, scheduledFor, 'reminder');

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          contractId: mockContract.id,
          tenantId: mockContract.tenantId,
          notificationType: 'reminder',
          scheduledFor,
          status: 'pending',
        })
      );
    });

    it('should handle different notification types', async () => {
      const scheduledFor = new Date('2024-01-29T09:00:00.000Z');
      
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([mockTenant]);
      
      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockResolvedValue({ success: true });

      // Test overdue notification
      await service.schedulePaymentReminder(mockContract.id, scheduledFor, 'overdue');

      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          notificationType: 'overdue',
          title: expect.stringContaining('Overdue'),
        })
      );
    });

    it('should handle tenant not found', async () => {
      const scheduledFor = new Date('2024-01-29T09:00:00.000Z');
      
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([]); // No tenant found

      await expect(
        service.schedulePaymentReminder(mockContract.id, scheduledFor, 'reminder')
      ).rejects.toThrow('Tenant not found for contract: contract-123');
    });

    it('should generate appropriate notification content', async () => {
      const scheduledFor = new Date('2024-01-29T09:00:00.000Z');
      
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([mockTenant]);
      
      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockResolvedValue({ success: true });

      await service.schedulePaymentReminder(mockContract.id, scheduledFor, 'reminder');

      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Rent Payment Reminder',
          message: expect.stringContaining('John'),
          message: expect.stringContaining('2500'),
        })
      );
    });
  });

  describe('sendImmediateNotification', () => {
    beforeEach(() => {
      mockExpo.isExpoPushToken.mockReturnValue(true);
      mockExpo.chunkPushNotifications.mockReturnValue([
        [{ to: mockTenant.expoPushToken, title: 'Test', body: 'Test message' }]
      ]);
      mockExpo.sendPushNotificationsAsync.mockResolvedValue([
        { status: 'ok', id: 'notification-id-123' }
      ]);
    });

    it('should send immediate push notification', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([mockTenant]);

      const result = await service.sendImmediateNotification(
        mockContract.tenantId,
        'Payment Successful',
        'Your rent payment has been processed successfully.',
        { contractId: mockContract.id }
      );

      expect(result.success).toBe(true);
      expect(result.method).toBe('push');
      expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalled();
    });

    it('should fallback to email if push token is invalid', async () => {
      const tenantWithoutPushToken = { ...mockTenant, expoPushToken: null };
      
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([tenantWithoutPushToken]);

      emailService.sendPaymentReminder.mockResolvedValue();

      const result = await service.sendImmediateNotification(
        mockContract.tenantId,
        'Payment Successful',
        'Your rent payment has been processed successfully.',
        { contractId: mockContract.id }
      );

      expect(result.success).toBe(true);
      expect(result.method).toBe('email');
      expect(emailService.sendPaymentReminder).toHaveBeenCalled();
    });

    it('should handle push notification failures', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([mockTenant]);

      mockExpo.sendPushNotificationsAsync.mockResolvedValue([
        { status: 'error', message: 'DeviceNotRegistered' }
      ]);

      emailService.sendPaymentReminder.mockResolvedValue();

      const result = await service.sendImmediateNotification(
        mockContract.tenantId,
        'Payment Successful',
        'Your rent payment has been processed successfully.'
      );

      expect(result.success).toBe(true);
      expect(result.method).toBe('email');
      expect(emailService.sendPaymentReminder).toHaveBeenCalled();
    });

    it('should handle tenant not found', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([]);

      await expect(
        service.sendImmediateNotification(
          'nonexistent-tenant',
          'Test',
          'Test message'
        )
      ).rejects.toThrow('Tenant not found: nonexistent-tenant');
    });
  });

  describe('processPendingNotifications', () => {
    const mockPendingNotifications = [
      {
        id: 'notification-1',
        contractId: mockContract.id,
        tenantId: mockContract.tenantId,
        notificationType: 'reminder',
        scheduledFor: new Date('2024-01-29T09:00:00.000Z'),
        title: 'Rent Payment Reminder',
        message: 'Your rent payment is due soon.',
        status: 'pending',
        tenant: mockTenant,
      },
      {
        id: 'notification-2',
        contractId: mockContract.id,
        tenantId: mockContract.tenantId,
        notificationType: 'overdue',
        scheduledFor: new Date('2024-01-28T09:00:00.000Z'),
        title: 'Rent Payment Overdue',
        message: 'Your rent payment is overdue.',
        status: 'pending',
        tenant: mockTenant,
      },
    ];

    beforeEach(() => {
      mockExpo.isExpoPushToken.mockReturnValue(true);
      mockExpo.chunkPushNotifications.mockReturnValue([
        mockPendingNotifications.map(n => ({
          to: mockTenant.expoPushToken,
          title: n.title,
          body: n.message,
        }))
      ]);
      mockExpo.sendPushNotificationsAsync.mockResolvedValue([
        { status: 'ok', id: 'receipt-1' },
        { status: 'ok', id: 'receipt-2' },
      ]);
    });

    it('should process pending notifications successfully', async () => {
      const now = new Date('2024-01-29T10:00:00.000Z');
      
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.leftJoin.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(mockPendingNotifications);

      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue({ success: true });

      const result = await service.processPendingNotifications(now);

      expect(result.processed).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalled();
    });

    it('should handle mixed success and failure results', async () => {
      const now = new Date('2024-01-29T10:00:00.000Z');
      
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.leftJoin.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(mockPendingNotifications);

      mockExpo.sendPushNotificationsAsync.mockResolvedValue([
        { status: 'ok', id: 'receipt-1' },
        { status: 'error', message: 'DeviceNotRegistered' },
      ]);

      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue({ success: true });

      const result = await service.processPendingNotifications(now);

      expect(result.processed).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('should handle notifications without push tokens', async () => {
      const now = new Date('2024-01-29T10:00:00.000Z');
      const notificationsWithoutTokens = mockPendingNotifications.map(n => ({
        ...n,
        tenant: { ...mockTenant, expoPushToken: null },
      }));
      
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.leftJoin.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(notificationsWithoutTokens);

      emailService.sendPaymentReminder.mockResolvedValue();

      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue({ success: true });

      const result = await service.processPendingNotifications(now);

      expect(result.processed).toBe(2);
      expect(result.successful).toBe(2);
      expect(emailService.sendPaymentReminder).toHaveBeenCalledTimes(2);
    });

    it('should skip notifications not yet due', async () => {
      const now = new Date('2024-01-28T08:00:00.000Z'); // Before scheduled time
      
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.leftJoin.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue([]);

      const result = await service.processPendingNotifications(now);

      expect(result.processed).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
    });
  });

  describe('sendPaymentConfirmation', () => {
    const mockPaymentData = {
      contractId: mockContract.id,
      amount: 2500,
      paymentMethod: 'card',
      reference: 'payment-ref-123',
      nextPaymentDue: new Date('2024-03-01T00:00:00.000Z'),
    };

    it('should send payment confirmation notification', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([mockTenant]);

      mockExpo.isExpoPushToken.mockReturnValue(true);
      mockExpo.chunkPushNotifications.mockReturnValue([
        [{ to: mockTenant.expoPushToken, title: 'Payment Confirmed', body: 'Payment processed' }]
      ]);
      mockExpo.sendPushNotificationsAsync.mockResolvedValue([
        { status: 'ok', id: 'confirmation-receipt' }
      ]);

      const result = await service.sendPaymentConfirmation(mockContract.tenantId, mockPaymentData);

      expect(result.success).toBe(true);
      expect(result.method).toBe('push');
      expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalled();
    });

    it('should include payment details in confirmation', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([mockTenant]);

      mockExpo.isExpoPushToken.mockReturnValue(true);
      mockExpo.chunkPushNotifications.mockImplementation((notifications) => {
        expect(notifications[0].body).toContain('2500');
        expect(notifications[0].body).toContain('March 1, 2024');
        return [notifications];
      });
      mockExpo.sendPushNotificationsAsync.mockResolvedValue([
        { status: 'ok', id: 'confirmation-receipt' }
      ]);

      await service.sendPaymentConfirmation(mockContract.tenantId, mockPaymentData);

      expect(mockExpo.chunkPushNotifications).toHaveBeenCalled();
    });
  });

  describe('sendEscrowReleaseNotification', () => {
    const mockEscrowData = {
      landlordId: mockContract.landlordId,
      releasedAmount: 15000,
      contractId: mockContract.id,
      releaseDate: new Date('2024-12-31T23:59:59.000Z'),
    };

    it('should send escrow release notification to landlord', async () => {
      const mockLandlord = {
        id: mockContract.landlordId,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        expoPushToken: 'ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]',
      };

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([mockLandlord]);

      mockExpo.isExpoPushToken.mockReturnValue(true);
      mockExpo.chunkPushNotifications.mockReturnValue([
        [{ to: mockLandlord.expoPushToken, title: 'Escrow Released', body: 'Funds released' }]
      ]);
      mockExpo.sendPushNotificationsAsync.mockResolvedValue([
        { status: 'ok', id: 'escrow-receipt' }
      ]);

      const result = await service.sendEscrowReleaseNotification(mockEscrowData);

      expect(result.success).toBe(true);
      expect(result.method).toBe('push');
      expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalled();
    });

    it('should include escrow details in notification', async () => {
      const mockLandlord = {
        id: mockContract.landlordId,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        expoPushToken: 'ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]',
      };

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([mockLandlord]);

      mockExpo.isExpoPushToken.mockReturnValue(true);
      mockExpo.chunkPushNotifications.mockImplementation((notifications) => {
        expect(notifications[0].body).toContain('15000');
        expect(notifications[0].body).toContain('Jane');
        return [notifications];
      });
      mockExpo.sendPushNotificationsAsync.mockResolvedValue([
        { status: 'ok', id: 'escrow-receipt' }
      ]);

      await service.sendEscrowReleaseNotification(mockEscrowData);

      expect(mockExpo.chunkPushNotifications).toHaveBeenCalled();
    });
  });

  describe('getNotificationHistory', () => {
    const mockNotificationHistory = [
      {
        id: 'notification-1',
        contractId: mockContract.id,
        tenantId: mockContract.tenantId,
        notificationType: 'reminder',
        title: 'Rent Payment Reminder',
        status: 'sent',
        sentAt: new Date('2024-01-29T09:00:00.000Z'),
      },
      {
        id: 'notification-2',
        contractId: mockContract.id,
        tenantId: mockContract.tenantId,
        notificationType: 'success',
        title: 'Payment Confirmed',
        status: 'sent',
        sentAt: new Date('2024-01-30T10:00:00.000Z'),
      },
    ];

    it('should get notification history for contract', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(mockNotificationHistory);

      const result = await service.getNotificationHistory(mockContract.id);

      expect(result).toEqual(mockNotificationHistory);
      expect(mockDb.where).toHaveBeenCalledWith(
        expect.objectContaining({
          contractId: mockContract.id,
        })
      );
    });

    it('should filter by notification type', async () => {
      const reminderNotifications = [mockNotificationHistory[0]];
      
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(reminderNotifications);

      const result = await service.getNotificationHistory(mockContract.id, 'reminder');

      expect(result).toEqual(reminderNotifications);
    });

    it('should handle empty history', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue([]);

      const result = await service.getNotificationHistory('nonexistent-contract');

      expect(result).toEqual([]);
    });
  });

  describe('updateNotificationPreferences', () => {
    const mockPreferences = {
      enablePushNotifications: true,
      enableEmailNotifications: false,
      reminderDaysBefore: 3,
      overdueReminderFrequency: 'daily',
    };

    it('should update user notification preferences', async () => {
      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue({ success: true });

      await service.updateNotificationPreferences(mockTenant.id, mockPreferences);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          notificationPreferences: JSON.stringify(mockPreferences),
        })
      );
    });

    it('should handle preference update errors', async () => {
      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockRejectedValue(new Error('Update failed'));

      await expect(
        service.updateNotificationPreferences(mockTenant.id, mockPreferences)
      ).rejects.toThrow('Update failed');
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle Expo service unavailable', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([mockTenant]);

      mockExpo.sendPushNotificationsAsync.mockRejectedValue(
        new Error('Expo service unavailable')
      );

      emailService.sendPaymentReminder.mockResolvedValue();

      const result = await service.sendImmediateNotification(
        mockContract.tenantId,
        'Test',
        'Test message'
      );

      expect(result.success).toBe(true);
      expect(result.method).toBe('email');
      expect(emailService.sendPaymentReminder).toHaveBeenCalled();
    });

    it('should handle invalid push tokens gracefully', async () => {
      const tenantWithInvalidToken = {
        ...mockTenant,
        expoPushToken: 'invalid-token-format',
      };

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([tenantWithInvalidToken]);

      mockExpo.isExpoPushToken.mockReturnValue(false);
      emailService.sendPaymentReminder.mockResolvedValue();

      const result = await service.sendImmediateNotification(
        mockContract.tenantId,
        'Test',
        'Test message'
      );

      expect(result.success).toBe(true);
      expect(result.method).toBe('email');
    });

    it('should handle database connection errors', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        service.sendImmediateNotification(mockContract.tenantId, 'Test', 'Test message')
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle email service failures', async () => {
      const tenantWithoutPushToken = { ...mockTenant, expoPushToken: null };
      
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([tenantWithoutPushToken]);

      emailService.sendPaymentReminder.mockRejectedValue(
        new Error('Email service unavailable')
      );

      await expect(
        service.sendImmediateNotification(mockContract.tenantId, 'Test', 'Test message')
      ).rejects.toThrow('Email service unavailable');
    });

    it('should handle large batch notifications', async () => {
      const now = new Date('2024-01-29T10:00:00.000Z');
      const largeBatch = Array.from({ length: 1000 }, (_, i) => ({
        ...mockPendingNotifications[0],
        id: `notification-${i}`,
      }));
      
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.leftJoin.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(largeBatch);

      // Mock chunking behavior
      mockExpo.chunkPushNotifications.mockImplementation((notifications) => {
        const chunks = [];
        for (let i = 0; i < notifications.length; i += 100) {
          chunks.push(notifications.slice(i, i + 100));
        }
        return chunks;
      });

      mockExpo.sendPushNotificationsAsync.mockImplementation((chunk) => {
        return Promise.resolve(chunk.map(() => ({ status: 'ok', id: 'receipt' })));
      });

      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue({ success: true });

      const result = await service.processPendingNotifications(now);

      expect(result.processed).toBe(1000);
      expect(result.successful).toBe(1000);
      expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalledTimes(10); // 1000/100 chunks
    });
  });
});