#!/bin/bash

echo "🚀 Pushing Changes to Git"
echo "========================="
echo ""

# Add the app.json fix
echo "📦 Adding app.json fix..."
git add mobile/app.json

# Commit
echo "💾 Committing..."
git commit -m "Fix: Update app slug to match EAS project ID"

# Push with upstream
echo "⬆️  Pushing to remote..."
git push --set-upstream origin main

echo ""
echo "✅ Changes pushed successfully!"
