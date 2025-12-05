#!/bin/bash

# Expo Push Notifications - Quick Start Script
# Run this to install all dependencies and get started

echo "🚀 Expo Push Notifications - Quick Start"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -d "mobile" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📱 Step 1: Installing mobile dependencies...${NC}"
cd mobile
npx expo install expo-notifications expo-device expo-constants
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Mobile dependencies installed${NC}"
else
    echo -e "${RED}❌ Mobile installation failed${NC}"
    exit 1
fi
cd ..
echo ""

echo -e "${BLUE}🔧 Step 2: Installing backend dependencies...${NC}"
cd backend
npm install expo-server-sdk
npm install --save-dev @types/expo-server-sdk
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Backend installation failed${NC}"
    exit 1
fi
cd ..
echo ""

echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo ""
echo "1. Run database migration:"
echo "   ${BLUE}cd backend && psql -U your_user -d your_database -f create_notifications_tables.sql${NC}"
echo ""
echo "2. Update mobile/app/_layout.tsx:"
echo "   ${BLUE}Add NotificationProvider wrapper (see NOTIFICATIONS_PRODUCTION_READY.md)${NC}"
echo ""
echo "3. Test on physical device:"
echo "   ${BLUE}cd mobile && npx expo run:android${NC}"
echo "   ${BLUE}cd mobile && npx expo run:ios${NC}"
echo ""
echo "4. Grant notification permissions when prompted"
echo ""
echo "5. Check console for:"
echo "   ${GREEN}✅ Got push token: ExponentPushToken[...]${NC}"
echo "   ${GREEN}✅ Push token registered with backend${NC}"
echo ""
echo -e "${BLUE}📖 Full documentation: NOTIFICATIONS_PRODUCTION_READY.md${NC}"
echo ""
echo "🎉 Happy coding!"
