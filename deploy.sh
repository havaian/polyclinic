#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting E-Polyclinic deployment process..."

# Function to check if docker compose command exists and use appropriate version
check_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        echo "docker-compose"
    else
        echo "docker compose"
    fi
}

DOCKER_COMPOSE=$(check_docker_compose)

# Build new images without affecting running containers
echo "🏗️  Building new images..."
$DOCKER_COMPOSE build

# If builds succeeded, stop and recreate containers
echo "🔄 Swapping to new containers..."
$DOCKER_COMPOSE down
$DOCKER_COMPOSE up -d --force-recreate

# Check if services are running
echo "🔍 Checking service status..."
sleep 15  # Wait for services to initialize

# Check each service with improved health check logic
check_service() {
    local service=$1
    local status=$($DOCKER_COMPOSE ps -a --format "{{.Name}},{{.Status}}" | grep "$service")
    
    if [[ -z "$status" ]]; then
        echo "❌ $service is not found"
        exit 1
    fi
    
    if [[ $status == *"(healthy)"* ]]; then
        echo "✅ $service is up and healthy"
    elif [[ $status == *"Up"* ]]; then
        echo "⚠️  $service is up but health status unknown"
    else
        echo "❌ $service failed to start properly"
        echo "Logs for $service:"
        $DOCKER_COMPOSE logs --tail=50 $service
        exit 1
    fi
}

# Check E-Polyclinic services
check_service "polyclinic_backend"
check_service "polyclinic_frontend_dev"
check_service "mongodb"
check_service "redis"
check_service "rabbitmq"
check_service "prometheus"
check_service "grafana"
check_service "loki"

# Check if backend is responding
echo "🔍 Checking backend API health..."
if curl -sf http://localhost:3333/api/health > /dev/null; then
    echo "✅ Backend API is responding"
else
    echo "❌ Backend API is not responding"
    $DOCKER_COMPOSE logs --tail=50 polyclinic_backend
    exit 1
fi

# Check if frontend is accessible
echo "🔍 Checking frontend accessibility..."
if curl -sf http://localhost:3334 > /dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "⚠️  Frontend might not be accessible"
fi

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

# Display service URLs
echo "
📋 E-Polyclinic Services:
🌐 Frontend: http://localhost:3334
🔧 Backend API: http://localhost:3333
📊 Grafana: http://localhost:3331
📈 Prometheus: http://localhost:3332
📝 RabbitMQ Management: http://localhost:3338
"

echo "🎉 E-Polyclinic deployment completed successfully!"