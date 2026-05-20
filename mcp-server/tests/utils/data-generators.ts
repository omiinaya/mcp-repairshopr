/**
 * Test data generators for unit tests
 */

import {
  ApiEndpoint,
  ApiParameter,
  ApiResponse,
  ApiDocument,
} from '../../src/utils/types';

/**
 * Generate a sample API endpoint
 */
export function generateEndpoint(
  overrides: Partial<ApiEndpoint> = {}
): ApiEndpoint {
  return {
    resource: 'TestResource',
    operation: 'Test Operation',
    description: 'Test description',
    method: 'GET',
    path: '/test',
    permission: 'test.view',
    parameters: [],
    responses: [
      {
        statusCode: 200,
        description: 'Success',
      },
    ],
    ...overrides,
  };
}

/**
 * Generate multiple sample endpoints
 */
export function generateEndpoints(
  count: number,
  overrides?: Partial<ApiEndpoint>
): ApiEndpoint[] {
  return Array.from({ length: count }, (_, i) =>
    generateEndpoint({
      ...overrides,
      path: `/test/${i}`,
      operation: `Test Operation ${i}`,
    })
  );
}

/**
 * Generate a sample API parameter
 */
export function generateParameter(
  overrides: Partial<ApiParameter> = {}
): ApiParameter {
  return {
    name: 'test_param',
    type: 'string',
    required: false,
    description: 'Test parameter',
    paramType: 'query',
    ...overrides,
  };
}

/**
 * Generate multiple sample parameters
 */
export function generateParameters(
  count: number,
  overrides?: Partial<ApiParameter>
): ApiParameter[] {
  return Array.from({ length: count }, (_, i) =>
    generateParameter({
      ...overrides,
      name: `param_${i}`,
    })
  );
}

/**
 * Generate a sample API response
 */
export function generateResponse(
  overrides: Partial<ApiResponse> = {}
): ApiResponse {
  return {
    statusCode: 200,
    description: 'Successful response',
    ...overrides,
  };
}

/**
 * Generate multiple sample responses
 */
export function generateResponses(
  count: number,
  overrides?: Partial<ApiResponse>
): ApiResponse[] {
  return Array.from({ length: count }, (_, i) =>
    generateResponse({
      ...overrides,
      statusCode: 200 + i,
    })
  );
}

/**
 * Generate a sample API document
 */
export function generateDocument(
  overrides: Partial<ApiDocument> = {}
): ApiDocument {
  return {
    resourceName: 'TestResource',
    endpoints: [generateEndpoint()],
    ...overrides,
  };
}

/**
 * Generate multiple sample documents
 */
export function generateDocuments(
  count: number,
  overrides?: Partial<ApiDocument>
): ApiDocument[] {
  return Array.from({ length: count }, (_, i) =>
    generateDocument({
      ...overrides,
      resourceName: `Resource${i}`,
    })
  );
}

/**
 * Generate endpoints with different HTTP methods
 */
export function generateEndpointsWithMethods(): ApiEndpoint[] {
  return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((method) =>
    generateEndpoint({
      method: method as any,
      operation: `${method} Test`,
      path: `/test/${method.toLowerCase()}`,
    })
  );
}

/**
 * Generate endpoints with different parameter types
 */
export function generateEndpointsWithParameterTypes(): ApiEndpoint[] {
  return ['query', 'path', 'body'].map((paramType) =>
    generateEndpoint({
      operation: `Test with ${paramType} params`,
      parameters: [generateParameter({ paramType: paramType as any })],
    })
  );
}

/**
 * Generate endpoints with various status codes
 */
export function generateEndpointsWithStatusCodes(): ApiEndpoint[] {
  return [200, 201, 204, 400, 401, 403, 404, 422, 500].map((statusCode) =>
    generateEndpoint({
      operation: `Test ${statusCode} response`,
      responses: [generateResponse({ statusCode })],
    })
  );
}

/**
 * Generate a complex endpoint with all fields populated
 */
export function generateComplexEndpoint(): ApiEndpoint {
  return generateEndpoint({
    resource: 'Customer',
    operation: 'Get Customer by ID',
    description: 'Retrieve a specific customer by ID with all related data',
    method: 'GET',
    path: '/customers/{id}',
    permission: 'customer.view',
    parameters: [
      generateParameter({
        name: 'id',
        type: 'integer',
        required: true,
        description: 'Customer ID',
        paramType: 'path',
      }),
      generateParameter({
        name: 'include',
        type: 'string',
        required: false,
        description: 'Include related resources (comma-separated)',
        paramType: 'query',
      }),
    ],
    requestBody: [],
    responses: [
      generateResponse({
        statusCode: 200,
        description: 'Successful response with customer data',
        example: {
          customer: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-1234',
            created_at: '2024-01-01T00:00:00Z',
          },
        },
      }),
      generateResponse({
        statusCode: 404,
        description: 'Customer not found',
        example: {
          error: 'Not Found',
          message: 'The requested customer could not be found',
        },
      }),
    ],
  });
}

/**
 * Generate endpoints for pagination testing
 */
export function generatePaginationEndpoints(): ApiEndpoint[] {
  return [
    generateEndpoint({
      resource: 'Customer',
      operation: 'Get Customers',
      description: 'Retrieve a paginated list of customers',
      method: 'GET',
      path: '/customers',
      parameters: [
        generateParameter({
          name: 'page',
          type: 'integer',
          required: false,
          description: 'Page number (min: 1)',
          paramType: 'query',
        }),
        generateParameter({
          name: 'limit',
          type: 'integer',
          required: false,
          description: 'Results per page (max: 100)',
          paramType: 'query',
        }),
        generateParameter({
          name: 'sort',
          type: 'string',
          required: false,
          description: 'Sort field (enum: [name, created_at, updated_at])',
          paramType: 'query',
        }),
      ],
    }),
    generateEndpoint({
      resource: 'Ticket',
      operation: 'Get Tickets',
      description: 'Retrieve a paginated list of tickets',
      method: 'GET',
      path: '/tickets',
      parameters: [
        generateParameter({
          name: 'page',
          type: 'integer',
          required: false,
          description: 'Page number',
          paramType: 'query',
        }),
        generateParameter({
          name: 'per_page',
          type: 'integer',
          required: false,
          description: 'Results per page',
          paramType: 'query',
        }),
      ],
    }),
  ];
}

/**
 * Generate endpoints with request bodies
 */
export function generateEndpointsWithBodies(): ApiEndpoint[] {
  return [
    generateEndpoint({
      resource: 'Customer',
      operation: 'Create Customer',
      description: 'Create a new customer',
      method: 'POST',
      path: '/customers',
      parameters: [],
      requestBody: [
        generateParameter({
          name: 'name',
          type: 'string',
          required: true,
          description: 'Customer name (minLength: 2, maxLength: 100)',
          paramType: 'body',
        }),
        generateParameter({
          name: 'email',
          type: 'string',
          required: true,
          description: 'Customer email (pattern: email)',
          paramType: 'body',
        }),
        generateParameter({
          name: 'phone',
          type: 'string',
          required: false,
          description: 'Customer phone number',
          paramType: 'body',
        }),
      ],
      responses: [
        generateResponse({
          statusCode: 201,
          description: 'Customer created successfully',
          example: {
            customer: {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
        }),
      ],
    }),
    generateEndpoint({
      resource: 'Ticket',
      operation: 'Create Ticket',
      description: 'Create a new ticket',
      method: 'POST',
      path: '/tickets',
      parameters: [],
      requestBody: [
        generateParameter({
          name: 'subject',
          type: 'string',
          required: true,
          description: 'Ticket subject',
          paramType: 'body',
        }),
        generateParameter({
          name: 'description',
          type: 'string',
          required: true,
          description: 'Ticket description',
          paramType: 'body',
        }),
        generateParameter({
          name: 'customer_id',
          type: 'integer',
          required: true,
          description: 'Customer ID',
          paramType: 'body',
        }),
      ],
      responses: [
        generateResponse({
          statusCode: 201,
          description: 'Ticket created successfully',
          example: {
            ticket: {
              id: 1,
              subject: 'Support Request',
            },
          },
        }),
      ],
    }),
  ];
}

/**
 * Generate endpoints with error responses
 */
export function generateEndpointsWithErrors(): ApiEndpoint[] {
  return [
    generateEndpoint({
      resource: 'Customer',
      operation: 'Get Customer by ID',
      description: 'Retrieve a specific customer',
      method: 'GET',
      path: '/customers/{id}',
      parameters: [
        generateParameter({
          name: 'id',
          type: 'integer',
          required: true,
          description: 'Customer ID',
          paramType: 'path',
        }),
      ],
      responses: [
        generateResponse({
          statusCode: 200,
          description: 'Success',
        }),
        generateResponse({
          statusCode: 401,
          description: 'Unauthorized',
          example: {
            error: 'Unauthorized',
            message: 'Invalid or missing authentication token',
          },
        }),
        generateResponse({
          statusCode: 404,
          description: 'Not found',
          example: {
            error: 'Not Found',
            message: 'The requested customer could not be found',
          },
        }),
        generateResponse({
          statusCode: 422,
          description: 'Unprocessable Entity',
          example: {
            error: 'Validation Failed',
            message: 'The request could not be validated',
          },
        }),
        generateResponse({
          statusCode: 500,
          description: 'Internal Server Error',
          example: {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
          },
        }),
      ],
    }),
  ];
}

/**
 * Generate sample search queries
 */
export function generateSearchQueries(): string[] {
  return [
    'get customers',
    'create customer',
    'get tickets',
    'create ticket',
    'get invoices',
    'customer by id',
    'ticket status',
    'invoice list',
    'search customers',
    'filter tickets',
    'pagination',
    'sort results',
  ];
}

/**
 * Generate complex search queries
 */
export function generateComplexSearchQueries(): string[] {
  return [
    'GET customer by id and email',
    'POST create customer with name and phone',
    'GET tickets with status filter',
    'search for customers by name',
    'get paginated list of invoices',
    'update ticket status to closed',
    'delete customer by id',
    'create ticket for customer',
    'get all resources',
    'filter by permission',
  ];
}

/**
 * Generate edge case queries
 */
export function generateEdgeCaseQueries(): string[] {
  return [
    '', // Empty query
    '   ', // Whitespace only
    '!!!@#$%', // Special characters
    'a'.repeat(1000), // Very long query
    'search', // Generic term
    'nonexistent resource', // Non-existent resource
    'invalid endpoint path', // Invalid path
    'GET /customers/{id}/nested/path', // Complex path
    'multiple words with different meanings', // Ambiguous query
  ];
}

/**
 * Generate sample query parameters
 */
export function generateQueryParams(): Record<string, any>[] {
  return [
    { query: 'get customers', limit: 5 },
    { query: 'create customer', resource: 'Customer' },
    { query: 'get tickets', method: 'GET' },
    { query: 'search', resource: 'Customer', method: 'GET' },
    { query: 'filter', permission: 'customer.view' },
    { query: 'get', limit: 10, resource: 'Customer', method: 'GET' },
  ];
}

/**
 * Generate invalid query parameters
 */
export function generateInvalidQueryParams(): Record<string, any>[] {
  return [
    { query: '', limit: 5 },
    { query: '   ', limit: 10 },
    { query: 'test', limit: -1 },
    { query: 'test', limit: 0 },
    { query: 'test', limit: 1000000 },
    { resource: 'NonExistent' },
    { method: 'INVALID' },
    { permission: 'nonexistent.permission' },
  ];
}
