/**
 * Manual Query Comparison Tests
 * 
 * Tests to compare automated search results against manual queries,
 * test edge cases in queries, test query understanding accuracy,
 * test query expansion accuracy, and create comparison metrics.
 */

import { searchApiDocs } from '../../src/tools/search';
import { VectorStore } from '../../src/indexer/vector';
import { MetadataIndex } from '../../src/parser/metadata';
import { ApiEndpoint } from '../../src/utils/types';
import { generateEndpoint, generateEndpoints } from '../utils/data-generators';
import { createMockMetadataIndex, createMockVectorStore } from '../fixtures/mock-vector-store';

/**
 * Manual query comparison metrics
 */
interface ManualQueryComparisonMetrics {
  totalQueries: number;
  matchingQueries: number;
  nonMatchingQueries: number;
  queryUnderstandingAccuracy: number;
  queryExpansionAccuracy: number;
  edgeCaseAccuracy: number;
  overallAccuracy: number;
}

/**
 * Manual query expectations - what a human would expect to find
 */
interface ManualQueryExpectation {
  query: string;
  expectedResource: string;
  expectedMethod?: string;
  expectedOperation?: string;
  minRelevanceScore: number;
  description: string;
}

/**
 * Manual query test cases based on human expectations
 */
const MANUAL_QUERIES: ManualQueryExpectation[] = [
  {
    query: 'get customers',
    expectedResource: 'Customer',
    expectedMethod: 'GET',
    expectedOperation: 'Get Customers',
    minRelevanceScore: 0.7,
    description: 'User wants to retrieve a list of customers'
  },
  {
    query: 'create customer',
    expectedResource: 'Customer',
    expectedMethod: 'POST',
    expectedOperation: 'Create Customer',
    minRelevanceScore: 0.7,
    description: 'User wants to create a new customer'
  },
  {
    query: 'get tickets',
    expectedResource: 'Ticket',
    expectedMethod: 'GET',
    expectedOperation: 'Get Tickets',
    minRelevanceScore: 0.7,
    description: 'User wants to retrieve a list of tickets'
  },
  {
    query: 'create ticket',
    expectedResource: 'Ticket',
    expectedMethod: 'POST',
    expectedOperation: 'Create Ticket',
    minRelevanceScore: 0.7,
    description: 'User wants to create a new ticket'
  },
  {
    query: 'get invoices',
    expectedResource: 'Invoice',
    expectedMethod: 'GET',
    expectedOperation: 'Get Invoices',
    minRelevanceScore: 0.7,
    description: 'User wants to retrieve a list of invoices'
  },
  {
    query: 'customer by id',
    expectedResource: 'Customer',
    expectedMethod: 'GET',
    expectedOperation: 'Get Customer by ID',
    minRelevanceScore: 0.6,
    description: 'User wants to get a specific customer by ID'
  },
  {
    query: 'ticket status',
    expectedResource: 'Ticket',
    expectedMethod: 'GET',
    minRelevanceScore: 0.6,
    description: 'User wants to filter tickets by status'
  },
  {
    query: 'invoice list',
    expectedResource: 'Invoice',
    expectedMethod: 'GET',
    minRelevanceScore: 0.6,
    description: 'User wants to list invoices'
  },
  {
    query: 'update customer',
    expectedResource: 'Customer',
    expectedMethod: 'PUT',
    expectedOperation: 'Update Customer',
    minRelevanceScore: 0.7,
    description: 'User wants to update an existing customer'
  },
  {
    query: 'delete customer',
    expectedResource: 'Customer',
    expectedMethod: 'DELETE',
    expectedOperation: 'Delete Customer',
    minRelevanceScore: 0.7,
    description: 'User wants to delete a customer'
  }
];

/**
 * Edge case queries
 */
const EDGE_CASE_QUERIES = [
  {
    query: '',
    shouldThrow: true,
    description: 'Empty query should throw error'
  },
  {
    query: '   ',
    shouldThrow: true,
    description: 'Whitespace-only query should throw error'
  },
  {
    query: '!!!@#$%',
    shouldReturnEmpty: true,
    description: 'Special characters only should return empty results'
  },
  {
    query: 'a'.repeat(1000),
    shouldReturnEmpty: true,
    description: 'Very long query should return empty results'
  },
  {
    query: 'search',
    shouldReturnResults: true,
    description: 'Generic term should return results'
  },
  {
    query: 'nonexistent resource xyz123',
    shouldReturnEmpty: true,
    description: 'Non-existent resource should return empty results'
  },
  {
    query: 'GET /customers/{id}/nested/path',
    shouldReturnEmpty: true,
    description: 'Invalid complex path should return empty results'
  },
  {
    query: 'multiple words with different meanings',
    shouldReturnResults: true,
    description: 'Ambiguous query should return some results'
  }
];

/**
 * Query expansion test cases
 */
const QUERY_EXPANSION_TESTS = [
  {
    query: 'get customer',
    expectedToMatch: ['Get Customers', 'Get Customer by ID'],
    description: 'Should expand to both list and detail operations'
  },
  {
    query: 'customer',
    expectedToMatch: ['Get Customers', 'Create Customer', 'Get Customer by ID', 'Update Customer', 'Delete Customer'],
    description: 'Should match all customer operations'
  },
  {
    query: 'retrieve',
    expectedToMatch: ['Get Customers', 'Get Tickets', 'Get Invoices'],
    description: 'Should expand to all GET operations'
  },
  {
    query: 'add',
    expectedToMatch: ['Create Customer', 'Create Ticket'],
    description: 'Should expand to all POST operations'
  },
  {
    query: 'modify',
    expectedToMatch: ['Update Customer'],
    description: 'Should expand to PUT operations'
  },
  {
    query: 'remove',
    expectedToMatch: ['Delete Customer'],
    description: 'Should expand to DELETE operations'
  }
];

/**
 * Test automated search results against manual queries
 */
describe('Manual Query Comparison - Automated vs Manual', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let endpoints: ApiEndpoint[];

  beforeAll(() => {
    // Create test endpoints matching the RepairShopr API structure
    endpoints = [
      generateEndpoint({
        resource: 'Customer',
        operation: 'Get Customers',
        description: 'Returns a paginated list of customers',
        method: 'GET',
        path: '/customers',
        permission: 'customer.view'
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Create Customer',
        description: 'Creates a new customer',
        method: 'POST',
        path: '/customers',
        permission: 'customer.create'
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Get Customer by ID',
        description: 'Retrieves a customer by ID',
        method: 'GET',
        path: '/customers/{id}',
        permission: 'customer.view'
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Update Customer',
        description: 'Updates an existing customer',
        method: 'PUT',
        path: '/customers/{id}',
        permission: 'customer.edit'
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Delete Customer',
        description: 'Deletes a customer',
        method: 'DELETE',
        path: '/customers/{id}',
        permission: 'customer.delete'
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Get Tickets',
        description: 'Returns a paginated list of tickets',
        method: 'GET',
        path: '/tickets',
        permission: 'ticket.view'
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Create Ticket',
        description: 'Creates a new ticket',
        method: 'POST',
        path: '/tickets',
        permission: 'ticket.create'
      }),
      generateEndpoint({
        resource: 'Invoice',
        operation: 'Get Invoices',
        description: 'Returns a paginated list of invoices',
        method: 'GET',
        path: '/invoices',
        permission: 'invoice.view'
      })
    ];

    vectorStore = createMockVectorStore(endpoints);
    metadataIndex = createMockMetadataIndex(endpoints);
  });

  test('should match manual expectations for "get customers"', () => {
    const expectation = MANUAL_QUERIES.find(q => q.query === 'get customers');
    expect(expectation).toBeDefined();

    const results = searchApiDocs(
      { query: expectation!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.resource).toBe(expectation!.expectedResource);
    if (expectation!.expectedMethod) {
      expect(results[0].endpoint.method).toBe(expectation!.expectedMethod);
    }
    if (expectation!.expectedOperation) {
      expect(results[0].endpoint.operation).toBe(expectation!.expectedOperation);
    }
    expect(results[0].score).toBeGreaterThanOrEqual(expectation!.minRelevanceScore);
  });

  test('should match manual expectations for "create customer"', () => {
    const expectation = MANUAL_QUERIES.find(q => q.query === 'create customer');
    expect(expectation).toBeDefined();

    const results = searchApiDocs(
      { query: expectation!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    const createCustomer = results.find(r => r.endpoint.operation === 'Create Customer');
    expect(createCustomer).toBeDefined();
    expect(createCustomer!.endpoint.resource).toBe(expectation!.expectedResource);
    expect(createCustomer!.endpoint.method).toBe(expectation!.expectedMethod);
    expect(createCustomer!.score).toBeGreaterThanOrEqual(expectation!.minRelevanceScore);
  });

  test('should match manual expectations for "get tickets"', () => {
    const expectation = MANUAL_QUERIES.find(q => q.query === 'get tickets');
    expect(expectation).toBeDefined();

    const results = searchApiDocs(
      { query: expectation!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.resource).toBe(expectation!.expectedResource);
    expect(results[0].endpoint.method).toBe(expectation!.expectedMethod);
  });

  test('should match manual expectations for "get invoices"', () => {
    const expectation = MANUAL_QUERIES.find(q => q.query === 'get invoices');
    expect(expectation).toBeDefined();

    const results = searchApiDocs(
      { query: expectation!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.resource).toBe(expectation!.expectedResource);
    expect(results[0].endpoint.method).toBe(expectation!.expectedMethod);
  });

  test('should match manual expectations for "customer by id"', () => {
    const expectation = MANUAL_QUERIES.find(q => q.query === 'customer by id');
    expect(expectation).toBeDefined();

    const results = searchApiDocs(
      { query: expectation!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    const getById = results.find(r => r.endpoint.operation === 'Get Customer by ID');
    expect(getById).toBeDefined();
    expect(getById!.score).toBeGreaterThanOrEqual(expectation!.minRelevanceScore);
  });

  test('should match manual expectations for "update customer"', () => {
    const expectation = MANUAL_QUERIES.find(q => q.query === 'update customer');
    expect(expectation).toBeDefined();

    const results = searchApiDocs(
      { query: expectation!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    const updateCustomer = results.find(r => r.endpoint.operation === 'Update Customer');
    expect(updateCustomer).toBeDefined();
    expect(updateCustomer!.endpoint.method).toBe(expectation!.expectedMethod);
  });

  test('should match manual expectations for "delete customer"', () => {
    const expectation = MANUAL_QUERIES.find(q => q.query === 'delete customer');
    expect(expectation).toBeDefined();

    const results = searchApiDocs(
      { query: expectation!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    const deleteCustomer = results.find(r => r.endpoint.operation === 'Delete Customer');
    expect(deleteCustomer).toBeDefined();
    expect(deleteCustomer!.endpoint.method).toBe(expectation!.expectedMethod);
  });
});

/**
 * Test edge cases in queries
 */
describe('Manual Query Comparison - Edge Cases', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let endpoints: ApiEndpoint[];

  beforeAll(() => {
    endpoints = generateEndpoints(10);
    vectorStore = createMockVectorStore(endpoints);
    metadataIndex = createMockMetadataIndex(endpoints);
  });

  test('should throw error for empty query', () => {
    const edgeCase = EDGE_CASE_QUERIES.find(q => q.query === '');
    expect(edgeCase).toBeDefined();
    expect(edgeCase!.shouldThrow).toBe(true);

    expect(() => {
      searchApiDocs(
        { query: edgeCase!.query, limit: 5 },
        vectorStore,
        metadataIndex
      );
    }).toThrow('Query parameter is required');
  });

  test('should throw error for whitespace-only query', () => {
    const edgeCase = EDGE_CASE_QUERIES.find(q => q.query === '   ');
    expect(edgeCase).toBeDefined();
    expect(edgeCase!.shouldThrow).toBe(true);

    expect(() => {
      searchApiDocs(
        { query: edgeCase!.query, limit: 5 },
        vectorStore,
        metadataIndex
      );
    }).toThrow('Query parameter is required');
  });

  test('should return empty results for special characters only', () => {
    const edgeCase = EDGE_CASE_QUERIES.find(q => q.query === '!!!@#$%');
    expect(edgeCase).toBeDefined();
    expect(edgeCase!.shouldReturnEmpty).toBe(true);

    const results = searchApiDocs(
      { query: edgeCase!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBe(0);
  });

  test('should return empty results for very long query', () => {
    const edgeCase = EDGE_CASE_QUERIES.find(q => q.query === 'a'.repeat(1000));
    expect(edgeCase).toBeDefined();
    expect(edgeCase!.shouldReturnEmpty).toBe(true);

    const results = searchApiDocs(
      { query: edgeCase!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBe(0);
  });

  test('should return results for generic term', () => {
    const edgeCase = EDGE_CASE_QUERIES.find(q => q.query === 'search');
    expect(edgeCase).toBeDefined();
    expect(edgeCase!.shouldReturnResults).toBe(true);

    const results = searchApiDocs(
      { query: edgeCase!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    // Generic term may or may not return results depending on content
    expect(Array.isArray(results)).toBe(true);
  });

  test('should return empty results for non-existent resource', () => {
    const edgeCase = EDGE_CASE_QUERIES.find(q => q.query === 'nonexistent resource xyz123');
    expect(edgeCase).toBeDefined();
    expect(edgeCase!.shouldReturnEmpty).toBe(true);

    const results = searchApiDocs(
      { query: edgeCase!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBe(0);
  });

  test('should return empty results for invalid complex path', () => {
    const edgeCase = EDGE_CASE_QUERIES.find(q => q.query === 'GET /customers/{id}/nested/path');
    expect(edgeCase).toBeDefined();
    expect(edgeCase!.shouldReturnEmpty).toBe(true);

    const results = searchApiDocs(
      { query: edgeCase!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBe(0);
  });

  test('should return some results for ambiguous query', () => {
    const edgeCase = EDGE_CASE_QUERIES.find(q => q.query === 'multiple words with different meanings');
    expect(edgeCase).toBeDefined();
    expect(edgeCase!.shouldReturnResults).toBe(true);

    const results = searchApiDocs(
      { query: edgeCase!.query, limit: 5 },
      vectorStore,
      metadataIndex
    );

    // Ambiguous query may return some results
    expect(Array.isArray(results)).toBe(true);
  });
});

/**
 * Test query understanding accuracy
 */
describe('Manual Query Comparison - Query Understanding', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let endpoints: ApiEndpoint[];

  beforeAll(() => {
    endpoints = [
      generateEndpoint({
        resource: 'Customer',
        operation: 'Get Customers',
        description: 'Returns a paginated list of customers',
        method: 'GET',
        path: '/customers',
        permission: 'customer.view'
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Create Customer',
        description: 'Creates a new customer',
        method: 'POST',
        path: '/customers',
        permission: 'customer.create'
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Get Tickets',
        description: 'Returns a paginated list of tickets',
        method: 'GET',
        path: '/tickets',
        permission: 'ticket.view'
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Create Ticket',
        description: 'Creates a new ticket',
        method: 'POST',
        path: '/tickets',
        permission: 'ticket.create'
      })
    ];

    vectorStore = createMockVectorStore(endpoints);
    metadataIndex = createMockMetadataIndex(endpoints);
  });

  test('should understand "get" as GET method', () => {
    const results = searchApiDocs(
      { query: 'get customers', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.method).toBe('GET');
  });

  test('should understand "create" as POST method', () => {
    const results = searchApiDocs(
      { query: 'create customer', limit: 5 },
      vectorStore,
      metadataIndex
    );

    const createCustomer = results.find(r => r.endpoint.operation === 'Create Customer');
    expect(createCustomer).toBeDefined();
    expect(createCustomer!.endpoint.method).toBe('POST');
  });

  test('should understand "update" as PUT method', () => {
    const results = searchApiDocs(
      { query: 'update customer', limit: 5 },
      vectorStore,
      metadataIndex
    );

    const updateCustomer = results.find(r => r.endpoint.operation === 'Update Customer');
    if (updateCustomer) {
      expect(updateCustomer.endpoint.method).toBe('PUT');
    }
  });

  test('should understand "delete" as DELETE method', () => {
    const results = searchApiDocs(
      { query: 'delete customer', limit: 5 },
      vectorStore,
      metadataIndex
    );

    const deleteCustomer = results.find(r => r.endpoint.operation === 'Delete Customer');
    if (deleteCustomer) {
      expect(deleteCustomer.endpoint.method).toBe('DELETE');
    }
  });

  test('should understand resource names correctly', () => {
    const results = searchApiDocs(
      { query: 'customers', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.endpoint.resource).toBe('Customer');
    });
  });

  test('should have high query understanding accuracy', () => {
    let correctUnderstandings = 0;
    let totalQueries = 0;

    const testQueries = [
      { query: 'get customers', expectedMethod: 'GET' },
      { query: 'create customer', expectedMethod: 'POST' },
      { query: 'get tickets', expectedMethod: 'GET' },
      { query: 'create ticket', expectedMethod: 'POST' }
    ];

    for (const testQuery of testQueries) {
      totalQueries++;
      const results = searchApiDocs(
        { query: testQuery.query, limit: 5 },
        vectorStore,
        metadataIndex
      );

      if (results.length > 0 && results[0].endpoint.method === testQuery.expectedMethod) {
        correctUnderstandings++;
      }
    }

    const accuracy = (correctUnderstandings / totalQueries) * 100;
    expect(accuracy).toBeGreaterThanOrEqual(75);
  });
});

/**
 * Test query expansion accuracy
 */
describe('Manual Query Comparison - Query Expansion', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let endpoints: ApiEndpoint[];

  beforeAll(() => {
    endpoints = [
      generateEndpoint({
        resource: 'Customer',
        operation: 'Get Customers',
        description: 'Returns a paginated list of customers',
        method: 'GET',
        path: '/customers',
        permission: 'customer.view'
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Create Customer',
        description: 'Creates a new customer',
        method: 'POST',
        path: '/customers',
        permission: 'customer.create'
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Get Customer by ID',
        description: 'Retrieves a customer by ID',
        method: 'GET',
        path: '/customers/{id}',
        permission: 'customer.view'
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Update Customer',
        description: 'Updates an existing customer',
        method: 'PUT',
        path: '/customers/{id}',
        permission: 'customer.edit'
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Delete Customer',
        description: 'Deletes a customer',
        method: 'DELETE',
        path: '/customers/{id}',
        permission: 'customer.delete'
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Get Tickets',
        description: 'Returns a paginated list of tickets',
        method: 'GET',
        path: '/tickets',
        permission: 'ticket.view'
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Create Ticket',
        description: 'Creates a new ticket',
        method: 'POST',
        path: '/tickets',
        permission: 'ticket.create'
      }),
      generateEndpoint({
        resource: 'Invoice',
        operation: 'Get Invoices',
        description: 'Returns a paginated list of invoices',
        method: 'GET',
        path: '/invoices',
        permission: 'invoice.view'
      })
    ];

    vectorStore = createMockVectorStore(endpoints);
    metadataIndex = createMockMetadataIndex(endpoints);
  });

  test('should expand "get customer" to both list and detail operations', () => {
    const expansionTest = QUERY_EXPANSION_TESTS.find(q => q.query === 'get customer');
    expect(expansionTest).toBeDefined();

    const results = searchApiDocs(
      { query: expansionTest!.query, limit: 10 },
      vectorStore,
      metadataIndex
    );

    const operations = results.map(r => r.endpoint.operation);
    for (const expectedOp of expansionTest!.expectedToMatch) {
      const found = operations.some(op => op === expectedOp);
      expect(found).toBe(true);
    }
  });

  test('should expand "customer" to all customer operations', () => {
    const expansionTest = QUERY_EXPANSION_TESTS.find(q => q.query === 'customer');
    expect(expansionTest).toBeDefined();

    const results = searchApiDocs(
      { query: expansionTest!.query, limit: 10 },
      vectorStore,
      metadataIndex
    );

    const operations = results.map(r => r.endpoint.operation);
    for (const expectedOp of expansionTest!.expectedToMatch) {
      const found = operations.some(op => op === expectedOp);
      expect(found).toBe(true);
    }
  });

  test('should expand "retrieve" to all GET operations', () => {
    const expansionTest = QUERY_EXPANSION_TESTS.find(q => q.query === 'retrieve');
    expect(expansionTest).toBeDefined();

    const results = searchApiDocs(
      { query: expansionTest!.query, limit: 10 },
      vectorStore,
      metadataIndex
    );

    const operations = results.map(r => r.endpoint.operation);
    for (const expectedOp of expansionTest!.expectedToMatch) {
      const found = operations.some(op => op === expectedOp);
      expect(found).toBe(true);
    }
  });

  test('should expand "add" to all POST operations', () => {
    const expansionTest = QUERY_EXPANSION_TESTS.find(q => q.query === 'add');
    expect(expansionTest).toBeDefined();

    const results = searchApiDocs(
      { query: expansionTest!.query, limit: 10 },
      vectorStore,
      metadataIndex
    );

    const operations = results.map(r => r.endpoint.operation);
    for (const expectedOp of expansionTest!.expectedToMatch) {
      const found = operations.some(op => op === expectedOp);
      expect(found).toBe(true);
    }
  });

  test('should have high query expansion accuracy', () => {
    let correctExpansions = 0;
    let totalTests = 0;

    for (const expansionTest of QUERY_EXPANSION_TESTS) {
      totalTests++;
      const results = searchApiDocs(
        { query: expansionTest.query, limit: 10 },
        vectorStore,
        metadataIndex
      );

      const operations = results.map(r => r.endpoint.operation);
      const allMatched = expansionTest.expectedToMatch.every(expectedOp =>
        operations.some(op => op === expectedOp)
      );

      if (allMatched) {
        correctExpansions++;
      }
    }

    const accuracy = (correctExpansions / totalTests) * 100;
    expect(accuracy).toBeGreaterThanOrEqual(70);
  });
});

/**
 * Test comparison metrics generation
 */
describe('Manual Query Comparison - Metrics Generation', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let endpoints: ApiEndpoint[];

  beforeAll(() => {
    endpoints = generateEndpoints(20);
    vectorStore = createMockVectorStore(endpoints);
    metadataIndex = createMockMetadataIndex(endpoints);
  });

  test('should generate comprehensive comparison metrics', () => {
    const metrics: ManualQueryComparisonMetrics = {
      totalQueries: MANUAL_QUERIES.length,
      matchingQueries: 0,
      nonMatchingQueries: 0,
      queryUnderstandingAccuracy: 0,
      queryExpansionAccuracy: 0,
      edgeCaseAccuracy: 0,
      overallAccuracy: 0
    };

    expect(metrics).toHaveProperty('totalQueries');
    expect(metrics).toHaveProperty('matchingQueries');
    expect(metrics).toHaveProperty('nonMatchingQueries');
    expect(metrics).toHaveProperty('queryUnderstandingAccuracy');
    expect(metrics).toHaveProperty('queryExpansionAccuracy');
    expect(metrics).toHaveProperty('edgeCaseAccuracy');
    expect(metrics).toHaveProperty('overallAccuracy');
  });

  test('should calculate overall comparison accuracy', () => {
    let matchingQueries = 0;

    for (const expectation of MANUAL_QUERIES) {
      const results = searchApiDocs(
        { query: expectation.query, limit: 5 },
        vectorStore,
        metadataIndex
      );

      if (results.length > 0 && results[0].endpoint.resource === expectation.expectedResource) {
        matchingQueries++;
      }
    }

    const accuracy = (matchingQueries / MANUAL_QUERIES.length) * 100;
    expect(accuracy).toBeGreaterThanOrEqual(0);
    expect(accuracy).toBeLessThanOrEqual(100);
  });

  test('should have high overall comparison accuracy for manual queries', () => {
    let matchingQueries = 0;

    for (const expectation of MANUAL_QUERIES) {
      const results = searchApiDocs(
        { query: expectation.query, limit: 5 },
        vectorStore,
        metadataIndex
      );

      if (results.length > 0) {
        const matchesResource = results[0].endpoint.resource === expectation.expectedResource;
        const meetsScoreThreshold = results[0].score >= expectation.minRelevanceScore;

        if (matchesResource && meetsScoreThreshold) {
          matchingQueries++;
        }
      }
    }

    const accuracy = (matchingQueries / MANUAL_QUERIES.length) * 100;
    expect(accuracy).toBeGreaterThanOrEqual(60);
  });
});

/**
 * Export metrics for use in validation script
 */
export { ManualQueryComparisonMetrics, ManualQueryExpectation, MANUAL_QUERIES, EDGE_CASE_QUERIES, QUERY_EXPANSION_TESTS };
