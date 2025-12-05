"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _schedulerservice = require("./scheduler.service");
const _tenantpaymentservice = require("./tenant-payment.service");
const _landlordpayoutservice = require("./landlord-payout.service");
const _emailservice = require("../email/email.service");
const _databasemodule = require("../database/database.module");
const _common = require("@nestjs/common");
describe('SchedulerService', ()=>{
    let service;
    let tenantPaymentService;
    let landlordPayoutService;
    let emailService;
    let mockDb;
    let loggerSpy;
    beforeEach(async ()=>{
        // Create mock services
        const mockTenantPaymentService = {
            getContractsWithDuePayments: jest.fn()
        };
        const mockLandlordPayoutService = {
            checkEscrowReleases: jest.fn()
        };
        const mockEmailService = {
            sendPaymentReminder: jest.fn()
        };
        // Create mock database
        mockDb = {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            transaction: jest.fn()
        };
        const module = await _testing.Test.createTestingModule({
            providers: [
                _schedulerservice.SchedulerService,
                {
                    provide: _tenantpaymentservice.TenantPaymentService,
                    useValue: mockTenantPaymentService
                },
                {
                    provide: _landlordpayoutservice.LandlordPayoutService,
                    useValue: mockLandlordPayoutService
                },
                {
                    provide: _emailservice.EmailService,
                    useValue: mockEmailService
                },
                {
                    provide: _databasemodule.DATABASE_CONNECTION,
                    useValue: mockDb
                }
            ]
        }).compile();
        service = module.get(_schedulerservice.SchedulerService);
        tenantPaymentService = module.get(_tenantpaymentservice.TenantPaymentService);
        landlordPayoutService = module.get(_landlordpayoutservice.LandlordPayoutService);
        emailService = module.get(_emailservice.EmailService);
        // Mock the logger to avoid console output during tests
        loggerSpy = jest.spyOn(_common.Logger.prototype, 'log').mockImplementation();
        jest.spyOn(_common.Logger.prototype, 'error').mockImplementation();
        jest.spyOn(_common.Logger.prototype, 'warn').mockImplementation();
        jest.spyOn(_common.Logger.prototype, 'debug').mockImplementation();
    });
    afterEach(()=>{
        jest.clearAllMocks();
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
    describe('checkDuePayments', ()=>{
        it('should log start and completion messages', async ()=>{
            await service.checkDuePayments();
            expect(loggerSpy).toHaveBeenCalledWith('Starting daily payment due check...');
            expect(loggerSpy).toHaveBeenCalledWith('Daily payment due check completed successfully');
        });
        it('should handle errors gracefully', async ()=>{
            const errorSpy = jest.spyOn(_common.Logger.prototype, 'error');
            // Mock an error by overriding the method temporarily
            const originalMethod = service.checkDuePayments;
            service.checkDuePayments = jest.fn().mockRejectedValue(new Error('Test error'));
            await service.checkDuePayments();
            expect(errorSpy).toHaveBeenCalledWith('Error during daily payment due check:', expect.any(Error));
            // Restore original method
            service.checkDuePayments = originalMethod;
        });
    });
    describe('sendPaymentReminders', ()=>{
        it('should log start and completion messages', async ()=>{
            await service.sendPaymentReminders();
            expect(loggerSpy).toHaveBeenCalledWith('Starting payment reminder notifications...');
            expect(loggerSpy).toHaveBeenCalledWith('Payment reminder notifications completed successfully');
        });
        it('should handle errors gracefully', async ()=>{
            const errorSpy = jest.spyOn(_common.Logger.prototype, 'error');
            // Mock an error by overriding the method temporarily
            const originalMethod = service.sendPaymentReminders;
            service.sendPaymentReminders = jest.fn().mockRejectedValue(new Error('Test error'));
            await service.sendPaymentReminders();
            expect(errorSpy).toHaveBeenCalledWith('Error during payment reminder notifications:', expect.any(Error));
            // Restore original method
            service.sendPaymentReminders = originalMethod;
        });
    });
    describe('triggerPaymentDueCheck', ()=>{
        it('should call checkDuePayments method', async ()=>{
            const checkDuePaymentsSpy = jest.spyOn(service, 'checkDuePayments').mockResolvedValue();
            await service.triggerPaymentDueCheck();
            expect(loggerSpy).toHaveBeenCalledWith('Manual trigger: checking due payments...');
            expect(checkDuePaymentsSpy).toHaveBeenCalled();
        });
    });
    describe('triggerPaymentReminders', ()=>{
        it('should call sendPaymentReminders method', async ()=>{
            const sendPaymentRemindersSpy = jest.spyOn(service, 'sendPaymentReminders').mockResolvedValue();
            await service.triggerPaymentReminders();
            expect(loggerSpy).toHaveBeenCalledWith('Manual trigger: sending payment reminders...');
            expect(sendPaymentRemindersSpy).toHaveBeenCalled();
        });
    });
    describe('processEscrowReleases', ()=>{
        it('should process escrow releases successfully', async ()=>{
            const mockResults = [
                {
                    success: true,
                    releasedAmount: 12000,
                    escrowId: 'escrow-1',
                    landlordId: 'landlord-1'
                },
                {
                    success: true,
                    releasedAmount: 15000,
                    escrowId: 'escrow-2',
                    landlordId: 'landlord-2'
                }
            ];
            landlordPayoutService.checkEscrowReleases.mockResolvedValue(mockResults);
            await service.processEscrowReleases();
            expect(loggerSpy).toHaveBeenCalledWith('Starting daily escrow release processing...');
            expect(landlordPayoutService.checkEscrowReleases).toHaveBeenCalled();
            expect(loggerSpy).toHaveBeenCalledWith('Successfully released escrow: 12000 to landlord landlord-1');
            expect(loggerSpy).toHaveBeenCalledWith('Successfully released escrow: 15000 to landlord landlord-2');
        });
        it('should handle escrow release errors gracefully', async ()=>{
            const errorSpy = jest.spyOn(_common.Logger.prototype, 'error');
            landlordPayoutService.checkEscrowReleases.mockRejectedValue(new Error('Database error'));
            await service.processEscrowReleases();
            expect(errorSpy).toHaveBeenCalledWith('Critical error during escrow release processing: Database error', expect.any(String));
        });
        it('should handle mixed success and failure results', async ()=>{
            const mockResults = [
                {
                    success: true,
                    releasedAmount: 12000,
                    escrowId: 'escrow-1',
                    landlordId: 'landlord-1'
                },
                {
                    success: false,
                    escrowId: 'escrow-2',
                    landlordId: 'landlord-2'
                }
            ];
            landlordPayoutService.checkEscrowReleases.mockResolvedValue(mockResults);
            const errorSpy = jest.spyOn(_common.Logger.prototype, 'error');
            await service.processEscrowReleases();
            expect(loggerSpy).toHaveBeenCalledWith('Successfully released escrow: 12000 to landlord landlord-1');
            expect(errorSpy).toHaveBeenCalledWith('Failed to release escrow escrow-2');
        });
    });
    describe('updateOverduePaymentStatuses', ()=>{
        it('should update overdue payment statuses successfully', async ()=>{
            const mockContracts = [
                {
                    id: 'contract-1',
                    nextPaymentDue: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    status: 'active'
                },
                {
                    id: 'contract-2',
                    nextPaymentDue: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
                    status: 'active'
                }
            ];
            mockDb.select.mockReturnValue(mockContracts);
            await service.updateOverduePaymentStatuses();
            expect(loggerSpy).toHaveBeenCalledWith('Starting overdue payment status updates...');
            expect(loggerSpy).toHaveBeenCalledWith('Found 2 contracts with overdue payments');
        });
        it('should handle database errors gracefully', async ()=>{
            const errorSpy = jest.spyOn(_common.Logger.prototype, 'error');
            mockDb.select.mockRejectedValue(new Error('Database connection failed'));
            await service.updateOverduePaymentStatuses();
            expect(errorSpy).toHaveBeenCalledWith('Critical error during overdue status updates: Database connection failed', expect.any(String));
        });
        it('should identify critically overdue contracts', async ()=>{
            const mockContracts = [
                {
                    id: 'contract-1',
                    nextPaymentDue: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
                    status: 'active'
                }
            ];
            mockDb.select.mockReturnValue(mockContracts);
            const errorSpy = jest.spyOn(_common.Logger.prototype, 'error');
            await service.updateOverduePaymentStatuses();
            expect(errorSpy).toHaveBeenCalledWith('Contract contract-1 is critically overdue (35 days)');
        });
    });
    describe('cleanupNotifications', ()=>{
        it('should clean up old notifications successfully', async ()=>{
            mockDb.delete.mockResolvedValue({
                rowCount: 5
            });
            mockDb.update.mockResolvedValue({
                rowCount: 2
            });
            await service.cleanupNotifications();
            expect(loggerSpy).toHaveBeenCalledWith('Starting notification cleanup...');
            expect(mockDb.delete).toHaveBeenCalledTimes(2); // sent and failed notifications
            expect(mockDb.update).toHaveBeenCalledTimes(1); // stale notifications
        });
        it('should handle cleanup errors gracefully', async ()=>{
            const errorSpy = jest.spyOn(_common.Logger.prototype, 'error');
            mockDb.delete.mockRejectedValue(new Error('Delete operation failed'));
            await service.cleanupNotifications();
            expect(errorSpy).toHaveBeenCalledWith('Critical error during notification cleanup: Delete operation failed', expect.any(String));
        });
    });
    describe('executeWithRetry', ()=>{
        it('should succeed on first attempt', async ()=>{
            const mockOperation = jest.fn().mockResolvedValue('success');
            const result = await service.executeWithRetry(mockOperation, 'test operation');
            expect(result).toBe('success');
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });
        it('should retry on failure and eventually succeed', async ()=>{
            const mockOperation = jest.fn().mockRejectedValueOnce(new Error('First failure')).mockRejectedValueOnce(new Error('Second failure')).mockResolvedValue('success');
            const result = await service.executeWithRetry(mockOperation, 'test operation');
            expect(result).toBe('success');
            expect(mockOperation).toHaveBeenCalledTimes(3);
        });
        it('should fail after max retries', async ()=>{
            const mockOperation = jest.fn().mockRejectedValue(new Error('Persistent failure'));
            await expect(service.executeWithRetry(mockOperation, 'test operation', 2)).rejects.toThrow('Persistent failure');
            expect(mockOperation).toHaveBeenCalledTimes(2);
        });
    });
    describe('triggerEscrowReleases', ()=>{
        it('should call processEscrowReleases method', async ()=>{
            const processEscrowReleasesSpy = jest.spyOn(service, 'processEscrowReleases').mockResolvedValue();
            await service.triggerEscrowReleases();
            expect(loggerSpy).toHaveBeenCalledWith('Manual trigger: processing escrow releases...');
            expect(processEscrowReleasesSpy).toHaveBeenCalled();
        });
    });
    describe('triggerOverdueUpdates', ()=>{
        it('should call updateOverduePaymentStatuses method', async ()=>{
            const updateOverduePaymentStatusesSpy = jest.spyOn(service, 'updateOverduePaymentStatuses').mockResolvedValue();
            await service.triggerOverdueUpdates();
            expect(loggerSpy).toHaveBeenCalledWith('Manual trigger: updating overdue payment statuses...');
            expect(updateOverduePaymentStatusesSpy).toHaveBeenCalled();
        });
    });
    describe('triggerNotificationCleanup', ()=>{
        it('should call cleanupNotifications method', async ()=>{
            const cleanupNotificationsSpy = jest.spyOn(service, 'cleanupNotifications').mockResolvedValue();
            await service.triggerNotificationCleanup();
            expect(loggerSpy).toHaveBeenCalledWith('Manual trigger: cleaning up notifications...');
            expect(cleanupNotificationsSpy).toHaveBeenCalled();
        });
    });
    describe('getSchedulerHealth', ()=>{
        it('should return healthy status with metrics', async ()=>{
            mockDb.select.mockReturnValue([
                {
                    total: '10',
                    active: '8',
                    overdue: '2',
                    pending: '5'
                }
            ]);
            const health = await service.getSchedulerHealth();
            expect(health.status).toBe('healthy');
            expect(health.metrics.totalContracts).toBe(10);
            expect(health.metrics.activeContracts).toBe(8);
            expect(health.metrics.overdueContracts).toBe(2);
            expect(health.metrics.pendingNotifications).toBe(5);
        });
        it('should return unhealthy status on database error', async ()=>{
            mockDb.select.mockRejectedValue(new Error('Database error'));
            const health = await service.getSchedulerHealth();
            expect(health.status).toBe('unhealthy');
            expect(health.metrics.totalContracts).toBe(0);
        });
    });
    describe('logOperationMetrics', ()=>{
        it('should log successful operations', ()=>{
            const metrics = {
                processed: 5,
                errors: 0,
                duration: 1000,
                success: true
            };
            service.logOperationMetrics('test_operation', metrics);
            expect(loggerSpy).toHaveBeenCalledWith('[METRICS] test_operation: {"processed":5,"errors":0,"duration":1000,"success":true}');
        });
        it('should log failed operations with error level', ()=>{
            const errorSpy = jest.spyOn(_common.Logger.prototype, 'error');
            const metrics = {
                processed: 3,
                errors: 2,
                duration: 2000,
                success: false,
                criticalError: 'Database timeout'
            };
            service.logOperationMetrics('test_operation', metrics);
            expect(errorSpy).toHaveBeenCalledWith('[METRICS] test_operation: {"processed":3,"errors":2,"duration":2000,"success":false,"criticalError":"Database timeout"}');
        });
    });
});

//# sourceMappingURL=scheduler.service.spec.js.map