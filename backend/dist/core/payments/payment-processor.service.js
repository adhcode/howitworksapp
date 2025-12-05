"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentProcessorService", {
    enumerable: true,
    get: function() {
        return PaymentProcessorService;
    }
});
const _common = require("@nestjs/common");
const _postgresjs = require("drizzle-orm/postgres-js");
const _drizzleorm = require("drizzle-orm");
const _databasemodule = require("../../database/database.module");
const _schema = /*#__PURE__*/ _interop_require_wildcard(require("../../database/schema"));
const _tenantrentcontracts = require("../../database/schema/tenant-rent-contracts");
const _payments = require("../../database/schema/payments");
const _users = require("../../database/schema/users");
const _businessrulesconstant = require("../../shared/constants/business-rules.constant");
const _dateutils = require("../../shared/utils/date.utils");
const _paystackservice = require("./paystack.service");
const _walletservice = require("../wallet/wallet.service");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
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
let PaymentProcessorService = class PaymentProcessorService {
    /**
   * PROCESS RENT PAYMENT
   * 
   * Main payment processing flow:
   * 1. Validate contract exists and is active
   * 2. Verify payment amount matches monthly rent
   * 3. Route payment based on landlord payout type:
   *    - MONTHLY → Immediate payout to landlord wallet
   *    - YEARLY → Add to escrow for later release
   * 4. Create payment record
   * 5. Update next payment due date
   * 
   * @param dto - Payment details
   * @returns Payment result
   */ async processPayment(dto) {
        this.logger.log(`Processing payment for contract ${dto.contractId}`);
        // Get contract
        const [contract] = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, dto.contractId)).limit(1);
        if (!contract) {
            throw new _common.BadRequestException(`Contract ${dto.contractId} not found`);
        }
        if (contract.status !== 'active') {
            throw new _common.BadRequestException(`Contract is not active. Status: ${contract.status}`);
        }
        // Verify payment amount
        const expectedAmount = parseFloat(contract.monthlyAmount);
        if (Math.abs(dto.amount - expectedAmount) > 0.01) {
            throw new _common.BadRequestException(`Payment amount ${dto.amount} does not match contract amount ${expectedAmount}`);
        }
        try {
            let payoutMessage;
            let transactionId;
            // Route payment based on payout type
            if (contract.landlordPayoutType === 'monthly') {
                // Immediate payout to landlord
                transactionId = await this.processImmediatePayout(contract.landlordId, dto.amount, dto.contractId, dto.paymentMethod, dto.reference);
                payoutMessage = 'Payment credited immediately to landlord wallet';
            } else {
                // Add to escrow
                await this.addToEscrow(contract.landlordId, dto.amount, dto.contractId);
                payoutMessage = 'Payment added to escrow for yearly release';
            }
            // Create payment record
            await this.createPaymentRecord(contract, dto);
            // Update next payment due date (add 1 month)
            const nextPaymentDue = (0, _dateutils.addMonths)(contract.nextPaymentDue, 1);
            await this.updateNextPaymentDue(dto.contractId, nextPaymentDue);
            this.logger.log(`✅ Payment processed successfully for contract ${dto.contractId}`);
            this.logger.log(`   Amount: $${dto.amount}`);
            this.logger.log(`   Payout type: ${contract.landlordPayoutType}`);
            this.logger.log(`   Next payment due: ${nextPaymentDue.toDateString()}`);
            return {
                success: true,
                payoutType: contract.landlordPayoutType,
                message: payoutMessage,
                nextPaymentDue,
                transactionId
            };
        } catch (error) {
            this.logger.error(`❌ Payment processing failed: ${error.message}`, error.stack);
            throw new _common.BadRequestException(`Payment processing failed: ${error.message}`);
        }
    }
    /**
   * PROCESS IMMEDIATE PAYOUT (MONTHLY)
   * 
   * Credits landlord's wallet immediately when tenant pays.
   * 
   * TODO: Integrate with actual wallet/banking system
   * For now, logs the transaction.
   * 
   * @param landlordId - Landlord to pay
   * @param amount - Amount to credit
   * @param contractId - Related contract
   * @param paymentMethod - How tenant paid
   * @param reference - Payment reference
   * @returns Transaction ID
   */ async processImmediatePayout(landlordId, amount, contractId, paymentMethod, reference) {
        this.logger.log(`💰 Immediate payout: ₦${amount} to landlord ${landlordId}`);
        // Credit landlord's wallet using WalletService
        const transaction = await this.walletService.credit(landlordId, amount, {
            type: 'rent_payment',
            contractId,
            reference,
            description: `Rent payment received via ${paymentMethod || 'card'}`
        });
        this.logger.log(`✅ Landlord wallet credited. Transaction ID: ${transaction.id}`);
        this.logger.log(`   Balance updated for landlord ${landlordId}`);
        return transaction.id;
    }
    /**
   * ADD TO ESCROW (YEARLY)
   * 
   * Adds payment to escrow balance for yearly payout landlords.
   * Money accumulates until:
   * - 12 months have passed, OR
   * - Contract expires
   * Then it's released to landlord wallet.
   * 
   * @param landlordId - Landlord ID
   * @param amount - Amount to add
   * @param contractId - Related contract
   */ async addToEscrow(landlordId, amount, contractId) {
        this.logger.log(`🏦 Adding $${amount} to escrow for landlord ${landlordId}`);
        // Check if escrow balance exists for this contract
        const [existingEscrow] = await this.db.select().from(_tenantrentcontracts.landlordEscrowBalances).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.contractId, contractId), (0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.landlordId, landlordId), (0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.isReleased, false))).limit(1);
        if (existingEscrow) {
            // Update existing escrow
            const newTotal = parseFloat(existingEscrow.totalEscrowed) + amount;
            const newMonthsAccumulated = existingEscrow.monthsAccumulated + 1;
            await this.db.update(_tenantrentcontracts.landlordEscrowBalances).set({
                totalEscrowed: newTotal.toFixed(2),
                monthsAccumulated: newMonthsAccumulated,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.id, existingEscrow.id));
            this.logger.log(`✅ Escrow updated: $${newTotal} (${newMonthsAccumulated} months)`);
        } else {
            // Create new escrow balance
            // Expected release date: 12 months from now
            const expectedReleaseDate = (0, _dateutils.addMonths)(new Date(), _businessrulesconstant.BUSINESS_RULES.ESCROW.AUTO_RELEASE_MONTHS);
            const escrowData = {
                landlordId,
                contractId,
                totalEscrowed: amount.toFixed(2),
                monthsAccumulated: 1,
                expectedReleaseDate,
                isReleased: false
            };
            await this.db.insert(_tenantrentcontracts.landlordEscrowBalances).values(escrowData);
            this.logger.log(`✅ New escrow created: $${amount} | Release date: ${expectedReleaseDate.toDateString()}`);
        }
    }
    /**
   * CREATE PAYMENT RECORD
   * 
   * Records payment in the payments table for tracking and history.
   * 
   * @param contract - Related contract
   * @param dto - Payment details
   */ async createPaymentRecord(contract, dto) {
        const paymentData = {
            landlordId: contract.landlordId,
            tenantId: contract.tenantId,
            propertyId: contract.propertyId,
            unitId: contract.unitId,
            amount: dto.amount.toFixed(2),
            amountPaid: dto.amount.toFixed(2),
            dueDate: contract.nextPaymentDue,
            paidDate: new Date(),
            paymentType: 'rent',
            paymentMethod: dto.paymentMethod,
            status: 'paid',
            receiptNumber: dto.reference,
            description: `Rent payment for ${(0, _dateutils.startOfMonth)(contract.nextPaymentDue).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            })}`,
            notes: dto.reference
        };
        await this.db.insert(_payments.payments).values(paymentData);
        this.logger.log(`✅ Payment record created`);
    }
    /**
   * UPDATE NEXT PAYMENT DUE DATE
   * 
   * After payment, advances the next payment due date by 1 month.
   * 
   * @param contractId - Contract ID
   * @param nextPaymentDue - New due date
   */ async updateNextPaymentDue(contractId, nextPaymentDue) {
        await this.db.update(_tenantrentcontracts.tenantRentContracts).set({
            nextPaymentDue,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, contractId));
        this.logger.log(`✅ Next payment due updated to: ${nextPaymentDue.toDateString()}`);
    }
    /**
   * GET PAYMENT HISTORY FOR TENANT
   * 
   * Returns all payments made by a tenant across all their contracts.
   * 
   * @param tenantId - Tenant ID
   * @returns Payment history
   */ async getPaymentHistory(tenantId) {
        return this.db.select().from(_payments.payments).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_payments.payments.tenantId, tenantId), (0, _drizzleorm.eq)(_payments.payments.status, 'paid'))).orderBy((0, _drizzleorm.sql)`${_payments.payments.paidDate} DESC`);
    }
    /**
   * GET UPCOMING PAYMENTS FOR TENANT
   * 
   * Returns all upcoming (pending) payments for a tenant.
   * 
   * @param tenantId - Tenant ID
   * @returns Upcoming payments
   */ async getUpcomingPayments(tenantId) {
        const contracts = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.tenantId, tenantId), (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, 'active')));
        return contracts.map((contract)=>({
                contractId: contract.id,
                propertyId: contract.propertyId,
                unitId: contract.unitId,
                amount: contract.monthlyAmount,
                dueDate: contract.nextPaymentDue,
                status: this.getPaymentStatus(contract.nextPaymentDue)
            }));
    }
    /**
   * GET PAYMENT STATUS
   * 
   * Determines if payment is pending, due, or overdue based on dates.
   * 
   * @param dueDate - Payment due date
   * @returns Status string
   */ getPaymentStatus(dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < -_businessrulesconstant.BUSINESS_RULES.PAYMENT_GRACE_DAYS) {
            return 'overdue';
        } else if (diffDays <= 0) {
            return 'due';
        } else {
            return 'upcoming';
        }
    }
    // ==========================================
    // PAYSTACK-INTEGRATED METHODS
    // ==========================================
    /**
   * INITIALIZE PAYMENT WITH PAYSTACK
   * 
   * Step 1: Initialize payment transaction with Paystack.
   * Returns authorization URL for tenant to complete payment.
   * 
   * @param contractId - Contract to pay for
   * @param tenantEmail - Tenant's email
   * @returns Paystack authorization URL and reference
   */ async initializePayment(contractId, tenantEmail) {
        this.logger.log(`💳 Initializing payment for contract ${contractId}`);
        // Get contract
        const [contract] = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, contractId)).limit(1);
        if (!contract) {
            throw new _common.NotFoundException(`Contract ${contractId} not found`);
        }
        if (contract.status !== 'active') {
            throw new _common.BadRequestException(`Contract is not active`);
        }
        const amount = parseFloat(contract.monthlyAmount);
        const reference = this.paystackService.generateReference();
        // Initialize with Paystack
        const paystackResponse = await this.paystackService.initializeTransaction({
            email: tenantEmail,
            amount: amount,
            reference: reference,
            callback_url: `${process.env.FRONTEND_URL}/payments/callback`,
            metadata: {
                contractId: contract.id,
                tenantId: contract.tenantId,
                landlordId: contract.landlordId,
                propertyId: contract.propertyId,
                unitId: contract.unitId,
                payoutType: contract.landlordPayoutType,
                type: 'rent_payment'
            }
        });
        if (!paystackResponse.status || !paystackResponse.data) {
            throw new _common.BadRequestException(paystackResponse.message || 'Payment initialization failed');
        }
        this.logger.log(`✅ Payment initialized: ${reference}`);
        return {
            success: true,
            message: 'Payment initialized successfully',
            authorization_url: paystackResponse.data.authorization_url,
            reference: reference,
            amount: amount
        };
    }
    /**
   * COMPLETE PAYMENT AFTER PAYSTACK VERIFICATION
   * 
   * Step 2: Verify payment with Paystack and process through business logic.
   * Called by webhook or callback handler.
   * 
   * @param reference - Paystack payment reference
   * @returns Payment result
   */ async completePayment(reference) {
        this.logger.log(`🔍 Completing payment: ${reference}`);
        // Verify transaction with Paystack
        const verification = await this.paystackService.verifyTransaction(reference);
        if (!verification.status || !verification.data) {
            throw new _common.BadRequestException(verification.message || 'Payment verification failed');
        }
        if (verification.data.status !== 'success') {
            throw new _common.BadRequestException(`Payment failed: ${verification.data.gateway_response}`);
        }
        // Extract contract details from metadata
        const metadata = verification.data.metadata;
        const contractId = metadata.contractId;
        const amount = verification.data.amount; // Already converted from kobo in verifyTransaction
        // Save authorization code if card is reusable (for recurring payments)
        if (verification.data.authorization?.reusable) {
            await this.savePaymentAuthorization(metadata.tenantId, verification.data.authorization);
        }
        // Process payment using existing business logic
        return this.processPayment({
            contractId: contractId,
            amount: amount,
            paymentMethod: verification.data.channel,
            reference: reference
        });
    }
    /**
   * CHARGE RECURRING PAYMENT (SAVED CARD)
   * 
   * Charges tenant's saved card automatically for recurring payments.
   * 
   * @param contractId - Contract to charge for
   * @param tenantId - Tenant who owns the card
   * @returns Payment result
   */ async chargeRecurringPayment(contractId, tenantId) {
        this.logger.log(`🔄 Processing recurring payment for contract ${contractId}`);
        // Get contract
        const [contract] = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, contractId)).limit(1);
        if (!contract) {
            throw new _common.NotFoundException(`Contract ${contractId} not found`);
        }
        if (contract.tenantId !== tenantId) {
            throw new _common.BadRequestException(`Contract does not belong to this tenant`);
        }
        // Get tenant's saved authorization
        const [tenant] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, tenantId)).limit(1);
        if (!tenant || !tenant.paystackAuthorizationCode) {
            throw new _common.BadRequestException(`No saved payment method found for this tenant`);
        }
        const amount = parseFloat(contract.monthlyAmount);
        const reference = this.paystackService.generateReference('recurring');
        // Charge the saved card
        const chargeResponse = await this.paystackService.chargeAuthorization({
            email: tenant.email,
            amount: amount,
            authorization_code: tenant.paystackAuthorizationCode,
            reference: reference,
            metadata: {
                contractId: contract.id,
                tenantId: contract.tenantId,
                landlordId: contract.landlordId,
                type: 'recurring_rent_payment'
            }
        });
        if (!chargeResponse.status) {
            this.logger.error(`❌ Recurring payment failed: ${chargeResponse.message}`);
            throw new _common.BadRequestException(`Recurring payment failed: ${chargeResponse.message}`);
        }
        // Process payment
        return this.processPayment({
            contractId: contractId,
            amount: amount,
            paymentMethod: 'card_recurring',
            reference: reference
        });
    }
    /**
   * SAVE PAYMENT AUTHORIZATION (CARD DETAILS)
   * 
   * Saves tenant's card authorization for recurring payments.
   * 
   * @param tenantId - Tenant ID
   * @param authorization - Paystack authorization object
   */ async savePaymentAuthorization(tenantId, authorization) {
        if (!authorization.reusable) {
            return; // Don't save if not reusable
        }
        this.logger.log(`💳 Saving payment method for tenant ${tenantId}`);
        await this.db.update(_users.users).set({
            paystackAuthorizationCode: authorization.authorization_code,
            paystackCardLast4: authorization.last4,
            paystackCardBrand: authorization.brand,
            paystackCardBank: authorization.bank,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_users.users.id, tenantId));
        this.logger.log(`✅ Payment method saved for tenant ${tenantId}`);
    }
    /**
   * PROCESS LANDLORD PAYOUT
   * 
   * Transfers money to landlord's bank account via Paystack.
   * 
   * @param landlordId - Landlord to pay out
   * @param amount - Amount to transfer
   * @param reason - Reason for transfer
   * @returns Transfer result
   */ async processLandlordPayout(landlordId, amount, reason = 'Rent payout') {
        this.logger.log(`💸 Processing landlord payout: ${landlordId} - ₦${amount}`);
        // Get landlord details
        const [landlord] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, landlordId)).limit(1);
        if (!landlord) {
            throw new _common.NotFoundException(`Landlord ${landlordId} not found`);
        }
        // Check if landlord has recipient code
        if (!landlord.paystackRecipientCode) {
            throw new _common.BadRequestException(`Landlord must set up bank account before receiving payouts`);
        }
        // Initiate transfer
        const transferResponse = await this.paystackService.initiateTransfer({
            amount: amount,
            recipient: landlord.paystackRecipientCode,
            reason: reason,
            metadata: {
                landlordId: landlord.id,
                type: 'landlord_payout'
            }
        });
        if (!transferResponse.status) {
            this.logger.error(`❌ Payout failed: ${transferResponse.message}`);
            throw new _common.BadRequestException(`Payout failed: ${transferResponse.message}`);
        }
        this.logger.log(`✅ Payout initiated: ${transferResponse.data?.transfer_code}`);
        return {
            success: true,
            message: 'Payout initiated successfully',
            transfer_code: transferResponse.data?.transfer_code,
            reference: transferResponse.data?.reference
        };
    }
    /**
   * SETUP LANDLORD BANK ACCOUNT
   * 
   * Creates transfer recipient for landlord payouts.
   * 
   * @param landlordId - Landlord ID
   * @param bankDetails - Bank account details
   * @returns Recipient code
   */ async setupLandlordBankAccount(landlordId, bankDetails) {
        this.logger.log(`🏦 Setting up bank account for landlord ${landlordId}`);
        // Get landlord
        const [landlord] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, landlordId)).limit(1);
        if (!landlord) {
            throw new _common.NotFoundException(`Landlord ${landlordId} not found`);
        }
        // Resolve account number first
        const accountDetails = await this.paystackService.resolveAccountNumber({
            account_number: bankDetails.account_number,
            bank_code: bankDetails.bank_code
        });
        if (!accountDetails.status) {
            throw new _common.BadRequestException(`Invalid bank account: ${accountDetails.message}`);
        }
        // Create transfer recipient
        const recipientResponse = await this.paystackService.createTransferRecipient({
            type: 'nuban',
            name: accountDetails.data?.account_name || landlord.firstName + ' ' + landlord.lastName,
            account_number: bankDetails.account_number,
            bank_code: bankDetails.bank_code,
            metadata: {
                landlordId: landlord.id,
                email: landlord.email
            }
        });
        if (!recipientResponse.status) {
            throw new _common.BadRequestException(`Failed to create recipient: ${recipientResponse.message}`);
        }
        // Save recipient code to landlord
        await this.db.update(_users.users).set({
            paystackRecipientCode: recipientResponse.data?.recipient_code,
            bankAccountName: accountDetails.data?.account_name,
            bankAccountNumber: bankDetails.account_number,
            bankCode: bankDetails.bank_code,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_users.users.id, landlordId));
        this.logger.log(`✅ Bank account set up for landlord ${landlordId}`);
        return {
            success: true,
            message: 'Bank account set up successfully',
            recipient_code: recipientResponse.data?.recipient_code
        };
    }
    /**
   * GET LANDLORD BANK ACCOUNTS
   * 
   * Returns landlord's saved bank accounts.
   */ async getLandlordBankAccounts(landlordId) {
        this.logger.log(`💳 Fetching bank accounts for landlord ${landlordId}`);
        // Get landlord
        const [landlord] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, landlordId)).limit(1);
        if (!landlord) {
            throw new _common.NotFoundException(`Landlord ${landlordId} not found`);
        }
        // Check if landlord has bank account setup
        if (!landlord.bankAccountNumber || !landlord.bankCode) {
            this.logger.log(`ℹ️ No bank account found for landlord ${landlordId}`);
            return [];
        }
        // Get bank name from Paystack
        const banksResponse = await this.paystackService.listBanks('nigeria');
        const bank = banksResponse.data?.find((b)=>b.code === landlord.bankCode);
        const accounts = [
            {
                accountName: landlord.bankAccountName,
                accountNumber: landlord.bankAccountNumber,
                bankCode: landlord.bankCode,
                bankName: bank?.name || 'Unknown Bank',
                recipientCode: landlord.paystackRecipientCode
            }
        ];
        this.logger.log(`✅ Found ${accounts.length} bank account(s) for landlord ${landlordId}`);
        return accounts;
    }
    // ==========================================
    // WALLET MANAGEMENT METHODS
    // ==========================================
    /**
   * GET WALLET BALANCE
   * 
   * Returns landlord's current wallet balance.
   */ async getWalletBalance(landlordId) {
        return this.walletService.getBalance(landlordId);
    }
    /**
   * GET LANDLORD PAYMENT STATS
   * 
   * Returns comprehensive payment statistics for landlord dashboard.
   */ async getLandlordPaymentStats(landlordId) {
        try {
            this.logger.log(`🔍 Getting payment stats for landlord: ${landlordId}`);
            // Get wallet balance
            const walletBalance = await this.walletService.getBalance(landlordId);
            this.logger.log(`💰 Wallet balance: ${walletBalance.availableBalance}`);
            // Get recent transactions
            const transactions = await this.walletService.getTransactions(landlordId, {
                limit: 10
            });
            this.logger.log(`📊 Transactions count: ${transactions?.length || 0}`);
            // Get payments directly for this landlord
            const landlordPayments = await this.db.select().from(_payments.payments).where((0, _drizzleorm.eq)(_payments.payments.landlordId, landlordId));
            this.logger.log(`💳 Payments count: ${landlordPayments.length}`);
            // Get contracts for upcoming/pending calculations
            const contracts = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.landlordId, landlordId));
            this.logger.log(`📋 Contracts count: ${contracts.length}`);
            // Calculate stats
            const totalRentCollected = landlordPayments.filter((p)=>p.status === 'paid').reduce((sum, p)=>sum + parseFloat(p.amountPaid || '0'), 0);
            const now = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(now.getDate() + 7);
            const upcomingPayments = contracts.filter((c)=>{
                if (!c.nextPaymentDue) return false;
                const dueDate = new Date(c.nextPaymentDue);
                return dueDate >= now && dueDate <= nextWeek;
            }).length;
            const pendingPayments = contracts.filter((c)=>{
                if (!c.nextPaymentDue) return false;
                const dueDate = new Date(c.nextPaymentDue);
                return dueDate < now;
            }).reduce((sum, c)=>sum + parseFloat(c.monthlyAmount || '0'), 0);
            // Format recent transactions
            const recentTransactions = transactions?.slice(0, 5).map((t)=>({
                    type: t.type === 'credit' ? 'credit' : 'debit',
                    description: t.description,
                    amount: parseFloat(t.amount),
                    date: t.createdAt
                })) || [];
            const result = {
                walletBalance: walletBalance.availableBalance || 0,
                totalRentCollected,
                upcomingPayments,
                pendingPayments,
                recentTransactions
            };
            this.logger.log(`✅ Payment stats result:`, result);
            return result;
        } catch (error) {
            this.logger.error(`❌ Error getting landlord payment stats: ${error.message}`);
            return {
                walletBalance: 0,
                totalRentCollected: 0,
                upcomingPayments: 0,
                pendingPayments: 0,
                recentTransactions: []
            };
        }
    }
    /**
   * GET WALLET TRANSACTIONS
   * 
   * Returns landlord's wallet transaction history.
   */ async getWalletTransactions(landlordId, options) {
        return this.walletService.getTransactions(landlordId, options);
    }
    /**
   * PROCESS WITHDRAWAL
   * 
   * Process landlord withdrawal request.
   * Debits wallet and initiates Paystack transfer.
   */ async processWithdrawal(landlordId, amount, reason) {
        this.logger.log(`💸 Processing withdrawal: ₦${amount} for landlord ${landlordId}`);
        // Get landlord details
        const [landlord] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.id, landlordId)).limit(1);
        if (!landlord) {
            throw new _common.NotFoundException('Landlord not found');
        }
        // Check if bank account is set up
        if (!landlord.paystackRecipientCode) {
            throw new _common.BadRequestException('Please set up your bank account before requesting withdrawal');
        }
        // Get current balance
        const balance = await this.walletService.getBalance(landlordId);
        // Check sufficient balance
        if (balance.availableBalance < amount) {
            throw new _common.BadRequestException(`Insufficient balance. Available: ₦${balance.availableBalance}, Requested: ₦${amount}`);
        }
        // Minimum withdrawal amount
        const MIN_WITHDRAWAL = 1000; // ₦1,000
        if (amount < MIN_WITHDRAWAL) {
            throw new _common.BadRequestException(`Minimum withdrawal amount is ₦${MIN_WITHDRAWAL}`);
        }
        try {
            // Debit wallet first
            const transaction = await this.walletService.debit(landlordId, amount, {
                type: 'withdrawal',
                description: reason || 'Withdrawal to bank account'
            });
            // Initiate Paystack transfer
            const transferResponse = await this.paystackService.initiateTransfer({
                amount: amount,
                recipient: landlord.paystackRecipientCode,
                reason: reason || 'Wallet withdrawal',
                metadata: {
                    landlordId: landlord.id,
                    transactionId: transaction.id,
                    type: 'wallet_withdrawal'
                }
            });
            if (!transferResponse.status) {
                // Transfer failed - reverse the debit
                this.logger.error(`❌ Transfer failed, reversing debit: ${transferResponse.message}`);
                await this.walletService.credit(landlordId, amount, {
                    type: 'refund',
                    description: `Refund for failed withdrawal: ${transferResponse.message}`
                });
                throw new _common.BadRequestException(`Withdrawal failed: ${transferResponse.message}`);
            }
            this.logger.log(`✅ Withdrawal processed: ${transaction.id}`);
            this.logger.log(`   Transfer code: ${transferResponse.data?.transfer_code}`);
            return {
                success: true,
                message: 'Withdrawal processed successfully. Funds will be transferred to your bank account.',
                transactionId: transaction.id,
                transferCode: transferResponse.data?.transfer_code
            };
        } catch (error) {
            this.logger.error(`❌ Withdrawal error: ${error.message}`);
            throw error;
        }
    }
    /**
   * CHECK FOR PENDING PAYMENT
   * 
   * Check if tenant has any pending payments to prevent duplicates
   * Auto-cancel payments older than 1 hour
   */ async checkPendingPayment(tenantId) {
        try {
            const [pendingPayment] = await this.db.select().from(_payments.payments).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_payments.payments.tenantId, tenantId), (0, _drizzleorm.eq)(_payments.payments.status, 'pending'), (0, _drizzleorm.eq)(_payments.payments.paymentGateway, 'paystack'))).limit(1);
            if (!pendingPayment) {
                return false;
            }
            // Auto-cancel if older than 5 minutes (300 seconds)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            if (pendingPayment.createdAt && new Date(pendingPayment.createdAt) < fiveMinutesAgo) {
                this.logger.log(`🗑️ Auto-canceling expired pending payment: ${pendingPayment.id}`);
                await this.db.update(_payments.payments).set({
                    status: 'overdue',
                    updatedAt: new Date()
                }).where((0, _drizzleorm.eq)(_payments.payments.id, pendingPayment.id));
                return false; // Allow new payment
            }
            return true; // Has recent pending payment
        } catch (error) {
            this.logger.error(`Error checking pending payment: ${error.message}`);
            return false;
        }
    }
    /**
   * CREATE PENDING PAYMENT RECORD
   * 
   * Create a payment record when payment is initialized
   */ async createPendingPaymentRecord(data) {
        try {
            // Get tenant's property and unit info from invitation
            const [invitation] = await this.db.select().from(_schema.tenantInvitations).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.tenantInvitations.tenantId, data.tenantId), (0, _drizzleorm.eq)(_schema.tenantInvitations.status, 'accepted'))).limit(1);
            if (!invitation) {
                throw new _common.NotFoundException('Tenant invitation not found');
            }
            // Create payment record
            const [payment] = await this.db.insert(_payments.payments).values({
                tenantId: data.tenantId,
                landlordId: invitation.landlordId,
                propertyId: invitation.propertyId,
                unitId: invitation.unitId,
                tenantInvitationId: invitation.id,
                amount: data.amount.toString(),
                amountPaid: '0',
                dueDate: new Date(),
                paymentType: 'rent',
                paymentMethod: 'online',
                status: 'pending',
                description: data.description || 'Rent payment',
                paystackReference: data.paystackReference,
                paystackStatus: 'pending',
                paymentGateway: 'paystack'
            }).returning();
            this.logger.log(`💾 Payment record created: ${payment.id} (${data.paystackReference})`);
            return payment;
        } catch (error) {
            this.logger.error(`Error creating payment record: ${error.message}`);
            throw error;
        }
    }
    /**
   * UPDATE PAYMENT STATUS
   * 
   * Update payment record based on Paystack verification
   */ async updatePaymentStatus(paystackReference, paystackStatus, paystackData) {
        try {
            // Find payment by Paystack reference
            const [payment] = await this.db.select().from(_payments.payments).where((0, _drizzleorm.eq)(_payments.payments.paystackReference, paystackReference)).limit(1);
            if (!payment) {
                this.logger.warn(`⚠️ Payment not found for reference: ${paystackReference}`);
                return null;
            }
            // IDEMPOTENCY CHECK: Don't process if already paid
            if (payment.status === 'paid') {
                this.logger.warn(`⚠️ Payment already processed: ${paystackReference}`);
                return payment;
            }
            // Map Paystack status to our payment status
            let newStatus = 'pending';
            let paidDate = null;
            let amountPaid = '0';
            if (paystackStatus === 'success') {
                // AMOUNT VALIDATION: Verify Paystack charged the correct amount
                const expectedAmountInNaira = parseFloat(payment.amount);
                // IMPORTANT: Paystack's verification API returns amount in Naira (already divided by 100)
                // NOT in kobo like the initialization API expects
                const paystackAmountInNaira = parseFloat(paystackData.amount);
                // Allow 1% tolerance for rounding errors
                const tolerance = expectedAmountInNaira * 0.01;
                const difference = Math.abs(expectedAmountInNaira - paystackAmountInNaira);
                this.logger.log(`💰 Amount validation:`);
                this.logger.log(`   Expected: ₦${expectedAmountInNaira}`);
                this.logger.log(`   Paystack: ₦${paystackAmountInNaira}`);
                this.logger.log(`   Difference: ₦${difference} (tolerance: ₦${tolerance})`);
                if (difference > tolerance) {
                    this.logger.error(`❌ AMOUNT MISMATCH! Expected: ₦${expectedAmountInNaira}, ` + `Got: ₦${paystackAmountInNaira}`);
                    throw new Error(`Payment amount mismatch. Expected ₦${expectedAmountInNaira}, but Paystack processed ₦${paystackAmountInNaira}`);
                }
                newStatus = 'paid';
                paidDate = new Date(paystackData.paid_at || new Date());
                // Use the original payment amount from our DB (source of truth)
                amountPaid = payment.amount;
                this.logger.log(`✅ Payment validated and marked as paid: ₦${amountPaid}`);
            } else if (paystackStatus === 'failed') {
                newStatus = 'pending'; // Keep as pending so they can retry
            }
            // Update payment record
            const [updatedPayment] = await this.db.update(_payments.payments).set({
                status: newStatus,
                paystackStatus: paystackStatus,
                paidDate: paidDate,
                amountPaid: amountPaid,
                receiptNumber: paystackData.reference,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_payments.payments.id, payment.id)).returning();
            this.logger.log(`✅ Payment updated: ${payment.id} -> ${newStatus}`);
            // If payment is successful, credit landlord wallet
            if (newStatus === 'paid') {
                await this.walletService.credit(payment.landlordId, parseFloat(amountPaid), {
                    type: 'rent_payment',
                    paymentId: payment.id,
                    reference: paystackReference,
                    description: `Rent payment from tenant - ${paystackReference}`
                });
                this.logger.log(`💰 Landlord wallet credited: ${payment.landlordId}`);
            }
            return updatedPayment;
        } catch (error) {
            this.logger.error(`Error updating payment status: ${error.message}`);
            throw error;
        }
    }
    constructor(db, paystackService, walletService){
        this.db = db;
        this.paystackService = paystackService;
        this.walletService = walletService;
        this.logger = new _common.Logger(PaymentProcessorService.name);
    }
};
PaymentProcessorService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _postgresjs.PostgresJsDatabase === "undefined" ? Object : _postgresjs.PostgresJsDatabase,
        typeof _paystackservice.PaystackService === "undefined" ? Object : _paystackservice.PaystackService,
        typeof _walletservice.WalletService === "undefined" ? Object : _walletservice.WalletService
    ])
], PaymentProcessorService);

//# sourceMappingURL=payment-processor.service.js.map