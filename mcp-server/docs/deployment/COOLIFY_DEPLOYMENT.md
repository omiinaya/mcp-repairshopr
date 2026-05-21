# Coolify Deployment Guide

This document provides comprehensive instructions for deploying the MCP RepairShopr Server on Coolify.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Coolify Configuration](#coolify-configuration)
4. [Environment Variables](#environment-variables)
5. [Health Check Configuration](#health-check-configuration)
6. [Resource Requirements](#resource-requirements)
7. [Deployment Steps](#deployment-steps)
8. [Troubleshooting](#troubleshooting)

## Overview

The MCP RepairShopr Server is a Node.js-based MCP (Model Context Protocol) server that provides API documentation search and retrieval capabilities for RepairShopr. This guide covers deployment on Coolify, a self-hosted deployment platform.

### Key Features

- **Dynamic Port Support**: Automatically adapts to Coolify's port assignment
- **Health Check Endpoints**: Ready-to-use `/health`, `/ready`, and `/live` endpoints
- **Resource Management**: Configurable CPU and memory limits
- **Monitoring**: Built-in metrics and health monitoring

## Prerequisites

Before deploying to Coolify, ensure you have:

- A running Coolify instance (v4.0 or later recommended)
- Git repository with the MCP RepairShopr Server code
- Sufficient system resources (see [Resource Requirements](#resource-requirements))

## Coolify Configuration

### Create a New Resource

1. Log in to your Coolify dashboard
2. Click "Add New Resource"
3. Select "Docker Compose" as the resource type
4. Configure the following settings:

#### Resource Settings

| Setting     | Value                            |
| ----------- | -------------------------------- |
| Name        | `mcp-repairshopr`                |
| Type        | Docker Compose                   |
| Source      | Git Repository                   |
| Repository  | Your fork of mcp-repairshopr     |
| Branch      | `main` or your deployment branch |
| Path        | `mcp-server/deploy`              |
| Config File | `docker-compose.coolify.yml`     |

### Port Configuration

Coolify automatically assigns a dynamic port. The server is configured to use the `PORT` environment variable, which Coolify will set automatically.

**Default Port**: 3000 (if not overridden by Coolify)

## Environment Variables

Configure the following environment variables in Coolify's resource settings:

### Required Variables

| Variable         | Default           | Description                         |
| ---------------- | ----------------- | ----------------------------------- |
| `SERVER_NAME`    | `mcp-repairshopr` | Name of the server instance         |
| `SERVER_VERSION` | `0.1.0`           | Version of the server               |
| `PORT`           | `3000`            | Port number (Coolify will override) |
| `NODE_ENV`       | `production`      | Environment mode                    |

### Optional Variables

#### Logging

| Variable     | Default | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| `LOG_LEVEL`  | `info`  | Logging level (error, warn, info, debug, trace) |
| `LOG_FORMAT` | `json`  | Log format (json, plain)                        |

#### Cache Configuration

| Variable               | Default    | Description                                   |
| ---------------------- | ---------- | --------------------------------------------- |
| `CACHE_MAX_SIZE`       | `10485760` | Maximum cache size in bytes (10MB)            |
| `CACHE_DEFAULT_TTL`    | `300000`   | Default cache TTL in milliseconds (5 minutes) |
| `CACHE_MAX_ENTRIES`    | `1000`     | Maximum number of cache entries               |
| `CACHE_ENABLE_WARMING` | `true`     | Enable cache warming on startup               |

#### Performance Configuration

| Variable                  | Default | Description                                  |
| ------------------------- | ------- | -------------------------------------------- |
| `MAX_CONCURRENT_REQUESTS` | `100`   | Maximum concurrent requests                  |
| `REQUEST_TIMEOUT`         | `30000` | Request timeout in milliseconds (30 seconds) |
| `ENABLE_METRICS`          | `true`  | Enable metrics collection                    |
| `ENABLE_HOT_RELOAD`       | `false` | Enable configuration hot-reload              |

#### Health Check Configuration

| Variable                | Default | Description                           |
| ----------------------- | ------- | ------------------------------------- |
| `HEALTH_CHECK_INTERVAL` | `60000` | Health check interval in milliseconds |
| `HEALTH_CHECK_TIMEOUT`  | `5000`  | Health check timeout in milliseconds  |

#### Monitoring Configuration

| Variable              | Default | Description                         |
| --------------------- | ------- | ----------------------------------- |
| `MONITORING_ENABLED`  | `true`  | Enable monitoring service           |
| `MONITORING_INTERVAL` | `60000` | Monitoring interval in milliseconds |

#### Resource Limits (Coolify-specific)

| Variable             | Default | Description               |
| -------------------- | ------- | ------------------------- |
| `CPU_LIMIT`          | `1.0`   | Maximum CPU usage (cores) |
| `MEMORY_LIMIT`       | `512M`  | Maximum memory usage      |
| `CPU_RESERVATION`    | `0.5`   | Reserved CPU (cores)      |
| `MEMORY_RESERVATION` | `256M`  | Reserved memory           |

### Example Environment Configuration

```env
# Server Configuration
SERVER_NAME=mcp-repairshopr
SERVER_VERSION=0.1.0
PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Cache
CACHE_MAX_SIZE=10485760
CACHE_DEFAULT_TTL=300000
CACHE_MAX_ENTRIES=1000
CACHE_ENABLE_WARMING=true

# Performance
MAX_CONCURRENT_REQUESTS=100
REQUEST_TIMEOUT=30000
ENABLE_METRICS=true
ENABLE_HOT_RELOAD=false

# Resource Limits
CPU_LIMIT=1.0
MEMORY_LIMIT=512M
CPU_RESERVATION=0.5
MEMORY_RESERVATION=256M
```

## Health Check Configuration

Coolify uses health checks to determine if your application is running correctly. Configure the following in Coolify:

### Health Check Settings

| Setting      | Value      |
| ------------ | ---------- |
| Type         | HTTP       |
| Endpoint     | `/health`  |
| Interval     | 30 seconds |
| Timeout      | 10 seconds |
| Retries      | 3          |
| Start Period | 10 seconds |

### Available Health Endpoints

The server provides three health check endpoints:

1. **`/health`** - Full health check with metrics
   - Returns: HTTP 200 if healthy, HTTP 503 if unhealthy
   - Response includes: status, uptime, version, checks, and metrics

2. **`/ready`** - Readiness check
   - Returns: HTTP 200 if ready, HTTP 503 if not ready
   - Used by Coolify to determine if the service can accept traffic

3. **`/live`** - Liveness check
   - Returns: HTTP 200 always
   - Used by orchestrators to check if the process is running

### Example Health Check Response

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

## Resource Requirements

### Minimum Requirements

| Resource | Minimum   | Recommended |
| -------- | --------- | ----------- |
| CPU      | 0.5 cores | 1.0 core    |
| Memory   | 256 MB    | 512 MB      |
| Storage  | 100 MB    | 200 MB      |

### Recommended Configuration

For production deployments:

- **CPU**: 1.0 core (with burst capability)
- **Memory**: 512 MB
- **Storage**: 200 MB (for logs and data)

### Scaling Considerations

- The server is designed to handle multiple concurrent requests
- Cache warming improves initial request performance
- Memory usage scales with cache size configuration

## Deployment Steps

### Step 1: Prepare Your Repository

1. Ensure your repository has the latest code
2. Verify the `mcp-server/deploy/docker-compose.coolify.yml` file exists
3. Commit any changes to environment variables

### Step 2: Create the Resource in Coolify

1. Navigate to your Coolify dashboard
2. Click "Add New Resource"
3. Select "Docker Compose"
4. Enter your repository details:
   - Repository URL
   - Branch
   - Path: `mcp-server/deploy`
   - Config File: `docker-compose.coolify.yml`

### Step 3: Configure Environment Variables

1. In the resource configuration, find "Environment Variables"
2. Add the required variables (see [Environment Variables](#environment-variables))
3. Save the configuration

### Step 4: Configure Health Check

1. In the resource configuration, find "Health Check"
2. Set the following:
   - Type: HTTP
   - Endpoint: `/health`
   - Interval: 30s
   - Timeout: 10s
   - Retries: 3
   - Start Period: 10s

### Step 5: Configure Resource Limits

1. In the resource configuration, find "Resources"
2. Set CPU and memory limits according to [Resource Requirements](#resource-requirements)
3. Save the configuration

### Step 6: Deploy

1. Click "Deploy" to start the deployment
2. Monitor the deployment logs for any errors
3. Wait for the health check to pass

### Step 7: Verify Deployment

1. Check the health endpoint: `http://<your-domain>:<port>/health`
2. Verify all checks return healthy status
3. Test the MCP server functionality

## Troubleshooting

### Common Issues

#### Container Fails to Start

**Symptoms:**

- Container exits immediately
- Health check fails repeatedly

**Solutions:**

1. Check logs for startup errors
2. Verify environment variables are set correctly
3. Ensure port is not already in use

#### Health Check Fails

**Symptoms:**

- Health check returns 503
- Container restarts repeatedly

**Solutions:**

1. Check if the server started successfully
2. Verify the `/health` endpoint is accessible
3. Check memory and CPU usage

#### High Memory Usage

**Symptoms:**

- Container is killed by OOM
- Slow response times

**Solutions:**

1. Reduce `CACHE_MAX_SIZE` in environment variables
2. Lower `MAX_CONCURRENT_REQUESTS`
3. Increase memory limit in resource configuration

#### High CPU Usage

**Symptoms:**

- CPU usage consistently at 100%
- Slow response times

**Solutions:**

1. Reduce `MAX_CONCURRENT_REQUESTS`
2. Increase CPU limit
3. Check for infinite loops or performance issues in logs

### Viewing Logs

To view application logs in Coolify:

1. Navigate to your resource
2. Click "Logs" tab
3. Filter by log level if needed

### Restarting the Service

1. Navigate to your resource
2. Click "Actions" > "Restart"
3. Monitor the restart process

### Updating the Deployment

1. Make changes to your repository
2. Push changes to the configured branch
3. Coolify will automatically detect changes
4. Review and confirm the deployment

## Security Considerations

### Production Best Practices

1. **Use HTTPS**: Configure SSL/TLS in Coolify
2. **Limit Access**: Restrict access to necessary IP ranges
3. **Monitor Logs**: Regularly review application logs
4. **Update Regularly**: Keep dependencies up to date
5. **Use Secrets**: Store sensitive data in Coolify secrets

### Container Security

The Dockerfile includes:

- Non-root user (`mcpserver`)
- Minimal image size (Alpine Linux)
- No unnecessary packages installed

## Support

For issues or questions:

1. Check the [main documentation](../user/USER_GUIDE.md)
2. Review [troubleshooting documentation](../troubleshooting/TROUBLESHOOTING.md)
3. Open an issue on GitHub
