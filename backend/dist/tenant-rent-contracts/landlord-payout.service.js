"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LandlordPayoutService", {
    enumerable: true,
    get: function() {
        return LandlordPayoutService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _databasemodule = require("../database/database.module");
const _schema = require("../database/schema");
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
let LandlordPayoutService = class LandlordPayoutService {
    /**
   * Process immediate payout for monthly landlords
   * Credits the landlord's wallet immediately when tenant pays
   */ async processImmediatePayout(landlordId, amount, contractId) {
        try {
            this.logger.log(`Processing immediate payout: ${amount} for landlord ${landlordId}, contract ${contractId}`);
            // Validate contract exists and belongs to landlord
            const [contract] = await this.db.select().from(_schema.tenantRentContracts).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.tenantRentContracts.id, contractId), (0, _drizzleorm.eq)(_schema.tenantRentContracts.landlordId, landlordId), (0, _drizzleorm.eq)(_schema.tenantRentContracts.landlordPayoutType, 'monthly')));
            if (!contract) {
                throw new Error(`Contract not found or not eligible for immediate payout: ${contractId}`);
            }
            // TODO: Integrate with existing wallet/payment system to credit landlord
            // For now, we'll log the transaction - this should be replaced with actual wallet credit
            this.logger.log(`Would credit landlord ${landlordId} wallet with ${amount} for contract ${contractId}`);
            // In a real implementation, this would:
            // 1. Credit the landlord's wallet balance
            // 2. Create a transaction record
            // 3. Send notification to landlord
            return {
                success: true,
                payoutType: 'immediate',
                amount,
                transactionId: `txn_${Date.now()}_${contractId}` // Mock transaction ID
            };
        } catch (error) {
            this.logger.error(`Error processing immediate payout: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * Add payment to escrow for yearly payout accumulation
   * Stores tenant payments until contract expiry or 12 months
   */ async addToEscrow(landlordId, amount, contractId) {
        try {
            this.logger.log(`Adding to escrow: ${amount} for landlord ${landlordId}, contract ${contractId}`);
            // Validate contract exists and belongs to landlord
            const [contract] = await this.db.select().from(_schema.tenantRentContracts).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.tenantRentContracts.id, contractId), (0, _drizzleorm.eq)(_schema.tenantRentContracts.landlordId, landlordId), (0, _drizzleorm.eq)(_schema.tenantRentContracts.landlordPayoutType, 'yearly')));
            if (!contract) {
                throw new Error(`Contract not found or not eligible for escrow: ${contractId}`);
            }
            // Check if escrow balance already exists for this contract
            const [existingEscrow] = await this.db.select().from(_schema.landlordEscrowBalances).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.landlordEscrowBalances.contractId, contractId), (0, _drizzleorm.eq)(_schema.landlordEscrowBalances.isReleased, false)));
            if (existingEscrow) {
                // Update existing escrow balance
                const newTotal = parseFloat(existingEscrow.totalEscrowed) + amount;
                const newMonthsAccumulated = existingEscrow.monthsAccumulated + 1;
                await this.db.update(_schema.landlordEscrowBalances).set({
                    totalEscrowed: newTotal.toString(),
                    monthsAccumulated: newMonthsAccumulated,
                    updatedAt: new Date()
                }).where((0, _drizzleorm.eq)(_schema.landlordEscrowBalances.id, existingEscrow.id));
                this.logger.log(`Updated escrow balance: ${newTotal} (${newMonthsAccumulated} months) for contract ${contractId}`);
            } else {
                // Create new escrow balance
                const expectedReleaseDate = new Date(contract.expiryDate);
                const newEscrow = {
                    landlordId,
                    contractId,
                    totalEscrowed: amount.toString(),
                    monthsAccumulated: 1,
                    expectedReleaseDate,
                    isReleased: false
                };
                await this.db.insert(_schema.landlordEscrowBalances).values(newEscrow);
                this.logger.log(`Created new escrow balance: ${amount} for contract ${contractId}, release date: ${expectedReleaseDate}`);
            }
            return {
                success: true,
                payoutType: 'escrow',
                amount
            };
        } catch (error) {
            this.logger.error(`Error adding to escrow: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * Check for escrow balances ready for release
   * Called by scheduler to process contract expiries
   */ async checkEscrowReleases() {
        try {
            this.logger.log('Checking for escrow balances ready for release');
            const today = new Date();
            // Find escrow balances that are ready for release (past expected release date)
            const readyForRelease = await this.db.select({
                escrow: _schema.landlordEscrowBalances,
                contract: _schema.tenantRentContracts
            }).from(_schema.landlordEscrowBalances).leftJoin(_schema.tenantRentContracts, (0, _drizzleorm.eq)(_schema.landlordEscrowBalances.contractId, _schema.tenantRentContracts.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.landlordEscrowBalances.isReleased, false), (0, _drizzleorm.lte)(_schema.landlordEscrowBalances.expectedReleaseDate, today)));
            this.logger.log(`Found ${readyForRelease.length} escrow balances ready for release`);
            const results = [];
            for (const item of readyForRelease){
                try {
                    const result = await this.releaseEscrowBalance(item.escrow.id);
                    results.push(result);
                } catch (error) {
                    this.logger.error(`Failed to release escrow ${item.escrow.id}: ${error.message}`);
                // Continue with other releases even if one fails
                }
            }
            return results;
        } catch (error) {
            this.logger.error(`Error checking escrow releases: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * Release escrow balance with transaction safety
   * Transfers accumulated escrow to landlord's wallet
   */ async releaseEscrowBalance(escrowId) {
        try {
            this.logger.log(`Releasing escrow balance: ${escrowId}`);
            // Use transaction for safety
            return await this.db.transaction(async (tx)=>{
                // Get escrow balance details
                const [escrow] = await tx.select().from(_schema.landlordEscrowBalances).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.landlordEscrowBalances.id, escrowId), (0, _drizzleorm.eq)(_schema.landlordEscrowBalances.isReleased, false)));
                if (!escrow) {
                    throw new Error(`Escrow balance not found or already released: ${escrowId}`);
                }
                const releaseAmount = parseFloat(escrow.totalEscrowed);
                if (releaseAmount <= 0) {
                    throw new Error(`Invalid release amount: ${releaseAmount}`);
                }
                // TODO: Credit landlord's wallet with the escrow amount
                // This should integrate with the existing wallet/payment system
                this.logger.log(`Would credit landlord ${escrow.landlordId} wallet with ${releaseAmount} from escrow ${escrowId}`);
                // Mark escrow as released
                await tx.update(_schema.landlordEscrowBalances).set({
                    isReleased: true,
                    releasedAt: new Date(),
                    releasedAmount: releaseAmount.toString(),
                    updatedAt: new Date()
                }).where((0, _drizzleorm.eq)(_schema.landlordEscrowBalances.id, escrowId));
                this.logger.log(`Successfully released escrow: ${releaseAmount} to landlord ${escrow.landlordId}`);
                return {
                    success: true,
                    releasedAmount: releaseAmount,
                    escrowId,
                    landlordId: escrow.landlordId
                };
            });
        } catch (error) {
            this.logger.error(`Error releasing escrow balance: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * Get landlord's escrow balances
   * Returns all escrow balances for a landlord (both active and released)
   */ async getLandlordEscrowBalances(landlordId) {
        try {
            this.logger.log(`Getting escrow balances for landlord: ${landlordId}`);
            const escrowBalances = await this.db.select({
                escrow: _schema.landlordEscrowBalances,
                contract: _schema.tenantRentContracts
            }).from(_schema.landlordEscrowBalances).leftJoin(_schema.tenantRentContracts, (0, _drizzleorm.eq)(_schema.landlordEscrowBalances.contractId, _schema.tenantRentContracts.id)).where((0, _drizzleorm.eq)(_schema.landlordEscrowBalances.landlordId, landlordId));
            this.logger.log(`Found ${escrowBalances.length} escrow balances for landlord ${landlordId}`);
            return escrowBalances.map((item)=>({
                    ...item.escrow,
                    contract: item.contract
                }));
        } catch (error) {
            this.logger.error(`Error getting landlord escrow balances: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * Get total escrowed amount for a landlord
   * Returns sum of all active (unreleased) escrow balances
   */ async getTotalEscrowedAmount(landlordId) {
        try {
            this.logger.log(`Getting total escrowed amount for landlord: ${landlordId}`);
            const [result] = await this.db.select({
                total: (0, _drizzleorm.sql)`COALESCE(SUM(${_schema.landlordEscrowBalances.totalEscrowed}), 0)`
            }).from(_schema.landlordEscrowBalances).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.landlordEscrowBalances.landlordId, landlordId), (0, _drizzleorm.eq)(_schema.landlordEscrowBalances.isReleased, false)));
            const totalAmount = parseFloat(result?.total || '0');
            this.logger.log(`Total escrowed amount for landlord ${landlordId}: ${totalAmount}`);
            return totalAmount;
        } catch (error) {
            this.logger.error(`Error getting total escrowed amount: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * Get escrow balance by contract ID
   * Helper method to get escrow details for a specific contract
   */ async getEscrowByContractId(contractId) {
        try {
            const [escrow] = await this.db.select().from(_schema.landlordEscrowBalances).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.landlordEscrowBalances.contractId, contractId), (0, _drizzleorm.eq)(_schema.landlordEscrowBalances.isReleased, false)));
            return escrow || null;
        } catch (error) {
            this.logger.error(`Error getting escrow by contract ID: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * Force release escrow balance (for early contract termination)
   * Allows manual release of escrow before expected date
   */ async forceReleaseEscrow(contractId, reason) {
        try {
            this.logger.log(`Force releasing escrow for contract: ${contractId}, reason: ${reason}`);
            const escrow = await this.getEscrowByContractId(contractId);
            if (!escrow) {
                throw new Error(`No active escrow found for contract: ${contractId}`);
            }
            // Log the reason for force release
            this.logger.log(`Force releasing escrow ${escrow.id} for reason: ${reason || 'Manual release'}`);
            return await this.releaseEscrowBalance(escrow.id);
        } catch (error) {
            this.logger.error(`Error force releasing escrow: ${error.message}`, error.stack);
            throw error;
        }
    }
    constructor(db){
        this.db = db;
        this.logger = new _common.Logger(LandlordPayoutService.name);
    }
};
LandlordPayoutService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], LandlordPayoutService);

//# sourceMappingURL=landlord-payout.service.js.map