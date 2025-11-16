#!/bin/bash

set -e

echo "🚀 Setting up AI Finance Assistant..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration"
fi

# Create backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file from template..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your configuration"
fi

# Build and start Docker containers
echo "🐳 Building Docker containers..."
docker-compose build

echo "🗄️  Starting database..."
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🔧 Running database migrations..."
docker-compose exec -T postgres psql -U ${POSTGRES_USER:-finance_user} -d ${POSTGRES_DB:-finance_assistant} -f /docker-entrypoint-initdb.d/001_init_schema.sql

echo "🎯 Starting backend services..."
docker-compose up -d backend celery_worker celery_beat

echo "🎨 Starting frontend..."
docker-compose up -d frontend nginx

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Services are running at:"
echo "  - Frontend:  http://localhost:3000"
echo "  - Backend:   http://localhost:8000"
echo "  - API Docs:  http://localhost:8000/docs"
echo ""
echo "📊 To view logs: docker-compose logs -f [service]"
echo "🛑 To stop:      docker-compose down"
