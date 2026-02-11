#!/bin/bash

echo "☁️  EAS Cloud Build - Simple & Clean"
echo "===================================="
echo ""

# Step 1: Push remaining changes
echo "📦 Step 1: Pushing app.json fix..."
git add mobile/app.json push-changes.sh build-apk.sh BUILD_INSTRUCTIONS.md eas-cloud-build.sh
git commit -m "Fix: Update app slug and add EAS cloud build script"
git push --set-upstream origin main

echo ""
echo "✅ Changes pushed!"
echo ""

# Step 2: Start cloud build
echo "☁️  Step 2: Starting EAS cloud build..."
echo "This uploads your code to EAS servers and builds there."
echo "You can close this terminal and check progress at: https://expo.dev"
echo ""

cd mobile

# Check if logged in
echo "Checking EAS login..."
if ! eas whoami &> /dev/null; then
    echo "⚠️  Not logged in to EAS. Please login:"
    eas login
fi

echo ""
echo "🚀 Starting build..."
echo "Build type: Android APK (preview profile)"
echo ""

# Start the build
eas build --platform android --profile preview

echo ""
echo "✅ Build submitted!"
echo ""
echo "📱 What happens next:"
echo "1. EAS uploads your code to their servers"
echo "2. Build runs in the cloud (5-10 minutes)"
echo "3. You'll get a download link when done"
echo "4. Download the APK from https://expo.dev/accounts/[your-account]/projects/homezy/builds"
echo ""
echo "💡 You can also check build status with: eas build:list"
