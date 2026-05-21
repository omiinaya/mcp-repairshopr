# MCP RepairShopr Troubleshooting Guide

## Table of Contents

1. [Common Issues](#common-issues)
2. [Installation Issues](#installation-issues)
3. [Configuration Issues](#configuration-issues)
4. [Performance Issues](#performance-issues)
5. [Search Issues](#search-issues)
6. [Docker Issues](#docker-issues)
7. [Network Issues](#network-issues)
8. [Debugging Guide](#debugging-guide)

## Common Issues

### Server Won't Start

**Symptoms**:

- Server fails to start
- Error messages on startup
- Process exits immediately

**Possible Causes**:

1. Port already in use
2. Configuration file errors
3. Missing dependencies
4. Invalid environment variables

**Solutions**:

1. **Check if port is in use**:

   ```bash
   lsof -i :3000
   # or
   netstat -tulpn | grep 3000
   ```

2. **Kill the process using the port**:

   ```bash
   kill -9 <PID>
   ```

3. **Use a different port**:

   ```bash
   export PORT=3001
   npm start
   ```

4. **Check configuration file**:

   ```bash
   npm run build
   # Look for configuration errors
   ```

5. **Verify dependencies**:

   ```bash
   npm install
   ```

6. **Check logs**:
   ```bash
   tail -f logs/mcp-server.log
   ```

---

### Health Check Fails

**Symptoms**:

- Health check returns unhealthy status
- `/health` endpoint returns 503
- Monitoring alerts

**Possible Causes**:

1. Server not running
2. Port not accessible
3. Internal errors
4. Resource exhaustion

**Solutions**:

1. **Check if server is running**:

   ```bash
   ps aux | grep node
   ```

2. **Test health endpoint**:

   ```bash
   curl http://localhost:3000/health
   ```

3. **Check server logs**:

   ```bash
   tail -f logs/mcp-server.log
   ```

4. **Check system resources**:

   ```bash
   free -h
   df -h
   top
   ```

5. **Restart server**:
   ```bash
   npm restart
   ```

---

### Search Returns No Results

**Symptoms**:

- Search queries return empty results
- No endpoints found for common queries

**Possible Causes**:

1. Metadata index not loaded
2. Vector store not initialized
3. Data files missing
4. Query too specific

**Solutions**:

1. **Check data files**:

   ```bash
   ls -la data/
   # Should see metadata-index.json
   ```

2. **Rebuild index**:

   ```bash
   npm run build-all-indexes
   ```

3. **Check logs for initialization errors**:

   ```bash
   grep -i "index" logs/mcp-server.log
   ```

4. **Try broader queries**:
   - Instead of "create customer with email", try "customer"
   - Use fewer filters

5. **Verify vector store**:
   ```bash
   # Check if vector store is initialized
   curl http://localhost:3000/health | grep vector
   ```

---

## Installation Issues

### Module Not Found Errors

**Symptoms**:

- "Module not found" errors
- Import failures
- Build failures

**Possible Causes**:

1. Dependencies not installed
2. Corrupted node_modules
3. Wrong Node.js version
4. Path issues

**Solutions**:

1. **Clear npm cache**:

   ```bash
   npm cache clean --force
   ```

2. **Remove and reinstall dependencies**:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node.js version**:

   ```bash
   node --version
   # Should be 18.0.0 or higher
   ```

4. **Update Node.js if needed**:

   ```bash
   # Using nvm
   nvm install 20
   nvm use 20
   ```

5. **Verify installation**:
   ```bash
   npm run build
   npm test
   ```

---

### Build Errors

**Symptoms**:

- TypeScript compilation fails
- Build process exits with errors
- Type errors

**Possible Causes**:

1. TypeScript version mismatch
2. Missing type definitions
3. Syntax errors
4. Configuration issues

**Solutions**:

1. **Clean build artifacts**:

   ```bash
   rm -rf dist/
   ```

2. **Check TypeScript version**:

   ```bash
   npx tsc --version
   # Should be 5.0.0 or higher
   ```

3. **Update TypeScript**:

   ```bash
   npm install typescript@latest --save-dev
   ```

4. **Check tsconfig.json**:

   ```bash
   npx tsc --noEmit
   ```

5. **Fix type errors**:
   - Review error messages
   - Add missing type definitions
   - Fix syntax errors

---

### Permission Denied Errors

**Symptoms**:

- "Permission denied" errors
- Cannot write to directories
- Cannot execute scripts

**Possible Causes**:

1. File permissions
2. Directory ownership
3. Running as wrong user

**Solutions**:

1. **Fix file permissions**:

   ```bash
   chmod +x deploy/scripts/*.sh
   chmod -R 755 data/
   chmod 644 config/*.json
   ```

2. **Check ownership**:

   ```bash
   ls -la
   # Check owner and group
   ```

3. **Change ownership if needed**:

   ```bash
   sudo chown -R $USER:$USER .
   ```

4. **Run as correct user**:
   ```bash
   # Don't use sudo unless necessary
   npm start
   ```

---

## Configuration Issues

### Configuration Not Loading

**Symptoms**:

- Default configuration used instead of custom
- Environment variables ignored
- Hot reload not working

**Possible Causes**:

1. Wrong configuration file path
2. Invalid JSON syntax
3. File permissions
4. Environment variable issues

**Solutions**:

1. **Check configuration file**:

   ```bash
   cat config/default.json
   # Verify JSON is valid
   ```

2. **Validate JSON**:

   ```bash
   python3 -m json.tool config/default.json
   # or
   jq . config/default.json
   ```

3. **Check file path**:

   ```bash
   pwd
   ls -la config/
   ```

4. **Verify environment variables**:

   ```bash
   env | grep -E "PORT|LOG_LEVEL|NODE_ENV"
   ```

5. **Enable debug logging**:
   ```bash
   export LOG_LEVEL=debug
   npm start
   ```

---

### Hot Reload Not Working

**Symptoms**:

- Configuration changes not applied
- Server needs restart for changes
- Hot reload messages not in logs

**Possible Causes**:

1. Hot reload disabled
2. File watcher issues
3. Configuration file not watched
4. Wrong file path

**Solutions**:

1. **Enable hot reload**:

   ```json
   {
     "enableHotReload": true
   }
   ```

2. **Check configuration file path**:

   ```bash
   # Set correct path
   export CONFIG_PATH=./config/default.json
   ```

3. **Check logs for hot reload messages**:

   ```bash
   tail -f logs/mcp-server.log | grep -i "reload"
   ```

4. **Verify file watcher**:

   ```bash
   # Check if file is being watched
   lsof | grep config/default.json
   ```

5. **Restart server**:
   ```bash
   npm restart
   ```

---

## Performance Issues

### Slow Search Performance

**Symptoms**:

- Search queries take long time
- High response times
- Timeouts

**Possible Causes**:

1. Cold cache
2. Large result sets
3. Complex queries
4. Low system resources

**Solutions**:

1. **Enable cache warming**:

   ```json
   {
     "cache": {
       "enableWarming": true
     }
   }
   ```

2. **Increase cache size**:

   ```json
   {
     "cache": {
       "maxSize": 52428800,
       "maxEntries": 5000
     }
   }
   ```

3. **Limit result count**:

   ```json
   {
     "limit": 3
   }
   ```

4. **Use specific queries**:
   - Add filters
   - Use exact terms
   - Reduce query complexity

5. **Monitor performance**:

   ```bash
   curl http://localhost:3000/metrics
   ```

6. **Check system resources**:
   ```bash
   top
   free -h
   ```

---

### High Memory Usage

**Symptoms**:

- Memory usage increases over time
- Out of memory errors
- System slowdown

**Possible Causes**:

1. Memory leaks
2. Large cache size
3. Too many concurrent requests
4. Data not being freed

**Solutions**:

1. **Reduce cache size**:

   ```json
   {
     "cache": {
       "maxSize": 5242880,
       "maxEntries": 500
     }
   }
   ```

2. **Monitor memory usage**:

   ```bash
   ps aux | grep node
   # or
   curl http://localhost:3000/metrics | grep memory
   ```

3. **Reduce concurrent requests**:

   ```json
   {
     "maxConcurrentRequests": 50
   }
   ```

4. **Restart server periodically**:

   ```bash
   npm restart
   ```

5. **Check for memory leaks**:
   ```bash
   # Use Node.js profiler
   node --inspect dist/index.js
   ```

---

### High CPU Usage

**Symptoms**:

- CPU usage consistently high
- System slowdown
- Fan running constantly

**Possible Causes**:

1. Inefficient queries
2. Too many requests
3. Complex calculations
4. Infinite loops

**Solutions**:

1. **Monitor CPU usage**:

   ```bash
   top
   # or
   htop
   ```

2. **Check request rate**:

   ```bash
   curl http://localhost:3000/metrics | grep request_count
   ```

3. **Reduce concurrent requests**:

   ```json
   {
     "maxConcurrentRequests": 50
   }
   ```

4. **Optimize queries**:
   - Use filters
   - Limit results
   - Cache frequently accessed data

5. **Profile the application**:
   ```bash
   node --prof dist/index.js
   ```

---

## Search Issues

### Irrelevant Search Results

**Symptoms**:

- Search results don't match query
- Low relevance scores
- Unexpected endpoints returned

**Possible Causes**:

1. Poor query formulation
2. Vector embeddings not trained well
3. Metadata issues
4. Scoring weights misconfigured

**Solutions**:

1. **Improve query formulation**:
   - Use more specific terms
   - Include relevant keywords
   - Use natural language

2. **Check relevance scores**:

   ```json
   {
     "query": "customer",
     "limit": 5
   }
   # Review scores in response
   ```

3. **Use filters**:

   ```json
   {
     "query": "customer",
     "resource": "customers",
     "method": "POST"
   }
   ```

4. **Rebuild index**:

   ```bash
   npm run build-all-indexes
   ```

5. **Check metadata**:
   ```bash
   cat data/metadata-index.json | jq '.endpoints[0]'
   ```

---

### Search Timeout

**Symptoms**:

- Search requests timeout
- Long response times
- Request failures

**Possible Causes**:

1. Large result sets
2. Complex queries
3. System overload
4. Network issues

**Solutions**:

1. **Increase timeout**:

   ```json
   {
     "requestTimeout": 60000
   }
   ```

2. **Limit result count**:

   ```json
   {
     "limit": 3
   }
   ```

3. **Use filters**:

   ```json
   {
     "query": "customer",
     "resource": "customers"
   }
   ```

4. **Check system load**:

   ```bash
   top
   free -h
   ```

5. **Restart server**:
   ```bash
   npm restart
   ```

---

## Docker Issues

### Container Won't Start

**Symptoms**:

- Docker container fails to start
- Container exits immediately
- Error messages in docker logs

**Possible Causes**:

1. Port conflicts
2. Volume mount issues
3. Environment variable issues
4. Image build failures

**Solutions**:

1. **Check Docker logs**:

   ```bash
   docker-compose logs
   ```

2. **Check container status**:

   ```bash
   docker-compose ps
   ```

3. **Check port conflicts**:

   ```bash
   lsof -i :3000
   ```

4. **Rebuild image**:

   ```bash
   docker-compose build --no-cache
   ```

5. **Check volume mounts**:

   ```bash
   docker-compose config
   ```

6. **Verify environment variables**:
   ```bash
   docker-compose config | grep environment
   ```

---

### Docker Build Fails

**Symptoms**:

- Docker build fails
- Build errors
- Dependency issues

**Possible Causes**:

1. Invalid Dockerfile
2. Missing dependencies
3. Network issues
4. Disk space

**Solutions**:

1. **Check Dockerfile syntax**:

   ```bash
   docker build --no-cache -f deploy/Dockerfile .
   ```

2. **Check available disk space**:

   ```bash
   df -h
   ```

3. **Clean Docker cache**:

   ```bash
   docker system prune -a
   ```

4. **Check network connectivity**:

   ```bash
   ping registry.npmjs.org
   ```

5. **Use build arguments**:
   ```bash
   docker build --build-arg NODE_ENV=production .
   ```

---

### Docker Container Crashes

**Symptoms**:

- Container stops unexpectedly
- Restart loops
- Health check failures

**Possible Causes**:

1. Application errors
2. Resource exhaustion
3. Configuration issues
4. Signal handling

**Solutions**:

1. **Check container logs**:

   ```bash
   docker logs <container_id>
   ```

2. **Check container resources**:

   ```bash
   docker stats
   ```

3. **Check restart policy**:

   ```bash
   docker inspect <container_id> | grep RestartPolicy
   ```

4. **Increase resource limits**:

   ```yaml
   services:
     mcp-repairshopr:
       deploy:
         resources:
           limits:
             memory: 1G
   ```

5. **Check health check**:
   ```bash
   docker inspect <container_id> | grep Health
   ```

---

## Network Issues

### Connection Refused

**Symptoms**:

- "Connection refused" errors
- Cannot connect to server
- Port not accessible

**Possible Causes**:

1. Server not running
2. Firewall blocking
3. Wrong port
4. Network issues

**Solutions**:

1. **Check if server is running**:

   ```bash
   ps aux | grep node
   ```

2. **Check port accessibility**:

   ```bash
   telnet localhost 3000
   # or
   nc -zv localhost 3000
   ```

3. **Check firewall**:

   ```bash
   sudo ufw status
   # or
   sudo iptables -L
   ```

4. **Allow port through firewall**:

   ```bash
   sudo ufw allow 3000
   ```

5. **Check network connectivity**:
   ```bash
   ping localhost
   ```

---

### Timeout Errors

**Symptoms**:

- Request timeouts
- Slow responses
- Connection drops

**Possible Causes**:

1. Network latency
2. Server overload
3. Firewall timeouts
4. DNS issues

**Solutions**:

1. **Increase timeout**:

   ```json
   {
     "requestTimeout": 60000
   }
   ```

2. **Check network latency**:

   ```bash
   ping -c 10 localhost
   ```

3. **Check server load**:

   ```bash
   top
   ```

4. **Check DNS resolution**:

   ```bash
   nslookup localhost
   ```

5. **Use direct IP**:
   ```bash
   curl http://127.0.0.1:3000/health
   ```

---

## Debugging Guide

### Enable Debug Logging

1. **Set log level to debug**:

   ```bash
   export LOG_LEVEL=debug
   npm start
   ```

2. **Or in configuration file**:

   ```json
   {
     "logLevel": "debug"
   }
   ```

3. **View debug logs**:
   ```bash
   tail -f logs/mcp-server.log
   ```

### Use Node.js Debugger

1. **Start with inspect flag**:

   ```bash
   node --inspect dist/index.js
   ```

2. **Connect with Chrome DevTools**:
   - Open Chrome
   - Navigate to `chrome://inspect`
   - Click "Inspect" for the target

3. **Set breakpoints**:
   - Open DevTools
   - Go to Sources tab
   - Set breakpoints in code

### Profile Performance

1. **Generate CPU profile**:

   ```bash
   node --prof dist/index.js
   # Press Ctrl+C after some time
   ```

2. **Process profile**:

   ```bash
   node --prof-process isolate-*.log > profile.txt
   ```

3. **Analyze profile**:
   ```bash
   cat profile.txt
   ```

### Monitor Metrics

1. **Access metrics endpoint**:

   ```bash
   curl http://localhost:3000/metrics
   ```

2. **Monitor with Prometheus**:

   ```bash
   # Configure Prometheus to scrape metrics
   # See deploy/prometheus.yml
   ```

3. **View in Grafana**:
   - Set up Grafana dashboard
   - Add Prometheus data source
   - Create visualizations

### Check Logs

1. **View recent logs**:

   ```bash
   tail -n 100 logs/mcp-server.log
   ```

2. **Follow logs in real-time**:

   ```bash
   tail -f logs/mcp-server.log
   ```

3. **Search for errors**:

   ```bash
   grep -i "error" logs/mcp-server.log
   ```

4. **Search for warnings**:
   ```bash
   grep -i "warn" logs/mcp-server.log
   ```

### Test Individual Components

1. **Test cache**:

   ```bash
   curl -X POST http://localhost:3000/tools/test_cache
   ```

2. **Test vector store**:

   ```bash
   curl -X POST http://localhost:3000/tools/test_vector_store
   ```

3. **Test metadata index**:
   ```bash
   curl -X POST http://localhost:3000/tools/test_metadata_index
   ```

### Get Support

If you cannot resolve the issue:

1. **Check documentation**:
   - [User Guide](../user/USER_GUIDE.md)
   - [Installation Guide](../user/INSTALLATION.md)
   - [Configuration Guide](../user/CONFIGURATION.md)

2. **Search existing issues**:
   - GitHub Issues
   - Stack Overflow
   - Community forums

3. **Create a bug report**:
   - Describe the issue
   - Provide steps to reproduce
   - Include error messages
   - Share system information

4. **Contact support**:
   - Email: support@example.com
   - Discord: #support channel
   - Slack: #mcp-repairshopr

---

## System Information Collection

When reporting issues, collect the following information:

```bash
# System information
uname -a
cat /etc/os-release

# Node.js information
node --version
npm --version

# Project information
git log -1
git status

# Server status
ps aux | grep node
curl http://localhost:3000/health

# Logs
tail -n 100 logs/mcp-server.log

# Resources
free -h
df -h
top -n 1
```

For more information, see:

- [User Guide](../user/USER_GUIDE.md)
- [Installation Guide](../user/INSTALLATION.md)
- [Configuration Guide](../user/CONFIGURATION.md)
- [FAQ](../user/FAQ.md)
