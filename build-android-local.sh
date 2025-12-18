#!/bin/bash

# Quick Android Build Script

set -e

echo "🚀 Starting local Android build..."
echo ""

# Set environment variables for this session
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

echo "✓ Environment variables set"
echo "  ANDROID_HOME: $ANDROID_HOME"
echo "  JAVA_HOME: $JAVA_HOME"
echo ""

# Navigate to android directory
cd mobile/android

echo "🧹 Cleaning previous builds..."
./gradlew clean

echo ""
echo "🔨 Building debug APK..."
./gradlew assembleDebug

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 APK location:"
echo "   mobile/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To install on device:"
echo "   adb install app/build/outputs/apk/debug/app-debug.apk"
