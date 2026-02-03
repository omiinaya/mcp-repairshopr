/**
 * Performance benchmarks for MCP RepairShopr server
 *
 * This test suite benchmarks search performance, response times,
 * memory usage, and identifies performance bottlenecks.
 */

import { searchApiDocs, searchByResource, searchByMethod, searchByPermission } from '../../src/tools/search';
import { VectorStore } from '../../src/indexer/vector';
import { MetadataIndex } from '../../src/parser/metadata';
import {
  generateEndpoints,
  generateEndpoint,
  generateSearchQueries,
  generateComplexSearchQueries,
  createMockMetadataIndex
} from '../utils/data-generators';
import { createMockVectorStore } from '../fixtures/mock-vector-store';
import { measureTime } from '../utils/test-helpers';

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  operation: string;
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
  resultsCount: number;
}

/**
 * Benchmark result interface
 */
interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  p50: number;
  p95: number;
  p99: number;
  memoryUsage: number;
}

/**
 * Performance test suite
 */
describe('Performance Benchmarks', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let endpoints: any[];

  beforeAll(() => {
    // Generate a large dataset for realistic performance testing
    endpoints = generateEndpoints(100);
    metadataIndex = createMockMetadataIndex(endpoints);
    vectorStore = createMockVectorStore(endpoints);
  });

  /**
   * Benchmark search performance with various query types
   */
  describe('Search Performance', () => {
    it('should benchmark simple search queries', async () => {
      const queries = generateSearchQueries();
      const metrics: PerformanceMetrics[] = [];

      for (const query of queries) {
        const memoryBefore = process.memoryUsage().heapUsed;
        const { result, time } = await measureTime(() =>
          Promise.resolve(searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex))
        );
        const memoryAfter = process.memoryUsage().heapUsed;

        metrics.push({
          operation: `search: ${query}`,
          duration: time,
          memoryBefore,
          memoryAfter,
          memoryDelta: memoryAfter - memoryBefore,
          resultsCount: result.length
        });

        // Performance assertion: search should complete within 100ms
        expect(time).toBeLessThan(100);
      }

      // Log performance metrics
      console.log('\n=== Simple Search Performance ===');
      metrics.forEach(m => {
        console.log(`${m.operation}: ${m.duration}ms, ${m.resultsCount} results, ${m.memoryDelta / 1024}KB memory`);
      });
    });

    it('should benchmark complex search queries', async () => {
      const queries = generateComplexSearchQueries();
      const metrics: PerformanceMetrics[] = [];

      for (const query of queries) {
        const memoryBefore = process.memoryUsage().heapUsed;
        const { result, time } = await measureTime(() =>
          Promise.resolve(searchApiDocs({ query, limit: 10 }, vectorStore, metadataIndex))
        );
        const memoryAfter = process.memoryUsage().heapUsed;

        metrics.push({
          operation: `complex search: ${query}`,
          duration: time,
          memoryBefore,
          memoryAfter,
          memoryDelta: memoryAfter - memoryBefore,
          resultsCount: result.length
        });

        // Performance assertion: complex search should complete within 150ms
        expect(time).toBeLessThan(150);
      }

      console.log('\n=== Complex Search Performance ===');
      metrics.forEach(m => {
        console.log(`${m.operation}: ${m.duration}ms, ${m.resultsCount} results, ${m.memoryDelta / 1024}KB memory`);
      });
    });

    it('should benchmark search with different result sizes', async () => {
      const limits = [1, 5, 10, 20, 50, 100];
      const query = 'get customers';
      const metrics: PerformanceMetrics[] = [];

      for (const limit of limits) {
        const memoryBefore = process.memoryUsage().heapUsed;
        const { result, time } = await measureTime(() =>
          Promise.resolve(searchApiDocs({ query, limit }, vectorStore, metadataIndex))
        );
        const memoryAfter = process.memoryUsage().heapUsed;

        metrics.push({
          operation: `search limit ${limit}`,
          duration: time,
          memoryBefore,
          memoryAfter,
          memoryDelta: memoryAfter - memoryBefore,
          resultsCount: result.length
        });

        // Performance assertion: search should scale linearly with limit
        expect(time).toBeLessThan(limit * 2);
      }

      console.log('\n=== Search Performance by Result Size ===');
      metrics.forEach(m => {
        console.log(`${m.operation}: ${m.duration}ms, ${m.resultsCount} results, ${m.memoryDelta / 1024}KB memory`);
      });
    });

    it('should benchmark search with filters', async () => {
      const filterTests = [
        { query: 'get customers', resource: 'Customer' },
        { query: 'create ticket', method: 'POST' },
        { query: 'get data', permission: 'customer.view' },
        { query: 'search', resource: 'Customer', method: 'GET' }
      ];
      const metrics: PerformanceMetrics[] = [];

      for (const params of filterTests) {
        const memoryBefore = process.memoryUsage().heapUsed;
        const { result, time } = await measureTime(() =>
          Promise.resolve(searchApiDocs(params, vectorStore, metadataIndex))
        );
        const memoryAfter = process.memoryUsage().heapUsed;

        metrics.push({
          operation: `search with filters: ${JSON.stringify(params)}`,
          duration: time,
          memoryBefore,
          memoryAfter,
          memoryDelta: memoryAfter - memoryBefore,
          resultsCount: result.length
        });

        // Performance assertion: filtered search should complete within 100ms
        expect(time).toBeLessThan(100);
      }

      console.log('\n=== Search Performance with Filters ===');
      metrics.forEach(m => {
        console.log(`${m.operation}: ${m.duration}ms, ${m.resultsCount} results, ${m.memoryDelta / 1024}KB memory`);
      });
    });
  });

  /**
   * Benchmark response times for all tools
   */
  describe('Tool Response Times', () => {
    it('should benchmark searchByResource', async () => {
      const resources = ['Customer', 'Ticket', 'Invoice', 'TestResource'];
      const metrics: PerformanceMetrics[] = [];

      for (const resource of resources) {
        const memoryBefore = process.memoryUsage().heapUsed;
        const { result, time } = await measureTime(() =>
          Promise.resolve(searchByResource(resource, metadataIndex))
        );
        const memoryAfter = process.memoryUsage().heapUsed;

        metrics.push({
          operation: `searchByResource: ${resource}`,
          duration: time,
          memoryBefore,
          memoryAfter,
          memoryDelta: memoryAfter - memoryBefore,
          resultsCount: result.length
        });

        // Performance assertion: resource search should complete within 50ms
        expect(time).toBeLessThan(50);
      }

      console.log('\n=== searchByResource Performance ===');
      metrics.forEach(m => {
        console.log(`${m.operation}: ${m.duration}ms, ${m.resultsCount} results, ${m.memoryDelta / 1024}KB memory`);
      });
    });

    it('should benchmark searchByMethod', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      const metrics: PerformanceMetrics[] = [];

      for (const method of methods) {
        const memoryBefore = process.memoryUsage().heapUsed;
        const { result, time } = await measureTime(() =>
          Promise.resolve(searchByMethod(method, metadataIndex))
        );
        const memoryAfter = process.memoryUsage().heapUsed;

        metrics.push({
          operation: `searchByMethod: ${method}`,
          duration: time,
          memoryBefore,
          memoryAfter,
          memoryDelta: memoryAfter - memoryBefore,
          resultsCount: result.length
        });

        // Performance assertion: method search should complete within 50ms
        expect(time).toBeLessThan(50);
      }

      console.log('\n=== searchByMethod Performance ===');
      metrics.forEach(m => {
        console.log(`${m.operation}: ${m.duration}ms, ${m.resultsCount} results, ${m.memoryDelta / 1024}KB memory`);
      });
    });

    it('should benchmark searchByPermission', async () => {
      const permissions = ['customer.view', 'ticket.create', 'invoice.update', 'test.view'];
      const metrics: PerformanceMetrics[] = [];

      for (const permission of permissions) {
        const memoryBefore = process.memoryUsage().heapUsed;
        const { result, time } = await measureTime(() =>
          Promise.resolve(searchByPermission(permission, metadataIndex))
        );
        const memoryAfter = process.memoryUsage().heapUsed;

        metrics.push({
          operation: `searchByPermission: ${permission}`,
          duration: time,
          memoryBefore,
          memoryAfter,
          memoryDelta: memoryAfter - memoryBefore,
          resultsCount: result.length
        });

        // Performance assertion: permission search should complete within 50ms
        expect(time).toBeLessThan(50);
      }

      console.log('\n=== searchByPermission Performance ===');
      metrics.forEach(m => {
        console.log(`${m.operation}: ${m.duration}ms, ${m.resultsCount} results, ${m.memoryDelta / 1024}KB memory`);
      });
    });
  });

  /**
   * Test memory usage during operations
   */
  describe('Memory Usage', () => {
    it('should measure memory usage during search operations', async () => {
      const iterations = 100;
      const query = 'get customers';
      const memorySnapshots: number[] = [];

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < iterations; i++) {
        searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex);
        memorySnapshots.push(process.memoryUsage().heapUsed);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      const avgMemoryPerOperation = memoryGrowth / iterations;

      console.log('\n=== Memory Usage During Search ===');
      console.log(`Initial memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Final memory: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Average memory per operation: ${(avgMemoryPerOperation / 1024).toFixed(2)}KB`);

      // Performance assertion: memory growth should be minimal (< 10KB per operation)
      expect(avgMemoryPerOperation).toBeLessThan(10 * 1024);
    });

    it('should measure memory usage with large datasets', async () => {
      const largeEndpoints = generateEndpoints(1000);
      const largeMetadataIndex = createMockMetadataIndex(largeEndpoints);
      const largeVectorStore = createMockVectorStore(largeEndpoints);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memoryBefore = process.memoryUsage().heapUsed;

      // Perform multiple searches
      for (let i = 0; i < 50; i++) {
        searchApiDocs({ query: `search ${i}`, limit: 10 }, largeVectorStore, largeMetadataIndex);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memoryAfter = process.memoryUsage().heapUsed;
      const memoryDelta = memoryAfter - memoryBefore;

      console.log('\n=== Memory Usage with Large Dataset ===');
      console.log(`Memory before: ${(memoryBefore / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Memory after: ${(memoryAfter / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Memory delta: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);

      // Performance assertion: memory delta should be reasonable (< 50MB)
      expect(memoryDelta).toBeLessThan(50 * 1024 * 1024);
    });
  });

  /**
   * Identify performance bottlenecks
   */
  describe('Performance Bottlenecks', () => {
    it('should identify bottlenecks in search operations', async () => {
      const query = 'get customers';
      const iterations = 100;

      // Benchmark individual components
      const semanticSearchTimes: number[] = [];
      const keywordSearchTimes: number[] = [];
      const combineResultsTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        // Measure semantic search
        const semanticStart = Date.now();
        vectorStore.search(query, 100);
        semanticSearchTimes.push(Date.now() - semanticStart);

        // Measure keyword search
        const keywordStart = Date.now();
        const queryLower = query.toLowerCase();
        for (const endpoint of metadataIndex.allEndpoints) {
          endpoint.resource.toLowerCase().includes(queryLower);
          endpoint.operation.toLowerCase().includes(queryLower);
        }
        keywordSearchTimes.push(Date.now() - keywordStart);

        // Measure result combination
        const combineStart = Date.now();
        const results = searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex);
        combineResultsTimes.push(Date.now() - combineStart);
      }

      const avgSemanticTime = semanticSearchTimes.reduce((a, b) => a + b, 0) / iterations;
      const avgKeywordTime = keywordSearchTimes.reduce((a, b) => a + b, 0) / iterations;
      const avgCombineTime = combineResultsTimes.reduce((a, b) => a + b, 0) / iterations;

      console.log('\n=== Performance Bottleneck Analysis ===');
      console.log(`Average semantic search time: ${avgSemanticTime.toFixed(2)}ms`);
      console.log(`Average keyword search time: ${avgKeywordTime.toFixed(2)}ms`);
      console.log(`Average combine results time: ${avgCombineTime.toFixed(2)}ms`);

      // Identify the slowest component
      const bottleneck = Math.max(avgSemanticTime, avgKeywordTime, avgCombineTime);
      const bottleneckName =
        bottleneck === avgSemanticTime
          ? 'semantic search'
          : bottleneck === avgKeywordTime
          ? 'keyword search'
          : 'result combination';

      console.log(`\nPrimary bottleneck: ${bottleneckName} (${bottleneck.toFixed(2)}ms)`);

      // Performance assertion: no single component should dominate (> 50% of total time)
      const totalTime = avgSemanticTime + avgKeywordTime + avgCombineTime;
      expect(bottleneck / totalTime).toBeLessThan(0.5);
    });

    it('should identify bottlenecks with large result sets', async () => {
      const query = 'get';
      const limits = [10, 50, 100, 200];
      const metrics: PerformanceMetrics[] = [];

      for (const limit of limits) {
        const memoryBefore = process.memoryUsage().heapUsed;
        const { result, time } = await measureTime(() =>
          Promise.resolve(searchApiDocs({ query, limit }, vectorStore, metadataIndex))
        );
        const memoryAfter = process.memoryUsage().heapUsed;

        metrics.push({
          operation: `search with limit ${limit}`,
          duration: time,
          memoryBefore,
          memoryAfter,
          memoryDelta: memoryAfter - memoryBefore,
          resultsCount: result.length
        });
      }

      console.log('\n=== Bottleneck Analysis with Large Result Sets ===');
      metrics.forEach(m => {
        console.log(`${m.operation}: ${m.duration}ms, ${m.resultsCount} results, ${m.memoryDelta / 1024}KB memory`);
      });

      // Check if performance degrades significantly with larger result sets
      const firstTime = metrics[0].duration;
      const lastTime = metrics[metrics.length - 1].duration;
      const timeIncreaseRatio = lastTime / firstTime;

      console.log(`\nTime increase ratio: ${timeIncreaseRatio.toFixed(2)}x`);

      // Performance assertion: time should not increase more than 10x for 20x more results
      expect(timeIncreaseRatio).toBeLessThan(10);
    });
  });

  /**
   * Test concurrent request handling
   */
  describe('Concurrent Request Handling', () => {
    it('should handle concurrent search requests', async () => {
      const concurrencyLevels = [1, 5, 10, 20, 50];
      const query = 'get customers';
      const metrics: PerformanceMetrics[] = [];

      for (const concurrency of concurrencyLevels) {
        const memoryBefore = process.memoryUsage().heapUsed;
        const { result, time } = await measureTime(async () => {
          const promises = Array.from({ length: concurrency }, () =>
            Promise.resolve(searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex))
          );
          return Promise.all(promises);
        });
        const memoryAfter = process.memoryUsage().heapUsed;

        metrics.push({
          operation: `concurrent search (${concurrency} requests)`,
          duration: time,
          memoryBefore,
          memoryAfter,
          memoryDelta: memoryAfter - memoryBefore,
          resultsCount: result.length
        });

        // Performance assertion: concurrent requests should complete within reasonable time
        expect(time).toBeLessThan(concurrency * 100);
      }

      console.log('\n=== Concurrent Request Performance ===');
      metrics.forEach(m => {
        console.log(`${m.operation}: ${m.duration}ms, ${m.resultsCount} results, ${m.memoryDelta / 1024}KB memory`);
      });
    });

    it('should handle concurrent mixed tool requests', async () => {
      const concurrency = 10;
      const operations = [
        () => searchApiDocs({ query: 'get customers', limit: 5 }, vectorStore, metadataIndex),
        () => searchByResource('Customer', metadataIndex),
        () => searchByMethod('GET', metadataIndex),
        () => searchByPermission('customer.view', metadataIndex)
      ];

      const memoryBefore = process.memoryUsage().heapUsed;
      const { result, time } = await measureTime(async () => {
        const promises = Array.from({ length: concurrency }, () => {
          const operation = operations[Math.floor(Math.random() * operations.length)];
          return Promise.resolve(operation());
        });
        return Promise.all(promises);
      });
      const memoryAfter = process.memoryUsage().heapUsed;

      console.log('\n=== Concurrent Mixed Tool Requests ===');
      console.log(`Concurrency: ${concurrency}`);
      console.log(`Total time: ${time}ms`);
      console.log(`Results: ${result.length}`);
      console.log(`Memory delta: ${(memoryAfter - memoryBefore) / 1024}KB`);

      // Performance assertion: concurrent mixed requests should complete within reasonable time
      expect(time).toBeLessThan(concurrency * 100);
    });
  });

  /**
   * Run comprehensive benchmark suite
   */
  describe('Comprehensive Benchmark Suite', () => {
    it('should run comprehensive benchmarks and generate report', async () => {
      const benchmarkResults: BenchmarkResult[] = [];

      // Benchmark 1: Simple search
      const simpleSearchTimes: number[] = [];
      for (let i = 0; i < 100; i++) {
        const { time } = await measureTime(() =>
          Promise.resolve(searchApiDocs({ query: 'get customers', limit: 5 }, vectorStore, metadataIndex))
        );
        simpleSearchTimes.push(time);
      }
      benchmarkResults.push(calculateBenchmarkStats('Simple Search', simpleSearchTimes));

      // Benchmark 2: Complex search
      const complexSearchTimes: number[] = [];
      for (let i = 0; i < 100; i++) {
        const { time } = await measureTime(() =>
          Promise.resolve(searchApiDocs({ query: 'GET customer by id and email', limit: 10 }, vectorStore, metadataIndex))
        );
        complexSearchTimes.push(time);
      }
      benchmarkResults.push(calculateBenchmarkStats('Complex Search', complexSearchTimes));

      // Benchmark 3: Search with filters
      const filteredSearchTimes: number[] = [];
      for (let i = 0; i < 100; i++) {
        const { time } = await measureTime(() =>
          Promise.resolve(searchApiDocs({ query: 'get', resource: 'Customer', method: 'GET' }, vectorStore, metadataIndex))
        );
        filteredSearchTimes.push(time);
      }
      benchmarkResults.push(calculateBenchmarkStats('Filtered Search', filteredSearchTimes));

      // Benchmark 4: Resource search
      const resourceSearchTimes: number[] = [];
      for (let i = 0; i < 100; i++) {
        const { time } = await measureTime(() =>
          Promise.resolve(searchByResource('Customer', metadataIndex))
        );
        resourceSearchTimes.push(time);
      }
      benchmarkResults.push(calculateBenchmarkStats('Resource Search', resourceSearchTimes));

      // Benchmark 5: Method search
      const methodSearchTimes: number[] = [];
      for (let i = 0; i < 100; i++) {
        const { time } = await measureTime(() =>
          Promise.resolve(searchByMethod('GET', metadataIndex))
        );
        methodSearchTimes.push(time);
      }
      benchmarkResults.push(calculateBenchmarkStats('Method Search', methodSearchTimes));

      // Benchmark 6: Permission search
      const permissionSearchTimes: number[] = [];
      for (let i = 0; i < 100; i++) {
        const { time } = await measureTime(() =>
          Promise.resolve(searchByPermission('customer.view', metadataIndex))
        );
        permissionSearchTimes.push(time);
      }
      benchmarkResults.push(calculateBenchmarkStats('Permission Search', permissionSearchTimes));

      // Generate and log comprehensive report
      console.log('\n=== COMPREHENSIVE BENCHMARK REPORT ===');
      console.log('=====================================\n');

      benchmarkResults.forEach(result => {
        console.log(`Benchmark: ${result.name}`);
        console.log(`  Iterations: ${result.iterations}`);
        console.log(`  Total Time: ${result.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${result.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${result.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${result.maxTime.toFixed(2)}ms`);
        console.log(`  P50: ${result.p50.toFixed(2)}ms`);
        console.log(`  P95: ${result.p95.toFixed(2)}ms`);
        console.log(`  P99: ${result.p99.toFixed(2)}ms`);
        console.log(`  Memory Usage: ${(result.memoryUsage / 1024).toFixed(2)}KB`);
        console.log('');
      });

      // Performance assertions
      benchmarkResults.forEach(result => {
        expect(result.averageTime).toBeLessThan(100);
        expect(result.p95).toBeLessThan(200);
        expect(result.p99).toBeLessThan(500);
      });
    });
  });
});

/**
 * Calculate benchmark statistics from an array of times
 */
function calculateBenchmarkStats(name: string, times: number[]): BenchmarkResult {
  const sorted = [...times].sort((a, b) => a - b);
  const total = times.reduce((a, b) => a + b, 0);
  const avg = total / times.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];

  const memoryBefore = process.memoryUsage().heapUsed;
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  const memoryAfter = process.memoryUsage().heapUsed;

  return {
    name,
    iterations: times.length,
    totalTime: total,
    averageTime: avg,
    minTime: min,
    maxTime: max,
    p50,
    p95,
    p99,
    memoryUsage: memoryAfter - memoryBefore
  };
}
