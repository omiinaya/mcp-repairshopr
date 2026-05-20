/**
 * Performance Benchmark Script
 *
 * This script runs performance benchmarks for the MCP RepairShopr server,
 * measures response times for all tools, tests memory usage, identifies
 * bottlenecks, and generates a performance report.
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
} from '../../tests/utils/data-generators';
import { createMockVectorStore } from '../../tests/fixtures/mock-vector-store';

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
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
  throughput: number;
}

/**
 * Performance report interface
 */
interface PerformanceReport {
  timestamp: string;
  systemInfo: {
    platform: string;
    nodeVersion: string;
    cpuCount: number;
    totalMemory: number;
  };
  benchmarks: BenchmarkResult[];
  bottlenecks: {
    operation: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }[];
  summary: {
    totalBenchmarks: number;
    passedBenchmarks: number;
    failedBenchmarks: number;
    averageResponseTime: number;
    totalMemoryUsage: number;
  };
}

/**
 * Measure execution time of a function
 */
async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; time: number }> {
  const start = Date.now();
  const result = await fn();
  const time = Date.now() - start;
  return { result, time };
}

/**
 * Measure execution time of a synchronous function
 */
function measureTimeSync<T>(fn: () => T): { result: T; time: number } {
  const start = Date.now();
  const result = fn();
  const time = Date.now() - start;
  return { result, time };
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

/**
 * Run a benchmark with specified iterations
 */
async function runBenchmark(
  name: string,
  iterations: number,
  operation: () => any
): Promise<BenchmarkResult> {
  const times: number[] = [];

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  const memoryBefore = process.memoryUsage().heapUsed;
  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    const { time } = measureTimeSync(() => operation());
    times.push(time);
  }

  const endTime = Date.now();

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  const memoryAfter = process.memoryUsage().heapUsed;
  const totalTime = endTime - startTime;

  const sortedTimes = [...times].sort((a, b) => a - b);

  return {
    name,
    iterations,
    totalTime,
    averageTime: times.reduce((a, b) => a + b, 0) / times.length,
    minTime: sortedTimes[0],
    maxTime: sortedTimes[sortedTimes.length - 1],
    p50: calculatePercentile(sortedTimes, 50),
    p95: calculatePercentile(sortedTimes, 95),
    p99: calculatePercentile(sortedTimes, 99),
    memoryBefore,
    memoryAfter,
    memoryDelta: memoryAfter - memoryBefore,
    throughput: (iterations / totalTime) * 1000,
  };
}

/**
 * Identify performance bottlenecks
 */
function identifyBottlenecks(
  benchmarks: BenchmarkResult[]
): PerformanceReport['bottlenecks'] {
  const bottlenecks: PerformanceReport['bottlenecks'] = [];

  for (const benchmark of benchmarks) {
    // Check for high average response time
    if (benchmark.averageTime > 200) {
      bottlenecks.push({
        operation: benchmark.name,
        issue: `High average response time: ${benchmark.averageTime.toFixed(2)}ms`,
        severity: benchmark.averageTime > 500 ? 'high' : 'medium',
        recommendation:
          'Consider optimizing the operation or implementing caching',
      });
    }

    // Check for high P99 latency
    if (benchmark.p99 > 500) {
      bottlenecks.push({
        operation: benchmark.name,
        issue: `High P99 latency: ${benchmark.p99.toFixed(2)}ms`,
        severity: benchmark.p99 > 1000 ? 'high' : 'medium',
        recommendation:
          'Investigate tail latency issues and optimize slow paths',
      });
    }

    // Check for high memory usage
    if (benchmark.memoryDelta > 10 * 1024 * 1024) {
      bottlenecks.push({
        operation: benchmark.name,
        issue: `High memory usage: ${(benchmark.memoryDelta / 1024 / 1024).toFixed(2)}MB`,
        severity: benchmark.memoryDelta > 50 * 1024 * 1024 ? 'high' : 'medium',
        recommendation:
          'Review memory allocation patterns and consider memory pooling',
      });
    }

    // Check for high variance (P99 > 10x P50)
    if (benchmark.p99 > benchmark.p50 * 10) {
      bottlenecks.push({
        operation: benchmark.name,
        issue: `High latency variance: P99 (${benchmark.p99.toFixed(2)}ms) is ${(
          benchmark.p99 / benchmark.p50
        ).toFixed(1)}x P50 (${benchmark.p50.toFixed(2)}ms)`,
        severity: 'medium',
        recommendation:
          'Investigate inconsistent performance and optimize variable paths',
      });
    }

    // Check for low throughput
    if (benchmark.throughput < 100) {
      bottlenecks.push({
        operation: benchmark.name,
        issue: `Low throughput: ${benchmark.throughput.toFixed(2)} ops/sec`,
        severity: benchmark.throughput < 50 ? 'high' : 'medium',
        recommendation:
          'Consider parallelization or batching to improve throughput',
      });
    }
  }

  return bottlenecks;
}

/**
 * Generate performance report
 */
function generatePerformanceReport(
  benchmarks: BenchmarkResult[]
): PerformanceReport {
  const bottlenecks = identifyBottlenecks(benchmarks);

  const totalBenchmarks = benchmarks.length;
  const passedBenchmarks = benchmarks.filter(
    (b) =>
      b.averageTime < 200 && b.p95 < 500 && b.memoryDelta < 10 * 1024 * 1024
  ).length;
  const failedBenchmarks = totalBenchmarks - passedBenchmarks;

  const averageResponseTime =
    benchmarks.reduce((sum, b) => sum + b.averageTime, 0) / benchmarks.length;
  const totalMemoryUsage = benchmarks.reduce(
    (sum, b) => sum + b.memoryDelta,
    0
  );

  return {
    timestamp: new Date().toISOString(),
    systemInfo: {
      platform: process.platform,
      nodeVersion: process.version,
      cpuCount: require('os').cpus().length,
      totalMemory: require('os').totalmem(),
    },
    benchmarks,
    bottlenecks,
    summary: {
      totalBenchmarks,
      passedBenchmarks,
      failedBenchmarks,
      averageResponseTime,
      totalMemoryUsage,
    },
  };
}

/**
 * Print performance report to console
 */
function printPerformanceReport(report: PerformanceReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('PERFORMANCE BENCHMARK REPORT');
  console.log('='.repeat(80));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Platform: ${report.systemInfo.platform}`);
  console.log(`Node Version: ${report.systemInfo.nodeVersion}`);
  console.log(`CPU Count: ${report.systemInfo.cpuCount}`);
  console.log(
    `Total Memory: ${(report.systemInfo.totalMemory / 1024 / 1024 / 1024).toFixed(2)}GB`
  );
  console.log('='.repeat(80));

  console.log('\n--- BENCHMARK RESULTS ---\n');

  for (const benchmark of report.benchmarks) {
    console.log(`Benchmark: ${benchmark.name}`);
    console.log(`  Iterations: ${benchmark.iterations}`);
    console.log(`  Total Time: ${benchmark.totalTime.toFixed(2)}ms`);
    console.log(`  Average Time: ${benchmark.averageTime.toFixed(2)}ms`);
    console.log(`  Min Time: ${benchmark.minTime.toFixed(2)}ms`);
    console.log(`  Max Time: ${benchmark.maxTime.toFixed(2)}ms`);
    console.log(`  P50: ${benchmark.p50.toFixed(2)}ms`);
    console.log(`  P95: ${benchmark.p95.toFixed(2)}ms`);
    console.log(`  P99: ${benchmark.p99.toFixed(2)}ms`);
    console.log(
      `  Memory Before: ${(benchmark.memoryBefore / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `  Memory After: ${(benchmark.memoryAfter / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `  Memory Delta: ${(benchmark.memoryDelta / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(`  Throughput: ${benchmark.throughput.toFixed(2)} ops/sec`);
    console.log('');
  }

  console.log('--- PERFORMANCE BOTTLENECKS ---\n');

  if (report.bottlenecks.length === 0) {
    console.log('No significant bottlenecks detected!\n');
  } else {
    for (const bottleneck of report.bottlenecks) {
      console.log(
        `[${bottleneck.severity.toUpperCase()}] ${bottleneck.operation}`
      );
      console.log(`  Issue: ${bottleneck.issue}`);
      console.log(`  Recommendation: ${bottleneck.recommendation}`);
      console.log('');
    }
  }

  console.log('--- SUMMARY ---\n');
  console.log(`Total Benchmarks: ${report.summary.totalBenchmarks}`);
  console.log(`Passed: ${report.summary.passedBenchmarks}`);
  console.log(`Failed: ${report.summary.failedBenchmarks}`);
  console.log(
    `Average Response Time: ${report.summary.averageResponseTime.toFixed(2)}ms`
  );
  console.log(
    `Total Memory Usage: ${(report.summary.totalMemoryUsage / 1024 / 1024).toFixed(2)}MB`
  );
  console.log('');
  console.log('='.repeat(80) + '\n');
}

/**
 * Save performance report to file
 */
function savePerformanceReport(
  report: PerformanceReport,
  outputPath: string
): void {
  const fs = require('fs');
  const path = require('path');

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write report as JSON
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`Performance report saved to: ${outputPath}`);
}

/**
 * Main benchmark execution
 */
async function main(): Promise<void> {
  console.log('Starting performance benchmarks...\n');

  // Setup test data
  console.log('Setting up test data...');
  const endpoints = generateEndpoints(500);
  const metadataIndex = createMockMetadataIndex(endpoints);
  const vectorStore = createMockVectorStore(endpoints);
  console.log(`Generated ${endpoints.length} test endpoints\n`);

  // Run benchmarks
  const benchmarks: BenchmarkResult[] = [];

  console.log('Running benchmarks...\n');

  // Benchmark 1: Simple search queries
  console.log('Running: Simple Search Queries...');
  const simpleQueries = generateSearchQueries();
  for (const query of simpleQueries) {
    const result = await runBenchmark(`Search: "${query}"`, 100, () =>
      searchApiDocs({ query, limit: 5 }, vectorStore, metadataIndex)
    );
    benchmarks.push(result);
  }

  // Benchmark 2: Complex search queries
  console.log('Running: Complex Search Queries...');
  const complexQueries = generateComplexSearchQueries();
  for (const query of complexQueries) {
    const result = await runBenchmark(`Complex Search: "${query}"`, 100, () =>
      searchApiDocs({ query, limit: 10 }, vectorStore, metadataIndex)
    );
    benchmarks.push(result);
  }

  // Benchmark 3: Search with different result sizes
  console.log('Running: Search with Different Result Sizes...');
  const limits = [1, 5, 10, 20, 50, 100];
  for (const limit of limits) {
    const result = await runBenchmark(`Search (limit=${limit})`, 100, () =>
      searchApiDocs(
        { query: 'get customers', limit },
        vectorStore,
        metadataIndex
      )
    );
    benchmarks.push(result);
  }

  // Benchmark 4: Search with filters
  console.log('Running: Search with Filters...');
  const filterTests = [
    { query: 'get customers', resource: 'Customer' },
    { query: 'create ticket', method: 'POST' },
    { query: 'get data', permission: 'customer.view' },
    { query: 'search', resource: 'Customer', method: 'GET' },
  ];
  for (const params of filterTests) {
    const result = await runBenchmark(
      `Search with filters: ${JSON.stringify(params)}`,
      100,
      () => searchApiDocs(params, vectorStore, metadataIndex)
    );
    benchmarks.push(result);
  }

  // Benchmark 5: searchByResource
  console.log('Running: searchByResource...');
  const resources = ['Customer', 'Ticket', 'Invoice', 'TestResource'];
  for (const resource of resources) {
    const result = await runBenchmark(
      `searchByResource: ${resource}`,
      100,
      () => searchByResource(resource, metadataIndex)
    );
    benchmarks.push(result);
  }

  // Benchmark 6: searchByMethod
  console.log('Running: searchByMethod...');
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  for (const method of methods) {
    const result = await runBenchmark(`searchByMethod: ${method}`, 100, () =>
      searchByMethod(method, metadataIndex)
    );
    benchmarks.push(result);
  }

  // Benchmark 7: searchByPermission
  console.log('Running: searchByPermission...');
  const permissions = [
    'customer.view',
    'ticket.create',
    'invoice.update',
    'test.view',
  ];
  for (const permission of permissions) {
    const result = await runBenchmark(
      `searchByPermission: ${permission}`,
      100,
      () => searchByPermission(permission, metadataIndex)
    );
    benchmarks.push(result);
  }

  // Benchmark 8: Large dataset search
  console.log('Running: Large Dataset Search...');
  const largeEndpoints = generateEndpoints(2000);
  const largeMetadataIndex = createMockMetadataIndex(largeEndpoints);
  const largeVectorStore = createMockVectorStore(largeEndpoints);
  const result = await runBenchmark(
    'Large Dataset Search (2000 endpoints)',
    50,
    () =>
      searchApiDocs(
        { query: 'get customers', limit: 10 },
        largeVectorStore,
        largeMetadataIndex
      )
  );
  benchmarks.push(result);

  console.log('\nAll benchmarks completed!\n');

  // Generate performance report
  const report = generatePerformanceReport(benchmarks);

  // Print report to console
  printPerformanceReport(report);

  // Save report to file
  const reportPath = './results/performance-report.json';
  savePerformanceReport(report, reportPath);

  // Exit with appropriate code
  const exitCode = report.summary.failedBenchmarks > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Run main function
main().catch((error) => {
  console.error('Error running benchmarks:', error);
  process.exit(1);
});
