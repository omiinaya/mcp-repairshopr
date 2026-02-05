# MCP RepairShopr API Reference

## Table of Contents

1. [Overview](#overview)
2. [MCP Tools](#mcp-tools)
3. [Tool Definitions](#tool-definitions)
4. [Response Formats](#response-formats)
5. [Error Handling](#error-handling)

## Overview

This document provides a comprehensive reference for all MCP tools available in the MCP RepairShopr server. Each tool is documented with its parameters, return values, and usage examples.

## MCP Tools

### search_api_docs

Search RepairShopr API documentation using semantic and keyword search.

**Tool Name**: `search_api_docs`

**Description**: Search for API endpoints using natural language queries with semantic understanding and keyword matching.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query in natural language |
| `resource` | string | No | Filter by resource name (e.g., customers, tickets) |
| `method` | string | No | Filter by HTTP method (GET, POST, PUT, DELETE, PATCH) |
| `permission` | string | No | Filter by permission |
| `limit` | number | No | Maximum results to return (default: 5) |

**Returns**:

```typescript
interface SearchResponse {
  results: SearchResult[];
  formatted: {
    markdown: string;
    json: any;
    html: string;
    tokenCount: number;
  };
  queryAnalysis?: QueryAnalysis;
}

interface SearchResult {
  endpoint: {
    resource: string;
    operation: string;
    description: string;
    method: string;
    path: string;
    permission: string;
  };
  score: number;
  relevanceScore?: RelevanceScore;
  context: string;
  matchType: 'semantic' | 'keyword' | 'hybrid';
}
```

**Example**:

```json
{
  "query": "create new customer",
  "limit": 3
}
```

---

### get_endpoint

Get detailed information about a specific API endpoint.

**Tool Name**: `get_endpoint`

**Description**: Retrieve comprehensive information about a specific API endpoint including parameters, responses, and related endpoints.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | No* | Endpoint path (e.g., /customers/{id}) |
| `method` | string | No* | HTTP method (GET, POST, PUT, DELETE, PATCH) |
| `resource` | string | No* | Resource name (alternative to path) |
| `includeRelated` | boolean | No | Include related endpoints (default: false) |

*At least one of `path` or `resource` must be provided.

**Returns**:

```typescript
interface EndpointResponse {
  success: boolean;
  exactMatch?: boolean;
  endpoint?: EndpointDetails;
  formatted?: {
    markdown: string;
    json: any;
    html: string;
  };
  relatedEndpoints?: {
    sameResource: Endpoint[];
    relatedByParameters: Endpoint[];
    samePermission: Endpoint[];
  };
  count?: number;
  endpoints?: EndpointDetails[];
}

interface EndpointDetails {
  resource: string;
  operation: string;
  description: string;
  method: string;
  path: string;
  permission: string;
  parameters: Parameter[];
  responses: Response[];
  examples: Example[];
}
```

**Example**:

```json
{
  "path": "/customers/{id}",
  "method": "GET",
  "includeRelated": true
}
```

---

### get_parameters

Get parameter information for an API endpoint.

**Tool Name**: `get_parameters`

**Description**: Retrieve detailed parameter information including types, constraints, and validation hints.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endpoint_path` | string | Yes | Endpoint path (e.g., /customers/{id}) |
| `method` | string | Yes | HTTP method (GET, POST, PUT, DELETE, PATCH) |
| `param_type` | string | No | Filter by parameter type (query, path, body) |

**Returns**:

```typescript
interface ParametersResponse {
  success: boolean;
  endpointPath: string;
  method: string;
  parameters: Parameter[];
  formatted: {
    markdown: string;
    json: any;
    html: string;
  };
  totalCount: number;
  requiredCount: number;
  optionalCount: number;
}

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  paramType: 'query' | 'path' | 'body';
  constraints?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: string[];
  };
  validationHints?: string[];
  pattern?: {
    name: string;
    description: string;
  };
}
```

**Example**:

```json
{
  "endpoint_path": "/customers",
  "method": "POST",
  "param_type": "body"
}
```

---

### get_responses

Get response information for an API endpoint.

**Tool Name**: `get_responses`

**Description**: Retrieve response information including status codes, schemas, examples, and error documentation.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endpoint_path` | string | Yes | Endpoint path (e.g., /customers/{id}) |
| `method` | string | Yes | HTTP method (GET, POST, PUT, DELETE, PATCH) |
| `status_code` | string | No | Filter by status code (optional) |

**Returns**:

```typescript
interface ResponsesResponse {
  success: boolean;
  endpointPath: string;
  method: string;
  responses: Response[];
  formatted: {
    markdown: string;
    json: any;
    html: string;
  };
  totalCount: number;
  successCount: number;
  errorCount: number;
  commonPatterns: ResponsePattern[];
}

interface Response {
  statusCode: string;
  statusCodeInfo: StatusCodeInfo;
  description: string;
  example?: any;
  schema?: any;
  errorDocumentation?: string;
  formatDescription?: string;
  pattern?: ResponsePattern;
}

interface StatusCodeInfo {
  code: number;
  category: 'success' | 'error' | 'redirect';
  name: string;
  description: string;
  isSuccess: boolean;
  isError: boolean;
  isRedirect: boolean;
}
```

**Example**:

```json
{
  "endpoint_path": "/customers/{id}",
  "method": "GET"
}
```

---

### get_permissions

Get permission requirements for API endpoints.

**Tool Name**: `get_permissions`

**Description**: Retrieve permission requirements including descriptions, hierarchy, and usage information.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endpoint_path` | string | No* | Endpoint path (e.g., /customers/{id}) |
| `method` | string | No* | HTTP method (required when using endpoint_path) |
| `resource` | string | No* | Resource name (alternative to endpoint_path) |
| `permission` | string | No* | Filter by permission name |
| `include_matrix` | boolean | No | Include permission matrix (default: false) |
| `include_summaries` | boolean | No | Include permission summaries (default: false) |

*At least one of `endpoint_path`, `resource`, or `permission` must be provided.

**Returns**:

```typescript
interface PermissionsResponse {
  totalPermissions: number;
  permission?: Permission;
  allPermissions?: Permission[];
  summaries?: PermissionSummary[];
  matrix?: PermissionMatrix;
}

interface Permission {
  name: string;
  description: {
    name: string;
    description: string;
    category: string;
    operations: string[];
  };
  endpoints: Endpoint[];
  hierarchy: PermissionHierarchy;
}

interface PermissionHierarchy {
  parent?: string;
  children?: string[];
  level: number;
}
```

**Example**:

```json
{
  "resource": "customers",
  "include_summaries": true
}
```

---

### list_resources

List all available API resources with summary information.

**Tool Name**: `list_resources`

**Description**: Retrieve all available API resources with summary information, endpoints, relationships, and statistics.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `include_endpoints` | boolean | No | Include endpoint details (default: false) |
| `include_relationships` | boolean | No | Include resource relationships (default: false) |

**Returns**:

```typescript
interface ResourcesResponse {
  totalResources: number;
  overallStatistics: OverallStatistics;
  resources: ResourceInfo[];
}

interface ResourceInfo {
  summary: {
    name: string;
    description: string;
    endpointCount: number;
    methods: string[];
    permissions: string[];
  };
  endpoints?: Endpoint[];
  relationships?: ResourceRelationship[];
  statistics: ResourceStatistics;
  navigation: {
    relatedResources: string[];
    commonOperations: string[];
    similarPermissionResources: string[];
  };
}

interface OverallStatistics {
  totalEndpoints: number;
  totalParameters: number;
  totalResponses: number;
  uniquePermissions: number;
  mostCommonMethod: string;
  averageEndpointsPerResource: number;
}
```

**Example**:

```json
{
  "include_endpoints": true,
  "include_relationships": true
}
```

---

### generate_code_example

Generate code examples for API endpoints.

**Tool Name**: `generate_code_example`

**Description**: Generate code examples for API endpoints in multiple programming languages with authentication, request/response examples, and error handling.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endpoint_path` | string | Yes | Endpoint path (e.g., /customers/{id}) |
| `method` | string | Yes | HTTP method (GET, POST, PUT, DELETE, PATCH) |
| `language` | string | Yes | Programming language (javascript, python, curl) |
| `include_auth` | boolean | No | Include authentication (default: true) |

**Returns**:

```typescript
interface CodeExampleResponse {
  endpoint: {
    resource: string;
    operation: string;
    description: string;
    method: string;
    path: string;
  };
  code: string;
  language: string;
  includesAuth: boolean;
  exampleRequest?: any;
  exampleResponse?: any;
  errorHandling?: string;
}
```

**Example**:

```json
{
  "endpoint_path": "/customers",
  "method": "POST",
  "language": "python",
  "include_auth": true
}
```

## Tool Definitions

### Tool Schema

All tools follow the MCP tool schema:

```typescript
interface ToolDefinition {
  name: string;
  description: string;
  version: string;
  deprecated: boolean;
  dependencies: string[];
  inputSchema: {
    type: 'object';
    properties: Record<string, PropertySchema>;
    required: string[];
  };
}

interface PropertySchema {
  type: string;
  description: string;
  enum?: string[];
}
```

### Tool Registration

Tools are registered in the main server file ([`src/server.ts`](../../src/server.ts)):

```typescript
private registerSearchTool(): void {
  const searchToolDefinition: ToolDefinition = {
    name: 'search_api_docs',
    description: 'Search RepairShopr API documentation...',
    version: '1.0.0',
    deprecated: false,
    dependencies: [],
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        // ... other properties
      },
      required: ['query']
    }
  };
  
  this.registerToolWithRegistry(searchToolDefinition, searchToolHandler);
}
```

## Response Formats

### Success Response

All tools return a success response with the following structure:

```typescript
interface SuccessResponse {
  success: true;
  data: any;
  timestamp: string;
}
```

### Error Response

Error responses follow this structure:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Invalid request parameters |
| `ENDPOINT_NOT_FOUND` | Endpoint not found |
| `PERMISSION_DENIED` | Permission denied |
| `INTERNAL_ERROR` | Internal server error |
| `TIMEOUT` | Request timeout |

## Error Handling

### Validation Errors

Tools validate input parameters before processing:

```typescript
if (!args.query) {
  throw new Error('Query parameter is required');
}
```

### Graceful Degradation

Tools provide fallback behavior when optional features fail:

```typescript
try {
  const queryAnalysis = this.queryUnderstanding.analyzeQuery(args.query);
  // Use query analysis
} catch (error) {
  // Fallback to basic search
  logger.warn('Query understanding failed, using basic search');
}
```

### Error Logging

All errors are logged with context:

```typescript
logger.error('Tool execution failed', {
  tool: toolName,
  error: error.message,
  args: args
});
```

For more information, see:
- [Architecture Documentation](./ARCHITECTURE.md)
- [User Guide](../user/USER_GUIDE.md)
- [Usage Examples](../user/USAGE_EXAMPLES.md)
