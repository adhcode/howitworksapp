#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "🔍 Checking notifications table in database..."
echo "Database: $DATABASE_URL"
echo ""

# Check if notifications table exists
psql "$DATABASE_URL" -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications');"

echo ""
echo "📊 Checking table structure..."
psql "$DATABASE_URL" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications' ORDER BY ordinal_position;"

echo ""
echo "📈 Checking row count..."
psql "$DATABASE_URL" -c "SELECT COUNT(*) as total_notifications FROM notifications;"
