-- Migration: Create Wallet System for Landlords
-- This creates tables to track landlord balances and wallet transactions

-- Create transaction type enum
CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'withdrawal', 'refund', 'fee');

-- Create transaction status enum
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Create landlord wallet balances table
CREATE TABLE landlord_wallet_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Balance tracking
  available_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  pending_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total_earned DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total_withdrawn DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  
  currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(landlord_id)
);

-- Create wallet transactions table
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Transaction details
  type transaction_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  balance_before DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,
  
  -- References
  reference VARCHAR(255),
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  
  -- Status and metadata
  status transaction_status NOT NULL DEFAULT 'completed',
  description TEXT,
  metadata TEXT, -- JSON string
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_wallet_balances_landlord ON landlord_wallet_balances(landlord_id);
CREATE INDEX idx_wallet_transactions_landlord ON wallet_transactions(landlord_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_created ON wallet_transactions(created_at DESC);
CREATE INDEX idx_wallet_transactions_payment ON wallet_transactions(payment_id);

-- Add comments
COMMENT ON TABLE landlord_wallet_balances IS 'Tracks landlord wallet balances and earnings';
COMMENT ON TABLE wallet_transactions IS 'Records all wallet transactions for audit trail';
COMMENT ON COLUMN landlord_wallet_balances.available_balance IS 'Balance available for withdrawal';
COMMENT ON COLUMN landlord_wallet_balances.pending_balance IS 'Balance pending clearance';
COMMENT ON COLUMN landlord_wallet_balances.total_earned IS 'Total amount earned from rent payments';
COMMENT ON COLUMN landlord_wallet_balances.total_withdrawn IS 'Total amount withdrawn to bank account';
