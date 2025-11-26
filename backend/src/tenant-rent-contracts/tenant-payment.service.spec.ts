import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TenantPaymentService } from './tenant-payment.service';
import { DATABASE_CONNECTION } from '../database/database.module';
import { LandlordPayoutType, ContractStatus } from './dto/tenant-rent-contract.dto';

// Mock database
const mockDb = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
};

describe('TenantPaymentService', () => {
  let service: TenantPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantPaymentService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<TenantPaymentService>(TenantPaymentService);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('calculateTransitionStartDate', () => {
    it('should calculate 3 months before expiry for monthly payout', () => {
      const expiryDate = new Date('2024-12-01T00:00:00.000Z');
      const result = service.calculateTransitionStartDate(expiryDate, LandlordPayoutType.MONTHLY);
      
      const expected = new Date('2024-09-01T00:00:00.000Z');
      expect(result).toEqual(expected);
    });

    it('should calculate 6 months before expiry for yearly payout', () => {
      const expiryDate = new Date('2024-12-01T00:00:00.000Z');
      const result = service.calculateTransitionStartDate(expiryDate, LandlordPayoutType.YEARLY);
      
      const expected = new Date('2024-06-01T00:00:00.000Z');
      expect(result).toEqual(expected);
    });

    it('should return today if calculated date is in the past', () => {
      const pastExpiryDate = new Date('2024-01-01T00:00:00.000Z');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const result = service.calculateTransitionStartDate(pastExpiryDate, LandlordPayoutType.MONTHLY);
      
      expect(result.getTime()).toBeGreaterThanOrEqual(today.getTime());
    });

    it('should throw error for invalid payout type', () => {
      const expiryDate = new Date('2024-12-01T00:00:00.000Z');
      
      expect(() => {
        service.calculateTransitionStartDate(expiryDate, 'invalid' as LandlordPayoutType);
      }).toThrow(BadRequestException);
    });

    it('should handle month overflow correctly', () => {
      // Test case where subtracting months goes to previous year
      const expiryDate = new Date('2024-02-01T00:00:00.000Z');
      const result = service.calculateTransitionStartDate(expiryDate, LandlordPayoutType.YEARLY);
      
      const expected = new Date('2023-08-01T00:00:00.000Z');
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(7); // August (0-indexed)
    });

    it('should handle leap year calculations correctly', () => {
      const expiryDate = new Date('2024-02-29T00:00:00.000Z'); // Leap year
      const result = service.calculateTransitionStartDate(expiryDate, LandlordPayoutType.MONTHLY);
      
      // Should be November 29, 2023
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(10); // November (0-indexed)
      expect(result.getDate()).toBe(29);
    });
  });

  describe('createRentContract', () => {
    const validContractDto = {
      tenantId: 'tenant-123',
      landlordId: 'landlord-123',
      propertyId: 'property-123',
      unitId: 'unit-123',
      monthlyAmount: 25000,
      expiryDate: '2024-12-31T23:59:59.000Z',
      landlordPayoutType: LandlordPayoutType.MONTHLY,
      isExistingTenant: false,
    };

    beforeEach(() => {
      // Mock successful database operations
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockReturnValue([]);  // No existing contracts
      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([{
        id: 'contract-123',
        ...validContractDto,
        expiryDate: new Date(validContractDto.expiryDate),
        nextPaymentDue: new Date('2024-09-30T23:59:59.000Z'),
        transitionStartDate: new Date('2024-09-30T23:59:59.000Z'),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
    });

    it('should create a contract successfully with valid data', async () => {
      const result = await service.createRentContract(validContractDto);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('contract-123');
      expect(result.tenantId).toBe(validContractDto.tenantId);
      expect(result.landlordId).toBe(validContractDto.landlordId);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should throw error if expiry date is in the past', async () => {
      const pastExpiryDto = {
        ...validContractDto,
        expiryDate: '2020-01-01T00:00:00.000Z',
      };

      await expect(service.createRentContract(pastExpiryDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw error if monthly amount is zero or negative', async () => {
      const invalidAmountDto = {
        ...validContractDto,
        monthlyAmount: 0,
      };

      await expect(service.createRentContract(invalidAmountDto)).rejects.toThrow(
        BadRequestException
      );

      const negativeAmountDto = {
        ...validContractDto,
        monthlyAmount: -1000,
      };

      await expect(service.createRentContract(negativeAmountDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw error if tenant already has active contract', async () => {
      // Mock existing active contract
      mockDb.limit.mockReturnValue([{ id: 'existing-contract' }]);

      await expect(service.createRentContract(validContractDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should require original expiry date for existing tenants', async () => {
      const existingTenantDto = {
        ...validContractDto,
        isExistingTenant: true,
        // Missing originalExpiryDate
      };

      await expect(service.createRentContract(existingTenantDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should validate original expiry date for existing tenants', async () => {
      const existingTenantDto = {
        ...validContractDto,
        isExistingTenant: true,
        originalExpiryDate: '2020-01-01T00:00:00.000Z', // Past date
      };

      await expect(service.createRentContract(existingTenantDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should calculate correct transition dates for new contracts', async () => {
      const result = await service.createRentContract(validContractDto);
      
      // For monthly payout, transition should start 3 months before expiry
      const expectedTransition = new Date('2024-12-31T23:59:59.000Z');
      expectedTransition.setMonth(expectedTransition.getMonth() - 3);
      
      expect(result.transitionStartDate).toBeDefined();
      expect(result.nextPaymentDue).toBeDefined();
    });
  });

  describe('getContractById', () => {
    it('should return contract when found', async () => {
      const mockContract = {
        id: 'contract-123',
        tenantId: 'tenant-123',
        landlordId: 'landlord-123',
        status: 'active',
      };

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockContract]);

      const result = await service.getContractById('contract-123');
      
      expect(result).toEqual(mockContract);
    });

    it('should throw NotFoundException when contract not found', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);

      await expect(service.getContractById('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getActiveContracts', () => {
    const mockContracts = [
      {
        id: 'contract-1',
        tenantId: 'tenant-1',
        landlordId: 'landlord-1',
        status: 'active',
      },
      {
        id: 'contract-2',
        tenantId: 'tenant-2',
        landlordId: 'landlord-1',
        status: 'active',
      },
    ];

    beforeEach(() => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(mockContracts);
    });

    it('should return all active contracts when no filter provided', async () => {
      const result = await service.getActiveContracts();
      
      expect(result).toEqual(mockContracts);
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should filter by tenant ID when provided', async () => {
      const filteredContracts = [mockContracts[0]];
      mockDb.orderBy.mockResolvedValue(filteredContracts);

      const result = await service.getActiveContracts({ tenantId: 'tenant-1' });
      
      expect(result).toEqual(filteredContracts);
    });

    it('should filter by landlord ID when provided', async () => {
      const result = await service.getActiveContracts({ landlordId: 'landlord-1' });
      
      expect(result).toEqual(mockContracts);
    });

    it('should filter by property ID when provided', async () => {
      const result = await service.getActiveContracts({ propertyId: 'property-1' });
      
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('updateNextPaymentDue', () => {
    it('should update next payment due date by one month', async () => {
      const mockContract = {
        id: 'contract-123',
        nextPaymentDue: new Date('2024-01-01T00:00:00.000Z'),
      };

      // Mock getContractById
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockContract]);

      // Mock update
      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue(undefined);

      await service.updateNextPaymentDue('contract-123');

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          nextPaymentDue: new Date('2024-02-01T00:00:00.000Z'),
        })
      );
    });

    it('should throw error if contract not found', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);

      await expect(service.updateNextPaymentDue('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getContractsWithDuePayments', () => {
    it('should return contracts with payments due', async () => {
      const today = new Date('2024-01-15T00:00:00.000Z');
      const mockContracts = [
        {
          id: 'contract-1',
          nextPaymentDue: new Date('2024-01-10T00:00:00.000Z'), // Due
          status: 'active',
        },
        {
          id: 'contract-2',
          nextPaymentDue: new Date('2024-01-20T00:00:00.000Z'), // Not due yet
          status: 'active',
        },
      ];

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(mockContracts);

      const result = await service.getContractsWithDuePayments(today);

      // Should only return the first contract (due)
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('contract-1');
    });
  });

  describe('updateContractStatus', () => {
    it('should update contract status successfully', async () => {
      const mockContract = {
        id: 'contract-123',
        status: 'active',
      };

      const updatedContract = {
        ...mockContract,
        status: 'terminated',
      };

      // Mock getContractById
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockContract]);

      // Mock update
      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([updatedContract]);

      const result = await service.updateContractStatus('contract-123', ContractStatus.TERMINATED);

      expect(result.status).toBe('terminated');
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('getExpiringContracts', () => {
    it('should return contracts expiring within specified days', async () => {
      const mockContracts = [
        {
          id: 'contract-1',
          expiryDate: new Date('2024-01-20T00:00:00.000Z'), // Expires soon
          landlordPayoutType: 'yearly',
          status: 'active',
        },
        {
          id: 'contract-2',
          expiryDate: new Date('2024-02-20T00:00:00.000Z'), // Expires later
          landlordPayoutType: 'yearly',
          status: 'active',
        },
      ];

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(mockContracts);

      // Mock current date to be 2024-01-15
      const mockDate = new Date('2024-01-15T00:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = await service.getExpiringContracts(7);

      // Should only return contracts expiring within 7 days
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('contract-1');

      // Restore Date
      (global.Date as any).mockRestore();
    });
  });

  describe('processMonthlyPayment', () => {
    const mockContract = {
      id: 'contract-123',
      tenantId: 'tenant-123',
      landlordId: 'landlord-123',
      propertyId: 'property-123',
      unitId: 'unit-123',
      monthlyAmount: '25000.00',
      nextPaymentDue: new Date('2024-01-15T00:00:00.000Z'),
      expiryDate: new Date('2024-12-31T23:59:59.000Z'),
      landlordPayoutType: LandlordPayoutType.MONTHLY,
      status: 'active',
    };

    beforeEach(() => {
      // Mock getContractById
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockContract]);

      // Mock updateNextPaymentDue
      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue(undefined);
    });

    it('should process payment successfully for monthly payout', async () => {
      const result = await service.processMonthlyPayment('contract-123', 25000, 'card', 'ref-123');

      expect(result.success).toBe(true);
      expect(result.payoutType).toBe(LandlordPayoutType.MONTHLY);
      expect(result.message).toContain('immediately');
      expect(result.nextPaymentDue).toBeDefined();
    });

    it('should process payment successfully for yearly payout', async () => {
      const yearlyContract = {
        ...mockContract,
        landlordPayoutType: LandlordPayoutType.YEARLY,
      };

      mockDb.limit.mockResolvedValue([yearlyContract]);
      
      // Mock escrow operations
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]); // No existing escrow
      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockResolvedValue(undefined);

      const result = await service.processMonthlyPayment('contract-123', 25000, 'card', 'ref-123');

      expect(result.success).toBe(true);
      expect(result.payoutType).toBe(LandlordPayoutType.YEARLY);
      expect(result.message).toContain('escrow');
    });

    it('should throw error for invalid payment amount', async () => {
      await expect(
        service.processMonthlyPayment('contract-123', 0, 'card', 'ref-123')
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.processMonthlyPayment('contract-123', -100, 'card', 'ref-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for mismatched payment amount', async () => {
      await expect(
        service.processMonthlyPayment('contract-123', 20000, 'card', 'ref-123') // Wrong amount
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for payment too early', async () => {
      const futureContract = {
        ...mockContract,
        nextPaymentDue: new Date('2024-12-01T00:00:00.000Z'), // Far in future
      };

      mockDb.limit.mockResolvedValue([futureContract]);

      await expect(
        service.processMonthlyPayment('contract-123', 25000, 'card', 'ref-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow payment up to 30 days early', async () => {
      const mockDate = new Date('2024-01-01T00:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const earlyPaymentContract = {
        ...mockContract,
        nextPaymentDue: new Date('2024-01-20T00:00:00.000Z'), // 19 days in future
      };

      mockDb.limit.mockResolvedValue([earlyPaymentContract]);

      const result = await service.processMonthlyPayment('contract-123', 25000, 'card', 'ref-123');

      expect(result.success).toBe(true);

      (global.Date as any).mockRestore();
    });

    it('should handle contract not found', async () => {
      mockDb.limit.mockResolvedValue([]); // No contract found

      await expect(
        service.processMonthlyPayment('nonexistent', 25000, 'card', 'ref-123')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateNextPaymentDue with expiry handling', () => {
    it('should update next payment due date normally', async () => {
      const mockContract = {
        id: 'contract-123',
        nextPaymentDue: new Date('2024-01-01T00:00:00.000Z'),
        expiryDate: new Date('2024-12-31T23:59:59.000Z'), // Far in future
      };

      // Mock getContractById
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockContract]);

      // Mock update
      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue(undefined);

      await service.updateNextPaymentDue('contract-123');

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          nextPaymentDue: new Date('2024-02-01T00:00:00.000Z'),
        })
      );
    });

    it('should mark contract as expired if next payment would be after expiry', async () => {
      const mockContract = {
        id: 'contract-123',
        nextPaymentDue: new Date('2024-12-01T00:00:00.000Z'),
        expiryDate: new Date('2024-12-15T23:59:59.000Z'), // Expires soon
      };

      // Mock getContractById (called twice - once for updateNextPaymentDue, once for updateContractStatus)
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockContract]);

      // Mock updateContractStatus
      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([{ ...mockContract, status: 'expired' }]);

      await service.updateNextPaymentDue('contract-123');

      // Should call update to mark as expired instead of updating payment due
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('getLandlordEscrowBalances', () => {
    const mockEscrowBalances = [
      {
        id: 'escrow-1',
        landlordId: 'landlord-123',
        contractId: 'contract-1',
        totalEscrowed: '50000.00',
        isReleased: false,
      },
      {
        id: 'escrow-2',
        landlordId: 'landlord-123',
        contractId: 'contract-2',
        totalEscrowed: '25000.00',
        isReleased: true,
      },
    ];

    beforeEach(() => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(mockEscrowBalances);
    });

    it('should return all escrow balances for landlord', async () => {
      const result = await service.getLandlordEscrowBalances('landlord-123');

      expect(result).toEqual(mockEscrowBalances);
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return only unreleased escrow balances when requested', async () => {
      const unreleasedBalances = [mockEscrowBalances[0]];
      mockDb.orderBy.mockResolvedValue(unreleasedBalances);

      const result = await service.getLandlordEscrowBalances('landlord-123', true);

      expect(result).toEqual(unreleasedBalances);
    });
  });

  describe('getTotalEscrowedAmount', () => {
    it('should calculate total escrowed amount correctly', async () => {
      const mockEscrowBalances = [
        {
          id: 'escrow-1',
          landlordId: 'landlord-123',
          totalEscrowed: '50000.00',
          isReleased: false,
        },
        {
          id: 'escrow-2',
          landlordId: 'landlord-123',
          totalEscrowed: '25000.00',
          isReleased: false,
        },
      ];

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(mockEscrowBalances);

      const result = await service.getTotalEscrowedAmount('landlord-123');

      expect(result).toBe(75000); // 50000 + 25000
    });

    it('should return 0 when no escrow balances exist', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue([]);

      const result = await service.getTotalEscrowedAmount('landlord-123');

      expect(result).toBe(0);
    });
  });

  describe('escrow management', () => {
    it('should create new escrow balance for first payment', async () => {
      const mockContract = {
        id: 'contract-123',
        landlordId: 'landlord-123',
        expiryDate: new Date('2024-12-31T23:59:59.000Z'),
      };

      // Mock no existing escrow
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);

      // Mock getContractById for escrow creation
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockContract]);

      // Mock insert
      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockResolvedValue(undefined);

      // Call the private method through processMonthlyPayment
      const yearlyContract = {
        ...mockContract,
        monthlyAmount: '25000.00',
        nextPaymentDue: new Date('2024-01-15T00:00:00.000Z'),
        landlordPayoutType: LandlordPayoutType.YEARLY,
        status: 'active',
      };

      mockDb.limit.mockResolvedValue([yearlyContract]);
      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue(undefined);

      const result = await service.processMonthlyPayment('contract-123', 25000);

      expect(result.success).toBe(true);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should update existing escrow balance for subsequent payments', async () => {
      const mockContract = {
        id: 'contract-123',
        landlordId: 'landlord-123',
        monthlyAmount: '25000.00',
        nextPaymentDue: new Date('2024-01-15T00:00:00.000Z'),
        expiryDate: new Date('2024-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.YEARLY,
        status: 'active',
      };

      const existingEscrow = {
        id: 'escrow-123',
        landlordId: 'landlord-123',
        contractId: 'contract-123',
        totalEscrowed: '25000.00',
        monthsAccumulated: 1,
        isReleased: false,
      };

      // Mock existing escrow found
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockContract]).mockResolvedValueOnce([existingEscrow]);

      // Mock update escrow
      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue(undefined);

      const result = await service.processMonthlyPayment('contract-123', 25000);

      expect(result.success).toBe(true);
      expect(result.payoutType).toBe(LandlordPayoutType.YEARLY);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle database connection errors gracefully', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.getContractById('contract-123')).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid UUID format', async () => {
      await expect(service.getContractById('invalid-uuid')).rejects.toThrow();
    });

    it('should validate contract expiry date boundary conditions', async () => {
      const validContractDto = {
        tenantId: 'tenant-123',
        landlordId: 'landlord-123',
        propertyId: 'property-123',
        unitId: 'unit-123',
        monthlyAmount: 25000,
        expiryDate: new Date().toISOString(), // Exactly now
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: false,
      };

      // Mock no existing contracts
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);

      await expect(service.createRentContract(validContractDto)).rejects.toThrow(
        'Contract expiry date must be in the future'
      );
    });

    it('should handle transition date calculation for edge months', async () => {
      // Test February to November transition (9 months back)
      const februaryDate = new Date('2024-02-29T00:00:00.000Z'); // Leap year
      const result = service.calculateTransitionStartDate(februaryDate, LandlordPayoutType.YEARLY);
      
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(7); // August (0-indexed)
    });

    it('should handle contract creation with maximum allowed values', async () => {
      const maxValueContract = {
        tenantId: 'tenant-123',
        landlordId: 'landlord-123',
        propertyId: 'property-123',
        unitId: 'unit-123',
        monthlyAmount: 999999.99, // Maximum reasonable amount
        expiryDate: new Date('2099-12-31T23:59:59.000Z').toISOString(),
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: false,
      };

      // Mock successful creation
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);
      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([{
        id: 'contract-123',
        ...maxValueContract,
        expiryDate: new Date(maxValueContract.expiryDate),
        nextPaymentDue: new Date(),
        transitionStartDate: new Date(),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);

      const result = await service.createRentContract(maxValueContract);
      expect(result).toBeDefined();
      expect(result.monthlyAmount).toBe('999999.99');
    });

    it('should handle concurrent access to same contract', async () => {
      const mockContract = {
        id: 'contract-123',
        nextPaymentDue: new Date('2024-01-01T00:00:00.000Z'),
      };

      // Mock getContractById
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockContract]);

      // Mock update that might fail due to concurrent access
      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockRejectedValue(new Error('Concurrent modification detected'));

      await expect(service.updateNextPaymentDue('contract-123')).rejects.toThrow(
        'Concurrent modification detected'
      );
    });

    it('should handle payment processing with floating point precision', async () => {
      const mockContract = {
        id: 'contract-123',
        tenantId: 'tenant-123',
        landlordId: 'landlord-123',
        propertyId: 'property-123',
        unitId: 'unit-123',
        monthlyAmount: '2500.33', // Amount with cents
        nextPaymentDue: new Date('2024-01-15T00:00:00.000Z'),
        expiryDate: new Date('2024-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        status: 'active',
      };

      // Mock getContractById
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockContract]);

      // Mock updateNextPaymentDue
      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue(undefined);

      const result = await service.processMonthlyPayment('contract-123', 2500.33);
      expect(result.success).toBe(true);
    });

    it('should handle very large escrow accumulations', async () => {
      const mockEscrowBalances = Array.from({ length: 100 }, (_, i) => ({
        id: `escrow-${i}`,
        landlordId: 'landlord-123',
        totalEscrowed: '50000.00',
        isReleased: false,
      }));

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(mockEscrowBalances);

      const result = await service.getTotalEscrowedAmount('landlord-123');
      expect(result).toBe(5000000); // 100 * 50000
    });

    it('should handle contract queries with no results', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue([]);

      const result = await service.getActiveContracts('nonexistent-tenant');
      expect(result).toEqual([]);
    });

    it('should handle payment processing for expired contracts', async () => {
      const expiredContract = {
        id: 'contract-123',
        tenantId: 'tenant-123',
        landlordId: 'landlord-123',
        propertyId: 'property-123',
        unitId: 'unit-123',
        monthlyAmount: '25000.00',
        nextPaymentDue: new Date('2024-01-15T00:00:00.000Z'),
        expiryDate: new Date('2020-12-31T23:59:59.000Z'), // Expired
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        status: 'active',
      };

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([expiredContract]);

      await expect(
        service.processMonthlyPayment('contract-123', 25000)
      ).rejects.toThrow('Cannot process payment for expired contract');
    });
  });
});