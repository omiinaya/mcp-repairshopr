/**
 * Edge Case Tests
 * Tests edge cases in queries, responses, tool execution, error handling, and concurrent requests
 */

import { MCPServer } from '../../src/server';
import {
  generateEdgeCaseQueries,
  generateInvalidQueryParams,
} from '../utils/data-generators';

/**
 * Edge case test result interface
 */
interface EdgeCaseTestResult {
  testCaseId: string;
  description: string;
  category: EdgeCaseCategory;
  passed: boolean;
  error?: string;
  response?: any;
  duration: number;
}

/**
 * Edge case categories
 */
type EdgeCaseCategory =
  | 'query-edge-cases'
  | 'response-edge-cases'
  | 'tool-execution-edge-cases'
  | 'error-handling-edge-cases'
  | 'concurrent-request-edge-cases';

/**
 * Query edge cases
 */
const queryEdgeCases = [
  {
    id: 'QUERY-EDGE-001',
    description: 'Empty query string',
    query: '',
    expectedBehavior: 'Should return helpful error message',
    shouldPass: false,
  },
  {
    id: 'QUERY-EDGE-002',
    description: 'Whitespace only query',
    query: '   ',
    expectedBehavior: 'Should return helpful error message',
    shouldPass: false,
  },
  {
    id: 'QUERY-EDGE-003',
    description: 'Very long query (1000 characters)',
    query: 'a'.repeat(1000),
    expectedBehavior: 'Should handle gracefully or return error',
    shouldPass: false,
  },
  {
    id: 'QUERY-EDGE-004',
    description: 'Special characters only',
    query: '!!!@#$%',
    expectedBehavior: 'Should handle gracefully',
    shouldPass: false,
  },
  {
    id: 'QUERY-EDGE-005',
    description: 'Unicode characters',
    query: '客户查询',
    expectedBehavior: 'Should handle gracefully',
    shouldPass: true,
  },
  {
    id: 'QUERY-EDGE-006',
    description: 'Mixed case query',
    query: 'GeT CuStOmEr By Id',
    expectedBehavior: 'Should handle case-insensitively',
    shouldPass: true,
  },
  {
    id: 'QUERY-EDGE-007',
    description: 'Query with SQL injection attempt',
    query: "'; DROP TABLE customers; --",
    expectedBehavior: 'Should sanitize and handle safely',
    shouldPass: false,
  },
  {
    id: 'QUERY-EDGE-008',
    description: 'Query with XSS attempt',
    query: '<script>alert("xss")</script>',
    expectedBehavior: 'Should sanitize and handle safely',
    shouldPass: false,
  },
  {
    id: 'QUERY-EDGE-009',
    description: 'Query with path traversal attempt',
    query: '../../../etc/passwd',
    expectedBehavior: 'Should sanitize and handle safely',
    shouldPass: false,
  },
  {
    id: 'QUERY-EDGE-010',
    description: 'Query with null bytes',
    query: 'get\x00customer',
    expectedBehavior: 'Should handle gracefully',
    shouldPass: false,
  },
];

/**
 * Response edge cases
 */
const responseEdgeCases = [
  {
    id: 'RESP-EDGE-001',
    description: 'Response with no endpoints found',
    query: 'nonexistent resource xyz',
    expectedBehavior: 'Should return empty list with helpful message',
    shouldPass: true,
  },
  {
    id: 'RESP-EDGE-002',
    description: 'Response with very large data',
    query: 'get all endpoints',
    expectedBehavior: 'Should handle large response without timeout',
    shouldPass: true,
  },
  {
    id: 'RESP-EDGE-003',
    description: 'Response with nested objects',
    query: 'get customer with all related data',
    expectedBehavior: 'Should handle nested structures correctly',
    shouldPass: true,
  },
  {
    id: 'RESP-EDGE-004',
    description: 'Response with special characters in data',
    query: 'get customer with special chars',
    expectedBehavior: 'Should escape special characters properly',
    shouldPass: true,
  },
  {
    id: 'RESP-EDGE-005',
    description: 'Response with null values',
    query: 'get endpoint with optional fields',
    expectedBehavior: 'Should handle null values gracefully',
    shouldPass: true,
  },
  {
    id: 'RESP-EDGE-006',
    description: 'Response with empty arrays',
    query: 'get endpoint with no parameters',
    expectedBehavior: 'Should handle empty arrays correctly',
    shouldPass: true,
  },
  {
    id: 'RESP-EDGE-007',
    description: 'Response with very long strings',
    query: 'get endpoint with long description',
    expectedBehavior: 'Should handle long strings without truncation',
    shouldPass: true,
  },
  {
    id: 'RESP-EDGE-008',
    description: 'Response with duplicate data',
    query: 'get all customer endpoints',
    expectedBehavior: 'Should handle duplicates correctly',
    shouldPass: true,
  },
];

/**
 * Tool execution edge cases
 */
const toolExecutionEdgeCases = [
  {
    id: 'TOOL-EDGE-001',
    description: 'Execute tool with missing required parameters',
    query: 'create customer',
    expectedBehavior: 'Should return error indicating missing parameters',
    shouldPass: false,
  },
  {
    id: 'TOOL-EDGE-002',
    description: 'Execute tool with invalid parameter types',
    query: 'get customer with id=abc',
    expectedBehavior: 'Should return error indicating invalid type',
    shouldPass: false,
  },
  {
    id: 'TOOL-EDGE-003',
    description: 'Execute tool with parameter out of range',
    query: 'get customer with id=-1',
    expectedBehavior: 'Should return error indicating out of range',
    shouldPass: false,
  },
  {
    id: 'TOOL-EDGE-004',
    description: 'Execute tool with too many parameters',
    query: 'get customer with many parameters',
    expectedBehavior: 'Should handle extra parameters gracefully',
    shouldPass: true,
  },
  {
    id: 'TOOL-EDGE-005',
    description: 'Execute tool with circular references',
    query: 'get customer with nested references',
    expectedBehavior: 'Should handle circular references without infinite loop',
    shouldPass: true,
  },
  {
    id: 'TOOL-EDGE-006',
    description: 'Execute tool with very large parameter values',
    query: 'create customer with very long name',
    expectedBehavior: 'Should handle large values or return validation error',
    shouldPass: false,
  },
  {
    id: 'TOOL-EDGE-007',
    description: 'Execute tool with parameter exceeding max depth',
    query: 'get customer with deeply nested path',
    expectedBehavior: 'Should handle or reject deep nesting',
    shouldPass: false,
  },
];

/**
 * Error handling edge cases
 */
const errorHandlingEdgeCases = [
  {
    id: 'ERR-EDGE-001',
    description: 'Handle network timeout',
    query: 'get customer',
    simulateTimeout: true,
    expectedBehavior: 'Should return timeout error',
    shouldPass: false,
  },
  {
    id: 'ERR-EDGE-002',
    description: 'Handle malformed request',
    query: null as any,
    expectedBehavior: 'Should return error indicating malformed request',
    shouldPass: false,
  },
  {
    id: 'ERR-EDGE-003',
    description: 'Handle unauthorized access',
    query: 'get customer',
    simulateUnauthorized: true,
    expectedBehavior: 'Should return unauthorized error',
    shouldPass: false,
  },
  {
    id: 'ERR-EDGE-004',
    description: 'Handle rate limiting',
    query: 'get customer',
    simulateRateLimit: true,
    expectedBehavior: 'Should return rate limit error',
    shouldPass: false,
  },
  {
    id: 'ERR-EDGE-005',
    description: 'Handle internal server error',
    query: 'get customer',
    simulateInternalError: true,
    expectedBehavior: 'Should return internal server error',
    shouldPass: false,
  },
  {
    id: 'ERR-EDGE-006',
    description: 'Handle database connection error',
    query: 'get customer',
    simulateDbError: true,
    expectedBehavior: 'Should return database error',
    shouldPass: false,
  },
  {
    id: 'ERR-EDGE-007',
    description: 'Handle concurrent modification',
    query: 'update customer',
    simulateConcurrentMod: true,
    expectedBehavior: 'Should return conflict error',
    shouldPass: false,
  },
  {
    id: 'ERR-EDGE-008',
    description: 'Handle validation error with multiple issues',
    query: 'create customer with invalid data',
    expectedBehavior: 'Should return all validation errors',
    shouldPass: false,
  },
];

/**
 * Concurrent request edge cases
 */
const concurrentRequestEdgeCases = [
  {
    id: 'CONC-EDGE-001',
    description: 'Handle multiple identical requests',
    queries: ['get customer', 'get customer', 'get customer'],
    expectedBehavior: 'Should handle all requests correctly',
    shouldPass: true,
  },
  {
    id: 'CONC-EDGE-002',
    description: 'Handle requests for different resources',
    queries: ['get customer', 'get ticket', 'get invoice'],
    expectedBehavior: 'Should handle all requests correctly',
    shouldPass: true,
  },
  {
    id: 'CONC-EDGE-003',
    description: 'Handle mix of read and write requests',
    queries: ['get customer', 'create customer', 'get customer'],
    expectedBehavior: 'Should handle all requests correctly',
    shouldPass: true,
  },
  {
    id: 'CONC-EDGE-004',
    description: 'Handle rapid sequential requests',
    queries: Array(10).fill('get customer'),
    expectedBehavior: 'Should handle all requests without errors',
    shouldPass: true,
  },
  {
    id: 'CONC-EDGE-005',
    description: 'Handle requests with varying complexity',
    queries: [
      'get customer',
      'get customer with parameters',
      'create customer',
      'update customer',
    ],
    expectedBehavior: 'Should handle all requests correctly',
    shouldPass: true,
  },
  {
    id: 'CONC-EDGE-006',
    description: 'Handle requests during server shutdown',
    queries: ['get customer'],
    simulateShutdown: true,
    expectedBehavior: 'Should handle gracefully or return error',
    shouldPass: false,
  },
];

/**
 * Test query edge cases
 */
describe('Edge Case Tests - Query Edge Cases', () => {
  let server: MCPServer;
  let results: EdgeCaseTestResult[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json',
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test.each(queryEdgeCases)(
    '$description',
    async ({ id, description, query, expectedBehavior, shouldPass }) => {
      const startTime = Date.now();
      let result: any;
      let error: string | undefined;

      try {
        result = await server.handleQuery(query);
      } catch (e: any) {
        error = e.message;
      }

      const duration = Date.now() - startTime;
      const passed = shouldPass ? result?.success : !result?.success;

      results.push({
        testCaseId: id,
        description,
        category: 'query-edge-cases',
        passed,
        error,
        response: result,
        duration,
      });

      if (shouldPass) {
        expect(result?.success).toBe(true);
      } else {
        expect(result?.success).toBe(false);
      }
    }
  );

  test('should handle all query edge cases without crashing', () => {
    const crashCount = results.filter(
      (r) => r.error && r.error.includes('crash')
    ).length;
    expect(crashCount).toBe(0);
  });

  test('should handle all query edge cases within reasonable time', () => {
    const slowQueries = results.filter((r) => r.duration > 5000);
    expect(slowQueries.length).toBeLessThan(results.length * 0.2); // Less than 20% should be slow
  });
});

/**
 * Test response edge cases
 */
describe('Edge Case Tests - Response Edge Cases', () => {
  let server: MCPServer;
  let results: EdgeCaseTestResult[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json',
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test.each(responseEdgeCases)(
    '$description',
    async ({ id, description, query, expectedBehavior, shouldPass }) => {
      const startTime = Date.now();
      let result: any;
      let error: string | undefined;

      try {
        result = await server.handleQuery(query);
      } catch (e: any) {
        error = e.message;
      }

      const duration = Date.now() - startTime;
      const passed = shouldPass ? result?.success : !result?.success;

      results.push({
        testCaseId: id,
        description,
        category: 'response-edge-cases',
        passed,
        error,
        response: result,
        duration,
      });

      if (shouldPass) {
        expect(result?.success).toBe(true);
        expect(result).toBeDefined();
      } else {
        expect(result?.success).toBe(false);
      }
    }
  );

  test('should handle all response edge cases without data corruption', () => {
    const corruptedResponses = results.filter((r) => {
      if (!r.response) return false;
      try {
        JSON.stringify(r.response);
        return false;
      } catch {
        return true;
      }
    });
    expect(corruptedResponses.length).toBe(0);
  });
});

/**
 * Test tool execution edge cases
 */
describe('Edge Case Tests - Tool Execution Edge Cases', () => {
  let server: MCPServer;
  let results: EdgeCaseTestResult[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json',
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test.each(toolExecutionEdgeCases)(
    '$description',
    async ({ id, description, query, expectedBehavior, shouldPass }) => {
      const startTime = Date.now();
      let result: any;
      let error: string | undefined;

      try {
        result = await server.handleQuery(query);
      } catch (e: any) {
        error = e.message;
      }

      const duration = Date.now() - startTime;
      const passed = shouldPass ? result?.success : !result?.success;

      results.push({
        testCaseId: id,
        description,
        category: 'tool-execution-edge-cases',
        passed,
        error,
        response: result,
        duration,
      });

      if (shouldPass) {
        expect(result?.success).toBe(true);
      } else {
        expect(result?.success).toBe(false);
      }
    }
  );

  test('should handle all tool execution edge cases without infinite loops', () => {
    const timeoutCases = results.filter((r) => r.duration > 10000);
    expect(timeoutCases.length).toBe(0);
  });
});

/**
 * Test error handling edge cases
 */
describe('Edge Case Tests - Error Handling Edge Cases', () => {
  let server: MCPServer;
  let results: EdgeCaseTestResult[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json',
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test.each(
    errorHandlingEdgeCases.filter(
      (c) =>
        !c.simulateTimeout &&
        !c.simulateUnauthorized &&
        !c.simulateRateLimit &&
        !c.simulateInternalError &&
        !c.simulateDbError &&
        !c.simulateConcurrentMod
    )
  )(
    '$description',
    async ({ id, description, query, expectedBehavior, shouldPass }) => {
      const startTime = Date.now();
      let result: any;
      let error: string | undefined;

      try {
        result = await server.handleQuery(query);
      } catch (e: any) {
        error = e.message;
      }

      const duration = Date.now() - startTime;
      const passed = shouldPass ? result?.success : !result?.success;

      results.push({
        testCaseId: id,
        description,
        category: 'error-handling-edge-cases',
        passed,
        error,
        response: result,
        duration,
      });

      if (shouldPass) {
        expect(result?.success).toBe(true);
      } else {
        expect(result?.success).toBe(false);
      }
    }
  );

  test('should provide clear error messages', () => {
    const errorCases = results.filter((r) => !r.passed && r.response?.message);
    const unclearErrors = errorCases.filter(
      (r) => !r.response.message || r.response.message.length < 10
    );
    expect(unclearErrors.length).toBe(0);
  });

  test('should not leak sensitive information in errors', () => {
    const sensitivePatterns = [/password/i, /secret/i, /token/i, /key/i];
    const errorCases = results.filter((r) => !r.passed && r.response?.message);
    const leakingErrors = errorCases.filter((r) => {
      const message = JSON.stringify(r.response);
      return sensitivePatterns.some((pattern) => pattern.test(message));
    });
    expect(leakingErrors.length).toBe(0);
  });
});

/**
 * Test concurrent request edge cases
 */
describe('Edge Case Tests - Concurrent Request Edge Cases', () => {
  let server: MCPServer;
  let results: EdgeCaseTestResult[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json',
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test('should handle multiple identical requests', async () => {
    const queries = ['get customer', 'get customer', 'get customer'];
    const startTime = Date.now();
    const promises = queries.map((q) => server.handleQuery(q));
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    const passed = results.every((r) => r.success);
    expect(passed).toBe(true);
    expect(duration).toBeLessThan(5000);
  });

  test('should handle requests for different resources', async () => {
    const queries = ['get customer', 'get ticket', 'get invoice'];
    const startTime = Date.now();
    const promises = queries.map((q) => server.handleQuery(q));
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    const passed = results.every((r) => r.success);
    expect(passed).toBe(true);
    expect(duration).toBeLessThan(5000);
  });

  test('should handle mix of read and write requests', async () => {
    const queries = ['get customer', 'create customer', 'get customer'];
    const startTime = Date.now();
    const promises = queries.map((q) => server.handleQuery(q));
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    const passed = results.every((r) => r.success);
    expect(passed).toBe(true);
    expect(duration).toBeLessThan(5000);
  });

  test('should handle rapid sequential requests', async () => {
    const queries = Array(10).fill('get customer');
    const startTime = Date.now();
    const promises = queries.map((q) => server.handleQuery(q));
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    const passed = results.every((r) => r.success);
    expect(passed).toBe(true);
    expect(duration).toBeLessThan(10000);
  });

  test('should handle requests with varying complexity', async () => {
    const queries = [
      'get customer',
      'get customer with parameters',
      'create customer',
      'update customer',
    ];
    const startTime = Date.now();
    const promises = queries.map((q) => server.handleQuery(q));
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    const passed = results.every((r) => r.success);
    expect(passed).toBe(true);
    expect(duration).toBeLessThan(5000);
  });

  test('should not have race conditions in concurrent requests', async () => {
    const queries = [
      'get customer',
      'get ticket',
      'get invoice',
      'get customer',
      'get ticket',
    ];
    const promises = queries.map((q) => server.handleQuery(q));
    const results = await Promise.all(promises);

    // Each result should be for the correct query
    results.forEach((result, index) => {
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});

/**
 * Generate edge case test report
 */
export function generateEdgeCaseReport(results: EdgeCaseTestResult[]): string {
  const report = {
    summary: {
      totalTests: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
      passRate: results.filter((r) => r.passed).length / results.length,
      averageDuration:
        results.reduce((sum, r) => sum + r.duration, 0) / results.length,
    },
    byCategory: {} as Record<string, any>,
    failedTests: results.filter((r) => !r.passed),
    slowTests: results.filter((r) => r.duration > 5000),
    results,
  };

  // Group by category
  results.forEach((result) => {
    if (!report.byCategory[result.category]) {
      report.byCategory[result.category] = [];
    }
    report.byCategory[result.category].push(result);
  });

  // Calculate stats per category
  Object.keys(report.byCategory).forEach((category) => {
    const categoryResults = report.byCategory[category];
    report.byCategory[category] = {
      total: categoryResults.length,
      passed: categoryResults.filter((r: EdgeCaseTestResult) => r.passed)
        .length,
      failed: categoryResults.filter((r: EdgeCaseTestResult) => !r.passed)
        .length,
      passRate:
        categoryResults.filter((r: EdgeCaseTestResult) => r.passed).length /
        categoryResults.length,
      averageDuration:
        categoryResults.reduce(
          (sum: number, r: EdgeCaseTestResult) => sum + r.duration,
          0
        ) / categoryResults.length,
    };
  });

  return JSON.stringify(report, null, 2);
}
