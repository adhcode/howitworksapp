"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get landlordWalletBalances () {
        return landlordWalletBalances;
    },
    get transactionStatusEnum () {
        return transactionStatusEnum;
    },
    get transactionTypeEnum () {
        return transactionTypeEnum;
    },
    get walletTransactions () {
        return walletTransactions;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _users = require("./users");
const _payments = require("./payments");
const transactionTypeEnum = (0, _pgcore.pgEnum)('transaction_type', [
    'credit',
    'debit',
    'withdrawal',
    'refund',
    'fee'
]);
const transactionStatusEnum = (0, _pgcore.pgEnum)('transaction_status', [
    'pending',
    'completed',
    'failed',
    'cancelled'
]);
const landlordWalletBalances = (0, _pgcore.pgTable)('landlord_wallet_balances', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    landlordId: (0, _pgcore.uuid)('landlord_id').references(()=>_users.users.id).notNull().unique(),
    // Balance tracking
    availableBalance: (0, _pgcore.decimal)('available_balance', {
        precision: 12,
        scale: 2
    }).default('0.00').notNull(),
    pendingBalance: (0, _pgcore.decimal)('pending_balance', {
        precision: 12,
        scale: 2
    }).default('0.00').notNull(),
    totalEarned: (0, _pgcore.decimal)('total_earned', {
        precision: 12,
        scale: 2
    }).default('0.00').notNull(),
    totalWithdrawn: (0, _pgcore.decimal)('total_withdrawn', {
        precision: 12,
        scale: 2
    }).default('0.00').notNull(),
    currency: (0, _pgcore.varchar)('currency', {
        length: 3
    }).default('NGN').notNull(),
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow().notNull()
});
const walletTransactions = (0, _pgcore.pgTable)('wallet_transactions', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    landlordId: (0, _pgcore.uuid)('landlord_id').references(()=>_users.users.id).notNull(),
    // Transaction details
    type: transactionTypeEnum('type').notNull(),
    amount: (0, _pgcore.decimal)('amount', {
        precision: 12,
        scale: 2
    }).notNull(),
    balanceBefore: (0, _pgcore.decimal)('balance_before', {
        precision: 12,
        scale: 2
    }).notNull(),
    balanceAfter: (0, _pgcore.decimal)('balance_after', {
        precision: 12,
        scale: 2
    }).notNull(),
    // References
    reference: (0, _pgcore.varchar)('reference', {
        length: 255
    }),
    paymentId: (0, _pgcore.uuid)('payment_id').references(()=>_payments.payments.id),
    // Status and metadata
    status: transactionStatusEnum('status').default('completed').notNull(),
    description: (0, _pgcore.text)('description'),
    metadata: (0, _pgcore.text)('metadata'),
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow().notNull()
});

//# sourceMappingURL=wallet.js.map