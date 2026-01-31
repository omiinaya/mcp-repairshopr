/**
 * Unit tests for endpoint lookup tool
 */

import {
  getEndpoint,
  getEndpointsBatch,
  findRelatedEndpoints,
  getEndpointDetails,
  EndpointLookupParams,
  BatchEndpointLookupParams
} from '../../src/tools/endpoint';
import { MetadataIndex, buildMetadataIndex } from '../../src/parser/metadata';
import { ApiDocument, ApiEndpoint } from '../../src/utils/types';

describe('Endpoint Lookup Tool', () => {
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
              },
              {
                name: 'limit',
                type: 'integer',
                required: false,
                description: 'Number of results per page',
                paramType: 'query'
              }
            ],
            responses: [
              {
                statusCode: 200,
                description: 'Successful response',
                example: { customers: [] }
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
                description: 'Successful response',
                example: { customer: {} }
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
              },
              {
                name: 'email',
                type: 'string',
                required: false,
                description: 'Customer email',
                paramType: 'body'
              }
            ],
            responses: [
              {
                statusCode: 201,
                description: 'Customer created successfully',
                example: { customer: {} }
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
            parameters: [
              {
                name: 'customer_id',
                type: 'integer',
                required: false,
                description: 'Filter by customer ID',
                paramType: 'query'
              },
              {
                name: 'status',
                type: 'string',
                required: false,
                description: 'Filter by status',
                paramType: 'query'
              }
            ],
            responses: [
              {
                statusCode: 200,
                description: 'Successful response',
                example: { tickets: [] }
              }
            ]
          },
          {
            resource: 'Ticket',
            operation: 'Get Ticket by ID',
            description: 'Retrieve a specific ticket by ID',
            method: 'GET',
            path: '/tickets/{id}',
            permission: 'ticket.view',
            parameters: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'Ticket ID',
                paramType: 'path'
              }
            ],
            responses: [
              {
                statusCode: 200,
                description: 'Successful response',
                example: { ticket: {} }
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

  describe('getEndpoint - Lookup by path and method', () => {
    test('should find endpoint by exact path and method', () => {
      const params: EndpointLookupParams = {
        path: '/customers/{id}',
        method: 'GET'
      };

      const result = getEndpoint(params, metadataIndex);

      expect(result).not.toBeNull();
      if (result && !Array.isArray(result)) {
        expect(result.endpoint.path).toBe('/customers/{id}');
        expect(result.endpoint.method).toBe('GET');
        expect(result.endpoint.resource).toBe('Customer');
        expect(result.exactMatch).toBe(true);
      }
    });

    test('should find endpoint with lowercase method', () => {
      const params: EndpointLookupParams = {
        path: '/customers/{id}',
        method: 'get'
      };

      const result = getEndpoint(params, metadataIndex);

      expect(result).not.toBeNull();
      if (result && !Array.isArray(result)) {
        expect(result.endpoint.method).toBe('GET');
      }
    });

    test('should return null for non-existent endpoint', () => {
      const params: EndpointLookupParams = {
        path: '/nonexistent',
        method: 'GET'
      };

      const result = getEndpoint(params, metadataIndex);

      expect(result).toBeNull();
    });

    test('should return null for wrong method', () => {
      const params: EndpointLookupParams = {
        path: '/customers/{id}',
        method: 'POST'
      };

      const result = getEndpoint(params, metadataIndex);

      expect(result).toBeNull();
    });
  });

  describe('getEndpoint - Lookup by resource name', () => {
    test('should find all endpoints for a resource', () => {
      const params: EndpointLookupParams = {
        resource: 'Customer'
      };

      const result = getEndpoint(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(3);
        expect(result.every(r => r.endpoint.resource === 'Customer')).toBe(true);
        expect(result.every(r => r.exactMatch)).toBe(true);
      }
    });

    test('should find all endpoints for Ticket resource', () => {
      const params: EndpointLookupParams = {
        resource: 'Ticket'
      };

      const result = getEndpoint(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(2);
        expect(result.every(r => r.endpoint.resource === 'Ticket')).toBe(true);
      }
    });

    test('should return empty array for non-existent resource', () => {
      const params: EndpointLookupParams = {
        resource: 'NonExistent'
      };

      const result = getEndpoint(params, metadataIndex);

      expect(result).toBeNull();
    });
  });

  describe('getEndpoint - Error handling', () => {
    test('should throw error when neither path nor resource is provided', () => {
      const params: EndpointLookupParams = {};

      expect(() => {
        getEndpoint(params, metadataIndex);
      }).toThrow('Either path or resource parameter must be provided');
    });

    test('should handle path without method gracefully', () => {
      const params: EndpointLookupParams = {
        path: '/customers'
      };

      const result = getEndpoint(params, metadataIndex);

      // Should return all endpoints with that path
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBeGreaterThan(0);
        expect(result.every(r => r.endpoint.path === '/customers')).toBe(true);
        expect(result.every(r => r.exactMatch)).toBe(true);
      }
    });
  });

  describe('getEndpointsBatch - Batch endpoint lookup', () => {
    test('should lookup multiple endpoints successfully', () => {
      const params: BatchEndpointLookupParams = {
        paths: ['/customers/{id}', '/tickets/{id}'],
        methods: ['GET', 'GET']
      };

      const result = getEndpointsBatch(params, metadataIndex);

      expect(result.results.length).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.results[0].endpoint.path).toBe('/customers/{id}');
      expect(result.results[1].endpoint.path).toBe('/tickets/{id}');
    });

    test('should handle mixed success and failure', () => {
      const params: BatchEndpointLookupParams = {
        paths: ['/customers/{id}', '/nonexistent', '/tickets'],
        methods: ['GET', 'GET', 'GET']
      };

      const result = getEndpointsBatch(params, metadataIndex);

      expect(result.results.length).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(1);
    });

    test('should handle empty arrays', () => {
      const params: BatchEndpointLookupParams = {
        paths: [],
        methods: []
      };

      const result = getEndpointsBatch(params, metadataIndex);

      expect(result.results).toEqual([]);
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
    });

    test('should throw error when paths and methods lengths differ', () => {
      const params: BatchEndpointLookupParams = {
        paths: ['/customers/{id}', '/tickets/{id}'],
        methods: ['GET']
      };

      expect(() => {
        getEndpointsBatch(params, metadataIndex);
      }).toThrow('Paths and methods arrays must have the same length');
    });
  });

  describe('findRelatedEndpoints - Related endpoint discovery', () => {
    test('should find endpoints with same resource', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers/{id}')!;
      const result = findRelatedEndpoints(endpoint, metadataIndex);

      expect(result.originalEndpoint).toBe(endpoint);
      expect(result.sameResource.length).toBe(2); // Other Customer endpoints
      expect(result.sameResource.every(e => e.resource === 'Customer')).toBe(true);
      expect(result.sameResource.every(e => e.path !== '/customers/{id}')).toBe(true);
    });

    test('should find endpoints with related parameters', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers/{id}')!;
      const result = findRelatedEndpoints(endpoint, metadataIndex);

      // Should find endpoints that share the 'id' parameter
      expect(result.relatedByParameters.length).toBeGreaterThan(0);
      expect(result.relatedByParameters.every(e => e.path !== '/customers/{id}')).toBe(true);
    });

    test('should find endpoints with same permission', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers/{id}')!;
      const result = findRelatedEndpoints(endpoint, metadataIndex);

      expect(result.samePermission.length).toBeGreaterThan(0);
      expect(result.samePermission.every(e => e.permission === 'customer.view')).toBe(true);
      expect(result.samePermission.every(e => e.path !== '/customers/{id}')).toBe(true);
    });

    test('should handle endpoint with no permission', () => {
      const endpoint: ApiEndpoint = {
        resource: 'Test',
        operation: 'Test',
        description: 'Test',
        method: 'GET',
        path: '/test',
        permission: '',
        parameters: [],
        responses: []
      };

      const result = findRelatedEndpoints(endpoint, metadataIndex);

      expect(result.samePermission).toEqual([]);
    });
  });

  describe('getEndpointDetails - Parameter details inclusion', () => {
    test('should include all parameter details', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers')!;
      const details = getEndpointDetails(endpoint);

      expect(details.parameters).toBeDefined();
      expect(details.parameters.length).toBe(2);
      expect(details.parameters[0]).toMatchObject({
        name: 'page',
        type: 'integer',
        required: false,
        description: 'Page number for pagination',
        paramType: 'query'
      });
      expect(details.parameters[1]).toMatchObject({
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Number of results per page',
        paramType: 'query'
      });
    });

    test('should include path parameters', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers/{id}')!;
      const details = getEndpointDetails(endpoint);

      expect(details.parameters).toBeDefined();
      expect(details.parameters.length).toBe(1);
      expect(details.parameters[0]).toMatchObject({
        name: 'id',
        type: 'integer',
        required: true,
        description: 'Customer ID',
        paramType: 'path'
      });
    });

    test('should handle endpoints with no parameters', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers' && e.method === 'POST')!;
      const details = getEndpointDetails(endpoint);

      expect(details.parameters).toEqual([]);
    });
  });

  describe('getEndpointDetails - Response details inclusion', () => {
    test('should include all response details', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers/{id}')!;
      const details = getEndpointDetails(endpoint);

      expect(details.responses).toBeDefined();
      expect(details.responses.length).toBe(1);
      expect(details.responses[0]).toMatchObject({
        statusCode: 200,
        description: 'Successful response'
      });
      expect(details.responses[0].example).toBeDefined();
    });

    test('should include multiple responses', () => {
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
            description: 'Success',
            example: { success: true }
          },
          {
            statusCode: 404,
            description: 'Not found',
            example: { error: 'Not found' }
          }
        ]
      };

      const details = getEndpointDetails(endpoint);

      expect(details.responses.length).toBe(2);
      expect(details.responses[0].statusCode).toBe(200);
      expect(details.responses[1].statusCode).toBe(404);
    });

    test('should handle responses without examples', () => {
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

      const details = getEndpointDetails(endpoint);

      expect(details.responses[0].example).toBeUndefined();
    });
  });

  describe('getEndpointDetails - Permission information inclusion', () => {
    test('should include permission information', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers/{id}')!;
      const details = getEndpointDetails(endpoint);

      expect(details.permission).toBe('customer.view');
    });

    test('should handle endpoints with different permissions', () => {
      const getEndpoint = sampleEndpoints.find(e => e.path === '/customers' && e.method === 'GET')!;
      const postEndpoint = sampleEndpoints.find(e => e.path === '/customers' && e.method === 'POST')!;

      const getDetails = getEndpointDetails(getEndpoint);
      const postDetails = getEndpointDetails(postEndpoint);

      expect(getDetails.permission).toBe('customer.view');
      expect(postDetails.permission).toBe('customer.create');
    });

    test('should handle empty permission', () => {
      const endpoint: ApiEndpoint = {
        resource: 'Test',
        operation: 'Test',
        description: 'Test',
        method: 'GET',
        path: '/test',
        permission: '',
        parameters: [],
        responses: []
      };

      const details = getEndpointDetails(endpoint);

      expect(details.permission).toBe('');
    });
  });

  describe('getEndpointDetails - Request body inclusion', () => {
    test('should include request body details', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers' && e.method === 'POST')!;
      const details = getEndpointDetails(endpoint);

      expect(details.requestBody).toBeDefined();
      expect(details.requestBody!.length).toBe(2);
      expect(details.requestBody![0]).toMatchObject({
        name: 'name',
        type: 'string',
        required: true,
        description: 'Customer name',
        paramType: 'body'
      });
      expect(details.requestBody![1]).toMatchObject({
        name: 'email',
        type: 'string',
        required: false,
        description: 'Customer email',
        paramType: 'body'
      });
    });

    test('should handle endpoints without request body', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers/{id}')!;
      const details = getEndpointDetails(endpoint);

      expect(details.requestBody).toBeUndefined();
    });
  });

  describe('getEndpointDetails - Complete endpoint information', () => {
    test('should include all endpoint metadata', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers/{id}')!;
      const details = getEndpointDetails(endpoint);

      expect(details.resource).toBe('Customer');
      expect(details.operation).toBe('Get Customer by ID');
      expect(details.description).toBe('Retrieve a specific customer by ID');
      expect(details.method).toBe('GET');
      expect(details.path).toBe('/customers/{id}');
      expect(details.permission).toBe('customer.view');
      expect(details.parameters).toBeDefined();
      expect(details.responses).toBeDefined();
    });
  });
});
