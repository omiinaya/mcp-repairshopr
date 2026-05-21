# MCP RepairShopr Testing Guide

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Coverage](#test-coverage)
6. [Performance Testing](#performance-testing)
7. [Integration Testing](#integration-testing)
8. [Accuracy Testing](#accuracy-testing)

## Overview

This guide covers testing practices for the MCP RepairShopr project. We use Jest as our testing framework and follow a comprehensive testing strategy.

### Testing Philosophy

- **Test Early**: Write tests alongside code
- **Test Often**: Run tests frequently during development
- **Test Thoroughly**: Cover happy paths, edge cases, and error conditions
- **Test Fast**: Keep tests fast and reliable
- **Test Meaningfully**: Focus on behavior, not implementation

## Test Structure

### Directory Organization

```
tests/
├── unit/              # Unit tests for individual components
│   ├── cache.test.ts
│   ├── configuration.test.ts
│   ├── endpoint.test.ts
│   └── ...
├── integration/       # Integration tests for component interactions
│   ├── mcp-protocol.test.ts
│   ├── search-retrieval.test.ts
│   └── ...
├── performance/       # Performance and load tests
│   ├── benchmarks.test.ts
│   └── load-test.test.ts
├── accuracy/          # Accuracy tests for search and retrieval
│   ├── search-relevance.test.ts
│   └── ...
├── uat/              # User acceptance tests
│   ├── sample-queries.test.ts
│   └── ...
└── utils/            # Test utilities and helpers
    ├── test-helpers.ts
    └── data-generators.ts
```

### Test Naming Conventions

- Unit tests: `[component].test.ts`
- Integration tests: `[feature].test.ts`
- Performance tests: `[metric].test.ts`
- Test files should be co-located with source files when possible

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Performance tests only
npm run test:performance

# Accuracy tests only
npm run test:accuracy

# UAT tests only
npm run test:uat
```

### Watch Mode

Run tests in watch mode for continuous testing:

```bash
npm run test:watch
```

### Coverage Report

Generate test coverage report:

```bash
npm run test:coverage
```

The coverage report is generated in `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view the report.

### Run Specific Test File

```bash
npm test -- tests/unit/cache.test.ts
```

### Run Specific Test

```bash
npm test -- -t "should return cached value"
```

## Writing Tests

### Unit Tests

Unit tests test individual functions and classes in isolation.

#### Example: Cache Test

```typescript
import { Cache } from '../../src/cache/cache';

describe('Cache', () => {
  let cache: Cache<any>;

  beforeEach(() => {
    cache = new Cache({
      maxSize: 1024,
      defaultTTL: 60000,
      maxEntries: 100,
      enableWarming: false,
    });
  });

  afterEach(() => {
    cache.clear();
  });

  describe('get', () => {
    it('should return cached value', () => {
      cache.set('key', 'value');
      expect(cache.get('key')).toBe('value');
    });

    it('should return undefined for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should return undefined for expired entry', () => {
      cache.set('key', 'value', 1); // 1ms TTL
      setTimeout(() => {
        expect(cache.get('key')).toBeUndefined();
      }, 10);
    });
  });

  describe('set', () => {
    it('should set value with default TTL', () => {
      cache.set('key', 'value');
      expect(cache.get('key')).toBe('value');
    });

    it('should set value with custom TTL', () => {
      cache.set('key', 'value', 1000);
      expect(cache.get('key')).toBe('value');
    });

    it('should evict oldest entry when cache is full', () => {
      const smallCache = new Cache({
        maxSize: 100,
        defaultTTL: 60000,
        maxEntries: 2,
        enableWarming: false,
      });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3'); // Should evict key1

      expect(smallCache.get('key1')).toBeUndefined();
      expect(smallCache.get('key2')).toBe('value2');
      expect(smallCache.get('key3')).toBe('value3');
    });
  });
});
```

### Integration Tests

Integration tests test how components work together.

#### Example: Search Integration Test

```typescript
import { searchApiDocs } from '../../src/tools/search';
import { VectorStore } from '../../src/indexer/vector';
import { MetadataIndex } from '../../src/parser/metadata';
import { mockVectorStore, mockMetadataIndex } from '../fixtures';

describe('Search Integration', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;

  beforeEach(() => {
    vectorStore = mockVectorStore();
    metadataIndex = mockMetadataIndex();
  });

  it('should search and return results', async () => {
    const results = await searchApiDocs(
      {
        query: 'customer',
        limit: 5,
      },
      vectorStore,
      metadataIndex
    );

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('endpoint');
    expect(results[0]).toHaveProperty('score');
  });

  it('should filter by resource', async () => {
    const results = await searchApiDocs(
      {
        query: 'customer',
        resource: 'customers',
        limit: 5,
      },
      vectorStore,
      metadataIndex
    );

    results.forEach((result) => {
      expect(result.endpoint.resource).toBe('customers');
    });
  });
});
```

### Performance Tests

Performance tests measure execution time and resource usage.

#### Example: Performance Test

```typescript
import { searchApiDocs } from '../../src/tools/search';
import { VectorStore } from '../../src/indexer/vector';
import { MetadataIndex } from '../../src/parser/metadata';

describe('Search Performance', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;

  beforeEach(() => {
    vectorStore = new VectorStore();
    metadataIndex = new MetadataIndex();
    // Initialize with test data
  });

  it('should complete search within 100ms', async () => {
    const start = Date.now();
    await searchApiDocs(
      {
        query: 'customer',
        limit: 5,
      },
      vectorStore,
      metadataIndex
    );
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  });

  it('should handle 100 concurrent requests', async () => {
    const requests = Array(100)
      .fill(null)
      .map(() =>
        searchApiDocs(
          {
            query: 'customer',
            limit: 5,
          },
          vectorStore,
          metadataIndex
        )
      );

    const start = Date.now();
    await Promise.all(requests);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000); // 50ms per request average
  });
});
```

### Accuracy Tests

Accuracy tests verify the correctness of search and retrieval results.

#### Example: Accuracy Test

```typescript
import { searchApiDocs } from '../../src/tools/search';

describe('Search Accuracy', () => {
  it('should return relevant results for customer query', async () => {
    const results = await searchApiDocs(
      {
        query: 'create new customer',
        limit: 5,
      },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);

    // Check that results are relevant
    results.forEach((result) => {
      expect(
        result.endpoint.resource.toLowerCase().includes('customer') ||
          result.endpoint.description.toLowerCase().includes('customer')
      ).toBe(true);
    });
  });

  it('should rank results by relevance', async () => {
    const results = await searchApiDocs(
      {
        query: 'customer',
        limit: 5,
      },
      vectorStore,
      metadataIndex
    );

    // Results should be sorted by score (descending)
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });
});
```

## Test Coverage

### Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### View Coverage Report

```bash
npm run test:coverage
```

Open `coverage/lcov-report/index.html` in a browser to view the detailed coverage report.

### Coverage Thresholds

Configure coverage thresholds in `jest.config.js`:

```javascript
collectCoverageFrom: [
  'src/**/*.ts',
  '!src/**/*.d.ts',
  '!src/index.ts'
],
coverageThreshold: {
  global: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80
  }
}
```

## Performance Testing

### Benchmark Tests

Benchmark tests measure the performance of critical operations.

```typescript
describe('Cache Benchmarks', () => {
  it('should handle 10,000 get operations per second', () => {
    const cache = new Cache({
      maxSize: 1024 * 1024,
      defaultTTL: 60000,
      maxEntries: 10000,
      enableWarming: false,
    });

    // Pre-populate cache
    for (let i = 0; i < 10000; i++) {
      cache.set(`key${i}`, `value${i}`);
    }

    const start = Date.now();
    for (let i = 0; i < 10000; i++) {
      cache.get(`key${i}`);
    }
    const duration = Date.now() - start;

    const opsPerSecond = (10000 / duration) * 1000;
    expect(opsPerSecond).toBeGreaterThan(10000);
  });
});
```

### Load Tests

Load tests test the system under high load.

```typescript
describe('Load Tests', () => {
  it('should handle 1000 concurrent search requests', async () => {
    const requests = Array(1000)
      .fill(null)
      .map((_, i) =>
        searchApiDocs(
          {
            query: `test query ${i % 10}`,
            limit: 5,
          },
          vectorStore,
          metadataIndex
        )
      );

    const start = Date.now();
    const results = await Promise.all(requests);
    const duration = Date.now() - start;

    expect(results.length).toBe(1000);
    expect(duration).toBeLessThan(10000); // 10 seconds for 1000 requests
  });
});
```

## Integration Testing

### MCP Protocol Tests

Test MCP protocol compliance.

```typescript
describe('MCP Protocol', () => {
  it('should handle tool registration', async () => {
    const server = new MCPServer();
    await server.start();

    const tools = server.getTools();
    expect(tools.length).toBeGreaterThan(0);

    await server.stop();
  });

  it('should handle tool invocation', async () => {
    const server = new MCPServer();
    await server.start();

    const result = await server.invokeTool('search_api_docs', {
      query: 'customer',
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    await server.stop();
  });
});
```

### End-to-End Tests

Test complete workflows.

```typescript
describe('End-to-End Workflows', () => {
  it('should complete search workflow', async () => {
    // 1. Search for endpoint
    const searchResults = await searchApiDocs(
      {
        query: 'create customer',
        limit: 1,
      },
      vectorStore,
      metadataIndex
    );

    expect(searchResults.length).toBeGreaterThan(0);

    // 2. Get endpoint details
    const endpoint = getEndpoint(
      {
        path: searchResults[0].endpoint.path,
        method: searchResults[0].endpoint.method,
      },
      metadataIndex
    );

    expect(endpoint).toBeDefined();

    // 3. Get parameters
    const parameters = getParameters(
      {
        endpointPath: searchResults[0].endpoint.path,
        method: searchResults[0].endpoint.method,
      },
      metadataIndex
    );

    expect(parameters).toBeDefined();
    expect(parameters.parameters.length).toBeGreaterThan(0);
  });
});
```

## Accuracy Testing

### Search Relevance Tests

Test that search results are relevant to the query.

```typescript
describe('Search Relevance', () => {
  const testCases = [
    { query: 'create customer', expectedResource: 'customers' },
    { query: 'list tickets', expectedResource: 'tickets' },
    { query: 'update invoice', expectedResource: 'invoices' },
  ];

  testCases.forEach(({ query, expectedResource }) => {
    it(`should return relevant results for "${query}"`, async () => {
      const results = await searchApiDocs(
        {
          query,
          limit: 5,
        },
        vectorStore,
        metadataIndex
      );

      expect(results.length).toBeGreaterThan(0);

      const hasExpectedResource = results.some(
        (result) => result.endpoint.resource === expectedResource
      );

      expect(hasExpectedResource).toBe(true);
    });
  });
});
```

### Parameter Extraction Tests

Test that parameters are correctly extracted.

```typescript
describe('Parameter Extraction', () => {
  it('should extract all parameters', async () => {
    const parameters = getParameters(
      {
        endpointPath: '/customers',
        method: 'POST',
      },
      metadataIndex
    );

    expect(parameters).toBeDefined();
    expect(parameters.totalCount).toBeGreaterThan(0);
  });

  it('should identify required parameters', async () => {
    const parameters = getParameters(
      {
        endpointPath: '/customers',
        method: 'POST',
      },
      metadataIndex
    );

    const requiredParams = parameters.parameters.filter((p) => p.required);
    expect(requiredParams.length).toBeGreaterThan(0);
  });
});
```

## Test Utilities

### Mock Data Generators

```typescript
// tests/utils/data-generators.ts
export function generateMockEndpoint(overrides = {}): Endpoint {
  return {
    resource: 'customers',
    operation: 'create',
    description: 'Create a new customer',
    method: 'POST',
    path: '/customers',
    permission: 'customer.write',
    parameters: [],
    responses: [],
    ...overrides,
  };
}

export function generateMockSearchResults(count: number): SearchResult[] {
  return Array(count)
    .fill(null)
    .map((_, i) => ({
      endpoint: generateMockEndpoint({ resource: `resource${i}` }),
      score: 1 - i * 0.1,
      context: `Context for result ${i}`,
      matchType: 'semantic' as const,
    }));
}
```

### Test Helpers

```typescript
// tests/utils/test-helpers.ts
export async function waitForCondition(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

export function createMockLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
}
```

## Best Practices

### 1. Test Independence

Each test should be independent and not rely on other tests.

```typescript
// Good
describe('Cache', () => {
  it('should set value', () => {
    const cache = new Cache();
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('should get value', () => {
    const cache = new Cache();
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });
});

// Bad - tests depend on each other
describe('Cache', () => {
  let cache: Cache;

  it('should set value', () => {
    cache = new Cache();
    cache.set('key', 'value');
  });

  it('should get value', () => {
    expect(cache.get('key')).toBe('value'); // Depends on previous test
  });
});
```

### 2. Use Descriptive Test Names

Test names should clearly describe what is being tested.

```typescript
// Good
it('should return cached value when key exists', () => {});

// Bad
it('test1', () => {});
```

### 3. Test Edge Cases

Don't just test the happy path.

```typescript
describe('Cache.get', () => {
  it('should return value when key exists', () => {});
  it('should return undefined when key does not exist', () => {});
  it('should return undefined when entry is expired', () => {});
  it('should handle null values', () => {});
  it('should handle undefined values', () => {});
});
```

### 4. Mock External Dependencies

Mock external dependencies to make tests fast and reliable.

```typescript
// Good
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Bad - tests depend on external service
it('should call external API', async () => {
  const result = await fetch('https://api.example.com');
  expect(result).toBeDefined();
});
```

### 5. Keep Tests Fast

Tests should run quickly. Avoid:

- Long delays
- Large data sets
- Complex setup

```typescript
// Good
it('should process 100 items', () => {
  const items = Array(100)
    .fill(null)
    .map((_, i) => i);
  const result = processItems(items);
  expect(result.length).toBe(100);
});

// Bad - too slow
it('should process 1,000,000 items', () => {
  const items = Array(1000000)
    .fill(null)
    .map((_, i) => i);
  const result = processItems(items);
  expect(result.length).toBe(1000000);
});
```

## Troubleshooting

### Tests Failing Intermittently

If tests fail intermittently:

- Check for race conditions
- Ensure proper cleanup in `afterEach`
- Use proper async/await handling
- Avoid relying on timing

### Tests Timing Out

If tests timeout:

- Increase timeout in test configuration
- Check for infinite loops
- Verify async operations complete
- Profile slow tests

### Coverage Not Increasing

If coverage isn't increasing:

- Check that test files are being included
- Verify code paths are being executed
- Review coverage report for uncovered lines
- Add tests for edge cases

For more information, see:

- [Development Setup Guide](./DEVELOPMENT_SETUP.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Contribution Guide](./CONTRIBUTING.md)
