#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "🚀 Running notifications tables migration..."
echo "Database: $DATABASE_URL"

# Run the migration
psql "$DATABASE_URL" -f migrations/create_notifications_tables.sql

if [ $? -eq 0 ]; then
  echo "✅ Notifications tables created successfully!"
else
  echo "❌ Migration failed!"
  exit 1
fi
