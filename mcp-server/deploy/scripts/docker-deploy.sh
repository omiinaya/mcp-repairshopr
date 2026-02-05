#!/bin/bash

# MCP RepairShopr Docker Deployment Script
# Usage: ./docker-deploy.sh [environment] [action]
# Environments: production, staging, development
# Actions: build, deploy, stop, restart, logs, status

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-production}"
ACTION="${2:-deploy}"
COMPOSE_FILE="${PROJECT_ROOT}/deploy/docker-compose.yml"
ENV_FILE="${PROJECT_ROOT}/deploy/.env.${ENVIRONMENT}"

# Default values (can be overridden by environment file)
IMAGE_NAME="${IMAGE_NAME:-mcp-repairshopr}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
CONTAINER_NAME="${CONTAINER_NAME:-mcp-repairshopr-server}"

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}"
}

log_info() {
    log "INFO" "${GREEN}$@${NC}"
}

log_warn() {
    log "WARN" "${YELLOW}$@${NC}"
}

log_error() {
    log "ERROR" "${RED}$@${NC}"
}

# Load environment file
load_env() {
    if [ -f "${ENV_FILE}" ]; then
        log_info "Loading environment from ${ENV_FILE}"
        export $(cat "${ENV_FILE}" | grep -v '^#' | xargs)
    else
        log_warn "Environment file not found: ${ENV_FILE}"
        log_warn "Using default environment variables"
    fi
}

# Build Docker image
build_image() {
    log_info "Building Docker image for ${ENVIRONMENT}..."
    
    cd "${PROJECT_ROOT}"
    
    # Build with environment-specific tag
    docker build \
        -f deploy/Dockerfile \
        -t "${IMAGE_NAME}:${IMAGE_TAG}" \
        -t "${IMAGE_NAME}:${ENVIRONMENT}" \
        --build-arg NODE_ENV="${ENVIRONMENT}" \
        .
    
    log_info "Docker image built successfully: ${IMAGE_NAME}:${IMAGE_TAG}"
}

# Deploy using Docker Compose
deploy_compose() {
    log_info "Deploying to ${ENVIRONMENT} using Docker Compose..."
    
    load_env
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f "${COMPOSE_FILE}" down || true
    
    # Pull latest images (if any)
    log_info "Pulling latest images..."
    docker-compose -f "${COMPOSE_FILE}" pull || true
    
    # Build and start containers
    log_info "Building and starting containers..."
    docker-compose -f "${COMPOSE_FILE}" up -d --build
    
    # Wait for health check
    log_info "Waiting for health check..."
    sleep 10
    
    # Check container status
    if docker-compose -f "${COMPOSE_FILE}" ps | grep -q "Up"; then
        log_info "Deployment completed successfully"
    else
        log_error "Deployment failed - container not running"
        docker-compose -f "${COMPOSE_FILE}" logs
        exit 1
    fi
}

# Stop containers
stop_containers() {
    log_info "Stopping containers..."
    docker-compose -f "${COMPOSE_FILE}" down
    log_info "Containers stopped"
}

# Restart containers
restart_containers() {
    log_info "Restarting containers..."
    docker-compose -f "${COMPOSE_FILE}" restart
    log_info "Containers restarted"
}

# Show logs
show_logs() {
    log_info "Showing logs (press Ctrl+C to exit)..."
    docker-compose -f "${COMPOSE_FILE}" logs -f
}

# Show status
show_status() {
    log_info "Container status for ${ENVIRONMENT}"
    
    docker-compose -f "${COMPOSE_FILE}" ps
    
    # Health check
    if curl -f http://localhost:${PORT:-3000}/health &> /dev/null; then
        log_info "Health check: Healthy"
    else
        log_error "Health check: Unhealthy"
    fi
    
    # Show container stats
    log_info "Container stats:"
    docker stats --no-stream $(docker-compose -f "${COMPOSE_FILE}" ps -q)
}

# Clean up old images
cleanup_images() {
    log_info "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old versions (keep last 3)
    docker images "${IMAGE_NAME}" --format "{{.Tag}}" | \
        tail -n +4 | \
        xargs -I {} docker rmi "${IMAGE_NAME}:{}" 2>/dev/null || true
    
    log_info "Cleanup completed"
}

# Backup container data
backup_container_data() {
    log_info "Backing up container data..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="${PROJECT_ROOT}/backups/docker/${TIMESTAMP}"
    
    mkdir -p "${BACKUP_DIR}"
    
    # Backup volumes
    docker run --rm \
        -v mcp-repairshopr-data:/data \
        -v "${BACKUP_DIR}:/backup" \
        alpine tar czf /backup/data.tar.gz -C /data .
    
    log_info "Backup completed: ${BACKUP_DIR}/data.tar.gz"
}

# Main execution
main() {
    log_info "Starting ${ACTION} for ${ENVIRONMENT} environment"
    
    case "${ACTION}" in
        build)
            build_image
            ;;
        deploy)
            deploy_compose
            ;;
        stop)
            stop_containers
            ;;
        restart)
            restart_containers
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        cleanup)
            cleanup_images
            ;;
        backup)
            backup_container_data
            ;;
        *)
            log_error "Unknown action: ${ACTION}"
            log_info "Usage: $0 [environment] [action]"
            log_info "Environments: production, staging, development"
            log_info "Actions: build, deploy, stop, restart, logs, status, cleanup, backup"
            exit 1
            ;;
    esac
    
    log_info "Script completed successfully"
}

# Run main function
main
