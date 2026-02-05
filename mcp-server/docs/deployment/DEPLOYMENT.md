# MCP RepairShopr Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Deployment Prerequisites](#deployment-prerequisites)
3. [Deployment Methods](#deployment-methods)
4. [Docker Deployment](#docker-deployment)
5. [Manual Deployment](#manual-deployment)
6. [Environment Setup](#environment-setup)
7. [Configuration Steps](#configuration-steps)
8. [Verification Steps](#verification-steps)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Overview

This guide provides step-by-step instructions for deploying the MCP RepairShopr server to production. It covers Docker deployment (recommended) and manual deployment methods.

### Deployment Options

| Method | Complexity | Scalability | Recommended For |
|--------|------------|-------------|-----------------|
| Docker | Low | High | Production environments |
| Manual | Medium | Medium | Development/custom setups |

## Deployment Prerequisites

### System Requirements

**Minimum**:
- CPU: 1 core
- RAM: 512 MB
- Disk: 100 MB
- OS: Linux, macOS, or Windows (with WSL2)

**Recommended**:
- CPU: 2 cores
- RAM: 2 GB
- Disk: 1 GB
- OS: Linux (Ubuntu 20.04+ or equivalent)

### Software Requirements

**For Docker Deployment**:
- Docker 20.10+
- Docker Compose 2.0+

**For Manual Deployment**:
- Node.js 18+
- npm 9+
- Git
- Process manager (systemd, PM2, or similar)

### Network Requirements

- Port 3000 (default) must be available
- Outbound internet access for npm packages (if building)
- Inbound access for clients (if exposed)

## Deployment Methods

### Method 1: Docker Deployment (Recommended)

Docker deployment provides:
- Isolated environment
- Easy scaling
- Consistent behavior
- Simple updates

### Method 2: Manual Deployment

Manual deployment provides:
- More control
- Custom configurations
- Direct system integration
- No Docker dependency

Choose the method that best fits your infrastructure and requirements.

## Docker Deployment

### Step 1: Prepare the Environment

1. **Install Docker** (if not already installed):

   **Ubuntu/Debian**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

   **macOS**: Download from [docker.com](https://www.docker.com/products/docker-desktop)

   **Windows**: Download from [docker.com](https://www.docker.com/products/docker-desktop)

2. **Install Docker Compose**:

   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Verify installation**:

   ```bash
   docker --version
   docker-compose --version
   ```

### Step 2: Clone the Repository

```bash
git clone https://github.com/yourusername/mcp-repairshopr.git
cd mcp-repairshopr/mcp-server
```

### Step 3: Configure Environment

1. **Copy environment template**:

   ```bash
   cp deploy/.env.example deploy/.env
   ```

2. **Edit environment file**:

   ```bash
   nano deploy/.env
   ```

3. **Configure key settings**:

   ```bash
   # Server Configuration
   SERVER_NAME=mcp-repairshopr
   SERVER_VERSION=0.1.0
   PORT=3000
   NODE_ENV=production

   # Logging Configuration
   LOG_LEVEL=info
   LOG_FORMAT=json

   # Cache Configuration
   CACHE_MAX_SIZE=10485760
   CACHE_DEFAULT_TTL=300000
   CACHE_MAX_ENTRIES=1000
   CACHE_ENABLE_WARMING=true

   # Performance Configuration
   MAX_CONCURRENT_REQUESTS=100
   REQUEST_TIMEOUT=30000
   ENABLE_METRICS=true
   ENABLE_HOT_RELOAD=false
   ```

### Step 4: Build Docker Image

```bash
cd deploy
./docker-deploy.sh production build
```

Or using Docker Compose:

```bash
docker-compose build
```

### Step 5: Deploy the Server

```bash
./docker-deploy.sh production deploy
```

Or using Docker Compose:

```bash
docker-compose up -d
```

### Step 6: Verify Deployment

1. **Check container status**:

   ```bash
   docker-compose ps
   ```

2. **Check logs**:

   ```bash
   docker-compose logs -f
   ```

3. **Test health endpoint**:

   ```bash
   curl http://localhost:3000/health
   ```

4. **Test search functionality**:

   ```bash
   curl -X POST http://localhost:3000/tools/search_api_docs \
     -H "Content-Type: application/json" \
     -d '{"query": "customer"}'
   ```

### Step 7: Configure Monitoring (Optional)

1. **Enable monitoring profile**:

   ```bash
   docker-compose --profile monitoring up -d
   ```

2. **Access Prometheus**:
   - URL: http://localhost:9090
   - View metrics and configure alerts

3. **Access Grafana**:
   - URL: http://localhost:3001
   - Default credentials: admin/admin
   - Configure dashboards

### Step 8: Set Up Reverse Proxy (Optional)

For production, set up a reverse proxy (nginx recommended):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Manual Deployment

### Step 1: Prepare the Environment

1. **Install Node.js** (if not already installed):

   **Using nvm** (recommended):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 20
   nvm use 20
   ```

   **Using apt** (Ubuntu/Debian):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Verify installation**:

   ```bash
   node --version
   npm --version
   ```

### Step 2: Clone the Repository

```bash
git clone https://github.com/yourusername/mcp-repairshopr.git
cd mcp-repairshopr/mcp-server
```

### Step 3: Install Dependencies

```bash
npm install --production
```

### Step 4: Build the Project

```bash
npm run build
```

### Step 5: Configure Environment

1. **Copy environment template**:

   ```bash
   cp deploy/.env.example .env
   ```

2. **Edit environment file**:

   ```bash
   nano .env
   ```

3. **Configure key settings**:

   ```bash
   NODE_ENV=production
   PORT=3000
   LOG_LEVEL=info
   ```

### Step 6: Create Systemd Service

1. **Create service file**:

   ```bash
   sudo nano /etc/systemd/system/mcp-repairshopr.service
   ```

2. **Add service configuration**:

   ```ini
   [Unit]
   Description=MCP RepairShopr Server
   After=network.target

   [Service]
   Type=simple
   User=mcpserver
   WorkingDirectory=/opt/mcp-repairshopr
   Environment="NODE_ENV=production"
   Environment="PORT=3000"
   ExecStart=/usr/bin/node /opt/mcp-repairshopr/dist/index.js
   Restart=always
   RestartSec=10
   StandardOutput=journal
   StandardError=journal
   SyslogIdentifier=mcp-repairshopr

   [Install]
   WantedBy=multi-user.target
   ```

3. **Create user**:

   ```bash
   sudo useradd -r -s /bin/false mcpserver
   ```

4. **Set up directories**:

   ```bash
   sudo mkdir -p /opt/mcp-repairshopr
   sudo cp -r . /opt/mcp-repairshopr/
   sudo chown -R mcpserver:mcpserver /opt/mcp-repairshopr
   ```

5. **Enable and start service**:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable mcp-repairshopr
   sudo systemctl start mcp-repairshopr
   ```

### Step 7: Verify Deployment

1. **Check service status**:

   ```bash
   sudo systemctl status mcp-repairshopr
   ```

2. **View logs**:

   ```bash
   sudo journalctl -u mcp-repairshopr -f
   ```

3. **Test health endpoint**:

   ```bash
   curl http://localhost:3000/health
   ```

4. **Test search functionality**:

   ```bash
   curl -X POST http://localhost:3000/tools/search_api_docs \
     -H "Content-Type: application/json" \
     -d '{"query": "customer"}'
   ```

## Environment Setup

### Production Environment

Configure for production:

```bash
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_HOT_RELOAD=false
ENABLE_METRICS=true
MAX_CONCURRENT_REQUESTS=100
```

### Staging Environment

Configure for staging:

```bash
NODE_ENV=staging
LOG_LEVEL=debug
LOG_FORMAT=json
ENABLE_HOT_RELOAD=true
ENABLE_METRICS=true
MAX_CONCURRENT_REQUESTS=50
```

### Development Environment

Configure for development:

```bash
NODE_ENV=development
LOG_LEVEL=debug
LOG_FORMAT=text
ENABLE_HOT_RELOAD=true
ENABLE_METRICS=true
MAX_CONCURRENT_REQUESTS=25
```

## Configuration Steps

### Step 1: Server Configuration

Edit `config/production.json`:

```json
{
  "serverName": "mcp-repairshopr",
  "serverVersion": "0.1.0",
  "port": 3000,
  "logLevel": "info",
  "logFormat": "json",
  "enableHotReload": false,
  "enableMetrics": true,
  "maxConcurrentRequests": 100,
  "requestTimeout": 30000
}
```

### Step 2: Cache Configuration

Configure cache for production:

```json
{
  "cache": {
    "maxSize": 10485760,
    "defaultTTL": 300000,
    "maxEntries": 1000,
    "enableWarming": true
  }
}
```

### Step 3: Monitoring Configuration

Enable monitoring:

```json
{
  "monitoring": {
    "enabled": true,
    "interval": 60000,
    "healthCheckInterval": 60000,
    "healthCheckTimeout": 5000
  }
}
```

### Step 4: Data Configuration

Set data directories:

```json
{
  "data": {
    "dataDir": "./data",
    "configDir": "./config",
    "metadataIndexPath": "./data/metadata-index.json"
  }
}
```

## Verification Steps

### Health Check

1. **Check health endpoint**:

   ```bash
   curl http://localhost:3000/health
   ```

2. **Expected response**:

   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "uptime": 0,
     "version": "0.1.0",
     "checks": {
       "server": true,
       "monitoring": true,
       "cache": true
     }
   }
   ```

### Functionality Check

1. **Test search**:

   ```bash
   curl -X POST http://localhost:3000/tools/search_api_docs \
     -H "Content-Type: application/json" \
     -d '{"query": "customer", "limit": 3}'
   ```

2. **Test endpoint lookup**:

   ```bash
   curl -X POST http://localhost:3000/tools/get_endpoint \
     -H "Content-Type: application/json" \
     -d '{"path": "/customers/{id}", "method": "GET"}'
   ```

3. **Test code generation**:

   ```bash
   curl -X POST http://localhost:3000/tools/generate_code_example \
     -H "Content-Type: application/json" \
     -d '{"endpoint_path": "/customers", "method": "POST", "language": "python"}'
   ```

### Performance Check

1. **Check metrics**:

   ```bash
   curl http://localhost:3000/metrics
   ```

2. **Run load test**:

   ```bash
   npm run load-test
   ```

3. **Monitor resources**:

   ```bash
   top
   free -h
   ```

## Monitoring and Maintenance

### Monitoring Setup

1. **Enable monitoring**:

   ```bash
   export MONITORING_ENABLED=true
   ```

2. **Configure Prometheus**:

   Edit `deploy/prometheus.yml`:

   ```yaml
   scrape_configs:
     - job_name: 'mcp-repairshopr'
       static_configs:
         - targets: ['localhost:3000']
       metrics_path: '/metrics'
       scrape_interval: 30s
   ```

3. **Set up alerts**:

   Create `deploy/alerts.yml`:

   ```yaml
   groups:
     - name: mcp_repairshopr
       rules:
         - alert: MCPServerDown
           expr: mcp_server_health_status == 0
           for: 1m
           annotations:
             summary: "MCP RepairShopr server is down"
   ```

### Log Management

1. **Configure log rotation**:

   Create `/etc/logrotate.d/mcp-repairshopr`:

   ```
   /opt/mcp-repairshopr/logs/*.log {
       daily
       rotate 7
       compress
       delaycompress
       missingok
       notifempty
       create 0640 mcpserver mcpserver
   }
   ```

2. **Monitor logs**:

   ```bash
   tail -f /opt/mcp-repairshopr/logs/mcp-server.log
   ```

### Backup Strategy

1. **Create backup script**:

   ```bash
   ./deploy/scripts/backup.sh production
   ```

2. **Schedule backups**:

   Add to crontab:

   ```bash
   0 2 * * * /opt/mcp-repairshopr/deploy/scripts/backup.sh production
   ```

3. **Verify backups**:

   ```bash
   ls -la /opt/mcp-repairshopr/backups/
   ```

### Update Procedure

1. **Backup current deployment**:

   ```bash
   ./deploy/scripts/backup.sh production
   ```

2. **Pull latest changes**:

   ```bash
   git pull origin main
   ```

3. **Rebuild**:

   ```bash
   npm run build
   ```

4. **Restart service**:

   ```bash
   sudo systemctl restart mcp-repairshopr
   ```

5. **Verify deployment**:

   ```bash
   curl http://localhost:3000/health
   ```

### Rollback Procedure

1. **Stop service**:

   ```bash
   sudo systemctl stop mcp-repairshopr
   ```

2. **Restore from backup**:

   ```bash
   ./deploy/scripts/deploy.sh production rollback
   ```

3. **Start service**:

   ```bash
   sudo systemctl start mcp-repairshopr
   ```

4. **Verify deployment**:

   ```bash
   curl http://localhost:3000/health
   ```

## Security Considerations

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### SSL/TLS Configuration

Use a reverse proxy with SSL/TLS:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        # ... other proxy settings
    }
}
```

### Access Control

Restrict access to sensitive endpoints:

```nginx
location /metrics {
    allow 192.168.1.0/24;
    deny all;
    proxy_pass http://localhost:3000/metrics;
}
```

## Troubleshooting

### Common Issues

1. **Server won't start**:
   - Check logs: `journalctl -u mcp-repairshopr`
   - Verify configuration
   - Check port availability

2. **Health check fails**:
   - Verify server is running
   - Check system resources
   - Review logs for errors

3. **Performance issues**:
   - Monitor metrics
   - Check system resources
   - Review cache configuration

For detailed troubleshooting, see the [Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md).

## Additional Resources

- [User Guide](../user/USER_GUIDE.md)
- [Installation Guide](../user/INSTALLATION.md)
- [Configuration Guide](../user/CONFIGURATION.md)
- [Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md)
- [FAQ](../user/FAQ.md)
