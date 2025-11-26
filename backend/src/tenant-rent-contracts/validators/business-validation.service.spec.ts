import { Test, TestingModule } from '@nestjs/testing';
import { BusinessValidationService } from './business-validation.service';
import { ContractNotFoundError } from '../exceptions/contract-not-found.exception';
import { InvalidTransitionDateError } from '../exceptions/invalid-transition-date.exception';
import { EscrowReleaseError } from '../exceptions/escrow-release.exception';

describe('BusinessValidationService', () => {
  let service: BusinessValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessValidationService],
    }).compile();

    service = module.get<BusinessValidationService>(BusinessValidationService);
  });

  describe('validateContractCreation', () => {
    const baseContext = {
      tenantId: 'tenant-123',
      landlordId: 'landlord-123',
      propertyId: 'property-123',
      unitId: 'unit-123',
      monthlyAmount: 25000,
      expiryDate: new Date('2025-12-31'),
      isExistingTenant: false,
    };

    it('should validate valid contract creation', () => {
      expect(() => service.validateContractCreation(baseContext)).not.toThrow();
    });

    it('should throw error for past expiry date', () => {
      const context = {
        ...baseContext,
        expiryDate: new Date('2023-01-01'),
      };

      expect(() => service.validateContractCreation(context))
        .toThrow(InvalidTransitionDateError);
    });

    it('should throw error for low rent amount', () => {
      const context = {
        ...baseContext,
        monthlyAmount: 500,
      };

      expect(() => service.validateContractCreation(context))
        .toThrow(InvalidTransitionDateError);
    });

    it('should throw error for high rent amount', () => {
      const context = {
        ...baseContext,
        monthlyAmount: 15000000,
      };

      expect(() => service.validateContractCreation(context))
        .toThrow(InvalidTransitionDateError);
    });

    it('should require original expiry date for existing tenants', () => {
      const context = {
        ...baseContext,
        isExistingTenant: true,
      };

      expect(() => service.validateContractCreation(context))
        .toThrow(InvalidTransitionDateError);
    });

    it('should validate existing tenant with proper dates', () => {
      const context = {
        ...baseContext,
        isExistingTenant: true,
        originalExpiryDate: new Date('2024-06-30'),
      };

      expect(() => service.validateContractCreation(context)).not.toThrow();
    });
  });

  describe('validatePaymentProcessing', () => {
    const baseContext = {
      contractId: 'contract-123',
      amount: 25000,
      expectedAmount: 25000,
      contractStatus: 'active',
      nextPaymentDue: new Date(),
    };

    it('should validate valid payment processing', () => {
      expect(() => service.validatePaymentProcessing(baseContext)).not.toThrow();
    });

    it('should throw error for inactive contract', () => {
      const context = {
        ...baseContext,
        contractStatus: 'expired',
      };

      expect(() => service.validatePaymentProcessing(context))
        .toThrow(InvalidTransitionDateError);
    });

    it('should throw error for amount mismatch', () => {
      const context = {
        ...baseContext,
        amount: 20000,
      };

      expect(() => service.validatePaymentProcessing(context))
        .toThrow(InvalidTransitionDateError);
    });

    it('should throw error for early payment', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      
      const context = {
        ...baseContext,
        nextPaymentDue: futureDate,
      };

      expect(() => service.validatePaymentProcessing(context))
        .toThrow(InvalidTransitionDateError);
    });
  });

  describe('validateEscrowRelease', () => {
    const baseContext = {
      escrowId: 'escrow-123',
      landlordId: 'landlord-123',
      contractId: 'contract-123',
      totalEscrowed: 300000,
      isReleased: false,
      expectedReleaseDate: new Date('2024-01-01'),
    };

    it('should validate valid escrow release', () => {
      expect(() => service.validateEscrowRelease(baseContext)).not.toThrow();
    });

    it('should throw error for already released escrow', () => {
      const context = {
        ...baseContext,
        isReleased: true,
      };

      expect(() => service.validateEscrowRelease(context))
        .toThrow(EscrowReleaseError);
    });

    it('should throw error for future release date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const context = {
        ...baseContext,
        expectedReleaseDate: futureDate,
      };

      expect(() => service.validateEscrowRelease(context))
        .toThrow(EscrowReleaseError);
    });

    it('should throw error for zero escrow amount', () => {
      const context = {
        ...baseContext,
        totalEscrowed: 0,
      };

      expect(() => service.validateEscrowRelease(context))
        .toThrow(EscrowReleaseError);
    });
  });

  describe('validateTransitionDate', () => {
    it('should calculate correct transition date for monthly payout', () => {
      const expiryDate = new Date('2024-12-01');
      const result = service.validateTransitionDate(expiryDate, 'monthly');
      
      const expected = new Date('2024-09-01');
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getFullYear()).toBe(expected.getFullYear());
    });

    it('should calculate correct transition date for yearly payout', () => {
      const expiryDate = new Date('2024-12-01');
      const result = service.validateTransitionDate(expiryDate, 'yearly');
      
      const expected = new Date('2024-06-01');
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getFullYear()).toBe(expected.getFullYear());
    });

    it('should return today if calculated date is in past', () => {
      const today = new Date();
      const nearFutureDate = new Date();
      nearFutureDate.setMonth(today.getMonth() + 2);
      
      const result = service.validateTransitionDate(nearFutureDate, 'monthly');
      
      expect(result.getDate()).toBe(today.getDate());
    });

    it('should throw error for very close expiry date', () => {
      const veryCloseDate = new Date();
      veryCloseDate.setDate(veryCloseDate.getDate() + 15); // 15 days from now
      
      expect(() => service.validateTransitionDate(veryCloseDate, 'yearly'))
        .toThrow(InvalidTransitionDateError);
    });
  });
});