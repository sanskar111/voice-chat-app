#!/bin/bash

# Supabase Database Setup Script for Voice Chat App
# This script helps you set up and configure your Supabase database

set -e  # Exit on error

echo "=========================================="
echo "Supabase Database Setup for Voice Chat App"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Prerequisites:${NC}"
echo "1. You must have created a Supabase project at https://supabase.com"
echo "2. You must have your database password"
echo ""

# Get Supabase connection details
echo -e "${GREEN}Step 1: Enter your Supabase connection details${NC}"
echo "You can find these in Supabase Dashboard → Settings → Database"
echo ""

read -p "Supabase Database Host (e.g., db.xxxxx.supabase.co): " DB_HOST
read -p "Database Password: " -s DB_PASSWORD
echo ""
read -p "Database Name (default: postgres): " DB_NAME
DB_NAME=${DB_NAME:-postgres}
DB_PORT=5432

# Construct DATABASE_URL
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo ""
echo -e "${GREEN}Step 2: Generate JWT Secret${NC}"
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "Generated JWT Secret: $JWT_SECRET"
echo ""

# Create .env file
echo -e "${GREEN}Step 3: Creating backend/.env file${NC}"
cat > backend/.env << EOF
# Supabase PostgreSQL Connection String
DATABASE_URL="${DATABASE_URL}"

# JWT Secret for authentication
JWT_SECRET="${JWT_SECRET}"

# Server Port
PORT=3000
EOF

echo -e "${GREEN}✓ Created backend/.env${NC}"
echo ""

# Run Prisma migrations
echo -e "${GREEN}Step 4: Running database migrations${NC}"
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo "Applying Prisma migrations to Supabase..."
npx prisma migrate deploy

echo ""
echo -e "${GREEN}Step 5: Generating Prisma Client${NC}"
npx prisma generate

cd ..

echo ""
echo -e "${GREEN}=========================================="
echo "✓ Supabase Database Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Your database is now ready to use!"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test your local backend: cd backend && npm run dev"
echo "2. View your database: npx prisma studio (in backend directory)"
echo "3. Monitor usage: https://supabase.com/dashboard"
echo ""
echo -e "${YELLOW}For deployment:${NC}"
echo "- See docs/DEPLOYMENT.md for full deployment guide"
echo "- Add these secrets to GitHub:"
echo "  - DATABASE_URL (the connection string)"
echo "  - JWT_SECRET ($JWT_SECRET)"
echo ""
echo -e "${YELLOW}Connection Details (save these):${NC}"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: postgres"
echo "Password: [hidden]"
echo ""
