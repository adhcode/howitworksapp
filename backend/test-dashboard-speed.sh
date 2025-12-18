#!/bin/bash

# Test dashboard endpoint speed
# Usage: ./test-dashboard-speed.sh <auth-token>

if [ -z "$1" ]; then
  echo "Usage: ./test-dashboard-speed.sh <auth-token>"
  echo "Get your auth token from the mobile app or login endpoint"
  exit 1
fi

TOKEN="$1"
BACKEND_URL="http://localhost:3003"

echo "🧪 Testing dashboard endpoint speed..."
echo "Backend: $BACKEND_URL"
echo ""

# Test with time measurement
echo "⏱️  Making request..."
START=$(date +%s)

RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$BACKEND_URL/landlord/dashboard")

END=$(date +%s)
DURATION=$((END - START))

# Extract status code and time
HTTP_CODE=$(echo "$RESPONSE" | tail -n 2 | head -n 1)
TIME_TOTAL=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -2)

echo ""
echo "📊 Results:"
echo "  HTTP Status: $HTTP_CODE"
echo "  Time: ${TIME_TOTAL}s"
echo "  Duration: ${DURATION}s"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Dashboard endpoint is working!"
  echo ""
  echo "Response preview:"
  echo "$BODY" | head -n 20
else
  echo "❌ Dashboard endpoint failed!"
  echo ""
  echo "Error response:"
  echo "$BODY"
fi
