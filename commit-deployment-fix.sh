#!/bin/bash

echo "🔧 Committing deployment configuration fixes and admin dashboard updates..."

# Add deployment config changes
git add .railwayignore
git add admin-dashboard/.vercelignore
git add DEPLOYMENT_FIX.md
git add RAILWAY_ENV_SETUP.md

# Add TypeScript fixes
git add admin-dashboard/src/pages/ArtisanRegister.tsx
git add admin-dashboard/src/pages/Artisans.tsx
git add admin-dashboard/src/pages/FacilitatorArtisans.tsx

# Add ALL admin-dashboard changes (branding, metadata, etc.)
git add admin-dashboard/

# Add backend env update for referral link
git add backend/.env

# Commit with descriptive message
git commit -m "Fix: Deployment config + Admin dashboard updates

Deployment fixes:
- Remove Railway config from admin-dashboard (Vercel only)
- Add .railwayignore to prevent Railway building admin-dashboard
- Add .vercelignore to prevent Vercel building backend
- Fix TypeScript build errors in artisan pages

Admin dashboard updates:
- Update branding and metadata across all pages
- Fix artisan referral link to use production URL (app.howitworks.com.ng)
- Add ADMIN_DASHBOARD_URL env variable to backend

Deployment architecture:
- Admin Dashboard → Vercel (app.howitworks.com.ng)
- Backend API → Railway  
- Mobile App → EAS Build

✅ Admin dashboard builds successfully"

echo ""
echo "✅ Changes committed!"
echo ""
echo "📤 Pushing to remote..."
git push

echo ""
echo "🎉 Done! Deployment configuration fixed."
echo ""
echo "⚠️  IMPORTANT: Add this to Railway environment variables:"
echo "   ADMIN_DASHBOARD_URL=https://app.howitworks.com.ng"
echo ""
echo "Next steps:"
echo "1. Add ADMIN_DASHBOARD_URL to Railway (see RAILWAY_ENV_SETUP.md)"
echo "2. Railway will only build backend (check Railway dashboard)"
echo "3. Vercel will auto-deploy admin dashboard with latest changes"
echo "4. After Railway redeploys, artisan referral links will show production URL"
echo "5. Verify branding updates are live on admin dashboard"
