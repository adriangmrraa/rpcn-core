#!/bin/bash

# Configuration
APP_NAME="rpcn-core"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Starting RPCN Deployment Pipeline..."

# 1. Pull latest code
echo "📥 Pulling latest changes from git..."
git pull origin main

# 2. Rebuild and restart containers
echo "🏗️ Building and deploying with Docker Compose..."
docker compose -f $DOCKER_COMPOSE_FILE up -d --build

# 3. Cleanup old images
echo "🧹 Cleaning up unused Docker resources..."
docker image prune -f

echo "✨ Deployment complete! RPCN is live."
