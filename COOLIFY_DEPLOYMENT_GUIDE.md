# Coolify Deployment Guide for MCP RepairShopr

This guide provides step-by-step instructions for deploying the MCP RepairShopr server on Coolify.

## Prerequisites

- [ ] A Coolify instance (self-hosted or managed)
- [ ] GitHub/GitLab repository with your MCP RepairShopr code
- [ ] GitHub/GitLab account linked to Coolify

## Step 1: Fork/Prepare Your Repository

### 1.1 Ensure Required Files Exist

Your repository should have these files at the correct locations:

```
mcp-repairshopr/
├── docker-compose.yml (in repo root - OPTIONAL)
├── mcp-server/
│   ├── deploy/
│   │   ├── docker-compose.coolify.yml (REQUIRED)
│   │   ├── Dockerfile (REQUIRED)
│   │   └── .env.example (REQUIRED)
│   ├── package.json (REQUIRED)
│   ├── package-lock.json (REQUIRED)
│   ├── data/
│   │   └── metadata-index.json (REQUIRED)
│   └── config/
│       └── default.json (REQUIRED)
```

### 1.2 Update Dockerfile (Critical)

Ensure your `mcp-server/deploy/Dockerfile` has:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# IMPORTANT: Set NODE_ENV for build stage
ENV NODE_ENV=development

# Copy package files (MUST be explicit)
COPY package.json package-lock.json ./

# Install ALL dependencies including devDependencies
RUN npm ci && npm cache clean --force

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcpserver -u 1001

# Copy and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built artifacts
COPY --from=builder --chown=mcpserver:nodejs /app/dist ./dist
COPY --from=builder --chown=mcpserver:nodejs /app/config ./config
COPY --from=builder --chown=mcpserver:nodejs /app/data ./data

RUN mkdir -p /app/logs /app/tmp && \
    chown -R mcpserver:nodejs /app/logs /app/tmp

USER mcpserver
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

ENV NODE_ENV=production PORT=3000 LOG_LEVEL=info

CMD ["sh", "-c", "echo 'Starting MCP RepairShopr Server...' && node dist/index.js"]
```

### 1.3 Verify docker-compose.coolify.yml

Ensure `mcp-server/deploy/docker-compose.coolify.yml` has correct build context:

```yaml
version: '3.8'

services:
  mcp-repairshopr:
    build:
      context: ..              # Points to mcp-server/ directory
      dockerfile: deploy/Dockerfile
    container_name: mcp-repairshopr-server
    ports:
      - "${PORT:-3000}:${PORT:-3000}"
    
    environment:
      - SERVER_NAME=${SERVER_NAME:-mcp-repairshopr}
      - SERVER_VERSION=${SERVER_VERSION:-0.1.0}
      - PORT=${PORT:-3000}
      - NODE_ENV=${NODE_ENV:-production}
      - LOG_LEVEL=${LOG_LEVEL:-info}
      - LOG_FORMAT=${LOG_FORMAT:-json}
      # Add other env vars as needed...
    
    volumes:
      - ./data:/app/data:ro
      - ./config:/app/config:ro
      - mcp-logs:/app/logs
    
    restart: unless-stopped
    
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:${PORT:-3000}/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    
    deploy:
      resources:
        limits:
          cpus: '${CPU_LIMIT:-1.0}'
          memory: '${MEMORY_LIMIT:-512M}'
        reservations:
          cpus: '${CPU_RESERVATION:-0.5}'
          memory: '${MEMORY_RESERVATION:-256M}'
    
    networks:
      - coolify-network
    
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  mcp-logs:
    driver: local

networks:
  coolify-network:
    driver: bridge
```

### 1.4 Push to Git

```bash
git add .
git commit -m "Prepare for Coolify deployment"
git push origin main
```

## Step 2: Configure Coolify

### 2.1 Add Your Repository to Coolify

1. Go to **Projects** → Select or create a project
2. Click **+ Add Resource**
3. Select **Git Repository**
4. Choose your Git provider (GitHub/GitLab)
5. Select the `mcp-repairshopr` repository
6. Click **Continue**

### 2.2 Select Build Pack

**IMPORTANT:** Select **Docker Compose**

1. In the resource configuration, find **Build Pack**
2. Select **Docker Compose** from dropdown
3. Coolify should auto-detect `mcp-server/deploy/docker-compose.coolify.yml`
4. If not, specify the path: `mcp-server/deploy/docker-compose.coolify.yml`

### 2.3 Configure Base Directory

Set the **Base Directory** to:
```
mcp-server/deploy
```

This tells Coolify where to find the docker-compose file relative to repo root.

### 2.4 Configure Environment Variables

Go to **Environment Variables** tab and add these:

#### Required Variables:

| Variable | Value | Build Time | Description |
|----------|-------|------------|-------------|
| `NODE_ENV` | `production` | ❌ NO (Runtime only) | Must NOT be available at build time |
| `PORT` | `3000` | ❌ NO | Port to listen on |

#### Important Configuration:

**⚠️ CRITICAL:** Make sure `NODE_ENV` is set to **Runtime only** (uncheck "Available at Buildtime")

This is essential because:
- `NODE_ENV=production` prevents devDependencies from being installed
- TypeScript compiler and build tools are devDependencies
- The build stage needs these tools

#### Optional Variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_NAME` | `mcp-repairshopr` | Server instance name |
| `SERVER_VERSION` | `0.1.0` | Server version |
| `LOG_LEVEL` | `info` | Logging level |
| `LOG_FORMAT` | `json` | Log format |
| `CACHE_MAX_SIZE` | `10485760` | Cache size in bytes |
| `CACHE_DEFAULT_TTL` | `300000` | Cache TTL in ms |
| `MAX_CONCURRENT_REQUESTS` | `100` | Max concurrent requests |
| `REQUEST_TIMEOUT` | `30000` | Request timeout in ms |
| `ENABLE_METRICS` | `true` | Enable Prometheus metrics |

#### RepairShopr API (Optional):

| Variable | Description |
|----------|-------------|
| `REPAIRSHOPR_API_KEY` | Your RepairShopr API key |
| `REPAIRSHOPR_SUBDOMAIN` | Your RepairShopr subdomain |

### 2.5 Configure Health Check

In the **Healthcheck** section:

- **Check Type**: HTTP
- **URL**: `/health`
- **Port**: `3000` (or use `${PORT}`)
- **Interval**: `30`
- **Timeout**: `10`
- **Retries**: `3`

## Step 3: Deploy

### 3.1 Initial Deployment

1. Click **Deploy** button
2. Wait for build to complete (may take 2-5 minutes)
3. Monitor the logs for any errors

### 3.2 Verify Deployment

Once deployed, verify these endpoints work:

```bash
# Health check
curl https://YOUR_DOMAIN/health

# Readiness check
curl https://YOUR_DOMAIN/ready

# Liveness check
curl https://YOUR_DOMAIN/live

# Prometheus metrics
curl https://YOUR_DOMAIN/metrics
```

## Step 4: Troubleshooting

### Issue 1: "package.json: not found"

**Error:**
```
ERROR: failed to calculate checksum: "/package.json": not found
```

**Solution:**
- Check that `docker-compose.coolify.yml` has `context: ..` (points to parent `mcp-server/`)
- Ensure `package.json` and `package-lock.json` exist in `mcp-server/` directory
- Verify the files are committed to git

### Issue 2: "npm ci requires package-lock.json"

**Error:**
```
npm error The `npm ci` command can only install with an existing package-lock.json
```

**Solution:**
- Run `npm install` locally to generate `package-lock.json`
- Commit and push it to git

### Issue 3: Build fails due to NODE_ENV=production

**Error:**
```
npm error Missing script: "build"
```

**Solution:**
- Set `NODE_ENV` as **Runtime only** (not build time)
- The Dockerfile already has `ENV NODE_ENV=development` in builder stage
- Coolify should not override it during build

### Issue 4: "Dockerfile not found"

**Error:**
```
Dockerfile not found for service mcp-repairshopr at ../deploy/Dockerfile
```

**Solution:**
- Ensure Base Directory is set to `mcp-server/deploy`
- Or use the root `docker-compose.yml` which points to correct paths

### Issue 5: Health check fails

**Symptom:** Container keeps restarting

**Solution:**
- Check logs: `docker logs CONTAINER_ID`
- Verify `data/metadata-index.json` exists
- Ensure `config/default.json` is present
- Check that startup validation passes in logs

### Issue 6: Port already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
- Coolify will assign a dynamic port
- Make sure your app uses `process.env.PORT` not hardcoded `3000`
- The HTTP server already handles this

## Step 5: Post-Deployment

### 5.1 Access the Service

Once deployed, Coolify will provide:
- **Domain**: `https://your-service.your-domain.com`
- **Port**: Auto-assigned by Coolify

### 5.2 Monitor Logs

In Coolify:
1. Go to your service
2. Click **Logs** tab
3. Check for any errors or warnings

### 5.3 Scale (if needed)

In the **Resources** section:
- Adjust CPU/Memory limits
- Set replicas if using Docker Swarm/Kubernetes

## Quick Reference

### File Locations Summary

```
Repo Root
├── mcp-server/
│   ├── deploy/
│   │   ├── docker-compose.coolify.yml  ← Coolify uses this
│   │   ├── Dockerfile                  ← Multi-stage build
│   │   └── .env.example                ← Env var template
│   ├── package.json                    ← Node dependencies
│   ├── package-lock.json               ← Lock file (REQUIRED)
│   ├── data/
│   │   └── metadata-index.json         ← Required data file
│   └── config/
│       └── default.json                ← Config file
```

### Coolify Configuration Summary

| Setting | Value |
|---------|-------|
| **Build Pack** | Docker Compose |
| **Base Directory** | `mcp-server/deploy` |
| **Docker Compose File** | `docker-compose.coolify.yml` |
| **NODE_ENV** | Runtime only, value: `production` |
| **Health Check** | HTTP, path: `/health`, port: `3000` |

### Useful Commands

```bash
# Check container status
docker ps | grep mcp-repairshopr

# View logs
docker logs -f CONTAINER_ID

# Shell into container
docker exec -it CONTAINER_ID sh

# Check health endpoint locally
curl http://localhost:3000/health
```

## Getting Help

If you encounter issues:

1. Check Coolify logs for specific error messages
2. Verify all required files are in the repository
3. Test locally first: `docker-compose -f mcp-server/deploy/docker-compose.coolify.yml up`
4. Open an issue on the repository with the full error log

## Success Criteria

✅ Deployment is successful when:
- [ ] Build completes without errors
- [ ] Container starts and stays running
- [ ] Health check returns HTTP 200
- [ ] `/health` endpoint returns JSON with status "healthy"
- [ ] `/metrics` endpoint returns Prometheus metrics
- [ ] No restart loops in Coolify dashboard

---

**Last Updated:** 2026-02-05  
**Version:** 1.0
