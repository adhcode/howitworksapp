#!/bin/bash

# Quick Wins Installation Script
# This script installs dependencies and starts the admin dashboard

echo "🚀 Installing Quick Wins Improvements..."
echo ""

# Navigate to admin-dashboard directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies (recharts, react-hot-toast)..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "📊 Quick Wins Features Added:"
    echo "  ✓ Toast Notifications"
    echo "  ✓ Loading Skeletons"
    echo "  ✓ Interactive Charts (Line, Bar, Pie)"
    echo "  ✓ Enhanced Dashboard"
    echo "  ✓ Better UX/UI"
    echo ""
    echo "🎯 Starting development server..."
    echo ""
    npm run dev
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
