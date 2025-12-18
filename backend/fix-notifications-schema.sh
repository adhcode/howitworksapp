#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "🔧 Fixing notifications table schema..."
echo "Database: $DATABASE_URL"
echo ""

# Run the migration
psql "$DATABASE_URL" -f migrations/fix_notifications_schema.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Schema fixed successfully!"
  echo ""
  echo "📊 Verifying new structure..."
  psql "$DATABASE_URL" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications' ORDER BY ordinal_position;"
else
  echo "❌ Migration failed!"
  exit 1
fi
