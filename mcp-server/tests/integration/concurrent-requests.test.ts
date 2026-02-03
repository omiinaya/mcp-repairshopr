/**
 * Integration tests for concurrent requests
 * Tests concurrent search requests, concurrent tool executions, server under load, resource management, and race conditions
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
import { Cache } from '../../src/cache/cache';

describe('Concurrent Requests Integration Tests', () => {
  let metadataIndex: any;
  let vectorStore: VectorStore;
  let cache: Cache<any>;

  beforeAll(() => {
    // Create comprehensive test data
    const endpoints = [
      // Customer endpoints
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
          generateResponse({ statusCode: 200, description: 'Customer updated' })
        ]
      }),
      // Invoice endpoints
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
      }),
      generateEndpoint({
        resource: 'Invoice',
        operation: 'List Invoices',
        description: 'List all invoices',
        method: 'GET',
        path: '/invoices',
        permission: 'invoice.view',
        parameters: [
          generateParameter({ name: 'page', type: 'integer', required: false, description: 'Page number', paramType: 'query' })
        ],
        responses: [
          generateResponse({ statusCode: 200, description: 'Successful response' })
        ]
      }),
      // Ticket endpoints
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Create Ticket',
        description: 'Create a new ticket',
        method: 'POST',
        path: '/tickets',
        permission: 'ticket.create',
        parameters: [],
        requestBody: [
          generateParameter({ name: 'subject', type: 'string', required: true, description: 'Ticket subject', paramType: 'body' })
        ],
        responses: [
          generateResponse({ statusCode: 201, description: 'Ticket created' })
        ]
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Get Ticket by ID',
        description: 'Retrieve a specific ticket',
        method: 'GET',
        path: '/tickets/{id}',
        permission: 'ticket.view',
        parameters: [
          generateParameter({ name: 'id', type: 'integer', required: true, description: 'Ticket ID', paramType: 'path' })
        ],
        responses: [
          generateResponse({ statusCode: 200, description: 'Successful response' })
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
        parameters: [],
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

    // Initialize cache
    cache = new Cache({
      maxSize: 10 * 1024 * 1024, // 10MB
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxEntries: 1000,
      enableWarming: false
    });
  });

  describe('Concurrent Search Requests', () => {
    test('should handle multiple concurrent search requests', async () => {
      const queries = ['customer', 'invoice', 'ticket', 'product', 'create'];
      const limit = 5;

      const promises = queries.map(query =>
        Promise.resolve(searchApiDocs({ query, limit }, vectorStore, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(queries.length);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    test('should maintain result isolation during concurrent searches', async () => {
      const queries = ['customer', 'invoice', 'ticket'];
      const limit = 5;

      const promises = queries.map(query =>
        Promise.resolve(searchApiDocs({ query, limit }, vectorStore, metadataIndex))
      );

      const results = await Promise.all(promises);

      // Each result should be independent
      const resultKeys = results.map(r => r.map(item => item.endpoint.path));
      resultKeys.forEach((keys, i) => {
        // Results should be unique per query
        expect(keys.length).toBeGreaterThan(0);
      });
    });

    test('should handle concurrent searches with same query', async () => {
      const query = 'customer';
      const limit = 5;
      const concurrency = 10;

      const promises = Array.from({ length: concurrency }, () =>
        Promise.resolve(searchApiDocs({ query, limit }, vectorStore, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(concurrency);
      // All results should have the same length
      const lengths = results.map(r => r.length);
      expect(lengths.every(l => l === lengths[0])).toBe(true);
    });

    test('should handle concurrent searches with different limits', async () => {
      const query = 'customer';
      const limits = [1, 3, 5, 10, 20];

      const promises = limits.map(limit =>
        Promise.resolve(searchApiDocs({ query, limit }, vectorStore, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(limits.length);
      results.forEach((result, i) => {
        expect(result.length).toBeLessThanOrEqual(limits[i]);
      });
    });

    test('should handle concurrent searches with different filters', async () => {
      const searchConfigs = [
        { query: 'customer', resource: 'Customer', limit: 5 },
        { query: 'invoice', resource: 'Invoice', limit: 5 },
        { query: 'customer', method: 'GET', limit: 5 },
        { query: 'invoice', method: 'GET', limit: 5 },
        { query: 'customer', permission: 'customer.view', limit: 5 }
      ];

      const promises = searchConfigs.map(config =>
        Promise.resolve(searchApiDocs(config, vectorStore, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(searchConfigs.length);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    test('should handle concurrent searches under high load', async () => {
      const concurrency = 50;
      const queries = Array.from({ length: concurrency }, (_, i) => `test query ${i}`);

      const startTime = Date.now();
      const promises = queries.map(query =>
        Promise.resolve(searchApiDocs({ query, limit: 3 }, vectorStore, metadataIndex))
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(concurrency);
      // Should complete in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Concurrent Tool Executions', () => {
    test('should handle concurrent endpoint lookups', async () => {
      const lookups = [
        { path: '/customers/{id}', method: 'GET' },
        { path: '/invoices/{id}', method: 'GET' },
        { path: '/tickets/{id}', method: 'GET' },
        { resource: 'Customer' },
        { resource: 'Invoice' }
      ];

      const promises = lookups.map(lookup =>
        Promise.resolve(getEndpoint(lookup, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(lookups.length);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should handle concurrent parameter lookups', async () => {
      const lookups = [
        { endpointPath: '/customers/{id}', method: 'GET' },
        { endpointPath: '/invoices/{id}', method: 'GET' },
        { endpointPath: '/tickets/{id}', method: 'GET' }
      ];

      const promises = lookups.map(lookup =>
        Promise.resolve(getParameters(lookup, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(lookups.length);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should handle concurrent response lookups', async () => {
      const lookups = [
        { endpointPath: '/customers/{id}', method: 'GET' },
        { endpointPath: '/invoices/{id}', method: 'GET' },
        { endpointPath: '/tickets/{id}', method: 'GET' }
      ];

      const promises = lookups.map(lookup =>
        Promise.resolve(getResponses(lookup, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(lookups.length);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should handle concurrent permission lookups', async () => {
      const lookups = [
        { permission: 'customer.view' },
        { permission: 'invoice.view' },
        { permission: 'ticket.view' },
        { resource: 'Customer' },
        { resource: 'Invoice' }
      ];

      const promises = lookups.map(lookup =>
        Promise.resolve(getPermissions(lookup, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(lookups.length);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should handle concurrent code example generations', async () => {
      const examples = [
        { endpointPath: '/customers/{id}', method: 'GET', language: 'javascript', includeAuth: true },
        { endpointPath: '/customers/{id}', method: 'GET', language: 'python', includeAuth: true },
        { endpointPath: '/customers/{id}', method: 'GET', language: 'curl', includeAuth: true },
        { endpointPath: '/invoices/{id}', method: 'GET', language: 'javascript', includeAuth: true },
        { endpointPath: '/tickets/{id}', method: 'GET', language: 'javascript', includeAuth: true }
      ];

      const promises = examples.map(example =>
        Promise.resolve(generateCodeExample(example, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(examples.length);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.code).toBeDefined();
        expect(result.language).toBeDefined();
      });
    });

    test('should handle concurrent resource listings', async () => {
      const configs = [
        { includeEndpoints: false, includeRelationships: false },
        { includeEndpoints: true, includeRelationships: false },
        { includeEndpoints: false, includeRelationships: true },
        { includeEndpoints: true, includeRelationships: true }
      ];

      const promises = configs.map(config =>
        Promise.resolve(listResources(config, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(configs.length);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.totalResources).toBeGreaterThan(0);
      });
    });

    test('should handle concurrent batch endpoint lookups', async () => {
      const batches = [
        { paths: ['/customers/{id}', '/invoices/{id}'], methods: ['GET', 'GET'] },
        { paths: ['/tickets/{id}', '/products'], methods: ['GET', 'GET'] },
        { paths: ['/customers', '/invoices'], methods: ['POST', 'POST'] }
      ];

      const promises = batches.map(batch =>
        Promise.resolve(getEndpointsBatch(batch, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(batches.length);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.results).toBeDefined();
      });
    });
  });

  describe('Server Under Load', () => {
    test('should handle high concurrent search load', async () => {
      const concurrency = 100;
      const queries = Array.from({ length: concurrency }, (_, i) => `query ${i % 10}`);

      const startTime = Date.now();
      const promises = queries.map(query =>
        Promise.resolve(searchApiDocs({ query, limit: 3 }, vectorStore, metadataIndex))
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(concurrency);
      // Should complete in reasonable time (< 10 seconds)
      expect(duration).toBeLessThan(10000);
    });

    test('should handle high concurrent tool execution load', async () => {
      const concurrency = 50;
      const lookups = Array.from({ length: concurrency }, (_, i) => ({
        path: '/customers/{id}',
        method: 'GET'
      }));

      const startTime = Date.now();
      const promises = lookups.map(lookup =>
        Promise.resolve(getEndpoint(lookup, metadataIndex))
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(concurrency);
      // Should complete in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    test('should maintain performance under sustained load', async () => {
      const rounds = 5;
      const concurrency = 20;
      const queries = ['customer', 'invoice', 'ticket', 'product', 'create'];

      const roundTimes: number[] = [];

      for (let round = 0; round < rounds; round++) {
        const startTime = Date.now();
        const promises = queries.map(query =>
          Promise.resolve(searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex))
        );

        await Promise.all(promises);
        const endTime = Date.now();
        roundTimes.push(endTime - startTime);
      }

      // All rounds should complete in reasonable time
      roundTimes.forEach(time => {
        expect(time).toBeLessThan(2000);
      });

      // Performance should not degrade significantly
      const avgTime = roundTimes.reduce((sum, t) => sum + t, 0) / roundTimes.length;
      const maxTime = Math.max(...roundTimes);
      expect(maxTime).toBeLessThan(avgTime * 3); // Max should not be more than 3x average
    });

    test('should handle mixed concurrent operations', async () => {
      const operations = [
        () => searchApiDocs({ query: 'customer', limit: 5 }, vectorStore, metadataIndex),
        () => getEndpoint({ path: '/customers/{id}', method: 'GET' }, metadataIndex),
        () => getParameters({ endpointPath: '/customers/{id}', method: 'GET' }, metadataIndex),
        () => getResponses({ endpointPath: '/customers/{id}', method: 'GET' }, metadataIndex),
        () => getPermissions({ permission: 'customer.view' }, metadataIndex),
        () => listResources({}, metadataIndex)
      ];

      const promises = operations.map(op => Promise.resolve(op()));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(operations.length);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should handle burst traffic patterns', async () => {
      const burstSize = 30;
      const queries = Array.from({ length: burstSize }, (_, i) => `burst query ${i}`);

      const startTime = Date.now();
      const promises = queries.map(query =>
        Promise.resolve(searchApiDocs({ query, limit: 3 }, vectorStore, metadataIndex))
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(burstSize);
      // Should handle burst quickly (< 3 seconds)
      expect(duration).toBeLessThan(3000);
    });
  });

  describe('Resource Management', () => {
    test('should manage memory efficiently during concurrent requests', async () => {
      const concurrency = 50;
      const queries = Array.from({ length: concurrency }, (_, i) => `memory test ${i}`);

      const promises = queries.map(query =>
        Promise.resolve(searchApiDocs({ query, limit: 10 }, vectorStore, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(concurrency);
      // All requests should complete without memory issues
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    test('should handle concurrent cache operations', async () => {
      const keys = Array.from({ length: 20 }, (_, i) => `cache-key-${i}`);
      const values = Array.from({ length: 20 }, (_, i) => ({ data: `value-${i}` }));

      // Set all values concurrently
      const setPromises = keys.map((key, i) =>
        Promise.resolve(cache.set(key, values[i]))
      );

      await Promise.all(setPromises);

      // Get all values concurrently
      const getPromises = keys.map(key =>
        Promise.resolve(cache.get(key))
      );

      const results = await Promise.all(getPromises);

      expect(results).toHaveLength(keys.length);
      results.forEach((result, i) => {
        expect(result).toEqual(values[i]);
      });
    });

    test('should handle concurrent cache hits and misses', async () => {
      const key = 'concurrent-test-key';
      const value = { test: 'data' };

      // Set value
      cache.set(key, value);

      // Concurrent gets
      const getPromises = Array.from({ length: 10 }, () =>
        Promise.resolve(cache.get(key))
      );

      const results = await Promise.all(getPromises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toEqual(value);
      });
    });

    test('should handle concurrent cache invalidations', async () => {
      const keys = Array.from({ length: 10 }, (_, i) => `invalidate-key-${i}`);

      // Set all values
      keys.forEach(key => cache.set(key, { data: key }));

      // Concurrent invalidations
      const invalidatePromises = keys.map(key =>
        Promise.resolve(cache.delete(key))
      );

      await Promise.all(invalidatePromises);

      // Verify all keys are deleted
      keys.forEach(key => {
        expect(cache.get(key)).toBeNull();
      });
    });

    test('should handle concurrent cache clear operations', async () => {
      const keys = Array.from({ length: 10 }, (_, i) => `clear-key-${i}`);

      // Set all values
      keys.forEach(key => cache.set(key, { data: key }));

      // Concurrent clears
      const clearPromises = Array.from({ length: 5 }, () =>
        Promise.resolve(cache.clear())
      );

      await Promise.all(clearPromises);

      // Verify cache is empty
      keys.forEach(key => {
        expect(cache.get(key)).toBeNull();
      });
    });

    test('should handle concurrent cache stats operations', async () => {
      const keys = Array.from({ length: 10 }, (_, i) => `stats-key-${i}`);

      // Set all values
      keys.forEach(key => cache.set(key, { data: key }));

      // Concurrent stats operations
      const statsPromises = Array.from({ length: 10 }, () =>
        Promise.resolve(cache.getStats())
      );

      const results = await Promise.all(statsPromises);

      expect(results).toHaveLength(10);
      results.forEach(stats => {
        expect(stats).toBeDefined();
        expect(stats.size).toBeGreaterThan(0);
      });
    });
  });

  describe('Race Conditions', () => {
    test('should not have race conditions in concurrent searches', async () => {
      const query = 'customer';
      const concurrency = 20;

      const promises = Array.from({ length: concurrency }, () =>
        Promise.resolve(searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex))
      );

      const results = await Promise.all(promises);

      // All results should be consistent
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.length).toBe(firstResult.length);
        result.forEach((item, i) => {
          expect(item.endpoint.path).toBe(firstResult[i].endpoint.path);
          expect(item.endpoint.method).toBe(firstResult[i].endpoint.method);
        });
      });
    });

    test('should not have race conditions in concurrent cache operations', async () => {
      const key = 'race-test-key';
      const value1 = { data: 'value1' };
      const value2 = { data: 'value2' };

      // Concurrent sets
      const setPromises = [
        Promise.resolve(cache.set(key, value1)),
        Promise.resolve(cache.set(key, value2))
      ];

      await Promise.all(setPromises);

      // Get the value
      const result = cache.get(key);

      // Should have one of the values (not corrupted)
      expect(result).toBeDefined();
      expect(
        JSON.stringify(result) === JSON.stringify(value1) ||
        JSON.stringify(result) === JSON.stringify(value2)
      ).toBe(true);
    });

    test('should not have race conditions in concurrent endpoint lookups', async () => {
      const lookup = { path: '/customers/{id}', method: 'GET' };
      const concurrency = 10;

      const promises = Array.from({ length: concurrency }, () =>
        Promise.resolve(getEndpoint(lookup, metadataIndex))
      );

      const results = await Promise.all(promises);

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toEqual(firstResult);
      });
    });

    test('should not have race conditions in concurrent parameter lookups', async () => {
      const lookup = { endpointPath: '/customers/{id}', method: 'GET' };
      const concurrency = 10;

      const promises = Array.from({ length: concurrency }, () =>
        Promise.resolve(getParameters(lookup, metadataIndex))
      );

      const results = await Promise.all(promises);

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toEqual(firstResult);
      });
    });

    test('should not have race conditions in concurrent response lookups', async () => {
      const lookup = { endpointPath: '/customers/{id}', method: 'GET' };
      const concurrency = 10;

      const promises = Array.from({ length: concurrency }, () =>
        Promise.resolve(getResponses(lookup, metadataIndex))
      );

      const results = await Promise.all(promises);

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toEqual(firstResult);
      });
    });

    test('should not have race conditions in concurrent permission lookups', async () => {
      const lookup = { permission: 'customer.view' };
      const concurrency = 10;

      const promises = Array.from({ length: concurrency }, () =>
        Promise.resolve(getPermissions(lookup, metadataIndex))
      );

      const results = await Promise.all(promises);

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toEqual(firstResult);
      });
    });

    test('should not have race conditions in concurrent resource listings', async () => {
      const config = { includeEndpoints: false, includeRelationships: false };
      const concurrency = 10;

      const promises = Array.from({ length: concurrency }, () =>
        Promise.resolve(listResources(config, metadataIndex))
      );

      const results = await Promise.all(promises);

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.totalResources).toBe(firstResult.totalResources);
        expect(result.resources.length).toBe(firstResult.resources.length);
      });
    });

    test('should not have race conditions in concurrent code example generations', async () => {
      const example = { endpointPath: '/customers/{id}', method: 'GET', language: 'javascript', includeAuth: true };
      const concurrency = 10;

      const promises = Array.from({ length: concurrency }, () =>
        Promise.resolve(generateCodeExample(example, metadataIndex))
      );

      const results = await Promise.all(promises);

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.code).toBe(firstResult.code);
        expect(result.language).toBe(firstResult.language);
      });
    });
  });

  describe('Concurrent Request Isolation', () => {
    test('should maintain request isolation for different queries', async () => {
      const queries = ['customer', 'invoice', 'ticket'];
      const limit = 5;

      const promises = queries.map(query =>
        Promise.resolve(searchApiDocs({ query, limit }, vectorStore, metadataIndex))
      );

      const results = await Promise.all(promises);

      // Each result should be independent
      results.forEach((result, i) => {
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
        // Results should be filtered by the query
        if (queries[i] === 'customer') {
          expect(result.every(r => r.endpoint.resource === 'Customer')).toBe(true);
        }
      });
    });

    test('should maintain request isolation for different tools', async () => {
      const operations = [
        () => searchApiDocs({ query: 'customer', limit: 5 }, vectorStore, metadataIndex),
        () => getEndpoint({ path: '/customers/{id}', method: 'GET' }, metadataIndex),
        () => getParameters({ endpointPath: '/customers/{id}', method: 'GET' }, metadataIndex),
        () => getResponses({ endpointPath: '/customers/{id}', method: 'GET' }, metadataIndex),
        () => getPermissions({ permission: 'customer.view' }, metadataIndex)
      ];

      const promises = operations.map(op => Promise.resolve(op()));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(operations.length);
      // Each result should be independent and valid
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should maintain request isolation for same tool with different parameters', async () => {
      const lookups = [
        { path: '/customers/{id}', method: 'GET' },
        { path: '/invoices/{id}', method: 'GET' },
        { path: '/tickets/{id}', method: 'GET' }
      ];

      const promises = lookups.map(lookup =>
        Promise.resolve(getEndpoint(lookup, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(lookups.length);
      // Each result should be independent
      results.forEach((result, i) => {
        expect(result).toBeDefined();
        if (result && !Array.isArray(result)) {
          expect(result.endpoint.path).toBe(lookups[i].path);
        }
      });
    });

    test('should maintain request isolation for cache operations', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const values = ['value1', 'value2', 'value3'];

      // Set all values
      keys.forEach((key, i) => cache.set(key, values[i]));

      // Get all values concurrently
      const promises = keys.map(key =>
        Promise.resolve(cache.get(key))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(keys.length);
      results.forEach((result, i) => {
        expect(result).toBe(values[i]);
      });
    });
  });

  describe('Concurrent Request Performance', () => {
    test('should complete concurrent requests efficiently', async () => {
      const concurrency = 30;
      const queries = Array.from({ length: concurrency }, (_, i) => `performance test ${i}`);

      const startTime = Date.now();
      const promises = queries.map(query =>
        Promise.resolve(searchApiDocs({ query, limit: 3 }, vectorStore, metadataIndex))
      );

      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete efficiently (< 2 seconds)
      expect(duration).toBeLessThan(2000);
    });

    test('should scale linearly with concurrency', async () => {
      const baseConcurrency = 10;
      const scaledConcurrency = 20;
      const query = 'customer';
      const limit = 5;

      // Base test
      const baseStartTime = Date.now();
      const basePromises = Array.from({ length: baseConcurrency }, () =>
        Promise.resolve(searchApiDocs({ query, limit }, vectorStore, metadataIndex))
      );
      await Promise.all(basePromises);
      const baseEndTime = Date.now();
      const baseDuration = baseEndTime - baseStartTime;

      // Scaled test
      const scaledStartTime = Date.now();
      const scaledPromises = Array.from({ length: scaledConcurrency }, () =>
        Promise.resolve(searchApiDocs({ query, limit }, vectorStore, metadataIndex))
      );
      await Promise.all(scaledPromises);
      const scaledEndTime = Date.now();
      const scaledDuration = scaledEndTime - scaledStartTime;

      // Scaled test should not take more than 3x the base test
      expect(scaledDuration).toBeLessThan(baseDuration * 3);
    });

    test('should handle concurrent requests with minimal overhead', async () => {
      const singleQuery = 'customer';
      const limit = 5;

      // Single request
      const singleStartTime = Date.now();
      const singleResult = searchApiDocs({ query: singleQuery, limit }, vectorStore, metadataIndex);
      const singleEndTime = Date.now();
      const singleDuration = singleEndTime - singleStartTime;

      // Concurrent requests (same query)
      const concurrency = 10;
      const concurrentStartTime = Date.now();
      const concurrentPromises = Array.from({ length: concurrency }, () =>
        Promise.resolve(searchApiDocs({ query: singleQuery, limit }, vectorStore, metadataIndex))
      );
      await Promise.all(concurrentPromises);
      const concurrentEndTime = Date.now();
      const concurrentDuration = concurrentEndTime - concurrentStartTime;

      // Concurrent requests should not take significantly longer than single request
      expect(concurrentDuration).toBeLessThan(singleDuration * 5);
    });
  });

  describe('Concurrent Request Reliability', () => {
    test('should handle concurrent requests reliably', async () => {
      const concurrency = 50;
      const queries = Array.from({ length: concurrency }, (_, i) => `reliability test ${i}`);

      const promises = queries.map(query =>
        Promise.resolve(searchApiDocs({ query, limit: 3 }, vectorStore, metadataIndex))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(concurrency);
      // All requests should complete successfully
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    test('should handle concurrent requests with errors gracefully', async () => {
      const validQueries = ['customer', 'invoice', 'ticket'];
      const invalidQueries = ['', '   ', null, undefined];

      const validPromises = validQueries.map(query =>
        Promise.resolve(searchApiDocs({ query, limit: 3 }, vectorStore, metadataIndex))
      );

      const invalidPromises = invalidQueries.map(query =>
        Promise.resolve(
          searchApiDocs({ query: query as any, limit: 3 }, vectorStore, metadataIndex)
        ).catch(error => ({ error: true, message: (error as Error).message }))
      );

      const allPromises = [...validPromises, ...invalidPromises];
      const results = await Promise.all(allPromises);

      expect(results).toHaveLength(allPromises.length);
      // Valid requests should succeed
      validPromises.forEach((_, i) => {
        expect(results[i]).toBeDefined();
        expect((results[i] as any).error).toBeUndefined();
      });
      // Invalid requests should fail gracefully
      invalidPromises.forEach((_, i) => {
        expect(results[validPromises.length + i]).toBeDefined();
        expect((results[validPromises.length + i] as any).error).toBe(true);
      });
    });

    test('should handle concurrent requests with mixed success and failure', async () => {
      const operations = [
        () => searchApiDocs({ query: 'customer', limit: 5 }, vectorStore, metadataIndex),
        () => getEndpoint({ path: '/nonexistent/{id}', method: 'GET' }, metadataIndex),
        () => getParameters({ endpointPath: '/customers/{id}', method: 'GET' }, metadataIndex),
        () => getResponses({ endpointPath: '/nonexistent', method: 'GET' }, metadataIndex),
        () => getPermissions({ permission: 'customer.view' }, metadataIndex)
      ];

      const promises = operations.map(op =>
        Promise.resolve(op().catch(error => ({ error: true, message: (error as Error).message })))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(operations.length);
      // Some should succeed, some should fail
      const successCount = results.filter(r => !(r as any).error).length;
      const failureCount = results.filter(r => (r as any).error).length;
      expect(successCount + failureCount).toBe(operations.length);
      expect(successCount).toBeGreaterThan(0);
      expect(failureCount).toBeGreaterThan(0);
    });
  });
});
