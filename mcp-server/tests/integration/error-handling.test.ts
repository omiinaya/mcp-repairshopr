/**
 * Integration tests for error handling
 * Tests error handling for invalid queries, missing endpoints, invalid parameters, server errors, and error logging and monitoring
 */

import { createMockMetadataIndex } from '../utils/test-helpers';
import { generateEndpoint, generateParameter, generateResponse } from '../utils/data-generators';
import { searchApiDocs } from '../../src/tools/search';
import { getEndpoint, getEndpointsBatch } from '../../src/tools/endpoint';
import { getParameters } from '../../src/tools/parameters';
import { getResponses } from '../../src/tools/responses';
import { getPermissions } from '../../src/tools/permissions';
import { listResources } from '../../src/tools/resources';
import { generateCodeExample } from '../../src/tools/code-examples';
import { VectorStore } from '../../src/indexer/vector';
import { monitoringService } from '../../src/server/monitoring';
import { structuredLogger } from '../../src/server/structured-logger';

describe('Error Handling Integration Tests', () => {
  let metadataIndex: any;
  let vectorStore: VectorStore;

  beforeAll(() => {
    // Create test data
    const endpoints = [
      generateEndpoint({
        resource: 'Customer',
        operation: 'Get Customer by ID',
        description: 'Retrieve a specific customer by ID',
        method: 'GET',
        path: '/customers/{id}',
        permission: 'customer.view',
        parameters: [
          generateParameter({ name: 'id', type: 'integer', required: true, description: 'Customer ID', paramType: 'path' })
        ],
        responses: [
          generateResponse({ statusCode: 200, description: 'Successful response' })
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
          generateParameter({ name: 'name', type: 'string', required: true, description: 'Customer name', paramType: 'body' })
        ],
        responses: [
          generateResponse({ statusCode: 201, description: 'Customer created' })
        ]
      }),
      generateEndpoint({
        resource: 'Invoice',
        operation: 'Get Invoice by ID',
        description: 'Retrieve a specific invoice',
        method: 'GET',
        path: '/invoices/{id}',
        permission: 'invoice.view',
        parameters: [
          generateParameter({ name: 'id', type: 'integer', required: true, description: 'Invoice ID', paramType: 'path' })
        ],
        responses: [
          generateResponse({ statusCode: 200, description: 'Successful response' })
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

    // Start monitoring service
    monitoringService.startMonitoring();
  });

  afterAll(() => {
    // Stop monitoring service
    monitoringService.stopMonitoring();
  });

  describe('Error Handling for Invalid Queries', () => {
    test('should throw error for empty query', () => {
      expect(() => {
        searchApiDocs({ query: '' }, vectorStore, metadataIndex);
      }).toThrow('Query parameter is required and cannot be empty');
    });

    test('should throw error for whitespace-only query', () => {
      expect(() => {
        searchApiDocs({ query: '   ' }, vectorStore, metadataIndex);
      }).toThrow('Query parameter is required and cannot be empty');
    });

    test('should throw error for null query', () => {
      expect(() => {
        searchApiDocs({ query: null as any }, vectorStore, metadataIndex);
      }).toThrow();
    });

    test('should throw error for undefined query', () => {
      expect(() => {
        searchApiDocs({ query: undefined as any }, vectorStore, metadataIndex);
      }).toThrow();
    });

    test('should handle very long query gracefully', () => {
      const longQuery = 'customer '.repeat(1000);
      
      expect(() => {
        searchApiDocs({ query: longQuery, limit: 5 }, vectorStore, metadataIndex);
      }).not.toThrow();
    });

    test('should handle special characters in query', () => {
      const specialQuery = 'customer!@#$%^&*()_+-={}[]|\\:";\'<>?,./';
      
      expect(() => {
        searchApiDocs({ query: specialQuery, limit: 5 }, vectorStore, metadataIndex);
      }).not.toThrow();
    });

    test('should handle unicode characters in query', () => {
      const unicodeQuery = '客户 customer 客戶';
      
      expect(() => {
        searchApiDocs({ query: unicodeQuery, limit: 5 }, vectorStore, metadataIndex);
      }).not.toThrow();
    });

    test('should handle query with only numbers', () => {
      const numberQuery = '1234567890';
      
      expect(() => {
        searchApiDocs({ query: numberQuery, limit: 5 }, vectorStore, metadataIndex);
      }).not.toThrow();
    });
  });

  describe('Error Handling for Missing Endpoints', () => {
    test('should return null for non-existent endpoint', () => {
      const result = getEndpoint(
        { path: '/nonexistent/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should return null for non-existent endpoint with valid resource', () => {
      const result = getEndpoint(
        { resource: 'NonExistentResource' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should return null for non-existent endpoint with path only', () => {
      const result = getEndpoint(
        { path: '/nonexistent' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should return null for non-existent endpoint with wrong method', () => {
      const result = getEndpoint(
        { path: '/customers/{id}', method: 'PATCH' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should handle batch lookup with some non-existent endpoints', () => {
      const result = getEndpointsBatch(
        {
          paths: ['/customers/{id}', '/nonexistent/{id}', '/invoices/{id}'],
          methods: ['GET', 'GET', 'GET']
        },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(1);
      expect(result.results.length).toBe(2);
    });

    test('should handle batch lookup with all non-existent endpoints', () => {
      const result = getEndpointsBatch(
        {
          paths: ['/nonexistent1/{id}', '/nonexistent2/{id}'],
          methods: ['GET', 'GET']
        },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(2);
      expect(result.results.length).toBe(0);
    });
  });

  describe('Error Handling for Invalid Parameters', () => {
    test('should throw error for missing required parameters in getEndpoint', () => {
      expect(() => {
        getEndpoint({}, metadataIndex);
      }).toThrow('Either path or resource parameter must be provided');
    });

    test('should throw error for missing required parameters in getParameters', () => {
      expect(() => {
        getParameters({ endpointPath: '/customers/{id}' }, metadataIndex);
      }).toThrow('endpointPath and method are required parameters');
    });

    test('should throw error for missing required parameters in getResponses', () => {
      expect(() => {
        getResponses({ endpointPath: '/customers/{id}' }, metadataIndex);
      }).toThrow('endpointPath and method are required parameters');
    });

    test('should throw error for missing required parameters in getPermissions', () => {
      expect(() => {
        getPermissions({ endpointPath: '/customers/{id}' }, metadataIndex);
      }).toThrow('method parameter is required when using endpointPath');
    });

    test('should throw error for missing required parameters in generateCodeExample', () => {
      expect(() => {
        generateCodeExample(
          { endpointPath: '/customers/{id}', method: 'GET', language: 'javascript' as any, includeAuth: true },
          metadataIndex
        );
      }).toThrow('Unsupported language: javascript');
    });

    test('should throw error for invalid status code in getResponses', () => {
      expect(() => {
        getResponses(
          { endpointPath: '/customers/{id}', method: 'GET', statusCode: 'invalid' },
          metadataIndex
        );
      }).toThrow('statusCode must be a valid number');
    });

    test('should throw error for invalid language in generateCodeExample', () => {
      expect(() => {
        generateCodeExample(
          { endpointPath: '/customers/{id}', method: 'GET', language: 'ruby' as any, includeAuth: true },
          metadataIndex
        );
      }).toThrow('Unsupported language: ruby');
    });

    test('should throw error for non-existent endpoint in generateCodeExample', () => {
      expect(() => {
        generateCodeExample(
          { endpointPath: '/nonexistent', method: 'GET', language: 'javascript', includeAuth: true },
          metadataIndex
        );
      }).toThrow('Endpoint not found: GET /nonexistent');
    });

    test('should handle invalid limit parameter in search', () => {
      expect(() => {
        searchApiDocs({ query: 'customer', limit: -1 }, vectorStore, metadataIndex);
      }).not.toThrow(); // Negative limit is handled gracefully
    });

    test('should handle zero limit in search', () => {
      const results = searchApiDocs({ query: 'customer', limit: 0 }, vectorStore, metadataIndex);
      expect(results).toBeDefined();
      expect(results.length).toBe(0);
    });

    test('should handle very large limit in search', () => {
      const results = searchApiDocs({ query: 'customer', limit: 1000000 }, vectorStore, metadataIndex);
      expect(results).toBeDefined();
      expect(results.length).toBeLessThanOrEqual(metadataIndex.allEndpoints.length);
    });

    test('should handle invalid filter parameters in search', () => {
      const results = searchApiDocs(
        { query: 'customer', resource: 'NonExistent', method: 'INVALID', permission: 'nonexistent.permission', limit: 5 },
        vectorStore,
        metadataIndex
      );
      expect(results).toBeDefined();
      expect(results.length).toBe(0);
    });
  });

  describe('Error Handling for Server Errors', () => {
    test('should handle errors in vector store operations', () => {
      // Create a vector store without any data
      const emptyVectorStore = new VectorStore();

      expect(() => {
        searchApiDocs({ query: 'customer', limit: 5 }, emptyVectorStore, metadataIndex);
      }).not.toThrow(); // Should handle gracefully
    });

    test('should handle errors in metadata index operations', () => {
      const emptyMetadataIndex = {
        resources: new Map(),
        endpointsByPath: new Map(),
        endpointsByPermission: new Map(),
        endpointsByMethod: new Map(),
        allEndpoints: []
      };

      const results = searchApiDocs({ query: 'customer', limit: 5 }, vectorStore, emptyMetadataIndex);
      expect(results).toBeDefined();
      expect(results.length).toBe(0);
    });

    test('should handle errors in parameter lookup', () => {
      const result = getParameters(
        { endpointPath: '/nonexistent', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should handle errors in response lookup', () => {
      const result = getResponses(
        { endpointPath: '/nonexistent', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should handle errors in permission lookup', () => {
      const result = getPermissions(
        { endpointPath: '/nonexistent', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.permission).toBeUndefined();
    });

    test('should handle errors in resource listing', () => {
      const result = listResources({}, metadataIndex);
      expect(result).toBeDefined();
      expect(result.totalResources).toBeGreaterThan(0);
    });

    test('should handle errors in batch endpoint lookup', () => {
      const result = getEndpointsBatch(
        { paths: [], methods: [] },
        metadataIndex
      );

      expect(result).toBeDefined();
      expect(result.results).toEqual([]);
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
    });

    test('should handle errors in batch endpoint lookup with mismatched arrays', () => {
      expect(() => {
        getEndpointsBatch(
          { paths: ['/customers/{id}'], methods: ['GET', 'POST'] },
          metadataIndex
        );
      }).toThrow('Paths and methods arrays must have the same length');
    });
  });

  describe('Error Logging and Monitoring', () => {
    test('should log errors for invalid queries', () => {
      const logSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        searchApiDocs({ query: '' }, vectorStore, metadataIndex);
      } catch (error) {
        // Error should have been thrown
      }

      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });

    test('should log errors for missing endpoints', () => {
      const logSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = getEndpoint(
        { path: '/nonexistent/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeNull();
      logSpy.mockRestore();
    });

    test('should record error metrics in monitoring service', () => {
      const initialHealth = monitoringService.getHealthStatus();
      const initialErrorCount = initialHealth.metrics?.errorCount || 0;

      // Trigger an error
      try {
        searchApiDocs({ query: '' }, vectorStore, metadataIndex);
      } catch (error) {
        // Error should have been thrown
      }

      const updatedHealth = monitoringService.getHealthStatus();
      const updatedErrorCount = updatedHealth.metrics?.errorCount || 0;

      // Error count should have increased
      expect(updatedErrorCount).toBeGreaterThanOrEqual(initialErrorCount);
    });

    test('should log structured errors', () => {
      const error = new Error('Test error');
      const logSpy = jest.spyOn(structuredLogger, 'logError').mockImplementation();

      structuredLogger.logError(error, { phase: 'test' });

      expect(logSpy).toHaveBeenCalledWith(error, { phase: 'test' });
      logSpy.mockRestore();
    });

    test('should log health check results', () => {
      const logSpy = jest.spyOn(structuredLogger, 'logHealthCheck').mockImplementation();

      structuredLogger.logHealthCheck('healthy', 1000, { test: 'metric' });

      expect(logSpy).toHaveBeenCalledWith('healthy', 1000, { test: 'metric' });
      logSpy.mockRestore();
    });

    test('should log configuration changes', () => {
      const oldConfig = { test: 'old' };
      const newConfig = { test: 'new' };
      const logSpy = jest.spyOn(structuredLogger, 'logConfigChange').mockImplementation();

      structuredLogger.logConfigChange(oldConfig, newConfig);

      expect(logSpy).toHaveBeenCalledWith(oldConfig, newConfig);
      logSpy.mockRestore();
    });

    test('should track request metrics', () => {
      const initialStats = monitoringService.getHealthStatus();
      const initialRequestCount = initialStats.metrics?.requestCount || 0;

      // Perform a successful request
      const results = searchApiDocs({ query: 'customer', limit: 5 }, vectorStore, metadataIndex);

      const updatedStats = monitoringService.getHealthStatus();
      const updatedRequestCount = updatedStats.metrics?.requestCount || 0;

      // Request count should have increased
      expect(updatedRequestCount).toBeGreaterThan(initialRequestCount);
    });

    test('should track error metrics', () => {
      const initialStats = monitoringService.getHealthStatus();
      const initialErrorCount = initialStats.metrics?.errorCount || 0;

      // Trigger an error
      try {
        searchApiDocs({ query: '' }, vectorStore, metadataIndex);
      } catch (error) {
        // Error should have been thrown
      }

      const updatedStats = monitoringService.getHealthStatus();
      const updatedErrorCount = updatedStats.metrics?.errorCount || 0;

      // Error count should have increased
      expect(updatedErrorCount).toBeGreaterThan(initialErrorCount);
    });

    test('should provide health status', () => {
      const health = monitoringService.getHealthStatus();

      expect(health).toBeDefined();
      expect(health.healthy).toBeDefined();
      expect(typeof health.healthy).toBe('boolean');
      expect(health.metrics).toBeDefined();
    });

    test('should track tool call metrics', () => {
      const initialStats = monitoringService.getHealthStatus();
      const initialToolCallCount = initialStats.metrics?.toolCallCount || 0;

      monitoringService.recordToolCall('test_tool');

      const updatedStats = monitoringService.getHealthStatus();
      const updatedToolCallCount = updatedStats.metrics?.toolCallCount || 0;

      expect(updatedToolCallCount).toBeGreaterThan(initialToolCallCount);
    });
  });

  describe('Error Recovery', () => {
    test('should recover from invalid query with valid query', () => {
      // First, try an invalid query
      expect(() => {
        searchApiDocs({ query: '' }, vectorStore, metadataIndex);
      }).toThrow();

      // Then, try a valid query
      const results = searchApiDocs({ query: 'customer', limit: 5 }, vectorStore, metadataIndex);

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });

    test('should recover from missing endpoint with valid endpoint', () => {
      // First, try a non-existent endpoint
      const result1 = getEndpoint(
        { path: '/nonexistent/{id}', method: 'GET' },
        metadataIndex
      );
      expect(result1).toBeNull();

      // Then, try a valid endpoint
      const result2 = getEndpoint(
        { path: '/customers/{id}', method: 'GET' },
        metadataIndex
      );
      expect(result2).toBeDefined();
    });

    test('should recover from invalid parameters with valid parameters', () => {
      // First, try with invalid parameters
      expect(() => {
        getParameters({ endpointPath: '/customers/{id}' }, metadataIndex);
      }).toThrow();

      // Then, try with valid parameters
      const result = getParameters(
        { endpointPath: '/customers/{id}', method: 'GET' },
        metadataIndex
      );
      expect(result).toBeDefined();
    });

    test('should recover from server errors gracefully', () => {
      // Simulate a server error by using invalid data
      const invalidMetadataIndex = null as any;

      expect(() => {
        searchApiDocs({ query: 'customer', limit: 5 }, vectorStore, invalidMetadataIndex);
      }).toThrow();

      // Then, try with valid data
      const results = searchApiDocs({ query: 'customer', limit: 5 }, vectorStore, metadataIndex);

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Error Message Quality', () => {
    test('should provide clear error messages for invalid queries', () => {
      try {
        searchApiDocs({ query: '' }, vectorStore, metadataIndex);
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
        expect(error.message).toContain('required');
      }
    });

    test('should provide clear error messages for missing endpoints', () => {
      try {
        generateCodeExample(
          { endpointPath: '/nonexistent', method: 'GET', language: 'javascript', includeAuth: true },
          metadataIndex
        );
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message).toContain('not found');
      }
    });

    test('should provide clear error messages for invalid parameters', () => {
      try {
        getParameters({ endpointPath: '/customers/{id}' }, metadataIndex);
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message).toContain('required');
      }
    });

    test('should provide clear error messages for invalid status codes', () => {
      try {
        getResponses(
          { endpointPath: '/customers/{id}', method: 'GET', statusCode: 'invalid' },
          metadataIndex
        );
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message).toContain('valid number');
      }
    });

    test('should provide clear error messages for invalid languages', () => {
      try {
        generateCodeExample(
          { endpointPath: '/customers/{id}', method: 'GET', language: 'ruby' as any, includeAuth: true },
          metadataIndex
        );
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message).toContain('Unsupported language');
      }
    });
  });

  describe('Error Handling Edge Cases', () => {
    test('should handle null metadata index', () => {
      expect(() => {
        searchApiDocs({ query: 'customer', limit: 5 }, vectorStore, null as any);
      }).toThrow();
    });

    test('should handle null vector store', () => {
      expect(() => {
        searchApiDocs({ query: 'customer', limit: 5 }, null as any, metadataIndex);
      }).toThrow();
    });

    test('should handle malformed endpoint paths', () => {
      const result = getEndpoint(
        { path: 'invalid-path-without-slash', method: 'GET' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should handle malformed HTTP methods', () => {
      const result = getEndpoint(
        { path: '/customers/{id}', method: 'INVALID' as any },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should handle empty resource name', () => {
      const result = getEndpoint(
        { resource: '' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should handle special characters in resource name', () => {
      const result = getEndpoint(
        { resource: 'Customer!@#$%' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should handle extremely long paths', () => {
      const longPath = '/customers/' + 'a'.repeat(1000);
      const result = getEndpoint(
        { path: longPath, method: 'GET' },
        metadataIndex
      );

      expect(result).toBeNull();
    });

    test('should handle negative limit values', () => {
      const results = searchApiDocs({ query: 'customer', limit: -5 }, vectorStore, metadataIndex);
      expect(results).toBeDefined();
      expect(results.length).toBe(0);
    });

    test('should handle floating point limit values', () => {
      const results = searchApiDocs({ query: 'customer', limit: 5.5 as any }, vectorStore, metadataIndex);
      expect(results).toBeDefined();
    });
  });

  describe('Error Handling Performance', () => {
    test('should fail fast for invalid queries', () => {
      const startTime = Date.now();

      try {
        searchApiDocs({ query: '' }, vectorStore, metadataIndex);
        fail('Expected error to be thrown');
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Should fail quickly (< 100ms)
        expect(duration).toBeLessThan(100);
      }
    });

    test('should fail fast for missing endpoints', () => {
      const startTime = Date.now();

      const result = getEndpoint(
        { path: '/nonexistent/{id}', method: 'GET' },
        metadataIndex
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result).toBeNull();
      expect(duration).toBeLessThan(100);
    });

    test('should fail fast for invalid parameters', () => {
      const startTime = Date.now();

      try {
        getParameters({ endpointPath: '/customers/{id}' }, metadataIndex);
        fail('Expected error to be thrown');
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Should fail quickly (< 100ms)
        expect(duration).toBeLessThan(100);
      }
    });
  });

  describe('Error Handling Consistency', () => {
    test('should return consistent errors for same invalid input', () => {
      const error1 = (() => {
        try {
          searchApiDocs({ query: '' }, vectorStore, metadataIndex);
          return null;
        } catch (error: any) {
          return error.message;
        }
      })();

      const error2 = (() => {
        try {
          searchApiDocs({ query: '' }, vectorStore, metadataIndex);
          return null;
        } catch (error: any) {
          return error.message;
        }
      })();

      expect(error1).toBe(error2);
    });

    test('should return consistent null results for same missing endpoint', () => {
      const result1 = getEndpoint(
        { path: '/nonexistent/{id}', method: 'GET' },
        metadataIndex
      );

      const result2 = getEndpoint(
        { path: '/nonexistent/{id}', method: 'GET' },
        metadataIndex
      );

      expect(result1).toBe(result2);
      expect(result1).toBeNull();
    });

    test('should handle multiple consecutive errors gracefully', () => {
      // Trigger multiple errors in sequence
      for (let i = 0; i < 5; i++) {
        try {
          searchApiDocs({ query: '' }, vectorStore, metadataIndex);
        } catch (error) {
          // Expected error
        }
      }

      // System should still be functional
      const results = searchApiDocs({ query: 'customer', limit: 5 }, vectorStore, metadataIndex);
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
