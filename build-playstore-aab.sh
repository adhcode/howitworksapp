#!/bin/bash

echo "🚀 Building AAB for Play Store"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -d "mobile" ]; then
    echo "❌ Error: mobile directory not found"
    echo "Please run this script from the project root"
    exit 1
fi

cd mobile

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found"
    echo "Installing EAS CLI..."
    npm install -g eas-cli
fi

# Check EAS login
echo "🔐 Checking EAS authentication..."
if ! eas whoami &> /dev/null; then
    echo "Please login to your Expo account:"
    eas login
fi

# Show current version
echo ""
echo "📱 Current app version:"
grep -A 2 '"version"' app.json | head -3
echo ""

# Ask for confirmation
read -p "❓ Is the version correct? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please update the version in mobile/app.json"
    echo "  - version: semantic version (e.g., 1.0.0)"
    echo "  - android.versionCode: integer (increment for each build)"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Warning: You have uncommitted changes"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please commit your changes first"
        exit 1
    fi
fi

echo ""
echo "🏗️  Starting AAB build..."
echo "This will take 10-20 minutes"
echo ""

# Build AAB
eas build --platform android --profile production

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    echo "📥 Next steps:"
    echo "1. Download the AAB file from the link above"
    echo "2. Go to https://play.google.com/console"
    echo "3. Upload the AAB to your app's production track"
    echo "4. Fill in release notes"
    echo "5. Submit for review"
    echo ""
    echo "📖 For detailed instructions, see BUILD_AAB_FOR_PLAYSTORE.md"
else
    echo ""
    echo "❌ Build failed"
    echo "Check the error messages above"
    echo "Common fixes:"
    echo "  - Clear cache: eas build --clear-cache"
    echo "  - Check app.json for errors"
    echo "  - Ensure all dependencies are installed"
fi
