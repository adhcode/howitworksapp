#!/bin/bash

echo "🚀 Quick Push - All Changes"
echo "==========================="
echo ""

# Default commit message
DEFAULT_MSG="feat: tenant invitation improvements, UI fixes, and AAB build setup

- Tenant invitation system with token viewing and cancellation
- Fixed cancelled invitations excluded from counts
- Fixed tenant name display in header
- Changed Settings tab to Profile
- Added AAB build configuration and scripts
- Email removed from tenant cards
- Unit availability logic improved"

echo "Commit message:"
echo "$DEFAULT_MSG"
echo ""
read -p "Use this message? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Enter your commit message:"
    read -r CUSTOM_MSG
    COMMIT_MSG="$CUSTOM_MSG"
else
    COMMIT_MSG="$DEFAULT_MSG"
fi

echo ""
echo "📝 Staging all changes..."
git add .

echo "💾 Committing..."
git commit -m "$COMMIT_MSG"

if [ $? -ne 0 ]; then
    echo "❌ Commit failed"
    exit 1
fi

echo "📤 Pushing to remote..."
git push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed all changes!"
    echo ""
    echo "Changes pushed:"
    echo "  ✓ Backend updates"
    echo "  ✓ Mobile app updates"
    echo "  ✓ Build scripts"
    echo "  ✓ Documentation"
else
    echo ""
    echo "⚠️  Push failed"
    echo "You may need to:"
    echo "  - Pull latest changes: git pull"
    echo "  - Resolve conflicts"
    echo "  - Try pushing again"
fi
