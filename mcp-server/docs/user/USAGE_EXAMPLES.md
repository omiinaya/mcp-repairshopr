# MCP RepairShopr Usage Examples

This document provides practical examples of using the MCP RepairShopr server.

## Table of Contents

1. [Basic Search Examples](#basic-search-examples)
2. [Endpoint Lookup Examples](#endpoint-lookup-examples)
3. [Parameter Examples](#parameter-examples)
4. [Response Examples](#response-examples)
5. [Permission Examples](#permission-examples)
6. [Code Generation Examples](#code-generation-examples)
7. [Resource Exploration Examples](#resource-exploration-examples)
8. [Advanced Search Examples](#advanced-search-examples)
9. [Workflow Examples](#workflow-examples)

## Basic Search Examples

### Example 1: Find Customer Endpoints

**Query:** "How do I work with customers?"

```json
{
  "tool": "search_api_docs",
  "arguments": {
    "query": "customer",
    "limit": 5
  }
}
```

**Result:** Returns endpoints related to customers including:

- GET /customers - List customers
- POST /customers - Create customer
- GET /customers/{id} - Get customer details
- PUT /customers/{id} - Update customer
- DELETE /customers/{id} - Delete customer

### Example 2: Find Ticket Creation

**Query:** "create a new ticket"

```json
{
  "tool": "search_api_docs",
  "arguments": {
    "query": "create new ticket",
    "limit": 3
  }
}
```

**Result:** Returns the POST /tickets endpoint with details.

### Example 3: Find Invoice Operations

**Query:** "invoice operations"

```json
{
  "tool": "search_api_docs",
  "arguments": {
    "query": "invoice",
    "limit": 10
  }
}
```

**Result:** Returns all invoice-related endpoints.

## Endpoint Lookup Examples

### Example 1: Get Customer Endpoint Details

```json
{
  "tool": "get_endpoint",
  "arguments": {
    "path": "/customers/{id}",
    "method": "GET",
    "includeRelated": true
  }
}
```

**Result:** Returns detailed information about the GET /customers/{id} endpoint including:

- Description
- Parameters
- Responses
- Permissions
- Related endpoints

### Example 2: Get All Ticket Endpoints

```json
{
  "tool": "get_endpoint",
  "arguments": {
    "resource": "tickets"
  }
}
```

**Result:** Returns all endpoints for the tickets resource.

### Example 3: Get Create Estimate Endpoint

```json
{
  "tool": "get_endpoint",
  "arguments": {
    "path": "/estimates",
    "method": "POST"
  }
}
```

**Result:** Returns details for creating an estimate.

## Parameter Examples

### Example 1: Get Create Customer Parameters

```json
{
  "tool": "get_parameters",
  "arguments": {
    "endpoint_path": "/customers",
    "method": "POST"
  }
}
```

**Result:** Returns all parameters for creating a customer:

- Required parameters: name, email
- Optional parameters: phone, address, etc.
- Parameter types and constraints

### Example 2: Get Query Parameters for Listing

```json
{
  "tool": "get_parameters",
  "arguments": {
    "endpoint_path": "/customers",
    "method": "GET",
    "param_type": "query"
  }
}
```

**Result:** Returns query parameters for listing customers:

- page
- per_page
- sort
- filter

### Example 3: Get Path Parameters

```json
{
  "tool": "get_parameters",
  "arguments": {
    "endpoint_path": "/customers/{id}",
    "method": "GET",
    "param_type": "path"
  }
}
```

**Result:** Returns path parameters:

- id (required)

## Response Examples

### Example 1: Get Customer Response

```json
{
  "tool": "get_responses",
  "arguments": {
    "endpoint_path": "/customers/{id}",
    "method": "GET"
  }
}
```

**Result:** Returns response information:

- 200 OK - Customer object
- 404 Not Found - Customer not found
- Response schemas
- Example responses

### Example 2: Get Error Responses

```json
{
  "tool": "get_responses",
  "arguments": {
    "endpoint_path": "/customers",
    "method": "POST",
    "status_code": "422"
  }
}
```

**Result:** Returns validation error response details.

### Example 3: Get All Responses for Endpoint

```json
{
  "tool": "get_responses",
  "arguments": {
    "endpoint_path": "/tickets/{id}",
    "method": "PUT"
  }
}
```

**Result:** Returns all possible responses for updating a ticket.

## Permission Examples

### Example 1: Get Customer Permissions

```json
{
  "tool": "get_permissions",
  "arguments": {
    "resource": "customers",
    "include_summaries": true
  }
}
```

**Result:** Returns all permissions required for customer operations.

### Example 2: Get Specific Endpoint Permission

```json
{
  "tool": "get_permissions",
  "arguments": {
    "endpoint_path": "/invoices",
    "method": "POST"
  }
}
```

**Result:** Returns the specific permission required to create invoices.

### Example 3: Get Permission Matrix

```json
{
  "tool": "get_permissions",
  "arguments": {
    "include_matrix": true
  }
}
```

**Result:** Returns a matrix of permissions across all endpoints.

## Code Generation Examples

### Example 1: Generate JavaScript Example

```json
{
  "tool": "generate_code_example",
  "arguments": {
    "endpoint_path": "/customers",
    "method": "POST",
    "language": "javascript",
    "include_auth": true
  }
}
```

**Result:** Returns JavaScript code for creating a customer:

```javascript
const fetch = require('node-fetch');

const API_KEY = 'your-api-key';
const API_URL = 'https://api.repairshopr.com/customers';

const createCustomer = async (customerData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Usage
createCustomer({
  name: 'John Doe',
  email: 'john@example.com',
}).then((customer) => console.log(customer));
```

### Example 2: Generate Python Example

```json
{
  "tool": "generate_code_example",
  "arguments": {
    "endpoint_path": "/tickets/{id}",
    "method": "GET",
    "language": "python",
    "include_auth": true
  }
}
```

**Result:** Returns Python code for getting a ticket:

```python
import requests

API_KEY = 'your-api-key'
API_URL = 'https://api.repairshopr.com/tickets/{}'

def get_ticket(ticket_id):
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    try:
        response = requests.get(
            API_URL.format(ticket_id),
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error getting ticket: {e}')
        raise

# Usage
ticket = get_ticket(123)
print(ticket)
```

### Example 3: Generate cURL Example

```json
{
  "tool": "generate_code_example",
  "arguments": {
    "endpoint_path": "/invoices/{id}",
    "method": "PUT",
    "language": "curl",
    "include_auth": true
  }
}
```

**Result:** Returns cURL command for updating an invoice:

```bash
curl -X PUT 'https://api.repairshopr.com/invoices/123' \
  -H 'Authorization: Bearer your-api-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "paid",
    "paid_at": "2024-01-01T00:00:00Z"
  }'
```

## Resource Exploration Examples

### Example 1: List All Resources

```json
{
  "tool": "list_resources",
  "arguments": {}
}
```

**Result:** Returns all available API resources with summary information.

### Example 2: List Resources with Endpoints

```json
{
  "tool": "list_resources",
  "arguments": {
    "include_endpoints": true
  }
}
```

**Result:** Returns all resources with their endpoints.

### Example 3: List Resources with Relationships

```json
{
  "tool": "list_resources",
  "arguments": {
    "include_relationships": true
  }
}
```

**Result:** Returns all resources with relationship information.

## Advanced Search Examples

### Example 1: Filter by Method

```json
{
  "tool": "search_api_docs",
  "arguments": {
    "query": "customer",
    "method": "POST",
    "limit": 5
  }
}
```

**Result:** Returns only POST endpoints related to customers.

### Example 2: Filter by Permission

```json
{
  "tool": "search_api_docs",
  "arguments": {
    "query": "invoice",
    "permission": "invoice.write",
    "limit": 10
  }
}
```

**Result:** Returns invoice endpoints that require the invoice.write permission.

### Example 3: Multiple Filters

```json
{
  "tool": "search_api_docs",
  "arguments": {
    "query": "ticket",
    "method": "GET",
    "resource": "tickets",
    "limit": 5
  }
}
```

**Result:** Returns GET endpoints for the tickets resource.

## Workflow Examples

### Workflow 1: Create a New Customer

**Step 1:** Search for customer creation endpoint

```json
{
  "tool": "search_api_docs",
  "arguments": {
    "query": "create customer",
    "limit": 1
  }
}
```

**Step 2:** Get parameters for creating a customer

```json
{
  "tool": "get_parameters",
  "arguments": {
    "endpoint_path": "/customers",
    "method": "POST"
  }
}
```

**Step 3:** Generate code example

```json
{
  "tool": "generate_code_example",
  "arguments": {
    "endpoint_path": "/customers",
    "method": "POST",
    "language": "python"
  }
}
```

### Workflow 2: Update a Ticket

**Step 1:** Find ticket update endpoint

```json
{
  "tool": "search_api_docs",
  "arguments": {
    "query": "update ticket",
    "limit": 1
  }
}
```

**Step 2:** Get endpoint details

```json
{
  "tool": "get_endpoint",
  "arguments": {
    "path": "/tickets/{id}",
    "method": "PUT"
  }
}
```

**Step 3:** Get parameters

```json
{
  "tool": "get_parameters",
  "arguments": {
    "endpoint_path": "/tickets/{id}",
    "method": "PUT",
    "param_type": "body"
  }
}
```

**Step 4:** Generate code example

```json
{
  "tool": "generate_code_example",
  "arguments": {
    "endpoint_path": "/tickets/{id}",
    "method": "PUT",
    "language": "javascript"
  }
}
```

### Workflow 3: Explore Invoice API

**Step 1:** List invoice endpoints

```json
{
  "tool": "get_endpoint",
  "arguments": {
    "resource": "invoices"
  }
}
```

**Step 2:** Get permissions for invoices

```json
{
  "tool": "get_permissions",
  "arguments": {
    "resource": "invoices",
    "include_summaries": true
  }
}
```

**Step 3:** Get parameters for creating invoice

```json
{
  "tool": "get_parameters",
  "arguments": {
    "endpoint_path": "/invoices",
    "method": "POST"
  }
}
```

**Step 4:** Get response information

```json
{
  "tool": "get_responses",
  "arguments": {
    "endpoint_path": "/invoices",
    "method": "POST"
  }
}
```

### Workflow 4: Generate Complete API Documentation

**Step 1:** List all resources

```json
{
  "tool": "list_resources",
  "arguments": {
    "include_endpoints": true,
    "include_relationships": true
  }
}
```

**Step 2:** For each resource, get detailed information

```json
{
  "tool": "get_endpoint",
  "arguments": {
    "resource": "customers"
  }
}
```

**Step 3:** Get permissions matrix

```json
{
  "tool": "get_permissions",
  "arguments": {
    "include_matrix": true
  }
}
```

## Tips for Effective Usage

1. **Start with search**: Use `search_api_docs` to find relevant endpoints
2. **Get details**: Use `get_endpoint` for comprehensive endpoint information
3. **Check parameters**: Always verify required parameters before making API calls
4. **Understand responses**: Review response schemas to handle responses correctly
5. **Check permissions**: Ensure you have the required permissions
6. **Generate code**: Use `generate_code_example` for quick implementation
7. **Explore resources**: Use `list_resources` to discover available functionality

## Common Patterns

### Pattern 1: CRUD Operations

```json
// Create
{ "query": "create [resource]" }

// Read
{ "query": "get [resource]" }

// Update
{ "query": "update [resource]" }

// Delete
{ "query": "delete [resource]" }
```

### Pattern 2: Search and Filter

```json
{
  "query": "[resource]",
  "method": "GET",
  "limit": 10
}
```

### Pattern 3: Get Complete Endpoint Info

```json
// 1. Get endpoint
{ "path": "/[resource]/{id}", "method": "GET" }

// 2. Get parameters
{ "endpoint_path": "/[resource]/{id}", "method": "GET" }

// 3. Get responses
{ "endpoint_path": "/[resource]/{id}", "method": "GET" }

// 4. Get permissions
{ "endpoint_path": "/[resource]/{id}", "method": "GET" }
```

For more information, see the [User Guide](./USER_GUIDE.md).
