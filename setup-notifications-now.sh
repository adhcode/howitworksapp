#!/bin/bash

echo "🚀 Setting up Notifications - Final Steps"
echo "=========================================="
echo ""

# Step 1: Install backend dependency
echo "📦 Step 1: Installing expo-server-sdk..."
cd backend
npm install expo-server-sdk
if [ $? -eq 0 ]; then
    echo "✅ Backend dependency installed"
else
    echo "❌ Failed to install backend dependency"
    exit 1
fi
echo ""

# Step 2: Run database migration
echo "🗄️  Step 2: Running database migration..."
PGPASSWORD=IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH psql -h yamanote.proxy.rlwy.net -p 34012 -U postgres -d railway -f create_notifications_tables.sql

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed"
else
    echo "⚠️  Database migration failed (you may need to run it manually)"
    echo "   See RUN_NOTIFICATION_SETUP.md for alternative methods"
fi
echo ""

cd ..

echo "✅ Setup Complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your backend: cd backend && npm run start:dev"
echo "2. Start mobile app: cd mobile && npx expo start"
echo "3. Test on physical device"
echo ""
echo "📖 See RUN_NOTIFICATION_SETUP.md for testing instructions"
