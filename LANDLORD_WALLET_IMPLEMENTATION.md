# Landlord Wallet & Balance System Implementation Plan

## Current State

### What's Working:
✅ Tenant makes payment via Paystack
✅ Payment is verified and processed
✅ Payment record is created in database
✅ Contract next payment date is updated

### What's NOT Working:
❌ Landlord balance is not tracked
❌ Landlord cannot see available balance
❌ Landlord cannot withdraw funds
❌ No wallet transactions table
❌ No notification to landlord about payment received

## Current Payment Flow

```
Tenant pays ₦50,000
    ↓
Paystack receives payment
    ↓
Backend verifies with Paystack
    ↓
processImmediatePayout() is called
    ↓
Logs: "💰 Immediate payout: $50000 to landlord..."
    ↓
Logs: "✅ Landlord wallet credited. Transaction ID: txn_..."
    ↓
❌ BUT: No actual balance tracking!
```

## Required Implementation

### 1. Database Schema

#### Landlord Wallet Balances Table
```sql
CREATE TABLE landlord_wallet_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID REFERENCES users(id) NOT NULL,
  available_balance DECIMAL(10, 2) DEFAULT 0.00,
  pending_balance DECIMAL(10, 2) DEFAULT 0.00,
  total_earned DECIMAL(10, 2) DEFAULT 0.00,
  total_withdrawn DECIMAL(10, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'NGN',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(landlord_id)
);
```

#### Wallet Transactions Table
```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID REFERENCES users(id) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'credit', 'debit', 'withdrawal', 'refund'
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  reference VARCHAR(255),
  description TEXT,
  payment_id UUID REFERENCES payments(id),
  status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Backend Services

#### WalletService
```typescript
class WalletService {
  // Get landlord balance
  async getBalance(landlordId: string): Promise<WalletBalance>
  
  // Credit landlord wallet (when tenant pays)
  async credit(landlordId: string, amount: number, metadata: any): Promise<Transaction>
  
  // Debit landlord wallet (when withdrawing)
  async debit(landlordId: string, amount: number, metadata: any): Promise<Transaction>
  
  // Get transaction history
  async getTransactions(landlordId: string, filters?: any): Promise<Transaction[]>
  
  // Process withdrawal request
  async processWithdrawal(landlordId: string, amount: number): Promise<WithdrawalResult>
}
```

### 3. Payment Flow Update

```typescript
// In payment-processor.service.ts
private async processImmediatePayout(
  landlordId: string,
  amount: number,
  contractId: string,
  paymentMethod?: string,
  reference?: string
): Promise<string> {
  // 1. Credit landlord wallet
  const transaction = await this.walletService.credit(landlordId, amount, {
    type: 'rent_payment',
    contractId,
    paymentMethod,
    reference,
  });
  
  // 2. Send notification to landlord
  await this.notificationService.notifyLandlord(landlordId, {
    type: 'payment_received',
    amount,
    reference,
  });
  
  return transaction.id;
}
```

### 4. Landlord Dashboard Updates

#### Balance Display
```typescript
// Show on landlord dashboard
{
  availableBalance: 150000,
  pendingBalance: 0,
  totalEarned: 500000,
  totalWithdrawn: 350000,
  currency: 'NGN'
}
```

#### Transaction History
```typescript
[
  {
    id: 'txn_123',
    type: 'credit',
    amount: 50000,
    description: 'Rent payment from John Doe',
    reference: 'homezy_rent_...',
    date: '2025-11-16',
    balanceAfter: 150000
  },
  {
    id: 'txn_124',
    type: 'withdrawal',
    amount: 100000,
    description: 'Withdrawal to bank account',
    date: '2025-11-10',
    balanceAfter: 100000
  }
]
```

### 5. Withdrawal Flow

```
Landlord requests withdrawal
    ↓
Check available balance
    ↓
Verify bank account is set up
    ↓
Create withdrawal transaction (pending)
    ↓
Initiate Paystack transfer
    ↓
Update transaction status (completed/failed)
    ↓
Update wallet balance
    ↓
Send confirmation notification
```

### 6. Mobile App Updates

#### Landlord Payment Screen
- Show available balance
- Show pending balance
- Show transaction history
- Add "Withdraw Funds" button
- Show withdrawal history

#### Withdrawal Screen
- Enter amount to withdraw
- Show available balance
- Confirm bank account
- Process withdrawal
- Show success/error

## Implementation Steps

### Phase 1: Database Setup
1. Create migration for wallet_balances table
2. Create migration for wallet_transactions table
3. Run migrations

### Phase 2: Backend Services
1. Create WalletService
2. Update PaymentProcessorService to use WalletService
3. Add wallet endpoints to controller
4. Add notification for payment received

### Phase 3: Mobile App
1. Update landlord dashboard to show balance
2. Create transaction history screen
3. Create withdrawal screen
4. Add withdrawal flow

### Phase 4: Testing
1. Test payment credits wallet
2. Test balance updates correctly
3. Test transaction history
4. Test withdrawal flow
5. Test notifications

## Current Workaround

For now, the system:
- ✅ Processes payments successfully
- ✅ Creates payment records
- ✅ Updates contract dates
- ❌ Does NOT track landlord balance
- ❌ Does NOT allow withdrawals

## Priority

This is a **HIGH PRIORITY** feature because:
1. Landlords need to see their earnings
2. Landlords need to withdraw funds
3. Financial transparency is critical
4. Required for production launch

## Estimated Effort

- Database setup: 1 hour
- Backend services: 3-4 hours
- Mobile app updates: 4-5 hours
- Testing: 2-3 hours
- **Total: 10-13 hours**

## Next Steps

1. Create database migrations
2. Implement WalletService
3. Update payment processor
4. Update landlord dashboard
5. Implement withdrawal flow
6. Add notifications
7. Test end-to-end
