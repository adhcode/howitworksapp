#!/bin/bash

# Rebranding Script: HowitWorks/HIW -> Property HomeCare
# This script updates all occurrences across the codebase

echo "🔄 Starting rebranding to Property HomeCare..."

# Backend email service (already done, but ensuring completeness)
echo "📧 Updating backend email service..."
sed -i '' 's/HIW Maintenance/Property HomeCare/g' backend/src/email/email.service.ts
sed -i '' 's/HowitWorks/Property HomeCare/g' backend/src/email/email.service.ts
sed -i '' 's/howitworks\.com\.ng/propertyhomecare.com.ng/g' backend/src/email/email.service.ts

# Backend notification sender
echo "📬 Updating notification sender..."
sed -i '' 's/Homezy/Property HomeCare/g' backend/src/core/notifications/notification-sender.service.ts

# Mobile app files
echo "📱 Updating mobile app..."
sed -i '' 's/HIW Maintenance/Property HomeCare/g' mobile/app/splash.tsx
sed -i '' 's/HIW/PHC/g' mobile/app/splash.tsx
sed -i '' 's/hiw-maintenance/property-homecare/g' mobile/app.json
sed -i '' 's/Hiw maintenance/Property HomeCare/g' mobile/app.json
sed -i '' 's/com\.adhcode\.hiwapp/com.adhcode.propertyhomecare/g' mobile/app.json
sed -i '' 's/HIW Maintenance/Property HomeCare/g' mobile/app/_layout.tsx
sed -i '' 's/HIW Maintenance/Property HomeCare/g' mobile/app/auth/welcome.tsx
sed -i '' 's/HIW/PHC/g' mobile/app/auth/welcome.tsx
sed -i '' 's/support@howitworks\.com\.ng/support@propertyhomecare.com.ng/g' mobile/app/landlord/help-support.tsx
sed -i '' 's/support@howitworks\.com\.ng/support@propertyhomecare.com.ng/g' mobile/app/tenant/help-support.tsx
sed -i '' 's/@temp\.howitworks\.app/@temp.propertyhomecare.app/g' mobile/app/landlord/add-tenant.tsx
sed -i '' 's/howitworksapp-production/propertyhomecare-production/g' mobile/app/services/api.ts

# Admin dashboard
echo "🖥️  Updating admin dashboard..."
sed -i '' 's/Howitworks/Property HomeCare/g' admin-dashboard/src/pages/SignupPage.tsx
sed -i '' 's/HowItWorks/Property HomeCare/g' admin-dashboard/src/pages/LoginPage.tsx
sed -i '' 's/HIW Maintenance/Property HomeCare/g' admin-dashboard/src/pages/LoginPage.tsx
sed -i '' 's/admin@howitworks\.app/admin@propertyhomecare.app/g' admin-dashboard/src/pages/LoginPage.tsx
sed -i '' 's/HowItWorks/Property HomeCare/g' admin-dashboard/src/components/layouts/DashboardLayout.tsx
sed -i '' 's/HowItWorks Admin/Property HomeCare Admin/g' admin-dashboard/.env
sed -i '' 's/howitworks-admin-dashboard/propertyhomecare-admin-dashboard/g' admin-dashboard/package.json
sed -i '' 's/HowItWorks/Property HomeCare/g' admin-dashboard/README.md
sed -i '' 's/howitworks\.app/propertyhomecare.app/g' admin-dashboard/README.md
sed -i '' 's/HowItWorks/Property HomeCare/g' admin-dashboard/public/logo.svg
sed -i '' 's/HowItWorks Admin Dashboard/Property HomeCare Admin Dashboard/g' admin-dashboard/index.html
sed -i '' 's/HowItWorks Admin Dashboard/Property HomeCare Admin Dashboard/g' admin-dashboard/index.html

# Build scripts
echo "🔨 Updating build scripts..."
sed -i '' 's/HowitWorks/Property HomeCare/g' build-and-deploy.sh

# Documentation files
echo "📄 Updating documentation..."
sed -i '' 's/HIW Maintenance/Property HomeCare/g' PLAY_STORE_SUBMISSION_CHECKLIST.md
sed -i '' 's/HIW/PHC/g' PLAY_STORE_SUBMISSION_CHECKLIST.md
sed -i '' 's/Homezy/Property HomeCare/g' PLAY_STORE_SUBMISSION_CHECKLIST.md

echo "✅ Rebranding complete!"
echo ""
echo "📝 Summary of changes:"
echo "  - HowitWorks → Property HomeCare"
echo "  - HIW Maintenance → Property HomeCare"
echo "  - HIW → PHC (abbreviation)"
echo "  - Homezy → Property HomeCare"
echo "  - howitworks.com.ng → propertyhomecare.com.ng"
echo "  - Package names updated"
echo ""
echo "⚠️  Manual steps required:"
echo "  1. Update logo files (HIWLogo.png) with new branding"
echo "  2. Update app icons in mobile/app/assets/"
echo "  3. Update splash screen images"
echo "  4. Update Railway/deployment URLs if needed"
echo "  5. Update environment variables in production"
