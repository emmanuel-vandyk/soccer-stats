#!/bin/bash

# ============================================
# QUICK START SCRIPT - Soccer Stats Backend
# ============================================

echo "🚀 Starting Soccer Stats Backend Services..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install it first."
    exit 1
fi

echo "📦 Starting MySQL and Redis with Docker..."
docker-compose up -d mysql redis

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check MySQL
if docker ps | grep -q soccer_stats_db; then
    echo "✅ MySQL is running on port 3307"
else
    echo "❌ MySQL failed to start"
fi

# Check Redis
if docker ps | grep -q soccer_stats_redis; then
    echo "✅ Redis is running on port 6379"
else
    echo "❌ Redis failed to start"
fi

echo ""
echo "🔍 Service Status:"
docker ps --filter "name=soccer_stats" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📝 Next steps:"
echo "   1. Run: bun run dev"
echo "   2. API will be available at http://localhost:3000"
echo "   3. Check logs: docker logs soccer_stats_redis"
echo "   4. Stop services: docker-compose down"
echo ""
echo "💡 To connect to Redis CLI:"
echo "   docker exec -it soccer_stats_redis redis-cli"
echo ""
echo "🎉 Ready to develop!"
