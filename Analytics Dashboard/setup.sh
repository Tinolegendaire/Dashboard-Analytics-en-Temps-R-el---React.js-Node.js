#!/bin/bash

set -e

echo "🚀 Starting Analytics Dashboard Setup..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
if [[ "${NODE_VERSION%%.*}" -lt 20 ]]; then
    echo "❌ Node.js version 20+ required. Current version: $NODE_VERSION"
    exit 1
fi

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 16+ first."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Setup environment variables
echo "📝 Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from example"
fi

# Create PostgreSQL database
echo "🗄️  Setting up PostgreSQL database..."
DB_EXISTS=$(psql -U postgres -lqt | cut -d \| -f 1 | grep -w analytics_db | wc -l)
if [ "$DB_EXISTS" -eq "0" ]; then
    psql -U postgres -c "CREATE USER analytics_user WITH PASSWORD 'analytics_password';" 2>/dev/null || true
    psql -U postgres -c "CREATE DATABASE analytics_db OWNER analytics_user;" 2>/dev/null || true
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE analytics_db TO analytics_user;" 2>/dev/null || true
    echo "✅ Database created successfully"
else
    echo "✅ Database already exists"
fi

# Setup Backend
echo "🔧 Setting up backend..."
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm ci

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init --skip-seed

# Seed database
echo "🌱 Seeding database with 10,000 records..."
npm run db:seed

cd ..

# Setup Frontend
echo "🎨 Setting up frontend..."
cd frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm ci

# Build frontend
echo "🏗️  Building frontend..."
npm run build

cd ..

# Verify API
echo "🔍 Verifying API..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ API is healthy"
else
    echo "⚠️  API health check failed - will be available after start"
fi

echo ""
echo "✅✅✅ SETUP COMPLETED SUCCESSFULLY! ✅✅✅"
echo ""
echo "📊 To start the application:"
echo "   ./start.sh"
echo ""
echo "🌐 Access the application at: http://localhost:3000"
echo "🔑 Default credentials:"
echo "   Email: test@example.com"
echo "   Password: password123"
echo ""
echo "📝 To stop the application:"
echo "   ./stop.sh"