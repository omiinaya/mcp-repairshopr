# MCP RepairShopr Architecture

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Module Organization](#module-organization)
6. [Design Patterns](#design-patterns)
7. [Technology Stack](#technology-stack)
8. [Scalability Considerations](#scalability-considerations)

## Overview

MCP RepairShopr is a Model Context Protocol (MCP) server that provides intelligent access to RepairShopr API documentation. The architecture is designed to be modular, extensible, and performant.

### Key Design Principles

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Modularity**: Components are loosely coupled and can be developed independently
3. **Extensibility**: Easy to add new tools and functionality
4. **Performance**: Caching and optimization for fast response times
5. **Maintainability**: Clean code structure and comprehensive documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│                  (AI Assistants, Applications)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ MCP Protocol
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      Protocol Handler                        │
│  - Request/Response Processing                               │
│  - Tool Registration                                         │
│  - Error Handling                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
│   Tools      │  │  Retrieval  │  │  Cache     │
│              │  │             │  │            │
│ - Search     │  │ - Query     │  │ - LRU      │
│ - Endpoint   │  │   Analysis  │  │ - TTL      │
│ - Parameters │  │ - Scoring   │  │ - Warming  │
│ - Responses  │  │ - Context   │  │            │
│ - Permissions│  │   Manager   │  │            │
│ - Resources  │  │             │  │            │
│ - Code       │  │             │  │            │
└──────┬───────┘  └──────┬──────┘  └─────┬──────┘
       │                 │                │
       │                 │                │
       └─────────────────┼────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
│   Parser     │  │  Indexer    │  │ Monitoring │
│              │  │             │  │            │
│ - Markdown   │  │ - Vector    │  │ - Metrics  │
│ - Metadata   │  │   Store     │  │ - Health   │
│ - Schema     │  │ - Embeddings│  │ - Logging  │
│              │  │ - Index     │  │            │
└──────┬───────┘  └──────┬──────┘  └─────┬──────┘
       │                 │                │
       │                 │                │
       └─────────────────┼────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
│   Data       │  │  Config     │  │  Utils     │
│              │  │             │  │            │
│ - Metadata   │  │ - Server    │  │ - Logger   │
│   Index      │  │ - Cache     │  │ - Types    │
│ - API Docs   │  │ - Monitor   │  │ - Config   │
└──────────────┘  └─────────────┘  └────────────┘
```

## Component Architecture

### 1. Protocol Handler ([`src/server/protocol-handler.ts`](../../src/server/protocol-handler.ts))

**Responsibility**: Handle MCP protocol communication

**Key Features**:
- Request parsing and validation
- Response formatting
- Tool registration and invocation
- Error handling

**Interfaces**:
```typescript
interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: any) => Promise<any>;
}
```

### 2. Tool Registry ([`src/server/tool-registry.ts`](../../src/server/tool-registry.ts))

**Responsibility**: Manage tool definitions and metadata

**Key Features**:
- Tool registration
- Version management
- Dependency tracking
- Deprecation handling

**Interfaces**:
```typescript
interface ToolDefinition {
  name: string;
  description: string;
  version: string;
  deprecated: boolean;
  dependencies: string[];
  inputSchema: any;
}
```

### 3. Search Tool ([`src/tools/search.ts`](../../src/tools/search.ts))

**Responsibility**: Implement semantic and keyword search

**Key Features**:
- Vector similarity search
- Keyword matching
- Result ranking
- Context extraction

### 4. Endpoint Tool ([`src/tools/endpoint.ts`](../../src/tools/endpoint.ts))

**Responsibility**: Retrieve endpoint information

**Key Features**:
- Endpoint lookup by path or resource
- Related endpoint discovery
- Endpoint details extraction

### 5. Parameters Tool ([`src/tools/parameters.ts`](../../src/tools/parameters.ts))

**Responsibility**: Retrieve parameter information

**Key Features**:
- Parameter extraction
- Type information
- Validation hints
- Constraint documentation

### 6. Responses Tool ([`src/tools/responses.ts`](../../src/tools/responses.ts))

**Responsibility**: Retrieve response information

**Key Features**:
- Response schema extraction
- Status code information
- Error documentation
- Example responses

### 7. Permissions Tool ([`src/tools/permissions.ts`](../../src/tools/permissions.ts))

**Responsibility**: Retrieve permission information

**Key Features**:
- Permission lookup
- Permission hierarchy
- Permission matrix generation
- Permission summaries

### 8. Resources Tool ([`src/tools/resources.ts`](../../src/tools/resources.ts))

**Responsibility**: List and explore API resources

**Key Features**:
- Resource listing
- Endpoint enumeration
- Relationship discovery
- Statistics generation

### 9. Code Examples Tool ([`src/tools/code-examples.ts`](../../src/tools/code-examples.ts))

**Responsibility**: Generate code examples

**Key Features**:
- Multi-language support (JavaScript, Python, cURL)
- Authentication handling
- Error handling patterns
- Request/response examples

### 10. Query Understanding ([`src/retrieval/query.ts`](../../src/retrieval/query.ts))

**Responsibility**: Analyze and understand user queries

**Key Features**:
- Intent classification
- Entity extraction
- Query expansion
- Suggestion generation

### 11. Relevance Scorer ([`src/retrieval/scoring.ts`](../../src/retrieval/scoring.ts))

**Responsibility**: Score and rank search results

**Key Features**:
- Semantic similarity scoring
- Keyword matching scoring
- Recency scoring
- Popularity scoring
- Custom scoring rules

### 12. Context Manager ([`src/retrieval/formatter.ts`](../../src/retrieval/formatter.ts))

**Responsibility**: Format and optimize search results

**Key Features**:
- Multiple output formats (Markdown, JSON, HTML)
- Context window optimization
- Token counting
- Result truncation

### 13. Vector Store ([`src/indexer/vector.ts`](../../src/indexer/vector.ts))

**Responsibility**: Store and query vector embeddings

**Key Features**:
- Vector storage
- Similarity search
- Batch operations
- Index management

### 14. Metadata Index ([`src/parser/metadata.ts`](../../src/parser/metadata.ts))

**Responsibility**: Parse and index API documentation metadata

**Key Features**:
- Markdown parsing
- Metadata extraction
- Schema validation
- Index building

### 15. Cache ([`src/cache/cache.ts`](../../src/cache/cache.ts))

**Responsibility**: Cache frequently accessed data

**Key Features**:
- LRU eviction policy
- TTL-based expiration
- Cache warming
- Statistics tracking

### 16. Monitoring Service ([`src/server/monitoring.ts`](../../src/server/monitoring.ts))

**Responsibility**: Monitor server health and performance

**Key Features**:
- Health checks
- Metrics collection
- Performance tracking
- Alert generation

### 17. Configuration Manager ([`src/server/configuration.ts`](../../src/server/configuration.ts))

**Responsibility**: Manage server configuration

**Key Features**:
- Configuration loading
- Environment-specific configs
- Hot reload support
- Schema validation

## Data Flow

### Search Request Flow

```
1. Client sends search request
   ↓
2. Protocol Handler receives and validates request
   ↓
3. Query Understanding analyzes query
   ↓
4. Vector Store performs similarity search
   ↓
5. Metadata Index filters results
   ↓
6. Relevance Scorer ranks results
   ↓
7. Context Manager formats results
   ↓
8. Cache stores results
   ↓
9. Protocol Handler sends response
   ↓
10. Client receives formatted results
```

### Endpoint Lookup Flow

```
1. Client sends endpoint lookup request
   ↓
2. Protocol Handler receives and validates request
   ↓
3. Cache checks for cached results
   ↓
4. If cache miss, Metadata Index retrieves endpoint
   ↓
5. Endpoint Tool extracts details
   ↓
6. Context Manager formats results
   ↓
7. Cache stores results
   ↓
8. Protocol Handler sends response
   ↓
9. Client receives endpoint details
```

## Module Organization

```
src/
├── index.ts                 # Entry point
├── server.ts                # Main server implementation
├── server/                  # Server components
│   ├── protocol-handler.ts  # MCP protocol handling
│   ├── tool-registry.ts     # Tool registration
│   ├── configuration.ts     # Configuration management
│   ├── monitoring.ts        # Monitoring service
│   ├── structured-logger.ts # Structured logging
│   └── health-check.ts      # Health check endpoints
├── tools/                   # Tool implementations
│   ├── search.ts            # Search tool
│   ├── endpoint.ts          # Endpoint tool
│   ├── parameters.ts        # Parameters tool
│   ├── responses.ts         # Responses tool
│   ├── permissions.ts       # Permissions tool
│   ├── resources.ts         # Resources tool
│   └── code-examples.ts     # Code examples tool
├── retrieval/               # Retrieval components
│   ├── query.ts             # Query understanding
│   ├── scoring.ts           # Relevance scoring
│   └── formatter.ts         # Result formatting
├── indexer/                 # Indexing components
│   ├── vector.ts            # Vector store
│   ├── embeddings.ts        # Embedding generation
│   └── index-builder.ts     # Index building
├── parser/                  # Parsing components
│   ├── markdown.ts          # Markdown parsing
│   ├── metadata.ts          # Metadata extraction
│   └── schema.ts            # Schema validation
├── cache/                   # Caching layer
│   └── cache.ts             # Cache implementation
└── utils/                   # Utilities
    ├── logger.ts            # Logging utility
    ├── config.ts            # Configuration utility
    └── types.ts             # Type definitions
```

## Design Patterns

### 1. Registry Pattern

Used by the Tool Registry to manage tool definitions and handlers.

**Benefits**:
- Centralized tool management
- Easy tool registration and lookup
- Version and dependency tracking

### 2. Strategy Pattern

Used by the Relevance Scorer to support multiple scoring strategies.

**Benefits**:
- Flexible scoring algorithms
- Easy to add new scoring methods
- Configurable scoring weights

### 3. Factory Pattern

Used by the Context Manager to create different output formats.

**Benefits**:
- Consistent object creation
- Easy to add new formats
- Centralized format logic

### 4. Observer Pattern

Used by the Monitoring Service to track server events.

**Benefits**:
- Decoupled event handling
- Easy to add new observers
- Real-time monitoring

### 5. Singleton Pattern

Used by the Configuration Manager to ensure single configuration instance.

**Benefits**:
- Consistent configuration access
- Reduced memory usage
- Thread-safe access

## Technology Stack

### Core Technologies

- **Node.js**: Runtime environment
- **TypeScript**: Type-safe JavaScript
- **@modelcontextprotocol/sdk**: MCP protocol implementation

### Data Processing

- **Vector Store**: In-memory vector storage with similarity search
- **Markdown Parser**: Custom markdown parsing for API docs
- **Schema Validation**: JSON schema validation

### Caching

- **LRU Cache**: Least Recently Used cache implementation
- **TTL**: Time-to-live based expiration

### Monitoring

- **Metrics**: Custom metrics collection
- **Health Checks**: Periodic health monitoring
- **Logging**: Structured JSON logging

### Testing

- **Jest**: Testing framework
- **ts-jest**: TypeScript preprocessor for Jest

## Scalability Considerations

### Horizontal Scaling

The server can be horizontally scaled by:

1. **Load Balancing**: Distribute requests across multiple instances
2. **Shared Cache**: Use Redis or Memcached for distributed caching
3. **Stateless Design**: Each instance is independent and stateless

### Vertical Scaling

The server can be vertically scaled by:

1. **Increasing Resources**: More CPU, memory, and storage
2. **Optimizing Cache**: Larger cache sizes and longer TTLs
3. **Batch Processing**: Process multiple requests concurrently

### Performance Optimization

Key optimization strategies:

1. **Caching**: Aggressive caching of frequently accessed data
2. **Indexing**: Efficient vector and metadata indexes
3. **Lazy Loading**: Load data only when needed
4. **Connection Pooling**: Reuse connections for external services
5. **Compression**: Compress large responses

### Resource Management

- **Memory**: Monitor and limit memory usage
- **CPU**: Optimize CPU-intensive operations
- **Disk**: Efficient data storage and retrieval
- **Network**: Minimize network calls and data transfer

## Future Enhancements

Potential architectural improvements:

1. **Distributed Caching**: Redis or Memcached integration
2. **Message Queue**: Async processing for heavy operations
3. **Microservices**: Split into smaller, focused services
4. **GraphQL**: Alternative query interface
5. **Real-time Updates**: WebSocket support for live updates
6. **Machine Learning**: Enhanced query understanding with ML models

For more information, see:
- [Development Setup Guide](./DEVELOPMENT_SETUP.md)
- [API Reference](./API_REFERENCE.md)
- [Testing Guide](./TESTING.md)
