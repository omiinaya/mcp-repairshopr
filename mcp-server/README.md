# MCP RepairShopr

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/mcp-repairshopr/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/mcp-repairshopr/actions/workflows/ci.yml)
[![Docker Image](https://img.shields.io/badge/docker-ghcr.io-blue?logo=docker)](https://ghcr.io/YOUR_USERNAME/mcp-repairshopr)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

MCP server for RepairShopr API documentation search and live API integration.

## Features

- **Semantic & Keyword Search**: Search RepairShopr API documentation with intelligent matching
- **7 MCP Tools**: Comprehensive API documentation access
- **Live API Integration**: Optional connection to RepairShopr API for real data
- **Production Ready**: Docker containerization, health checks, monitoring, and rate limiting
- **Coolify Compatible**: One-click deployment on Coolify

## Quick Deploy

### Deploy on Coolify

[![Deploy on Coolify](https://coolify.io/badge.svg)](https://coolify.io/deploy?url=https://github.com/YOUR_USERNAME/mcp-repairshopr)

Or manually:

1. Fork this repository
2. In Coolify, create a new service from your fork
3. Use `docker-compose.coolify.yml` configuration
4. Set environment variables (see below)

## Environment Variables

### Required

| Variable   | Description      | Default      |
| ---------- | ---------------- | ------------ |
| `NODE_ENV` | Environment mode | `production` |
| `PORT`     | Server port      | `3000`       |

### Optional

| Variable                | Description                           | Default |
| ----------------------- | ------------------------------------- | ------- |
| `LOG_LEVEL`             | Logging level (error/warn/info/debug) | `info`  |
| `LOG_FORMAT`            | Log format (json/plain)               | `json`  |
| `REPAIRSHOPR_API_KEY`   | Your RepairShopr API key              | -       |
| `REPAIRSHOPR_SUBDOMAIN` | Your RepairShopr subdomain            | -       |

See [deploy/.env.example](deploy/.env.example) for all available options.

## Installation

```bash
npm install
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## Docker

```bash
# Build image
docker build -f deploy/Dockerfile -t mcp-repairshopr .

# Run container
docker run -p 3000:3000 mcp-repairshopr

# Or use docker-compose
docker-compose -f deploy/docker-compose.yml up
```

## Health Endpoints

The server provides Kubernetes-style health checks:

- `GET /health` - Comprehensive health status
- `GET /ready` - Readiness probe (can accept traffic)
- `GET /live` - Liveness probe (is alive)
- `GET /metrics` - Prometheus metrics

## API Tools

The MCP server provides these tools:

1. `search_api_docs` - Search documentation with filters
2. `get_endpoint` - Get detailed endpoint information
3. `get_parameters` - Get parameter details
4. `get_responses` - Get response schemas
5. `get_permissions` - Get permission requirements
6. `list_resources` - List all API resources
7. `generate_code_example` - Generate code examples

## Project Structure

```
mcp-server/
├── src/
│   ├── tools/          # Tool implementations
│   ├── parser/         # Document parsing
│   ├── indexer/        # Vector indexing
│   ├── retrieval/      # Context retrieval
│   ├── cache/          # Caching layer
│   ├── middleware/     # Express middleware (rate limiting, etc.)
│   ├── server/         # Server components
│   ├── config/         # Configuration & secrets
│   └── utils/          # Utilities
├── tests/              # Test suites
├── deploy/             # Deployment configs
├── docs/               # Documentation
└── data/               # Data files
```

## Configuration

Copy `deploy/.env.example` to `.env` and configure:

```bash
cp deploy/.env.example .env
# Edit .env with your settings
```

## Monitoring

Prometheus metrics are available at `/metrics`:

- `mcp_server_uptime_seconds`
- `mcp_server_requests_total`
- `mcp_server_memory_usage_bytes`
- `mcp_server_cache_hit_ratio`

## License

MIT
