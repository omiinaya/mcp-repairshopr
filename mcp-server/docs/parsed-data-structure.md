# Parsed Data Structure Documentation

## Overview

The markdown parser converts RepairShopr API documentation from markdown files into structured TypeScript objects. This document describes the data structure, how markdown is converted to objects, and provides usage examples.

## Data Structure

### ApiDocument

Represents a complete API document file containing multiple endpoints for a single resource.

```typescript
interface ApiDocument {
  resourceName: string; // Name of the resource (e.g., "Customer", "Ticket")
  endpoints: ApiEndpoint[]; // Array of endpoints in this document
}
```

**Markdown Format:**

```markdown
# RepairShopr API Documentation - Customer

## API Endpoints

### Customer

#### Get Customers

...
```

**Parsed Object:**

```typescript
{
  resourceName: "Customer",
  endpoints: [...]
}
```

### ApiEndpoint

Represents a single API endpoint with all its metadata.

```typescript
interface ApiEndpoint {
  resource: string; // The resource name (e.g., "Customer")
  operation: string; // Operation name (e.g., "Get Customers")
  description: string; // Description of what the endpoint does
  method: string; // HTTP method (GET, POST, PUT, PATCH, DELETE)
  path: string; // API path (e.g., "/customers", "/tickets/{id}")
  permission: string; // Required permission to access this endpoint
  parameters: ApiParameter[]; // Array of parameters for the endpoint
  requestBody?: ApiParameter[]; // Optional request body parameters
  responses: ApiResponse[]; // Array of possible responses
}
```

**Markdown Format:**

````markdown
#### Get Customers

Returns a paginated list of customers

Required permission: Customers - List/Search

**Endpoint:** `GET /customers`

**Required Permission:** Required permission: Customers - List/Search

**Query Parameters:**

| Parameter | Type    | Required | Description                      |
| --------- | ------- | -------- | -------------------------------- |
| page      | integer | No       | Returns provided page of results |

**Response: 200**

successful

```json
{
  "customers": [...]
}
```
````

````

**Parsed Object:**
```typescript
{
  resource: "Customer",
  operation: "Get Customers",
  description: "Returns a paginated list of customers\n\nRequired permission: Customers - List/Search",
  method: "GET",
  path: "/customers",
  permission: "Required permission: Customers - List/Search",
  parameters: [
    {
      name: "page",
      type: "integer",
      required: false,
      description: "Returns provided page of results",
      paramType: "query"
    }
  ],
  responses: [
    {
      statusCode: 200,
      description: "successful",
      example: { customers: [...] }
    }
  ]
}
````

### ApiParameter

Represents a parameter for an API endpoint.

```typescript
interface ApiParameter {
  name: string; // Parameter name
  type: string; // Parameter type (string, integer, boolean, array, object, number)
  required: boolean; // Whether the parameter is required
  description: string; // Description of the parameter
  paramType: 'query' | 'path' | 'body'; // Parameter location in the HTTP request
}
```

**Markdown Format (Query Parameters):**

```markdown
**Query Parameters:**

| Parameter | Type    | Required | Description                      |
| --------- | ------- | -------- | -------------------------------- |
| page      | integer | No       | Returns provided page of results |
| sort      | string  | No       | A customer field to order by     |
```

**Parsed Object:**

```typescript
[
  {
    name: 'page',
    type: 'integer',
    required: false,
    description: 'Returns provided page of results',
    paramType: 'query',
  },
  {
    name: 'sort',
    type: 'string',
    required: false,
    description: 'A customer field to order by',
    paramType: 'query',
  },
];
```

**Markdown Format (Path Parameters):**

```markdown
**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      | Customer ID |
```

**Parsed Object:**

```typescript
[
  {
    name: 'id',
    type: 'integer',
    required: true,
    description: 'Customer ID',
    paramType: 'path',
  },
];
```

**Markdown Format (Request Body):**

```markdown
**Request Body:**

| Parameter | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| firstname | string | No       | Customer first name |
| lastname  | string | No       | Customer last name  |
```

**Parsed Object:**

```typescript
[
  {
    name: 'firstname',
    type: 'string',
    required: false,
    description: 'Customer first name',
    paramType: 'body',
  },
  {
    name: 'lastname',
    type: 'string',
    required: false,
    description: 'Customer last name',
    paramType: 'body',
  },
];
```

### ApiResponse

Represents a response from an API endpoint.

```typescript
interface ApiResponse {
  statusCode: number; // HTTP status code
  description: string; // Description of the response
  example?: any; // Optional example response body
}
```

**Markdown Format:**

````markdown
**Response: 200**

successful

```json
{
  "customer": {
    "id": 1,
    "firstname": "Walkin",
    "lastname": "Customer"
  }
}
```
````

````

**Parsed Object:**
```typescript
{
  statusCode: 200,
  description: "successful",
  example: {
    customer: {
      id: 1,
      firstname: "Walkin",
      lastname: "Customer"
    }
  }
}
````

## Parser Behavior with Edge Cases

### Missing Sections

The parser handles missing sections gracefully:

- **Missing Description**: Returns empty string
- **Missing Parameters**: Returns empty array
- **Missing Request Body**: Returns `undefined`
- **Missing Response Example**: Returns `undefined` for example field

**Example:**

```markdown
#### Get Latests

**Endpoint:** `GET /customers/latest`

**Required Permission:** Required permission: Customers - Edit

**Response: 200**

successful
```

**Parsed Object:**

```typescript
{
  resource: "Customer",
  operation: "Get Latests",
  description: "",
  method: "GET",
  path: "/customers/latest",
  permission: "Required permission: Customers - Edit",
  parameters: [],
  responses: [
    {
      statusCode: 200,
      description: "successful",
      example: undefined
    }
  ]
}
```

### Empty Parameter Tables

When a parameter section exists but the table is empty or malformed:

```markdown
**Query Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
```

**Parsed Object:**

```typescript
parameters: [];
```

### Empty Parameter Descriptions

Parameters with empty descriptions are valid:

```markdown
| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| email     | string | No       |             |
```

**Parsed Object:**

```typescript
{
  name: "email",
  type: "string",
  required: false,
  description: "",
  paramType: "query"
}
```

### Multiple Responses

Endpoints can have multiple responses with different status codes:

````markdown
**Response: 200**

successful

```json
{
  "customer": {...}
}
```
````

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": ["Email is not an email"]
}
```

````

**Parsed Object:**
```typescript
responses: [
  {
    statusCode: 200,
    description: "successful",
    example: { customer: {...} }
  },
  {
    statusCode: 422,
    description: "Invalid request",
    example: {
      success: false,
      message: ["Email is not an email"]
    }
  }
]
````

### Nested Paths

Endpoints with nested paths are supported:

```markdown
**Endpoint:** `GET /tickets/{id}/comments`
```

**Parsed Object:**

```typescript
{
  method: "GET",
  path: "/tickets/{id}/comments"
}
```

### Complex JSON Examples

The parser handles complex nested JSON structures:

````markdown
**Response: 200**

successful

```json
{
  "tickets": [
    {
      "id": 1,
      "customer": {
        "id": 1,
        "firstname": "Walkin",
        "lastname": "Customer"
      },
      "comments": [
        {
          "id": 1,
          "body": "Comment text"
        }
      ]
    }
  ]
}
```
````

````

**Parsed Object:**
```typescript
{
  statusCode: 200,
  description: "successful",
  example: {
    tickets: [
      {
        id: 1,
        customer: {
          id: 1,
          firstname: "Walkin",
          lastname: "Customer"
        },
        comments: [
          {
            id: 1,
            body: "Comment text"
          }
        ]
      }
    ]
  }
}
````

### Responses Without Examples

Some responses (like 404) may not have JSON examples:

```markdown
**Response: 404**

Invalid request
```

**Parsed Object:**

```typescript
{
  statusCode: 404,
  description: "Invalid request",
  example: undefined
}
```

## Usage Examples

### Basic Usage

```typescript
import { parseMarkdownFile } from './src/parser/markdown';

// Parse a single documentation file
const document = await parseMarkdownFile('docs/api/customer.md');

console.log(`Resource: ${document.resourceName}`);
console.log(`Endpoints: ${document.endpoints.length}`);

// Access first endpoint
const firstEndpoint = document.endpoints[0];
console.log(`Operation: ${firstEndpoint.operation}`);
console.log(`Method: ${firstEndpoint.method} ${firstEndpoint.path}`);
```

### Iterating Over Endpoints

```typescript
const document = await parseMarkdownFile('docs/api/customer.md');

document.endpoints.forEach((endpoint) => {
  console.log(`\n${endpoint.operation}`);
  console.log(`  ${endpoint.method} ${endpoint.path}`);
  console.log(`  Permission: ${endpoint.permission}`);

  if (endpoint.parameters.length > 0) {
    console.log('  Parameters:');
    endpoint.parameters.forEach((param) => {
      console.log(
        `    - ${param.name} (${param.type}): ${param.required ? 'required' : 'optional'}`
      );
    });
  }

  endpoint.responses.forEach((response) => {
    console.log(`  Response ${response.statusCode}: ${response.description}`);
  });
});
```

### Finding Specific Endpoints

```typescript
const document = await parseMarkdownFile('docs/api/customer.md');

// Find GET endpoints
const getEndpoints = document.endpoints.filter((e) => e.method === 'GET');

// Find endpoints with specific path
const getByIdEndpoint = document.endpoints.find(
  (e) => e.path === '/customers/{id}'
);

// Find endpoints requiring specific permission
const createEndpoints = document.endpoints.filter((e) =>
  e.permission.includes('Create')
);
```

### Validating Parsed Data

```typescript
import { parseMarkdownFile } from './src/parser/markdown';
import { ApiDocumentValidation } from './src/parser/schema';

const document = await parseMarkdownFile('docs/api/customer.md');

// Validate entire document
const isValidDocument = ApiDocumentValidation.validateDocument(document);
console.log(`Document valid: ${isValidDocument}`);

// Validate each endpoint
document.endpoints.forEach((endpoint) => {
  const isValid = ApiDocumentValidation.validateEndpoint(endpoint);
  console.log(`${endpoint.operation} valid: ${isValid}`);
});
```

### Extracting Parameter Information

```typescript
const document = await parseMarkdownFile('docs/api/customer.md');

const getCustomersEndpoint = document.endpoints.find(
  (e) => e.operation === 'Get Customers'
);

// Get all query parameters
const queryParams = getCustomersEndpoint?.parameters.filter(
  (p) => p.paramType === 'query'
);

// Get required parameters
const requiredParams = getCustomersEndpoint?.parameters.filter(
  (p) => p.required
);

// Get parameters by type
const integerParams = getCustomersEndpoint?.parameters.filter(
  (p) => p.type === 'integer'
);

console.log(
  'Query parameters:',
  queryParams?.map((p) => p.name)
);
console.log(
  'Required parameters:',
  requiredParams?.map((p) => p.name)
);
```

### Working with Response Examples

```typescript
const document = await parseMarkdownFile('docs/api/customer.md');

const getCustomersEndpoint = document.endpoints.find(
  (e) => e.operation === 'Get Customers'
);

const successResponse = getCustomersEndpoint?.responses.find(
  (r) => r.statusCode === 200
);

if (successResponse?.example) {
  // Access the example data
  const customers = successResponse.example.customers;
  console.log(`Example has ${customers.length} customers`);

  // Use example for testing or documentation
  const firstCustomer = customers[0];
  console.log(
    'First customer:',
    firstCustomer.firstname,
    firstCustomer.lastname
  );
}
```

### Processing Multiple Documents

```typescript
import * as fs from 'fs/promises';
import { parseMarkdownFile } from './src/parser/markdown';

// Read all markdown files from docs/api directory
const apiDir = 'docs/api';
const files = await fs.readdir(apiDir);
const markdownFiles = files.filter((f) => f.endsWith('.md'));

// Parse all documents
const documents = await Promise.all(
  markdownFiles.map((file) => parseMarkdownFile(`${apiDir}/${file}`))
);

// Collect all endpoints across all documents
const allEndpoints = documents.flatMap((doc) => doc.endpoints);

console.log(`Total documents: ${documents.length}`);
console.log(`Total endpoints: ${allEndpoints.length}`);

// Group by resource
const byResource = new Map<string, typeof allEndpoints>();
documents.forEach((doc) => {
  byResource.set(doc.resourceName, doc.endpoints);
});

// Find all GET endpoints
const allGetEndpoints = allEndpoints.filter((e) => e.method === 'GET');
console.log(`GET endpoints: ${allGetEndpoints.length}`);
```

## Type Safety

The parser provides full TypeScript type safety:

```typescript
import {
  ApiDocument,
  ApiEndpoint,
  ApiParameter,
  ApiResponse,
} from './src/utils/types';

function processEndpoint(endpoint: ApiEndpoint): void {
  // TypeScript knows all these properties exist
  const { resource, operation, method, path } = endpoint;

  // Parameters are properly typed
  endpoint.parameters.forEach((param: ApiParameter) => {
    // paramType is constrained to 'query' | 'path' | 'body'
    if (param.paramType === 'query') {
      console.log(`Query param: ${param.name}`);
    }
  });

  // Responses are properly typed
  endpoint.responses.forEach((response: ApiResponse) => {
    // statusCode is a number
    console.log(`Response: ${response.statusCode}`);
  });
}
```

## Error Handling

The parser includes error handling for common issues:

```typescript
import { parseMarkdownFile } from './src/parser/markdown';

try {
  const document = await parseMarkdownFile('docs/api/customer.md');
  // Process document...
} catch (error) {
  if (error instanceof Error) {
    console.error(`Failed to parse file: ${error.message}`);
  }
}
```

The parser will:

- Throw an error if the file cannot be read
- Throw an error if the resource name header is missing
- Log warnings for individual endpoints that fail to parse
- Continue parsing other endpoints if one fails

## Performance Considerations

- The parser reads files asynchronously using `fs.promises`
- Parsing is done in-memory without external dependencies
- Large files are handled efficiently with line-by-line processing
- JSON examples are parsed only when present

## Summary

The markdown parser provides a robust way to convert RepairShopr API documentation from markdown to structured TypeScript objects. It handles all edge cases gracefully and provides full type safety for downstream usage.
