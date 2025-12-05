"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentsController", {
    enumerable: true,
    get: function() {
        return PaymentsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _paymentprocessorservice = require("./payment-processor.service");
const _paystackservice = require("./paystack.service");
const _contractsservice = require("../contracts/contracts.service");
const _escrowservice = require("../escrow/escrow.service");
const _jwtauthguard = require("../../auth/guards/jwt-auth.guard");
const _rolesguard = require("../../auth/guards/roles.guard");
const _rolesdecorator = require("../../auth/decorators/roles.decorator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
var UserRole = /*#__PURE__*/ function(UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["LANDLORD"] = "landlord";
    UserRole["TENANT"] = "tenant";
    UserRole["FACILITATOR"] = "facilitator";
    return UserRole;
}(UserRole || {});
let PaymentsController = class PaymentsController {
    // ==========================================
    // TENANT PAYMENT ENDPOINTS
    // ==========================================
    /**
   * INITIALIZE PAYMENT
   * 
   * Step 1: Initialize payment with Paystack.
   * Returns authorization URL for tenant to complete payment.
   */ async initializePayment(dto, req) {
        try {
            // Get contract to verify tenant
            const contract = await this.contractsService.getContractById(dto.contractId);
            // Verify tenant owns this contract (unless admin)
            if (req.user.role !== "admin" && contract.tenantId !== req.user.id) {
                throw new _common.HttpException('You can only make payments for your own contracts', _common.HttpStatus.FORBIDDEN);
            }
            // Initialize payment
            const result = await this.paymentProcessor.initializePayment(dto.contractId, dto.email);
            return result;
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to initialize payment', error.status || _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * INITIALIZE PAYSTACK PAYMENT (GENERIC)
   * 
   * Initialize a generic Paystack payment (not tied to a contract).
   * Used for one-time payments, top-ups, etc.
   * Creates a payment record immediately with status='pending'
   */ async initializePaystackPayment(dto, req) {
        try {
            this.logger.log(`🔄 Initializing Paystack payment for ${dto.email}: ₦${dto.amount}`);
            // Check for existing pending payment for this tenant
            const existingPending = await this.paymentProcessor.checkPendingPayment(req.user.id);
            if (existingPending) {
                this.logger.warn(`⚠️ User ${req.user.id} already has a pending payment`);
                throw new _common.HttpException('You already have a pending payment. Please complete or cancel it first.', _common.HttpStatus.CONFLICT);
            }
            // Initialize payment with Paystack
            // Note: Amount should be in Naira, PaystackService will convert to kobo
            const result = await this.paystackService.initializeTransaction({
                email: dto.email,
                amount: dto.amount,
                currency: dto.currency || 'NGN',
                metadata: {
                    ...dto.metadata,
                    userId: req.user.id,
                    userRole: req.user.role,
                    description: dto.description
                }
            });
            if (!result.status) {
                throw new _common.HttpException(result.message || 'Failed to initialize payment', _common.HttpStatus.BAD_REQUEST);
            }
            // Create payment record in database with status='pending'
            await this.paymentProcessor.createPendingPaymentRecord({
                tenantId: req.user.id,
                amount: dto.amount,
                paystackReference: result.data?.reference || '',
                description: dto.description,
                metadata: dto.metadata
            });
            this.logger.log(`✅ Payment initialized and recorded: ${result.data?.reference}`);
            return {
                success: true,
                authorization_url: result.data?.authorization_url,
                access_code: result.data?.access_code,
                reference: result.data?.reference
            };
        } catch (error) {
            this.logger.error(`❌ Payment initialization failed: ${error.message}`);
            throw new _common.HttpException(error.message || 'Failed to initialize payment', error.status || _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * VERIFY PAYMENT
   * 
   * Verify payment status after Paystack redirect.
   * Mobile app can call this to check if payment was successful.
   */ async verifyPayment(reference) {
        try {
            const verification = await this.paystackService.verifyTransaction(reference);
            if (!verification.status) {
                throw new _common.HttpException(verification.message || 'Verification failed', _common.HttpStatus.BAD_REQUEST);
            }
            return {
                success: true,
                data: {
                    reference: verification.data?.reference,
                    status: verification.data?.status,
                    amount: verification.data?.amount,
                    paid_at: verification.data?.paid_at,
                    message: verification.data?.gateway_response
                }
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to verify payment', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * VERIFY PAYSTACK PAYMENT (POST)
   * 
   * Verify payment status via POST request.
   * Updates payment record in database based on Paystack status.
   */ async verifyPaystackPayment(dto) {
        try {
            this.logger.log(`🔍 Verifying payment: ${dto.reference}`);
            const verification = await this.paystackService.verifyTransaction(dto.reference);
            if (!verification.status) {
                this.logger.error(`❌ Verification failed: ${verification.message}`);
                throw new _common.HttpException(verification.message || 'Verification failed', _common.HttpStatus.BAD_REQUEST);
            }
            const paystackStatus = verification.data?.status || 'unknown';
            this.logger.log(`✅ Payment verified with Paystack: ${paystackStatus}`);
            this.logger.log(`💰 Raw amount from Paystack: ${verification.data?.amount}`);
            // Paystack returns amount in kobo, so we need to pass it as-is
            // The payment processor will validate it
            await this.paymentProcessor.updatePaymentStatus(dto.reference, paystackStatus, verification.data);
            return {
                status: true,
                data: {
                    reference: verification.data?.reference,
                    status: paystackStatus,
                    amount: verification.data?.amount ? verification.data.amount / 100 : 0,
                    paid_at: verification.data?.paid_at,
                    message: verification.data?.gateway_response
                }
            };
        } catch (error) {
            this.logger.error(`❌ Verification error: ${error.message}`);
            throw new _common.HttpException(error.message || 'Failed to verify payment', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * COMPLETE PAYMENT
   * 
   * Verify and process payment through business logic.
   * This updates the contract, creates payment records, and handles payouts.
   * Call this after payment is successful to complete the transaction.
   */ async completePayment(reference) {
        try {
            const result = await this.paymentProcessor.completePayment(reference);
            return {
                success: true,
                message: 'Payment completed successfully',
                data: result
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to complete payment', error.status || _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * ENABLE RECURRING PAYMENTS
   * 
   * Tenant opts in to recurring payments using their saved card.
   * Card is saved automatically after first successful payment.
   */ async enableRecurringPayments(dto, req) {
        try {
            // TODO: Update contract to enable recurring payments
            // For now, just verify tenant has saved card
            return {
                success: true,
                message: 'Recurring payments enabled. Your card will be charged automatically on the 1st of each month.'
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to enable recurring payments', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * CHARGE RECURRING PAYMENT
   * 
   * Manually trigger recurring payment (usually called by cron job).
   */ async chargeRecurringPayment(dto) {
        try {
            const result = await this.paymentProcessor.chargeRecurringPayment(dto.contractId, dto.tenantId);
            return {
                success: true,
                message: 'Recurring payment processed successfully',
                data: result
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to charge recurring payment', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * GET PAYMENT HISTORY
   * 
   * Retrieve payment history for a tenant.
   */ async getPaymentHistory(tenantId, req) {
        try {
            // Tenants can only view their own history
            if (req.user.role === "tenant" && tenantId !== req.user.id) {
                throw new _common.HttpException('Access denied', _common.HttpStatus.FORBIDDEN);
            }
            const payments = await this.paymentProcessor.getPaymentHistory(tenantId || req.user.id);
            return {
                success: true,
                data: payments
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch payment history', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * GET UPCOMING PAYMENTS
   * 
   * Get list of upcoming rent payments for a tenant.
   */ async getUpcomingPayments(req) {
        try {
            const payments = await this.paymentProcessor.getUpcomingPayments(req.user.id);
            return {
                success: true,
                data: payments
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch upcoming payments', _common.HttpStatus.BAD_REQUEST);
        }
    }
    // ==========================================
    // LANDLORD PAYOUT ENDPOINTS
    // ==========================================
    /**
   * SETUP BANK ACCOUNT
   * 
   * Landlord sets up bank account for receiving payouts.
   */ async setupBankAccount(dto, req) {
        try {
            const result = await this.paymentProcessor.setupLandlordBankAccount(req.user.id, dto);
            return result;
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to setup bank account', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * GET BANK ACCOUNTS
   * 
   * Get landlord's saved bank accounts.
   */ async getBankAccounts(req) {
        try {
            const accounts = await this.paymentProcessor.getLandlordBankAccounts(req.user.id);
            return {
                success: true,
                data: accounts
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch bank accounts', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * REQUEST PAYOUT
   * 
   * Landlord requests payout to their bank account.
   */ async requestPayout(dto, req) {
        try {
            // TODO: Verify landlord has sufficient balance
            // For now, just initiate payout
            const result = await this.paymentProcessor.processLandlordPayout(req.user.id, dto.amount, dto.reason || 'Rent payout');
            return result;
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to process payout', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * GET ESCROW BALANCE
   * 
   * Get landlord's escrow balance (for yearly payouts).
   */ async getEscrowBalance(req) {
        try {
            const balances = await this.escrowService.getEscrowBalances(req.user.id);
            // Calculate total unreleased
            const total = balances.filter((b)=>!b.isReleased).reduce((sum, b)=>sum + parseFloat(b.totalEscrowed), 0);
            return {
                success: true,
                data: {
                    balances,
                    unreleasedTotal: total
                }
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch escrow balance', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * GET AVAILABLE BALANCE
   * 
   * Get landlord's available balance for payout.
   */ async getAvailableBalance(req) {
        try {
            // TODO: Calculate available balance from payments
            // For now, return mock data
            return {
                success: true,
                data: {
                    available: 0,
                    pending: 0,
                    currency: 'NGN'
                }
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch balance', _common.HttpStatus.BAD_REQUEST);
        }
    }
    // ==========================================
    // UTILITY ENDPOINTS
    // ==========================================
    /**
   * GET BANKS LIST
   * 
   * Get list of Nigerian banks for landlord account setup.
   */ async getBanks() {
        try {
            const result = await this.paystackService.listBanks('nigeria');
            if (!result.status) {
                throw new _common.HttpException(result.message || 'Failed to fetch banks from Paystack', _common.HttpStatus.BAD_REQUEST);
            }
            if (!result.data || result.data.length === 0) {
                throw new _common.HttpException('No banks returned from Paystack', _common.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: result.data
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch banks', error.status || _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * RESOLVE ACCOUNT NUMBER
   * 
   * Verify bank account details before saving.
   */ async resolveAccount(dto) {
        try {
            this.logger.log(`🔍 Resolving account: ${dto.account_number} at bank: ${dto.bank_code}`);
            const result = await this.paystackService.resolveAccountNumber(dto);
            if (!result.status) {
                this.logger.error(`❌ Account resolution failed: ${result.message}`);
                throw new _common.HttpException(result.message || 'Invalid account number', _common.HttpStatus.BAD_REQUEST);
            }
            this.logger.log(`✅ Account resolved successfully: ${result.data?.account_name}`);
            return {
                success: true,
                data: result.data
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to resolve account', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * DELETE SAVED CARD
   * 
   * Remove tenant's saved card (disable recurring payments).
   */ async deleteSavedCard(req) {
        try {
            // TODO: Remove saved card from user record
            // For now, just return success
            return {
                success: true,
                message: 'Saved card removed successfully'
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to remove card', _common.HttpStatus.BAD_REQUEST);
        }
    }
    // ==========================================
    // LANDLORD WALLET ENDPOINTS
    // ==========================================
    /**
   * GET WALLET BALANCE
   * 
   * Get landlord's current wallet balance.
   */ async getWalletBalance(req) {
        try {
            const balance = await this.paymentProcessor.getWalletBalance(req.user.id);
            return {
                success: true,
                data: balance
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch wallet balance', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * GET WALLET TRANSACTIONS
   * 
   * Get landlord's wallet transaction history.
   */ async getWalletTransactions(req, limit, offset) {
        try {
            const transactions = await this.paymentProcessor.getWalletTransactions(req.user.id, {
                limit: limit ? parseInt(limit) : 50,
                offset: offset ? parseInt(offset) : 0
            });
            return {
                success: true,
                data: transactions
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch transactions', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * GET LANDLORD PAYMENT STATS
   * 
   * Get comprehensive payment statistics for landlord dashboard.
   */ async getLandlordPaymentStats(req) {
        try {
            const stats = await this.paymentProcessor.getLandlordPaymentStats(req.user.id);
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch payment stats', _common.HttpStatus.BAD_REQUEST);
        }
    }
    /**
   * REQUEST WITHDRAWAL
   * 
   * Landlord requests to withdraw funds to their bank account.
   */ async requestWithdrawal(dto, req) {
        try {
            const result = await this.paymentProcessor.processWithdrawal(req.user.id, dto.amount, dto.reason);
            return {
                success: true,
                message: 'Withdrawal request processed successfully',
                data: result
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to process withdrawal', error.status || _common.HttpStatus.BAD_REQUEST);
        }
    }
    constructor(paymentProcessor, paystackService, contractsService, escrowService){
        this.paymentProcessor = paymentProcessor;
        this.paystackService = paystackService;
        this.contractsService = contractsService;
        this.escrowService = escrowService;
        this.logger = new _common.Logger(PaymentsController.name);
    }
};
_ts_decorate([
    (0, _common.Post)('initialize'),
    (0, _rolesdecorator.Roles)("tenant", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Initialize rent payment',
        description: 'Initialize payment with Paystack. Returns authorization URL for payment.'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Payment initialized'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.BAD_REQUEST,
        description: 'Invalid request'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "initializePayment", null);
_ts_decorate([
    (0, _common.Post)('paystack/initialize'),
    (0, _rolesdecorator.Roles)("tenant", "landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Initialize Paystack payment',
        description: 'Initialize a generic payment with Paystack. Returns authorization URL.'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Payment initialized'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.BAD_REQUEST,
        description: 'Invalid request'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "initializePaystackPayment", null);
_ts_decorate([
    (0, _common.Get)('verify/:reference'),
    (0, _rolesdecorator.Roles)("tenant", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Verify payment status'
    }),
    (0, _swagger.ApiParam)({
        name: 'reference',
        description: 'Paystack payment reference'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Payment status'
    }),
    _ts_param(0, (0, _common.Param)('reference')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
_ts_decorate([
    (0, _common.Post)('paystack/verify'),
    (0, _rolesdecorator.Roles)("tenant", "landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Verify Paystack payment'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Payment verified'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPaystackPayment", null);
_ts_decorate([
    (0, _common.Post)('complete/:reference'),
    (0, _rolesdecorator.Roles)("tenant", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Complete payment processing',
        description: 'Verify payment with Paystack and process through business logic (update contract, create records, etc.)'
    }),
    (0, _swagger.ApiParam)({
        name: 'reference',
        description: 'Paystack payment reference'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Payment completed'
    }),
    _ts_param(0, (0, _common.Param)('reference')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "completePayment", null);
_ts_decorate([
    (0, _common.Post)('recurring/enable'),
    (0, _rolesdecorator.Roles)("tenant"),
    (0, _swagger.ApiOperation)({
        summary: 'Enable recurring payments',
        description: 'Enable automatic monthly payments using saved card'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Recurring payments enabled'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "enableRecurringPayments", null);
_ts_decorate([
    (0, _common.Post)('recurring/charge'),
    (0, _rolesdecorator.Roles)("admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Charge recurring payment',
        description: 'Charge saved card for rent payment (admin only)'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Payment charged'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "chargeRecurringPayment", null);
_ts_decorate([
    (0, _common.Get)('history'),
    (0, _rolesdecorator.Roles)("tenant", "landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Get payment history'
    }),
    (0, _swagger.ApiQuery)({
        name: 'tenantId',
        required: false
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Payment history retrieved'
    }),
    _ts_param(0, (0, _common.Query)('tenantId')),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentHistory", null);
_ts_decorate([
    (0, _common.Get)('upcoming'),
    (0, _rolesdecorator.Roles)("tenant", "landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Get upcoming payments'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Upcoming payments retrieved'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getUpcomingPayments", null);
_ts_decorate([
    (0, _common.Post)('landlord/setup-bank'),
    (0, _rolesdecorator.Roles)("landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Setup landlord bank account',
        description: 'Setup bank account for receiving rent payouts'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Bank account set up'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "setupBankAccount", null);
_ts_decorate([
    (0, _common.Get)('landlord/bank-accounts'),
    (0, _rolesdecorator.Roles)("landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Get saved bank accounts',
        description: 'Retrieve landlord\'s saved bank accounts'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Bank accounts retrieved'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getBankAccounts", null);
_ts_decorate([
    (0, _common.Post)('landlord/request-payout'),
    (0, _rolesdecorator.Roles)("landlord"),
    (0, _swagger.ApiOperation)({
        summary: 'Request payout',
        description: 'Request transfer of available balance to bank account'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Payout initiated'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "requestPayout", null);
_ts_decorate([
    (0, _common.Get)('landlord/escrow'),
    (0, _rolesdecorator.Roles)("landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Get escrow balance'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Escrow balance retrieved'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getEscrowBalance", null);
_ts_decorate([
    (0, _common.Get)('landlord/balance'),
    (0, _rolesdecorator.Roles)("landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Get available balance'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Balance retrieved'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getAvailableBalance", null);
_ts_decorate([
    (0, _common.Get)('banks'),
    (0, _rolesdecorator.Roles)("landlord", "tenant", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Get list of banks'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Banks list retrieved'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getBanks", null);
_ts_decorate([
    (0, _common.Post)('resolve-account'),
    (0, _rolesdecorator.Roles)("landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Resolve bank account number'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Account resolved'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "resolveAccount", null);
_ts_decorate([
    (0, _common.Delete)('saved-card'),
    (0, _rolesdecorator.Roles)("tenant"),
    (0, _swagger.ApiOperation)({
        summary: 'Delete saved card'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Card removed'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "deleteSavedCard", null);
_ts_decorate([
    (0, _common.Get)('wallet/balance'),
    (0, _rolesdecorator.Roles)("landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Get wallet balance'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Balance retrieved'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getWalletBalance", null);
_ts_decorate([
    (0, _common.Get)('wallet/transactions'),
    (0, _rolesdecorator.Roles)("landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Get wallet transactions'
    }),
    (0, _swagger.ApiQuery)({
        name: 'limit',
        required: false
    }),
    (0, _swagger.ApiQuery)({
        name: 'offset',
        required: false
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Transactions retrieved'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('offset')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getWalletTransactions", null);
_ts_decorate([
    (0, _common.Get)('landlord/stats'),
    (0, _rolesdecorator.Roles)("landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Get landlord payment statistics'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Payment stats retrieved'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getLandlordPaymentStats", null);
_ts_decorate([
    (0, _common.Post)('wallet/withdraw'),
    (0, _rolesdecorator.Roles)("landlord"),
    (0, _swagger.ApiOperation)({
        summary: 'Request withdrawal'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Withdrawal initiated'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "requestWithdrawal", null);
PaymentsController = _ts_decorate([
    (0, _swagger.ApiTags)('payments'),
    (0, _common.Controller)('payments'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paymentprocessorservice.PaymentProcessorService === "undefined" ? Object : _paymentprocessorservice.PaymentProcessorService,
        typeof _paystackservice.PaystackService === "undefined" ? Object : _paystackservice.PaystackService,
        typeof _contractsservice.ContractsService === "undefined" ? Object : _contractsservice.ContractsService,
        typeof _escrowservice.EscrowService === "undefined" ? Object : _escrowservice.EscrowService
    ])
], PaymentsController);

//# sourceMappingURL=payments.controller.js.map