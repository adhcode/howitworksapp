"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _landlordpayoutservice = require("./landlord-payout.service");
const _databasemodule = require("../database/database.module");
describe('LandlordPayoutService', ()=>{
    let service;
    let mockDb;
    const mockContract = {
        id: 'contract-123',
        tenantId: 'tenant-123',
        landlordId: 'landlord-123',
        propertyId: 'property-123',
        unitId: 'unit-123',
        monthlyAmount: '1000.00',
        expiryDate: new Date('2024-12-01'),
        landlordPayoutType: 'monthly',
        nextPaymentDue: new Date('2024-09-01'),
        transitionStartDate: new Date('2024-09-01'),
        status: 'active',
        isExistingTenant: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const mockEscrowBalance = {
        id: 'escrow-123',
        landlordId: 'landlord-123',
        contractId: 'contract-123',
        totalEscrowed: '3000.00',
        monthsAccumulated: 3,
        expectedReleaseDate: new Date('2024-12-01'),
        isReleased: false,
        releasedAt: null,
        releasedAmount: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    beforeEach(async ()=>{
        mockDb = {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            transaction: jest.fn()
        };
        const module = await _testing.Test.createTestingModule({
            providers: [
                _landlordpayoutservice.LandlordPayoutService,
                {
                    provide: _databasemodule.DATABASE_CONNECTION,
                    useValue: mockDb
                }
            ]
        }).compile();
        service = module.get(_landlordpayoutservice.LandlordPayoutService);
    });
    afterEach(()=>{
        jest.clearAllMocks();
    });
    describe('processImmediatePayout', ()=>{
        it('should process immediate payout for monthly landlord successfully', async ()=>{
            // Mock contract lookup
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([
                {
                    ...mockContract,
                    landlordPayoutType: 'monthly'
                }
            ]);
            const result = await service.processImmediatePayout('landlord-123', 1000, 'contract-123');
            expect(result.success).toBe(true);
            expect(result.payoutType).toBe('immediate');
            expect(result.amount).toBe(1000);
            expect(result.transactionId).toBeDefined();
            expect(mockDb.select).toHaveBeenCalled();
            expect(mockDb.where).toHaveBeenCalled();
        });
        it('should throw error if contract not found', async ()=>{
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([]);
            await expect(service.processImmediatePayout('landlord-123', 1000, 'invalid-contract')).rejects.toThrow('Contract not found or not eligible for immediate payout');
        });
        it('should throw error if contract is not monthly payout type', async ()=>{
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([
                {
                    ...mockContract,
                    landlordPayoutType: 'yearly'
                }
            ]);
            await expect(service.processImmediatePayout('landlord-123', 1000, 'contract-123')).rejects.toThrow('Contract not found or not eligible for immediate payout');
        });
    });
    describe('addToEscrow', ()=>{
        it('should create new escrow balance for first payment', async ()=>{
            // Mock contract lookup
            mockDb.select.mockReturnValueOnce(mockDb);
            mockDb.from.mockReturnValueOnce(mockDb);
            mockDb.where.mockResolvedValueOnce([
                {
                    ...mockContract,
                    landlordPayoutType: 'yearly'
                }
            ]);
            // Mock escrow lookup (no existing escrow)
            mockDb.select.mockReturnValueOnce(mockDb);
            mockDb.from.mockReturnValueOnce(mockDb);
            mockDb.where.mockResolvedValueOnce([]);
            // Mock insert
            mockDb.insert.mockReturnValue(mockDb);
            mockDb.values.mockResolvedValue({
                success: true
            });
            const result = await service.addToEscrow('landlord-123', 1000, 'contract-123');
            expect(result.success).toBe(true);
            expect(result.payoutType).toBe('escrow');
            expect(result.amount).toBe(1000);
            expect(mockDb.insert).toHaveBeenCalled();
            expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
                landlordId: 'landlord-123',
                contractId: 'contract-123',
                totalEscrowed: '1000',
                monthsAccumulated: 1,
                isReleased: false
            }));
        });
        it('should update existing escrow balance for subsequent payments', async ()=>{
            // Mock contract lookup
            mockDb.select.mockReturnValueOnce(mockDb);
            mockDb.from.mockReturnValueOnce(mockDb);
            mockDb.where.mockResolvedValueOnce([
                {
                    ...mockContract,
                    landlordPayoutType: 'yearly'
                }
            ]);
            // Mock existing escrow lookup
            mockDb.select.mockReturnValueOnce(mockDb);
            mockDb.from.mockReturnValueOnce(mockDb);
            mockDb.where.mockResolvedValueOnce([
                mockEscrowBalance
            ]);
            // Mock update
            mockDb.update.mockReturnValue(mockDb);
            mockDb.set.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue({
                success: true
            });
            const result = await service.addToEscrow('landlord-123', 1000, 'contract-123');
            expect(result.success).toBe(true);
            expect(result.payoutType).toBe('escrow');
            expect(result.amount).toBe(1000);
            expect(mockDb.update).toHaveBeenCalled();
            expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
                totalEscrowed: '4000',
                monthsAccumulated: 4
            }));
        });
        it('should throw error if contract is not yearly payout type', async ()=>{
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([
                {
                    ...mockContract,
                    landlordPayoutType: 'monthly'
                }
            ]);
            await expect(service.addToEscrow('landlord-123', 1000, 'contract-123')).rejects.toThrow('Contract not found or not eligible for escrow');
        });
    });
    describe('checkEscrowReleases', ()=>{
        it('should find and process escrow balances ready for release', async ()=>{
            const pastDate = new Date('2023-12-01'); // Past date
            const readyEscrow = {
                escrow: {
                    ...mockEscrowBalance,
                    expectedReleaseDate: pastDate
                },
                contract: mockContract
            };
            // Mock query for ready escrow balances
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.leftJoin.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([
                readyEscrow
            ]);
            // Mock releaseEscrowBalance method
            const mockReleaseResult = {
                success: true,
                releasedAmount: 3000,
                escrowId: 'escrow-123',
                landlordId: 'landlord-123'
            };
            jest.spyOn(service, 'releaseEscrowBalance').mockResolvedValue(mockReleaseResult);
            const results = await service.checkEscrowReleases();
            expect(results).toHaveLength(1);
            expect(results[0]).toEqual(mockReleaseResult);
            expect(service.releaseEscrowBalance).toHaveBeenCalledWith('escrow-123');
        });
        it('should return empty array if no escrow balances ready for release', async ()=>{
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.leftJoin.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([]);
            const results = await service.checkEscrowReleases();
            expect(results).toHaveLength(0);
        });
        it('should continue processing other escrows if one fails', async ()=>{
            const readyEscrows = [
                {
                    escrow: {
                        ...mockEscrowBalance,
                        id: 'escrow-1'
                    },
                    contract: mockContract
                },
                {
                    escrow: {
                        ...mockEscrowBalance,
                        id: 'escrow-2'
                    },
                    contract: mockContract
                }
            ];
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.leftJoin.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue(readyEscrows);
            // Mock first release to fail, second to succeed
            jest.spyOn(service, 'releaseEscrowBalance').mockRejectedValueOnce(new Error('Release failed')).mockResolvedValueOnce({
                success: true,
                releasedAmount: 3000,
                escrowId: 'escrow-2',
                landlordId: 'landlord-123'
            });
            const results = await service.checkEscrowReleases();
            expect(results).toHaveLength(1);
            expect(results[0].escrowId).toBe('escrow-2');
        });
    });
    describe('releaseEscrowBalance', ()=>{
        it('should release escrow balance successfully with transaction', async ()=>{
            const mockTransaction = jest.fn().mockImplementation(async (callback)=>{
                const mockTx = {
                    select: jest.fn().mockReturnThis(),
                    from: jest.fn().mockReturnThis(),
                    where: jest.fn().mockResolvedValue([
                        mockEscrowBalance
                    ]),
                    update: jest.fn().mockReturnThis(),
                    set: jest.fn().mockReturnThis()
                };
                mockTx.where.mockResolvedValueOnce([
                    mockEscrowBalance
                ]);
                mockTx.set.mockReturnValue(mockTx);
                mockTx.where.mockResolvedValueOnce({
                    success: true
                });
                return await callback(mockTx);
            });
            mockDb.transaction = mockTransaction;
            const result = await service.releaseEscrowBalance('escrow-123');
            expect(result.success).toBe(true);
            expect(result.releasedAmount).toBe(3000);
            expect(result.escrowId).toBe('escrow-123');
            expect(result.landlordId).toBe('landlord-123');
            expect(mockTransaction).toHaveBeenCalled();
        });
        it('should throw error if escrow not found', async ()=>{
            const mockTransaction = jest.fn().mockImplementation(async (callback)=>{
                const mockTx = {
                    select: jest.fn().mockReturnThis(),
                    from: jest.fn().mockReturnThis(),
                    where: jest.fn().mockResolvedValue([])
                };
                return await callback(mockTx);
            });
            mockDb.transaction = mockTransaction;
            await expect(service.releaseEscrowBalance('invalid-escrow')).rejects.toThrow('Escrow balance not found or already released');
        });
        it('should throw error if release amount is invalid', async ()=>{
            const invalidEscrow = {
                ...mockEscrowBalance,
                totalEscrowed: '0.00'
            };
            const mockTransaction = jest.fn().mockImplementation(async (callback)=>{
                const mockTx = {
                    select: jest.fn().mockReturnThis(),
                    from: jest.fn().mockReturnThis(),
                    where: jest.fn().mockResolvedValue([
                        invalidEscrow
                    ])
                };
                return await callback(mockTx);
            });
            mockDb.transaction = mockTransaction;
            await expect(service.releaseEscrowBalance('escrow-123')).rejects.toThrow('Invalid release amount: 0');
        });
    });
    describe('getLandlordEscrowBalances', ()=>{
        it('should return all escrow balances for landlord', async ()=>{
            const mockEscrowWithContract = {
                escrow: mockEscrowBalance,
                contract: mockContract
            };
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.leftJoin.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([
                mockEscrowWithContract
            ]);
            const result = await service.getLandlordEscrowBalances('landlord-123');
            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                ...mockEscrowBalance,
                contract: mockContract
            });
        });
        it('should return empty array if no escrow balances found', async ()=>{
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.leftJoin.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([]);
            const result = await service.getLandlordEscrowBalances('landlord-123');
            expect(result).toHaveLength(0);
        });
    });
    describe('getTotalEscrowedAmount', ()=>{
        it('should return total escrowed amount for landlord', async ()=>{
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([
                {
                    total: '5000.00'
                }
            ]);
            const result = await service.getTotalEscrowedAmount('landlord-123');
            expect(result).toBe(5000);
        });
        it('should return 0 if no escrow balances found', async ()=>{
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([
                {
                    total: '0'
                }
            ]);
            const result = await service.getTotalEscrowedAmount('landlord-123');
            expect(result).toBe(0);
        });
        it('should handle null total from database', async ()=>{
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([
                {
                    total: null
                }
            ]);
            const result = await service.getTotalEscrowedAmount('landlord-123');
            expect(result).toBe(0);
        });
    });
    describe('getEscrowByContractId', ()=>{
        it('should return escrow balance for contract', async ()=>{
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([
                mockEscrowBalance
            ]);
            const result = await service.getEscrowByContractId('contract-123');
            expect(result).toEqual(mockEscrowBalance);
        });
        it('should return null if no escrow found', async ()=>{
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue([]);
            const result = await service.getEscrowByContractId('contract-123');
            expect(result).toBeNull();
        });
    });
    describe('forceReleaseEscrow', ()=>{
        it('should force release escrow for contract', async ()=>{
            // Mock getEscrowByContractId
            jest.spyOn(service, 'getEscrowByContractId').mockResolvedValue(mockEscrowBalance);
            // Mock releaseEscrowBalance
            const mockReleaseResult = {
                success: true,
                releasedAmount: 3000,
                escrowId: 'escrow-123',
                landlordId: 'landlord-123'
            };
            jest.spyOn(service, 'releaseEscrowBalance').mockResolvedValue(mockReleaseResult);
            const result = await service.forceReleaseEscrow('contract-123', 'Early termination');
            expect(result).toEqual(mockReleaseResult);
            expect(service.getEscrowByContractId).toHaveBeenCalledWith('contract-123');
            expect(service.releaseEscrowBalance).toHaveBeenCalledWith('escrow-123');
        });
        it('should throw error if no active escrow found', async ()=>{
            jest.spyOn(service, 'getEscrowByContractId').mockResolvedValue(null);
            await expect(service.forceReleaseEscrow('contract-123', 'Early termination')).rejects.toThrow('No active escrow found for contract: contract-123');
        });
    });
    describe('error handling', ()=>{
        it('should handle database errors gracefully', async ()=>{
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockRejectedValue(new Error('Database connection failed'));
            await expect(service.processImmediatePayout('landlord-123', 1000, 'contract-123')).rejects.toThrow('Database connection failed');
        });
        it('should log errors appropriately', async ()=>{
            const loggerSpy = jest.spyOn(service['logger'], 'error');
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockRejectedValue(new Error('Test error'));
            await expect(service.processImmediatePayout('landlord-123', 1000, 'contract-123')).rejects.toThrow('Test error');
            expect(loggerSpy).toHaveBeenCalled();
        });
    });
});

//# sourceMappingURL=landlord-payout.service.spec.js.map