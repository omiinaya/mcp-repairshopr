# MCP Tool Reference

This document provides a quick reference for all MCP tools available in the MCP RepairShopr server.

## Quick Reference Table

| Tool | Purpose | Required Params | Optional Params |
|------|---------|-----------------|----------------|
| [`search_api_docs`](#search_api_docs) | Search API docs | `query` | `resource`, `method`, `permission`, `limit` |
| [`get_endpoint`](#get_endpoint) | Get endpoint details | `path` or `resource` | `method`, `includeRelated` |
| [`get_parameters`](#get_parameters) | Get parameters | `endpoint_path`, `method` | `param_type` |
| [`get_responses`](#get_responses) | Get responses | `endpoint_path`, `method` | `status_code` |
| [`get_permissions`](#get_permissions) | Get permissions | `endpoint_path` or `resource` or `permission` | `method`, `include_matrix`, `include_summaries` |
| [`list_resources`](#list_resources) | List resources | none | `include_endpoints`, `include_relationships` |
| [`generate_code_example`](#generate_code_example) | Generate code | `endpoint_path`, `method`, `language` | `include_auth` |

---

## search_api_docs

**Purpose**: Search API documentation using semantic and keyword search

**Required Parameters**:
- `query` (string): Search query in natural language

**Optional Parameters**:
- `resource` (string): Filter by resource name
- `method` (string): Filter by HTTP method (GET, POST, PUT, DELETE, PATCH)
- `permission` (string): Filter by permission
- `limit` (number): Maximum results to return (default: 5, max: 50)

**Returns**: Ranked search results with relevance scores

**Example**:
```json
{
  "query": "create new customer",
  "limit": 5
}
```

---

## get_endpoint

**Purpose**: Get detailed information about a specific API endpoint

**Required Parameters**:
- `path` (string) OR `resource` (string): Endpoint path or resource name

**Optional Parameters**:
- `method` (string): HTTP method (required when using path)
- `includeRelated` (boolean): Include related endpoints (default: false)

**Returns**: Complete endpoint documentation with parameters, responses, and related endpoints

**Example**:
```json
{
  "path": "/customers/{id}",
  "method": "GET",
  "includeRelated": true
}
```

---

## get_parameters

**Purpose**: Get parameter information for an API endpoint

**Required Parameters**:
- `endpoint_path` (string): Endpoint path
- `method` (string): HTTP method

**Optional Parameters**:
- `param_type` (string): Filter by parameter type (query, path, body)

**Returns**: Detailed parameter information including types, constraints, and validation hints

**Example**:
```json
{
  "endpoint_path": "/customers",
  "method": "POST",
  "param_type": "body"
}
```

---

## get_responses

**Purpose**: Get response information for an API endpoint

**Required Parameters**:
- `endpoint_path` (string): Endpoint path
- `method` (string): HTTP method

**Optional Parameters**:
- `status_code` (string): Filter by status code

**Returns**: Response information including status codes, schemas, examples, and error documentation

**Example**:
```json
{
  "endpoint_path": "/customers/{id}",
  "method": "GET"
}
```

---

## get_permissions

**Purpose**: Get permission requirements for API endpoints

**Required Parameters**:
- `endpoint_path` (string) OR `resource` (string) OR `permission` (string): One of these must be provided

**Optional Parameters**:
- `method` (string): HTTP method (required when using endpoint_path)
- `include_matrix` (boolean): Include permission matrix (default: false)
- `include_summaries` (boolean): Include permission summaries (default: false)

**Returns**: Permission requirements including descriptions, hierarchy, and usage information

**Example**:
```json
{
  "resource": "customers",
  "include_summaries": true
}
```

---

## list_resources

**Purpose**: List all available API resources with summary information

**Required Parameters**: None

**Optional Parameters**:
- `include_endpoints` (boolean): Include endpoint details (default: false)
- `include_relationships` (boolean): Include resource relationships (default: false)

**Returns**: All available resources with summary information, endpoints, relationships, and statistics

**Example**:
```json
{
  "include_endpoints": true,
  "include_relationships": true
}
```

---

## generate_code_example

**Purpose**: Generate code examples for API endpoints

**Required Parameters**:
- `endpoint_path` (string): Endpoint path
- `method` (string): HTTP method
- `language` (string): Programming language (javascript, python, curl)

**Optional Parameters**:
- `include_auth` (boolean): Include authentication (default: true)

**Returns**: Code example with authentication, request/response examples, and error handling

**Example**:
```json
{
  "endpoint_path": "/customers",
  "method": "POST",
  "language": "python",
  "include_auth": true
}
```

---

## Parameter Types

### HTTP Methods

- `GET`: Retrieve data
- `POST`: Create new data
- `PUT`: Update existing data (full replacement)
- `PATCH`: Update existing data (partial update)
- `DELETE`: Remove data

### Parameter Types

- `query`: URL query parameters
- `path`: URL path parameters
- `body`: Request body parameters

### Languages for Code Generation

- `javascript`: JavaScript/Node.js code
- `python`: Python code
- `curl`: cURL command

---

## Common Response Fields

### Success Response

All tools return a success response with these common fields:

- `success` (boolean): Always true for successful responses
- `data` (any): Tool-specific response data
- `timestamp` (string): ISO 8601 timestamp

### Error Response

All tools return an error response with these common fields:

- `success` (boolean): Always false for error responses
- `error` (object): Error details
  - `code` (string): Error code
  - `message` (string): Error message
  - `details` (any): Additional error details
- `timestamp` (string): ISO 8601 timestamp

---

## Quick Workflows

### Find and Use an Endpoint

1. **Search**: Use `search_api_docs` to find the endpoint
2. **Get Details**: Use `get_endpoint` to get complete information
3. **Check Parameters**: Use `get_parameters` to understand required fields
4. **Check Responses**: Use `get_responses` to understand response format
5. **Generate Code**: Use `generate_code_example` to get implementation code

### Explore a Resource

1. **List Resources**: Use `list_resources` to see all available resources
2. **Get Endpoints**: Use `get_endpoint` with `resource` to get all endpoints
3. **Check Permissions**: Use `get_permissions` to understand access requirements
4. **Generate Examples**: Use `generate_code_example` for each endpoint

### Understand Permissions

1. **Get Permission Matrix**: Use `get_permissions` with `include_matrix: true`
2. **Get Permission Summaries**: Use `get_permissions` with `include_summaries: true`
3. **Check Endpoint Permissions**: Use `get_permissions` with `endpoint_path` and `method`

---

## Tips and Tricks

### Search Tips

- Use natural language queries: "create customer with email"
- Be specific for better results: "POST /customers" vs "customer"
- Use filters to narrow results: `resource: "customers"`, `method: "POST"`
- Limit results for faster responses: `limit: 3`

### Endpoint Tips

- Use `includeRelated: true` to discover related functionality
- When using `resource` without `path`, you get all endpoints for that resource
- Check `exactMatch` to see if you got an exact or fuzzy match

### Parameter Tips

- Filter by `param_type` to focus on specific parameter types
- Check `required` field to identify mandatory parameters
- Review `constraints` for validation rules
- Use `validationHints` for implementation guidance

### Response Tips

- Check `isSuccess` in `statusCodeInfo` to determine if response is successful
- Review `errorDocumentation` for error handling guidance
- Use `example` field to understand response structure
- Check `schema` for complete data format

### Permission Tips

- Use `include_matrix` for a complete permission overview
- Use `include_summaries` for high-level permission information
- Check `hierarchy` to understand permission relationships
- Review `operations` to see which endpoints use each permission

### Code Generation Tips

- Choose the language that matches your project
- Set `include_auth: false` if you handle authentication separately
- Review error handling in generated code
- Adapt examples to your specific use case

---

## Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_REQUEST` | Invalid request parameters | Check parameter names and types |
| `ENDPOINT_NOT_FOUND` | Endpoint not found | Verify endpoint path and method |
| `PERMISSION_DENIED` | Permission denied | Check API key permissions |
| `INTERNAL_ERROR` | Internal server error | Contact support |
| `TIMEOUT` | Request timeout | Retry request or check network |

---

## Rate Limits

- Default: 100 requests per minute
- Burst: 10 requests per second
- Check response headers for current limits

---

## Version Information

- Current API Version: 1.0.0
- MCP Protocol Version: 1.0.0
- Last Updated: 2024-01-01

For detailed documentation, see [MCP Tools Documentation](./MCP_TOOLS.md).
