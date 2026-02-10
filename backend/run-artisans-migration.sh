#!/bin/bash

# Run Artisans Table Migration

echo "🔧 Creating artisans table..."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep DATABASE_URL | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in .env file"
  exit 1
fi

# Run migration using DATABASE_URL
psql "$DATABASE_URL" -f migrations/create_artisans_table.sql

if [ $? -eq 0 ]; then
  echo "✅ Artisans table created successfully!"
else
  echo "❌ Migration failed!"
  exit 1
fi
