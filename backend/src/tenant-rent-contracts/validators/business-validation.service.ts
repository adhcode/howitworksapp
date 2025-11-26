import { Injectable } from '@nestjs/common';
import { ContractNotFoundError } from '../exceptions/contract-not-found.exception';
import { InvalidTransitionDateError } from '../exceptions/invalid-transition-date.exception';
import { EscrowReleaseError } from '../exceptions/escrow-release.exception';

export interface ContractValidationContext {
  tenantId: string;
  landlordId: string;
  propertyId: string;
  unitId: string;
  monthlyAmount: number;
  expiryDate: Date;
  isExistingTenant: boolean;
  originalExpiryDate?: Date;
}

export interface PaymentValidationContext {
  contractId: string;
  amount: number;
  expectedAmount: number;
  contractStatus: string;
  nextPaymentDue: Date;
}

export interface EscrowValidationContext {
  escrowId: string;
  landlordId: string;
  contractId: string;
  totalEscrowed: number;
  isReleased: boolean;
  expectedReleaseDate: Date;
}

@Injectable()
export class BusinessValidationService {
  /**
   * Validates contract creation business rules
   */
  validateContractCreation(context: ContractValidationContext): void {
    this.validateContractDates(context);
    this.validateExistingTenantRules(context);
    this.validateRentAmount(context);
  }

  /**
   * Validates payment processing business rules
   */
  validatePaymentProcessing(context: PaymentValidationContext): void {
    this.validateContractExists(context.contractId);
    this.validateContractStatus(context.contractStatus);
    this.validatePaymentAmount(context.amount, context.expectedAmount);
    this.validatePaymentTiming(context.nextPaymentDue);
  }

  /**
   * Validates escrow release business rules
   */
  validateEscrowRelease(context: EscrowValidationContext): void {
    this.validateEscrowExists(context.escrowId);
    this.validateEscrowNotReleased(context.isReleased, context.escrowId);
    this.validateEscrowReleaseDate(context.expectedReleaseDate, context.escrowId);
    this.validateEscrowAmount(context.totalEscrowed, context.escrowId);
  }

  /**
   * Validates transition date calculation
   */
  validateTransitionDate(expiryDate: Date, payoutType: 'monthly' | 'yearly'): Date {
    const today = new Date();
    const transitionDate = new Date(expiryDate);

    // Calculate transition start based on payout type
    if (payoutType === 'monthly') {
      transitionDate.setMonth(transitionDate.getMonth() - 3);
    } else {
      transitionDate.setMonth(transitionDate.getMonth() - 6);
    }

    // Validate transition date is reasonable
    if (transitionDate < today) {
      const monthsFromNow = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      if (monthsFromNow < 1) {
        throw new InvalidTransitionDateError(
          'Contract expiry date is too close to start transition period',
          { expiryDate, payoutType, monthsFromNow }
        );
      }
      
      // If calculated date is in the past, start immediately
      return today;
    }

    return transitionDate;
  }

  private validateContractDates(context: ContractValidationContext): void {
    const today = new Date();
    const expiryDate = new Date(context.expiryDate);

    // Expiry date must be in the future
    if (expiryDate <= today) {
      throw new InvalidTransitionDateError(
        'Contract expiry date must be in the future',
        { expiryDate, today }
      );
    }

    // For existing tenants, validate original expiry date
    if (context.isExistingTenant) {
      if (!context.originalExpiryDate) {
        throw new InvalidTransitionDateError(
          'Original expiry date is required for existing tenants'
        );
      }

      const originalExpiry = new Date(context.originalExpiryDate);
      
      // New expiry must be after original expiry
      if (expiryDate <= originalExpiry) {
        throw new InvalidTransitionDateError(
          'New expiry date must be after original expiry date',
          { expiryDate, originalExpiryDate: originalExpiry }
        );
      }

      // Original expiry should be within reasonable range (not too far in past/future)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(today.getMonth() + 6);

      if (originalExpiry < sixMonthsAgo || originalExpiry > sixMonthsFromNow) {
        throw new InvalidTransitionDateError(
          'Original expiry date must be within 6 months of today',
          { originalExpiryDate: originalExpiry, validRange: { from: sixMonthsAgo, to: sixMonthsFromNow } }
        );
      }
    }
  }

  private validateExistingTenantRules(context: ContractValidationContext): void {
    if (context.isExistingTenant && !context.originalExpiryDate) {
      throw new InvalidTransitionDateError(
        'Original expiry date is required for existing tenants'
      );
    }

    if (!context.isExistingTenant && context.originalExpiryDate) {
      throw new InvalidTransitionDateError(
        'Original expiry date should not be provided for new tenants'
      );
    }
  }

  private validateRentAmount(context: ContractValidationContext): void {
    if (context.monthlyAmount < 1000) {
      throw new InvalidTransitionDateError(
        'Monthly rent amount is too low',
        { monthlyAmount: context.monthlyAmount, minimum: 1000 }
      );
    }

    if (context.monthlyAmount > 10000000) {
      throw new InvalidTransitionDateError(
        'Monthly rent amount is too high',
        { monthlyAmount: context.monthlyAmount, maximum: 10000000 }
      );
    }
  }

  private validateContractExists(contractId: string): void {
    if (!contractId) {
      throw new ContractNotFoundError('Contract ID is required');
    }
  }

  private validateContractStatus(status: string): void {
    if (status !== 'active') {
      throw new InvalidTransitionDateError(
        `Cannot process payment for contract with status: ${status}`,
        { status, allowedStatus: 'active' }
      );
    }
  }

  private validatePaymentAmount(amount: number, expectedAmount: number): void {
    if (amount !== expectedAmount) {
      throw new InvalidTransitionDateError(
        'Payment amount does not match expected monthly rent',
        { providedAmount: amount, expectedAmount }
      );
    }
  }

  private validatePaymentTiming(nextPaymentDue: Date): void {
    const today = new Date();
    const daysDifference = Math.ceil((nextPaymentDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Allow payments up to 5 days early
    if (daysDifference > 5) {
      throw new InvalidTransitionDateError(
        'Payment is too early. Payments can only be made up to 5 days before due date',
        { nextPaymentDue, today, daysDifference }
      );
    }
  }

  private validateEscrowExists(escrowId: string): void {
    if (!escrowId) {
      throw new EscrowReleaseError('Escrow ID is required');
    }
  }

  private validateEscrowNotReleased(isReleased: boolean, escrowId: string): void {
    if (isReleased) {
      throw new EscrowReleaseError(
        'Escrow balance has already been released',
        escrowId,
        { isReleased }
      );
    }
  }

  private validateEscrowReleaseDate(expectedReleaseDate: Date, escrowId: string): void {
    const today = new Date();
    
    if (expectedReleaseDate > today) {
      throw new EscrowReleaseError(
        'Escrow release date has not been reached yet',
        escrowId,
        { expectedReleaseDate, today }
      );
    }
  }

  private validateEscrowAmount(totalEscrowed: number, escrowId: string): void {
    if (totalEscrowed <= 0) {
      throw new EscrowReleaseError(
        'No funds available in escrow for release',
        escrowId,
        { totalEscrowed }
      );
    }
  }
}