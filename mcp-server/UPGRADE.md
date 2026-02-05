# Upgrade Guide

This guide provides instructions for upgrading MCP RepairShopr between versions.

## Table of Contents

1. [Overview](#overview)
2. [Pre-Upgrade Checklist](#pre-upgrade-checklist)
3. [Upgrade Procedures](#upgrade-procedures)
4. [Version-Specific Upgrades](#version-specific-upgrades)
5. [Post-Upgrade Verification](#post-upgrade-verification)
6. [Rollback Procedures](#rollback-procedures)

## Overview

Upgrading MCP RepairShopr involves updating the code, configuration, and data files. This guide provides step-by-step instructions for upgrading between versions.

### Supported Upgrade Paths

- **0.0.x → 0.1.0**: Initial release (no upgrade path)
- **0.1.x → 0.2.0**: Future upgrade (planned)
- **0.2.x → 0.3.0**: Future upgrade (planned)

### Upgrade Methods

1. **Docker Upgrade**: Recommended for production
2. **Manual Upgrade**: For custom deployments

## Pre-Upgrade Checklist

Before upgrading, complete the following checklist:

### 1. Backup Data

```bash
# Create backup
./deploy/scripts/backup.sh production

# Verify backup
ls -la backups/
```

### 2. Review Release Notes

Read the [Release Notes](RELEASE_NOTES.md) for:
- New features
- Breaking changes
- Deprecations
- Bug fixes
- Known issues

### 3. Check System Requirements

Verify your system meets the requirements:

```bash
# Check Node.js version
node --version

# Check available disk space
df -h

# Check available memory
free -h
```

### 4. Review Configuration Changes

Check if any configuration changes are required:

```bash
# Compare old and new configuration
diff config/default.json deploy/config/production.json
```

### 5. Schedule Downtime

Plan for downtime during the upgrade:
- Notify users
- Schedule maintenance window
- Prepare rollback plan

### 6. Test in Staging

Test the upgrade in a staging environment first:

```bash
# Deploy to staging
./deploy/scripts/deploy.sh staging deploy

# Verify functionality
curl http://staging.example.com/health
```

## Upgrade Procedures

### Docker Upgrade

#### Step 1: Stop Current Deployment

```bash
cd deploy
./docker-deploy.sh production stop
```

#### Step 2: Pull Latest Code

```bash
cd ..
git pull origin main
```

#### Step 3: Update Configuration

If configuration changes are required:

```bash
# Backup current configuration
cp deploy/.env deploy/.env.backup

# Update configuration
nano deploy/.env
```

#### Step 4: Rebuild Docker Image

```bash
cd deploy
./docker-deploy.sh production build
```

#### Step 5: Deploy New Version

```bash
./docker-deploy.sh production deploy
```

#### Step 6: Verify Deployment

```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs -f

# Test health endpoint
curl http://localhost:3000/health
```

### Manual Upgrade

#### Step 1: Stop Current Service

```bash
sudo systemctl stop mcp-repairshopr
```

#### Step 2: Backup Current Installation

```bash
# Create backup directory
sudo mkdir -p /opt/mcp-repairshopr.backup

# Backup current installation
sudo cp -r /opt/mcp-repairshopr/* /opt/mcp-repairshopr.backup/
```

#### Step 3: Pull Latest Code

```bash
cd /opt/mcp-repairshopr
sudo -u mcpserver git pull origin main
```

#### Step 4: Update Dependencies

```bash
sudo -u mcpserver npm install --production
```

#### Step 5: Rebuild Project

```bash
sudo -u mcpserver npm run build
```

#### Step 6: Update Configuration

If configuration changes are required:

```bash
# Backup current configuration
sudo cp config/default.json config/default.json.backup

# Update configuration
sudo nano config/default.json
```

#### Step 7: Update Data Files

If data format changes are required:

```bash
# Backup current data
sudo cp -r data/ data.backup/

# Rebuild indexes if needed
sudo -u mcpserver npm run build-all-indexes
```

#### Step 8: Start Service

```bash
sudo systemctl start mcp-repairshopr
```

#### Step 9: Verify Deployment

```bash
# Check service status
sudo systemctl status mcp-repairshopr

# Check logs
sudo journalctl -u mcp-repairshopr -f

# Test health endpoint
curl http://localhost:3000/health
```

## Version-Specific Upgrades

### Upgrading from 0.0.x to 0.1.0

This is the initial release. No upgrade path is available.

**Action**: Perform a fresh installation following the [Installation Guide](docs/user/INSTALLATION.md).

### Upgrading from 0.1.x to 0.2.0 (Future)

**Planned Changes**:
- Enhanced query understanding with ML models
- Distributed caching support (Redis)
- GraphQL query interface

**Upgrade Steps**:
1. Backup data and configuration
2. Review breaking changes in release notes
3. Update configuration for new features
4. Install Redis if using distributed caching
5. Follow general upgrade procedure
6. Test new features
7. Verify performance

### Upgrading from 0.2.x to 0.3.0 (Future)

**Planned Changes**:
- Plugin system for custom tools
- Custom scoring algorithms
- API rate limiting

**Upgrade Steps**:
1. Backup data and configuration
2. Review breaking changes in release notes
3. Migrate custom plugins if any
4. Update scoring configuration
5. Configure rate limiting
6. Follow general upgrade procedure
7. Test plugin system
8. Verify rate limiting

## Post-Upgrade Verification

### Health Check

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

### Functionality Check

Test core functionality:

```bash
# Test search
curl -X POST http://localhost:3000/tools/search_api_docs \
  -H "Content-Type: application/json" \
  -d '{"query": "customer", "limit": 3}'

# Test endpoint lookup
curl -X POST http://localhost:3000/tools/get_endpoint \
  -H "Content-Type: application/json" \
  -d '{"path": "/customers/{id}", "method": "GET"}'

# Test code generation
curl -X POST http://localhost:3000/tools/generate_code_example \
  -H "Content-Type: application/json" \
  -d '{"endpoint_path": "/customers", "method": "POST", "language": "python"}'
```

### Performance Check

Monitor performance metrics:

```bash
curl http://localhost:3000/metrics
```

Check:
- Request count
- Error count
- Average response time
- Memory usage

### Log Review

Review logs for errors or warnings:

```bash
# Docker
docker-compose logs | grep -i error

# Manual
sudo journalctl -u mcp-repairshopr | grep -i error
```

### Integration Test

Run integration tests:

```bash
npm run test:integration
```

## Rollback Procedures

### Docker Rollback

#### Step 1: Stop Current Deployment

```bash
cd deploy
./docker-deploy.sh production stop
```

#### Step 2: Restore Previous Version

```bash
# Find previous backup
ls -la backups/

# Restore from backup
./deploy/scripts/deploy.sh production rollback
```

#### Step 3: Verify Rollback

```bash
# Check container status
docker-compose ps

# Test health endpoint
curl http://localhost:3000/health
```

### Manual Rollback

#### Step 1: Stop Current Service

```bash
sudo systemctl stop mcp-repairshopr
```

#### Step 2: Restore Previous Version

```bash
# Restore from backup
sudo cp -r /opt/mcp-repairshopr.backup/* /opt/mcp-repairshopr/

# Or restore from git
cd /opt/mcp-repairshopr
sudo -u mcpserver git checkout <previous-version-tag>
```

#### Step 3: Restore Configuration

```bash
# Restore configuration
sudo cp config/default.json.backup config/default.json
```

#### Step 4: Restore Data

```bash
# Restore data
sudo cp -r data.backup/* data/
```

#### Step 5: Start Service

```bash
sudo systemctl start mcp-repairshopr
```

#### Step 6: Verify Rollback

```bash
# Check service status
sudo systemctl status mcp-repairshopr

# Test health endpoint
curl http://localhost:3000/health
```

## Troubleshooting

### Upgrade Fails

**Symptoms**: Upgrade process fails with errors

**Solutions**:
1. Check error messages in logs
2. Verify system requirements
3. Ensure sufficient disk space
4. Check network connectivity
5. Review [Troubleshooting Guide](docs/troubleshooting/TROUBLESHOOTING.md)

### Service Won't Start After Upgrade

**Symptoms**: Service fails to start after upgrade

**Solutions**:
1. Check service logs for errors
2. Verify configuration syntax
3. Check file permissions
4. Ensure all dependencies are installed
5. Review [Troubleshooting Guide](docs/troubleshooting/TROUBLESHOOTING.md)

### Performance Degradation After Upgrade

**Symptoms**: Slower performance after upgrade

**Solutions**:
1. Check system resources
2. Review configuration changes
3. Monitor metrics
4. Check cache configuration
5. Review [Performance Tuning Guide](docs/user/CONFIGURATION.md#performance-tuning)

### Data Corruption After Upgrade

**Symptoms**: Data appears corrupted after upgrade

**Solutions**:
1. Stop the service immediately
2. Restore from backup
3. Verify backup integrity
4. Review upgrade logs
5. Contact support if needed

## Best Practices

### 1. Always Backup

Always create a backup before upgrading:

```bash
./deploy/scripts/backup.sh production
```

### 2. Test in Staging

Test upgrades in a staging environment first:

```bash
./deploy/scripts/deploy.sh staging deploy
```

### 3. Schedule Downtime

Plan for downtime during upgrades:
- Notify users in advance
- Schedule during low-traffic periods
- Have rollback plan ready

### 4. Monitor During Upgrade

Monitor the upgrade process:
- Watch logs for errors
- Check system resources
- Verify each step completes successfully

### 5. Verify After Upgrade

Thoroughly verify after upgrade:
- Health checks
- Functionality tests
- Performance metrics
- Log review

### 6. Document Changes

Document any changes made during upgrade:
- Configuration changes
- Data migrations
- Custom modifications

## Support

If you encounter issues during upgrade:

1. Check the [Troubleshooting Guide](docs/troubleshooting/TROUBLESHOOTING.md)
2. Review the [FAQ](docs/user/FAQ.md)
3. Search [GitHub Issues](https://github.com/yourusername/mcp-repairshopr/issues)
4. Contact support@example.com

## Additional Resources

- [Release Notes](RELEASE_NOTES.md)
- [Changelog](CHANGELOG.md)
- [Deployment Guide](docs/deployment/DEPLOYMENT.md)
- [Configuration Guide](docs/user/CONFIGURATION.md)
- [Troubleshooting Guide](docs/troubleshooting/TROUBLESHOOTING.md)
