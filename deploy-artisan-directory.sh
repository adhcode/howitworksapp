#!/bin/bash

# Deploy Artisan Directory Feature
# This script deploys both backend and admin dashboard changes

set -e

echo "🚀 Deploying Artisan Directory Feature"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check git status
echo -e "${BLUE}📋 Step 1: Checking git status${NC}"
git status
echo ""

# Step 2: Add all changes
echo -e "${BLUE}📦 Step 2: Adding changes${NC}"
git add backend/src/artisans/
git add backend/src/database/schema/artisans.ts
git add backend/migrations/create_artisans_table.sql
git add backend/run-artisans-migration.js
git add backend/run-artisans-migration.sh
git add backend/src/app.module.ts
git add admin-dashboard/src/pages/Artisans.tsx
git add admin-dashboard/src/pages/ArtisanRegister.tsx
git add admin-dashboard/src/pages/FacilitatorArtisans.tsx
git add admin-dashboard/src/App.tsx
git add admin-dashboard/src/components/layouts/DashboardLayout.tsx
git add backend/src/email/email.service.ts
git add ARTISAN_DIRECTORY_*.md
echo -e "${GREEN}✅ Changes staged${NC}"
echo ""

# Step 3: Commit
echo -e "${BLUE}💾 Step 3: Committing changes${NC}"
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="feat: Add Artisan Directory system with referral tracking"
fi
git commit -m "$COMMIT_MSG" || echo "Nothing to commit"
echo ""

# Step 4: Push to GitHub
echo -e "${BLUE}⬆️  Step 4: Pushing to GitHub${NC}"
git push
echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
echo ""

# Step 5: Run migration on production
echo -e "${YELLOW}⚠️  Step 5: Database Migration Required${NC}"
echo ""
echo "You need to run the migration on your production database:"
echo ""
echo "Option 1: Using Railway CLI"
echo "  railway run node run-artisans-migration.js"
echo ""
echo "Option 2: Using psql directly"
echo "  psql \$DATABASE_URL -f migrations/create_artisans_table.sql"
echo ""
echo "Option 3: Using the Node.js script"
echo "  node run-artisans-migration.js"
echo ""
read -p "Have you run the migration? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Remember to run the migration before testing!${NC}"
fi
echo ""

# Step 6: Deployment info
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📋 What was deployed:"
echo "  ✓ Backend: Artisan API endpoints"
echo "  ✓ Backend: Database schema and migration"
echo "  ✓ Admin Dashboard: Artisans management page"
echo "  ✓ Admin Dashboard: Public registration form"
echo "  ✓ Admin Dashboard: Facilitator referral page"
echo "  ✓ Email templates updated with new branding"
echo ""
echo "🔗 URLs:"
echo "  Backend API: https://propertyhomecare-production.up.railway.app"
echo "  Admin Dashboard: https://your-admin-dashboard.railway.app"
echo "  Public Form: https://your-admin-dashboard.railway.app/register-artisan?ref=FACILITATOR_ID"
echo ""
echo "📝 Next Steps:"
echo "  1. Verify backend is running: curl https://your-backend.railway.app/health"
echo "  2. Test artisan registration endpoint"
echo "  3. Test admin dashboard artisans page"
echo "  4. Test facilitator referral links"
echo ""
echo "📖 Documentation: ARTISAN_DIRECTORY_COMPLETE.md"
echo ""
