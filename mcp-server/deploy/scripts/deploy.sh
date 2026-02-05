#!/bin/bash

# MCP RepairShopr Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Environments: production, staging, development
# Actions: deploy, rollback, status

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
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${PROJECT_ROOT}/backups/${TIMESTAMP}"
LOG_FILE="${PROJECT_ROOT}/logs/deploy_${TIMESTAMP}.log"

# Load environment variables
if [ -f "${PROJECT_ROOT}/deploy/.env.${ENVIRONMENT}" ]; then
    source "${PROJECT_ROOT}/deploy/.env.${ENVIRONMENT}"
elif [ -f "${PROJECT_ROOT}/deploy/.env" ]; then
    source "${PROJECT_ROOT}/deploy/.env"
fi

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "${LOG_FILE}"
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

# Create backup
create_backup() {
    log_info "Creating backup..."
    
    mkdir -p "${BACKUP_DIR}"
    
    # Backup dist directory
    if [ -d "${PROJECT_ROOT}/dist" ]; then
        cp -r "${PROJECT_ROOT}/dist" "${BACKUP_DIR}/"
        log_info "Backed up dist directory"
    fi
    
    # Backup config directory
    if [ -d "${PROJECT_ROOT}/config" ]; then
        cp -r "${PROJECT_ROOT}/config" "${BACKUP_DIR}/"
        log_info "Backed up config directory"
    fi
    
    # Backup data directory
    if [ -d "${PROJECT_ROOT}/data" ]; then
        cp -r "${PROJECT_ROOT}/data" "${BACKUP_DIR}/"
        log_info "Backed up data directory"
    fi
    
    # Save current version
    if [ -f "${PROJECT_ROOT}/package.json" ]; then
        cp "${PROJECT_ROOT}/package.json" "${BACKUP_DIR}/"
        log_info "Backed up package.json"
    fi
    
    log_info "Backup created at ${BACKUP_DIR}"
}

# Build application
build_app() {
    log_info "Building application..."
    
    cd "${PROJECT_ROOT}"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production
    
    # Build TypeScript
    log_info "Building TypeScript..."
    npm run build
    
    log_info "Build completed successfully"
}

# Deploy application
deploy_app() {
    log_info "Deploying to ${ENVIRONMENT}..."
    
    # Create backup
    create_backup
    
    # Build application
    build_app
    
    # Copy environment-specific config
    if [ -f "${PROJECT_ROOT}/deploy/config/${ENVIRONMENT}.json" ]; then
        cp "${PROJECT_ROOT}/deploy/config/${ENVIRONMENT}.json" "${PROJECT_ROOT}/config/default.json"
        log_info "Applied ${ENVIRONMENT} configuration"
    fi
    
    # Restart service (if using systemd)
    if command -v systemctl &> /dev/null; then
        log_info "Restarting service..."
        sudo systemctl restart mcp-repairshopr || log_warn "Failed to restart service (may not be configured)"
    fi
    
    # Health check
    log_info "Performing health check..."
    sleep 5
    
    if curl -f http://localhost:${PORT:-3000}/health &> /dev/null; then
        log_info "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
    
    log_info "Deployment completed successfully"
}

# Rollback deployment
rollback_deployment() {
    log_info "Rolling back deployment..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "${PROJECT_ROOT}/backups" | head -1)
    
    if [ -z "${LATEST_BACKUP}" ]; then
        log_error "No backup found"
        exit 1
    fi
    
    BACKUP_PATH="${PROJECT_ROOT}/backups/${LATEST_BACKUP}"
    log_info "Restoring from ${BACKUP_PATH}"
    
    # Restore dist directory
    if [ -d "${BACKUP_PATH}/dist" ]; then
        rm -rf "${PROJECT_ROOT}/dist"
        cp -r "${BACKUP_PATH}/dist" "${PROJECT_ROOT}/"
        log_info "Restored dist directory"
    fi
    
    # Restore config directory
    if [ -d "${BACKUP_PATH}/config" ]; then
        rm -rf "${PROJECT_ROOT}/config"
        cp -r "${BACKUP_PATH}/config" "${PROJECT_ROOT}/"
        log_info "Restored config directory"
    fi
    
    # Restore data directory
    if [ -d "${BACKUP_PATH}/data" ]; then
        rm -rf "${PROJECT_ROOT}/data"
        cp -r "${BACKUP_PATH}/data" "${PROJECT_ROOT}/"
        log_info "Restored data directory"
    fi
    
    # Restart service
    if command -v systemctl &> /dev/null; then
        log_info "Restarting service..."
        sudo systemctl restart mcp-repairshopr || log_warn "Failed to restart service"
    fi
    
    # Health check
    log_info "Performing health check..."
    sleep 5
    
    if curl -f http://localhost:${PORT:-3000}/health &> /dev/null; then
        log_info "Health check passed"
    else
        log_error "Health check failed after rollback"
        exit 1
    fi
    
    log_info "Rollback completed successfully"
}

# Show deployment status
show_status() {
    log_info "Deployment status for ${ENVIRONMENT}"
    
    # Check if service is running
    if command -v systemctl &> /dev/null; then
        if systemctl is-active --quiet mcp-repairshopr; then
            log_info "Service status: Running"
        else
            log_warn "Service status: Not running"
        fi
    fi
    
    # Health check
    if curl -f http://localhost:${PORT:-3000}/health &> /dev/null; then
        log_info "Health check: Healthy"
    else
        log_error "Health check: Unhealthy"
    fi
    
    # Show version
    if [ -f "${PROJECT_ROOT}/package.json" ]; then
        VERSION=$(node -p "require('${PROJECT_ROOT}/package.json').version")
        log_info "Version: ${VERSION}"
    fi
    
    # Show uptime
    if command -v systemctl &> /dev/null; then
        UPTIME=$(systemctl show mcp-repairshopr -p ActiveEnterTimestamp --value)
        log_info "Uptime since: ${UPTIME}"
    fi
}

# Main execution
main() {
    log_info "Starting ${ACTION} for ${ENVIRONMENT} environment"
    
    case "${ACTION}" in
        deploy)
            deploy_app
            ;;
        rollback)
            rollback_deployment
            ;;
        status)
            show_status
            ;;
        *)
            log_error "Unknown action: ${ACTION}"
            log_info "Usage: $0 [environment] [action]"
            log_info "Environments: production, staging, development"
            log_info "Actions: deploy, rollback, status"
            exit 1
            ;;
    esac
    
    log_info "Script completed successfully"
}

# Run main function
main
