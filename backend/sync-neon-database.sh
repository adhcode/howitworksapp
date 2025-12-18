#!/bin/bash

# ==========================================
# NEON DATABASE SYNC SCRIPT
# ==========================================
# This script syncs your Neon database with all schema changes

set -e  # Exit on error

echo "🚀 Starting Neon Database Sync..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Load DATABASE_URL
source .env

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found DATABASE_URL${NC}"
echo ""

# Step 1: Generate fresh migrations from schema
echo -e "${YELLOW}📝 Step 1: Generating migrations from schema...${NC}"
npx drizzle-kit generate
echo -e "${GREEN}✓ Migrations generated${NC}"
echo ""

# Step 2: Push schema to database (creates/updates all tables)
echo -e "${YELLOW}📤 Step 2: Pushing schema to Neon database...${NC}"
npx drizzle-kit push
echo -e "${GREEN}✓ Schema pushed successfully${NC}"
echo ""

# Step 3: Apply custom SQL migrations
echo -e "${YELLOW}🔧 Step 3: Applying custom SQL migrations...${NC}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  psql not found. Installing via npm...${NC}"
    npm install -g postgres
fi

# Apply password reset code migration
echo "  → Applying password reset code migration..."
psql "$DATABASE_URL" -f migrations/add_password_reset_code.sql
echo -e "${GREEN}  ✓ Password reset fields added${NC}"

# Apply Paystack fields migration
echo "  → Applying Paystack fields migration..."
psql "$DATABASE_URL" -f migrations/add-paystack-fields.sql
echo -e "${GREEN}  ✓ Paystack fields added${NC}"

echo ""
echo -e "${GREEN}✅ Database sync complete!${NC}"
echo ""

# Step 4: Verify tables exist
echo -e "${YELLOW}🔍 Step 4: Verifying database tables...${NC}"
psql "$DATABASE_URL" -c "\dt" | grep -E "users|properties|units|payments|notifications|leases|messages|maintenance_requests|tenant_invitations|tenant_rent_contracts|landlord_escrow_balances|landlord_wallet_balances|wallet_transactions|payment_notifications|push_tokens|payment_history"

echo ""
echo -e "${GREEN}🎉 All done! Your Neon database is ready.${NC}"
