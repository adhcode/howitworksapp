#!/bin/bash

echo "🚀 Pushing All Changes to Git"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to push changes
push_directory() {
    local dir=$1
    local name=$2
    
    echo -e "${BLUE}📁 Processing $name...${NC}"
    
    if [ ! -d "$dir" ]; then
        echo -e "${YELLOW}⚠️  Directory $dir not found, skipping${NC}"
        return
    fi
    
    cd "$dir" || return
    
    # Check if it's a git repository
    if [ ! -d ".git" ]; then
        echo -e "${YELLOW}⚠️  Not a git repository, skipping${NC}"
        cd - > /dev/null
        return
    fi
    
    # Check for changes
    if [[ -z $(git status -s) ]]; then
        echo -e "${GREEN}✅ No changes to commit${NC}"
        cd - > /dev/null
        return
    fi
    
    echo "Changes detected:"
    git status -s
    echo ""
    
    # Add all changes
    git add .
    
    # Commit with message
    echo "Enter commit message for $name (or press Enter for default):"
    read -r commit_msg
    
    if [ -z "$commit_msg" ]; then
        commit_msg="feat: tenant invitation improvements and UI fixes"
    fi
    
    git commit -m "$commit_msg"
    
    # Push to remote
    echo "Pushing to remote..."
    git push
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pushed $name${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed to push $name${NC}"
        echo "You may need to pull first or resolve conflicts"
    fi
    
    echo ""
    cd - > /dev/null
}

# Main execution
echo "This script will commit and push changes for:"
echo "  1. Backend"
echo "  2. Mobile"
echo "  3. Root directory (if applicable)"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 1
fi

echo ""
echo "================================"
echo ""

# Get current directory
ROOT_DIR=$(pwd)

# Push Backend
push_directory "$ROOT_DIR/backend" "Backend"

# Push Mobile
push_directory "$ROOT_DIR/mobile" "Mobile"

# Push Root (if it's a git repo)
push_directory "$ROOT_DIR" "Root Project"

echo "================================"
echo -e "${GREEN}✅ All done!${NC}"
echo ""
echo "Summary of changes pushed:"
echo "  - Tenant invitation system improvements"
echo "  - Token viewing and cancellation features"
echo "  - Cancelled invitations handling"
echo "  - Tenant UI fixes (name display, Profile tab)"
echo "  - AAB build configuration"
echo ""
echo "Next steps:"
echo "  1. Verify changes on GitHub"
echo "  2. Deploy backend if needed"
echo "  3. Build AAB: ./build-playstore-aab.sh"
