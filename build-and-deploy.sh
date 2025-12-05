#!/bin/bash

# HowitWorks - Build and Deploy Script
# Date: December 5, 2025

set -e  # Exit on error

echo "🚀 HowitWorks - Build and Deploy Script"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Git Status
echo -e "${BLUE}📋 Step 1: Checking Git Status${NC}"
git status
echo ""

# Ask user to continue
read -p "Do you want to commit and push changes? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${YELLOW}⚠️  Skipping git push${NC}"
else
    # Step 2: Add all changes
    echo -e "${BLUE}📦 Step 2: Staging Changes${NC}"
    git add .
    echo -e "${GREEN}✅ Changes staged${NC}"
    echo ""

    # Step 3: Commit
    echo -e "${BLUE}💾 Step 3: Committing Changes${NC}"
    read -p "Enter commit message (or press Enter for default): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="feat: major fixes - email notifications, payment system, tenant management"
    fi
    git commit -m "$commit_msg"
    echo -e "${GREEN}✅ Changes committed${NC}"
    echo ""

    # Step 4: Push
    echo -e "${BLUE}🚀 Step 4: Pushing to Remote${NC}"
    git push origin main
    echo -e "${GREEN}✅ Code pushed successfully${NC}"
    echo ""
fi

# Step 5: Build APK
echo -e "${BLUE}📱 Step 5: Building APK${NC}"
read -p "Do you want to build APK now? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${YELLOW}⚠️  Skipping APK build${NC}"
    echo ""
    echo -e "${GREEN}✅ Script completed!${NC}"
    exit 0
fi

# Check if in mobile directory
if [ ! -d "mobile" ]; then
    echo -e "${RED}❌ Error: mobile directory not found${NC}"
    exit 1
fi

cd mobile

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null
then
    echo -e "${YELLOW}⚠️  EAS CLI not found. Installing...${NC}"
    npm install -g eas-cli
fi

# Check if logged in
echo -e "${BLUE}🔐 Checking EAS login status${NC}"
if ! eas whoami &> /dev/null
then
    echo -e "${YELLOW}⚠️  Not logged in to EAS. Please login:${NC}"
    eas login
fi

# Select build profile
echo ""
echo "Select build profile:"
echo "1) preview (Recommended - Fast, for testing)"
echo "2) production (Optimized, for Play Store)"
read -p "Enter choice (1 or 2): " build_choice

if [ "$build_choice" = "2" ]; then
    profile="production"
else
    profile="preview"
fi

# Start build
echo ""
echo -e "${BLUE}🏗️  Starting $profile build...${NC}"
echo -e "${YELLOW}⏳ This will take 10-20 minutes${NC}"
echo ""

eas build --platform android --profile $profile

echo ""
echo -e "${GREEN}✅ Build started successfully!${NC}"
echo ""
echo "📊 Monitor your build at: https://expo.dev/accounts/[your-account]/builds"
echo "📧 You'll receive an email when the build completes"
echo ""
echo -e "${GREEN}🎉 Script completed!${NC}"
