#!/bin/bash

# Expo Push Notifications - Database Migration Script
# This script runs the notification tables migration

echo "🗄️  Running Notification Tables Migration"
echo "=========================================="
echo ""

# Extract database credentials from .env
DB_URL=$(grep DATABASE_URL backend/.env | cut -d '=' -f2 | tr -d '"')

# Parse the connection string
# Format: postgresql://user:password@host:port/database
USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
PASSWORD=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DATABASE=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "📊 Database: $DATABASE"
echo "🌐 Host: $HOST:$PORT"
echo "👤 User: $USER"
echo ""

# Run the migration
echo "🚀 Running migration..."
PGPASSWORD=$PASSWORD psql -h $HOST -p $PORT -U $USER -d $DATABASE -f create_notifications_tables.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Tables created:"
    echo "   - push_tokens"
    echo "   - notifications"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "Please check:"
    echo "1. Database is accessible"
    echo "2. Credentials are correct"
    echo "3. SQL file exists: create_notifications_tables.sql"
    echo ""
fi
