#!/bin/bash
# Continue moving backend files

echo "Moving remaining backend folders..."
mv migrations backend/ 2>/dev/null
mv scripts backend/ 2>/dev/null
mv test backend/ 2>/dev/null
mv docker backend/ 2>/dev/null

echo "Moving backend config files..."
mv .dockerignore backend/ 2>/dev/null
mv .env.example backend/ 2>/dev/null
mv .env.performance backend/ 2>/dev/null
mv .prettierrc backend/ 2>/dev/null
mv .railwayignore backend/ 2>/dev/null
mv drizzle.config.* backend/ 2>/dev/null
mv eslint.config.mjs backend/ 2>/dev/null
mv nest-cli.json backend/ 2>/dev/null
mv nixpacks.toml backend/ 2>/dev/null
mv package.json backend/ 2>/dev/null
mv package-lock.json backend/ 2>/dev/null
mv railway.toml backend/ 2>/dev/null
mv tsconfig.json backend/ 2>/dev/null
mv tsconfig.build.json backend/ 2>/dev/null

echo "Moving SQL files..."
mv *.sql backend/ 2>/dev/null

echo "Moving utility TypeScript files..."
mv create-admin-user.ts backend/ 2>/dev/null
mv create-admin.ts backend/ 2>/dev/null
mv verify-admin.ts backend/ 2>/dev/null
mv verify-database-schema.ts backend/ 2>/dev/null

echo "Moving backend docs..."
mv README_REFACTOR.md backend/ 2>/dev/null
mv PAYMENT_BACKEND_COMPLETE.md backend/ 2>/dev/null

echo "Cleaning up build artifacts..."
rm -rf dist "dist 2" "dist 3" 2>/dev/null
rm -f tsconfig.build.tsbuildinfo 2>/dev/null

echo "Done! Check the results."
