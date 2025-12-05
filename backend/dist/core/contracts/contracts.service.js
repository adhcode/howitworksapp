"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ContractsService", {
    enumerable: true,
    get: function() {
        return ContractsService;
    }
});
const _common = require("@nestjs/common");
const _postgresjs = require("drizzle-orm/postgres-js");
const _drizzleorm = require("drizzle-orm");
const _databasemodule = require("../../database/database.module");
const _tenantrentcontracts = require("../../database/schema/tenant-rent-contracts");
const _schema = require("../../database/schema");
const _createcontractdto = require("./dto/create-contract.dto");
const _businessrulesconstant = require("../../shared/constants/business-rules.constant");
const _dateutils = require("../../shared/utils/date.utils");
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
let ContractsService = class ContractsService {
    /**
   * CREATE CONTRACT FOR NEW TENANT
   * 
   * New tenant = starting fresh lease, no existing lease elsewhere
   * 
   * Flow:
   * 1. Validate tenant, landlord, property, unit exist
   * 2. Check for duplicate active contracts
   * 3. Calculate first payment due date (1st of move-in month or next month)
   * 4. Create contract with status 'active'
   * 
   * @param dto - New tenant contract data
   * @returns Created contract
   */ async createNewTenantContract(dto) {
        this.logger.log(`Creating new tenant contract for tenant ${dto.tenantId}`);
        // Validate entities exist
        await this.validateEntities(dto.tenantId, dto.landlordId, dto.propertyId, dto.unitId);
        // Check for duplicate contracts
        await this.checkDuplicateContract(dto.tenantId, dto.propertyId, dto.unitId);
        // Parse dates
        const leaseStart = (0, _dateutils.startOfDay)(new Date(dto.leaseStartDate));
        const leaseEnd = (0, _dateutils.startOfDay)(new Date(dto.leaseEndDate));
        const today = (0, _dateutils.startOfDay)(new Date());
        // Validate lease dates
        if ((0, _dateutils.isBefore)(leaseEnd, leaseStart)) {
            throw new _common.BadRequestException('Lease end date must be after start date');
        }
        // Calculate first payment due date
        // Payment is due on the 1st of the month
        // If lease starts on the 1st, payment due that day
        // If lease starts mid-month, payment due on 1st of next month
        const firstPaymentDue = this.calculateFirstPaymentDue(leaseStart);
        // Create contract
        const contractData = {
            tenantId: dto.tenantId,
            landlordId: dto.landlordId,
            propertyId: dto.propertyId,
            unitId: dto.unitId,
            monthlyAmount: dto.monthlyAmount.toFixed(2),
            expiryDate: leaseEnd,
            landlordPayoutType: dto.landlordPayoutType,
            nextPaymentDue: firstPaymentDue,
            transitionStartDate: leaseStart,
            status: 'active',
            isExistingTenant: false,
            originalExpiryDate: null
        };
        const [contract] = await this.db.insert(_tenantrentcontracts.tenantRentContracts).values(contractData).returning();
        this.logger.log(`✅ Contract created: ${contract.id} | First payment due: ${firstPaymentDue.toDateString()}`);
        return contract;
    }
    /**
   * CREATE CONTRACT FOR EXISTING TENANT
   * 
   * Existing tenant = already has active lease elsewhere, transitioning to Homezy
   * 
   * Key business logic:
   * - If landlord wants MONTHLY payout: tenant starts paying 3 months before current lease expires
   * - If landlord wants YEARLY payout: tenant starts paying 6 months before current lease expires
   * - If transition date has passed, start immediately
   * 
   * Flow:
   * 1. Validate entities
   * 2. Calculate transition start date based on payout type
   * 3. If transition date passed, start immediately
   * 4. Calculate first payment due (1st of month)
   * 5. Set new lease end date (default: 1 year after current lease expiry)
   * 
   * @param dto - Existing tenant contract data
   * @returns Created contract
   */ async createExistingTenantContract(dto) {
        this.logger.log(`Creating existing tenant contract for tenant ${dto.tenantId}`);
        // Validate entities exist
        await this.validateEntities(dto.tenantId, dto.landlordId, dto.propertyId, dto.unitId);
        // Check for duplicate contracts
        await this.checkDuplicateContract(dto.tenantId, dto.propertyId, dto.unitId);
        // Parse dates
        const currentLeaseExpiry = (0, _dateutils.startOfDay)(new Date(dto.currentLeaseExpiryDate));
        const today = (0, _dateutils.startOfDay)(new Date());
        // Validate current lease expiry is in the future
        if ((0, _dateutils.isBefore)(currentLeaseExpiry, today)) {
            throw new _common.BadRequestException('Current lease expiry must be in the future');
        }
        // Calculate transition start date based on payout type
        const transitionStart = this.calculateTransitionStartDate(currentLeaseExpiry, dto.landlordPayoutType);
        this.logger.log(`Transition calculation:`);
        this.logger.log(`  Current lease expires: ${currentLeaseExpiry.toDateString()}`);
        this.logger.log(`  Payout type: ${dto.landlordPayoutType}`);
        this.logger.log(`  Transition starts: ${transitionStart.toDateString()}`);
        this.logger.log(`  Started ${(0, _dateutils.isBefore)(transitionStart, today) ? 'IMMEDIATELY' : 'in the FUTURE'}`);
        // Calculate first payment due date (1st of month)
        const firstPaymentDue = this.calculateFirstPaymentDue(transitionStart);
        // Determine new lease end date
        // Default: 1 year after current lease expiry
        const newLeaseEnd = dto.newLeaseEndDate ? (0, _dateutils.startOfDay)(new Date(dto.newLeaseEndDate)) : (0, _dateutils.addMonths)(currentLeaseExpiry, 12);
        // Create contract
        const contractData = {
            tenantId: dto.tenantId,
            landlordId: dto.landlordId,
            propertyId: dto.propertyId,
            unitId: dto.unitId,
            monthlyAmount: dto.monthlyAmount.toFixed(2),
            expiryDate: newLeaseEnd,
            landlordPayoutType: dto.landlordPayoutType,
            nextPaymentDue: firstPaymentDue,
            transitionStartDate: transitionStart,
            status: 'active',
            isExistingTenant: true,
            originalExpiryDate: currentLeaseExpiry
        };
        const [contract] = await this.db.insert(_tenantrentcontracts.tenantRentContracts).values(contractData).returning();
        this.logger.log(`✅ Existing tenant contract created: ${contract.id}`);
        this.logger.log(`   First payment due: ${firstPaymentDue.toDateString()}`);
        this.logger.log(`   New lease ends: ${newLeaseEnd.toDateString()}`);
        return contract;
    }
    /**
   * CALCULATE TRANSITION START DATE FOR EXISTING TENANTS
   * 
   * Business rule:
   * - Monthly payout → Start 3 months before lease expiry
   * - Yearly payout → Start 6 months before lease expiry
   * - If calculated date is in the past → Start immediately (today)
   * 
   * @param leaseExpiryDate - When current lease expires
   * @param payoutType - Monthly or yearly
   * @returns Date when tenant should start paying
   */ calculateTransitionStartDate(leaseExpiryDate, payoutType) {
        const monthsBeforeExpiry = payoutType === _createcontractdto.LandlordPayoutType.MONTHLY ? _businessrulesconstant.BUSINESS_RULES.TRANSITION_PERIODS.MONTHLY_PAYOUT : _businessrulesconstant.BUSINESS_RULES.TRANSITION_PERIODS.YEARLY_PAYOUT;
        // Calculate X months before expiry
        const transitionDate = (0, _dateutils.subMonths)(leaseExpiryDate, monthsBeforeExpiry);
        // If that date has passed, start immediately
        const today = (0, _dateutils.startOfDay)(new Date());
        return (0, _dateutils.isBefore)(transitionDate, today) ? today : transitionDate;
    }
    /**
   * CALCULATE FIRST PAYMENT DUE DATE
   * 
   * Business rule: Payments are due on the 1st of each month
   * 
   * Logic:
   * - If transition/lease starts on the 1st → Payment due that day
   * - If transition/lease starts mid-month → Payment due on 1st of NEXT month
   * - If transition/lease starts after today → Payment due on 1st of that month or next
   * 
   * @param startDate - Lease start or transition start date
   * @returns First payment due date (always 1st of month)
   */ calculateFirstPaymentDue(startDate) {
        const today = (0, _dateutils.startOfDay)(new Date());
        const effectiveStart = (0, _dateutils.isBefore)(startDate, today) ? today : startDate;
        // If starting on the 1st, payment due that day
        if (effectiveStart.getDate() === _businessrulesconstant.BUSINESS_RULES.PAYMENT_DUE_DAY) {
            return effectiveStart;
        }
        // Otherwise, payment due on 1st of next month
        return (0, _dateutils.startOfNextMonth)(effectiveStart);
    }
    /**
   * GET CONTRACT BY ID
   */ async getContractById(contractId) {
        const [contract] = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, contractId)).limit(1);
        if (!contract) {
            throw new _common.NotFoundException(`Contract ${contractId} not found`);
        }
        return contract;
    }
    /**
   * GET CONTRACTS BY QUERY
   */ async getContracts(query) {
        const conditions = [];
        if (query.tenantId) {
            conditions.push((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.tenantId, query.tenantId));
        }
        if (query.landlordId) {
            conditions.push((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.landlordId, query.landlordId));
        }
        if (query.propertyId) {
            conditions.push((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.propertyId, query.propertyId));
        }
        if (query.status) {
            conditions.push((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, query.status));
        }
        const whereClause = conditions.length > 0 ? (0, _drizzleorm.and)(...conditions) : undefined;
        return this.db.select().from(_tenantrentcontracts.tenantRentContracts).where(whereClause).orderBy((0, _drizzleorm.sql)`${_tenantrentcontracts.tenantRentContracts.createdAt} DESC`);
    }
    /**
   * UPDATE CONTRACT
   */ async updateContract(contractId, dto) {
        const contract = await this.getContractById(contractId);
        const updateData = {
            updatedAt: new Date()
        };
        if (dto.monthlyAmount !== undefined) {
            updateData.monthlyAmount = dto.monthlyAmount.toFixed(2);
        }
        if (dto.leaseEndDate !== undefined) {
            updateData.expiryDate = (0, _dateutils.startOfDay)(new Date(dto.leaseEndDate));
        }
        if (dto.landlordPayoutType !== undefined) {
            updateData.landlordPayoutType = dto.landlordPayoutType;
        }
        const [updated] = await this.db.update(_tenantrentcontracts.tenantRentContracts).set(updateData).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, contractId)).returning();
        this.logger.log(`✅ Contract updated: ${contractId}`);
        return updated;
    }
    /**
   * TERMINATE CONTRACT
   */ async terminateContract(contractId) {
        const contract = await this.getContractById(contractId);
        const [terminated] = await this.db.update(_tenantrentcontracts.tenantRentContracts).set({
            status: 'terminated',
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, contractId)).returning();
        this.logger.log(`✅ Contract terminated: ${contractId}`);
        return terminated;
    }
    /**
   * VALIDATE ENTITIES EXIST
   * Private helper to validate tenant, landlord, property, unit exist
   */ async validateEntities(tenantId, landlordId, propertyId, unitId) {
        // Validate tenant exists
        const [tenant] = await this.db.select().from(_schema.users).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.users.id, tenantId), (0, _drizzleorm.eq)(_schema.users.role, 'tenant'))).limit(1);
        if (!tenant) {
            throw new _common.NotFoundException(`Tenant ${tenantId} not found`);
        }
        // Validate landlord exists
        const [landlord] = await this.db.select().from(_schema.users).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.users.id, landlordId), (0, _drizzleorm.eq)(_schema.users.role, 'landlord'))).limit(1);
        if (!landlord) {
            throw new _common.NotFoundException(`Landlord ${landlordId} not found`);
        }
        // Validate property exists and belongs to landlord
        const [property] = await this.db.select().from(_schema.properties).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.id, propertyId), (0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId))).limit(1);
        if (!property) {
            throw new _common.NotFoundException(`Property ${propertyId} not found or doesn't belong to landlord ${landlordId}`);
        }
        // Validate unit exists and belongs to property
        const [unit] = await this.db.select().from(_schema.units).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.units.id, unitId), (0, _drizzleorm.eq)(_schema.units.propertyId, propertyId))).limit(1);
        if (!unit) {
            throw new _common.NotFoundException(`Unit ${unitId} not found or doesn't belong to property ${propertyId}`);
        }
    }
    /**
   * CHECK FOR DUPLICATE CONTRACT
   * Private helper to ensure tenant doesn't have multiple active contracts for same unit
   */ async checkDuplicateContract(tenantId, propertyId, unitId) {
        const [existing] = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.tenantId, tenantId), (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.propertyId, propertyId), (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.unitId, unitId), (0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.status, 'active'))).limit(1);
        if (existing) {
            throw new _common.BadRequestException(`Tenant already has an active contract for this unit. Contract ID: ${existing.id}`);
        }
    }
    constructor(db){
        this.db = db;
        this.logger = new _common.Logger(ContractsService.name);
    }
};
ContractsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _postgresjs.PostgresJsDatabase === "undefined" ? Object : _postgresjs.PostgresJsDatabase
    ])
], ContractsService);

//# sourceMappingURL=contracts.service.js.map