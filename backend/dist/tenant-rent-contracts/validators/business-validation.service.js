"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BusinessValidationService", {
    enumerable: true,
    get: function() {
        return BusinessValidationService;
    }
});
const _common = require("@nestjs/common");
const _contractnotfoundexception = require("../exceptions/contract-not-found.exception");
const _invalidtransitiondateexception = require("../exceptions/invalid-transition-date.exception");
const _escrowreleaseexception = require("../exceptions/escrow-release.exception");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let BusinessValidationService = class BusinessValidationService {
    /**
   * Validates contract creation business rules
   */ validateContractCreation(context) {
        this.validateContractDates(context);
        this.validateExistingTenantRules(context);
        this.validateRentAmount(context);
    }
    /**
   * Validates payment processing business rules
   */ validatePaymentProcessing(context) {
        this.validateContractExists(context.contractId);
        this.validateContractStatus(context.contractStatus);
        this.validatePaymentAmount(context.amount, context.expectedAmount);
        this.validatePaymentTiming(context.nextPaymentDue);
    }
    /**
   * Validates escrow release business rules
   */ validateEscrowRelease(context) {
        this.validateEscrowExists(context.escrowId);
        this.validateEscrowNotReleased(context.isReleased, context.escrowId);
        this.validateEscrowReleaseDate(context.expectedReleaseDate, context.escrowId);
        this.validateEscrowAmount(context.totalEscrowed, context.escrowId);
    }
    /**
   * Validates transition date calculation
   */ validateTransitionDate(expiryDate, payoutType) {
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
                throw new _invalidtransitiondateexception.InvalidTransitionDateError('Contract expiry date is too close to start transition period', {
                    expiryDate,
                    payoutType,
                    monthsFromNow
                });
            }
            // If calculated date is in the past, start immediately
            return today;
        }
        return transitionDate;
    }
    validateContractDates(context) {
        const today = new Date();
        const expiryDate = new Date(context.expiryDate);
        // Expiry date must be in the future
        if (expiryDate <= today) {
            throw new _invalidtransitiondateexception.InvalidTransitionDateError('Contract expiry date must be in the future', {
                expiryDate,
                today
            });
        }
        // For existing tenants, validate original expiry date
        if (context.isExistingTenant) {
            if (!context.originalExpiryDate) {
                throw new _invalidtransitiondateexception.InvalidTransitionDateError('Original expiry date is required for existing tenants');
            }
            const originalExpiry = new Date(context.originalExpiryDate);
            // New expiry must be after original expiry
            if (expiryDate <= originalExpiry) {
                throw new _invalidtransitiondateexception.InvalidTransitionDateError('New expiry date must be after original expiry date', {
                    expiryDate,
                    originalExpiryDate: originalExpiry
                });
            }
            // Original expiry should be within reasonable range (not too far in past/future)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(today.getMonth() - 6);
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(today.getMonth() + 6);
            if (originalExpiry < sixMonthsAgo || originalExpiry > sixMonthsFromNow) {
                throw new _invalidtransitiondateexception.InvalidTransitionDateError('Original expiry date must be within 6 months of today', {
                    originalExpiryDate: originalExpiry,
                    validRange: {
                        from: sixMonthsAgo,
                        to: sixMonthsFromNow
                    }
                });
            }
        }
    }
    validateExistingTenantRules(context) {
        if (context.isExistingTenant && !context.originalExpiryDate) {
            throw new _invalidtransitiondateexception.InvalidTransitionDateError('Original expiry date is required for existing tenants');
        }
        if (!context.isExistingTenant && context.originalExpiryDate) {
            throw new _invalidtransitiondateexception.InvalidTransitionDateError('Original expiry date should not be provided for new tenants');
        }
    }
    validateRentAmount(context) {
        if (context.monthlyAmount < 1000) {
            throw new _invalidtransitiondateexception.InvalidTransitionDateError('Monthly rent amount is too low', {
                monthlyAmount: context.monthlyAmount,
                minimum: 1000
            });
        }
        if (context.monthlyAmount > 10000000) {
            throw new _invalidtransitiondateexception.InvalidTransitionDateError('Monthly rent amount is too high', {
                monthlyAmount: context.monthlyAmount,
                maximum: 10000000
            });
        }
    }
    validateContractExists(contractId) {
        if (!contractId) {
            throw new _contractnotfoundexception.ContractNotFoundError('Contract ID is required');
        }
    }
    validateContractStatus(status) {
        if (status !== 'active') {
            throw new _invalidtransitiondateexception.InvalidTransitionDateError(`Cannot process payment for contract with status: ${status}`, {
                status,
                allowedStatus: 'active'
            });
        }
    }
    validatePaymentAmount(amount, expectedAmount) {
        if (amount !== expectedAmount) {
            throw new _invalidtransitiondateexception.InvalidTransitionDateError('Payment amount does not match expected monthly rent', {
                providedAmount: amount,
                expectedAmount
            });
        }
    }
    validatePaymentTiming(nextPaymentDue) {
        const today = new Date();
        const daysDifference = Math.ceil((nextPaymentDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        // Allow payments up to 5 days early
        if (daysDifference > 5) {
            throw new _invalidtransitiondateexception.InvalidTransitionDateError('Payment is too early. Payments can only be made up to 5 days before due date', {
                nextPaymentDue,
                today,
                daysDifference
            });
        }
    }
    validateEscrowExists(escrowId) {
        if (!escrowId) {
            throw new _escrowreleaseexception.EscrowReleaseError('Escrow ID is required');
        }
    }
    validateEscrowNotReleased(isReleased, escrowId) {
        if (isReleased) {
            throw new _escrowreleaseexception.EscrowReleaseError('Escrow balance has already been released', escrowId, {
                isReleased
            });
        }
    }
    validateEscrowReleaseDate(expectedReleaseDate, escrowId) {
        const today = new Date();
        if (expectedReleaseDate > today) {
            throw new _escrowreleaseexception.EscrowReleaseError('Escrow release date has not been reached yet', escrowId, {
                expectedReleaseDate,
                today
            });
        }
    }
    validateEscrowAmount(totalEscrowed, escrowId) {
        if (totalEscrowed <= 0) {
            throw new _escrowreleaseexception.EscrowReleaseError('No funds available in escrow for release', escrowId, {
                totalEscrowed
            });
        }
    }
};
BusinessValidationService = _ts_decorate([
    (0, _common.Injectable)()
], BusinessValidationService);

//# sourceMappingURL=business-validation.service.js.map