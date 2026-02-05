#!/bin/bash

# MCP RepairShopr Backup Script
# Usage: ./backup.sh [environment]

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
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${PROJECT_ROOT}/backups/${TIMESTAMP}"
RETENTION_DAYS=30

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

# Create backup directory
create_backup_dir() {
    log_info "Creating backup directory: ${BACKUP_DIR}"
    mkdir -p "${BACKUP_DIR}"
}

# Backup application files
backup_app_files() {
    log_info "Backing up application files..."
    
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
    
    # Backup package.json
    if [ -f "${PROJECT_ROOT}/package.json" ]; then
        cp "${PROJECT_ROOT}/package.json" "${BACKUP_DIR}/"
        log_info "Backed up package.json"
    fi
}

# Backup logs
backup_logs() {
    log_info "Backing up logs..."
    
    if [ -d "${PROJECT_ROOT}/logs" ]; then
        mkdir -p "${BACKUP_DIR}/logs"
        cp -r "${PROJECT_ROOT}/logs"/* "${BACKUP_DIR}/logs/" 2>/dev/null || true
        log_info "Backed up logs"
    fi
}

# Create backup manifest
create_manifest() {
    log_info "Creating backup manifest..."
    
    cat > "${BACKUP_DIR}/MANIFEST.txt" << EOF
Backup Manifest
===============
Environment: ${ENVIRONMENT}
Timestamp: ${TIMESTAMP}
Created by: $(whoami)
Hostname: $(hostname)

Contents:
$(ls -lh "${BACKUP_DIR}")

Checksums:
EOF
    
    # Generate checksums for all files
    find "${BACKUP_DIR}" -type f -exec sha256sum {} \; >> "${BACKUP_DIR}/MANIFEST.txt"
    
    log_info "Backup manifest created"
}

# Compress backup
compress_backup() {
    log_info "Compressing backup..."
    
    cd "${PROJECT_ROOT}/backups"
    tar -czf "${TIMESTAMP}.tar.gz" "${TIMESTAMP}"
    
    # Get compressed size
    SIZE=$(du -h "${TIMESTAMP}.tar.gz" | cut -f1)
    log_info "Backup compressed: ${SIZE}"
    
    # Remove uncompressed backup
    rm -rf "${TIMESTAMP}"
}

# Clean old backups
clean_old_backups() {
    log_info "Cleaning old backups (retention: ${RETENTION_DAYS} days)..."
    
    find "${PROJECT_ROOT}/backups" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete
    
    # Count remaining backups
    COUNT=$(find "${PROJECT_ROOT}/backups" -name "*.tar.gz" | wc -l)
    log_info "Remaining backups: ${COUNT}"
}

# Main execution
main() {
    log_info "Starting backup for ${ENVIRONMENT} environment"
    
    create_backup_dir
    backup_app_files
    backup_logs
    create_manifest
    compress_backup
    clean_old_backups
    
    log_info "Backup completed successfully: ${PROJECT_ROOT}/backups/${TIMESTAMP}.tar.gz"
}

# Run main function
main
