#!/bin/bash

echo "🏥 Testing backend health..."
echo ""

# Test local backend
echo "1️⃣ Testing local backend (http://192.168.1.18:3003)..."
LOCAL_RESPONSE=$(curl -s -w "\n%{http_code}" --connect-timeout 5 http://192.168.1.18:3003/health 2>&1)
LOCAL_CODE=$(echo "$LOCAL_RESPONSE" | tail -n 1)

if [ "$LOCAL_CODE" = "200" ]; then
  echo "✅ Local backend is UP and responding"
  echo "Response: $(echo "$LOCAL_RESPONSE" | head -n -1)"
else
  echo "❌ Local backend is DOWN or not responding"
  echo "Error: $LOCAL_RESPONSE"
fi

echo ""

# Test production backend
echo "2️⃣ Testing production backend (Railway)..."
PROD_RESPONSE=$(curl -s -w "\n%{http_code}" --connect-timeout 5 https://howitworksapp-production.up.railway.app/health 2>&1)
PROD_CODE=$(echo "$PROD_RESPONSE" | tail -n 1)

if [ "$PROD_CODE" = "200" ]; then
  echo "✅ Production backend is UP and responding"
  echo "Response: $(echo "$PROD_RESPONSE" | head -n -1)"
else
  echo "❌ Production backend is DOWN or not responding"
  echo "Error: $PROD_RESPONSE"
fi

echo ""
echo "📋 Summary:"
echo "  Local: $([ "$LOCAL_CODE" = "200" ] && echo "✅ UP" || echo "❌ DOWN")"
echo "  Production: $([ "$PROD_CODE" = "200" ] && echo "✅ UP" || echo "❌ DOWN")"
echo ""

if [ "$LOCAL_CODE" != "200" ] && [ "$PROD_CODE" != "200" ]; then
  echo "⚠️  Both backends are down! Please start the backend server:"
  echo "   cd backend && npm run start:dev"
fi
