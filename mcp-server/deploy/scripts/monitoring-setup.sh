#!/bin/bash

# MCP RepairShopr Monitoring Setup Script
# Usage: ./monitoring-setup.sh [environment]

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
MONITORING_DIR="${PROJECT_ROOT}/monitoring"

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

# Create monitoring directory
create_monitoring_dir() {
    log_info "Creating monitoring directory..."
    mkdir -p "${MONITORING_DIR}"
}

# Setup Prometheus alerts
setup_prometheus_alerts() {
    log_info "Setting up Prometheus alerts..."
    
    cat > "${MONITORING_DIR}/alerts.yml" << 'EOF'
groups:
  - name: mcp_repairshopr_alerts
    interval: 30s
    rules:
      # Server health alerts
      - alert: MCPServerDown
        expr: mcp_server_health_status == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "MCP RepairShopr server is down"
          description: "MCP RepairShopr server has been down for more than 1 minute"

      - alert: MCPServerHighErrorRate
        expr: rate(mcp_server_error_count_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "MCP RepairShopr server error rate is {{ $value }} errors/sec"

      - alert: MCPServerHighResponseTime
        expr: mcp_server_average_response_time_ms > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "MCP RepairShopr server average response time is {{ $value }}ms"

      - alert: MCPServerHighMemoryUsage
        expr: mcp_server_memory_heap_used_bytes / mcp_server_memory_heap_total_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "MCP RepairShopr server memory usage is {{ $value | humanizePercentage }}"

      # Uptime alerts
      - alert: MCPServerLowUptime
        expr: mcp_server_uptime_seconds < 60
        for: 1m
        labels:
          severity: info
        annotations:
          summary: "Server recently restarted"
          description: "MCP RepairShopr server uptime is less than 1 minute"
EOF

    log_info "Prometheus alerts configured"
}

# Setup Grafana dashboards
setup_grafana_dashboards() {
    log_info "Setting up Grafana dashboards..."
    
    mkdir -p "${MONITORING_DIR}/grafana/dashboards"
    
    cat > "${MONITORING_DIR}/grafana/dashboards/mcp-repairshopr.json" << 'EOF'
{
  "dashboard": {
    "title": "MCP RepairShopr Dashboard",
    "panels": [
      {
        "title": "Server Health",
        "targets": [
          {
            "expr": "mcp_server_health_status"
          }
        ],
        "type": "stat"
      },
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(mcp_server_request_count_total[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(mcp_server_error_count_total[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Average Response Time",
        "targets": [
          {
            "expr": "mcp_server_average_response_time_ms"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Memory Usage",
        "targets": [
          {
            "expr": "mcp_server_memory_heap_used_bytes"
          },
          {
            "expr": "mcp_server_memory_heap_total_bytes"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Server Uptime",
        "targets": [
          {
            "expr": "mcp_server_uptime_seconds"
          }
        ],
        "type": "stat"
      }
    ]
  }
}
EOF

    log_info "Grafana dashboards configured"
}

# Setup log monitoring
setup_log_monitoring() {
    log_info "Setting up log monitoring..."
    
    cat > "${MONITORING_DIR}/log-monitor.sh" << 'EOF'
#!/bin/bash

# Log monitoring script for MCP RepairShopr
# Monitors log files for errors and warnings

LOG_DIR="/app/logs"
ERROR_PATTERN="ERROR"
WARN_PATTERN="WARN"

# Monitor for errors
tail -f "${LOG_DIR}/mcp-server.log" | while read line; do
    if echo "$line" | grep -q "$ERROR_PATTERN"; then
        echo "ERROR detected: $line" | logger -t mcp-repairshopr
    fi
    if echo "$line" | grep -q "$WARN_PATTERN"; then
        echo "WARN detected: $line" | logger -t mcp-repairshopr
    fi
done
EOF

    chmod +x "${MONITORING_DIR}/log-monitor.sh"
    log_info "Log monitoring configured"
}

# Setup health check monitoring
setup_health_check_monitoring() {
    log_info "Setting up health check monitoring..."
    
    cat > "${MONITORING_DIR}/health-check.sh" << 'EOF'
#!/bin/bash

# Health check monitoring script for MCP RepairShopr
# Performs periodic health checks and alerts on failures

HEALTH_URL="http://localhost:3000/health"
ALERT_EMAIL="admin@example.com"
LOG_FILE="/var/log/mcp-repairshopr/health-check.log"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    if curl -f -s "${HEALTH_URL}" > /dev/null; then
        echo "${TIMESTAMP} Health check: OK" >> "${LOG_FILE}"
    else
        echo "${TIMESTAMP} Health check: FAILED" >> "${LOG_FILE}"
        # Send alert (configure your preferred alerting method)
        # echo "MCP RepairShopr health check failed" | mail -s "Health Check Alert" "${ALERT_EMAIL}"
    fi
    
    sleep 60
done
EOF

    chmod +x "${MONITORING_DIR}/health-check.sh"
    log_info "Health check monitoring configured"
}

# Create systemd service for monitoring
create_monitoring_service() {
    log_info "Creating monitoring systemd service..."
    
    cat > /tmp/mcp-repairshopr-monitoring.service << 'EOF'
[Unit]
Description=MCP RepairShopr Monitoring Service
After=mcp-repairshopr.service

[Service]
Type=simple
User=mcpserver
WorkingDirectory=/app/monitoring
ExecStart=/app/monitoring/health-check.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    log_info "Monitoring systemd service created at /tmp/mcp-repairshopr-monitoring.service"
    log_info "To install: sudo cp /tmp/mcp-repairshopr-monitoring.service /etc/systemd/system/"
    log_info "To enable: sudo systemctl enable mcp-repairshopr-monitoring"
}

# Main execution
main() {
    log_info "Setting up monitoring for ${ENVIRONMENT} environment"
    
    create_monitoring_dir
    setup_prometheus_alerts
    setup_grafana_dashboards
    setup_log_monitoring
    setup_health_check_monitoring
    create_monitoring_service
    
    log_info "Monitoring setup completed successfully"
    log_info "Monitoring directory: ${MONITORING_DIR}"
}

# Run main function
main
