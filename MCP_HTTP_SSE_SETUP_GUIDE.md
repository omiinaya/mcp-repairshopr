# MCP HTTP/SSE Connection Setup Guide

This guide explains how to connect to your MCP RepairShopr server using HTTP/SSE transport from another machine on your network.

## Prerequisites

- [ ] MCP server deployed on Machine A (192.168.1.181) using Coolify
- [ ] Port 6001 open on Machine A's firewall
- [ ] OpenCode or KiloCode installed on Machine B (your workstation)
- [ ] Both machines on the same network

## Verify MCP Server is Accessible

Before configuring your client, test the connection:

```bash
# From Machine B, test the health endpoint
curl http://192.168.1.181:6000/health

# Test the MCP SSE endpoint (this will stream events)
curl -N http://192.168.1.181:6001/mcp
```

You should see SSE events like:

```
event: endpoint
id: session_1234567890_abc123
data: {"uri":"/mcp?sessionId=session_1234567890_abc123"}
```

Press `Ctrl+C` to stop the curl command.

---

## Method 1: Direct URL (Native HTTP Support)

Some MCP clients have native support for HTTP/SSE transport. This is the cleanest method if your client supports it.

### Supported Clients

| Client         | Version | Notes                            |
| -------------- | ------- | -------------------------------- |
| Claude Desktop | Latest  | Use with `--mcp-server-url` flag |
| Cursor         | 0.45+   | Native HTTP support              |
| Zed            | Latest  | Built-in MCP HTTP support        |
| Windsurf       | Latest  | Via settings.json                |

### Configuration

#### For Claude Desktop:

Edit Claude Desktop configuration (location varies by OS):

**macOS:**

```bash
# Edit the config file
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**

```powershell
# Edit the config file
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**

```bash
# Edit the config file
nano ~/.config/Claude/claude_desktop_config.json
```

Add this configuration:

```json
{
  "mcpServers": {
    "repairshopr": {
      "url": "http://192.168.1.181:6001/mcp",
      "env": {
        "REPAIRSHOPR_API_KEY": "your_api_key_here",
        "REPAIRSHOPR_SUBDOMAIN": "your_subdomain"
      }
    }
  }
}
```

#### For Cursor:

1. Open Cursor Settings (`Cmd/Ctrl + ,`)
2. Go to **Features** → **MCP Servers**
3. Click **+ Add New MCP Server**
4. Enter:
   - **Name:** `repairshopr`
   - **Type:** `HTTP`
   - **URL:** `http://192.168.1.181:6001/mcp`
5. Click **Save**

#### For Zed:

Add to your `~/.config/zed/settings.json`:

```json
{
  "mcp_servers": {
    "repairshopr": {
      "url": "http://192.168.1.181:6001/mcp",
      "tools": true
    }
  }
}
```

#### For Windsurf:

Add to `~/.config/windsurf/settings.json`:

```json
{
  "mcp.servers": {
    "repairshopr": {
      "url": "http://192.168.1.181:6001/mcp",
      "enabled": true
    }
  }
}
```

### Testing Direct URL

After configuration:

1. **Restart your MCP client**
2. Open a new chat
3. Type: `List available tools`

You should see a response listing all 7 RepairShopr tools.

### Troubleshooting Direct URL

**Error: "URL scheme not supported"**

- Your client doesn't support HTTP transport natively
- Use Method 2 (mcp-proxy) instead

**Error: "Connection refused"**

- Check firewall: `curl http://192.168.1.181:6000/health`
- Verify MCP server is running in Coolify

**Error: "Session timeout"**

- The session expired (10-minute idle timeout)
- Reconnect to create a new session

---

## Method 2: Using mcp-proxy (Recommended)

The `mcp-proxy` tool bridges the gap between stdio-based MCP clients and HTTP/SSE servers. It works with any MCP client.

### Step 1: Install mcp-proxy

#### Option A: Install via npm (Recommended)

```bash
# Install globally
npm install -g @anthropic-ai/mcp-proxy

# Verify installation
mcp-proxy --version
```

#### Option B: Install via npx (No global install)

```bash
# You can run directly with npx
npx @anthropic-ai/mcp-proxy http://192.168.1.181:6001/mcp
```

#### Option C: Install from source

```bash
# Clone the repository
git clone https://github.com/anthropics/mcp-proxy.git
cd mcp-proxy

# Install dependencies
npm install

# Build
npm run build

# Link globally
npm link
```

### Step 2: Create Wrapper Script

Create a wrapper script that connects to your server:

```bash
# Create the script file
cat > ~/mcp-repairshopr-proxy.sh << 'EOF'
#!/bin/bash
# MCP Proxy for RepairShopr HTTP Server
# Connects to remote MCP server via HTTP/SSE

# The URL of your MCP server
MCP_URL="http://192.168.1.181:6001/mcp"

# Optional: Add logging
exec > >(tee -a /tmp/mcp-repairshopr.log)
exec 2>&1

echo "[$(date)] Starting MCP proxy to $MCP_URL"

# Run the proxy
exec mcp-proxy "$MCP_URL"
EOF

# Make it executable
chmod +x ~/mcp-repairshopr-proxy.sh

# Test it
~/mcp-repairshopr-proxy.sh
```

Press `Ctrl+C` to stop the test.

### Step 3: Configure Your MCP Client

#### For OpenCode:

Create/edit `~/.config/opencode/mcp.json`:

```json
{
  "mcpServers": {
    "repairshopr": {
      "command": "/home/YOUR_USERNAME/mcp-repairshopr-proxy.sh",
      "env": {
        "REPAIRSHOPR_API_KEY": "your_api_key_here",
        "REPAIRSHOPR_SUBDOMAIN": "your_subdomain"
      }
    }
  }
}
```

**Note:** Replace `YOUR_USERNAME` with your actual username.

#### For KiloCode:

**macOS:**

```bash
nano ~/Library/Application\ Support/KiloCode/mcp.json
```

**Windows:**

```powershell
notepad %APPDATA%\KiloCode\mcp.json
```

**Linux:**

```bash
nano ~/.config/KiloCode/mcp.json
```

Add:

```json
{
  "mcpServers": {
    "repairshopr": {
      "command": "/home/YOUR_USERNAME/mcp-repairshopr-proxy.sh",
      "args": [],
      "env": {
        "REPAIRSHOPR_API_KEY": "your_api_key_here",
        "REPAIRSHOPR_SUBDOMAIN": "your_subdomain"
      }
    }
  }
}
```

#### For Claude Desktop:

```json
{
  "mcpServers": {
    "repairshopr": {
      "command": "/home/YOUR_USERNAME/mcp-repairshopr-proxy.sh",
      "env": {
        "REPAIRSHOPR_API_KEY": "your_api_key_here",
        "REPAIRSHOPR_SUBDOMAIN": "your_subdomain"
      }
    }
  }
}
```

#### For VS Code with Cline/Roo:

Add to VS Code settings (`settings.json`):

```json
{
  "cline.mcpServers": {
    "repairshopr": {
      "command": "/home/YOUR_USERNAME/mcp-repairshopr-proxy.sh",
      "env": {
        "REPAIRSHOPR_API_KEY": "your_api_key_here",
        "REPAIRSHOPR_SUBDOMAIN": "your_subdomain"
      }
    }
  }
}
```

### Step 4: Test the Connection

1. **Restart your MCP client** (OpenCode, KiloCode, etc.)
2. **Check the logs** to see if proxy started:
   ```bash
   tail -f /tmp/mcp-repairshopr.log
   ```
3. **Start a new chat** and type: `List available tools`

### Advanced mcp-proxy Options

#### Using npx (No Installation)

Create a different wrapper script:

```bash
cat > ~/mcp-repairshopr-npx.sh << 'EOF'
#!/bin/bash
# Using npx to run mcp-proxy without global install
exec npx @anthropic-ai/mcp-proxy http://192.168.1.181:6001/mcp
EOF

chmod +x ~/mcp-repairshopr-npx.sh
```

#### Adding Retry Logic

For unstable connections, add retry logic:

```bash
cat > ~/mcp-repairshopr-retry.sh << 'EOF'
#!/bin/bash
# MCP Proxy with auto-retry

MCP_URL="http://192.168.1.181:6001/mcp"
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "[$(date)] Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES"

    if mcp-proxy "$MCP_URL"; then
        echo "[$(date)] Proxy exited normally"
        exit 0
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "[$(date)] Proxy failed, retrying in 5 seconds..."
    sleep 5
done

echo "[$(date)] Max retries reached, giving up"
exit 1
EOF

chmod +x ~/mcp-repairshopr-retry.sh
```

#### Using Docker for mcp-proxy

If you prefer Docker:

```bash
# Run mcp-proxy in a container
docker run -i --rm \
  --network host \
  anthropic/mcp-proxy \
  http://192.168.1.181:6001/mcp
```

Wrapper script:

```bash
cat > ~/mcp-repairshopr-docker.sh << 'EOF'
#!/bin/bash
exec docker run -i --rm --network host anthropic/mcp-proxy http://192.168.1.181:6001/mcp
EOF

chmod +x ~/mcp-repairshopr-docker.sh
```

### Troubleshooting mcp-proxy

**Error: "mcp-proxy: command not found"**

```bash
# Check if installed
which mcp-proxy

# If not found, install it
npm install -g @anthropic-ai/mcp-proxy

# Or use npx
npx @anthropic-ai/mcp-proxy http://192.168.1.181:6001/mcp
```

**Error: "Connection refused"**

- Verify MCP server is running: `curl http://192.168.1.181:6000/health`
- Check firewall: `sudo ufw status | grep 6001`
- Verify the IP address is correct

**Error: "Session timeout"**

- This is normal if idle for 10 minutes
- The proxy should auto-reconnect
- Check logs: `tail -f /tmp/mcp-repairshopr.log`

**Proxy keeps crashing**

- Check network stability
- Use the retry wrapper script
- Increase retry count: `MAX_RETRIES=10`

---

## Method Comparison

| Feature                       | Direct URL        | mcp-proxy    |
| ----------------------------- | ----------------- | ------------ |
| **Setup Complexity**          | Simple            | Medium       |
| **Client Support**            | Limited           | Universal    |
| **Works with OpenCode**       | ❌ No             | ✅ Yes       |
| **Works with KiloCode**       | ❌ No             | ✅ Yes       |
| **Works with Claude Desktop** | ✅ Yes            | ✅ Yes       |
| **Works with Cursor**         | ✅ Yes            | ✅ Yes       |
| **Auto-reconnect**            | Depends on client | ✅ Yes       |
| **Logging**                   | Client-dependent  | ✅ Full logs |

**Recommendation:**

- Use **Direct URL** if your client supports it (cleaner, less overhead)
- Use **mcp-proxy** for universal compatibility (works with any client)

---

## Testing Your Setup

### Test 1: Basic Connectivity

```bash
# Test health endpoint
curl http://192.168.1.181:6000/health | jq .
```

Expected output:

```json
{
  "status": "healthy",
  "uptime": 12345,
  "timestamp": "2026-02-05T20:00:00Z",
  "checks": [...]
}
```

### Test 2: MCP Protocol Test

```bash
# Connect to SSE endpoint
curl -N http://192.168.1.181:6001/mcp &
CURL_PID=$!

# Wait for session ID
sleep 2

# In another terminal, send initialize message
curl -X POST "http://192.168.1.181:6001/mcp?sessionId=SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'

# Kill the SSE connection
kill $CURL_PID
```

### Test 3: Tool Listing

In your MCP client, try these prompts:

```
List all available tools
```

Expected: Should show 7 RepairShopr tools

```
Use the search_api_docs tool to find customer endpoints
```

Expected: Should return search results

```
Show me how to create a ticket using the API
```

Expected: Should generate code example

---

## Security Considerations

### Network Security

**Firewall Rules** (on Machine A):

```bash
# Only allow from your local network
sudo ufw allow from 192.168.1.0/24 to any port 6000:6001

# Or allow specific IP
sudo ufw allow from 192.168.1.100 to any port 6000:6001
```

**Router Configuration**:

- Don't forward ports 6000/6001 to the internet
- Keep access limited to local network only

### Authentication (Optional)

If you want to add API key authentication:

1. Add environment variable in Coolify:

   ```bash
   MCP_API_KEY=your-secret-key-here
   ```

2. Modify the HTTP transport to check the header (requires code change)

3. Update client configuration to include API key:
   ```json
   {
     "headers": {
       "Authorization": "Bearer your-secret-key-here"
     }
   }
   ```

---

## Quick Reference

### Common Commands

```bash
# Test health
curl http://192.168.1.181:6000/health

# Test metrics
curl http://192.168.1.181:6000/metrics

# Test SSE endpoint
curl -N http://192.168.1.181:6001/mcp

# View proxy logs
tail -f /tmp/mcp-repairshopr.log

# Restart MCP server (in Coolify)
# Go to Coolify dashboard → Your Service → Restart

# Check firewall
sudo ufw status | grep 600

# Check running containers (on Machine A)
docker ps | grep mcp
```

### Configuration File Locations

| Client                   | Config Location                                                   |
| ------------------------ | ----------------------------------------------------------------- |
| OpenCode                 | `~/.config/opencode/mcp.json`                                     |
| KiloCode (macOS)         | `~/Library/Application Support/KiloCode/mcp.json`                 |
| KiloCode (Windows)       | `%APPDATA%\KiloCode\mcp.json`                                     |
| Claude Desktop (macOS)   | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop (Windows) | `%APPDATA%\Claude\claude_desktop_config.json`                     |
| Cursor                   | Settings → Features → MCP Servers                                 |
| Zed                      | `~/.config/zed/settings.json`                                     |

---

## Getting Help

If you encounter issues:

1. **Check logs** on Machine A: Coolify dashboard → Logs
2. **Check proxy logs** on Machine B: `tail -f /tmp/mcp-repairshopr.log`
3. **Test connectivity**: `curl http://192.168.1.181:6000/health`
4. **Verify firewall**: `sudo ufw status`
5. **Check mcp-proxy**: `mcp-proxy --version`

---

## Next Steps

1. ✅ Choose your method (Direct URL or mcp-proxy)
2. ✅ Install necessary tools
3. ✅ Configure your MCP client
4. ✅ Test the connection
5. ✅ Start using RepairShopr tools!

**Try this prompt to get started:**

```
Show me how to list all customers using the RepairShopr API
```

Happy coding! 🚀
