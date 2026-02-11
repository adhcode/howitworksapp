#!/bin/bash

# Run All Migrations on Neon Database
# This script runs all database migrations on the Neon development database

set -e  # Exit on error

echo "🚀 Running all migrations on Neon database..."
echo ""

# Neon database URL
NEON_DB="postgresql://neondb_owner:npg_k6XMr0gTlDVn@ep-silent-mountain-abf0q4hy-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# Function to run SQL file
run_migration() {
    local file=$1
    local description=$2
    
    echo "📝 Running: $description"
    echo "   File: $file"
    
    if [ -f "$file" ]; then
        psql "$NEON_DB" -f "$file"
        echo "   ✅ Success"
    else
        echo "   ⚠️  File not found: $file"
    fi
    echo ""
}

# 1. Password Reset Code Migration
run_migration "migrations/add_password_reset_code.sql" "Add password reset code columns"

# 2. Notifications Tables
run_migration "migrations/create_notifications_tables.sql" "Create notifications tables"

# 3. Fix Notifications Schema
run_migration "migrations/fix_notifications_schema.sql" "Fix notifications schema"

# 4. Payment Indexes
run_migration "migrations/add_payment_indexes.sql" "Add payment indexes for performance"

# 5. Artisans Table
run_migration "migrations/create_artisans_table.sql" "Create artisans directory table"

echo "🎉 All migrations completed successfully!"
echo ""
echo "📊 Database Status:"
psql "$NEON_DB" -c "\dt" 2>/dev/null || echo "Could not list tables"
echo ""
echo "✅ Neon database is ready for development"
