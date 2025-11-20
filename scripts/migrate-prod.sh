#!/bin/bash

# ==========================================
# PRODUCTION MIGRATION SCRIPT (RAILWAY)
# ==========================================

set -e  # Exit on error

echo "🔴 PRODUCTION MIGRATION - RAILWAY DATABASE"
echo "=========================================="
echo ""
echo "⚠️  WARNING: You are about to modify the PRODUCTION database!"
echo ""

# Load production environment
if [ -f config/database.production.env ]; then
    export $(cat config/database.production.env | grep -v '^#' | xargs)
else
    echo "❌ Error: config/database.production.env not found!"
    exit 1
fi

# Verify we're using the right database
if [[ $DATABASE_URL == *"railway"* ]] || [[ $NODE_ENV == "production" ]]; then
    echo "📊 Database: postgresql://postgres:***@yamanote.proxy.rlwy.net:34012/railway"
    echo ""
    
    # Multiple confirmation prompts for safety
    read -p "⚠️  Are you sure you want to migrate PRODUCTION? (yes/no) " -r
    echo ""
    
    if [[ ! $REPLY == "yes" ]]; then
        echo "❌ Migration cancelled"
        exit 0
    fi
    
    echo "⚠️  FINAL CONFIRMATION REQUIRED"
    read -p "Type 'MIGRATE PRODUCTION' to continue: " -r
    echo ""
    
    if [[ $REPLY == "MIGRATE PRODUCTION" ]]; then
        echo "📸 Creating backup recommendation..."
        echo "💡 Recommended: Run 'pg_dump' to backup database first"
        echo ""
        read -p "Have you backed up the database? (yes/no) " -r
        echo ""
        
        if [[ $REPLY == "yes" ]]; then
            echo "🔄 Running Paystack migration on PRODUCTION..."
            psql "$DATABASE_URL" -f migrations/add-paystack-fields.sql
            
            echo ""
            echo "✅ Production migration completed successfully!"
            echo "🔍 Verifying columns..."
            psql "$DATABASE_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name LIKE 'paystack%' OR column_name LIKE 'bank%';"
            
            echo ""
            echo "✅ All done! Update your production environment variables next."
        else
            echo "❌ Please backup database first, then run again"
            exit 0
        fi
    else
        echo "❌ Migration cancelled - incorrect confirmation"
        exit 0
    fi
else
    echo "⚠️  ERROR: Database URL doesn't match production (Railway)"
    echo "📊 Current: $DATABASE_URL"
    echo "❌ Migration cancelled for safety"
    exit 1
fi



