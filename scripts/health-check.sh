#!/bin/bash

# SentiBlog Health Check Script
# This script checks the health of all services

echo "🏥 SentiBlog Health Check"
echo "========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check function
check_service() {
    local service_name=$1
    local check_command=$2
    
    echo -n "Checking $service_name... "
    
    if eval $check_command > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ Unhealthy${NC}"
        return 1
    fi
}

# Overall health status
HEALTHY=true

# Check Docker services
echo "Docker Services:"
echo "---------------"
check_service "PostgreSQL" "docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U sentiblog" || HEALTHY=false
check_service "Redis" "docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping" || HEALTHY=false
check_service "Backend API" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/health | grep -q 200" || HEALTHY=false
check_service "Frontend" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 | grep -q 200" || HEALTHY=false
check_service "Nginx" "curl -s -o /dev/null -w '%{http_code}' http://localhost/health | grep -q 200" || HEALTHY=false

echo ""
echo "API Endpoints:"
echo "-------------"
check_service "Auth API" "curl -s -o /dev/null -w '%{http_code}' http://localhost/api/v1 | grep -q 200" || HEALTHY=false
check_service "Posts API" "curl -s -o /dev/null -w '%{http_code}' http://localhost/api/v1/posts | grep -q 200" || HEALTHY=false

echo ""
echo "System Resources:"
echo "----------------"
# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
echo -n "Disk Usage: "
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}$DISK_USAGE% (OK)${NC}"
else
    echo -e "${RED}$DISK_USAGE% (Warning: Low disk space)${NC}"
    HEALTHY=false
fi

# Check memory
MEMORY_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
echo -n "Memory Usage: "
if [ $MEMORY_USAGE -lt 80 ]; then
    echo -e "${GREEN}$MEMORY_USAGE% (OK)${NC}"
else
    echo -e "${RED}$MEMORY_USAGE% (Warning: High memory usage)${NC}"
    HEALTHY=false
fi

echo ""
echo "========================="
if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}✓ All systems operational!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some services need attention${NC}"
    exit 1
fi