#!/bin/bash

echo "Starting AI Finance Assistant..."
docker-compose up -d

echo "Waiting for services to start..."
sleep 5

echo ""
echo "✅ Services started!"
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend:  http://localhost:8000"
