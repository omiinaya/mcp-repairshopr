# Coolify Deployment Checklist for MCP RepairShopr Server

This comprehensive checklist ensures successful deployment of the MCP RepairShopr Server on Coolify.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Coolify Configuration](#coolify-configuration)
3. [Environment Variables](#environment-variables)
4. [Health Check Configuration](#health-check-configuration)
5. [Resource Requirements](#resource-requirements)
6. [Deployment Steps](#deployment-steps)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)
9. [Security Checklist](#security-checklist)
10. [Maintenance](#maintenance)

---

## Pre-Deployment Checklist

### Repository Preparation

- [ ] **Git Repository**: Ensure the repository is accessible and contains the latest code
- [ ] **Branch Selection**: Identify the correct branch for deployment (main, develop, or release branch)
- [ ] **Deploy Directory**: Verify `mcp-server/deploy/` directory exists with required files:
  - [ ] `docker-compose.coolify.yml`
  - [ ] `Dockerfile`
  - [ ] `.env.example`
  - [ ] `config/production.json`

### Code Verification

- [ ] **Build Success**: Confirm the project builds successfully locally
  ```bash
  cd mcp-server
  npm install
  npm run build
  ```
- [ ] **Tests Pass**: Run unit tests to ensure code quality
  ```bash
  npm test
  ```
- [ ] **TypeScript Compilation**: Verify no TypeScript errors
  ```bash
  npm run build
  ```

### Data Preparation

- [ ] **Metadata Index**: Ensure `data/metadata-index.json` exists and is populated
- [ ] **Configuration Files**: Verify `config/default.json` and `config/schema.json` are present
- [ ] **API Documentation**: Confirm API docs are parsed and indexed

---

## Coolify Configuration

### Resource Creation

1. **Log in to Coolify Dashboard**
   - Access your Coolify instance at `https://your-coolify-domain.com`
   - Ensure you have administrative privileges

2. **Create New Resource**
   - Click "Add New Resource"
   - Select "Docker Compose" as the resource type

3. **Configure Resource Settings**

   | Setting | Value | Notes |
   |---------|-------|-------|
   | Name | `mcp-repairshopr` | Unique identifier |
   | Type | Docker Compose | Resource type |
   | Source | Git Repository | Code source |
   | Repository | Your fork URL | HTTPS or SSH |
   | Branch | `main` | Deployment branch |
   | Path | `mcp-server/deploy` | Docker compose location |
   | Config File | `docker-compose.coolify.yml` | Compose file name |

### Port Configuration

- [ ] **Dynamic Port**: Coolify automatically assigns a dynamic port
- [ ] **Port Mapping**: Verify `docker-compose.coolify.yml` uses `${PORT:-3000}` syntax
- [ ] **Expose Port**: Ensure Dockerfile exposes port 3000

### Network Configuration

- [ ] **Network Mode**: Bridge network is configured
- [ ] **Firewall Rules**: Outbound access allowed for Git operations
- [ ] **Inbound Rules**: Health check endpoint accessible

---

## Environment Variables

### Required Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `SERVER_NAME` | `mcp-repairshopr` | Yes | Server instance name |
| `SERVER_VERSION` | `0.1.0` | Yes | Server version |
| `PORT` | `3000` | Yes | Port (Coolify overrides) |
| `NODE_ENV` | `production` | Yes | Environment mode |

### Optional Variables

#### Logging

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `info` | Log verbosity level |
| `LOG_FORMAT` | `json` | Log output format |

#### Cache

| Variable | Default | Description |
|----------|---------|-------------|
| `CACHE_MAX_SIZE` | `10485760` | Max cache size in bytes |
| `CACHE_DEFAULT_TTL` | `300000` | Cache TTL in milliseconds |
| `CACHE_MAX_ENTRIES` | `1000` | Max cache entries |
| `CACHE_ENABLE_WARMING` | `true` | Enable cache warming |

#### Performance

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_CONCURRENT_REQUESTS` | `100` | Max concurrent requests |
| `REQUEST_TIMEOUT` | `30000` | Request timeout in ms |
| `ENABLE_METRICS` | `true` | Enable metrics collection |
| `ENABLE_HOT_RELOAD` | `false` | Enable config hot-reload |

#### Resources (Coolify-specific)

| Variable | Default | Description |
|----------|---------|-------------|
| `CPU_LIMIT` | `1.0` | Max CPU cores |
| `MEMORY_LIMIT` | `512M` | Max memory |
| `CPU_RESERVATION` | `0.5` | Reserved CPU |
| `MEMORY_RESERVATION` | `256M` | Reserved memory |

### Environment Setup in Coolify

1. Navigate to Resource Configuration
2. Find "Environment Variables" section
3. Add variables in the following order:
   - Required variables first
   - Optional variables grouped by category
   - Resource limits at the end
4. Save configuration

---

## Health Check Configuration

### Coolify Health Check Settings

| Setting | Value | Description |
|---------|-------|-------------|
| Type | HTTP | Protocol for health checks |
| Endpoint | `/health` | Health check endpoint |
| Interval | `30s` | Time between checks |
| Timeout | `10s` | Response timeout |
| Retries | `3` | Failed attempts before restart |
| Start Period | `15s` | Initial grace period |

### Available Health Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/health` | Full health check | 200 if healthy, 503 if unhealthy |
| `/ready` | Readiness check | 200 if ready to accept traffic |
| `/live` | Liveness check | 200 if process is running |
| `/metrics` | Prometheus metrics | Prometheus format metrics |

### Health Check Response Example

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "0.1.0",
  "checks": {
    "server": true,
    "monitoring": true,
    "cache": true
  },
  "metrics": {
    "requestCount": 1000,
    "errorCount": 5,
    "averageResponseTime": 150,
    "memoryUsage": {
      "heapUsed": 50000000,
      "heapTotal": 100000000,
      "external": 10000000,
      "rss": 120000000
    }
  }
}
```

---

## Resource Requirements

### Minimum Requirements

| Resource | Minimum | Recommended | Description |
|----------|---------|-------------|-------------|
| CPU | 0.5 cores | 1.0 core | Processing power |
| Memory | 256 MB | 512 MB | RAM allocation |
| Storage | 100 MB | 200 MB | Disk space for logs/data |
| Network | 10 Mbps | 100 Mbps | Bandwidth |

### Recommended Configuration

For production deployments:

- **CPU**: 1.0 core with burst capability
- **Memory**: 512 MB (1 GB recommended for high load)
- **Storage**: 200 MB minimum (500 MB recommended)
- **Network**: Stable connection with low latency

### Resource Limits Configuration

In Coolify resource settings:

1. Navigate to "Resources" section
2. Set limits:
   - CPU Limit: `1.0`
   - Memory Limit: `512M`
3. Set reservations:
   - CPU Reservation: `0.5`
   - Memory Reservation: `256M`

---

## Deployment Steps

### Step 1: Prepare Repository

```bash
# Clone repository (if not already done)
git clone <repository-url>
cd mcp-repairshopr

# Checkout deployment branch
git checkout main

# Pull latest changes
git pull origin main
```

### Step 2: Create Resource in Coolify

1. Log in to Coolify dashboard
2. Click "Add New Resource"
3. Select "Docker Compose"
4. Configure:
   - Repository: `<your-repo-url>`
   - Branch: `main`
   - Path: `mcp-server/deploy`
   - Config File: `docker-compose.coolify.yml`

### Step 3: Configure Environment Variables

1. In resource configuration, find "Environment Variables"
2. Add required variables:
   ```
   SERVER_NAME=mcp-repairshopr
   SERVER_VERSION=0.1.0
   NODE_ENV=production
   ```
3. Add optional variables as needed
4. Save configuration

### Step 4: Configure Health Check

1. Find "Health Check" section
2. Configure:
   - Type: HTTP
   - Endpoint: `/health`
   - Interval: 30s
   - Timeout: 10s
   - Retries: 3
   - Start Period: 15s

### Step 5: Configure Resource Limits

1. Find "Resources" section
2. Set CPU and memory limits
3. Save configuration

### Step 6: Deploy

1. Click "Deploy" button
2. Monitor deployment logs
3. Wait for health check to pass

### Step 7: Verify Deployment

```bash
# Test health endpoint
curl http://<coolify-ip>:<port>/health

# Test readiness
curl http://<coolify-ip>:<port>/ready

# Check metrics
curl http://<coolify-ip>:<port>/metrics
```

---

## Post-Deployment Verification

### Functional Tests

- [ ] Health endpoint returns 200
- [ ] Readiness endpoint returns 200
- [ ] Server accepts MCP protocol connections
- [ ] Search functionality works correctly
- [ ] All tools are registered and accessible

### Performance Tests

- [ ] Response time < 500ms for typical queries
- [ ] Concurrent requests handled correctly
- [ ] Memory usage within limits
- [ ] No memory leaks detected

### Log Verification

- [ ] Logs are being generated
- [ ] Log level is appropriate
- [ ] No error messages in logs
- [ ] JSON format is correct

### Monitoring Verification

- [ ] Metrics are being collected
- [ ] Prometheus endpoint accessible
- [ ] Monitoring data is accurate
- [ ] Alerts configured (if needed)

---

## Troubleshooting

### Container Fails to Start

**Symptoms:**
- Container exits immediately
- Health check fails repeatedly
- No logs generated

**Solutions:**
1. Check logs for startup errors
2. Verify environment variables are set
3. Ensure port is not already in use
4. Verify Docker image builds successfully
5. Check file permissions on mounted volumes

```bash
# View container logs
coolify logs <resource-id>

# Check Docker build locally
cd mcp-server/deploy
docker build -t mcp-repairshopr-test .
```

### Health Check Fails

**Symptoms:**
- Health check returns 503
- Container restarts repeatedly
- Health endpoint not responding

**Solutions:**
1. Verify server started successfully
2. Check if `/health` endpoint is accessible
3. Verify memory and CPU usage
4. Check application logs for errors
5. Ensure PORT environment variable is set

```bash
# Test health endpoint locally
curl http://localhost:3000/health

# Check container health status
coolify status <resource-id>
```

### High Memory Usage

**Symptoms:**
- Container killed by OOM
- Slow response times
- Swap usage high

**Solutions:**
1. Reduce `CACHE_MAX_SIZE` in environment
2. Lower `MAX_CONCURRENT_REQUESTS`
3. Increase memory limit in resource config
4. Enable garbage collection logging

```bash
# Monitor memory usage
coolify stats <resource-id>

# Adjust cache settings
CACHE_MAX_SIZE=5242880  # 5MB
CACHE_MAX_ENTRIES=500
```

### High CPU Usage

**Symptoms:**
- CPU usage consistently at 100%
- Slow response times
- Process throttling

**Solutions:**
1. Reduce `MAX_CONCURRENT_REQUESTS`
2. Increase CPU limit
3. Check for infinite loops in logs
4. Optimize cache settings

```bash
# Monitor CPU usage
coolify stats <resource-id>

# Adjust performance settings
MAX_CONCURRENT_REQUESTS=50
```

### Network Issues

**Symptoms:**
- Cannot connect to server
- Timeouts on requests
- Port not accessible

**Solutions:**
1. Verify port mapping in Coolify
2. Check firewall rules
3. Ensure network mode is correct
4. Verify DNS resolution

```bash
# Test network connectivity
curl -v http://<coolify-ip>:<port>/health

# Check port binding
coolify exec <resource-id> netstat -tulpn
```

---

## Security Checklist

### Container Security

- [ ] Non-root user configured in Dockerfile
- [ ] Minimal base image used (Alpine)
- [ ] No unnecessary packages installed
- [ ] Secrets managed through Coolify
- [ ] Read-only volumes where possible

### Network Security

- [ ] HTTPS configured (if public)
- [ ] Firewall rules configured
- [ ] No exposed sensitive ports
- [ ] Internal network isolation

### Application Security

- [ ] `NODE_ENV=production` set
- [ ] Logging level appropriate
- [ ] No debug endpoints exposed
- [ ] Input validation enabled
- [ ] Error messages sanitized

### Operational Security

- [ ] Regular backups configured
- [ ] Log rotation enabled
- [ ] Monitoring and alerting active
- [ ] Update process documented
- [ ] Access controls configured

---

## Maintenance

### Regular Tasks

| Task | Frequency | Notes |
|------|-----------|-------|
| Check logs | Daily | Review for errors |
| Monitor metrics | Daily | Track performance |
| Update dependencies | Weekly | Security patches |
| Review resource usage | Weekly | Adjust limits |
| Backup configuration | Monthly | Document changes |

### Updates and Rollbacks

#### Update Process

1. Make changes in repository
2. Push to deployment branch
3. Coolify auto-detects changes
4. Review deployment preview
5. Confirm deployment
6. Verify functionality
7. Monitor for issues

#### Rollback Process

1. Navigate to resource
2. Click "Actions" > "Rollback"
2. Select previous version
3. Confirm rollback
4. Verify functionality
5. Investigate issue

### Backup and Recovery

#### Configuration Backup

```bash
# Export Coolify resource configuration
coolify export <resource-id> > backup.json

# Backup environment variables
coolify env export <resource-id> > .env.backup
```

#### Recovery Steps

1. Import configuration
2. Restore environment variables
3. Deploy from backup
4. Verify functionality
5. Update documentation

---

## Quick Reference

### Useful Commands

```bash
# View logs
coolify logs <resource-id>

# Restart service
coolify restart <resource-id>

# Check status
coolify status <resource-id>

# View metrics
coolify metrics <resource-id>

# Execute command in container
coolify exec <resource-id> <command>

# Rollback to previous version
coolify rollback <resource-id>
```

### Key Files

| File | Location | Purpose |
|------|----------|---------|
| docker-compose.coolify.yml | `mcp-server/deploy/` | Container configuration |
| Dockerfile | `mcp-server/deploy/` | Image build instructions |
| .env.example | `mcp-server/deploy/` | Environment template |
| production.json | `mcp-server/deploy/config/` | Production config |

### Support Resources

- [Main Documentation](../user/USER_GUIDE.md)
- [Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md)
- [API Reference](../developer/API_REFERENCE.md)
- [GitHub Issues](https://github.com/your-org/mcp-repairshopr/issues)

---

**Document Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Maintained By**: Development Team
