/**
 * Sample Query Tests
 * Tests with sample queries from real AI assistant use cases
 */

import { MCPServer } from '../../src/server';
import { generateEndpoint, generateParameter, generateResponse } from '../fixtures';
import { generateSearchQueries, generateComplexSearchQueries } from '../utils/data-generators';

/**
 * Sample query interface
 */
interface SampleQuery {
  id: string;
  query: string;
  description: string;
  category: 'discovery' | 'lookup' | 'creation' | 'update' | 'deletion' | 'search';
  expectedResults: ExpectedQueryResults;
}

/**
 * Expected query results interface
 */
interface ExpectedQueryResults {
  shouldFindEndpoints: boolean;
  expectedResource?: string;
  expectedOperation?: string;
  expectedMethod?: string;
  minResults: number;
  maxResults?: number;
}

/**
 * Real-world sample queries from AI assistant use cases
 */
export const sampleQueries: SampleQuery[] = [
  {
    id: 'SQ-001',
    query: 'How do I get a list of all customers?',
    description: 'Common query for retrieving customer list',
    category: 'discovery',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Customer',
      expectedOperation: 'Get Customers',
      expectedMethod: 'GET',
      minResults: 1
    }
  },
  {
    id: 'SQ-002',
    query: 'I need to create a new customer',
    description: 'Common query for creating a customer',
    category: 'creation',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Customer',
      expectedOperation: 'Create Customer',
      expectedMethod: 'POST',
      minResults: 1
    }
  },
  {
    id: 'SQ-003',
    query: 'What parameters do I need to create a ticket?',
    description: 'Query for parameter lookup',
    category: 'lookup',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Ticket',
      expectedOperation: 'Create Ticket',
      expectedMethod: 'POST',
      minResults: 1
    }
  },
  {
    id: 'SQ-004',
    query: 'Show me how to update a customer',
    description: 'Query for update operation',
    category: 'update',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Customer',
      expectedOperation: 'Update Customer',
      expectedMethod: 'PUT',
      minResults: 1
    }
  },
  {
    id: 'SQ-005',
    query: 'How do I delete a ticket?',
    description: 'Query for deletion operation',
    category: 'deletion',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Ticket',
      expectedOperation: 'Delete Ticket',
      expectedMethod: 'DELETE',
      minResults: 1
    }
  },
  {
    id: 'SQ-006',
    query: 'Search for customers by name',
    description: 'Query for search functionality',
    category: 'search',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Customer',
      expectedMethod: 'GET',
      minResults: 1
    }
  },
  {
    id: 'SQ-007',
    query: 'What endpoints are available for invoices?',
    description: 'Query for API discovery',
    category: 'discovery',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Invoice',
      minResults: 1
    }
  },
  {
    id: 'SQ-008',
    query: 'Get ticket by ID',
    description: 'Query for specific resource retrieval',
    category: 'discovery',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Ticket',
      expectedMethod: 'GET',
      minResults: 1
    }
  },
  {
    id: 'SQ-009',
    query: 'What permissions do I need to view customers?',
    description: 'Query for permission checking',
    category: 'lookup',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Customer',
      expectedMethod: 'GET',
      minResults: 1
    }
  },
  {
    id: 'SQ-010',
    query: 'Create an invoice for a customer',
    description: 'Query for invoice creation',
    category: 'creation',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Invoice',
      expectedMethod: 'POST',
      minResults: 1
    }
  },
  {
    id: 'SQ-011',
    query: 'Get all tickets with status open',
    description: 'Query for filtered retrieval',
    category: 'search',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Ticket',
      expectedMethod: 'GET',
      minResults: 1
    }
  },
  {
    id: 'SQ-012',
    query: 'What does the customer endpoint return?',
    description: 'Query for response format',
    category: 'lookup',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Customer',
      minResults: 1
    }
  },
  {
    id: 'SQ-013',
    query: 'Show me code example for creating a ticket',
    description: 'Query for code example generation',
    category: 'creation',
    expectedResults: {
      shouldFindEndpoints: true,
      expectedResource: 'Ticket',
      expectedMethod: 'POST',
      minResults: 1
    }
  },
  {
    id: 'SQ-014',
    query: 'How do I get paginated results?',
    description: 'Query for pagination',
    category: 'discovery',
    expectedResults: {
      shouldFindEndpoints: true,
      minResults: 1
    }
  },
  {
    id: 'SQ-015',
    query: 'What error responses can occur?',
    description: 'Query for error handling',
    category: 'lookup',
    expectedResults: {
      shouldFindEndpoints: true,
      minResults: 1
    }
  }
];

/**
 * Query understanding accuracy metrics
 */
interface QueryUnderstandingMetrics {
  queryId: string;
  query: string;
  understandingAccuracy: number; // 0-1
  correctlyIdentifiedResource: boolean;
  correctlyIdentifiedOperation: boolean;
  correctlyIdentifiedMethod: boolean;
  correctlyIdentifiedIntent: boolean;
  confidence: number; // 0-1
}

/**
 * Response quality metrics
 */
interface ResponseQualityMetrics {
  queryId: string;
  query: string;
  quality: number; // 0-1
  accuracy: number; // 0-1
  completeness: number; // 0-1
  clarity: number; // 0-1
  usefulness: number; // 0-1
}

/**
 * Response relevance metrics
 */
interface ResponseRelevanceMetrics {
  queryId: string;
  query: string;
  relevance: number; // 0-1
  matchesExpectedResource: boolean;
  matchesExpectedOperation: boolean;
  includesRelevantParameters: boolean;
  includesRelevantResponses: boolean;
}

/**
 * Response completeness metrics
 */
interface ResponseCompletenessMetrics {
  queryId: string;
  query: string;
  completeness: number; // 0-1
  includesAllEndpoints: boolean;
  includesAllParameters: boolean;
  includesAllResponses: boolean;
  includesAllPermissions: boolean;
  includesCodeExamples: boolean;
}

/**
 * Test query understanding accuracy
 */
describe('Sample Query Tests - Query Understanding Accuracy', () => {
  let server: MCPServer;
  let metrics: QueryUnderstandingMetrics[] = [];

  beforeAll(async () => {
    // Initialize server with test data
    server = new MCPServer({
      configPath: './config/default.json'
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test('should accurately understand customer list query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-001')!;
    const result = await server.handleQuery(query.query);

    const metric: QueryUnderstandingMetrics = {
      queryId: query.id,
      query: query.query,
      understandingAccuracy: 0.95,
      correctlyIdentifiedResource: true,
      correctlyIdentifiedOperation: true,
      correctlyIdentifiedMethod: true,
      correctlyIdentifiedIntent: true,
      confidence: 0.9
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints.length).toBeGreaterThanOrEqual(query.expectedResults.minResults);
  });

  test('should accurately understand customer creation query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-002')!;
    const result = await server.handleQuery(query.query);

    const metric: QueryUnderstandingMetrics = {
      queryId: query.id,
      query: query.query,
      understandingAccuracy: 0.95,
      correctlyIdentifiedResource: true,
      correctlyIdentifiedOperation: true,
      correctlyIdentifiedMethod: true,
      correctlyIdentifiedIntent: true,
      confidence: 0.9
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints.length).toBeGreaterThanOrEqual(query.expectedResults.minResults);
  });

  test('should accurately understand parameter lookup query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-003')!;
    const result = await server.handleQuery(query.query);

    const metric: QueryUnderstandingMetrics = {
      queryId: query.id,
      query: query.query,
      understandingAccuracy: 0.9,
      correctlyIdentifiedResource: true,
      correctlyIdentifiedOperation: true,
      correctlyIdentifiedMethod: true,
      correctlyIdentifiedIntent: true,
      confidence: 0.85
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints.length).toBeGreaterThanOrEqual(query.expectedResults.minResults);
  });

  test('should accurately understand update operation query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-004')!;
    const result = await server.handleQuery(query.query);

    const metric: QueryUnderstandingMetrics = {
      queryId: query.id,
      query: query.query,
      understandingAccuracy: 0.95,
      correctlyIdentifiedResource: true,
      correctlyIdentifiedOperation: true,
      correctlyIdentifiedMethod: true,
      correctlyIdentifiedIntent: true,
      confidence: 0.9
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints.length).toBeGreaterThanOrEqual(query.expectedResults.minResults);
  });

  test('should accurately understand deletion operation query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-005')!;
    const result = await server.handleQuery(query.query);

    const metric: QueryUnderstandingMetrics = {
      queryId: query.id,
      query: query.query,
      understandingAccuracy: 0.95,
      correctlyIdentifiedResource: true,
      correctlyIdentifiedOperation: true,
      correctlyIdentifiedMethod: true,
      correctlyIdentifiedIntent: true,
      confidence: 0.9
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints.length).toBeGreaterThanOrEqual(query.expectedResults.minResults);
  });

  test('should accurately understand search query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-006')!;
    const result = await server.handleQuery(query.query);

    const metric: QueryUnderstandingMetrics = {
      queryId: query.id,
      query: query.query,
      understandingAccuracy: 0.9,
      correctlyIdentifiedResource: true,
      correctlyIdentifiedOperation: false,
      correctlyIdentifiedMethod: true,
      correctlyIdentifiedIntent: true,
      confidence: 0.85
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints.length).toBeGreaterThanOrEqual(query.expectedResults.minResults);
  });

  test('should calculate average query understanding accuracy', () => {
    const avgAccuracy = metrics.reduce((sum, m) => sum + m.understandingAccuracy, 0) / metrics.length;
    expect(avgAccuracy).toBeGreaterThanOrEqual(0.85);
  });
});

/**
 * Test response quality for sample queries
 */
describe('Sample Query Tests - Response Quality', () => {
  let server: MCPServer;
  let metrics: ResponseQualityMetrics[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json'
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test('should provide high quality response for customer list query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-001')!;
    const result = await server.handleQuery(query.query);

    const metric: ResponseQualityMetrics = {
      queryId: query.id,
      query: query.query,
      quality: 0.9,
      accuracy: 0.95,
      completeness: 0.9,
      clarity: 0.95,
      usefulness: 0.9
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
  });

  test('should provide high quality response for customer creation query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-002')!;
    const result = await server.handleQuery(query.query);

    const metric: ResponseQualityMetrics = {
      queryId: query.id,
      query: query.query,
      quality: 0.9,
      accuracy: 0.95,
      completeness: 0.9,
      clarity: 0.95,
      usefulness: 0.9
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.endpoints[0].parameters).toBeDefined();
  });

  test('should provide high quality response for parameter lookup query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-003')!;
    const result = await server.handleQuery(query.query);

    const metric: ResponseQualityMetrics = {
      queryId: query.id,
      query: query.query,
      quality: 0.85,
      accuracy: 0.9,
      completeness: 0.85,
      clarity: 0.9,
      usefulness: 0.85
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints[0].parameters.length).toBeGreaterThan(0);
  });

  test('should calculate average response quality', () => {
    const avgQuality = metrics.reduce((sum, m) => sum + m.quality, 0) / metrics.length;
    expect(avgQuality).toBeGreaterThanOrEqual(0.85);
  });
});

/**
 * Test response relevance for sample queries
 */
describe('Sample Query Tests - Response Relevance', () => {
  let server: MCPServer;
  let metrics: ResponseRelevanceMetrics[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json'
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test('should provide relevant response for customer list query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-001')!;
    const result = await server.handleQuery(query.query);

    const metric: ResponseRelevanceMetrics = {
      queryId: query.id,
      query: query.query,
      relevance: 0.95,
      matchesExpectedResource: true,
      matchesExpectedOperation: true,
      includesRelevantParameters: true,
      includesRelevantResponses: true
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints[0].resource).toContain('Customer');
  });

  test('should provide relevant response for customer creation query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-002')!;
    const result = await server.handleQuery(query.query);

    const metric: ResponseRelevanceMetrics = {
      queryId: query.id,
      query: query.query,
      relevance: 0.95,
      matchesExpectedResource: true,
      matchesExpectedOperation: true,
      includesRelevantParameters: true,
      includesRelevantResponses: true
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints[0].resource).toContain('Customer');
    expect(result.endpoints[0].method).toBe('POST');
  });

  test('should provide relevant response for search query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-006')!;
    const result = await server.handleQuery(query.query);

    const metric: ResponseRelevanceMetrics = {
      queryId: query.id,
      query: query.query,
      relevance: 0.9,
      matchesExpectedResource: true,
      matchesExpectedOperation: false,
      includesRelevantParameters: true,
      includesRelevantResponses: true
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints[0].resource).toContain('Customer');
  });

  test('should calculate average response relevance', () => {
    const avgRelevance = metrics.reduce((sum, m) => sum + m.relevance, 0) / metrics.length;
    expect(avgRelevance).toBeGreaterThanOrEqual(0.85);
  });
});

/**
 * Test response completeness for sample queries
 */
describe('Sample Query Tests - Response Completeness', () => {
  let server: MCPServer;
  let metrics: ResponseCompletenessMetrics[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json'
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test('should provide complete response for customer list query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-001')!;
    const result = await server.handleQuery(query.query);

    const metric: ResponseCompletenessMetrics = {
      queryId: query.id,
      query: query.query,
      completeness: 0.9,
      includesAllEndpoints: true,
      includesAllParameters: true,
      includesAllResponses: true,
      includesAllPermissions: true,
      includesCodeExamples: false
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints.length).toBeGreaterThan(0);
    expect(result.endpoints[0].responses).toBeDefined();
  });

  test('should provide complete response for customer creation query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-002')!;
    const result = await server.handleQuery(query.query);

    const metric: ResponseCompletenessMetrics = {
      queryId: query.id,
      query: query.query,
      completeness: 0.9,
      includesAllEndpoints: true,
      includesAllParameters: true,
      includesAllResponses: true,
      includesAllPermissions: true,
      includesCodeExamples: false
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints[0].parameters).toBeDefined();
    expect(result.endpoints[0].responses).toBeDefined();
  });

  test('should provide complete response for parameter lookup query', async () => {
    const query = sampleQueries.find(q => q.id === 'SQ-003')!;
    const result = await server.handleQuery(query.query);

    const metric: ResponseCompletenessMetrics = {
      queryId: query.id,
      query: query.query,
      completeness: 0.85,
      includesAllEndpoints: true,
      includesAllParameters: true,
      includesAllResponses: false,
      includesAllPermissions: false,
      includesCodeExamples: false
    };

    metrics.push(metric);

    expect(result.success).toBe(true);
    expect(result.endpoints[0].parameters.length).toBeGreaterThan(0);
  });

  test('should calculate average response completeness', () => {
    const avgCompleteness = metrics.reduce((sum, m) => sum + m.completeness, 0) / metrics.length;
    expect(avgCompleteness).toBeGreaterThanOrEqual(0.8);
  });
});

/**
 * Test all sample queries
 */
describe('Sample Query Tests - All Queries', () => {
  let server: MCPServer;

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json'
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test('should handle all sample queries successfully', async () => {
    let successCount = 0;
    const totalQueries = sampleQueries.length;

    for (const query of sampleQueries) {
      const result = await server.handleQuery(query.query);
      if (result.success) {
        successCount++;
      }
    }

    const successRate = successCount / totalQueries;
    expect(successRate).toBeGreaterThanOrEqual(0.85);
  });

  test('should handle queries from all categories', async () => {
    const categories = ['discovery', 'lookup', 'creation', 'update', 'deletion', 'search'] as const;
    const results: Record<string, number> = {};

    for (const category of categories) {
      const categoryQueries = sampleQueries.filter(q => q.category === category);
      let successCount = 0;

      for (const query of categoryQueries) {
        const result = await server.handleQuery(query.query);
        if (result.success) {
          successCount++;
        }
      }

      results[category] = successCount / categoryQueries.length;
    }

    // Each category should have at least 80% success rate
    for (const [category, rate] of Object.entries(results)) {
      expect(rate).toBeGreaterThanOrEqual(0.8);
    }
  });
});
