"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EscrowService", {
    enumerable: true,
    get: function() {
        return EscrowService;
    }
});
const _common = require("@nestjs/common");
const _schedule = require("@nestjs/schedule");
const _postgresjs = require("drizzle-orm/postgres-js");
const _drizzleorm = require("drizzle-orm");
const _databasemodule = require("../../database/database.module");
const _tenantrentcontracts = require("../../database/schema/tenant-rent-contracts");
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
let EscrowService = class EscrowService {
    /**
   * DAILY CRON JOB: CHECK AND RELEASE ESCROW
   * 
   * Runs daily at 2:00 AM to check for escrow balances ready to release.
   * 
   * Release conditions:
   * 1. 12 months have accumulated, OR
   * 2. Contract has expired (+ grace period)
   * 
   * Steps:
   * 1. Find all unreleased escrow balances
   * 2. Check if ready for release
   * 3. Release to landlord wallet
   * 4. Mark as released
   * 5. Send notification to landlord
   */ async checkAndReleaseEscrow() {
        this.logger.log('🏦 Starting escrow release check...');
        try {
            const today = (0, _dateutils.startOfDay)(new Date());
            // Get all unreleased escrow balances
            const unreleasedEscrow = await this.db.select().from(_tenantrentcontracts.landlordEscrowBalances).where((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.isReleased, false));
            this.logger.log(`Found ${unreleasedEscrow.length} unreleased escrow accounts`);
            let releasedCount = 0;
            for (const escrow of unreleasedEscrow){
                // Check if ready for release
                const readyForRelease = await this.isReadyForRelease(escrow, today);
                if (readyForRelease) {
                    await this.releaseEscrow(escrow.id);
                    releasedCount++;
                }
            }
            this.logger.log(`✅ Escrow release check completed. Released: ${releasedCount}`);
        } catch (error) {
            this.logger.error(`❌ Error during escrow release check: ${error.message}`, error.stack);
        }
    }
    /**
   * CHECK IF ESCROW IS READY FOR RELEASE
   * 
   * Release conditions:
   * 1. Has accumulated for 12+ months, OR
   * 2. Related contract has expired (with grace period)
   * 
   * @param escrow - Escrow balance record
   * @param today - Current date
   * @returns True if ready to release
   */ async isReadyForRelease(escrow, today) {
        // Condition 1: 12 months accumulated
        if (escrow.monthsAccumulated >= _businessrulesconstant.BUSINESS_RULES.ESCROW.AUTO_RELEASE_MONTHS) {
            this.logger.log(`Escrow ${escrow.id}: Ready (12 months accumulated)`);
            return true;
        }
        // Condition 2: Contract expired
        if (_businessrulesconstant.BUSINESS_RULES.ESCROW.RELEASE_ON_CONTRACT_EXPIRY) {
            const [contract] = await this.db.select().from(_tenantrentcontracts.tenantRentContracts).where((0, _drizzleorm.eq)(_tenantrentcontracts.tenantRentContracts.id, escrow.contractId)).limit(1);
            if (contract) {
                const contractExpiry = new Date(contract.expiryDate);
                const releaseDate = (0, _dateutils.addDays)(contractExpiry, _businessrulesconstant.BUSINESS_RULES.ESCROW.GRACE_DAYS_AFTER_EXPIRY);
                if ((0, _dateutils.isBefore)(releaseDate, today) || releaseDate.getTime() === today.getTime()) {
                    this.logger.log(`Escrow ${escrow.id}: Ready (contract expired + grace period)`);
                    return true;
                }
            }
        }
        return false;
    }
    /**
   * RELEASE ESCROW TO LANDLORD
   * 
   * Transfers accumulated escrow balance to landlord's wallet.
   * 
   * TODO: Integrate with wallet system
   * For now, logs the transaction.
   * 
   * @param escrowId - Escrow balance ID
   */ async releaseEscrow(escrowId) {
        const [escrow] = await this.db.select().from(_tenantrentcontracts.landlordEscrowBalances).where((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.id, escrowId)).limit(1);
        if (!escrow || escrow.isReleased) {
            this.logger.warn(`Escrow ${escrowId} not found or already released`);
            return;
        }
        const amount = parseFloat(escrow.totalEscrowed);
        this.logger.log(`💰 Releasing escrow ${escrowId}: $${amount} to landlord ${escrow.landlordId}`);
        try {
            // TODO: Integrate with wallet system
            // await this.walletService.credit(escrow.landlordId, amount, {
            //   type: 'escrow_release',
            //   escrowId,
            //   contractId: escrow.contractId,
            //   monthsAccumulated: escrow.monthsAccumulated,
            // });
            // Mark as released
            await this.db.update(_tenantrentcontracts.landlordEscrowBalances).set({
                isReleased: true,
                releasedAt: new Date(),
                releasedAmount: amount.toFixed(2),
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.id, escrowId));
            this.logger.log(`✅ Escrow released successfully: ${escrowId}`);
        // TODO: Send notification to landlord
        // await this.notificationService.sendEscrowReleaseNotification(
        //   escrow.landlordId,
        //   amount,
        //   escrow.monthsAccumulated
        // );
        } catch (error) {
            this.logger.error(`❌ Failed to release escrow ${escrowId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * GET ESCROW BALANCE FOR LANDLORD
   * 
   * Returns all escrow balances (released and unreleased) for a landlord.
   * 
   * @param landlordId - Landlord ID
   * @returns Escrow balances
   */ async getEscrowBalances(landlordId) {
        return this.db.select().from(_tenantrentcontracts.landlordEscrowBalances).where((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.landlordId, landlordId)).orderBy((0, _drizzleorm.sql)`${_tenantrentcontracts.landlordEscrowBalances.createdAt} DESC`);
    }
    /**
   * GET UNRELEASED ESCROW TOTAL FOR LANDLORD
   * 
   * Calculates total amount in escrow (not yet released).
   * 
   * @param landlordId - Landlord ID
   * @returns Total unreleased amount
   */ async getUnreleasedTotal(landlordId) {
        const unreleased = await this.db.select().from(_tenantrentcontracts.landlordEscrowBalances).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.landlordId, landlordId), (0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.isReleased, false)));
        return unreleased.reduce((total, escrow)=>{
            return total + parseFloat(escrow.totalEscrowed);
        }, 0);
    }
    /**
   * GET ESCROW DETAILS BY CONTRACT
   * 
   * Returns escrow details for a specific contract.
   * 
   * @param contractId - Contract ID
   * @returns Escrow balance or null
   */ async getEscrowByContract(contractId) {
        const [escrow] = await this.db.select().from(_tenantrentcontracts.landlordEscrowBalances).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.contractId, contractId), (0, _drizzleorm.eq)(_tenantrentcontracts.landlordEscrowBalances.isReleased, false))).limit(1);
        return escrow || null;
    }
    constructor(db){
        this.db = db;
        this.logger = new _common.Logger(EscrowService.name);
    }
};
_ts_decorate([
    (0, _schedule.Cron)('0 2 * * *'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], EscrowService.prototype, "checkAndReleaseEscrow", null);
EscrowService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _postgresjs.PostgresJsDatabase === "undefined" ? Object : _postgresjs.PostgresJsDatabase
    ])
], EscrowService);

//# sourceMappingURL=escrow.service.js.map