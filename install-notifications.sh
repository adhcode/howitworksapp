#!/bin/bash

echo "🚀 Installing Expo Push Notifications"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Mobile dependencies
echo -e "${BLUE}📱 Installing mobile dependencies...${NC}"
cd mobile
npx expo install expo-notifications expo-device expo-constants
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Mobile dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Mobile installation had issues${NC}"
fi
cd ..
echo ""

# Backend dependencies
echo -e "${BLUE}🔧 Installing backend dependencies...${NC}"
cd backend
npm install expo-server-sdk
npm install --save-dev @types/expo-server-sdk
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend installation had issues${NC}"
fi
cd ..
echo ""

echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Create database tables (see INSTALL_NOTIFICATIONS.md)"
echo "2. Create backend notifications module"
echo "3. Update mobile/app/_layout.tsx with NotificationProvider"
echo "4. Test on physical device"
echo ""
echo "📖 See NOTIFICATIONS_READY_TO_IMPLEMENT.md for detailed instructions"
