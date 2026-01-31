/**
 * Unit tests for parameter reference tool
 */

import {
  getParameters,
  getCommonPatterns,
  getParametersByPattern,
  ParameterLookupParams
} from '../../src/tools/parameters';
import { MetadataIndex, buildMetadataIndex } from '../../src/parser/metadata';
import { ApiDocument, ApiEndpoint } from '../../src/utils/types';

describe('Parameter Reference Tool', () => {
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
                description: 'Page number for pagination (min: 1)',
                paramType: 'query'
              },
              {
                name: 'limit',
                type: 'integer',
                required: false,
                description: 'Number of results per page (max: 100)',
                paramType: 'query'
              },
              {
                name: 'sort',
                type: 'string',
                required: false,
                description: 'Sort field (enum: [name, email, created_at])',
                paramType: 'query'
              },
              {
                name: 'status',
                type: 'string',
                required: false,
                description: 'Filter by customer status',
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
                description: 'Customer name (minLength: 2, maxLength: 100)',
                paramType: 'body'
              },
              {
                name: 'email',
                type: 'string',
                required: false,
                description: 'Customer email (pattern: email)',
                paramType: 'body'
              },
              {
                name: 'phone',
                type: 'string',
                required: false,
                description: 'Customer phone number',
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
                description: 'Filter by ticket status',
                paramType: 'query'
              },
              {
                name: 'per_page',
                type: 'integer',
                required: false,
                description: 'Results per page',
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

  describe('getParameters - Parameter lookup by endpoint', () => {
    test('should find all parameters for an endpoint', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.endpointPath).toBe('/customers');
      expect(result!.method).toBe('GET');
      expect(result!.totalCount).toBe(4);
      expect(result!.parameters.length).toBe(4);
    });

    test('should find parameters for endpoint with path parameters', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(1);
      expect(result!.parameters[0].name).toBe('id');
      expect(result!.parameters[0].paramType).toBe('path');
    });

    test('should find parameters for endpoint with request body', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'POST'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(3);
      expect(result!.parameters.some(p => p.paramType === 'body')).toBe(true);
    });

    test('should return null for non-existent endpoint', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/nonexistent',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).toBeNull();
    });

    test('should return null for wrong method', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'POST'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).toBeNull();
    });

    test('should handle lowercase method', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'get'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.method).toBe('GET');
    });
  });

  describe('getParameters - Parameter filtering by type', () => {
    test('should filter by query parameters', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET',
        paramType: 'query'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(4);
      expect(result!.parameters.every(p => p.paramType === 'query')).toBe(true);
    });

    test('should filter by path parameters', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        paramType: 'path'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(1);
      expect(result!.parameters[0].paramType).toBe('path');
    });

    test('should filter by body parameters', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'POST',
        paramType: 'body'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(3);
      expect(result!.parameters.every(p => p.paramType === 'body')).toBe(true);
    });

    test('should return empty result when no parameters match type', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        paramType: 'body'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(0);
      expect(result!.parameters).toEqual([]);
    });
  });

  describe('getParameters - Parameter type and constraint information', () => {
    test('should include parameter type information', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.parameters[0].type).toBe('integer');
      expect(result!.parameters[2].type).toBe('string');
    });

    test('should extract min constraint from description', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);
      const pageParam = result!.parameters.find(p => p.name === 'page');

      expect(pageParam).toBeDefined();
      expect(pageParam!.constraints.min).toBe(1);
    });

    test('should extract max constraint from description', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);
      const limitParam = result!.parameters.find(p => p.name === 'limit');

      expect(limitParam).toBeDefined();
      expect(limitParam!.constraints.max).toBe(100);
    });

    test('should extract enum values from description', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);
      const sortParam = result!.parameters.find(p => p.name === 'sort');

      expect(sortParam).toBeDefined();
      expect(sortParam!.constraints.enum).toEqual(['name', 'email', 'created_at']);
    });

    test('should extract minLength and maxLength constraints', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'POST'
      };

      const result = getParameters(params, metadataIndex);
      const nameParam = result!.parameters.find(p => p.name === 'name');

      expect(nameParam).toBeDefined();
      expect(nameParam!.constraints.minLength).toBe(2);
      expect(nameParam!.constraints.maxLength).toBe(100);
    });

    test('should extract pattern constraint', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'POST'
      };

      const result = getParameters(params, metadataIndex);
      const emailParam = result!.parameters.find(p => p.name === 'email');

      expect(emailParam).toBeDefined();
      expect(emailParam!.constraints.pattern).toBe('email');
    });
  });

  describe('getParameters - Required/optional status', () => {
    test('should correctly identify required parameters', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.requiredCount).toBe(1);
      expect(result!.parameters[0].required).toBe(true);
    });

    test('should correctly identify optional parameters', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.optionalCount).toBe(4);
      expect(result!.parameters.every(p => !p.required)).toBe(true);
    });

    test('should count required and optional parameters correctly', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'POST'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(3);
      expect(result!.requiredCount).toBe(1);
      expect(result!.optionalCount).toBe(2);
    });

    test('should handle endpoints with no parameters', () => {
      const endpoint: ApiEndpoint = {
        resource: 'Test',
        operation: 'Test',
        description: 'Test',
        method: 'GET',
        path: '/test',
        permission: 'test.view',
        parameters: [],
        responses: []
      };

      const testIndex: MetadataIndex = {
        resources: new Map(),
        endpointsByPath: new Map([['GET:/test', endpoint]]),
        endpointsByPermission: new Map(),
        endpointsByMethod: new Map(),
        allEndpoints: [endpoint]
      };

      const params: ParameterLookupParams = {
        endpointPath: '/test',
        method: 'GET'
      };

      const result = getParameters(params, testIndex);

      expect(result).not.toBeNull();
      expect(result!.totalCount).toBe(0);
      expect(result!.requiredCount).toBe(0);
      expect(result!.optionalCount).toBe(0);
    });
  });

  describe('getParameters - Parameter description and examples', () => {
    test('should include parameter description', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);

      expect(result).not.toBeNull();
      expect(result!.parameters[0].description).toBe('Page number for pagination (min: 1)');
      expect(result!.parameters[1].description).toBe('Number of results per page (max: 100)');
    });

    test('should include all parameter metadata', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);
      const param = result!.parameters[0];

      expect(param).toMatchObject({
        name: 'page',
        type: 'integer',
        required: false,
        description: 'Page number for pagination (min: 1)',
        paramType: 'query'
      });
    });
  });

  describe('getParameters - Parameter validation hints', () => {
    test('should generate validation hints for required parameters', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'POST'
      };

      const result = getParameters(params, metadataIndex);
      const nameParam = result!.parameters.find(p => p.name === 'name');

      expect(nameParam).toBeDefined();
      // The name parameter has minLength/maxLength constraints, so it's classified as 'range'
      expect(nameParam!.validationHints.validationType).toBe('range');
      expect(nameParam!.validationHints.message).toContain('between 2 and 100 characters');
      expect(nameParam!.validationHints.example).toBeDefined();
      expect(nameParam!.validationHints.invalidExample).toBeDefined();
    });

    test('should generate validation hints for enum parameters', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);
      const sortParam = result!.parameters.find(p => p.name === 'sort');

      expect(sortParam).toBeDefined();
      expect(sortParam!.validationHints.validationType).toBe('enum');
      expect(sortParam!.validationHints.message).toContain('name, email, created_at');
      expect(sortParam!.validationHints.example).toBe('name');
      expect(sortParam!.validationHints.invalidExample).toBe('invalid_value');
    });

    test('should generate validation hints for range parameters', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);
      const pageParam = result!.parameters.find(p => p.name === 'page');

      expect(pageParam).toBeDefined();
      expect(pageParam!.validationHints.validationType).toBe('range');
      expect(pageParam!.validationHints.message).toContain('at least 1');
    });

    test('should generate validation hints for string length constraints', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'POST'
      };

      const result = getParameters(params, metadataIndex);
      const nameParam = result!.parameters.find(p => p.name === 'name');

      expect(nameParam).toBeDefined();
      expect(nameParam!.validationHints.validationType).toBe('range');
      expect(nameParam!.validationHints.message).toContain('between 2 and 100 characters');
    });

    test('should generate validation hints for pattern constraints', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'POST'
      };

      const result = getParameters(params, metadataIndex);
      const emailParam = result!.parameters.find(p => p.name === 'email');

      expect(emailParam).toBeDefined();
      expect(emailParam!.validationHints.validationType).toBe('pattern');
      expect(emailParam!.validationHints.message).toContain('email');
    });

    test('should generate validation hints for type validation', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);
      const statusParam = result!.parameters.find(p => p.name === 'status');

      expect(statusParam).toBeDefined();
      expect(statusParam!.validationHints.validationType).toBe('type');
      expect(statusParam!.validationHints.message).toContain('string');
    });
  });

  describe('getParameters - Common parameter patterns', () => {
    test('should identify pagination pattern', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);
      const pageParam = result!.parameters.find(p => p.name === 'page');
      const limitParam = result!.parameters.find(p => p.name === 'limit');

      expect(pageParam).toBeDefined();
      expect(pageParam!.pattern).toBeDefined();
      expect(pageParam!.pattern!.name).toBe('pagination');

      expect(limitParam).toBeDefined();
      expect(limitParam!.pattern).toBeDefined();
      expect(limitParam!.pattern!.name).toBe('pagination');
    });

    test('should identify sorting pattern', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);
      const sortParam = result!.parameters.find(p => p.name === 'sort');

      expect(sortParam).toBeDefined();
      expect(sortParam!.pattern).toBeDefined();
      expect(sortParam!.pattern!.name).toBe('sorting');
    });

    test('should identify filtering pattern', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);
      const statusParam = result!.parameters.find(p => p.name === 'status');

      expect(statusParam).toBeDefined();
      expect(statusParam!.pattern).toBeDefined();
      expect(statusParam!.pattern!.name).toBe('filtering');
    });

    test('should identify id pattern', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET'
      };

      const result = getParameters(params, metadataIndex);
      const idParam = result!.parameters[0];

      expect(idParam.name).toBe('id');
      expect(idParam.pattern).toBeDefined();
      expect(idParam.pattern!.name).toBe('id');
    });

    test('should not identify pattern for non-standard parameters', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: 'POST'
      };

      const result = getParameters(params, metadataIndex);
      const phoneParam = result!.parameters.find(p => p.name === 'phone');

      expect(phoneParam).toBeDefined();
      expect(phoneParam!.pattern).toBeUndefined();
    });
  });

  describe('getParameters - Error handling', () => {
    test('should throw error when endpointPath is missing', () => {
      const params: ParameterLookupParams = {
        endpointPath: '',
        method: 'GET'
      };

      expect(() => {
        getParameters(params, metadataIndex);
      }).toThrow('endpointPath and method are required parameters');
    });

    test('should throw error when method is missing', () => {
      const params: ParameterLookupParams = {
        endpointPath: '/customers',
        method: ''
      };

      expect(() => {
        getParameters(params, metadataIndex);
      }).toThrow('endpointPath and method are required parameters');
    });
  });

  describe('getCommonPatterns', () => {
    test('should return all common patterns', () => {
      const patterns = getCommonPatterns();

      expect(patterns).toBeDefined();
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some(p => p.name === 'pagination')).toBe(true);
      expect(patterns.some(p => p.name === 'sorting')).toBe(true);
      expect(patterns.some(p => p.name === 'filtering')).toBe(true);
      expect(patterns.some(p => p.name === 'id')).toBe(true);
    });

    test('should include pattern metadata', () => {
      const patterns = getCommonPatterns();
      const paginationPattern = patterns.find(p => p.name === 'pagination');

      expect(paginationPattern).toBeDefined();
      expect(paginationPattern!.description).toBeDefined();
      expect(paginationPattern!.commonNames).toBeDefined();
      expect(paginationPattern!.type).toBeDefined();
      expect(paginationPattern!.paramType).toBeDefined();
    });
  });

  describe('getParametersByPattern', () => {
    test('should find parameters matching pagination pattern', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers' && e.method === 'GET')!;
      const result = getParametersByPattern(endpoint, 'pagination');

      expect(result.length).toBeGreaterThan(0);
      expect(result.some(p => p.name === 'page')).toBe(true);
      expect(result.some(p => p.name === 'limit')).toBe(true);
    });

    test('should find parameters matching sorting pattern', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers' && e.method === 'GET')!;
      const result = getParametersByPattern(endpoint, 'sorting');

      expect(result.length).toBeGreaterThan(0);
      expect(result.some(p => p.name === 'sort')).toBe(true);
    });

    test('should find parameters matching filtering pattern', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers' && e.method === 'GET')!;
      const result = getParametersByPattern(endpoint, 'filtering');

      expect(result.length).toBeGreaterThan(0);
      expect(result.some(p => p.name === 'status')).toBe(true);
    });

    test('should return empty array for non-existent pattern', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers' && e.method === 'GET')!;
      const result = getParametersByPattern(endpoint, 'nonexistent');

      expect(result).toEqual([]);
    });

    test('should return empty array when no parameters match pattern', () => {
      const endpoint = sampleEndpoints.find(e => e.path === '/customers/{id}' && e.method === 'GET')!;
      const result = getParametersByPattern(endpoint, 'pagination');

      expect(result).toEqual([]);
    });
  });
});
