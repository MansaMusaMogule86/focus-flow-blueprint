#!/bin/bash
# Vitality Antigravity - Database Setup Script
# Run this script to initialize the PostgreSQL database

set -e

echo "🔧 Vitality Antigravity - Database Setup"
echo "========================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set it in server/.env file"
    exit 1
fi

echo "✅ DATABASE_URL found"

# Run schema migration
echo ""
echo "📋 Step 1: Creating database schema..."
psql "$DATABASE_URL" -f database/schema.sql

echo "✅ Schema created successfully"

# Run seed data
echo ""
echo "🌱 Step 2: Seeding database with demo user..."
psql "$DATABASE_URL" -f database/seed.sql

echo "✅ Seed data inserted"

# Generate Prisma client
echo ""
echo "⚙️  Step 3: Generating Prisma client..."
npx prisma generate

echo "✅ Prisma client generated"

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Demo User Credentials:"
echo "  Email: demo@vitality.ai"
echo "  Password: password123"
echo ""
echo "Next steps:"
echo "  1. cd server"
echo "  2. npm run dev"
echo "  3. Open http://localhost:3001/api/health"
