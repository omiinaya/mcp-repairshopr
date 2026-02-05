# MCP RepairShopr Installation Guide

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Methods](#installation-methods)
3. [Docker Installation](#docker-installation)
4. [Manual Installation](#manual-installation)
5. [Verification](#verification)
6. [Upgrading](#upgrading)
7. [Uninstallation](#uninstallation)

## System Requirements

### Minimum Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Memory**: 512 MB RAM minimum, 1 GB recommended
- **Disk Space**: 100 MB for installation, 500 MB for data
- **Operating System**: Linux, macOS, or Windows (with WSL2)

### Recommended Requirements

- **Node.js**: 20.x LTS
- **npm**: 10.x
- **Memory**: 2 GB RAM
- **Disk Space**: 1 GB
- **CPU**: 2 cores or more

### Docker Requirements (if using Docker)

- **Docker**: 20.10 or higher
- **Docker Compose**: 2.0 or higher

## Installation Methods

There are two main ways to install MCP RepairShopr:

1. **Docker Installation** (Recommended for production)
2. **Manual Installation** (Recommended for development)

Choose the method that best fits your use case.

## Docker Installation

Docker installation is the recommended method for production deployments as it provides:

- Isolated environment
- Easy deployment and scaling
- Consistent behavior across systems
- Simple updates and rollbacks

### Step 1: Install Docker

If you don't have Docker installed, follow the official installation guide:

- [Linux](https://docs.docker.com/engine/install/)
- [macOS](https://docs.docker.com/desktop/install/mac-install/)
- [Windows](https://docs.docker.com/desktop/install/windows-install/)

### Step 2: Clone the Repository

```bash
git clone https://github.com/yourusername/mcp-repairshopr.git
cd mcp-repairshopr/mcp-server
```

### Step 3: Configure Environment

Copy the example environment file and configure it:

```bash
cp deploy/.env.example deploy/.env
```

Edit the `.env` file with your preferred settings:

```bash
nano deploy/.env
```

Key configuration options:
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (error, warn, info, debug)
- `CACHE_MAX_SIZE`: Maximum cache size in bytes
- `MAX_CONCURRENT_REQUESTS`: Maximum concurrent requests

### Step 4: Build and Run

Build the Docker image:

```bash
cd deploy
./docker-deploy.sh production build
```

Deploy the server:

```bash
./docker-deploy.sh production deploy
```

Or use Docker Compose directly:

```bash
docker-compose up -d
```

### Step 5: Verify Installation

Check that the container is running:

```bash
docker-compose ps
```

Check the health status:

```bash
curl http://localhost:3000/health
```

## Manual Installation

Manual installation is recommended for development environments or when you need more control over the installation process.

### Step 1: Install Node.js

Ensure you have Node.js 18 or higher installed:

```bash
node --version
```

If not installed, download from [nodejs.org](https://nodejs.org/) or use a version manager:

**Using nvm (Node Version Manager):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

**Using apt (Ubuntu/Debian):**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Clone the Repository

```bash
git clone https://github.com/yourusername/mcp-repairshopr.git
cd mcp-repairshopr/mcp-server
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Build the Project

```bash
npm run build
```

This compiles the TypeScript code to JavaScript in the `dist` directory.

### Step 5: Configure the Server

Copy the example configuration:

```bash
cp config/default.json config/local.json
```

Edit the configuration file as needed:

```bash
nano config/local.json
```

### Step 6: Start the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

### Step 7: Verify Installation

Check the health endpoint:

```bash
curl http://localhost:3000/health
```

You should see a JSON response with the server status.

## Verification

After installation, verify that everything is working correctly:

### 1. Check Server Status

```bash
curl http://localhost:3000/health
```

Expected response:

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

### 2. Test Search Functionality

```bash
curl -X POST http://localhost:3000/tools/search_api_docs \
  -H "Content-Type: application/json" \
  -d '{"query": "customer"}'
```

### 3. Check Logs

Check the server logs for any errors:

```bash
tail -f logs/mcp-server.log
```

### 4. Verify Data Files

Ensure the data directory contains the metadata index:

```bash
ls -la data/
```

You should see `metadata-index.json` and other data files.

## Upgrading

### Docker Upgrade

To upgrade to a new version:

```bash
cd deploy
./docker-deploy.sh production stop
docker pull mcp-repairshopr:latest
./docker-deploy.sh production deploy
```

### Manual Upgrade

To upgrade manually:

```bash
# Stop the server
npm stop

# Pull latest changes
git pull origin main

# Install updated dependencies
npm install

# Rebuild the project
npm run build

# Restart the server
npm start
```

### Backup Before Upgrade

Always backup your data before upgrading:

```bash
./deploy/scripts/backup.sh production
```

## Uninstallation

### Docker Uninstallation

Stop and remove containers:

```bash
cd deploy
docker-compose down
```

Remove Docker images:

```bash
docker rmi mcp-repairshopr:latest
```

Remove volumes (optional):

```bash
docker volume rm mcp-repairshopr-data
```

### Manual Uninstallation

Stop the server:

```bash
npm stop
```

Remove the installation directory:

```bash
cd ..
rm -rf mcp-repairshopr
```

Remove systemd service (if configured):

```bash
sudo systemctl stop mcp-repairshopr
sudo systemctl disable mcp-repairshopr
sudo rm /etc/systemd/system/mcp-repairshopr.service
```

## Troubleshooting

### Port Already in Use

If you get an error that port 3000 is already in use:

```bash
# Find the process using the port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

Or change the port in your configuration:

```json
{
  "port": 3001
}
```

### Permission Denied

If you get permission errors:

```bash
# Fix file permissions
chmod +x deploy/scripts/*.sh
chmod -R 755 data/
```

### Module Not Found

If you get "module not found" errors:

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

If the build fails:

```bash
# Clean build artifacts
rm -rf dist/

# Rebuild
npm run build
```

For more troubleshooting information, see the [Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md).

## Next Steps

After installation:

1. Read the [User Guide](./USER_GUIDE.md) to learn how to use the server
2. Review the [Configuration Guide](./CONFIGURATION.md) to customize settings
3. Check the [API Documentation](../api/README.md) for detailed API information
4. Set up monitoring using the [Deployment Guide](../deployment/DEPLOYMENT.md)
