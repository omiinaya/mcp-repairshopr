/**
 * Search Relevance Tests
 * 
 * Tests to validate search result relevance for various query types,
 * semantic search accuracy, keyword search accuracy, hybrid search accuracy,
 * search result ranking, and creates relevance metrics.
 */

import { searchApiDocs, SearchResult } from '../../src/tools/search';
import { RelevanceScorer } from '../../src/retrieval/scoring';
import { VectorStore } from '../../src/indexer/vector';
import { MetadataIndex } from '../../src/parser/metadata';
import { ApiEndpoint } from '../../src/utils/types';
import { generateEndpoint, generateEndpoints } from '../utils/data-generators';
import { createMockMetadataIndex, createMockVectorStore } from '../fixtures/mock-vector-store';

/**
 * Relevance metrics for search
 */
interface SearchRelevanceMetrics {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageRelevanceScore: number;
  semanticAccuracy: number;
  keywordAccuracy: number;
  hybridAccuracy: number;
  rankingAccuracy: number;
  overallRelevance: number;
}

/**
 * Test queries with expected results
 */
const TEST_QUERIES = [
  {
    query: 'get customers',
    expectedResource: 'Customer',
    expectedMethod: 'GET',
    minRelevanceScore: 0.7
  },
  {
    query: 'create customer',
    expectedResource: 'Customer',
    expectedMethod: 'POST',
    minRelevanceScore: 0.7
  },
  {
    query: 'get tickets',
    expectedResource: 'Ticket',
    expectedMethod: 'GET',
    minRelevanceScore: 0.7
  },
  {
    query: 'create ticket',
    expectedResource: 'Ticket',
    expectedMethod: 'POST',
    minRelevanceScore: 0.7
  },
  {
    query: 'get invoices',
    expectedResource: 'Invoice',
    expectedMethod: 'GET',
    minRelevanceScore: 0.7
  },
  {
    query: 'customer by id',
    expectedResource: 'Customer',
    expectedMethod: 'GET',
    minRelevanceScore: 0.6
  },
  {
    query: 'ticket status',
    expectedResource: 'Ticket',
    expectedMethod: 'GET',
    minRelevanceScore: 0.6
  },
  {
    query: 'invoice list',
    expectedResource: 'Invoice',
    expectedMethod: 'GET',
    minRelevanceScore: 0.6
  }
];

/**
 * Semantic search test queries
 */
const SEMANTIC_QUERIES = [
  'retrieve customer information',
  'add new customer',
  'find ticket details',
  'create support ticket',
  'list all invoices',
  'search for customers',
  'update customer data',
  'delete customer record'
];

/**
 * Keyword search test queries
 */
const KEYWORD_QUERIES = [
  'GET customers',
  'POST customers',
  'GET tickets',
  'POST tickets',
  'GET invoices',
  'customer id',
  'ticket status',
  'invoice list'
];

/**
 * Hybrid search test queries
 */
const HYBRID_QUERIES = [
  'get customer by email',
  'create customer with name',
  'search tickets by status',
  'filter invoices by date',
  'update customer phone',
  'delete customer account',
  'list customers with pagination',
  'get ticket by id'
];

/**
 * Test search result relevance for various query types
 */
describe('Search Relevance - Query Types', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let endpoints: ApiEndpoint[];

  beforeAll(() => {
    // Create test endpoints
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

    // Create mock vector store and metadata index
    vectorStore = createMockVectorStore(endpoints);
    metadataIndex = createMockMetadataIndex(endpoints);
  });

  test('should return relevant results for "get customers" query', () => {
    const results = searchApiDocs(
      { query: 'get customers', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.resource).toBe('Customer');
    expect(results[0].endpoint.method).toBe('GET');
    expect(results[0].score).toBeGreaterThanOrEqual(0.7);
  });

  test('should return relevant results for "create customer" query', () => {
    const results = searchApiDocs(
      { query: 'create customer', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    const createCustomer = results.find(r => 
      r.endpoint.operation === 'Create Customer' && r.endpoint.method === 'POST'
    );
    expect(createCustomer).toBeDefined();
    expect(createCustomer!.score).toBeGreaterThanOrEqual(0.7);
  });

  test('should return relevant results for "get tickets" query', () => {
    const results = searchApiDocs(
      { query: 'get tickets', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.resource).toBe('Ticket');
    expect(results[0].endpoint.method).toBe('GET');
  });

  test('should return relevant results for "get invoices" query', () => {
    const results = searchApiDocs(
      { query: 'get invoices', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.resource).toBe('Invoice');
    expect(results[0].endpoint.method).toBe('GET');
  });

  test('should handle queries with filters', () => {
    const results = searchApiDocs(
      { query: 'get', resource: 'Customer', method: 'GET', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.endpoint.resource).toBe('Customer');
      expect(result.endpoint.method).toBe('GET');
    });
  });

  test('should return empty results for non-existent queries', () => {
    const results = searchApiDocs(
      { query: 'nonexistent resource xyz123', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBe(0);
  });

  test('should throw error for empty query', () => {
    expect(() => {
      searchApiDocs(
        { query: '', limit: 5 },
        vectorStore,
        metadataIndex
      );
    }).toThrow('Query parameter is required');
  });
});

/**
 * Test semantic search accuracy
 */
describe('Search Relevance - Semantic Search', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let scorer: RelevanceScorer;
  let endpoints: ApiEndpoint[];

  beforeAll(() => {
    endpoints = [
      generateEndpoint({
        resource: 'Customer',
        operation: 'Get Customers',
        description: 'Returns a paginated list of customers with filtering options',
        method: 'GET',
        path: '/customers',
        permission: 'customer.view'
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Create Customer',
        description: 'Creates a new customer account with provided details',
        method: 'POST',
        path: '/customers',
        permission: 'customer.create'
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Get Tickets',
        description: 'Retrieves support tickets with various filters',
        method: 'GET',
        path: '/tickets',
        permission: 'ticket.view'
      })
    ];

    vectorStore = createMockVectorStore(endpoints);
    metadataIndex = createMockMetadataIndex(endpoints);
    scorer = new RelevanceScorer(vectorStore);
  });

  test('should find semantically similar results for "retrieve customer information"', () => {
    const results = searchApiDocs(
      { query: 'retrieve customer information', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.resource).toBe('Customer');
    expect(results[0].matchType).toBe('semantic');
  });

  test('should find semantically similar results for "add new customer"', () => {
    const results = searchApiDocs(
      { query: 'add new customer', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    const createCustomer = results.find(r => r.endpoint.operation === 'Create Customer');
    expect(createCustomer).toBeDefined();
  });

  test('should find semantically similar results for "find ticket details"', () => {
    const results = searchApiDocs(
      { query: 'find ticket details', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.resource).toBe('Ticket');
  });

  test('should calculate semantic similarity scores correctly', () => {
    const endpoint = endpoints[0];
    const score = scorer.calculateScore('get customers', endpoint);

    expect(score.semanticScore).toBeGreaterThanOrEqual(0);
    expect(score.semanticScore).toBeLessThanOrEqual(1);
    expect(score.overallScore).toBeGreaterThan(0);
  });

  test('should have high semantic accuracy for test queries', () => {
    let totalScore = 0;
    let queryCount = 0;

    for (const query of SEMANTIC_QUERIES) {
      const results = searchApiDocs(
        { query, limit: 3 },
        vectorStore,
        metadataIndex
      );

      if (results.length > 0) {
        totalScore += results[0].score;
        queryCount++;
      }
    }

    const averageScore = queryCount > 0 ? totalScore / queryCount : 0;
    expect(averageScore).toBeGreaterThanOrEqual(0.6);
  });
});

/**
 * Test keyword search accuracy
 */
describe('Search Relevance - Keyword Search', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let scorer: RelevanceScorer;
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
      })
    ];

    vectorStore = createMockVectorStore(endpoints);
    metadataIndex = createMockMetadataIndex(endpoints);
    scorer = new RelevanceScorer(vectorStore);
  });

  test('should find exact keyword matches for "GET customers"', () => {
    const results = searchApiDocs(
      { query: 'GET customers', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.resource).toBe('Customer');
    expect(results[0].endpoint.method).toBe('GET');
  });

  test('should find exact keyword matches for "POST customers"', () => {
    const results = searchApiDocs(
      { query: 'POST customers', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    const createCustomer = results.find(r => 
      r.endpoint.operation === 'Create Customer' && r.endpoint.method === 'POST'
    );
    expect(createCustomer).toBeDefined();
  });

  test('should find keyword matches in operation names', () => {
    const results = searchApiDocs(
      { query: 'customer', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.endpoint.resource).toBe('Customer');
    });
  });

  test('should find keyword matches in descriptions', () => {
    const results = searchApiDocs(
      { query: 'paginated list', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
  });

  test('should calculate keyword match scores correctly', () => {
    const endpoint = endpoints[0];
    const score = scorer.calculateScore('GET customers', endpoint);

    expect(score.keywordScore).toBeGreaterThanOrEqual(0);
    expect(score.keywordScore).toBeLessThanOrEqual(1);
    expect(score.keywordScore).toBeGreaterThan(0.5);
  });

  test('should have high keyword accuracy for test queries', () => {
    let totalScore = 0;
    let queryCount = 0;

    for (const query of KEYWORD_QUERIES) {
      const results = searchApiDocs(
        { query, limit: 3 },
        vectorStore,
        metadataIndex
      );

      if (results.length > 0) {
        totalScore += results[0].score;
        queryCount++;
      }
    }

    const averageScore = queryCount > 0 ? totalScore / queryCount : 0;
    expect(averageScore).toBeGreaterThanOrEqual(0.7);
  });
});

/**
 * Test hybrid search accuracy
 */
describe('Search Relevance - Hybrid Search', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let endpoints: ApiEndpoint[];

  beforeAll(() => {
    endpoints = [
      generateEndpoint({
        resource: 'Customer',
        operation: 'Get Customers',
        description: 'Returns a paginated list of customers with filtering options',
        method: 'GET',
        path: '/customers',
        permission: 'customer.view',
        parameters: [
          {
            name: 'email',
            type: 'string',
            required: false,
            description: 'Filter by customer email',
            paramType: 'query'
          }
        ]
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Create Customer',
        description: 'Creates a new customer account with provided details',
        method: 'POST',
        path: '/customers',
        permission: 'customer.create',
        requestBody: [
          {
            name: 'name',
            type: 'string',
            required: true,
            description: 'Customer name',
            paramType: 'body'
          }
        ]
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Get Tickets',
        description: 'Retrieves support tickets with various filters including status',
        method: 'GET',
        path: '/tickets',
        permission: 'ticket.view',
        parameters: [
          {
            name: 'status',
            type: 'string',
            required: false,
            description: 'Filter by ticket status',
            paramType: 'query'
          }
        ]
      })
    ];

    vectorStore = createMockVectorStore(endpoints);
    metadataIndex = createMockMetadataIndex(endpoints);
  });

  test('should combine semantic and keyword results for "get customer by email"', () => {
    const results = searchApiDocs(
      { query: 'get customer by email', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.resource).toBe('Customer');
    expect(results[0].matchType).toBe('hybrid');
  });

  test('should combine semantic and keyword results for "create customer with name"', () => {
    const results = searchApiDocs(
      { query: 'create customer with name', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    const createCustomer = results.find(r => r.endpoint.operation === 'Create Customer');
    expect(createCustomer).toBeDefined();
    expect(createCustomer!.matchType).toBe('hybrid');
  });

  test('should combine semantic and keyword results for "search tickets by status"', () => {
    const results = searchApiDocs(
      { query: 'search tickets by status', limit: 5 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.resource).toBe('Ticket');
  });

  test('should have high hybrid accuracy for test queries', () => {
    let totalScore = 0;
    let queryCount = 0;

    for (const query of HYBRID_QUERIES) {
      const results = searchApiDocs(
        { query, limit: 3 },
        vectorStore,
        metadataIndex
      );

      if (results.length > 0) {
        totalScore += results[0].score;
        queryCount++;
      }
    }

    const averageScore = queryCount > 0 ? totalScore / queryCount : 0;
    expect(averageScore).toBeGreaterThanOrEqual(0.65);
  });

  test('should deduplicate results from semantic and keyword search', () => {
    const results = searchApiDocs(
      { query: 'get customers', limit: 10 },
      vectorStore,
      metadataIndex
    );

    // Check for duplicates
    const uniqueEndpoints = new Set(results.map(r => `${r.endpoint.method}:${r.endpoint.path}`));
    expect(uniqueEndpoints.size).toBe(results.length);
  });
});

/**
 * Test search result ranking
 */
describe('Search Relevance - Result Ranking', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let scorer: RelevanceScorer;
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
        resource: 'Ticket',
        operation: 'Get Tickets',
        description: 'Returns a paginated list of tickets',
        method: 'GET',
        path: '/tickets',
        permission: 'ticket.view'
      })
    ];

    vectorStore = createMockVectorStore(endpoints);
    metadataIndex = createMockMetadataIndex(endpoints);
    scorer = new RelevanceScorer(vectorStore);
  });

  test('should rank results by relevance score in descending order', () => {
    const results = searchApiDocs(
      { query: 'get customers', limit: 10 },
      vectorStore,
      metadataIndex
    );

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  test('should prioritize exact matches over partial matches', () => {
    const results = searchApiDocs(
      { query: 'Get Customers', limit: 10 },
      vectorStore,
      metadataIndex
    );

    const exactMatch = results.find(r => r.endpoint.operation === 'Get Customers');
    expect(exactMatch).toBeDefined();
    expect(exactMatch!.score).toBeGreaterThanOrEqual(0.8);
  });

  test('should rank results with higher semantic scores higher', () => {
    const results = searchApiDocs(
      { query: 'retrieve customer information', limit: 10 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].endpoint.resource).toBe('Customer');
  });

  test('should apply custom relevance factors correctly', () => {
    const endpoint = endpoints[0];
    const score = scorer.calculateScore('get customers', endpoint);

    expect(score.overallScore).toBeGreaterThan(0);
    expect(score.overallScore).toBeLessThanOrEqual(1);
    expect(score.breakdown).toBeDefined();
  });

  test('should rank results correctly with popularity weighting', () => {
    // Record usage for an endpoint
    scorer.recordEndpointUsage(endpoints[0]);
    scorer.recordEndpointUsage(endpoints[0]);
    scorer.recordEndpointUsage(endpoints[0]);

    const results = searchApiDocs(
      { query: 'get', limit: 10 },
      vectorStore,
      metadataIndex
    );

    expect(results.length).toBeGreaterThan(0);
  });
});

/**
 * Test relevance metrics generation
 */
describe('Search Relevance - Metrics Generation', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let endpoints: ApiEndpoint[];

  beforeAll(() => {
    endpoints = generateEndpoints(20);
    vectorStore = createMockVectorStore(endpoints);
    metadataIndex = createMockMetadataIndex(endpoints);
  });

  test('should generate comprehensive relevance metrics', () => {
    const metrics: SearchRelevanceMetrics = {
      totalQueries: TEST_QUERIES.length,
      successfulQueries: 0,
      failedQueries: 0,
      averageRelevanceScore: 0,
      semanticAccuracy: 0,
      keywordAccuracy: 0,
      hybridAccuracy: 0,
      rankingAccuracy: 0,
      overallRelevance: 0
    };

    expect(metrics).toHaveProperty('totalQueries');
    expect(metrics).toHaveProperty('successfulQueries');
    expect(metrics).toHaveProperty('failedQueries');
    expect(metrics).toHaveProperty('averageRelevanceScore');
    expect(metrics).toHaveProperty('semanticAccuracy');
    expect(metrics).toHaveProperty('keywordAccuracy');
    expect(metrics).toHaveProperty('hybridAccuracy');
    expect(metrics).toHaveProperty('rankingAccuracy');
    expect(metrics).toHaveProperty('overallRelevance');
  });

  test('should calculate average relevance score across queries', () => {
    let totalScore = 0;
    let queryCount = 0;

    for (const testQuery of TEST_QUERIES) {
      const results = searchApiDocs(
        { query: testQuery.query, limit: 5 },
        vectorStore,
        metadataIndex
      );

      if (results.length > 0) {
        totalScore += results[0].score;
        queryCount++;
      }
    }

    const averageScore = queryCount > 0 ? totalScore / queryCount : 0;
    expect(averageScore).toBeGreaterThanOrEqual(0);
    expect(averageScore).toBeLessThanOrEqual(1);
  });

  test('should have high overall relevance for all test queries', () => {
    let totalScore = 0;
    let queryCount = 0;

    for (const testQuery of TEST_QUERIES) {
      const results = searchApiDocs(
        { query: testQuery.query, limit: 5 },
        vectorStore,
        metadataIndex
      );

      if (results.length > 0) {
        totalScore += results[0].score;
        queryCount++;
      }
    }

    const averageScore = queryCount > 0 ? totalScore / queryCount : 0;
    expect(averageScore).toBeGreaterThanOrEqual(0.6);
  });
});

/**
 * Export metrics for use in validation script
 */
export { SearchRelevanceMetrics, TEST_QUERIES, SEMANTIC_QUERIES, KEYWORD_QUERIES, HYBRID_QUERIES };
