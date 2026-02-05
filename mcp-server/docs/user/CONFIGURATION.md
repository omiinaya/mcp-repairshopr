# MCP RepairShopr Configuration Guide

## Table of Contents

1. [Overview](#overview)
2. [Configuration Files](#configuration-files)
3. [Environment Variables](#environment-variables)
4. [Server Configuration](#server-configuration)
5. [Cache Configuration](#cache-configuration)
6. [Monitoring Configuration](#monitoring-configuration)
7. [Logging Configuration](#logging-configuration)
8. [Performance Tuning](#performance-tuning)
9. [Security Configuration](#security-configuration)

## Overview

The MCP RepairShopr server can be configured through:

1. **Configuration Files**: JSON files in the `config/` directory
2. **Environment Variables**: Override settings via environment variables
3. **Command Line Arguments**: Pass settings at startup

Configuration is loaded in the following priority order (highest to lowest):

1. Environment variables
2. Command line arguments
3. Configuration files

## Configuration Files

### Default Configuration

The default configuration is stored in [`config/default.json`](../../config/default.json).

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
  "requestTimeout": 30000,
  "cache": {
    "maxSize": 10485760,
    "defaultTTL": 300000,
    "maxEntries": 1000,
    "enableWarming": true
  },
  "monitoring": {
    "enabled": true,
    "interval": 60000,
    "healthCheckInterval": 60000,
    "healthCheckTimeout": 5000
  },
  "data": {
    "dataDir": "./data",
    "configDir": "./config",
    "metadataIndexPath": "./data/metadata-index.json"
  },
  "api": {
    "timeout": 30000,
    "retryAttempts": 3,
    "retryDelay": 1000
  }
}
```

### Environment-Specific Configuration

You can create environment-specific configuration files:

- `config/production.json` - Production environment
- `config/staging.json` - Staging environment
- `config/development.json` - Development environment

The server will automatically load the configuration based on the `NODE_ENV` environment variable.

## Environment Variables

### Server Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SERVER_NAME` | Server name | mcp-repairshopr | `my-mcp-server` |
| `SERVER_VERSION` | Server version | 0.1.0 | `1.0.0` |
| `PORT` | Server port | 3000 | `8080` |
| `NODE_ENV` | Environment | production | `staging` |

### Logging Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `LOG_LEVEL` | Log level | info | `debug` |
| `LOG_FORMAT` | Log format | json | `text` |

### Cache Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `CACHE_MAX_SIZE` | Maximum cache size (bytes) | 10485760 | `20971520` |
| `CACHE_DEFAULT_TTL` | Default TTL (ms) | 300000 | `600000` |
| `CACHE_MAX_ENTRIES` | Maximum cache entries | 1000 | `2000` |
| `CACHE_ENABLE_WARMING` | Enable cache warming | true | `false` |

### Performance Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `MAX_CONCURRENT_REQUESTS` | Max concurrent requests | 100 | `50` |
| `REQUEST_TIMEOUT` | Request timeout (ms) | 30000 | `60000` |
| `ENABLE_METRICS` | Enable metrics | true | `false` |
| `ENABLE_HOT_RELOAD` | Enable hot reload | false | `true` |

### Data Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DATA_DIR` | Data directory | ./data | `/var/lib/mcp-repairshopr` |
| `CONFIG_DIR` | Config directory | ./config | `/etc/mcp-repairshopr` |
| `METADATA_INDEX_PATH` | Metadata index path | ./data/metadata-index.json | `/var/lib/mcp-repairshopr/index.json` |

### Health Check Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `HEALTH_CHECK_INTERVAL` | Health check interval (ms) | 60000 | `30000` |
| `HEALTH_CHECK_TIMEOUT` | Health check timeout (ms) | 5000 | `10000` |

### Monitoring Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `MONITORING_ENABLED` | Enable monitoring | true | `false` |
| `MONITORING_INTERVAL` | Monitoring interval (ms) | 60000 | `30000` |

### API Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `API_TIMEOUT` | API timeout (ms) | 30000 | `60000` |
| `API_RETRY_ATTEMPTS` | Retry attempts | 3 | `5` |
| `API_RETRY_DELAY` | Retry delay (ms) | 1000 | `2000` |

## Server Configuration

### Basic Settings

Configure basic server settings in your configuration file:

```json
{
  "serverName": "mcp-repairshopr",
  "serverVersion": "0.1.0",
  "port": 3000
}
```

### Hot Reload

Enable hot reload to automatically reload configuration changes:

```json
{
  "enableHotReload": true
}
```

**Note:** Hot reload is recommended for development only. Disable in production.

### Request Handling

Configure request handling parameters:

```json
{
  "maxConcurrentRequests": 100,
  "requestTimeout": 30000
}
```

- `maxConcurrentRequests`: Maximum number of concurrent requests to process
- `requestTimeout`: Maximum time to wait for a request to complete (in milliseconds)

## Cache Configuration

### Cache Size

Configure the maximum cache size:

```json
{
  "cache": {
    "maxSize": 10485760
  }
}
```

The `maxSize` is specified in bytes. Common values:
- 10 MB: `10485760`
- 50 MB: `52428800`
- 100 MB: `104857600`

### Cache TTL

Configure the default time-to-live for cache entries:

```json
{
  "cache": {
    "defaultTTL": 300000
  }
}
```

The `defaultTTL` is specified in milliseconds. Common values:
- 5 minutes: `300000`
- 10 minutes: `600000`
- 30 minutes: `1800000`

### Cache Entries

Configure the maximum number of cache entries:

```json
{
  "cache": {
    "maxEntries": 1000
  }
}
```

### Cache Warming

Enable cache warming to pre-populate the cache on startup:

```json
{
  "cache": {
    "enableWarming": true
  }
}
```

## Monitoring Configuration

### Enable Monitoring

Enable or disable monitoring:

```json
{
  "monitoring": {
    "enabled": true
  }
}
```

### Monitoring Interval

Configure how often metrics are collected:

```json
{
  "monitoring": {
    "interval": 60000
  }
}
```

The `interval` is specified in milliseconds. Common values:
- 30 seconds: `30000`
- 1 minute: `60000`
- 5 minutes: `300000`

### Health Checks

Configure health check parameters:

```json
{
  "monitoring": {
    "healthCheckInterval": 60000,
    "healthCheckTimeout": 5000
  }
}
```

## Logging Configuration

### Log Level

Configure the logging level:

```json
{
  "logLevel": "info"
}
```

Available log levels (from most to least verbose):
- `trace`: Very detailed logging
- `debug`: Debug information
- `info`: General information (default)
- `warn`: Warning messages
- `error`: Error messages only

### Log Format

Configure the log format:

```json
{
  "logFormat": "json"
}
```

Available formats:
- `json`: Structured JSON logs (recommended for production)
- `text`: Plain text logs (recommended for development)

## Performance Tuning

### High Traffic

For high traffic environments, increase concurrent requests and cache size:

```json
{
  "maxConcurrentRequests": 500,
  "cache": {
    "maxSize": 52428800,
    "maxEntries": 5000
  }
}
```

### Low Memory

For low memory environments, reduce cache size and concurrent requests:

```json
{
  "maxConcurrentRequests": 50,
  "cache": {
    "maxSize": 5242880,
    "maxEntries": 500
  }
}
```

### Fast Response

For fast response times, enable cache warming and reduce TTL:

```json
{
  "cache": {
    "enableWarming": true,
    "defaultTTL": 180000
  }
}
```

### Development

For development, enable hot reload and debug logging:

```json
{
  "enableHotReload": true,
  "logLevel": "debug",
  "logFormat": "text"
}
```

## Security Configuration

### Production Security

For production environments:

```json
{
  "enableHotReload": false,
  "logLevel": "warn",
  "logFormat": "json",
  "enableMetrics": true
}
```

### File Permissions

Ensure proper file permissions:

```bash
# Configuration files
chmod 644 config/*.json

# Data directory
chmod 755 data/
chmod 644 data/*

# Logs directory
chmod 755 logs/
```

### Environment Variables

Store sensitive configuration in environment variables:

```bash
# .env file
LOG_LEVEL=info
CACHE_MAX_SIZE=10485760
```

Never commit sensitive information to version control.

## Configuration Examples

### Minimal Configuration

```json
{
  "port": 3000,
  "logLevel": "info"
}
```

### Development Configuration

```json
{
  "port": 3000,
  "logLevel": "debug",
  "logFormat": "text",
  "enableHotReload": true,
  "enableMetrics": true
}
```

### Production Configuration

```json
{
  "port": 3000,
  "logLevel": "info",
  "logFormat": "json",
  "enableHotReload": false,
  "enableMetrics": true,
  "maxConcurrentRequests": 100,
  "requestTimeout": 30000,
  "cache": {
    "maxSize": 10485760,
    "defaultTTL": 300000,
    "maxEntries": 1000,
    "enableWarming": true
  },
  "monitoring": {
    "enabled": true,
    "interval": 60000
  }
}
```

### High Performance Configuration

```json
{
  "port": 3000,
  "logLevel": "warn",
  "logFormat": "json",
  "enableHotReload": false,
  "enableMetrics": true,
  "maxConcurrentRequests": 500,
  "requestTimeout": 30000,
  "cache": {
    "maxSize": 52428800,
    "defaultTTL": 600000,
    "maxEntries": 5000,
    "enableWarming": true
  },
  "monitoring": {
    "enabled": true,
    "interval": 30000
  }
}
```

## Testing Configuration

After making configuration changes, test them:

1. **Restart the server** to apply changes
2. **Check the health endpoint** to verify the server is running
3. **Review logs** for any configuration errors
4. **Test functionality** to ensure everything works as expected

```bash
# Restart server
npm restart

# Check health
curl http://localhost:3000/health

# View logs
tail -f logs/mcp-server.log
```

## Troubleshooting

### Configuration Not Loading

If configuration changes are not applied:

1. Check the configuration file syntax
2. Verify the file path is correct
3. Check file permissions
4. Review logs for errors

### Hot Reload Not Working

If hot reload is not working:

1. Verify `enableHotReload` is set to `true`
2. Check that the configuration file is being watched
3. Review logs for hot reload messages

### Performance Issues

If you experience performance issues:

1. Increase cache size
2. Enable cache warming
3. Adjust `maxConcurrentRequests`
4. Monitor metrics to identify bottlenecks

For more troubleshooting information, see the [Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md).
