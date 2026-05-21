# Network Deployment Guide: MCP RepairShopr on Coolify

This guide explains how to deploy the MCP RepairShopr server on one machine using Coolify, and access it from another machine on your local network (e.g., OpenCode or KiloCode).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Your Local Network                            │
│                                                                  │
│  ┌──────────────────────┐        ┌──────────────────────────┐  │
│  │   Machine A          │        │   Machine B              │  │
│  │   (192.168.1.181)    │        │   (192.168.1.xxx)        │  │
│  │                      │        │                          │  │
│  │  ┌─────────────────┐ │        │  ┌─────────────────────┐ │  │
│  │  │  Coolify        │ │        │  │  OpenCode/KiloCode  │ │  │
│  │  │  ┌───────────┐  │ │        │  │                     │ │  │
│  │  │  │ MCP       │  │ │◄───────┼──┤  MCP Client         │ │  │
│  │  │  │ Server    │  │ │  HTTP  │  │                     │ │  │
│  │  │  │ :3000     │  │ │        │  └─────────────────────┘ │  │
│  │  │  │ :3001     │  │ │        │                          │  │
│  │  │  └───────────┘  │ │        └──────────────────────────┘  │
│  │  └─────────────────┘ │                                        │
│  └──────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Network Requirements

Before starting, ensure:

- [ ] Both machines are on the same network
- [ ] Machine A (server) has a static IP (e.g., 192.168.1.181)
- [ ] Port 3000 and 3001 are not blocked by firewall
- [ ] You can ping Machine A from Machine B: `ping 192.168.1.181`

## Step 1: Update Repository Files

### 1.1 Update `mcp-server/deploy/docker-compose.coolify.yml`

Ensure it has both ports exposed:

```yaml
version: "3.8"

services:
  mcp-repairshopr:
    build:
      context: ./mcp-server
      dockerfile: deploy/Dockerfile
    container_name: mcp-repairshopr-server
    ports:
      - "${PORT:-3000}:${PORT:-3000}" # Health/metrics port
      - "${MCP_HTTP_PORT:-3001}:${MCP_HTTP_PORT:-3001}" # MCP HTTP transport port

    environment:
      - SERVER_NAME=${SERVER_NAME:-mcp-repairshopr}
      - SERVER_VERSION=${SERVER_VERSION:-0.1.0}
      - PORT=${PORT:-3000}
      - NODE_ENV=${NODE_ENV:-production}
      - MCP_HTTP_PORT=${MCP_HTTP_PORT:-3001} # Important for remote access
      # ... other env vars
```

### 1.2 Update `mcp-server/src/index.ts`

Ensure it starts the MCP HTTP transport (already done if following previous steps):

```typescript
import { mcpHttpTransport } from "./server/mcp-http-transport";

// In startServer():
await mcpHttpTransport.start();
logger.info("MCP HTTP transport started for remote access", {
  url: `http://192.168.1.181:3001/mcp`,
});
```

### 1.3 Push to GitHub

```bash
git add .
git commit -m "feat: Enable remote MCP access via HTTP transport"
git push origin main
```

## Step 2: Deploy on Coolify (Machine A)

### 2.1 Coolify Configuration

1. **Build Pack**: Docker Compose
2. **Base Directory**: `mcp-server/deploy`
3. **Docker Compose File**: `docker-compose.coolify.yml`

### 2.2 Environment Variables in Coolify

Add these in Coolify dashboard (your Coolify instance on 192.168.1.181):

| Variable        | Value        | Build Time |
| --------------- | ------------ | ---------- |
| `NODE_ENV`      | `production` | ❌ NO      |
| `PORT`          | `3000`       | ❌ NO      |
| `MCP_HTTP_PORT` | `3001`       | ❌ NO      |
| `LOG_LEVEL`     | `info`       | ❌ NO      |

**Important**: Set all as "Runtime only" (uncheck "Available at Buildtime")

### 2.3 Port Configuration

Coolify should automatically detect both ports from docker-compose:

- Port 3000 (health/metrics)
- Port 3001 (MCP HTTP transport)

If not, manually add port mappings in Coolify:

- Source: `3000` → Destination: `3000`
- Source: `3001` → Destination: `3001`

### 2.4 Deploy

Click **Deploy** and wait for success.

### 2.5 Verify Deployment

SSH into Machine A (192.168.1.181) and test:

```bash
# Check if container is running
docker ps | grep mcp-repairshopr

# Test health endpoint
curl http://localhost:3000/health

# Test MCP endpoint
curl -N http://localhost:3001/mcp
```

## Step 3: Configure Firewall (Machine A)

Allow incoming connections on ports 3000 and 3001:

### Ubuntu/Debian (UFW):

```bash
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw reload
```

### CentOS/RHEL (firewalld):

```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### Check if ports are open:

```bash
sudo netstat -tulpn | grep -E '3000|3001'
```

## Step 4: Test Network Connectivity

From Machine B (your workstation), test connection to Machine A:

```bash
# Test if Machine A is reachable
ping 192.168.1.181

# Test health endpoint
curl http://192.168.1.181:3000/health

# Test MCP endpoint (should see SSE stream)
curl -N http://192.168.1.181:3001/mcp
```

If `curl` hangs or times out:

1. Check firewall on Machine A
2. Check if ports are mapped in Coolify
3. Check Docker network settings

## Step 5: Configure OpenCode/KiloCode (Machine B)

Since MCP protocol over HTTP is not universally supported, you have several options:

### Option A: Use mcp-remote Bridge (Recommended)

Install a local bridge that connects to the remote HTTP endpoint:

```bash
# Install mcp-remote (if available for your client)
npm install -g @modelcontextprotocol/mcp-remote
```

Create wrapper script `~/mcp-remote-bridge.sh`:

```bash
#!/bin/bash
# Connects to remote MCP server via HTTP
exec curl -N -s http://192.168.1.181:3001/mcp
```

Make executable:

```bash
chmod +x ~/mcp-remote-bridge.sh
```

Configure OpenCode/KiloCode:

```json
{
  "mcpServers": {
    "repairshopr": {
      "command": "/home/your-user/mcp-remote-bridge.sh"
    }
  }
}
```

### Option B: SSH Tunnel (Most Reliable)

Create an SSH tunnel from Machine B to Machine A:

```bash
# On Machine B, create tunnel
ssh -L 3001:localhost:3001 user@192.168.1.181 -N

# Keep this terminal open
```

Then configure OpenCode/KiloCode to use localhost:

```json
{
  "mcpServers": {
    "repairshopr": {
      "command": "curl",
      "args": ["-N", "-s", "http://localhost:3001/mcp"]
    }
  }
}
```

**For persistent tunnel**, add to `~/.ssh/config` on Machine B:

```
Host mcp-tunnel
    HostName 192.168.1.181
    User your-username
    LocalForward 3001 localhost:3001
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Then run: `ssh -fN mcp-tunnel`

### Option C: Use Docker on Machine B

Run a local container that proxies to the remote server:

```bash
docker run -d --name mcp-proxy \
  -e REMOTE_URL=http://192.168.1.181:3001/mcp \
  -p 3001:3001 \
  your-proxy-image
```

### Option D: Build Custom HTTP-to-stdio Adapter

Create `~/mcp-http-adapter.js`:

```javascript
const http = require("http");

const REMOTE_URL = "http://192.168.1.181:3001/mcp";

// Read from stdin and forward to HTTP
process.stdin.on("data", (data) => {
  const req = http.request(
    REMOTE_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    (res) => {
      res.on("data", (chunk) => {
        process.stdout.write(chunk);
      });
    },
  );

  req.write(data);
  req.end();
});

// Read SSE from HTTP and write to stdout
http.get(REMOTE_URL, (res) => {
  res.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
});
```

Configure:

```json
{
  "mcpServers": {
    "repairshopr": {
      "command": "node",
      "args": ["/home/your-user/mcp-http-adapter.js"]
    }
  }
}
```

## Step 6: OpenCode Configuration

Create `~/.config/opencode/mcp.json`:

```json
{
  "mcpServers": {
    "repairshopr": {
      "command": "ssh",
      "args": [
        "-o",
        "StrictHostKeyChecking=no",
        "-o",
        "ServerAliveInterval=60",
        "-L",
        "3001:localhost:3001",
        "user@192.168.1.181",
        "curl",
        "-N",
        "-s",
        "http://localhost:3001/mcp"
      ]
    }
  }
}
```

## Step 7: KiloCode Configuration

KiloCode MCP configuration varies by OS:

### macOS:

Edit `~/Library/Application Support/KiloCode/mcp.json`:

```json
{
  "mcpServers": {
    "repairshopr": {
      "command": "ssh",
      "args": [
        "user@192.168.1.181",
        "docker",
        "exec",
        "-i",
        "mcp-repairshopr-server",
        "node",
        "dist/index.js"
      ]
    }
  }
}
```

### Windows:

Edit `%APPDATA%\KiloCode\mcp.json` similarly.

## Step 8: Verify Connection

After configuration:

1. Restart OpenCode/KiloCode
2. Check if MCP server appears in the interface
3. Test with a query: "Search RepairShopr API for customer endpoints"

## Troubleshooting

### Issue 1: Connection Refused

**Error**: `curl: (7) Failed to connect to 192.168.1.181 port 3001: Connection refused`

**Solutions**:

```bash
# On Machine A, check if ports are listening
sudo netstat -tulpn | grep -E '3000|3001'

# Check if Coolify mapped ports correctly
docker inspect mcp-repairshopr-server | grep -A 20 "NetworkSettings"

# Check firewall
sudo ufw status
sudo iptables -L | grep 3001
```

### Issue 2: Connection Timeout

**Error**: Request times out

**Solutions**:

```bash
# Test from Machine A locally
curl http://localhost:3001/mcp

# If local works but remote doesn't, it's a firewall issue
sudo ufw allow from 192.168.1.0/24 to any port 3001
```

### Issue 3: MCP Protocol Errors

**Error**: Protocol mismatch or handshake failures

**Solutions**:

- Ensure MCP HTTP transport is properly started (check logs)
- Verify the HTTP adapter/wrapper is correctly formatting messages
- Check if the client supports HTTP transport

### Issue 4: Container Keeps Restarting

Check logs on Machine A:

```bash
docker logs mcp-repairshopr-server
docker logs --tail 100 mcp-repairshopr-server
```

Common causes:

- Missing `metadata-index.json`
- Port conflicts
- Missing environment variables

## Network Security Considerations

⚠️ **Important Security Notes**:

1. **Firewall Rules**: Only allow from your local network:

   ```bash
   sudo ufw allow from 192.168.1.0/24 to any port 3001
   ```

2. **No Authentication**: The current setup has no authentication. Anyone on your network can access it.

3. **Add API Key** (Optional):
   - Add `MCP_API_KEY` environment variable in Coolify
   - Modify `mcp-http-transport.ts` to check `Authorization` header
   - Update client configuration to include API key

4. **Use VPN for Remote Access**: If accessing from outside your network, use a VPN rather than exposing ports directly.

## Quick Reference

### URLs After Setup

| Service | URL on Machine A                | URL from Machine B                  |
| ------- | ------------------------------- | ----------------------------------- |
| Health  | `http://localhost:3000/health`  | `http://192.168.1.181:3000/health`  |
| Metrics | `http://localhost:3000/metrics` | `http://192.168.1.181:3000/metrics` |
| MCP     | `http://localhost:3001/mcp`     | `http://192.168.1.181:3001/mcp`     |

### Useful Commands

```bash
# Check if MCP server is running
docker ps | grep mcp

# View logs
docker logs -f mcp-repairshopr-server

# Test locally
curl http://localhost:3000/health

# Test from another machine
curl http://192.168.1.181:3000/health

# Restart container
docker restart mcp-repairshopr-server

# Shell into container
docker exec -it mcp-repairshopr-server sh
```

## Summary

1. ✅ Deploy on Coolify (Machine A: 192.168.1.181)
2. ✅ Expose ports 3000 and 3001
3. ✅ Open firewall ports
4. ✅ Configure SSH tunnel or HTTP adapter (Machine B)
5. ✅ Configure OpenCode/KiloCode MCP settings
6. ✅ Test connection

**The key insight**: MCP protocol is designed for stdio (local), so accessing it remotely requires either an HTTP transport adapter or an SSH tunnel to bridge the gap.

For the most reliable setup, use **SSH tunnel** (Option B) as it handles the protocol translation automatically.
