#!/bin/bash

HEALTH_CHECKS_PASSED=0
HEALTH_CHECKS_FAILED=0

echo "========================================="
echo "GoldCoin - Health Check"
echo "========================================="
echo ""

# Check Docker services
echo "Checking Docker services..."
docker-compose ps | grep -E "finance_(postgres|redis|backend|frontend)" > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Docker services running"
    ((HEALTH_CHECKS_PASSED++))
else
    echo "✗ Docker services not running"
    ((HEALTH_CHECKS_FAILED++))
fi

# Check PostgreSQL
echo ""
echo "Checking PostgreSQL connection..."
docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-finance_user} > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ PostgreSQL is healthy"
    ((HEALTH_CHECKS_PASSED++))
else
    echo "✗ PostgreSQL is not responding"
    ((HEALTH_CHECKS_FAILED++))
fi

# Check Redis
echo ""
echo "Checking Redis..."
docker-compose exec -T redis redis-cli ping > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Redis is healthy"
    ((HEALTH_CHECKS_PASSED++))
else
    echo "✗ Redis is not responding"
    ((HEALTH_CHECKS_FAILED++))
fi

# Check Backend API
echo ""
echo "Checking Backend API..."
curl -s http://localhost:8000/health | grep -q "healthy"
if [ $? -eq 0 ]; then
    echo "✓ Backend API is healthy"
    ((HEALTH_CHECKS_PASSED++))
else
    echo "✗ Backend API is not responding"
    ((HEALTH_CHECKS_FAILED++))
fi

# Check Frontend
echo ""
echo "Checking Frontend..."
curl -s http://localhost:3000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Frontend is running"
    ((HEALTH_CHECKS_PASSED++))
else
    echo "✗ Frontend is not responding"
    ((HEALTH_CHECKS_FAILED++))
fi

# Database connectivity
echo ""
echo "Checking database connectivity..."
docker-compose exec -T backend python -c "from database import engine; engine.execute('SELECT 1')" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Database connectivity is healthy"
    ((HEALTH_CHECKS_PASSED++))
else
    echo "✗ Database connectivity failed"
    ((HEALTH_CHECKS_FAILED++))
fi

echo ""
echo "========================================="
echo "Health Check Summary"
echo "========================================="
echo "Passed: $HEALTH_CHECKS_PASSED"
echo "Failed: $HEALTH_CHECKS_FAILED"

if [ $HEALTH_CHECKS_FAILED -eq 0 ]; then
    echo "Status: ✓ All systems operational"
    exit 0
else
    echo "Status: ✗ Some systems need attention"
    exit 1
fi
