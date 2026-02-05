# MCP RepairShopr User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Using the MCP Server](#using-the-mcp-server)
4. [Available Tools](#available-tools)
5. [Search Functionality](#search-functionality)
6. [Common Use Cases](#common-use-cases)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Introduction

The MCP RepairShopr server provides intelligent access to RepairShopr API documentation through semantic search and structured data retrieval. This guide will help you understand how to use the server effectively.

### What is MCP RepairShopr?

MCP RepairShopr is a Model Context Protocol (MCP) server that enables AI assistants to query and retrieve information from the RepairShopr API documentation. It provides:

- **Semantic Search**: Find relevant API endpoints using natural language queries
- **Structured Data**: Access endpoint details, parameters, responses, and permissions
- **Code Examples**: Generate code samples in multiple programming languages
- **Intelligent Retrieval**: Context-aware search with relevance scoring

### Key Features

- Natural language search across API documentation
- Filter by resource, method, or permission
- Detailed endpoint information with parameters and responses
- Permission requirements and hierarchy
- Code generation in JavaScript, Python, and cURL
- Caching for improved performance

## Getting Started

### Prerequisites

Before using the MCP RepairShopr server, ensure you have:

- Node.js 18 or higher installed
- Access to an MCP-compatible AI assistant
- Basic understanding of REST APIs

### Installation

See the [Installation Guide](./INSTALLATION.md) for detailed installation instructions.

### Configuration

See the [Configuration Guide](./CONFIGURATION.md) for configuration options.

## Using the MCP Server

### Basic Usage

The MCP server provides several tools that can be called from your AI assistant:

1. **search_api_docs**: Search for API endpoints
2. **get_endpoint**: Get detailed endpoint information
3. **get_parameters**: Get parameter information for an endpoint
4. **get_responses**: Get response information for an endpoint
5. **get_permissions**: Get permission requirements
6. **list_resources**: List all available resources
7. **generate_code_example**: Generate code examples

### Example Queries

Here are some example queries you can ask:

- "How do I create a new customer?"
- "What are the parameters for the ticket endpoint?"
- "Show me all endpoints related to invoices"
- "Generate a Python example for creating an estimate"
- "What permissions do I need to access customer data?"

## Available Tools

### search_api_docs

Search for API endpoints using semantic and keyword search.

**Parameters:**
- `query` (required): Search query in natural language
- `resource` (optional): Filter by resource name
- `method` (optional): Filter by HTTP method (GET, POST, PUT, DELETE, PATCH)
- `permission` (optional): Filter by permission
- `limit` (optional): Maximum results to return (default: 5)

**Example:**
```json
{
  "query": "create new customer",
  "limit": 3
}
```

### get_endpoint

Get detailed information about a specific API endpoint.

**Parameters:**
- `path` (optional): Endpoint path (e.g., `/customers/{id}`)
- `method` (optional): HTTP method
- `resource` (optional): Resource name (alternative to path)
- `includeRelated` (optional): Include related endpoints (default: false)

**Example:**
```json
{
  "path": "/customers/{id}",
  "method": "GET",
  "includeRelated": true
}
```

### get_parameters

Get parameter information for an API endpoint.

**Parameters:**
- `endpoint_path` (required): Endpoint path
- `method` (required): HTTP method
- `param_type` (optional): Filter by parameter type (query, path, body)

**Example:**
```json
{
  "endpoint_path": "/customers",
  "method": "POST",
  "param_type": "body"
}
```

### get_responses

Get response information for an API endpoint.

**Parameters:**
- `endpoint_path` (required): Endpoint path
- `method` (required): HTTP method
- `status_code` (optional): Filter by status code

**Example:**
```json
{
  "endpoint_path": "/customers/{id}",
  "method": "GET"
}
```

### get_permissions

Get permission requirements for API endpoints.

**Parameters:**
- `endpoint_path` (optional): Endpoint path
- `method` (optional): HTTP method
- `resource` (optional): Resource name
- `permission` (optional): Filter by permission name
- `include_matrix` (optional): Include permission matrix (default: false)
- `include_summaries` (optional): Include permission summaries (default: false)

**Example:**
```json
{
  "resource": "customers",
  "include_summaries": true
}
```

### list_resources

List all available API resources with summary information.

**Parameters:**
- `include_endpoints` (optional): Include endpoint details (default: false)
- `include_relationships` (optional): Include resource relationships (default: false)

**Example:**
```json
{
  "include_endpoints": true,
  "include_relationships": true
}
```

### generate_code_example

Generate code examples for API endpoints.

**Parameters:**
- `endpoint_path` (required): Endpoint path
- `method` (required): HTTP method
- `language` (required): Programming language (javascript, python, curl)
- `include_auth` (optional): Include authentication (default: true)

**Example:**
```json
{
  "endpoint_path": "/customers",
  "method": "POST",
  "language": "python",
  "include_auth": true
}
```

## Search Functionality

### Semantic Search

The server uses semantic search to understand the intent behind your queries. This means you can search using natural language and get relevant results even if you don't know the exact terminology.

**Example:**
- Query: "How do I add a new ticket?"
- Results: Will return endpoints related to creating tickets, even if the exact word "add" isn't used in the documentation.

### Keyword Search

The server also supports keyword-based search for more precise queries.

**Example:**
- Query: "POST /tickets"
- Results: Will return the exact POST endpoint for tickets.

### Filtering

You can filter search results by:
- **Resource**: Specific API resource (e.g., customers, tickets, invoices)
- **Method**: HTTP method (GET, POST, PUT, DELETE, PATCH)
- **Permission**: Required permission level

### Relevance Scoring

Search results are ranked by relevance using multiple factors:
- Semantic similarity to your query
- Keyword matches
- Recency of usage
- Popularity of the endpoint

## Common Use Cases

### Finding an Endpoint

**Question:** "How do I create a new customer?"

**Tool Call:**
```json
{
  "tool": "search_api_docs",
  "arguments": {
    "query": "create new customer"
  }
}
```

**Result:** Returns the POST /customers endpoint with details.

### Getting Endpoint Details

**Question:** "What parameters do I need to create a ticket?"

**Tool Call:**
```json
{
  "tool": "get_parameters",
  "arguments": {
    "endpoint_path": "/tickets",
    "method": "POST"
  }
}
```

**Result:** Returns all required and optional parameters for creating a ticket.

### Generating Code

**Question:** "Show me a Python example for getting customer details"

**Tool Call:**
```json
{
  "tool": "generate_code_example",
  "arguments": {
    "endpoint_path": "/customers/{id}",
    "method": "GET",
    "language": "python"
  }
}
```

**Result:** Returns a complete Python code example with authentication.

### Understanding Permissions

**Question:** "What permissions do I need for invoice operations?"

**Tool Call:**
```json
{
  "tool": "get_permissions",
  "arguments": {
    "resource": "invoices",
    "include_summaries": true
  }
}
```

**Result:** Returns all permissions required for invoice operations.

### Exploring Resources

**Question:** "What resources are available in the API?"

**Tool Call:**
```json
{
  "tool": "list_resources",
  "arguments": {
    "include_endpoints": true
  }
}
```

**Result:** Returns all available resources with their endpoints.

## Best Practices

### 1. Start with Search

When you're unsure about the exact endpoint, start with a search query. The semantic search will help you find the most relevant endpoints.

### 2. Use Specific Queries

More specific queries yield better results. Instead of "customer", try "create customer with email".

### 3. Leverage Filters

Use filters to narrow down results when you know specific details like resource or method.

### 4. Check Parameters

Always check the parameters before making an API call to ensure you have all required fields.

### 5. Review Permissions

Understand the permission requirements before implementing API calls to avoid authorization errors.

### 6. Use Code Examples

Generate code examples to understand the exact format and structure of API requests.

### 7. Explore Related Endpoints

Use the `includeRelated` parameter to discover related endpoints that might be useful.

## Troubleshooting

### No Results Found

If your search returns no results:
- Try rephrasing your query
- Use different keywords
- Check for typos
- Try a broader search term

### Unexpected Results

If you get unexpected results:
- Review the relevance scores
- Check the match type (semantic vs keyword)
- Use filters to narrow down results

### Missing Information

If endpoint information seems incomplete:
- Use the `get_endpoint` tool for full details
- Check related endpoints
- Review the original API documentation

### Permission Errors

If you encounter permission errors:
- Use the `get_permissions` tool to understand requirements
- Check your API key permissions
- Review the permission hierarchy

For more troubleshooting information, see the [Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md).

## Additional Resources

- [Installation Guide](./INSTALLATION.md)
- [Configuration Guide](./CONFIGURATION.md)
- [API Documentation](../api/README.md)
- [FAQ](./FAQ.md)
- [Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md)
