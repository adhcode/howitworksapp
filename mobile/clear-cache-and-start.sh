#!/bin/bash

echo "🧹 Clearing Metro bundler cache..."

# Clear Metro cache
rm -rf node_modules/.cache

# Clear Expo cache
rm -rf .expo

# Clear watchman cache (if available)
if command -v watchman &> /dev/null; then
    echo "🧹 Clearing watchman cache..."
    watchman watch-del-all
fi

echo "✅ Cache cleared!"
echo "🚀 Starting Expo with clean cache..."

# Start Expo with clear cache flag
npx expo start -c
