#!/bin/bash

# Production Migration Script
# Safely migrate database changes to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database URLs
NEON_DB="postgresql://neondb_owner:npg_k6XMr0gTlDVn@ep-silent-mountain-abf0q4hy-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
PROD_DB="postgresql://postgres:IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH@yamanote.proxy.rlwy.net:34012/railway"

# Check if migration file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: No migration file specified${NC}"
    echo "Usage: ./migrate-to-production.sh migrations/your_migration.sql"
    exit 1
fi

MIGRATION_FILE=$1

# Check if file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Error: Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║     PRODUCTION DATABASE MIGRATION                     ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Migration file: ${GREEN}$MIGRATION_FILE${NC}"
echo ""

# Step 1: Verify migration on Neon
echo -e "${YELLOW}Step 1: Verifying migration on Neon (development)...${NC}"
echo "Checking if migration has been tested on Neon..."
echo ""
read -p "Has this migration been tested on Neon? (yes/no): " tested

if [ "$tested" != "yes" ]; then
    echo -e "${RED}❌ Please test the migration on Neon first!${NC}"
    echo ""
    echo "Run this command to test:"
    echo "  psql '$NEON_DB' -f $MIGRATION_FILE"
    exit 1
fi

# Step 2: Create backup
echo ""
echo -e "${YELLOW}Step 2: Creating production backup...${NC}"
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Create backup now? (yes/no): " create_backup

if [ "$create_backup" = "yes" ]; then
    echo "Creating backup..."
    pg_dump "$PROD_DB" > "$BACKUP_FILE"
    
    if [ -f "$BACKUP_FILE" ]; then
        BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
        echo -e "${GREEN}✅ Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)${NC}"
    else
        echo -e "${RED}❌ Backup failed!${NC}"
        exit 1
    fi
else
    echo -e "${RED}⚠️  Proceeding without backup (not recommended)${NC}"
fi

# Step 3: Show migration content
echo ""
echo -e "${YELLOW}Step 3: Migration content:${NC}"
echo "─────────────────────────────────────────────────────────"
cat "$MIGRATION_FILE"
echo "─────────────────────────────────────────────────────────"
echo ""

# Step 4: Final confirmation
echo -e "${RED}⚠️  WARNING: You are about to modify the PRODUCTION database!${NC}"
echo ""
echo "This will:"
echo "  • Run migration on Railway production database"
echo "  • Affect live user data"
echo "  • Cannot be easily undone"
echo ""
read -p "Are you ABSOLUTELY sure you want to continue? (type 'yes' to confirm): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Migration cancelled.${NC}"
    exit 0
fi

# Step 5: Run migration
echo ""
echo -e "${YELLOW}Step 5: Running migration on production...${NC}"
echo ""

psql "$PROD_DB" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Verify changes in production database"
    echo "  2. Deploy code changes: git push"
    echo "  3. Monitor Railway logs"
    echo "  4. Test production endpoints"
    echo ""
    echo "Backup location: $BACKUP_FILE"
else
    echo ""
    echo -e "${RED}❌ Migration failed!${NC}"
    echo ""
    echo "To rollback, restore from backup:"
    echo "  psql '$PROD_DB' < $BACKUP_FILE"
    exit 1
fi
