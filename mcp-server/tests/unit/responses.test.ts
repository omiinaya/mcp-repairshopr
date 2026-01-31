/**
 * Unit tests for response reference tool
 */

import {
  getResponses,
  getCommonPatterns,
  getResponsesByPattern,
  getStatusInfo,
  ResponseLookupParams
} from '../../src/tools/responses';
import { MetadataIndex, buildMetadataIndex } from '../../src/parser/metadata';
import { ApiDocument, ApiEndpoint } from '../../src/utils/types';

describe('Response Reference Tool', () => {
  let metadataIndex: MetadataIndex;
  let sampleEndpoints: ApiEndpoint[];

  beforeEach(() => {
    // Create sample API documents for testing
    const sampleDocuments: ApiDocument[] = [
      {
        resourceName: 'Customer',
        endpoints: [
          {
            resource: 'Customer',
            operation: 'Get Customers',
            description: 'Retrieve a list of customers',
            method: 'GET',
            path: '/customers',
            permission: 'customer.view',
            parameters: [
              {
                name: 'page',
                type: 'integer',
                required: false,
                description: 'Page number for pagination',
                paramType: 'query'
              }
            ],
            responses: [
              {
                statusCode: 200,
                description: 'Successful response with paginated customer list',
                example: {
                  data: [
                    { id: 1, name: 'John Doe', email: 'john@example.com' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
                  ],
                  meta: {
                    total: 2,
                    page: 1,
                    per_page: 20,
                    total_pages: 1
                  }
                }
              },
              {
                statusCode: 401,
                description: 'Unauthorized - authentication required',
                example: {
                  error: 'Unauthorized',
                  message: 'Invalid or missing authentication token'
                }
              },
              {
                statusCode: 429,
                description: 'Too many requests - rate limit exceeded',
                example: {
                  error: 'Too Many Requests',
                  message: 'Rate limit exceeded',
                  retry_after: 60
                }
              }
            ]
          },
          {
            resource: 'Customer',
            operation: 'Get Customer by ID',
            description: 'Retrieve a specific customer by ID',
            method: 'GET',
            path: '/customers/{id}',
            permission: 'customer.view',
            parameters: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'Customer ID',
                paramType: 'path'
              }
            ],
            responses: [
              {
                statusCode: 200,
                description: 'Successful response with customer details',
                example: {
                  id: 1,
                  name: 'John Doe',
                  email: 'john@example.com',
                  phone: '555-1234',
                  created_at: '2024-01-01T00:00:00Z'
                }
              },
              {
                statusCode: 404,
                description: 'Customer not found',
                example: {
                  error: 'Not Found',
                  message: 'The requested customer could not be found'
                }
              }
            ]
          },
          {
            resource: 'Customer',
            operation: 'Create Customer',
            description: 'Create a new customer',
            method: 'POST',
            path: '/customers',
            permission: 'customer.create',
            parameters: [],
            requestBody: [
              {
                name: 'name',
                type: 'string',
                required: true,
                description: 'Customer name',
                paramType: 'body'
              }
            ],
            responses: [
              {
                statusCode: 201,
                description: 'Customer created successfully',
                example: {
                  id: 1,
                  name: 'John Doe',
                  email: 'john@example.com',
                  created_at: '2024-01-01T00:00:00Z'
                }
              },
              {
                statusCode: 422,
                description: 'Validation error - invalid input data',
                example: {
                  error: 'Validation Failed',
                  message: 'The request could not be validated',
                  errors: {
                    name: ['Name is required'],
                    email: ['Invalid email format']
                  }
                }
              }
            ]
          },
          {
            resource: 'Customer',
            operation: 'Delete Customer',
            description: 'Delete a customer',
            method: 'DELETE',
            path: '/customers/{id}',
            permission: 'customer.delete',
            parameters: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'Customer ID',
                paramType: 'path'
              }
            ],
            responses: [
              {
                statusCode: 204,
                description: 'Customer deleted successfully'
              },
              {
                statusCode: 404,
                description: 'Customer not found',
                example: {
                  error: 'Not Found',
                  message: 'The requested customer could not be found'
                }
              }
            ]
          }
        ]
      },
      {
        resourceName: 'Ticket',
        endpoints: [
          {
            resource: 'Ticket',
            operation: 'Get Tickets',
            description: 'Retrieve a list of tickets',
            method: 'GET',
            path: '/tickets',
            permission: 'ticket.view',
            parameters: [],
            responses: [
              {
                statusCode: 200,
                description: 'Successful response with ticket list',
                example: {
                  tickets: []
                }
              },
              {
                statusCode: 500,
                description: 'Internal server error',
                example: {
                  error: 'Internal Server Error',
                  message: 'An unexpected error occurred'
                }
              }
            ]
          }
        ]
      }
    ];

    // Build metadata index from sample documents
    metadataIndex = buildMetadataIndex(sampleDocuments);
    sampleEndpoints = metadataIndex.allEndpoints;
  });

  describe('getResponses - Response lookup by endpoint', () => {
    test('should find all responses for an endpoint', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getResponses(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.endpointPath).toBe('/customers');
      expect(result!.method).toBe('GET');
      expect(result!.totalCount).toBe(3);
      expect(result!.responses.length).toBe(3);
    });

    test('should find responses for endpoint with path parameters', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET'
      };

      const result = getResponses(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(2);
      expect(result!.responses[0].statusCode).toBe(200);
      expect(result!.responses[1].statusCode).toBe(404);
    });

    test('should find responses for POST endpoint', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'POST'
      };

      const result = getResponses(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(2);
      expect(result!.responses[0].statusCode).toBe(201);
      expect(result!.responses[1].statusCode).toBe(422);
    });

    test('should find responses for DELETE endpoint', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'DELETE'
      };

      const result = getResponses(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(2);
      expect(result!.responses[0].statusCode).toBe(204);
      expect(result!.responses[1].statusCode).toBe(404);
    });

    test('should return null for non-existent endpoint', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/nonexistent',
        method: 'GET'
      };

      const result = getResponses(params, metadataIndex);

      expect(result).toBeNull();
    });

    test('should return null for wrong method', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'POST'
      };

      const result = getResponses(params, metadataIndex);

      expect(result).toBeNull();
    });

    test('should handle lowercase method', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'get'
      };

      const result = getResponses(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.method).toBe('GET');
    });
  });

  describe('getResponses - Response filtering by status code', () => {
    test('should filter by status code 200', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '200'
      };

      const result = getResponses(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(1);
      expect(result!.responses[0].statusCode).toBe(200);
    });

    test('should filter by status code 404', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        statusCode: '404'
      };

      const result = getResponses(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(1);
      expect(result!.responses[0].statusCode).toBe(404);
    });

    test('should filter by status code 201', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'POST',
        statusCode: '201'
      };

      const result = getResponses(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(1);
      expect(result!.responses[0].statusCode).toBe(201);
    });

    test('should filter by status code 204', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'DELETE',
        statusCode: '204'
      };

      const result = getResponses(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(1);
      expect(result!.responses[0].statusCode).toBe(204);
    });

    test('should return empty result when status code not found', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '999'
      };

      const result = getResponses(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(0);
      expect(result!.responses).toEqual([]);
    });

    test('should throw error for invalid status code', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: 'invalid'
      };

      expect(() => {
        getResponses(params, metadataIndex);
      }).toThrow('statusCode must be a valid number');
    });
  });

  describe('getResponses - Status code information', () => {
    test('should include status code information for 200', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '200'
      };

      const result = getResponses(params, metadataIndex);
      const statusInfo = result!.responses[0].statusCodeInfo;

      expect(statusInfo.code).toBe(200);
      expect(statusInfo.category).toBe('2xx');
      expect(statusInfo.name).toBe('OK');
      expect(statusInfo.isSuccess).toBe(true);
      expect(statusInfo.isError).toBe(false);
      expect(statusInfo.isRedirect).toBe(false);
    });

    test('should include status code information for 201', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'POST',
        statusCode: '201'
      };

      const result = getResponses(params, metadataIndex);
      const statusInfo = result!.responses[0].statusCodeInfo;

      expect(statusInfo.code).toBe(201);
      expect(statusInfo.category).toBe('2xx');
      expect(statusInfo.name).toBe('Created');
      expect(statusInfo.isSuccess).toBe(true);
    });

    test('should include status code information for 204', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'DELETE',
        statusCode: '204'
      };

      const result = getResponses(params, metadataIndex);
      const statusInfo = result!.responses[0].statusCodeInfo;

      expect(statusInfo.code).toBe(204);
      expect(statusInfo.category).toBe('2xx');
      expect(statusInfo.name).toBe('No Content');
      expect(statusInfo.isSuccess).toBe(true);
    });

    test('should include status code information for 401', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '401'
      };

      const result = getResponses(params, metadataIndex);
      const statusInfo = result!.responses[0].statusCodeInfo;

      expect(statusInfo.code).toBe(401);
      expect(statusInfo.category).toBe('4xx');
      expect(statusInfo.name).toBe('Unauthorized');
      expect(statusInfo.isSuccess).toBe(false);
      expect(statusInfo.isError).toBe(true);
    });

    test('should include status code information for 404', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        statusCode: '404'
      };

      const result = getResponses(params, metadataIndex);
      const statusInfo = result!.responses[0].statusCodeInfo;

      expect(statusInfo.code).toBe(404);
      expect(statusInfo.category).toBe('4xx');
      expect(statusInfo.name).toBe('Not Found');
      expect(statusInfo.isSuccess).toBe(false);
      expect(statusInfo.isError).toBe(true);
    });

    test('should include status code information for 422', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'POST',
        statusCode: '422'
      };

      const result = getResponses(params, metadataIndex);
      const statusInfo = result!.responses[0].statusCodeInfo;

      expect(statusInfo.code).toBe(422);
      expect(statusInfo.category).toBe('4xx');
      expect(statusInfo.name).toBe('Unprocessable Entity');
      expect(statusInfo.isSuccess).toBe(false);
      expect(statusInfo.isError).toBe(true);
    });

    test('should include status code information for 429', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '429'
      };

      const result = getResponses(params, metadataIndex);
      const statusInfo = result!.responses[0].statusCodeInfo;

      expect(statusInfo.code).toBe(429);
      expect(statusInfo.category).toBe('4xx');
      expect(statusInfo.name).toBe('Too Many Requests');
      expect(statusInfo.isSuccess).toBe(false);
      expect(statusInfo.isError).toBe(true);
    });

    test('should include status code information for 500', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/tickets',
        method: 'GET',
        statusCode: '500'
      };

      const result = getResponses(params, metadataIndex);
      const statusInfo = result!.responses[0].statusCodeInfo;

      expect(statusInfo.code).toBe(500);
      expect(statusInfo.category).toBe('5xx');
      expect(statusInfo.name).toBe('Internal Server Error');
      expect(statusInfo.isSuccess).toBe(false);
      expect(statusInfo.isError).toBe(true);
    });

    test('should handle unknown status codes', () => {
      const endpoint: ApiEndpoint = {
        resource: 'Test',
        operation: 'Test',
        description: 'Test',
        method: 'GET',
        path: '/test',
        permission: 'test.view',
        parameters: [],
        responses: [
          {
            statusCode: 418,
            description: "I'm a teapot"
          }
        ]
      };

      const testIndex: MetadataIndex = {
        resources: new Map(),
        endpointsByPath: new Map([['GET:/test', endpoint]]),
        endpointsByPermission: new Map(),
        endpointsByMethod: new Map(),
        allEndpoints: [endpoint]
      };

      const params: ResponseLookupParams = {
        endpointPath: '/test',
        method: 'GET'
      };

      const result = getResponses(params, testIndex);
      const statusInfo = result!.responses[0].statusCodeInfo;

      expect(statusInfo.code).toBe(418);
      expect(statusInfo.category).toBe('4xx');
      expect(statusInfo.name).toBe('Unknown');
      expect(statusInfo.isSuccess).toBe(false);
      expect(statusInfo.isError).toBe(true);
    });
  });

  describe('getResponses - Response schema and examples', () => {
    test('should include response example', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '200'
      };

      const result = getResponses(params, metadataIndex);
      const response = result!.responses[0];

      expect(response.example).toBeDefined();
      expect(response.example).toHaveProperty('data');
      expect(response.example).toHaveProperty('meta');
    });

    test('should extract schema from example', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '200'
      };

      const result = getResponses(params, metadataIndex);
      const schema = result!.responses[0].schema;

      expect(schema).toBeDefined();
      expect(schema!.type).toBe('object');
      expect(schema!.properties).toBeDefined();
      expect(schema!.properties!.data).toBeDefined();
      expect(schema!.properties!.meta).toBeDefined();
    });

    test('should extract array schema from array example', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '200'
      };

      const result = getResponses(params, metadataIndex);
      const dataSchema = result!.responses[0].schema!.properties!.data;

      expect(dataSchema.type).toBe('array');
      expect(dataSchema.items).toBeDefined();
    });

    test('should extract object schema from object example', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        statusCode: '200'
      };

      const result = getResponses(params, metadataIndex);
      const schema = result!.responses[0].schema;

      expect(schema).toBeDefined();
      expect(schema!.type).toBe('object');
      expect(schema!.properties).toBeDefined();
      expect(schema!.properties!.id).toBeDefined();
      expect(schema!.properties!.name).toBeDefined();
    });

    test('should handle responses without examples', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'DELETE',
        statusCode: '204'
      };

      const result = getResponses(params, metadataIndex);
      const response = result!.responses[0];

      expect(response.example).toBeUndefined();
      expect(response.schema).toBeUndefined();
    });

    test('should include required properties in schema', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        statusCode: '200'
      };

      const result = getResponses(params, metadataIndex);
      const schema = result!.responses[0].schema;

      expect(schema!.required).toBeDefined();
      expect(schema!.required!.length).toBeGreaterThan(0);
    });
  });

  describe('getResponses - Error response documentation', () => {
    test('should include error documentation for 401', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '401'
      };

      const result = getResponses(params, metadataIndex);
      const errorDoc = result!.responses[0].errorDocumentation;

      expect(errorDoc).toBeDefined();
      expect(errorDoc!.statusCode).toBe(401);
      expect(errorDoc!.errorType).toBe('authentication');
      expect(errorDoc!.message).toBeDefined();
      expect(errorDoc!.resolution).toBeDefined();
    });

    test('should include error documentation for 404', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        statusCode: '404'
      };

      const result = getResponses(params, metadataIndex);
      const errorDoc = result!.responses[0].errorDocumentation;

      expect(errorDoc).toBeDefined();
      expect(errorDoc!.statusCode).toBe(404);
      expect(errorDoc!.errorType).toBe('not_found');
      expect(errorDoc!.message).toBeDefined();
    });

    test('should include error documentation for 422', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'POST',
        statusCode: '422'
      };

      const result = getResponses(params, metadataIndex);
      const errorDoc = result!.responses[0].errorDocumentation;

      expect(errorDoc).toBeDefined();
      expect(errorDoc!.statusCode).toBe(422);
      expect(errorDoc!.errorType).toBe('validation');
      expect(errorDoc!.message).toBeDefined();
    });

    test('should include error documentation for 429', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '429'
      };

      const result = getResponses(params, metadataIndex);
      const errorDoc = result!.responses[0].errorDocumentation;

      expect(errorDoc).toBeDefined();
      expect(errorDoc!.statusCode).toBe(429);
      expect(errorDoc!.errorType).toBe('rate_limit');
      expect(errorDoc!.message).toBeDefined();
    });

    test('should include error documentation for 500', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/tickets',
        method: 'GET',
        statusCode: '500'
      };

      const result = getResponses(params, metadataIndex);
      const errorDoc = result!.responses[0].errorDocumentation;

      expect(errorDoc).toBeDefined();
      expect(errorDoc!.statusCode).toBe(500);
      expect(errorDoc!.errorType).toBe('server_error');
      expect(errorDoc!.message).toBeDefined();
    });

    test('should extract error code from example', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '401'
      };

      const result = getResponses(params, metadataIndex);
      const errorDoc = result!.responses[0].errorDocumentation;

      expect(errorDoc!.errorCode).toBe('Unauthorized');
    });

    test('should extract error details from example', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'POST',
        statusCode: '422'
      };

      const result = getResponses(params, metadataIndex);
      const errorDoc = result!.responses[0].errorDocumentation;

      expect(errorDoc!.details).toBeDefined();
    });

    test('should not include error documentation for success responses', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '200'
      };

      const result = getResponses(params, metadataIndex);
      const errorDoc = result!.responses[0].errorDocumentation;

      expect(errorDoc).toBeUndefined();
    });

    test('should provide default resolution for error types', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '404'
      };

      const result = getResponses(params, metadataIndex);
      const errorDoc = result!.responses[0].errorDocumentation;

      expect(errorDoc!.resolution).toContain('Verify the resource ID');
    });
  });

  describe('getResponses - Response format descriptions', () => {
    test('should include format description for paginated response', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '200'
      };

      const result = getResponses(params, metadataIndex);
      const formatDesc = result!.responses[0].formatDescription;

      expect(formatDesc).toBeDefined();
      expect(formatDesc!.name).toBe('paginated');
      expect(formatDesc!.description).toContain('paginated');
      expect(formatDesc!.contentType).toBe('application/json');
      expect(formatDesc!.commonFields).toContain('data');
      expect(formatDesc!.commonFields).toContain('meta');
    });

    test('should include format description for object response', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        statusCode: '200'
      };

      const result = getResponses(params, metadataIndex);
      const formatDesc = result!.responses[0].formatDescription;

      expect(formatDesc).toBeDefined();
      expect(formatDesc!.name).toBe('object');
      expect(formatDesc!.contentType).toBe('application/json');
      expect(formatDesc!.commonFields).toContain('id');
      expect(formatDesc!.commonFields).toContain('name');
    });

    test('should include format description for error response', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '401'
      };

      const result = getResponses(params, metadataIndex);
      const formatDesc = result!.responses[0].formatDescription;

      expect(formatDesc).toBeDefined();
      expect(formatDesc!.name).toBe('error');
      expect(formatDesc!.contentType).toBe('application/json');
      expect(formatDesc!.commonFields).toContain('error');
      expect(formatDesc!.commonFields).toContain('message');
    });

    test('should include format description for no content response', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'DELETE',
        statusCode: '204'
      };

      const result = getResponses(params, metadataIndex);
      const formatDesc = result!.responses[0].formatDescription;

      expect(formatDesc).toBeDefined();
      expect(formatDesc!.name).toBe('no_content');
      expect(formatDesc!.structure).toBe('(empty)');
      expect(formatDesc!.commonFields).toEqual([]);
    });

    test('should not include format description for responses without examples', () => {
      const endpoint: ApiEndpoint = {
        resource: 'Test',
        operation: 'Test',
        description: 'Test',
        method: 'GET',
        path: '/test',
        permission: 'test.view',
        parameters: [],
        responses: [
          {
            statusCode: 200,
            description: 'Success'
          }
        ]
      };

      const testIndex: MetadataIndex = {
        resources: new Map(),
        endpointsByPath: new Map([['GET:/test', endpoint]]),
        endpointsByPermission: new Map(),
        endpointsByMethod: new Map(),
        allEndpoints: [endpoint]
      };

      const params: ResponseLookupParams = {
        endpointPath: '/test',
        method: 'GET'
      };

      const result = getResponses(params, testIndex);
      const formatDesc = result!.responses[0].formatDescription;

      expect(formatDesc).toBeUndefined();
    });
  });

  describe('getResponses - Common response patterns', () => {
    test('should identify pagination pattern', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '200'
      };

      const result = getResponses(params, metadataIndex);
      const pattern = result!.responses[0].pattern;

      expect(pattern).toBeDefined();
      expect(pattern!.name).toBe('pagination');
      expect(pattern!.description).toContain('paginated');
      expect(pattern!.statusCodes).toContain(200);
    });

    test('should identify single_resource pattern', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        statusCode: '200'
      };

      const result = getResponses(params, metadataIndex);
      const pattern = result!.responses[0].pattern;

      expect(pattern).toBeDefined();
      expect(pattern!.name).toBe('single_resource');
      expect(pattern!.statusCodes).toContain(200);
    });

    test('should identify created_resource pattern', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'POST',
        statusCode: '201'
      };

      const result = getResponses(params, metadataIndex);
      const pattern = result!.responses[0].pattern;

      expect(pattern).toBeDefined();
      expect(pattern!.name).toBe('created_resource');
      expect(pattern!.statusCodes).toContain(201);
    });

    test('should identify validation_error pattern', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'POST',
        statusCode: '422'
      };

      const result = getResponses(params, metadataIndex);
      const pattern = result!.responses[0].pattern;

      expect(pattern).toBeDefined();
      expect(pattern!.name).toBe('validation_error');
      expect(pattern!.statusCodes).toContain(422);
    });

    test('should identify authentication_error pattern', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '401'
      };

      const result = getResponses(params, metadataIndex);
      const pattern = result!.responses[0].pattern;

      expect(pattern).toBeDefined();
      expect(pattern!.name).toBe('authentication_error');
      expect(pattern!.statusCodes).toContain(401);
    });

    test('should identify not_found_error pattern', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        statusCode: '404'
      };

      const result = getResponses(params, metadataIndex);
      const pattern = result!.responses[0].pattern;

      expect(pattern).toBeDefined();
      expect(pattern!.name).toBe('not_found_error');
      expect(pattern!.statusCodes).toContain(404);
    });

    test('should identify rate_limit_error pattern', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: '429'
      };

      const result = getResponses(params, metadataIndex);
      const pattern = result!.responses[0].pattern;

      expect(pattern).toBeDefined();
      expect(pattern!.name).toBe('rate_limit_error');
      expect(pattern!.statusCodes).toContain(429);
    });

    test('should identify server_error pattern', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/tickets',
        method: 'GET',
        statusCode: '500'
      };

      const result = getResponses(params, metadataIndex);
      const pattern = result!.responses[0].pattern;

      expect(pattern).toBeDefined();
      expect(pattern!.name).toBe('server_error');
      expect(pattern!.statusCodes).toContain(500);
    });

    test('should identify no_content pattern', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'DELETE',
        statusCode: '204'
      };

      const result = getResponses(params, metadataIndex);
      const pattern = result!.responses[0].pattern;

      expect(pattern).toBeDefined();
      expect(pattern!.name).toBe('no_content');
      expect(pattern!.statusCodes).toContain(204);
    });

    test('should include common patterns in result', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getResponses(params, metadataIndex);

      expect(result!.commonPatterns.length).toBeGreaterThan(0);
      expect(result!.commonPatterns.some(p => p.name === 'pagination')).toBe(true);
      expect(result!.commonPatterns.some(p => p.name === 'authentication_error')).toBe(true);
      expect(result!.commonPatterns.some(p => p.name === 'rate_limit_error')).toBe(true);
    });
  });

  describe('getResponses - Response statistics', () => {
    test('should calculate total count correctly', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getResponses(params, metadataIndex);

      expect(result!.totalCount).toBe(3);
    });

    test('should calculate success count correctly', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getResponses(params, metadataIndex);

      expect(result!.successCount).toBe(1);
    });

    test('should calculate error count correctly', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getResponses(params, metadataIndex);

      expect(result!.errorCount).toBe(2);
    });

    test('should calculate statistics for endpoint with only success responses', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET'
      };

      const result = getResponses(params, metadataIndex);

      expect(result!.totalCount).toBe(2);
      expect(result!.successCount).toBe(1);
      expect(result!.errorCount).toBe(1);
    });

    test('should calculate statistics for endpoint with only error responses', () => {
      const endpoint: ApiEndpoint = {
        resource: 'Test',
        operation: 'Test',
        description: 'Test',
        method: 'GET',
        path: '/test',
        permission: 'test.view',
        parameters: [],
        responses: [
          {
            statusCode: 404,
            description: 'Not found'
          },
          {
            statusCode: 500,
            description: 'Server error'
          }
        ]
      };

      const testIndex: MetadataIndex = {
        resources: new Map(),
        endpointsByPath: new Map([['GET:/test', endpoint]]),
        endpointsByPermission: new Map(),
        endpointsByMethod: new Map(),
        allEndpoints: [endpoint]
      };

      const params: ResponseLookupParams = {
        endpointPath: '/test',
        method: 'GET'
      };

      const result = getResponses(params, testIndex);

      expect(result!.totalCount).toBe(2);
      expect(result!.successCount).toBe(0);
      expect(result!.errorCount).toBe(2);
    });
  });

  describe('getResponses - Error handling', () => {
    test('should throw error when endpointPath is missing', () => {
      const params: ResponseLookupParams = {
        endpointPath: '',
        method: 'GET'
      };

      expect(() => {
        getResponses(params, metadataIndex);
      }).toThrow('endpointPath and method are required parameters');
    });

    test('should throw error when method is missing', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: ''
      };

      expect(() => {
        getResponses(params, metadataIndex);
      }).toThrow('endpointPath and method are required parameters');
    });

    test('should throw error for invalid status code format', () => {
      const params: ResponseLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        statusCode: 'abc'
      };

      expect(() => {
        getResponses(params, metadataIndex);
      }).toThrow('statusCode must be a valid number');
    });
  });

  describe('getCommonPatterns', () => {
    test('should return all common patterns', () => {
      const patterns = getCommonPatterns();

      expect(patterns).toBeDefined();
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some(p => p.name === 'pagination')).toBe(true);
      expect(patterns.some(p => p.name === 'single_resource')).toBe(true);
      expect(patterns.some(p => p.name === 'created_resource')).toBe(true);
      expect(patterns.some(p => p.name === 'validation_error')).toBe(true);
      expect(patterns.some(p => p.name === 'authentication_error')).toBe(true);
      expect(patterns.some(p => p.name === 'not_found_error')).toBe(true);
      expect(patterns.some(p => p.name === 'rate_limit_error')).toBe(true);
      expect(patterns.some(p => p.name === 'server_error')).toBe(true);
      expect(patterns.some(p => p.name === 'no_content')).toBe(true);
    });

    test('should include pattern metadata', () => {
      const patterns = getCommonPatterns();
      const paginationPattern = patterns.find(p => p.name === 'pagination');

      expect(paginationPattern).toBeDefined();
      expect(paginationPattern!.description).toBeDefined();
      expect(paginationPattern!.statusCodes).toBeDefined();
      expect(paginationPattern!.structure).toBeDefined();
      expect(paginationPattern!.exampleUseCase).toBeDefined();
    });
  });

  describe('getStatusInfo', () => {
    test('should return status info for 200', () => {
      const statusInfo = getStatusInfo(200);

      expect(statusInfo.code).toBe(200);
      expect(statusInfo.category).toBe('2xx');
      expect(statusInfo.name).toBe('OK');
      expect(statusInfo.isSuccess).toBe(true);
      expect(statusInfo.isError).toBe(false);
    });

    test('should return status info for 404', () => {
      const statusInfo = getStatusInfo(404);

      expect(statusInfo.code).toBe(404);
      expect(statusInfo.category).toBe('4xx');
      expect(statusInfo.name).toBe('Not Found');
      expect(statusInfo.isSuccess).toBe(false);
      expect(statusInfo.isError).toBe(true);
    });

    test('should return status info for 500', () => {
      const statusInfo = getStatusInfo(500);

      expect(statusInfo.code).toBe(500);
      expect(statusInfo.category).toBe('5xx');
      expect(statusInfo.name).toBe('Internal Server Error');
      expect(statusInfo.isSuccess).toBe(false);
      expect(statusInfo.isError).toBe(true);
    });

    test('should handle unknown status codes', () => {
      const statusInfo = getStatusInfo(418);

      expect(statusInfo.code).toBe(418);
      expect(statusInfo.category).toBe('4xx');
      expect(statusInfo.name).toBe('Unknown');
      expect(statusInfo.isSuccess).toBe(false);
      expect(statusInfo.isError).toBe(true);
    });
  });

  describe('getResponsesByPattern', () => {
    test('should find responses matching pagination pattern', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers' && e.method === 'GET')!;
      const result = getResponsesByPattern(endpoint, 'pagination');

      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.statusCode === 200)).toBe(true);
      expect(result.every(r => r.pattern?.name === 'pagination')).toBe(true);
    });

    test('should find responses matching validation_error pattern', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers' && e.method === 'POST')!;
      const result = getResponsesByPattern(endpoint, 'validation_error');

      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.statusCode === 422)).toBe(true);
      expect(result.every(r => r.pattern?.name === 'validation_error')).toBe(true);
    });

    test('should find responses matching authentication_error pattern', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers' && e.method === 'GET')!;
      const result = getResponsesByPattern(endpoint, 'authentication_error');

      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.statusCode === 401)).toBe(true);
      expect(result.every(r => r.pattern?.name === 'authentication_error')).toBe(true);
    });

    test('should find responses matching not_found_error pattern', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers/{id}' && e.method === 'GET')!;
      const result = getResponsesByPattern(endpoint, 'not_found_error');

      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.statusCode === 404)).toBe(true);
      expect(result.every(r => r.pattern?.name === 'not_found_error')).toBe(true);
    });

    test('should find responses matching no_content pattern', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers/{id}' && e.method === 'DELETE')!;
      const result = getResponsesByPattern(endpoint, 'no_content');

      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.statusCode === 204)).toBe(true);
      expect(result.every(r => r.pattern?.name === 'no_content')).toBe(true);
    });

    test('should return empty array for non-existent pattern', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers' && e.method === 'GET')!;
      const result = getResponsesByPattern(endpoint, 'nonexistent');

      expect(result).toEqual([]);
    });

    test('should return empty array when no responses match pattern', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers/{id}' && e.method === 'GET')!;
      const result = getResponsesByPattern(endpoint, 'pagination');

      expect(result).toEqual([]);
    });
  });
});
