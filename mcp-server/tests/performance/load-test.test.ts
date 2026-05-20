/**
 * Load tests for MCP RepairShopr server
 *
 * This test suite tests server performance under load with concurrent requests,
 * search performance under load, tool execution under load, memory usage under load,
 * and server stability under load.
 */

import {
  searchApiDocs,
  searchByResource,
  searchByMethod,
  searchByPermission,
} from '../../src/tools/search';
import { VectorStore } from '../../src/indexer/vector';
import { MetadataIndex } from '../../src/parser/metadata';
import {
  generateEndpoints,
  generateSearchQueries,
  generateComplexSearchQueries,
  createMockMetadataIndex,
} from '../utils/data-generators';
import { createMockVectorStore } from '../fixtures/mock-vector-store';
import { measureTime } from '../utils/test-helpers';

/**
 * Load test metrics interface
 */
interface LoadTestMetrics {
  concurrency: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  p50: number;
  p95: number;
  p99: number;
  requestsPerSecond: number;
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
  errors: string[];
}

/**
 * Load test result interface
 */
interface LoadTestResult {
  testName: string;
  metrics: LoadTestMetrics;
  passed: boolean;
  notes: string[];
}

/**
 * Load test suite
 */
describe('Load Tests', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let endpoints: any[];

  beforeAll(() => {
    // Generate a large dataset for realistic load testing
    endpoints = generateEndpoints(500);
    metadataIndex = createMockMetadataIndex(endpoints);
    vectorStore = createMockVectorStore(endpoints);
  });

  /**
   * Test server under load with concurrent requests
   */
  describe('Server Under Load', () => {
    it('should handle increasing concurrent search requests', async () => {
      const concurrencyLevels = [10, 25, 50, 100, 200];
      const results: LoadTestResult[] = [];
      const query = 'get customers';

      for (const concurrency of concurrencyLevels) {
        const metrics = await runLoadTest(
          `Concurrent Search (${concurrency} requests)`,
          concurrency,
          () => searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex)
        );

        results.push(metrics);

        // Performance assertion: server should handle concurrent requests
        expect(metrics.metrics.failedRequests).toBe(0);
        expect(metrics.metrics.averageTime).toBeLessThan(200);
        expect(metrics.metrics.p95).toBeLessThan(500);
      }

      // Log load test results
      console.log('\n=== Server Under Load - Concurrent Requests ===');
      results.forEach((result) => {
        console.log(`\n${result.testName}:`);
        console.log(`  Concurrency: ${result.metrics.concurrency}`);
        console.log(`  Total Requests: ${result.metrics.totalRequests}`);
        console.log(`  Successful: ${result.metrics.successfulRequests}`);
        console.log(`  Failed: ${result.metrics.failedRequests}`);
        console.log(`  Total Time: ${result.metrics.totalTime.toFixed(2)}ms`);
        console.log(
          `  Average Time: ${result.metrics.averageTime.toFixed(2)}ms`
        );
        console.log(`  P95: ${result.metrics.p95.toFixed(2)}ms`);
        console.log(`  P99: ${result.metrics.p99.toFixed(2)}ms`);
        console.log(
          `  Requests/sec: ${result.metrics.requestsPerSecond.toFixed(2)}`
        );
        console.log(
          `  Memory Delta: ${(result.metrics.memoryDelta / 1024 / 1024).toFixed(2)}MB`
        );
        console.log(`  Passed: ${result.passed}`);
      });
    });

    it('should handle sustained load over time', async () => {
      const duration = 5000; // 5 seconds
      const concurrency = 20;
      const query = 'get customers';
      const startTime = Date.now();
      let totalRequests = 0;
      let successfulRequests = 0;
      let failedRequests = 0;
      const errors: string[] = [];
      const times: number[] = [];

      const memoryBefore = process.memoryUsage().heapUsed;

      while (Date.now() - startTime < duration) {
        const promises = Array.from({ length: concurrency }, async () => {
          const start = Date.now();
          try {
            searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex);
            successfulRequests++;
          } catch (error) {
            failedRequests++;
            errors.push((error as Error).message);
          }
          times.push(Date.now() - start);
        });

        await Promise.all(promises);
        totalRequests += concurrency;
      }

      const memoryAfter = process.memoryUsage().heapUsed;
      const totalTime = Date.now() - startTime;

      const metrics: LoadTestMetrics = {
        concurrency,
        totalRequests,
        successfulRequests,
        failedRequests,
        totalTime,
        averageTime: times.reduce((a, b) => a + b, 0) / times.length,
        minTime: Math.min(...times),
        maxTime: Math.max(...times),
        p50: calculatePercentile(times, 50),
        p95: calculatePercentile(times, 95),
        p99: calculatePercentile(times, 99),
        requestsPerSecond: (totalRequests / totalTime) * 1000,
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryAfter - memoryBefore,
        errors,
      };

      console.log('\n=== Sustained Load Test (5 seconds) ===');
      console.log(`Concurrency: ${concurrency}`);
      console.log(`Total Requests: ${totalRequests}`);
      console.log(`Successful: ${successfulRequests}`);
      console.log(`Failed: ${failedRequests}`);
      console.log(`Total Time: ${totalTime}ms`);
      console.log(`Average Time: ${metrics.averageTime.toFixed(2)}ms`);
      console.log(`P95: ${metrics.p95.toFixed(2)}ms`);
      console.log(`P99: ${metrics.p99.toFixed(2)}ms`);
      console.log(`Requests/sec: ${metrics.requestsPerSecond.toFixed(2)}`);
      console.log(
        `Memory Delta: ${(metrics.memoryDelta / 1024 / 1024).toFixed(2)}MB`
      );

      // Performance assertions
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.averageTime).toBeLessThan(200);
      expect(metrics.requestsPerSecond).toBeGreaterThan(50);
    });
  });

  /**
   * Test search performance under load
   */
  describe('Search Performance Under Load', () => {
    it('should maintain search performance under concurrent load', async () => {
      const queries = generateSearchQueries();
      const concurrency = 50;
      const iterations = 5;

      const baselineTimes: number[] = [];
      const loadTimes: number[] = [];

      // Measure baseline performance (single request)
      for (const query of queries.slice(0, 5)) {
        const { time } = await measureTime(() =>
          Promise.resolve(
            searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex)
          )
        );
        baselineTimes.push(time);
      }

      // Measure performance under load
      for (let i = 0; i < iterations; i++) {
        const promises = queries
          .slice(0, 5)
          .map((query) =>
            measureTime(() =>
              Promise.resolve(
                searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex)
              )
            )
          );
        const results = await Promise.all(promises);
        loadTimes.push(...results.map((r) => r.time));
      }

      const avgBaseline =
        baselineTimes.reduce((a, b) => a + b, 0) / baselineTimes.length;
      const avgLoad = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
      const degradationRatio = avgLoad / avgBaseline;

      console.log('\n=== Search Performance Under Load ===');
      console.log(`Baseline Average: ${avgBaseline.toFixed(2)}ms`);
      console.log(`Load Average: ${avgLoad.toFixed(2)}ms`);
      console.log(`Degradation Ratio: ${degradationRatio.toFixed(2)}x`);

      // Performance assertion: performance should not degrade more than 3x under load
      expect(degradationRatio).toBeLessThan(3);
    });

    it('should handle mixed search queries under load', async () => {
      const simpleQueries = generateSearchQueries();
      const complexQueries = generateComplexSearchQueries();
      const allQueries = [...simpleQueries, ...complexQueries];
      const concurrency = 30;

      const metrics = await runLoadTest(
        'Mixed Search Queries Under Load',
        concurrency,
        () => {
          const query =
            allQueries[Math.floor(Math.random() * allQueries.length)];
          return searchApiDocs(
            { query, limit: 10 },
            vectorStore,
            metadataIndex
          );
        }
      );

      console.log('\n=== Mixed Search Queries Under Load ===');
      console.log(`Concurrency: ${metrics.metrics.concurrency}`);
      console.log(`Total Requests: ${metrics.metrics.totalRequests}`);
      console.log(`Successful: ${metrics.metrics.successfulRequests}`);
      console.log(`Failed: ${metrics.metrics.failedRequests}`);
      console.log(`Average Time: ${metrics.metrics.averageTime.toFixed(2)}ms`);
      console.log(`P95: ${metrics.metrics.p95.toFixed(2)}ms`);
      console.log(
        `Requests/sec: ${metrics.metrics.requestsPerSecond.toFixed(2)}`
      );

      // Performance assertions
      expect(metrics.metrics.failedRequests).toBe(0);
      expect(metrics.metrics.averageTime).toBeLessThan(300);
    });
  });

  /**
   * Test tool execution under load
   */
  describe('Tool Execution Under Load', () => {
    it('should execute all tools under concurrent load', async () => {
      const tools = [
        {
          name: 'searchApiDocs',
          fn: () =>
            searchApiDocs(
              { query: 'get customers', limit: 5 },
              vectorStore,
              metadataIndex
            ),
        },
        {
          name: 'searchByResource',
          fn: () => searchByResource('Customer', metadataIndex),
        },
        {
          name: 'searchByMethod',
          fn: () => searchByMethod('GET', metadataIndex),
        },
        {
          name: 'searchByPermission',
          fn: () => searchByPermission('customer.view', metadataIndex),
        },
      ];

      const concurrency = 20;
      const results: LoadTestResult[] = [];

      for (const tool of tools) {
        const metrics = await runLoadTest(
          `Tool: ${tool.name}`,
          concurrency,
          tool.fn
        );

        results.push(metrics);

        // Performance assertion: all tools should work under load
        expect(metrics.metrics.failedRequests).toBe(0);
        expect(metrics.metrics.averageTime).toBeLessThan(200);
      }

      console.log('\n=== Tool Execution Under Load ===');
      results.forEach((result) => {
        console.log(`\n${result.testName}:`);
        console.log(
          `  Average Time: ${result.metrics.averageTime.toFixed(2)}ms`
        );
        console.log(`  P95: ${result.metrics.p95.toFixed(2)}ms`);
        console.log(
          `  Requests/sec: ${result.metrics.requestsPerSecond.toFixed(2)}`
        );
        console.log(`  Passed: ${result.passed}`);
      });
    });

    it('should handle rapid tool switching under load', async () => {
      const tools = [
        () =>
          searchApiDocs(
            { query: 'get customers', limit: 5 },
            vectorStore,
            metadataIndex
          ),
        () => searchByResource('Customer', metadataIndex),
        () => searchByMethod('GET', metadataIndex),
        () => searchByPermission('customer.view', metadataIndex),
      ];

      const concurrency = 50;
      const iterations = 10;

      const times: number[] = [];
      const errors: string[] = [];
      let successfulRequests = 0;
      let failedRequests = 0;

      for (let i = 0; i < iterations; i++) {
        const promises = Array.from({ length: concurrency }, () => {
          const tool = tools[Math.floor(Math.random() * tools.length)];
          const start = Date.now();
          try {
            tool();
            successfulRequests++;
            times.push(Date.now() - start);
          } catch (error) {
            failedRequests++;
            errors.push((error as Error).message);
          }
        });

        await Promise.all(promises);
      }

      const totalRequests = successfulRequests + failedRequests;
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

      console.log('\n=== Rapid Tool Switching Under Load ===');
      console.log(`Total Requests: ${totalRequests}`);
      console.log(`Successful: ${successfulRequests}`);
      console.log(`Failed: ${failedRequests}`);
      console.log(`Average Time: ${avgTime.toFixed(2)}ms`);
      console.log(`P95: ${calculatePercentile(times, 95).toFixed(2)}ms`);

      // Performance assertions
      expect(failedRequests).toBe(0);
      expect(avgTime).toBeLessThan(200);
    });
  });

  /**
   * Test memory usage under load
   */
  describe('Memory Usage Under Load', () => {
    it('should maintain stable memory usage under load', async () => {
      const concurrency = 50;
      const iterations = 20;
      const query = 'get customers';
      const memorySnapshots: number[] = [];

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < iterations; i++) {
        const promises = Array.from({ length: concurrency }, () =>
          Promise.resolve(
            searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex)
          )
        );

        await Promise.all(promises);
        memorySnapshots.push(process.memoryUsage().heapUsed);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      const avgMemoryPerIteration = memoryGrowth / iterations;

      console.log('\n=== Memory Usage Under Load ===');
      console.log(
        `Initial Memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`
      );
      console.log(`Final Memory: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(
        `Memory Growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`
      );
      console.log(
        `Average Memory per Iteration: ${(avgMemoryPerIteration / 1024).toFixed(2)}KB`
      );

      // Performance assertion: memory growth should be minimal
      expect(avgMemoryPerIteration).toBeLessThan(100 * 1024); // Less than 100KB per iteration
    });

    it('should handle memory pressure with large datasets', async () => {
      const largeEndpoints = generateEndpoints(2000);
      const largeMetadataIndex = createMockMetadataIndex(largeEndpoints);
      const largeVectorStore = createMockVectorStore(largeEndpoints);

      const concurrency = 100;
      const iterations = 10;
      const query = 'get customers';

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memoryBefore = process.memoryUsage().heapUsed;

      for (let i = 0; i < iterations; i++) {
        const promises = Array.from({ length: concurrency }, () =>
          Promise.resolve(
            searchApiDocs(
              { query, limit: 10 },
              largeVectorStore,
              largeMetadataIndex
            )
          )
        );

        await Promise.all(promises);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memoryAfter = process.memoryUsage().heapUsed;
      const memoryDelta = memoryAfter - memoryBefore;

      console.log('\n=== Memory Pressure with Large Dataset ===');
      console.log(
        `Memory Before: ${(memoryBefore / 1024 / 1024).toFixed(2)}MB`
      );
      console.log(`Memory After: ${(memoryAfter / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Memory Delta: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);

      // Performance assertion: memory delta should be reasonable
      expect(memoryDelta).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });
  });

  /**
   * Test server stability under load
   */
  describe('Server Stability Under Load', () => {
    it('should maintain stability under sustained high load', async () => {
      const duration = 10000; // 10 seconds
      const concurrency = 100;
      const query = 'get customers';
      const startTime = Date.now();

      const errorCounts: Map<string, number> = new Map();
      const responseTimes: number[] = [];
      let totalRequests = 0;
      let successfulRequests = 0;
      let failedRequests = 0;

      while (Date.now() - startTime < duration) {
        const promises = Array.from({ length: concurrency }, async () => {
          const start = Date.now();
          try {
            searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex);
            successfulRequests++;
            responseTimes.push(Date.now() - start);
          } catch (error) {
            failedRequests++;
            const errorMessage = (error as Error).message;
            errorCounts.set(
              errorMessage,
              (errorCounts.get(errorMessage) || 0) + 1
            );
          }
        });

        await Promise.all(promises);
        totalRequests += concurrency;
      }

      const successRate = (successfulRequests / totalRequests) * 100;
      const avgResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      console.log('\n=== Server Stability Under Sustained High Load ===');
      console.log(`Duration: ${duration}ms`);
      console.log(`Concurrency: ${concurrency}`);
      console.log(`Total Requests: ${totalRequests}`);
      console.log(`Successful: ${successfulRequests}`);
      console.log(`Failed: ${failedRequests}`);
      console.log(`Success Rate: ${successRate.toFixed(2)}%`);
      console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(
        `P95: ${calculatePercentile(responseTimes, 95).toFixed(2)}ms`
      );
      console.log(
        `P99: ${calculatePercentile(responseTimes, 99).toFixed(2)}ms`
      );

      if (errorCounts.size > 0) {
        console.log('\nErrors:');
        errorCounts.forEach((count, message) => {
          console.log(`  ${message}: ${count} occurrences`);
        });
      }

      // Performance assertions
      expect(successRate).toBeGreaterThan(99);
      expect(avgResponseTime).toBeLessThan(300);
    });

    it('should recover from temporary load spikes', async () => {
      const normalConcurrency = 10;
      const spikeConcurrency = 200;
      const query = 'get customers';

      // Measure baseline performance
      const baselineMetrics = await runLoadTest(
        'Baseline',
        normalConcurrency,
        () => searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex)
      );

      // Apply load spike
      const spikeMetrics = await runLoadTest(
        'Load Spike',
        spikeConcurrency,
        () => searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex)
      );

      // Measure recovery performance
      const recoveryMetrics = await runLoadTest(
        'Recovery',
        normalConcurrency,
        () => searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex)
      );

      const baselineAvg = baselineMetrics.metrics.averageTime;
      const recoveryAvg = recoveryMetrics.metrics.averageTime;
      const recoveryRatio = recoveryAvg / baselineAvg;

      console.log('\n=== Server Recovery from Load Spike ===');
      console.log(`Baseline Average: ${baselineAvg.toFixed(2)}ms`);
      console.log(
        `Spike Average: ${spikeMetrics.metrics.averageTime.toFixed(2)}ms`
      );
      console.log(`Recovery Average: ${recoveryAvg.toFixed(2)}ms`);
      console.log(`Recovery Ratio: ${recoveryRatio.toFixed(2)}x`);

      // Performance assertion: server should recover to near-baseline performance
      expect(recoveryRatio).toBeLessThan(2);
    });

    it('should handle error conditions gracefully under load', async () => {
      const concurrency = 50;
      const invalidQueries = ['', '   ', '!!!@#$%', 'a'.repeat(10000)];

      let successfulRequests = 0;
      let failedRequests = 0;
      const errors: string[] = [];

      const promises = invalidQueries
        .map((query) => {
          return Array.from(
            { length: concurrency / invalidQueries.length },
            () => {
              try {
                searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex);
                successfulRequests++;
              } catch (error) {
                failedRequests++;
                errors.push((error as Error).message);
              }
            }
          );
        })
        .flat();

      await Promise.all(promises);

      console.log('\n=== Error Handling Under Load ===');
      console.log(`Total Requests: ${successfulRequests + failedRequests}`);
      console.log(`Successful: ${successfulRequests}`);
      console.log(`Failed: ${failedRequests}`);

      // Performance assertion: server should handle errors gracefully
      expect(errors.length).toBeGreaterThan(0);
      expect(successfulRequests + failedRequests).toBe(concurrency);
    });
  });

  /**
   * Comprehensive load test suite
   */
  describe('Comprehensive Load Test Suite', () => {
    it('should run comprehensive load tests and generate report', async () => {
      const loadTestResults: LoadTestResult[] = [];

      // Load test 1: Low concurrency
      loadTestResults.push(
        await runLoadTest('Low Concurrency (10 requests)', 10, () =>
          searchApiDocs(
            { query: 'get customers', limit: 5 },
            vectorStore,
            metadataIndex
          )
        )
      );

      // Load test 2: Medium concurrency
      loadTestResults.push(
        await runLoadTest('Medium Concurrency (50 requests)', 50, () =>
          searchApiDocs(
            { query: 'get customers', limit: 5 },
            vectorStore,
            metadataIndex
          )
        )
      );

      // Load test 3: High concurrency
      loadTestResults.push(
        await runLoadTest('High Concurrency (100 requests)', 100, () =>
          searchApiDocs(
            { query: 'get customers', limit: 5 },
            vectorStore,
            metadataIndex
          )
        )
      );

      // Load test 4: Very high concurrency
      loadTestResults.push(
        await runLoadTest('Very High Concurrency (200 requests)', 200, () =>
          searchApiDocs(
            { query: 'get customers', limit: 5 },
            vectorStore,
            metadataIndex
          )
        )
      );

      // Generate comprehensive report
      console.log('\n=== COMPREHENSIVE LOAD TEST REPORT ===');
      console.log('=====================================\n');

      loadTestResults.forEach((result) => {
        console.log(`Load Test: ${result.testName}`);
        console.log(`  Concurrency: ${result.metrics.concurrency}`);
        console.log(`  Total Requests: ${result.metrics.totalRequests}`);
        console.log(`  Successful: ${result.metrics.successfulRequests}`);
        console.log(`  Failed: ${result.metrics.failedRequests}`);
        console.log(`  Total Time: ${result.metrics.totalTime.toFixed(2)}ms`);
        console.log(
          `  Average Time: ${result.metrics.averageTime.toFixed(2)}ms`
        );
        console.log(`  Min Time: ${result.metrics.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${result.metrics.maxTime.toFixed(2)}ms`);
        console.log(`  P50: ${result.metrics.p50.toFixed(2)}ms`);
        console.log(`  P95: ${result.metrics.p95.toFixed(2)}ms`);
        console.log(`  P99: ${result.metrics.p99.toFixed(2)}ms`);
        console.log(
          `  Requests/sec: ${result.metrics.requestsPerSecond.toFixed(2)}`
        );
        console.log(
          `  Memory Delta: ${(result.metrics.memoryDelta / 1024 / 1024).toFixed(2)}MB`
        );
        console.log(`  Passed: ${result.passed}`);
        if (result.notes.length > 0) {
          console.log(`  Notes: ${result.notes.join(', ')}`);
        }
        console.log('');
      });

      // Performance assertions
      loadTestResults.forEach((result) => {
        expect(result.metrics.failedRequests).toBe(0);
        expect(result.metrics.averageTime).toBeLessThan(500);
        expect(result.metrics.p95).toBeLessThan(1000);
      });
    });
  });
});

/**
 * Run a load test with specified concurrency and operation
 */
async function runLoadTest(
  testName: string,
  concurrency: number,
  operation: () => any
): Promise<LoadTestResult> {
  const times: number[] = [];
  const errors: string[] = [];
  let successfulRequests = 0;
  let failedRequests = 0;

  const memoryBefore = process.memoryUsage().heapUsed;
  const startTime = Date.now();

  const promises = Array.from({ length: concurrency }, async () => {
    const start = Date.now();
    try {
      await Promise.resolve(operation());
      successfulRequests++;
      times.push(Date.now() - start);
    } catch (error) {
      failedRequests++;
      errors.push((error as Error).message);
    }
  });

  await Promise.all(promises);

  const endTime = Date.now();
  const memoryAfter = process.memoryUsage().heapUsed;

  const sortedTimes = [...times].sort((a, b) => a - b);
  const totalTime = endTime - startTime;

  const metrics: LoadTestMetrics = {
    concurrency,
    totalRequests: concurrency,
    successfulRequests,
    failedRequests,
    totalTime,
    averageTime: times.reduce((a, b) => a + b, 0) / times.length,
    minTime: sortedTimes[0] || 0,
    maxTime: sortedTimes[sortedTimes.length - 1] || 0,
    p50: calculatePercentile(sortedTimes, 50),
    p95: calculatePercentile(sortedTimes, 95),
    p99: calculatePercentile(sortedTimes, 99),
    requestsPerSecond: (concurrency / totalTime) * 1000,
    memoryBefore,
    memoryAfter,
    memoryDelta: memoryAfter - memoryBefore,
    errors,
  };

  const notes: string[] = [];
  if (metrics.failedRequests > 0) {
    notes.push(`${metrics.failedRequests} failed requests`);
  }
  if (metrics.averageTime > 200) {
    notes.push('High average response time');
  }
  if (metrics.memoryDelta > 10 * 1024 * 1024) {
    notes.push('High memory usage');
  }

  const passed = metrics.failedRequests === 0 && metrics.averageTime < 500;

  return {
    testName,
    metrics,
    passed,
    notes,
  };
}

/**
 * Calculate percentile from sorted array of times
 */
function calculatePercentile(
  sortedTimes: number[],
  percentile: number
): number {
  if (sortedTimes.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedTimes.length) - 1;
  return sortedTimes[Math.max(0, Math.min(index, sortedTimes.length - 1))];
}
