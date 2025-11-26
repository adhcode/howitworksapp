#!/bin/bash
# Script to restructure the repository safely

echo "Starting repository restructure..."

# Backend core folders
echo "Moving backend folders..."
mv src backend/
mv config backend/
mv migrations backend/
mv scripts backend/
mv test backend/
mv docker backend/

# Backend config files
echo "Moving backend config files..."
mv .dockerignore backend/
mv .env.example backend/
mv .env.performance backend/
mv .prettierrc backend/
mv .railwayignore backend/
mv drizzle.config.* backend/
mv eslint.config.mjs backend/
mv nest-cli.json backend/
mv nixpacks.toml backend/
mv package.json backend/
mv package-lock.json backend/
mv railway.toml backend/
mv tsconfig.json backend/
mv tsconfig.build.json backend/

# Backend SQL and utility scripts
echo "Moving backend SQL and utility files..."
mv *.sql backend/ 2>/dev/null || true
mv *.ts backend/ 2>/dev/null || true
mv *.sh backend/ 2>/dev/null || true

# Backend documentation (keep some at root)
echo "Moving backend-specific docs..."
mv README_REFACTOR.md backend/ 2>/dev/null || true
mv PAYMENT_BACKEND_COMPLETE.md backend/ 2>/dev/null || true

# Keep these at root level (monorepo docs)
# - README.md (main repo readme)
# - ADMIN_DASHBOARD_SETUP.md
# - PRODUCTION_MIGRATION_COMPLETE.md
# - etc.

# Clean up build artifacts (shouldn't be committed anyway)
echo "Removing build artifacts..."
rm -rf dist dist\ 2 dist\ 3 2>/dev/null || true
rm -f tsconfig.build.tsbuildinfo 2>/dev/null || true

echo "Restructure complete!"
echo ""
echo "Next steps:"
echo "1. Review changes with: git status"
echo "2. Check backend folder: ls -la backend/"
echo "3. Verify mobile and admin-dashboard are untouched"
