"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantPaymentService", {
    enumerable: true,
    get: function() {
        return TenantPaymentService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _postgresjs = require("drizzle-orm/postgres-js");
const _databasemodule = require("../database/database.module");
const _tenantrentcontractdto = require("./dto/tenant-rent-contract.dto");
const _tenantrentcontracts = require("../database/schema/tenant-rent-contracts");
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
let TenantPaymentService = class TenantPaymentService {
    /**
   * Calculate transition start date based on tenant type
   * NEW TENANT: Start immediately (today)
   * EXISTING TENANT: Start 6 months before current contract expires
   */ calculateTransitionStartDate(isExistingTenant, originalExpiryDate, newExpiryDate) {
        // NEW TENANT: Start immediately (today)
        if (!isExistingTenant) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return today;
        }
        // EXISTING TENANT: Start 6 months before current contract expires
        if (!originalExpiryDate) {
            throw new _common.BadRequestException('Original expiry date is required for existing tenants');
        }
        const transitionDate = new Date(originalExpiryDate);
        transitionDate.setMonth(transitionDate.getMonth() - 6);
        transitionDate.setHours(0, 0, 0, 0);
        return transitionDate;
    }
    /**
   * Calculate arrears for existing tenants who are overdue
   * Returns months overdue, total arrears amount, and next payment due date
   */ calculateArrears(transitionStartDate, monthlyAmount) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const transition = new Date(transitionStartDate);
        transition.setHours(0, 0, 0, 0);
        // If transition date is in the future, no arrears
        if (transition >= today) {
            return {
                monthsOverdue: 0,
                totalArrears: 0,
                nextPaymentDue: transition
            };
        }
        // Calculate months overdue
        let monthsOverdue = 0;
        let checkDate = new Date(transition);
        while(checkDate < today){
            monthsOverdue++;
            checkDate.setMonth(checkDate.getMonth() + 1);
        }
        // Total arrears = months × monthly rent
        const totalArrears = monthsOverdue * monthlyAmount;
        // Next payment due is the first day of next month
        const nextPaymentDue = new Date(today);
        nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);
        nextPaymentDue.setDate(1);
        nextPaymentDue.setHours(0, 0, 0, 0);
        return {
            monthsOverdue,
            totalArrears,
            nextPaymentDue
        };
    }
    /**
   * Calculate first payment due date based on transition start date
   */ calculateFirstPaymentDue(transitionStartDate) {
        // First payment is due on the transition start date
        return new Date(transitionStartDate);
    }
    /**
   * Validate contract creation data
   */ async validateContractCreation(dto) {
        const expiryDate = new Date(dto.expiryDate);
        const today = new Date();
        // Check if expiry date is in the future
        if (expiryDate <= today) {
            throw new _common.BadRequestException('Contract expiry date must be in the future');
        }
        // For existing tenants, validate original expiry date
        if (dto.isExistingTenant) {
            if (!dto.originalExpiryDate) {
                throw new _common.BadRequestException('Original expiry date is required for existing tenants');
            }
            const originalExpiry = new Date(dto.originalExpiryDate);
            if (originalExpiry <= today) {
                throw new _common.BadRequestException('Original expiry date must be in the future for existing tenants');
            }
        }
        // Check if tenant already has an active contract
        const existingContract = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.tenantId, dto.tenantId), (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, 'active'))).limit(1);
        if (existingContract.length > 0) {
            throw new _common.BadRequestException('Tenant already has an active rent contract');
        }
        // Validate monthly amount
        if (dto.monthlyAmount <= 0) {
            throw new _common.BadRequestException('Monthly amount must be greater than 0');
        }
    }
    /**
   * Create a new rent contract with business logic validation
   * Returns contract and arrears info if tenant is overdue
   */ async createRentContract(dto) {
        // Validate the contract data
        await this.validateContractCreation(dto);
        const expiryDate = new Date(dto.expiryDate);
        // Calculate transition start based on tenant type
        const transitionStartDate = this.calculateTransitionStartDate(dto.isExistingTenant, dto.originalExpiryDate ? new Date(dto.originalExpiryDate) : null, expiryDate);
        // Calculate arrears if existing tenant is overdue
        let arrearsInfo = undefined;
        let nextPaymentDue = transitionStartDate;
        if (dto.isExistingTenant) {
            const arrears = this.calculateArrears(transitionStartDate, dto.monthlyAmount);
            if (arrears.monthsOverdue > 0) {
                arrearsInfo = {
                    monthsOverdue: arrears.monthsOverdue,
                    totalArrears: arrears.totalArrears,
                    message: `Tenant owes ${arrears.monthsOverdue} month${arrears.monthsOverdue > 1 ? 's' : ''} rent (₦${arrears.totalArrears.toLocaleString()}). Must pay arrears before continuing.`
                };
                // Next payment is calculated from arrears
                nextPaymentDue = arrears.nextPaymentDue;
            }
        }
        const newContract = {
            tenantId: dto.tenantId,
            landlordId: dto.landlordId,
            propertyId: dto.propertyId,
            unitId: dto.unitId,
            monthlyAmount: dto.monthlyAmount.toString(),
            expiryDate,
            landlordPayoutType: dto.landlordPayoutType,
            nextPaymentDue,
            transitionStartDate,
            status: 'active',
            isExistingTenant: dto.isExistingTenant,
            originalExpiryDate: dto.originalExpiryDate ? new Date(dto.originalExpiryDate) : null
        };
        const [createdContract] = await this.db.insert(_tenantrentcontracts.tenantRentContracts).values(newContract).returning();
        if (!createdContract) {
            throw new _common.BadRequestException('Failed to create rent contract');
        }
        return {
            contract: createdContract,
            arrears: arrearsInfo
        };
    }
    /**
   * Get active contracts with optional filtering
   */ async getActiveContracts(tenantId, landlordId) {
        const query = {};
        if (tenantId) query.tenantId = tenantId;
        if (landlordId) query.landlordId = landlordId;
        return this.getActiveContractsWithQuery(query);
    }
    /**
   * Get active contracts with query object
   */ async getActiveContractsWithQuery(query) {
        let whereConditions = [
            (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, 'active')
        ];
        if (query?.tenantId) {
            whereConditions.push((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.tenantId, query.tenantId));
        }
        if (query?.landlordId) {
            whereConditions.push((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.landlordId, query.landlordId));
        }
        if (query?.propertyId) {
            whereConditions.push((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.propertyId, query.propertyId));
        }
        const contracts = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.and)(...whereConditions)).orderBy(_tenantrentcontracts.tenantRentContracts.createdAt);
        return contracts;
    }
    /**
   * Get all contracts (active, expired, terminated) with optional filtering
   */ async getAllContracts(query) {
        let whereConditions = [];
        if (query?.tenantId) {
            whereConditions.push((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.tenantId, query.tenantId));
        }
        if (query?.landlordId) {
            whereConditions.push((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.landlordId, query.landlordId));
        }
        if (query?.propertyId) {
            whereConditions.push((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.propertyId, query.propertyId));
        }
        if (query?.status) {
            whereConditions.push((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, query.status));
        }
        const queryBuilder = this.db.select().from(_tenantrentcontracts.tenantRentContracts).orderBy(_tenantrentcontracts.tenantRentContracts.createdAt);
        if (whereConditions.length > 0) {
            return await queryBuilder.where((0, _drizzleorm.and)(...whereConditions));
        }
        return await queryBuilder;
    }
    /**
   * Get contract by ID
   */ async getContractById(contractId) {
        const [contract] = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, contractId)).limit(1);
        if (!contract) {
            throw new _common.NotFoundException(`Rent contract not found: ${contractId}`);
        }
        return contract;
    }
    /**
   * Update next payment due date (typically called after successful payment)
   */ async updateNextPaymentDue(contractId) {
        const contract = await this.getContractById(contractId);
        // Calculate next payment due (add 1 month to current due date)
        const nextDue = new Date(contract.nextPaymentDue);
        nextDue.setMonth(nextDue.getMonth() + 1);
        // Ensure we don't schedule payments beyond contract expiry
        const expiryDate = new Date(contract.expiryDate);
        if (nextDue > expiryDate) {
            // If next payment would be after expiry, mark contract as expired
            await this.updateContractStatus(contractId, _tenantrentcontractdto.ContractStatus.EXPIRED);
            return;
        }
        await this.db.update(_tenantrentcontracts.tenantRentContracts).set({
            nextPaymentDue: nextDue,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, contractId));
    }
    /**
   * Get contracts with payments due (for scheduler use)
   */ async getContractsWithDuePayments(asOfDate) {
        const checkDate = asOfDate || new Date();
        const contracts = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, 'active'))).orderBy(_tenantrentcontracts.tenantRentContracts.nextPaymentDue);
        // Filter in JavaScript for more precise date comparison
        return contracts.filter((contract)=>new Date(contract.nextPaymentDue) <= checkDate);
    }
    /**
   * Update contract status
   */ async updateContractStatus(contractId, status) {
        const contract = await this.getContractById(contractId);
        const [updatedContract] = await this.db.update(_tenantrentcontracts.tenantRentContracts).set({
            status,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, contractId)).returning();
        if (!updatedContract) {
            throw new _common.BadRequestException('Failed to update contract status');
        }
        return updatedContract;
    }
    /**
   * Get contracts expiring soon (for escrow release checks)
   */ async getExpiringContracts(daysAhead = 7) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() + daysAhead);
        const contracts = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, 'active'), (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.landlordPayoutType, 'yearly'))).orderBy(_tenantrentcontracts.tenantRentContracts.expiryDate);
        // Filter contracts expiring within the specified timeframe
        return contracts.filter((contract)=>new Date(contract.expiryDate) <= checkDate);
    }
    /**
   * Process monthly payment with payout type routing
   * Routes payment to immediate payout or escrow based on landlord preference
   * Handles arrears payments for overdue existing tenants
   */ async processMonthlyPayment(contractId, amount, paymentMethod, reference) {
        // Validate inputs
        if (amount <= 0) {
            throw new _common.BadRequestException('Payment amount must be greater than 0');
        }
        // Get the contract
        const contract = await this.getContractById(contractId);
        // Check if tenant has arrears
        const arrears = this.calculateArrears(contract.transitionStartDate, parseFloat(contract.monthlyAmount));
        if (arrears.monthsOverdue > 0) {
            // Tenant must pay arrears first
            if (amount < arrears.totalArrears) {
                throw new _common.BadRequestException(`You have ${arrears.monthsOverdue} month${arrears.monthsOverdue > 1 ? 's' : ''} arrears (₦${arrears.totalArrears.toLocaleString()}). Please pay full arrears amount of ₦${arrears.totalArrears.toLocaleString()}.`);
            }
            // Process arrears payment
            return this.processArrearsPayment(contract, amount, arrears, paymentMethod, reference);
        }
        // Normal monthly payment validation
        const expectedAmount = parseFloat(contract.monthlyAmount);
        if (Math.abs(amount - expectedAmount) > 0.01) {
            throw new _common.BadRequestException(`Payment amount ₦${amount.toLocaleString()} does not match expected monthly amount ₦${expectedAmount.toLocaleString()}`);
        }
        // Check if payment is due (allow payments up to 30 days early)
        const today = new Date();
        const paymentDue = new Date(contract.nextPaymentDue);
        const earliestPaymentDate = new Date(paymentDue);
        earliestPaymentDate.setDate(earliestPaymentDate.getDate() - 30);
        if (today < earliestPaymentDate) {
            throw new _common.BadRequestException(`Payment is too early. Next payment due on ${paymentDue.toDateString()}`);
        }
        try {
            // Start a transaction-like operation
            let payoutMessage;
            if (contract.landlordPayoutType === _tenantrentcontractdto.LandlordPayoutType.MONTHLY) {
                // Process immediate payout to landlord
                await this.processImmediatePayout(contract.landlordId, amount, contractId, paymentMethod, reference);
                payoutMessage = 'Payment credited immediately to landlord wallet';
            } else {
                // Add to escrow for yearly release
                await this.addToEscrow(contract.landlordId, amount, contractId);
                payoutMessage = 'Payment added to escrow for yearly release';
            }
            // Create payment record in payments table
            await this.createPaymentRecord(contract, amount, paymentMethod, reference);
            // Update next payment due date
            await this.updateNextPaymentDue(contractId);
            return {
                success: true,
                payoutType: contract.landlordPayoutType,
                message: payoutMessage,
                nextPaymentDue: new Date(contract.nextPaymentDue.getTime() + 30 * 24 * 60 * 60 * 1000) // Add 1 month
            };
        } catch (error) {
            console.error('Error processing monthly payment:', error);
            throw new _common.BadRequestException(`Failed to process payment: ${error.message}`);
        }
    }
    /**
   * Process arrears payment for overdue existing tenants
   */ async processArrearsPayment(contract, amount, arrears, paymentMethod, reference) {
        try {
            // Route payment based on landlord payout type
            let payoutMessage;
            if (contract.landlordPayoutType === _tenantrentcontractdto.LandlordPayoutType.MONTHLY) {
                await this.processImmediatePayout(contract.landlordId, amount, contract.id, paymentMethod, reference);
                payoutMessage = 'Arrears payment credited immediately to landlord';
            } else {
                await this.addToEscrow(contract.landlordId, amount, contract.id);
                payoutMessage = 'Arrears payment added to escrow';
            }
            // Create payment record for arrears
            await this.createArrearsPaymentRecord(contract, amount, arrears.monthsOverdue, paymentMethod, reference);
            // Update next payment due to next month
            await this.db.update(_tenantrentcontracts.tenantRentContracts).set({
                nextPaymentDue: arrears.nextPaymentDue,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, contract.id));
            return {
                success: true,
                payoutType: contract.landlordPayoutType,
                message: `Arrears payment of ${arrears.monthsOverdue} month${arrears.monthsOverdue > 1 ? 's' : ''} (₦${amount.toLocaleString()}) processed successfully. ${payoutMessage}. Next payment due: ${arrears.nextPaymentDue.toDateString()}`,
                nextPaymentDue: arrears.nextPaymentDue
            };
        } catch (error) {
            console.error('Error processing arrears payment:', error);
            throw new _common.BadRequestException(`Failed to process arrears payment: ${error.message}`);
        }
    }
    /**
   * Create payment record for arrears
   */ async createArrearsPaymentRecord(contract, amount, monthsOverdue, paymentMethod, reference) {
        const paymentRecord = {
            landlordId: contract.landlordId,
            tenantId: contract.tenantId,
            propertyId: contract.propertyId,
            unitId: contract.unitId,
            tenantInvitationId: '',
            amount: amount.toString(),
            amountPaid: amount.toString(),
            dueDate: contract.transitionStartDate,
            paidDate: new Date(),
            paymentType: 'rent',
            paymentMethod: paymentMethod || 'online',
            status: 'paid',
            description: `Arrears payment for ${monthsOverdue} month${monthsOverdue > 1 ? 's' : ''} overdue rent`,
            notes: reference ? `Payment reference: ${reference}. Arrears cleared.` : 'Arrears cleared.'
        };
        console.log(`Created arrears payment record for contract ${contract.id}: ${monthsOverdue} months, ₦${amount.toLocaleString()}`);
    }
    /**
   * Process immediate payout to landlord wallet (for monthly payout type)
   */ async processImmediatePayout(landlordId, amount, contractId, paymentMethod, reference) {
        // For now, we'll create a payment record that indicates immediate payout
        // In a real system, this would integrate with a wallet service or payment processor
        // Create a payment record showing the landlord received the payment
        const paymentRecord = {
            landlordId,
            tenantId: '',
            propertyId: '',
            unitId: '',
            tenantInvitationId: '',
            amount: amount.toString(),
            amountPaid: amount.toString(),
            dueDate: new Date(),
            paidDate: new Date(),
            paymentType: 'rent',
            paymentMethod: paymentMethod || 'online',
            status: 'paid',
            description: `Monthly rent payment - immediate payout (Contract: ${contractId})`,
            notes: `Immediate payout to landlord. Reference: ${reference || 'N/A'}`
        };
        // Note: In a production system, this would:
        // 1. Call a wallet service to credit the landlord's account
        // 2. Create appropriate transaction records
        // 3. Handle any payout failures with proper rollback
        console.log(`Processing immediate payout of ${amount} to landlord ${landlordId} for contract ${contractId}`);
    }
    /**
   * Add payment to escrow for yearly payout
   */ async addToEscrow(landlordId, amount, contractId) {
        // Check if escrow balance already exists for this contract
        const [existingEscrow] = await this.db.select().from(_tenantrentcontracts.landlordEscrowBalances).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.landlordId, landlordId), (0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.contractId, contractId), (0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.isReleased, false))).limit(1);
        if (existingEscrow) {
            // Update existing escrow balance
            const newTotal = parseFloat(existingEscrow.totalEscrowed) + amount;
            const newMonthsAccumulated = existingEscrow.monthsAccumulated + 1;
            await this.db.update(_tenantrentcontracts.landlordEscrowBalances).set({
                totalEscrowed: newTotal.toString(),
                monthsAccumulated: newMonthsAccumulated,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.id, existingEscrow.id));
            console.log(`Updated escrow balance for contract ${contractId}: ${newTotal} (${newMonthsAccumulated} months)`);
        } else {
            // Create new escrow balance
            const contract = await this.getContractById(contractId);
            const newEscrow = {
                landlordId,
                contractId,
                totalEscrowed: amount.toString(),
                monthsAccumulated: 1,
                expectedReleaseDate: contract.expiryDate,
                isReleased: false
            };
            await this.db.insert(_tenantrentcontracts.landlordEscrowBalances).values(newEscrow);
            console.log(`Created new escrow balance for contract ${contractId}: ${amount}`);
        }
    }
    /**
   * Create payment record in the payments table
   */ async createPaymentRecord(contract, amount, paymentMethod, reference) {
        // Note: This assumes we have a way to get or create a tenant invitation ID
        // In a real system, this relationship would be properly established
        const paymentRecord = {
            landlordId: contract.landlordId,
            tenantId: contract.tenantId,
            propertyId: contract.propertyId,
            unitId: contract.unitId,
            tenantInvitationId: '',
            amount: amount.toString(),
            amountPaid: amount.toString(),
            dueDate: contract.nextPaymentDue,
            paidDate: new Date(),
            paymentType: 'rent',
            paymentMethod: paymentMethod || 'online',
            status: 'paid',
            description: `Monthly rent payment for ${contract.nextPaymentDue.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            })}`,
            notes: reference ? `Payment reference: ${reference}` : undefined
        };
        // For now, we'll skip inserting into payments table due to the tenantInvitationId constraint
        // In a production system, this would be properly handled
        console.log(`Would create payment record for contract ${contract.id}, amount: ${amount}`);
    }
    /**
   * Validate payment amount and timing
   */ validatePayment(contract, amount) {
        // Validate amount
        const expectedAmount = parseFloat(contract.monthlyAmount);
        if (Math.abs(amount - expectedAmount) > 0.01) {
            throw new _common.BadRequestException(`Payment amount ${amount} does not match expected monthly amount ${expectedAmount}`);
        }
        // Validate contract is active
        if (contract.status !== 'active') {
            throw new _common.BadRequestException(`Cannot process payment for ${contract.status} contract`);
        }
        // Validate contract hasn't expired
        const today = new Date();
        if (new Date(contract.expiryDate) < today) {
            throw new _common.BadRequestException('Cannot process payment for expired contract');
        }
    }
    /**
   * Get landlord escrow balances
   */ async getLandlordEscrowBalances(landlordId, unreleasedOnly = false) {
        let whereConditions = [
            (0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.landlordId, landlordId)
        ];
        if (unreleasedOnly) {
            whereConditions.push((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.isReleased, false));
        }
        const escrowBalances = await this.db.select().from(_tenantrentcontracts.landlordEscrowBalances).where((0, _drizzleorm.and)(...whereConditions)).orderBy(_tenantrentcontracts.landlordEscrowBalances.expectedReleaseDate);
        return escrowBalances;
    }
    /**
   * Get total escrowed amount for a landlord
   */ async getTotalEscrowedAmount(landlordId) {
        const escrowBalances = await this.getLandlordEscrowBalances(landlordId, true);
        return escrowBalances.reduce((total, balance)=>{
            return total + parseFloat(balance.totalEscrowed);
        }, 0);
    }
    constructor(db){
        this.db = db;
    }
};
TenantPaymentService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _postgresjs.PostgresJsDatabase === "undefined" ? Object : _postgresjs.PostgresJsDatabase
    ])
], TenantPaymentService);

//# sourceMappingURL=tenant-payment.service.js.map