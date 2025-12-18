#!/bin/bash

echo "🚀 Starting backend server..."
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
  echo "❌ Backend directory not found!"
  exit 1
fi

cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "❌ .env file not found! Please create it first."
  exit 1
fi

echo "✅ Starting backend in development mode..."
echo ""
echo "Backend will be available at:"
echo "  - Local: http://localhost:3003"
echo "  - Network: http://192.168.1.18:3003"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run start:dev
