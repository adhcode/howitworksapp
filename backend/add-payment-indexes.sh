#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "⚡ Adding payment indexes for better performance..."
echo "Database: $DATABASE_URL"
echo ""

# Run the migration
psql "$DATABASE_URL" -f migrations/add_payment_indexes.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Indexes added successfully!"
else
  echo "❌ Migration failed!"
  exit 1
fi
