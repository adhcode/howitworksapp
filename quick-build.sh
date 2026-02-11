#!/bin/bash

echo "🚀 Quick EAS Cloud Build"
echo "========================"
echo ""

# Push all changes first
echo "📦 Pushing all changes to git..."
git add .
git commit -m "Latest updates - ready for build" || echo "Nothing to commit"
git push --set-upstream origin main 2>/dev/null || git push

echo ""
echo "✅ Code pushed!"
echo ""

# Navigate to mobile
cd mobile

# Check login
echo "🔐 Checking EAS login..."
if ! eas whoami &> /dev/null; then
    echo ""
    echo "⚠️  You need to login to EAS first:"
    echo "Run: eas login"
    echo ""
    exit 1
fi

echo "✅ Logged in as: $(eas whoami)"
echo ""

# Start build
echo "☁️  Starting cloud build..."
echo ""
echo "📱 Build Profile: preview (APK for testing)"
echo "⏱️  Estimated time: 5-10 minutes"
echo "🌐 Track progress at: https://expo.dev"
echo ""

eas build --platform android --profile preview

echo ""
echo "🎉 Build submitted!"
echo ""
echo "Next steps:"
echo "1. Wait for build to complete (you'll get an email)"
echo "2. Download APK from the link provided"
echo "3. Install on your Android device"
echo ""
echo "Check status: eas build:list"
