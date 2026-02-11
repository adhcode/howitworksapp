#!/bin/bash

echo "🔨 Building Android APK"
echo "======================="
echo ""

cd mobile

echo "📱 Starting EAS build..."
echo "This will take several minutes..."
echo ""

# Build APK with EAS
eas build --platform android --profile preview --local

echo ""
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "📱 Your APK should be in the mobile directory"
    echo "Look for a file like: build-*.apk"
else
    echo "❌ Build failed. Check the error messages above."
    echo ""
    echo "Common fixes:"
    echo "1. Make sure you're logged in to EAS: eas login"
    echo "2. Update EAS CLI: npm install -g eas-cli"
    echo "3. Check that all dependencies are installed in mobile/"
fi
