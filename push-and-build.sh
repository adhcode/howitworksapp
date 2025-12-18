#!/bin/bash

echo "🚀 Push All Changes and Build APK"
echo "=================================="
echo ""

# Step 1: Add all changes
echo "📦 Step 1: Adding all changes..."
git add .

# Step 2: Commit with message
echo ""
echo "💾 Step 2: Committing changes..."
git commit -m "Fix: TypeScript error in admin service and notification persistence

- Fixed TypeScript type error for facilitatorEmail and facilitatorPhone in admin.service.ts
- Updated notifications screen to use useFocusEffect for proper data reloading
- Added debug logging to NotificationContext for better troubleshooting
- Notifications now persist and reload correctly when screen is focused
- Added test script for notification fetching
- Documentation updates for notification fixes"

# Step 3: Push to remote
echo ""
echo "⬆️  Step 3: Pushing to remote..."
git push

# Step 4: Build APK
echo ""
echo "🔨 Step 4: Building Android APK..."
echo "This will take several minutes..."
echo ""

cd mobile

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
    echo "⚠️  EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Build APK
echo "Building APK with EAS..."
eas build --platform android --profile preview --local

echo ""
echo "✅ Done!"
echo ""
echo "📱 Your APK should be in the mobile directory"
echo "Look for a file like: build-*.apk"
