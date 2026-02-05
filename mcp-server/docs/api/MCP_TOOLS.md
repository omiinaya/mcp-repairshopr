# MCP Tools Documentation

## Overview

This document provides detailed documentation for all MCP (Model Context Protocol) tools available in the MCP RepairShopr server. These tools enable AI assistants to query and retrieve information from the RepairShopr API documentation.

## Available Tools

| Tool Name | Description |
|-----------|-------------|
| [`search_api_docs`](#search_api_docs) | Search API documentation using semantic and keyword search |
| [`get_endpoint`](#get_endpoint) | Get detailed information about a specific API endpoint |
| [`get_parameters`](#get_parameters) | Get parameter information for an API endpoint |
| [`get_responses`](#get_responses) | Get response information for an API endpoint |
| [`get_permissions`](#get_permissions) | Get permission requirements for API endpoints |
| [`list_resources`](#list_resources) | List all available API resources |
| [`generate_code_example`](#generate_code_example) | Generate code examples for API endpoints |

---

## search_api_docs

Search RepairShopr API documentation using semantic and keyword search.

### Description

Performs intelligent search across the RepairShopr API documentation using both semantic understanding and keyword matching. Returns ranked results with relevance scores and context.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query in natural language |
| `resource` | string | No | Filter by resource name (e.g., customers, tickets, invoices) |
| `method` | string | No | Filter by HTTP method (GET, POST, PUT, DELETE, PATCH) |
| `permission` | string | No | Filter by permission |
| `limit` | number | No | Maximum results to return (default: 5, max: 50) |

### Request Example

```json
{
  "query": "create new customer",
  "resource": "customers",
  "method": "POST",
  "limit": 5
}
```

### Response Format

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
  relevanceScore?: {
    overallScore: number;
    semanticScore: number;
    keywordScore: number;
    recencyScore: number;
    popularityScore: number;
    customScore: number;
    breakdown: Record<string, number>;
  };
  context: string;
  matchType: 'semantic' | 'keyword' | 'hybrid';
}
```

### Response Example

```json
{
  "results": [
    {
      "endpoint": {
        "resource": "customers",
        "operation": "create",
        "description": "Create a new customer",
        "method": "POST",
        "path": "/customers",
        "permission": "customer.write"
      },
      "score": 0.95,
      "context": "Creates a new customer with the provided data...",
      "matchType": "semantic"
    }
  ],
  "formatted": {
    "markdown": "## Search Results\n\n### POST /customers\nCreate a new customer...",
    "json": {...},
    "html": "<div>...</div>",
    "tokenCount": 150
  }
}
```

### Use Cases

- Finding endpoints for specific operations
- Discovering related functionality
- Exploring API capabilities
- Getting quick overviews of resources

### Notes

- Semantic search understands natural language queries
- Results are ranked by relevance score (0-1)
- Higher scores indicate better matches
- Use filters for more precise results

---

## get_endpoint

Get detailed information about a specific API endpoint.

### Description

Retrieves comprehensive information about a specific API endpoint including description, parameters, responses, permissions, and related endpoints.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | No* | Endpoint path (e.g., /customers/{id}) |
| `method` | string | No* | HTTP method (GET, POST, PUT, DELETE, PATCH) |
| `resource` | string | No* | Resource name (alternative to path) |
| `includeRelated` | boolean | No | Include related endpoints (default: false) |

*At least one of `path` or `resource` must be provided. If `path` is provided, `method` should also be provided.

### Request Example

```json
{
  "path": "/customers/{id}",
  "method": "GET",
  "includeRelated": true
}
```

### Response Format

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

### Response Example

```json
{
  "success": true,
  "exactMatch": true,
  "endpoint": {
    "resource": "customers",
    "operation": "get",
    "description": "Get a specific customer by ID",
    "method": "GET",
    "path": "/customers/{id}",
    "permission": "customer.read",
    "parameters": [
      {
        "name": "id",
        "type": "integer",
        "required": true,
        "description": "Customer ID"
      }
    ],
    "responses": [...]
  },
  "relatedEndpoints": {
    "sameResource": [
      {
        "resource": "customers",
        "method": "POST",
        "path": "/customers",
        "permission": "customer.write"
      }
    ]
  }
}
```

### Use Cases

- Getting complete endpoint documentation
- Understanding required parameters
- Reviewing response formats
- Discovering related endpoints

### Notes

- Use `includeRelated: true` to discover related functionality
- When using `resource` without `path`, returns all endpoints for that resource
- Exact match is indicated by `exactMatch: true`

---

## get_parameters

Get parameter information for an API endpoint.

### Description

Retrieves detailed parameter information including types, constraints, validation hints, and required status for a specific endpoint.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endpoint_path` | string | Yes | Endpoint path (e.g., /customers/{id}) |
| `method` | string | Yes | HTTP method (GET, POST, PUT, DELETE, PATCH) |
| `param_type` | string | No | Filter by parameter type (query, path, body) |

### Request Example

```json
{
  "endpoint_path": "/customers",
  "method": "POST",
  "param_type": "body"
}
```

### Response Format

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

### Response Example

```json
{
  "success": true,
  "endpointPath": "/customers",
  "method": "POST",
  "parameters": [
    {
      "name": "name",
      "type": "string",
      "required": true,
      "description": "Customer name",
      "paramType": "body",
      "constraints": {
        "minLength": 1,
        "maxLength": 255
      },
      "validationHints": [
        "Must be between 1 and 255 characters"
      ]
    },
    {
      "name": "email",
      "type": "string",
      "required": true,
      "description": "Customer email address",
      "paramType": "body",
      "constraints": {
        "pattern": "^[^@]+@[^@]+\\.[^@]+$"
      },
      "validationHints": [
        "Must be a valid email address"
      ]
    }
  ],
  "totalCount": 2,
  "requiredCount": 2,
  "optionalCount": 0
}
```

### Use Cases

- Understanding required parameters
- Validating request data
- Building request bodies
- Implementing form validation

### Notes

- Parameters are grouped by type (query, path, body)
- Required parameters are clearly marked
- Constraints help with validation
- Validation hints provide guidance

---

## get_responses

Get response information for an API endpoint.

### Description

Retrieves response information including status codes, schemas, examples, error documentation, and common patterns for a specific endpoint.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endpoint_path` | string | Yes | Endpoint path (e.g., /customers/{id}) |
| `method` | string | Yes | HTTP method (GET, POST, PUT, DELETE, PATCH) |
| `status_code` | string | No | Filter by status code (optional) |

### Request Example

```json
{
  "endpoint_path": "/customers/{id}",
  "method": "GET"
}
```

### Response Format

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

### Response Example

```json
{
  "success": true,
  "endpointPath": "/customers/{id}",
  "method": "GET",
  "responses": [
    {
      "statusCode": "200",
      "statusCodeInfo": {
        "code": 200,
        "category": "success",
        "name": "OK",
        "description": "Request succeeded",
        "isSuccess": true,
        "isError": false,
        "isRedirect": false
      },
      "description": "Customer details retrieved successfully",
      "example": {
        "id": 123,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "schema": {...}
    },
    {
      "statusCode": "404",
      "statusCodeInfo": {
        "code": 404,
        "category": "error",
        "name": "Not Found",
        "description": "Resource not found",
        "isSuccess": false,
        "isError": true,
        "isRedirect": false
      },
      "description": "Customer not found",
      "errorDocumentation": "The specified customer ID does not exist"
    }
  ],
  "totalCount": 2,
  "successCount": 1,
  "errorCount": 1
}
```

### Use Cases

- Understanding response formats
- Handling different status codes
- Implementing error handling
- Parsing response data

### Notes

- Success responses (2xx) indicate successful operations
- Error responses (4xx, 5xx) indicate failures
- Examples show typical response structures
- Schemas define the expected data format

---

## get_permissions

Get permission requirements for API endpoints.

### Description

Retrieves permission requirements including descriptions, hierarchy, usage information, and permission matrix for API endpoints.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endpoint_path` | string | No* | Endpoint path (e.g., /customers/{id}) |
| `method` | string | No* | HTTP method (required when using endpoint_path) |
| `resource` | string | No* | Resource name (alternative to endpoint_path) |
| `permission` | string | No* | Filter by permission name |
| `include_matrix` | boolean | No | Include permission matrix (default: false) |
| `include_summaries` | boolean | No | Include permission summaries (default: false) |

*At least one of `endpoint_path`, `resource`, or `permission` must be provided.

### Request Example

```json
{
  "resource": "customers",
  "include_summaries": true
}
```

### Response Format

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

### Response Example

```json
{
  "totalPermissions": 2,
  "permission": {
    "name": "customer.read",
    "description": {
      "name": "Customer Read",
      "description": "Permission to read customer data",
      "category": "read",
      "operations": ["GET /customers", "GET /customers/{id}"]
    },
    "endpoints": [
      {
        "resource": "customers",
        "method": "GET",
        "path": "/customers",
        "permission": "customer.read"
      }
    ],
    "hierarchy": {
      "level": 1
    }
  }
}
```

### Use Cases

- Understanding permission requirements
- Implementing authorization checks
- Configuring API access
- Auditing permissions

### Notes

- Permissions are hierarchical
- Higher-level permissions may include lower-level ones
- Use `include_matrix` for a complete permission overview
- Use `include_summaries` for permission summaries

---

## list_resources

List all available API resources with summary information.

### Description

Retrieves all available API resources with summary information, endpoints, relationships, and statistics.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `include_endpoints` | boolean | No | Include endpoint details (default: false) |
| `include_relationships` | boolean | No | Include resource relationships (default: false) |

### Request Example

```json
{
  "include_endpoints": true,
  "include_relationships": true
}
```

### Response Format

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

### Response Example

```json
{
  "totalResources": 3,
  "overallStatistics": {
    "totalEndpoints": 15,
    "totalParameters": 45,
    "totalResponses": 30,
    "uniquePermissions": 6,
    "mostCommonMethod": "GET",
    "averageEndpointsPerResource": 5
  },
  "resources": [
    {
      "summary": {
        "name": "customers",
        "description": "Customer management endpoints",
        "endpointCount": 5,
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "permissions": ["customer.read", "customer.write"]
      },
      "endpoints": [...],
      "statistics": {
        "totalEndpoints": 5,
        "totalParameters": 15,
        "totalResponses": 10,
        "uniquePermissions": 2,
        "mostCommonMethod": "GET",
        "averageEndpointsPerResource": 5
      },
      "navigation": {
        "relatedResources": ["tickets", "invoices"],
        "commonOperations": ["list", "create", "update", "delete"],
        "similarPermissionResources": ["leads"]
      }
    }
  ]
}
```

### Use Cases

- Exploring available API resources
- Understanding API structure
- Discovering related resources
- Getting API statistics

### Notes

- Use `include_endpoints` to get detailed endpoint information
- Use `include_relationships` to understand resource connections
- Statistics provide insights into API usage patterns

---

## generate_code_example

Generate code examples for API endpoints.

### Description

Generates code examples for API endpoints in multiple programming languages with authentication, request/response examples, and error handling.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endpoint_path` | string | Yes | Endpoint path (e.g., /customers/{id}) |
| `method` | string | Yes | HTTP method (GET, POST, PUT, DELETE, PATCH) |
| `language` | string | Yes | Programming language (javascript, python, curl) |
| `include_auth` | boolean | No | Include authentication (default: true) |

### Request Example

```json
{
  "endpoint_path": "/customers",
  "method": "POST",
  "language": "python",
  "include_auth": true
}
```

### Response Format

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

### Response Example

```json
{
  "endpoint": {
    "resource": "customers",
    "operation": "create",
    "description": "Create a new customer",
    "method": "POST",
    "path": "/customers"
  },
  "code": "import requests\n\nAPI_KEY = 'your-api-key'\nAPI_URL = 'https://api.repairshopr.com/customers'\n\ndef create_customer(customer_data):\n    headers = {\n        'Authorization': f'Bearer {API_KEY}',\n        'Content-Type': 'application/json'\n    }\n    \n    try:\n        response = requests.post(\n            API_URL,\n            headers=headers,\n            json=customer_data\n        )\n        response.raise_for_status()\n        return response.json()\n    except requests.exceptions.RequestException as e:\n        print(f'Error creating customer: {e}')\n        raise\n\n# Usage\ncustomer = create_customer({\n    'name': 'John Doe',\n    'email': 'john@example.com'\n})\nprint(customer)",
  "language": "python",
  "includesAuth": true,
  "exampleRequest": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "exampleResponse": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "errorHandling": "The example includes try-catch error handling with proper exception propagation."
}
```

### Use Cases

- Quick implementation of API calls
- Understanding request/response formats
- Learning API usage patterns
- Boilerplate code generation

### Notes

- Supported languages: JavaScript, Python, cURL
- Code includes authentication when `include_auth: true`
- Error handling is included in examples
- Examples are production-ready

---

## Error Handling

All tools follow a consistent error response format:

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

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "ENDPOINT_NOT_FOUND",
    "message": "Endpoint not found",
    "details": {
      "path": "/nonexistent",
      "method": "GET"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Best Practices

### 1. Start with Search

When unsure about the exact endpoint, start with `search_api_docs` to find relevant endpoints.

### 2. Use Specific Queries

More specific queries yield better results. Instead of "customer", try "create customer with email".

### 3. Leverage Filters

Use filters to narrow down results when you know specific details like resource or method.

### 4. Check Parameters

Always check parameters before making API calls to ensure you have all required fields.

### 5. Review Permissions

Understand permission requirements before implementing API calls to avoid authorization errors.

### 6. Use Code Examples

Generate code examples to understand the exact format and structure of API requests.

### 7. Explore Related Endpoints

Use `includeRelated` parameter to discover related endpoints that might be useful.

For more information, see:
- [User Guide](../user/USER_GUIDE.md)
- [Usage Examples](../user/USAGE_EXAMPLES.md)
- [API Reference](../developer/API_REFERENCE.md)
