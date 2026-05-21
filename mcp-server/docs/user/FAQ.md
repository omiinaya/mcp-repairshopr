# MCP RepairShopr FAQ

## General Questions

### What is MCP RepairShopr?

MCP RepairShopr is a Model Context Protocol (MCP) server that provides intelligent access to RepairShopr API documentation. It enables AI assistants to search, retrieve, and understand API endpoints, parameters, responses, and permissions through semantic search and structured data retrieval.

### What can I do with MCP RepairShopr?

With MCP RepairShopr, you can:

- Search for API endpoints using natural language
- Get detailed information about specific endpoints
- Retrieve parameter and response documentation
- Understand permission requirements
- Generate code examples in multiple languages
- Explore available API resources

### Do I need a RepairShopr account to use MCP RepairShopr?

No, MCP RepairShopr provides access to the API documentation only. You don't need a RepairShopr account to search and retrieve documentation. However, to make actual API calls to RepairShopr, you would need a valid API key from RepairShopr.

### Is MCP RepairShopr free?

Yes, MCP RepairShopr is open-source and free to use. You can install and run it on your own infrastructure.

## Installation and Setup

### How do I install MCP RepairShopr?

See the [Installation Guide](./INSTALLATION.md) for detailed installation instructions. You can install using Docker (recommended for production) or manually (recommended for development).

### What are the system requirements?

Minimum requirements:

- Node.js 18 or higher
- 512 MB RAM
- 100 MB disk space

Recommended requirements:

- Node.js 20 LTS
- 2 GB RAM
- 1 GB disk space

### Can I run MCP RepairShopr on Windows?

Yes, you can run MCP RepairShopr on Windows using:

- Docker Desktop (recommended)
- Windows Subsystem for Linux (WSL2)
- Node.js directly on Windows

### How do I update MCP RepairShopr?

For Docker installations:

```bash
cd deploy
./docker-deploy.sh production stop
docker pull mcp-repairshopr:latest
./docker-deploy.sh production deploy
```

For manual installations:

```bash
git pull origin main
npm install
npm run build
npm restart
```

## Usage

### How do I search for API endpoints?

Use the `search_api_docs` tool with a natural language query:

```json
{
  "query": "create new customer",
  "limit": 5
}
```

### How do I get detailed information about an endpoint?

Use the `get_endpoint` tool:

```json
{
  "path": "/customers/{id}",
  "method": "GET",
  "includeRelated": true
}
```

### How do I generate code examples?

Use the `generate_code_example` tool:

```json
{
  "endpoint_path": "/customers",
  "method": "POST",
  "language": "python",
  "include_auth": true
}
```

### What programming languages are supported for code examples?

Currently supported languages:

- JavaScript
- Python
- cURL

### How do I filter search results?

You can filter by:

- `resource`: Specific API resource (e.g., customers, tickets)
- `method`: HTTP method (GET, POST, PUT, DELETE, PATCH)
- `permission`: Required permission level

Example:

```json
{
  "query": "customer",
  "method": "POST",
  "limit": 3
}
```

## Configuration

### How do I change the server port?

Edit the configuration file or set the `PORT` environment variable:

```bash
export PORT=8080
npm start
```

Or in `config/default.json`:

```json
{
  "port": 8080
}
```

### How do I enable debug logging?

Set the log level to debug:

```bash
export LOG_LEVEL=debug
npm start
```

Or in `config/default.json`:

```json
{
  "logLevel": "debug"
}
```

### How do I increase cache size?

Edit the cache configuration in `config/default.json`:

```json
{
  "cache": {
    "maxSize": 52428800
  }
}
```

### How do I configure hot reload?

Set `enableHotReload` to true in your configuration:

```json
{
  "enableHotReload": true
}
```

**Note:** Hot reload is recommended for development only.

## Performance

### How can I improve search performance?

To improve search performance:

1. Increase cache size
2. Enable cache warming
3. Use specific queries
4. Filter results when possible

### Why are my searches slow?

Slow searches can be caused by:

1. Cold cache (first searches are slower)
2. Large result sets
3. Complex queries
4. Low system resources

Try:

- Increasing cache size
- Using more specific queries
- Limiting result count

### How much memory does MCP RepairShopr use?

Memory usage depends on:

- Cache size configuration
- Number of concurrent requests
- Data being processed

Typical usage:

- Minimum: ~100 MB
- Recommended: ~200-500 MB
- High traffic: ~1 GB+

## Troubleshooting

### The server won't start

Check the following:

1. Verify Node.js is installed: `node --version`
2. Check if port is already in use: `lsof -i :3000`
3. Review logs: `tail -f logs/mcp-server.log`
4. Verify configuration file syntax

### I get "module not found" errors

Clear npm cache and reinstall dependencies:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Search returns no results

Try:

1. Rephrase your query
2. Use different keywords
3. Check for typos
4. Try a broader search term
5. Verify the data files exist

### Health check fails

Check:

1. Server is running: `ps aux | grep node`
2. Port is accessible: `curl http://localhost:3000/health`
3. Logs for errors: `tail -f logs/mcp-server.log`
4. Configuration is valid

### Docker container won't start

Check:

1. Docker is running: `docker ps`
2. Image exists: `docker images | grep mcp-repairshopr`
3. Port is not in use: `lsof -i :3000`
4. Container logs: `docker-compose logs`

## Integration

### How do I integrate MCP RepairShopr with my AI assistant?

MCP RepairShopr follows the Model Context Protocol standard. Configure your AI assistant to connect to the MCP server using the appropriate MCP client library.

### Can I use MCP RepairShopr with multiple AI assistants?

Yes, multiple AI assistants can connect to the same MCP RepairShopr server instance, as long as they support the MCP protocol.

### How do I monitor MCP RepairShopr?

Enable monitoring in your configuration:

```json
{
  "monitoring": {
    "enabled": true,
    "interval": 60000
  }
}
```

Then access the metrics endpoint:

```bash
curl http://localhost:3000/metrics
```

### Can I use Prometheus for monitoring?

Yes, MCP RepairShopr provides Prometheus-compatible metrics. See the [Deployment Guide](../deployment/DEPLOYMENT.md) for setup instructions.

## Security

### Is MCP RepairShopr secure?

MCP RepairShopr is designed with security in mind:

- Runs as non-root user in Docker
- No sensitive data stored
- Configurable logging levels
- Request timeout protection

### Do I need to secure the server?

Yes, in production environments you should:

1. Use a reverse proxy (nginx, Apache)
2. Enable HTTPS/TLS
3. Implement authentication
4. Restrict network access
5. Monitor logs for suspicious activity

### What data does MCP RepairShopr store?

MCP RepairShopr stores:

- API documentation metadata
- Search cache (temporary)
- Application logs

No user data or API keys are stored.

## Development

### How do I contribute to MCP RepairShopr?

See the [Contribution Guide](../developer/CONTRIBUTING.md) for information on contributing to the project.

### How do I run tests?

Run all tests:

```bash
npm test
```

Run specific test suites:

```bash
npm run test:unit
npm run test:integration
npm run test:performance
```

### How do I build the project?

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### How do I run in development mode?

```bash
npm run dev
```

This starts the server with hot reload enabled.

## Support

### Where can I get help?

- Documentation: Check the [docs](../) directory
- Issues: Report bugs on GitHub
- Community: Join our Discord/Slack community

### How do I report a bug?

Report bugs on GitHub with:

- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details

### How do I request a feature?

Request features on GitHub Issues with:

- Feature description
- Use case
- Proposed implementation (optional)

## Licensing

### What license is MCP RepairShopr released under?

MCP RepairShopr is released under the MIT License. See the LICENSE file for details.

### Can I use MCP RepairShopr commercially?

Yes, you can use MCP RepairShopr in commercial projects under the MIT License.

### Can I modify MCP RepairShopr?

Yes, you can modify the source code under the MIT License. We encourage contributions back to the project.

## Additional Resources

- [User Guide](./USER_GUIDE.md)
- [Installation Guide](./INSTALLATION.md)
- [Configuration Guide](./CONFIGURATION.md)
- [API Documentation](../api/README.md)
- [Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md)
- [Deployment Guide](../deployment/DEPLOYMENT.md)
