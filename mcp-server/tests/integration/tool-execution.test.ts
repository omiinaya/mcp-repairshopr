/**
 * Integration tests for tool execution
 * Tests all 7 tools with real data, end-to-end flows, parameter validation, error handling, and response formatting
 */

import { createMockMetadataIndex } from '../utils/test-helpers';
import { generateEndpoint, generateParameter, generateResponse } from '../utils/data-generators';
import { searchApiDocs } from '../../src/tools/search';
import { getEndpoint, getEndpointsBatch, findRelatedEndpoints, getEndpointDetails } from '../../src/tools/endpoint';
import { getParameters } from '../../src/tools/parameters';
import { getResponses } from '../../src/tools/responses';
import { getPermissions } from '../../src/tools/permissions';
import { listResources } from '../../src/tools/resources';
import { generateCodeExample } from '../../src/tools/code-examples';
import { VectorStore } from '../../src/indexer/vector';

describe('Tool Execution Integration Tests', () => {
  let metadataIndex: any;
  let vectorStore: VectorStore;

  beforeAll(() => {
    // Create comprehensive test data
    const endpoints = [
      // Customer endpoints
      generateEndpoint({
        resource: 'Customer',
        operation: 'Get Customer by ID',
        description: 'Retrieve a specific customer by ID with all related data',
        method: 'GET',
        path: '/customers/{id}',
        permission: 'customer.view',
        parameters: [
          generateParameter({ name: 'id', type: 'integer', required: true, description: 'Customer ID', paramType: 'path' }),
          generateParameter({ name: 'include', type: 'string', required: false, description: 'Include related resources', paramType: 'query' })
        ],
        responses: [
          generateResponse({ statusCode: 200, description: 'Successful response', example: { customer: { id: 1, name: 'John Doe' } } }),
          generateResponse({ statusCode: 404, description: 'Customer not found', example: { error: 'Not Found' } })
        ]
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Create Customer',
        description: 'Create a new customer',
        method: 'POST',
        path: '/customers',
        permission: 'customer.create',
        parameters: [],
        requestBody: [
          generateParameter({ name: 'name', type: 'string', required: true, description: 'Customer name', paramType: 'body' }),
          generateParameter({ name: 'email', type: 'string', required: true, description: 'Customer email', paramType: 'body' })
        ],
        responses: [
          generateResponse({ statusCode: 201, description: 'Customer created', example: { customer: { id: 1, name: 'John Doe' } } })
        ]
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Update Customer',
        description: 'Update an existing customer',
        method: 'PUT',
        path: '/customers/{id}',
        permission: 'customer.update',
        parameters: [
          generateParameter({ name: 'id', type: 'integer', required: true, description: 'Customer ID', paramType: 'path' })
        ],
        requestBody: [
          generateParameter({ name: 'name', type: 'string', required: false, description: 'Customer name', paramType: 'body' })
        ],
        responses: [
          generateResponse({ statusCode: 200, description: 'Customer updated', example: { customer: { id: 1, name: 'Updated Name' } } })
        ]
      }),
      // Invoice endpoints
      generateEndpoint({
        resource: 'Invoice',
        operation: 'Get Invoice by ID',
        description: 'Retrieve a specific invoice by ID',
        method: 'GET',
        path: '/invoices/{id}',
        permission: 'invoice.view',
        parameters: [
          generateParameter({ name: 'id', type: 'integer', required: true, description: 'Invoice ID', paramType: 'path' })
        ],
        responses: [
          generateResponse({ statusCode: 200, description: 'Successful response', example: { invoice: { id: 1, total: 100.00 } } })
        ]
      }),
      generateEndpoint({
        resource: 'Invoice',
        operation: 'List Invoices',
        description: 'List all invoices with pagination',
        method: 'GET',
        path: '/invoices',
        permission: 'invoice.view',
        parameters: [
          generateParameter({ name: 'page', type: 'integer', required: false, description: 'Page number', paramType: 'query' }),
          generateParameter({ name: 'limit', type: 'integer', required: false, description: 'Results per page', paramType: 'query' })
        ],
        responses: [
          generateResponse({ statusCode: 200, description: 'Successful response', example: { invoices: [], total: 0 } } })
        ]
      }),
      // Ticket endpoints
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Create Ticket',
        description: 'Create a new support ticket',
        method: 'POST',
        path: '/tickets',
        permission: 'ticket.create',
        parameters: [],
        requestBody: [
          generateParameter({ name: 'subject', type: 'string', required: true, description: 'Ticket subject', paramType: 'body' }),
          generateParameter({ name: 'description', type: 'string', required: true, description: 'Ticket description', paramType: 'body' }),
          generateParameter({ name: 'customer_id', type: 'integer', required: true, description: 'Customer ID', paramType: 'body' })
        ],
        responses: [
          generateResponse({ statusCode: 201, description: 'Ticket created', example: { ticket: { id: 1, subject: 'Support Request' } } })
        ]
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Get Ticket by ID',
        description: 'Retrieve a specific ticket by ID',
        method: 'GET',
        path: '/tickets/{id}',
        permission: 'ticket.view',
        parameters: [
          generateParameter({ name: 'id', type: 'integer', required: true, description: 'Ticket ID', paramType: 'path' })
        ],
        responses: [
          generateResponse({ statusCode: 200, description: 'Successful response', example: { ticket: { id: 1, subject: 'Support Request' } } })
        ]
      }),
      // Product endpoints
      generateEndpoint({
        resource: 'Product',
        operation: 'List Products',
        description: 'List all products',
        method: 'GET',
        path: '/products',
        permission: 'product.view',
        parameters: [
          generateParameter({ name: 'category', type: 'string', required: false, description: 'Filter by category', paramType: 'query' })
        ],
        responses: [
          generateResponse({ statusCode: 200, description: 'Successful response', example: { products: [] } })
        ]
      })
    ];

    metadataIndex = createMockMetadataIndex(endpoints);
    vectorStore = new VectorStore();

    // Add embeddings for all endpoints
    for (const endpoint of endpoints) {
      const embedding = vectorStore.generateEmbedding(
        `${endpoint.resource} ${endpoint.operation} ${endpoint.description}`
      );
      vectorStore.addVector(
        `${endpoint.method}:${endpoint.path}`,
        embedding,
        { endpointId: `${endpoint.method}:${endpoint.path}`, resource: endpoint.resource }
      );
    }
  });

  describe('Tool 1: search_api_docs', () => {
    test('should search for customer endpoints', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.endpoint && r.score !== undefined && r.context)).toBe(true);
    });

    test('should search with resource filter', () => {
      const results = searchApiDocs(
        { query: 'get', resource: 'Customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.every(r => r.endpoint.resource === 'Customer')).toBe(true);
    });

    test('should search with method filter', () => {
      const results = searchApiDocs(
        { query: 'customer', method: 'GET', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.every(r => r.endpoint.method === 'GET')).toBe(true);
    });

    test('should search with permission filter', () => {
      const results = searchApiDocs(
        { query: 'customer', permission: 'customer.view', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.every(r => r.endpoint.permission === 'customer.view')).toBe(true);
    });

    test('should handle empty query', () => {
      expect(() => {
        searchApiDocs({ query: '' }, vectorStore, metadataIndex);
      }).toThrow('Query parameter is required and cannot be empty');
    });

    test('should return results with match types', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results.every(r => ['semantic', 'keyword', 'hybrid'].includes(r.matchType))).toBe(true);
    });
  });

  describe('Tool 2: get_endpoint', () => {
    test('should get endpoint by path and method', () => {
      const result = getEndpoint(
        { path: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeDefined();
      if (!Array.isArray(result)) {
        expect(result.endpoint).toBeDefined();
        expect(result.endpoint.resource).toBe('Customer');
        expect(result.endpoint.method).toBe('GET');
        expect(result.exactMatch).toBe(true);
      }
    });

    test('should get endpoints by resource name', () => {
      const result = getEndpoint(
        { resource: 'Customer' },
        metadataIndex
      );

      expect(result).toBeDefined();
      if (Array.isArray(result)) {
        expect(result.length).toBeGreaterThan(0);
        expect(result.every(r => r.endpoint.resource === 'Customer')).toBe(true);
      }
    });

    test('should get endpoint details', () => {
      const result = getEndpoint(
        { path: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      if (result && !Array.isArray(result)) {
        const details = getEndpointDetails(result.endpoint);
        expect(details).toBeDefined();
        expect(details.resource).toBe('Customer');
        expect(details.method).toBe('GET');
        expect(details.path).toBe('/customers/{id}');
        expect(Array.isArray(details.parameters)).toBe(true);
        expect(Array.isArray(details.responses)).toBe(true);
      }
    });

    test('should find related endpoints', () => {
      const result = getEndpoint(
        { path: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      if (result && !Array.isArray(result)) {
        const related = findRelatedEndpoints(result.endpoint, metadataIndex);
        expect(related).toBeDefined();
        expect(related.originalEndpoint).toBeDefined();
        expect(Array.isArray(related.sameResource)).toBe(true);
        expect(Array.isArray(related.relatedByParameters)).toBe(true);
        expect(Array.isArray(related.samePermission)).toBe(true);
      }
    });

    test('should handle batch endpoint lookup', () => {
      const result = getEndpointsBatch(
        {
          paths: ['/customers/{id}', '/invoices/{id}'],
          methods: ['GET', 'GET']
        },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.successCount + result.failureCount).toBe(result.results.length);
    });

    test('should return null for non-existent endpoint', () => {
      const result = getEndpoint(
        { path: '/nonexistent/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should throw error when neither path nor resource provided', () => {
      expect(() => {
        getEndpoint({}, metadataIndex);
      }).toThrow('Either path or resource parameter must be provided');
    });
  });

  describe('Tool 3: get_parameters', () => {
    test('should get parameters for endpoint', () => {
      const result = getParameters(
        { endpointPath: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.endpointPath).toBe('/customers/{id}');
      expect(result.method).toBe('GET');
      expect(Array.isArray(result.parameters)).toBe(true);
      expect(result.totalCount).toBe(result.parameters.length);
      expect(result.requiredCount).toBeGreaterThanOrEqual(0);
      expect(result.optionalCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter parameters by type', () => {
      const result = getParameters(
        { endpointPath: '/customers/{id}', method: 'GET', paramType: 'path' },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.parameters.every(p => p.paramType === 'path')).toBe(true);
    });

    test('should include parameter constraints', () => {
      const result = getParameters(
        { endpointPath: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeDefined();
      result.parameters.forEach(param => {
        expect(param.constraints).toBeDefined();
        expect(typeof param.constraints).toBe('object');
      });
    });

    test('should include validation hints', () => {
      const result = getParameters(
        { endpointPath: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeDefined();
      result.parameters.forEach(param => {
        expect(param.validationHints).toBeDefined();
        expect(param.validationHints.validationType).toBeDefined();
        expect(param.validationHints.message).toBeDefined();
      });
    });

    test('should return null for non-existent endpoint', () => {
      const result = getParameters(
        { endpointPath: '/nonexistent', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should throw error for missing required parameters', () => {
      expect(() => {
        getParameters({ endpointPath: '/customers/{id}' }, metadataIndex);
      }).toThrow('endpointPath and method are required parameters');
    });
  });

  describe('Tool 4: get_responses', () => {
    test('should get responses for endpoint', () => {
      const result = getResponses(
        { endpointPath: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.endpointPath).toBe('/customers/{id}');
      expect(result.method).toBe('GET');
      expect(Array.isArray(result.responses)).toBe(true);
      expect(result.totalCount).toBe(result.responses.length);
      expect(result.successCount).toBeGreaterThan(0);
      expect(result.errorCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter responses by status code', () => {
      const result = getResponses(
        { endpointPath: '/customers/{id}', method: 'GET', statusCode: '200' },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.responses.every(r => r.statusCode === 200)).toBe(true);
    });

    test('should include status code information', () => {
      const result = getResponses(
        { endpointPath: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeDefined();
      result.responses.forEach(response => {
        expect(response.statusCodeInfo).toBeDefined();
        expect(response.statusCodeInfo.code).toBeDefined();
        expect(response.statusCodeInfo.category).toBeDefined();
        expect(response.statusCodeInfo.name).toBeDefined();
        expect(response.statusCodeInfo.isSuccess).toBeDefined();
        expect(response.statusCodeInfo.isError).toBeDefined();
      });
    });

    test('should include error documentation for error responses', () => {
      const result = getResponses(
        { endpointPath: '/customers/{id}', method: 'GET', statusCode: '404' },
        metadataIndex
      );

      expect(result).toBeDefined();
      if (result.responses.length > 0) {
        const errorResponse = result.responses.find(r => r.statusCodeInfo.isError);
        if (errorResponse) {
          expect(errorResponse.errorDocumentation).toBeDefined();
        }
      }
    });

    test('should identify common patterns', () => {
      const result = getResponses(
        { endpointPath: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.commonPatterns)).toBe(true);
    });

    test('should return null for non-existent endpoint', () => {
      const result = getResponses(
        { endpointPath: '/nonexistent', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should throw error for invalid status code', () => {
      expect(() => {
        getResponses(
          { endpointPath: '/customers/{id}', method: 'GET', statusCode: 'invalid' },
          metadataIndex
        );
      }).toThrow('statusCode must be a valid number');
    });
  });

  describe('Tool 5: get_permissions', () => {
    test('should get permission by endpoint', () => {
      const result = getPermissions(
        { endpointPath: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.totalPermissions).toBeGreaterThan(0);
      if (result.permission) {
        expect(result.permission.name).toBeDefined();
        expect(result.permission.description).toBeDefined();
        expect(Array.isArray(result.permission.endpoints)).toBe(true);
      }
    });

    test('should get permissions by resource', () => {
      const result = getPermissions(
        { resource: 'Customer' },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.totalPermissions).toBeGreaterThan(0);
      if (result.allPermissions) {
        expect(Array.isArray(result.allPermissions)).toBe(true);
        expect(result.allPermissions.length).toBeGreaterThan(0);
      }
    });

    test('should get permission by name', () => {
      const result = getPermissions(
        { permission: 'customer.view' },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.totalPermissions).toBeGreaterThan(0);
      if (result.permission) {
        expect(result.permission.name).toBe('customer.view');
      }
    });

    test('should include permission summaries', () => {
      const result = getPermissions(
        { includeSummaries: true },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.totalPermissions).toBeGreaterThan(0);
      if (result.summaries) {
        expect(Array.isArray(result.summaries)).toBe(true);
        result.summaries.forEach(summary => {
          expect(summary.permission).toBeDefined();
          expect(summary.endpointCount).toBeDefined();
          expect(Array.isArray(summary.resources)).toBe(true);
        });
      }
    });

    test('should include permission matrix', () => {
      const result = getPermissions(
        { includeMatrix: true },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.totalPermissions).toBeGreaterThan(0);
      if (result.matrix) {
        expect(Array.isArray(result.matrix)).toBe(true);
        result.matrix.forEach(entry => {
          expect(entry.permission).toBeDefined();
          expect(entry.description).toBeDefined();
          expect(entry.category).toBeDefined();
          expect(entry.endpointCount).toBeDefined();
        });
      }
    });

    test('should include permission hierarchy', () => {
      const result = getPermissions(
        { permission: 'customer.view' },
        metadataIndex
      );

      expect(result).toBeDefined();
      if (result.permission && result.permission.hierarchy) {
        expect(result.permission.hierarchy.name).toBeDefined();
        expect(result.permission.hierarchy.level).toBeDefined();
        expect(Array.isArray(result.permission.hierarchy.children)).toBe(true);
      }
    });

    test('should throw error when method not provided with endpointPath', () => {
      expect(() => {
        getPermissions({ endpointPath: '/customers/{id}' }, metadataIndex);
      }).toThrow('method parameter is required when using endpointPath');
    });
  });

  describe('Tool 6: list_resources', () => {
    test('should list all resources', () => {
      const result = listResources({}, metadataIndex);

      expect(result).toBeDefined();
      expect(result.totalResources).toBeGreaterThan(0);
      expect(Array.isArray(result.resources)).toBe(true);
      expect(result.overallStatistics).toBeDefined();
    });

    test('should include endpoint details when requested', () => {
      const result = listResources({ includeEndpoints: true }, metadataIndex);

      expect(result).toBeDefined();
      result.resources.forEach(resource => {
        if (resource.endpoints) {
          expect(Array.isArray(resource.endpoints)).toBe(true);
          resource.endpoints.forEach(endpoint => {
            expect(endpoint.operation).toBeDefined();
            expect(endpoint.method).toBeDefined();
            expect(endpoint.path).toBeDefined();
          });
        }
      });
    });

    test('should include relationships when requested', () => {
      const result = listResources({ includeRelationships: true }, metadataIndex);

      expect(result).toBeDefined();
      result.resources.forEach(resource => {
        if (resource.relationships) {
          expect(Array.isArray(resource.relationships)).toBe(true);
          resource.relationships.forEach(rel => {
            expect(rel.resource).toBeDefined();
            expect(rel.relationshipType).toBeDefined();
            expect(rel.connectionCount).toBeDefined();
          });
        }
      });
    });

    test('should include resource statistics', () => {
      const result = listResources({}, metadataIndex);

      expect(result).toBeDefined();
      result.resources.forEach(resource => {
        expect(resource.statistics).toBeDefined();
        expect(resource.statistics.totalEndpoints).toBeDefined();
        expect(resource.statistics.totalParameters).toBeDefined();
        expect(resource.statistics.totalResponses).toBeDefined();
        expect(resource.statistics.uniquePermissions).toBeDefined();
      });
    });

    test('should include navigation helpers', () => {
      const result = listResources({}, metadataIndex);

      expect(result).toBeDefined();
      result.resources.forEach(resource => {
        expect(resource.navigation).toBeDefined();
        expect(Array.isArray(resource.navigation.relatedResources)).toBe(true);
        expect(Array.isArray(resource.navigation.commonOperations)).toBe(true);
        expect(Array.isArray(resource.navigation.similarPermissionResources)).toBe(true);
      });
    });

    test('should include overall statistics', () => {
      const result = listResources({}, metadataIndex);

      expect(result).toBeDefined();
      expect(result.overallStatistics).toBeDefined();
      expect(result.overallStatistics.totalEndpoints).toBeDefined();
      expect(result.overallStatistics.totalParameters).toBeDefined();
      expect(result.overallStatistics.totalResponses).toBeDefined();
      expect(result.overallStatistics.uniquePermissions).toBeDefined();
      expect(result.overallStatistics.mostCommonMethod).toBeDefined();
      expect(result.overallStatistics.averageEndpointsPerResource).toBeDefined();
    });

    test('should sort resources by name', () => {
      const result = listResources({}, metadataIndex);

      expect(result).toBeDefined();
      const resourceNames = result.resources.map(r => r.summary.name);
      const sortedNames = [...resourceNames].sort();
      expect(resourceNames).toEqual(sortedNames);
    });
  });

  describe('Tool 7: generate_code_example', () => {
    test('should generate JavaScript code example', () => {
      const result = generateCodeExample(
        {
          endpointPath: '/customers/{id}',
          method: 'GET',
          language: 'javascript',
          includeAuth: true
        },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.endpoint).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.language).toBe('javascript');
      expect(result.includesAuth).toBe(true);
      expect(result.errorHandling).toBeDefined();
      expect(result.code).toContain('fetch');
    });

    test('should generate Python code example', () => {
      const result = generateCodeExample(
        {
          endpointPath: '/customers/{id}',
          method: 'GET',
          language: 'python',
          includeAuth: true
        },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.endpoint).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.language).toBe('python');
      expect(result.includesAuth).toBe(true);
      expect(result.errorHandling).toBeDefined();
      expect(result.code).toContain('requests');
    });

    test('should generate cURL code example', () => {
      const result = generateCodeExample(
        {
          endpointPath: '/customers/{id}',
          method: 'GET',
          language: 'curl',
          includeAuth: true
        },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.endpoint).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.language).toBe('curl');
      expect(result.includesAuth).toBe(true);
      expect(result.errorHandling).toBeDefined();
      expect(result.code).toContain('curl');
    });

    test('should include example request when applicable', () => {
      const result = generateCodeExample(
        {
          endpointPath: '/customers',
          method: 'POST',
          language: 'javascript',
          includeAuth: true
        },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.exampleRequest).toBeDefined();
      expect(typeof result.exampleRequest).toBe('object');
    });

    test('should include example response', () => {
      const result = generateCodeExample(
        {
          endpointPath: '/customers/{id}',
          method: 'GET',
          language: 'javascript',
          includeAuth: true
        },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.exampleResponse).toBeDefined();
      expect(typeof result.exampleResponse).toBe('object');
    });

    test('should generate code without authentication', () => {
      const result = generateCodeExample(
        {
          endpointPath: '/customers/{id}',
          method: 'GET',
          language: 'javascript',
          includeAuth: false
        },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.includesAuth).toBe(false);
      expect(result.code).not.toContain('X-API-Key');
    });

    test('should throw error for unsupported language', () => {
      expect(() => {
        generateCodeExample(
          {
            endpointPath: '/customers/{id}',
            method: 'GET',
            language: 'ruby' as any,
            includeAuth: true
          },
          metadataIndex
        );
      }).toThrow('Unsupported language: ruby');
    });

    test('should throw error for non-existent endpoint', () => {
      expect(() => {
        generateCodeExample(
          {
            endpointPath: '/nonexistent',
            method: 'GET',
            language: 'javascript',
            includeAuth: true
          },
          metadataIndex
        );
      }).toThrow('Endpoint not found: GET /nonexistent');
    });
  });

  describe('Tool Execution Flows End-to-End', () => {
    test('should execute complete search and retrieve flow', () => {
      // Search for customer endpoints
      const searchResults = searchApiDocs(
        { query: 'customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(searchResults.length).toBeGreaterThan(0);

      // Get detailed endpoint information for first result
      const endpointResult = getEndpoint(
        { path: searchResults[0].endpoint.path, method: searchResults[0].endpoint.method },
        metadataIndex
      );

      expect(endpointResult).toBeDefined();

      // Get parameters for the endpoint
      const paramsResult = getParameters(
        { endpointPath: searchResults[0].endpoint.path, method: searchResults[0].endpoint.method },
        metadataIndex
      );

      expect(paramsResult).toBeDefined();

      // Get responses for the endpoint
      const responsesResult = getResponses(
        { endpointPath: searchResults[0].endpoint.path, method: searchResults[0].endpoint.method },
        metadataIndex
      );

      expect(responsesResult).toBeDefined();

      // Get permissions for the endpoint
      const permissionsResult = getPermissions(
        { endpointPath: searchResults[0].endpoint.path, method: searchResults[0].endpoint.method },
        metadataIndex
      );

      expect(permissionsResult).toBeDefined();

      // Generate code example for the endpoint
      const codeResult = generateCodeExample(
        {
          endpointPath: searchResults[0].endpoint.path,
          method: searchResults[0].endpoint.method,
          language: 'javascript',
          includeAuth: true
        },
        metadataIndex
      );

      expect(codeResult).toBeDefined();
    });

    test('should execute resource discovery flow', () => {
      // List all resources
      const resourcesResult = listResources({ includeEndpoints: true }, metadataIndex);

      expect(resourcesResult.totalResources).toBeGreaterThan(0);

      // For each resource, get detailed information
      resourcesResult.resources.forEach(resource => {
        expect(resource.summary).toBeDefined();
        expect(resource.summary.name).toBeDefined();
        expect(resource.summary.endpointCount).toBeGreaterThan(0);

        // Get endpoints by resource
        const endpointResult = getEndpoint({ resource: resource.summary.name }, metadataIndex);
        expect(endpointResult).toBeDefined();
      });
    });

    test('should execute permission analysis flow', () => {
      // Get all permissions with summaries
      const permissionsResult = getPermissions(
        { includeSummaries: true, includeMatrix: true },
        metadataIndex
      );

      expect(permissionsResult.totalPermissions).toBeGreaterThan(0);

      if (permissionsResult.summaries) {
        // For each permission summary, get detailed permission info
        permissionsResult.summaries.forEach(summary => {
          const permissionResult = getPermissions({ permission: summary.permission }, metadataIndex);
          expect(permissionResult).toBeDefined();
        });
      }
    });
  });

  describe('Tool Parameter Validation', () => {
    test('should validate search parameters', () => {
      expect(() => {
        searchApiDocs({ query: '' }, vectorStore, metadataIndex);
      }).toThrow();

      expect(() => {
        searchApiDocs({ query: 'test', limit: -1 }, vectorStore, metadataIndex);
      }).not.toThrow(); // Negative limit is handled gracefully
    });

    test('should validate endpoint parameters', () => {
      expect(() => {
        getEndpoint({}, metadataIndex);
      }).toThrow();

      expect(() => {
        getEndpoint({ path: '/test' }, metadataIndex);
      }).not.toThrow(); // Path without method is valid
    });

    test('should validate parameters tool parameters', () => {
      expect(() => {
        getParameters({ endpointPath: '/test' }, metadataIndex);
      }).toThrow();

      expect(() => {
        getParameters({ method: 'GET' }, metadataIndex);
      }).toThrow();
    });

    test('should validate responses tool parameters', () => {
      expect(() => {
        getResponses({ endpointPath: '/test' }, metadataIndex);
      }).toThrow();

      expect(() => {
        getResponses({ endpointPath: '/test', method: 'GET', statusCode: 'invalid' }, metadataIndex);
      }).toThrow();
    });

    test('should validate permissions tool parameters', () => {
      expect(() => {
        getPermissions({ endpointPath: '/test' }, metadataIndex);
      }).toThrow();
    });

    test('should validate code example parameters', () => {
      expect(() => {
        generateCodeExample(
          { endpointPath: '/test', method: 'GET', language: 'invalid' as any, includeAuth: true },
          metadataIndex
        );
      }).toThrow();
    });
  });

  describe('Tool Error Handling', () => {
    test('should handle search errors gracefully', () => {
      const results = searchApiDocs(
        { query: 'nonexistent_resource_xyz', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle endpoint not found', () => {
      const result = getEndpoint(
        { path: '/nonexistent/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should handle parameters not found', () => {
      const result = getParameters(
        { endpointPath: '/nonexistent', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should handle responses not found', () => {
      const result = getResponses(
        { endpointPath: '/nonexistent', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should handle permission not found', () => {
      const result = getPermissions(
        { permission: 'nonexistent.permission' },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.permission).toBeUndefined();
    });

    test('should handle code example generation for non-existent endpoint', () => {
      expect(() => {
        generateCodeExample(
          { endpointPath: '/nonexistent', method: 'GET', language: 'javascript', includeAuth: true },
          metadataIndex
        );
      }).toThrow();
    });
  });

  describe('Tool Response Formatting', () => {
    test('should format search results correctly', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      results.forEach(result => {
        expect(result.endpoint).toBeDefined();
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
        expect(result.context).toBeDefined();
        expect(typeof result.context).toBe('string');
        expect(result.matchType).toBeDefined();
      });
    });

    test('should format endpoint results correctly', () => {
      const result = getEndpoint(
        { path: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      if (result && !Array.isArray(result)) {
        expect(result.endpoint).toBeDefined();
        expect(result.exactMatch).toBeDefined();
        expect(typeof result.exactMatch).toBe('boolean');
      }
    });

    test('should format parameters results correctly', () => {
      const result = getParameters(
        { endpointPath: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      if (result) {
        expect(result.parameters).toBeDefined();
        result.parameters.forEach(param => {
          expect(param.name).toBeDefined();
          expect(param.type).toBeDefined();
          expect(typeof param.required).toBe('boolean');
          expect(param.description).toBeDefined();
          expect(param.paramType).toBeDefined();
          expect(param.constraints).toBeDefined();
          expect(param.validationHints).toBeDefined();
        });
      }
    });

    test('should format responses results correctly', () => {
      const result = getResponses(
        { endpointPath: '/customers/{id}', method: 'GET' },
        metadataIndex
      );

      if (result) {
        expect(result.responses).toBeDefined();
        result.responses.forEach(response => {
          expect(response.statusCode).toBeDefined();
          expect(response.statusCodeInfo).toBeDefined();
          expect(response.description).toBeDefined();
        });
      }
    });

    test('should format permissions results correctly', () => {
      const result = getPermissions(
        { permission: 'customer.view' },
        metadataIndex
      );

      if (result && result.permission) {
        expect(result.permission.name).toBeDefined();
        expect(result.permission.description).toBeDefined();
        expect(Array.isArray(result.permission.endpoints)).toBe(true);
      }
    });

    test('should format resources results correctly', () => {
      const result = listResources({}, metadataIndex);

      expect(result.resources).toBeDefined();
      result.resources.forEach(resource => {
        expect(resource.summary).toBeDefined();
        expect(resource.statistics).toBeDefined();
        expect(resource.navigation).toBeDefined();
      });
    });

    test('should format code example results correctly', () => {
      const result = generateCodeExample(
        { endpointPath: '/customers/{id}', method: 'GET', language: 'javascript', includeAuth: true },
        metadataIndex
      );

      expect(result.endpoint).toBeDefined();
      expect(result.code).toBeDefined();
      expect(typeof result.code).toBe('string');
      expect(result.language).toBeDefined();
      expect(typeof result.includesAuth).toBe('boolean');
      expect(result.errorHandling).toBeDefined();
      expect(typeof result.errorHandling).toBe('string');
    });
  });
});
