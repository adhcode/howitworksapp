"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WalletService", {
    enumerable: true,
    get: function() {
        return WalletService;
    }
});
const _common = require("@nestjs/common");
const _postgresjs = require("drizzle-orm/postgres-js");
const _drizzleorm = require("drizzle-orm");
const _databasemodule = require("../../database/database.module");
const _wallet = require("../../database/schema/wallet");
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
let WalletService = class WalletService {
    /**
   * GET OR CREATE WALLET BALANCE
   * 
   * Gets existing wallet or creates new one for landlord.
   */ async getOrCreateWallet(landlordId) {
        // Try to get existing wallet
        const [existing] = await this.db.select().from(_wallet.landlordWalletBalances).where((0, _drizzleorm.eq)(_wallet.landlordWalletBalances.landlordId, landlordId)).limit(1);
        if (existing) {
            return existing;
        }
        // Create new wallet
        const newWallet = {
            landlordId,
            availableBalance: '0.00',
            pendingBalance: '0.00',
            totalEarned: '0.00',
            totalWithdrawn: '0.00',
            currency: 'NGN'
        };
        const [created] = await this.db.insert(_wallet.landlordWalletBalances).values(newWallet).returning();
        this.logger.log(`✅ Created new wallet for landlord ${landlordId}`);
        return created;
    }
    /**
   * CREDIT WALLET
   * 
   * Adds money to landlord's available balance.
   * Used when tenant makes a payment.
   */ async credit(landlordId, amount, metadata) {
        this.logger.log(`💰 Crediting wallet: ${landlordId} - ₦${amount}`);
        // Get or create wallet
        const wallet = await this.getOrCreateWallet(landlordId);
        const balanceBefore = parseFloat(wallet.availableBalance);
        const balanceAfter = balanceBefore + amount;
        const newTotalEarned = parseFloat(wallet.totalEarned) + amount;
        // Create transaction record
        const transaction = {
            landlordId,
            type: 'credit',
            amount: amount.toFixed(2),
            balanceBefore: balanceBefore.toFixed(2),
            balanceAfter: balanceAfter.toFixed(2),
            reference: metadata.reference,
            paymentId: metadata.paymentId,
            status: 'completed',
            description: metadata.description || `Credit from ${metadata.type}`,
            metadata: JSON.stringify(metadata)
        };
        const [createdTransaction] = await this.db.insert(_wallet.walletTransactions).values(transaction).returning();
        // Update wallet balance
        await this.db.update(_wallet.landlordWalletBalances).set({
            availableBalance: balanceAfter.toFixed(2),
            totalEarned: newTotalEarned.toFixed(2),
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_wallet.landlordWalletBalances.landlordId, landlordId));
        this.logger.log(`✅ Wallet credited: ${landlordId} - Balance: ₦${balanceAfter}`);
        return createdTransaction;
    }
    /**
   * DEBIT WALLET
   * 
   * Removes money from landlord's available balance.
   * Used for withdrawals or refunds.
   */ async debit(landlordId, amount, metadata) {
        this.logger.log(`💸 Debiting wallet: ${landlordId} - ₦${amount}`);
        // Get wallet
        const wallet = await this.getOrCreateWallet(landlordId);
        const balanceBefore = parseFloat(wallet.availableBalance);
        // Check sufficient balance
        if (balanceBefore < amount) {
            throw new _common.BadRequestException(`Insufficient balance. Available: ₦${balanceBefore}, Required: ₦${amount}`);
        }
        const balanceAfter = balanceBefore - amount;
        const newTotalWithdrawn = parseFloat(wallet.totalWithdrawn) + amount;
        // Create transaction record
        const transaction = {
            landlordId,
            type: metadata.type === 'withdrawal' ? 'withdrawal' : 'debit',
            amount: amount.toFixed(2),
            balanceBefore: balanceBefore.toFixed(2),
            balanceAfter: balanceAfter.toFixed(2),
            reference: metadata.reference,
            status: 'completed',
            description: metadata.description || `Debit for ${metadata.type}`,
            metadata: JSON.stringify(metadata)
        };
        const [createdTransaction] = await this.db.insert(_wallet.walletTransactions).values(transaction).returning();
        // Update wallet balance
        await this.db.update(_wallet.landlordWalletBalances).set({
            availableBalance: balanceAfter.toFixed(2),
            totalWithdrawn: newTotalWithdrawn.toFixed(2),
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_wallet.landlordWalletBalances.landlordId, landlordId));
        this.logger.log(`✅ Wallet debited: ${landlordId} - Balance: ₦${balanceAfter}`);
        return createdTransaction;
    }
    /**
   * GET WALLET BALANCE
   * 
   * Returns current wallet balance for landlord.
   */ async getBalance(landlordId) {
        const wallet = await this.getOrCreateWallet(landlordId);
        return {
            availableBalance: parseFloat(wallet.availableBalance),
            pendingBalance: parseFloat(wallet.pendingBalance),
            totalEarned: parseFloat(wallet.totalEarned),
            totalWithdrawn: parseFloat(wallet.totalWithdrawn),
            currency: wallet.currency
        };
    }
    /**
   * GET TRANSACTION HISTORY
   * 
   * Returns wallet transaction history for landlord.
   */ async getTransactions(landlordId, options) {
        const limit = options?.limit || 50;
        const offset = options?.offset || 0;
        let query = this.db.select().from(_wallet.walletTransactions).where((0, _drizzleorm.eq)(_wallet.walletTransactions.landlordId, landlordId)).orderBy((0, _drizzleorm.desc)(_wallet.walletTransactions.createdAt)).limit(limit).offset(offset);
        const transactions = await query;
        return transactions.map((t)=>({
                ...t,
                amount: parseFloat(t.amount),
                balanceBefore: parseFloat(t.balanceBefore),
                balanceAfter: parseFloat(t.balanceAfter),
                metadata: t.metadata ? JSON.parse(t.metadata) : null
            }));
    }
    /**
   * GET TRANSACTION BY ID
   * 
   * Returns specific transaction details.
   */ async getTransaction(transactionId, landlordId) {
        const [transaction] = await this.db.select().from(_wallet.walletTransactions).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_wallet.walletTransactions.id, transactionId), (0, _drizzleorm.eq)(_wallet.walletTransactions.landlordId, landlordId))).limit(1);
        if (!transaction) {
            throw new _common.NotFoundException('Transaction not found');
        }
        return {
            ...transaction,
            amount: parseFloat(transaction.amount),
            balanceBefore: parseFloat(transaction.balanceBefore),
            balanceAfter: parseFloat(transaction.balanceAfter),
            metadata: transaction.metadata ? JSON.parse(transaction.metadata) : null
        };
    }
    constructor(db){
        this.db = db;
        this.logger = new _common.Logger(WalletService.name);
    }
};
WalletService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _postgresjs.PostgresJsDatabase === "undefined" ? Object : _postgresjs.PostgresJsDatabase
    ])
], WalletService);

//# sourceMappingURL=wallet.service.js.map