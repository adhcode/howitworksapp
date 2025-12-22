#!/bin/bash

echo "🚀 Deploy Admin Dashboard to Railway"
echo "====================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in
echo "🔐 Checking Railway login..."
if ! railway whoami &> /dev/null; then
    echo "Please login to Railway:"
    railway login
fi

echo ""
echo "✅ Logged in as: $(railway whoami)"
echo ""

# Push changes first
echo "📦 Step 1: Pushing changes to git..."
git add admin-dashboard/railway.json admin-dashboard/nixpacks.toml admin-dashboard/vite.config.ts RAILWAY_ADMIN_DASHBOARD_DEPLOYMENT.md deploy-admin-dashboard.sh
git commit -m "Add Railway deployment config for admin dashboard" || echo "Nothing to commit"
git push

echo ""
echo "✅ Code pushed!"
echo ""

# Instructions for manual deployment
echo "📋 Next Steps (Manual in Railway Dashboard):"
echo ""
echo "1. Go to https://railway.app"
echo "2. Open your project (where backend is deployed)"
echo "3. Click '+ New' → 'GitHub Repo'"
echo "4. Select your repository"
echo "5. Set Root Directory to: admin-dashboard"
echo "6. Add environment variable:"
echo "   VITE_API_URL=https://your-backend.railway.app"
echo "7. Click 'Deploy'"
echo ""
echo "Or use Railway CLI:"
echo ""
echo "  cd admin-dashboard"
echo "  railway link  # Link to your existing project"
echo "  railway up    # Deploy"
echo ""
echo "📖 Full guide: RAILWAY_ADMIN_DASHBOARD_DEPLOYMENT.md"
