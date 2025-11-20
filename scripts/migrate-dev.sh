#!/bin/bash

# ==========================================
# DEVELOPMENT MIGRATION SCRIPT (NEON)
# ==========================================

set -e  # Exit on error

echo "🔵 Running migration on DEVELOPMENT database (Neon)..."
echo ""

# Load development environment
if [ -f config/database.development.env ]; then
    export $(cat config/database.development.env | grep -v '^#' | xargs)
else
    echo "❌ Error: config/database.development.env not found!"
    exit 1
fi

# Verify we're using the right database
if [[ $DATABASE_URL == *"neon"* ]] || [[ $NODE_ENV == "development" ]]; then
    echo "✅ Confirmed: DEVELOPMENT environment"
    echo "📊 Database: $DATABASE_URL"
    echo ""
    
    # Ask for confirmation
    read -p "Continue with migration? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Running Paystack migration..."
        psql "$DATABASE_URL" -f migrations/add-paystack-fields.sql
        
        echo ""
        echo "✅ Migration completed successfully!"
        echo "🔍 Verifying columns..."
        psql "$DATABASE_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name LIKE 'paystack%';"
    else
        echo "❌ Migration cancelled"
        exit 0
    fi
else
    echo "⚠️  WARNING: This doesn't look like a development database!"
    echo "📊 Database URL: $DATABASE_URL"
    echo "❌ Migration cancelled for safety"
    exit 1
fi



