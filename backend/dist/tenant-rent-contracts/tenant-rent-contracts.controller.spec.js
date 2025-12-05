"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _tenantrentcontractscontroller = require("./tenant-rent-contracts.controller");
const _tenantpaymentservice = require("./tenant-payment.service");
const _landlordpayoutservice = require("./landlord-payout.service");
const _schedulerservice = require("./scheduler.service");
const _tenantrentcontractdto = require("./dto/tenant-rent-contract.dto");
describe('TenantRentContractsController', ()=>{
    let controller;
    let tenantPaymentService;
    let landlordPayoutService;
    let schedulerService;
    const mockContract = {
        id: 'contract-123',
        tenantId: 'tenant-123',
        landlordId: 'landlord-123',
        propertyId: 'property-123',
        unitId: 'unit-123',
        monthlyAmount: '2500.00',
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: _tenantrentcontractdto.LandlordPayoutType.MONTHLY,
        nextPaymentDue: new Date('2024-02-01T00:00:00.000Z'),
        transitionStartDate: new Date('2024-01-01T00:00:00.000Z'),
        status: 'active',
        isExistingTenant: false,
        originalExpiryDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const mockEscrowBalance = {
        id: 'escrow-123',
        landlordId: 'landlord-123',
        contractId: 'contract-123',
        totalEscrowed: '7500.00',
        monthsAccumulated: 3,
        expectedReleaseDate: new Date('2025-12-31T23:59:59.000Z'),
        isReleased: false,
        releasedAt: null,
        releasedAmount: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    beforeEach(async ()=>{
        const mockTenantPaymentService = {
            createRentContract: jest.fn(),
            getContractById: jest.fn(),
            getActiveContracts: jest.fn(),
            getAllContracts: jest.fn(),
            processMonthlyPayment: jest.fn(),
            updateContractStatus: jest.fn(),
            getContractsWithDuePayments: jest.fn(),
            getExpiringContracts: jest.fn(),
            getLandlordEscrowBalances: jest.fn(),
            getTotalEscrowedAmount: jest.fn()
        };
        const mockLandlordPayoutService = {
            processImmediatePayout: jest.fn(),
            addToEscrow: jest.fn(),
            checkEscrowReleases: jest.fn(),
            releaseEscrowBalance: jest.fn(),
            getLandlordEscrowBalances: jest.fn(),
            getTotalEscrowedAmount: jest.fn(),
            forceReleaseEscrow: jest.fn()
        };
        const mockSchedulerService = {
            checkDuePayments: jest.fn(),
            sendPaymentReminders: jest.fn(),
            processEscrowReleases: jest.fn(),
            updateOverduePaymentStatuses: jest.fn(),
            cleanupNotifications: jest.fn(),
            getPaymentDueSummary: jest.fn(),
            getSchedulerHealth: jest.fn(),
            triggerPaymentDueCheck: jest.fn(),
            triggerPaymentReminders: jest.fn(),
            triggerEscrowReleases: jest.fn(),
            triggerOverdueUpdates: jest.fn(),
            triggerNotificationCleanup: jest.fn()
        };
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _tenantrentcontractscontroller.TenantRentContractsController
            ],
            providers: [
                {
                    provide: _tenantpaymentservice.TenantPaymentService,
                    useValue: mockTenantPaymentService
                },
                {
                    provide: _landlordpayoutservice.LandlordPayoutService,
                    useValue: mockLandlordPayoutService
                },
                {
                    provide: _schedulerservice.SchedulerService,
                    useValue: mockSchedulerService
                }
            ]
        }).compile();
        controller = module.get(_tenantrentcontractscontroller.TenantRentContractsController);
        tenantPaymentService = module.get(_tenantpaymentservice.TenantPaymentService);
        landlordPayoutService = module.get(_landlordpayoutservice.LandlordPayoutService);
        schedulerService = module.get(_schedulerservice.SchedulerService);
    });
    afterEach(()=>{
        jest.clearAllMocks();
    });
    it('should be defined', ()=>{
        expect(controller).toBeDefined();
    });
    describe('createContract', ()=>{
        const createContractDto = {
            tenantId: 'tenant-123',
            landlordId: 'landlord-123',
            propertyId: 'property-123',
            unitId: 'unit-123',
            monthlyAmount: 2500,
            expiryDate: '2025-12-31T23:59:59.000Z',
            landlordPayoutType: _tenantrentcontractdto.LandlordPayoutType.MONTHLY,
            isExistingTenant: false
        };
        it('should create a contract successfully', async ()=>{
            tenantPaymentService.createRentContract.mockResolvedValue(mockContract);
            const result = await controller.createContract(createContractDto);
            expect(result).toEqual({
                success: true,
                data: mockContract,
                message: 'Rent contract created successfully'
            });
            expect(tenantPaymentService.createRentContract).toHaveBeenCalledWith(createContractDto);
        });
        it('should handle contract creation errors', async ()=>{
            tenantPaymentService.createRentContract.mockRejectedValue(new _common.BadRequestException('Tenant already has an active rent contract'));
            await expect(controller.createContract(createContractDto)).rejects.toThrow(_common.BadRequestException);
        });
        it('should validate required fields', async ()=>{
            const invalidDto = {
                ...createContractDto
            };
            delete invalidDto.tenantId;
            // This would be caught by class-validator in real scenario
            await expect(controller.createContract(invalidDto)).rejects.toThrow();
        });
        it('should handle existing tenant contract creation', async ()=>{
            const existingTenantDto = {
                ...createContractDto,
                isExistingTenant: true,
                originalExpiryDate: '2025-06-30T23:59:59.000Z'
            };
            const existingTenantContract = {
                ...mockContract,
                isExistingTenant: true,
                originalExpiryDate: new Date('2025-06-30T23:59:59.000Z')
            };
            tenantPaymentService.createRentContract.mockResolvedValue(existingTenantContract);
            const result = await controller.createContract(existingTenantDto);
            expect(result.success).toBe(true);
            expect(result.data.isExistingTenant).toBe(true);
        });
    });
    describe('getContract', ()=>{
        it('should get contract by ID successfully', async ()=>{
            tenantPaymentService.getContractById.mockResolvedValue(mockContract);
            const result = await controller.getContract('contract-123');
            expect(result).toEqual({
                success: true,
                data: mockContract
            });
            expect(tenantPaymentService.getContractById).toHaveBeenCalledWith('contract-123');
        });
        it('should handle contract not found', async ()=>{
            tenantPaymentService.getContractById.mockRejectedValue(new _common.NotFoundException('Rent contract not found: contract-123'));
            await expect(controller.getContract('contract-123')).rejects.toThrow(_common.NotFoundException);
        });
        it('should handle invalid contract ID format', async ()=>{
            tenantPaymentService.getContractById.mockRejectedValue(new _common.BadRequestException('Invalid contract ID format'));
            await expect(controller.getContract('invalid-id')).rejects.toThrow(_common.BadRequestException);
        });
    });
    describe('getContracts', ()=>{
        const mockContracts = [
            mockContract
        ];
        it('should get all active contracts', async ()=>{
            tenantPaymentService.getActiveContracts.mockResolvedValue(mockContracts);
            const result = await controller.getContracts();
            expect(result).toEqual({
                success: true,
                data: mockContracts,
                total: 1
            });
            expect(tenantPaymentService.getActiveContracts).toHaveBeenCalledWith(undefined, undefined);
        });
        it('should filter contracts by tenant ID', async ()=>{
            tenantPaymentService.getActiveContracts.mockResolvedValue(mockContracts);
            const result = await controller.getContracts('tenant-123');
            expect(result.success).toBe(true);
            expect(tenantPaymentService.getActiveContracts).toHaveBeenCalledWith('tenant-123', undefined);
        });
        it('should filter contracts by landlord ID', async ()=>{
            tenantPaymentService.getActiveContracts.mockResolvedValue(mockContracts);
            const result = await controller.getContracts(undefined, 'landlord-123');
            expect(result.success).toBe(true);
            expect(tenantPaymentService.getActiveContracts).toHaveBeenCalledWith(undefined, 'landlord-123');
        });
        it('should handle empty results', async ()=>{
            tenantPaymentService.getActiveContracts.mockResolvedValue([]);
            const result = await controller.getContracts();
            expect(result).toEqual({
                success: true,
                data: [],
                total: 0
            });
        });
    });
    describe('processPayment', ()=>{
        const processPaymentDto = {
            amount: 2500,
            paymentMethod: 'card',
            reference: 'test-ref-123'
        };
        const mockPaymentResult = {
            success: true,
            payoutType: _tenantrentcontractdto.LandlordPayoutType.MONTHLY,
            message: 'Payment credited immediately to landlord wallet',
            nextPaymentDue: new Date('2024-03-01T00:00:00.000Z')
        };
        it('should process payment successfully', async ()=>{
            tenantPaymentService.processMonthlyPayment.mockResolvedValue(mockPaymentResult);
            const result = await controller.processPayment('contract-123', processPaymentDto);
            expect(result).toEqual({
                success: true,
                data: mockPaymentResult,
                message: 'Payment processed successfully'
            });
            expect(tenantPaymentService.processMonthlyPayment).toHaveBeenCalledWith('contract-123', 2500, 'card', 'test-ref-123');
        });
        it('should handle payment processing errors', async ()=>{
            tenantPaymentService.processMonthlyPayment.mockRejectedValue(new _common.BadRequestException('Payment amount does not match expected monthly amount'));
            await expect(controller.processPayment('contract-123', processPaymentDto)).rejects.toThrow(_common.BadRequestException);
        });
        it('should handle payment without optional fields', async ()=>{
            const minimalPaymentDto = {
                amount: 2500
            };
            tenantPaymentService.processMonthlyPayment.mockResolvedValue(mockPaymentResult);
            const result = await controller.processPayment('contract-123', minimalPaymentDto);
            expect(result.success).toBe(true);
            expect(tenantPaymentService.processMonthlyPayment).toHaveBeenCalledWith('contract-123', 2500, undefined, undefined);
        });
        it('should validate payment amount', async ()=>{
            const invalidPaymentDto = {
                amount: -100
            };
            await expect(controller.processPayment('contract-123', invalidPaymentDto)).rejects.toThrow();
        });
    });
    describe('updateContractStatus', ()=>{
        it('should update contract status successfully', async ()=>{
            const updatedContract = {
                ...mockContract,
                status: 'terminated'
            };
            tenantPaymentService.updateContractStatus.mockResolvedValue(updatedContract);
            const result = await controller.updateContractStatus('contract-123', {
                status: _tenantrentcontractdto.ContractStatus.TERMINATED
            });
            expect(result).toEqual({
                success: true,
                data: updatedContract,
                message: 'Contract status updated successfully'
            });
            expect(tenantPaymentService.updateContractStatus).toHaveBeenCalledWith('contract-123', _tenantrentcontractdto.ContractStatus.TERMINATED);
        });
        it('should handle invalid status updates', async ()=>{
            tenantPaymentService.updateContractStatus.mockRejectedValue(new _common.BadRequestException('Invalid status transition'));
            await expect(controller.updateContractStatus('contract-123', {
                status: _tenantrentcontractdto.ContractStatus.TERMINATED
            })).rejects.toThrow(_common.BadRequestException);
        });
    });
    describe('getLandlordEscrowBalances', ()=>{
        const mockEscrowBalances = [
            mockEscrowBalance
        ];
        it('should get landlord escrow balances successfully', async ()=>{
            landlordPayoutService.getLandlordEscrowBalances.mockResolvedValue(mockEscrowBalances);
            const result = await controller.getLandlordEscrowBalances('landlord-123');
            expect(result).toEqual({
                success: true,
                data: mockEscrowBalances,
                total: 1
            });
            expect(landlordPayoutService.getLandlordEscrowBalances).toHaveBeenCalledWith('landlord-123');
        });
        it('should handle landlord with no escrow balances', async ()=>{
            landlordPayoutService.getLandlordEscrowBalances.mockResolvedValue([]);
            const result = await controller.getLandlordEscrowBalances('landlord-123');
            expect(result).toEqual({
                success: true,
                data: [],
                total: 0
            });
        });
    });
    describe('getTotalEscrowedAmount', ()=>{
        it('should get total escrowed amount successfully', async ()=>{
            landlordPayoutService.getTotalEscrowedAmount.mockResolvedValue(15000);
            const result = await controller.getTotalEscrowedAmount('landlord-123');
            expect(result).toEqual({
                success: true,
                data: {
                    totalAmount: 15000
                }
            });
            expect(landlordPayoutService.getTotalEscrowedAmount).toHaveBeenCalledWith('landlord-123');
        });
        it('should handle landlord with zero escrow', async ()=>{
            landlordPayoutService.getTotalEscrowedAmount.mockResolvedValue(0);
            const result = await controller.getTotalEscrowedAmount('landlord-123');
            expect(result.data.totalAmount).toBe(0);
        });
    });
    describe('forceReleaseEscrow', ()=>{
        const mockReleaseResult = {
            success: true,
            releasedAmount: 7500,
            escrowId: 'escrow-123',
            landlordId: 'landlord-123'
        };
        it('should force release escrow successfully', async ()=>{
            landlordPayoutService.forceReleaseEscrow.mockResolvedValue(mockReleaseResult);
            const result = await controller.forceReleaseEscrow('contract-123', {
                reason: 'Early termination'
            });
            expect(result).toEqual({
                success: true,
                data: mockReleaseResult,
                message: 'Escrow released successfully'
            });
            expect(landlordPayoutService.forceReleaseEscrow).toHaveBeenCalledWith('contract-123', 'Early termination');
        });
        it('should handle force release errors', async ()=>{
            landlordPayoutService.forceReleaseEscrow.mockRejectedValue(new _common.NotFoundException('No active escrow found for contract'));
            await expect(controller.forceReleaseEscrow('contract-123', {
                reason: 'Test'
            })).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('scheduler endpoints', ()=>{
        describe('triggerPaymentCheck', ()=>{
            it('should trigger payment check successfully', async ()=>{
                schedulerService.triggerPaymentDueCheck.mockResolvedValue();
                const result = await controller.triggerPaymentCheck();
                expect(result).toEqual({
                    success: true,
                    message: 'Payment due check triggered successfully'
                });
                expect(schedulerService.triggerPaymentDueCheck).toHaveBeenCalled();
            });
            it('should handle scheduler errors', async ()=>{
                schedulerService.triggerPaymentDueCheck.mockRejectedValue(new Error('Scheduler service unavailable'));
                await expect(controller.triggerPaymentCheck()).rejects.toThrow('Scheduler service unavailable');
            });
        });
        describe('triggerPaymentReminders', ()=>{
            it('should trigger payment reminders successfully', async ()=>{
                schedulerService.triggerPaymentReminders.mockResolvedValue();
                const result = await controller.triggerPaymentReminders();
                expect(result).toEqual({
                    success: true,
                    message: 'Payment reminders triggered successfully'
                });
                expect(schedulerService.triggerPaymentReminders).toHaveBeenCalled();
            });
        });
        describe('triggerEscrowReleases', ()=>{
            it('should trigger escrow releases successfully', async ()=>{
                schedulerService.triggerEscrowReleases.mockResolvedValue();
                const result = await controller.triggerEscrowReleases();
                expect(result).toEqual({
                    success: true,
                    message: 'Escrow releases triggered successfully'
                });
                expect(schedulerService.triggerEscrowReleases).toHaveBeenCalled();
            });
        });
        describe('getPaymentDueSummary', ()=>{
            const mockSummary = {
                totalDue: 5000,
                totalOverdue: 2500,
                contractsWithDuePayments: 2,
                contractsWithOverduePayments: 1
            };
            it('should get payment due summary successfully', async ()=>{
                schedulerService.getPaymentDueSummary.mockResolvedValue(mockSummary);
                const result = await controller.getPaymentDueSummary();
                expect(result).toEqual({
                    success: true,
                    data: mockSummary
                });
                expect(schedulerService.getPaymentDueSummary).toHaveBeenCalled();
            });
        });
        describe('getSchedulerHealth', ()=>{
            const mockHealth = {
                status: 'healthy',
                lastOperations: {},
                metrics: {
                    totalContracts: 10,
                    activeContracts: 8,
                    overdueContracts: 2,
                    pendingNotifications: 5
                }
            };
            it('should get scheduler health successfully', async ()=>{
                schedulerService.getSchedulerHealth.mockResolvedValue(mockHealth);
                const result = await controller.getSchedulerHealth();
                expect(result).toEqual({
                    success: true,
                    data: mockHealth
                });
                expect(schedulerService.getSchedulerHealth).toHaveBeenCalled();
            });
        });
    });
    describe('error handling', ()=>{
        it('should handle service unavailable errors', async ()=>{
            tenantPaymentService.getContractById.mockRejectedValue(new Error('Service temporarily unavailable'));
            await expect(controller.getContract('contract-123')).rejects.toThrow('Service temporarily unavailable');
        });
        it('should handle validation errors', async ()=>{
            const invalidDto = {
                amount: 'invalid'
            };
            // This would be caught by validation pipes in real scenario
            await expect(controller.processPayment('contract-123', invalidDto)).rejects.toThrow();
        });
        it('should handle database connection errors', async ()=>{
            tenantPaymentService.getActiveContracts.mockRejectedValue(new Error('Database connection failed'));
            await expect(controller.getContracts()).rejects.toThrow('Database connection failed');
        });
    });
    describe('performance and edge cases', ()=>{
        it('should handle large result sets', async ()=>{
            const largeContractList = Array.from({
                length: 1000
            }, (_, i)=>({
                    ...mockContract,
                    id: `contract-${i}`
                }));
            tenantPaymentService.getActiveContracts.mockResolvedValue(largeContractList);
            const result = await controller.getContracts();
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1000);
            expect(result.total).toBe(1000);
        });
        it('should handle concurrent requests', async ()=>{
            tenantPaymentService.getContractById.mockResolvedValue(mockContract);
            const promises = Array.from({
                length: 10
            }, ()=>controller.getContract('contract-123'));
            const results = await Promise.all(promises);
            expect(results).toHaveLength(10);
            results.forEach((result)=>{
                expect(result.success).toBe(true);
                expect(result.data).toEqual(mockContract);
            });
        });
        it('should handle null and undefined values gracefully', async ()=>{
            tenantPaymentService.getActiveContracts.mockResolvedValue([]);
            const result = await controller.getContracts(null, undefined);
            expect(result.success).toBe(true);
            expect(result.data).toEqual([]);
        });
        it('should handle special characters in IDs', async ()=>{
            const specialId = 'contract-123-äöü-测试';
            tenantPaymentService.getContractById.mockResolvedValue({
                ...mockContract,
                id: specialId
            });
            const result = await controller.getContract(specialId);
            expect(result.success).toBe(true);
            expect(result.data.id).toBe(specialId);
        });
    });
});

//# sourceMappingURL=tenant-rent-contracts.controller.spec.js.map