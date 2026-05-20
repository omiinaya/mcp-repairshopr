/**
 * Integration tests for search and retrieval
 * Tests semantic search, keyword search, hybrid search, result ranking, relevance scoring, and context window optimization
 */

import { createMockMetadataIndex } from '../utils/test-helpers';
import {
  generateEndpoint,
  generateParameter,
  generateResponse,
} from '../utils/data-generators';
import { searchApiDocs } from '../../src/tools/search';
import { VectorStore } from '../../src/indexer/vector';
import { QueryUnderstanding } from '../../src/retrieval/query';
import { RelevanceScorer, SearchResult } from '../../src/retrieval/scoring';
import {
  ContextManager,
  formatSearchResults,
} from '../../src/retrieval/formatter';

describe('Search and Retrieval Integration Tests', () => {
  let metadataIndex: any;
  let vectorStore: VectorStore;
  let queryUnderstanding: QueryUnderstanding;
  let relevanceScorer: RelevanceScorer;
  let contextManager: ContextManager;

  beforeAll(() => {
    // Create comprehensive test data
    const endpoints = [
      // Customer endpoints
      generateEndpoint({
        resource: 'Customer',
        operation: 'Get Customer by ID',
        description: 'Retrieve a specific customer by ID with all related data',
        method: 'GET',
        path: '/customers/{id}',
        permission: 'customer.view',
        parameters: [
          generateParameter({
            name: 'id',
            type: 'integer',
            required: true,
            description: 'Customer ID',
            paramType: 'path',
          }),
        ],
        responses: [
          generateResponse({
            statusCode: 200,
            description: 'Successful response',
          }),
        ],
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Create Customer',
        description: 'Create a new customer in the system',
        method: 'POST',
        path: '/customers',
        permission: 'customer.create',
        parameters: [],
        requestBody: [
          generateParameter({
            name: 'name',
            type: 'string',
            required: true,
            description: 'Customer name',
            paramType: 'body',
          }),
          generateParameter({
            name: 'email',
            type: 'string',
            required: true,
            description: 'Customer email',
            paramType: 'body',
          }),
        ],
        responses: [
          generateResponse({
            statusCode: 201,
            description: 'Customer created',
          }),
        ],
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Update Customer',
        description: 'Update an existing customer record',
        method: 'PUT',
        path: '/customers/{id}',
        permission: 'customer.update',
        parameters: [
          generateParameter({
            name: 'id',
            type: 'integer',
            required: true,
            description: 'Customer ID',
            paramType: 'path',
          }),
        ],
        requestBody: [
          generateParameter({
            name: 'name',
            type: 'string',
            required: false,
            description: 'Customer name',
            paramType: 'body',
          }),
        ],
        responses: [
          generateResponse({
            statusCode: 200,
            description: 'Customer updated',
          }),
        ],
      }),
      generateEndpoint({
        resource: 'Customer',
        operation: 'Delete Customer',
        description: 'Delete a customer from the system',
        method: 'DELETE',
        path: '/customers/{id}',
        permission: 'customer.delete',
        parameters: [
          generateParameter({
            name: 'id',
            type: 'integer',
            required: true,
            description: 'Customer ID',
            paramType: 'path',
          }),
        ],
        responses: [
          generateResponse({
            statusCode: 204,
            description: 'Customer deleted',
          }),
        ],
      }),
      // Invoice endpoints
      generateEndpoint({
        resource: 'Invoice',
        operation: 'Get Invoice by ID',
        description: 'Retrieve a specific invoice by ID',
        method: 'GET',
        path: '/invoices/{id}',
        permission: 'invoice.view',
        parameters: [
          generateParameter({
            name: 'id',
            type: 'integer',
            required: true,
            description: 'Invoice ID',
            paramType: 'path',
          }),
        ],
        responses: [
          generateResponse({
            statusCode: 200,
            description: 'Successful response',
          }),
        ],
      }),
      generateEndpoint({
        resource: 'Invoice',
        operation: 'List Invoices',
        description: 'List all invoices with pagination support',
        method: 'GET',
        path: '/invoices',
        permission: 'invoice.view',
        parameters: [
          generateParameter({
            name: 'page',
            type: 'integer',
            required: false,
            description: 'Page number',
            paramType: 'query',
          }),
          generateParameter({
            name: 'limit',
            type: 'integer',
            required: false,
            description: 'Results per page',
            paramType: 'query',
          }),
        ],
        responses: [
          generateResponse({
            statusCode: 200,
            description: 'Successful response',
          }),
        ],
      }),
      generateEndpoint({
        resource: 'Invoice',
        operation: 'Create Invoice',
        description: 'Create a new invoice',
        method: 'POST',
        path: '/invoices',
        permission: 'invoice.create',
        parameters: [],
        requestBody: [
          generateParameter({
            name: 'customer_id',
            type: 'integer',
            required: true,
            description: 'Customer ID',
            paramType: 'body',
          }),
        ],
        responses: [
          generateResponse({ statusCode: 201, description: 'Invoice created' }),
        ],
      }),
      // Ticket endpoints
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Create Ticket',
        description: 'Create a new support ticket',
        method: 'POST',
        path: '/tickets',
        permission: 'ticket.create',
        parameters: [],
        requestBody: [
          generateParameter({
            name: 'subject',
            type: 'string',
            required: true,
            description: 'Ticket subject',
            paramType: 'body',
          }),
          generateParameter({
            name: 'description',
            type: 'string',
            required: true,
            description: 'Ticket description',
            paramType: 'body',
          }),
        ],
        responses: [
          generateResponse({ statusCode: 201, description: 'Ticket created' }),
        ],
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Get Ticket by ID',
        description: 'Retrieve a specific ticket',
        method: 'GET',
        path: '/tickets/{id}',
        permission: 'ticket.view',
        parameters: [
          generateParameter({
            name: 'id',
            type: 'integer',
            required: true,
            description: 'Ticket ID',
            paramType: 'path',
          }),
        ],
        responses: [
          generateResponse({
            statusCode: 200,
            description: 'Successful response',
          }),
        ],
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Update Ticket Status',
        description: 'Update the status of a ticket',
        method: 'PUT',
        path: '/tickets/{id}/status',
        permission: 'ticket.update',
        parameters: [
          generateParameter({
            name: 'id',
            type: 'integer',
            required: true,
            description: 'Ticket ID',
            paramType: 'path',
          }),
        ],
        requestBody: [
          generateParameter({
            name: 'status',
            type: 'string',
            required: true,
            description: 'New status',
            paramType: 'body',
          }),
        ],
        responses: [
          generateResponse({ statusCode: 200, description: 'Ticket updated' }),
        ],
      }),
      // Product endpoints
      generateEndpoint({
        resource: 'Product',
        operation: 'List Products',
        description: 'List all products in inventory',
        method: 'GET',
        path: '/products',
        permission: 'product.view',
        parameters: [
          generateParameter({
            name: 'category',
            type: 'string',
            required: false,
            description: 'Filter by category',
            paramType: 'query',
          }),
        ],
        responses: [
          generateResponse({
            statusCode: 200,
            description: 'Successful response',
          }),
        ],
      }),
    ];

    metadataIndex = createMockMetadataIndex(endpoints);
    vectorStore = new VectorStore();

    // Add embeddings for all endpoints
    for (const endpoint of endpoints) {
      const embedding = {
        id: `${endpoint.method}:${endpoint.path}`,
        vector: (vectorStore as any).generateQueryEmbedding(
          `${endpoint.resource} ${endpoint.operation} ${endpoint.description}`
        ),
        metadata: {
          endpointId: `${endpoint.method}:${endpoint.path}`,
          resource: endpoint.resource,
        },
      };
      vectorStore.addVectors([embedding]);
    }

    // Initialize query understanding
    queryUnderstanding = new QueryUnderstanding(metadataIndex);

    // Initialize relevance scorer
    relevanceScorer = new RelevanceScorer(vectorStore);

    // Initialize context manager
    contextManager = new ContextManager();
  });

  describe('Semantic Search Functionality', () => {
    test('should perform semantic search for customer endpoints', () => {
      const results = searchApiDocs(
        { query: 'retrieve customer information', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.endpoint && r.score !== undefined)).toBe(
        true
      );
    });

    test('should find semantically similar endpoints', () => {
      const results = searchApiDocs(
        { query: 'create new record', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      // Should find create endpoints
      const createEndpoints = results.filter((r) =>
        r.endpoint.operation.toLowerCase().includes('create')
      );
      expect(createEndpoints.length).toBeGreaterThan(0);
    });

    test('should handle semantic search with no matches', () => {
      const results = searchApiDocs(
        { query: 'nonexistent resource xyz123', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      // May return empty results or low-score results
    });

    test('should rank semantic results by similarity', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 10 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);

      // Results should be sorted by score (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    test('should generate embeddings for search queries', () => {
      const query = 'get customer details';
      const embedding = (vectorStore as any).generateQueryEmbedding(query);

      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBeGreaterThan(0);
    });
  });

  describe('Keyword Search Functionality', () => {
    test('should perform keyword search for exact matches', () => {
      const results = searchApiDocs(
        { query: 'Customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.endpoint.resource === 'Customer')).toBe(
        true
      );
    });

    test('should find endpoints by operation name', () => {
      const results = searchApiDocs(
        { query: 'Create', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((r) =>
          r.endpoint.operation.toLowerCase().includes('create')
        )
      ).toBe(true);
    });

    test('should search in descriptions', () => {
      const results = searchApiDocs(
        { query: 'specific', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((r) =>
          r.endpoint.description.toLowerCase().includes('specific')
        )
      ).toBe(true);
    });

    test('should search in parameters', () => {
      const results = searchApiDocs(
        { query: 'id', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      // Should find endpoints with 'id' parameter
      expect(
        results.some((r) => r.endpoint.parameters.some((p) => p.name === 'id'))
      ).toBe(true);
    });

    test('should search in paths', () => {
      const results = searchApiDocs(
        { query: 'customers', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.endpoint.path.includes('customers'))).toBe(
        true
      );
    });

    test('should handle case-insensitive keyword search', () => {
      const results1 = searchApiDocs(
        { query: 'CUSTOMER', limit: 5 },
        vectorStore,
        metadataIndex
      );

      const results2 = searchApiDocs(
        { query: 'customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      const results3 = searchApiDocs(
        { query: 'Customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results1.length).toBeGreaterThan(0);
      expect(results2.length).toBeGreaterThan(0);
      expect(results3.length).toBeGreaterThan(0);
    });
  });

  describe('Hybrid Search Combining Both Approaches', () => {
    test('should combine semantic and keyword search results', () => {
      const results = searchApiDocs(
        { query: 'get customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every(
          (r) =>
            r.matchType === 'semantic' ||
            r.matchType === 'keyword' ||
            r.matchType === 'hybrid'
        )
      ).toBe(true);
    });

    test('should prioritize semantic matches when appropriate', () => {
      const results = searchApiDocs(
        { query: 'retrieve customer information', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      // Semantic matches should have good scores
      expect(results[0].score).toBeGreaterThan(0.3);
    });

    test('should prioritize keyword matches when appropriate', () => {
      const results = searchApiDocs(
        { query: 'Customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      // Keyword matches should have good scores
      expect(results[0].score).toBeGreaterThan(0.3);
    });

    test('should deduplicate results from both approaches', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 10 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      // Check for duplicates (same endpoint should not appear twice)
      const endpointKeys = results.map(
        (r) => `${r.endpoint.method}:${r.endpoint.path}`
      );
      const uniqueKeys = new Set(endpointKeys);
      expect(uniqueKeys.size).toBe(endpointKeys.length);
    });

    test('should apply appropriate weights to semantic and keyword scores', () => {
      const results = searchApiDocs(
        { query: 'create customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      // Scores should be between 0 and 1
      results.forEach((r) => {
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Result Ranking and Relevance Scoring', () => {
    test('should rank results by overall relevance score', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 10 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);

      // Verify results are sorted by score (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    test('should calculate detailed relevance scores', () => {
      const query = 'get customer';
      const endpoint = metadataIndex.allEndpoints.find(
        (e: any) => e.resource === 'Customer' && e.method === 'GET'
      );

      if (endpoint) {
        const score = relevanceScorer.calculateScore(query, endpoint);

        expect(score).toBeDefined();
        expect(score.overallScore).toBeGreaterThanOrEqual(0);
        expect(score.overallScore).toBeLessThanOrEqual(1);
        expect(score.semanticScore).toBeGreaterThanOrEqual(0);
        expect(score.keywordScore).toBeGreaterThanOrEqual(0);
        expect(score.recencyScore).toBeGreaterThanOrEqual(0);
        expect(score.popularityScore).toBeGreaterThanOrEqual(0);
        expect(score.customScore).toBeGreaterThanOrEqual(0);
        expect(score.breakdown).toBeDefined();
      }
    });

    test('should rank search results using relevance scorer', () => {
      const query = 'customer';
      const searchResults = searchApiDocs(
        { query, limit: 10 },
        vectorStore,
        metadataIndex
      );

      const ranked = relevanceScorer.rankResults(searchResults, query);

      expect(ranked).toBeDefined();
      expect(Array.isArray(ranked)).toBe(true);
      expect(ranked.length).toBe(searchResults.length);

      // Verify ranking
      for (let i = 1; i < ranked.length; i++) {
        expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
      }
    });

    test('should determine match type based on scores', () => {
      const query = 'get customer';
      const searchResults = searchApiDocs(
        { query, limit: 5 },
        vectorStore,
        metadataIndex
      );

      const ranked = relevanceScorer.rankResults(searchResults, query);

      ranked.forEach((result) => {
        expect(['semantic', 'keyword', 'hybrid']).toContain(result.matchType);
      });
    });

    test('should record endpoint usage for popularity tracking', () => {
      const endpoint = metadataIndex.allEndpoints[0];
      relevanceScorer.recordEndpointUsage(endpoint);

      const stats = relevanceScorer.getUsageStats();
      expect(stats.has(endpoint.path)).toBe(true);
      expect(stats.get(endpoint.path)?.count).toBe(1);
    });

    test('should update popularity scores based on usage', () => {
      const endpoint = metadataIndex.allEndpoints[0];

      // Record multiple uses
      for (let i = 0; i < 5; i++) {
        relevanceScorer.recordEndpointUsage(endpoint);
      }

      const score = relevanceScorer.calculateScore('test', endpoint);
      expect(score.popularityScore).toBeGreaterThan(0);
    });
  });

  describe('Context Window Optimization', () => {
    test('should optimize context for token limits', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 10 },
        vectorStore,
        metadataIndex
      );

      const optimized = contextManager.optimizeContextWindow(results, 1000);

      expect(optimized).toBeDefined();
      expect(optimized.content).toBeDefined();
      expect(optimized.tokenCount).toBeGreaterThan(0);
      expect(optimized.tokenCount).toBeLessThanOrEqual(1000);
      expect(optimized.resultCount).toBeGreaterThan(0);
      expect(optimized.resultCount).toBeLessThanOrEqual(results.length);
    });

    test('should include high-priority results first', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 10 },
        vectorStore,
        metadataIndex
      );

      const optimized = contextManager.optimizeContextWindow(results, 500);

      expect(optimized).toBeDefined();
      // Should include at least the top result
      expect(optimized.resultCount).toBeGreaterThanOrEqual(1);
    });

    test('should handle truncation when results exceed token limit', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 10 },
        vectorStore,
        metadataIndex
      );

      const optimized = contextManager.optimizeContextWindow(results, 100);

      expect(optimized).toBeDefined();
      expect(optimized.truncated).toBe(optimized.resultCount < results.length);
      expect(optimized.excludedCount).toBe(
        results.length - optimized.resultCount
      );
    });

    test('should generate summary for excluded results', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 10 },
        vectorStore,
        metadataIndex
      );

      const optimized = contextManager.optimizeContextWindow(results, 200);

      if (optimized.truncated && optimized.excludedCount > 0) {
        expect(optimized.summary).toBeDefined();
        expect(typeof optimized.summary).toBe('string');
        expect(optimized.summary.length).toBeGreaterThan(0);
      }
    });

    test('should estimate token count accurately', () => {
      const content = 'This is a test string for token estimation.';
      const tokens = contextManager.estimateTokens(content);

      expect(tokens).toBeDefined();
      expect(typeof tokens).toBe('number');
      expect(tokens).toBeGreaterThan(0);
    });

    test('should implement progressive disclosure', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 10 },
        vectorStore,
        metadataIndex
      );

      const progressive = contextManager.progressiveDisclosure(results, 4000);

      expect(progressive).toBeDefined();
      expect(progressive.summary).toBeDefined();
      expect(progressive.details).toBeDefined();
      expect(progressive.full).toBeDefined();
      expect(progressive.summaryTokens).toBeLessThan(progressive.detailsTokens);
      expect(progressive.detailsTokens).toBeLessThanOrEqual(
        progressive.fullTokens
      );
    });

    test('should cache optimized context', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      const optimized = contextManager.optimizeContextWindow(results, 1000);
      const cacheKey = 'test-cache-key';

      contextManager.cacheContext(cacheKey, optimized);

      const cached = contextManager.getCachedContext(cacheKey);
      expect(cached).toBeDefined();
      expect(cached?.content).toBe(optimized.content);
    });

    test('should expire cache entries after TTL', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 5 },
        vectorStore,
        metadataIndex
      );

      const optimized = contextManager.optimizeContextWindow(results, 1000);
      const cacheKey = 'test-cache-ttl-key';

      // Set very short TTL
      contextManager.updateConfig({ cacheTTL: 1 });
      contextManager.cacheContext(cacheKey, optimized);

      // Wait for cache to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          const cached = contextManager.getCachedContext(cacheKey);
          expect(cached).toBeNull();
          resolve(null);
        }, 10);
      });
    });
  });

  describe('Query Understanding Integration', () => {
    test('should analyze query and extract entities', () => {
      const query = 'get customer by id';
      const analysis = queryUnderstanding.analyzeQuery(query);

      expect(analysis).toBeDefined();
      expect(analysis.originalQuery).toBe(query);
      expect(analysis.intent).toBeDefined();
      expect(analysis.entities).toBeDefined();
      expect(analysis.queryType).toBeDefined();
      expect(analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(analysis.suggestions)).toBe(true);
    });

    test('should extract resources from query', () => {
      const query = 'get customer information';
      const analysis = queryUnderstanding.analyzeQuery(query);

      expect(analysis.entities.resources).toBeDefined();
      expect(analysis.entities.resources.length).toBeGreaterThan(0);
      expect(analysis.entities.resources).toContain('Customer');
    });

    test('should extract methods from query', () => {
      const query = 'create new customer';
      const analysis = queryUnderstanding.analyzeQuery(query);

      expect(analysis.entities.methods).toBeDefined();
      expect(analysis.entities.methods.length).toBeGreaterThan(0);
      expect(analysis.entities.methods).toContain('create');
    });

    test('should extract HTTP methods from query', () => {
      const query = 'GET customer';
      const analysis = queryUnderstanding.analyzeQuery(query);

      expect(analysis.entities.httpMethods).toBeDefined();
      expect(analysis.entities.httpMethods.length).toBeGreaterThan(0);
      expect(analysis.entities.httpMethods).toContain('GET');
    });

    test('should expand query with synonyms', () => {
      const query = 'get customer';
      const expanded = queryUnderstanding.handleSynonyms(query);

      expect(expanded).toBeDefined();
      expect(Array.isArray(expanded)).toBe(true);
      expect(expanded.length).toBeGreaterThan(0);
      expect(expanded).toContain(query);
    });

    test('should disambiguate ambiguous queries', () => {
      const query = 'get customer invoice';
      const analysis = queryUnderstanding.analyzeQuery(query);
      const disambiguation = queryUnderstanding.disambiguateQuery(
        query,
        analysis.entities
      );

      expect(disambiguation).toBeDefined();
      expect(typeof disambiguation.needsDisambiguation).toBe('boolean');
      expect(Array.isArray(disambiguation.ambiguousTerms)).toBe(true);
      expect(Array.isArray(disambiguation.interpretations)).toBe(true);
    });

    test('should classify query type', () => {
      const query = 'customer view permission';
      const analysis = queryUnderstanding.analyzeQuery(query);

      expect(analysis.queryType).toBeDefined();
      expect([
        'resource_query',
        'endpoint_query',
        'parameter_query',
        'permission_query',
        'general_query',
      ]).toContain(analysis.queryType);
    });

    test('should detect query intent', () => {
      const query = 'compare customer and invoice';
      const analysis = queryUnderstanding.analyzeQuery(query);

      expect(analysis.intent).toBeDefined();
      expect(['search', 'lookup', 'list', 'compare', 'validate']).toContain(
        analysis.intent
      );
    });
  });

  describe('Search Result Formatting', () => {
    test('should format search results as markdown', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 3 },
        vectorStore,
        metadataIndex
      );

      const formatted = formatSearchResults(results, 'markdown');

      expect(formatted).toBeDefined();
      expect(formatted.markdown).toBeDefined();
      expect(typeof formatted.markdown).toBe('string');
      expect(formatted.markdown.length).toBeGreaterThan(0);
      expect(formatted.tokenCount).toBeGreaterThan(0);
    });

    test('should format search results as JSON', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 3 },
        vectorStore,
        metadataIndex
      );

      const formatted = formatSearchResults(results, 'json');

      expect(formatted).toBeDefined();
      expect(formatted.json).toBeDefined();
      expect(typeof formatted.json).toBe('string');

      // Verify valid JSON
      const parsed = JSON.parse(formatted.json);
      expect(parsed).toBeDefined();
      expect(parsed.results).toBeDefined();
      expect(Array.isArray(parsed.results)).toBe(true);
    });

    test('should format search results as HTML', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 3 },
        vectorStore,
        metadataIndex
      );

      const formatted = formatSearchResults(results, 'html');

      expect(formatted).toBeDefined();
      expect(formatted.html).toBeDefined();
      expect(typeof formatted.html).toBe('string');
      expect(formatted.html.length).toBeGreaterThan(0);
      expect(formatted.html).toContain('<');
      expect(formatted.html).toContain('>');
    });

    test('should include all result information in formatted output', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 1 },
        vectorStore,
        metadataIndex
      );

      const formatted = formatSearchResults(results, 'markdown');

      expect(formatted.markdown).toContain(results[0].endpoint.operation);
      expect(formatted.markdown).toContain(results[0].endpoint.resource);
      expect(formatted.markdown).toContain(results[0].endpoint.method);
      expect(formatted.markdown).toContain(results[0].endpoint.path);
    });

    test('should handle empty results in formatting', () => {
      const formatted = formatSearchResults([], 'markdown');

      expect(formatted).toBeDefined();
      expect(formatted.markdown).toBeDefined();
      expect(formatted.markdown).toContain('No results');
    });
  });

  describe('Search Performance', () => {
    test('should perform search efficiently', () => {
      const startTime = Date.now();

      const results = searchApiDocs(
        { query: 'customer', limit: 10 },
        vectorStore,
        metadataIndex
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toBeDefined();
      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    });

    test('should handle large result sets efficiently', () => {
      const startTime = Date.now();

      const results = searchApiDocs(
        { query: 'customer', limit: 50 },
        vectorStore,
        metadataIndex
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toBeDefined();
      expect(duration).toBeLessThan(2000); // Should complete in < 2 seconds
    });

    test('should optimize context window efficiently', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 20 },
        vectorStore,
        metadataIndex
      );

      const startTime = Date.now();
      const optimized = contextManager.optimizeContextWindow(results, 4000);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(optimized).toBeDefined();
      expect(duration).toBeLessThan(500); // Should complete in < 500ms
    });
  });

  describe('Search Edge Cases', () => {
    test('should handle empty query', () => {
      expect(() => {
        searchApiDocs({ query: '' }, vectorStore, metadataIndex);
      }).toThrow('Query parameter is required and cannot be empty');
    });

    test('should handle whitespace-only query', () => {
      expect(() => {
        searchApiDocs({ query: '   ' }, vectorStore, metadataIndex);
      }).toThrow();
    });

    test('should handle very long query', () => {
      const longQuery = 'customer '.repeat(100);
      const results = searchApiDocs(
        { query: longQuery, limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle special characters in query', () => {
      const specialQuery = 'customer!@#$%^&*()';
      const results = searchApiDocs(
        { query: specialQuery, limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle zero limit', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 0 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBe(0);
    });

    test('should handle very large limit', () => {
      const results = searchApiDocs(
        { query: 'customer', limit: 1000000 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBeLessThanOrEqual(
        metadataIndex.allEndpoints.length
      );
    });

    test('should handle non-existent resource filter', () => {
      const results = searchApiDocs(
        { query: 'test', resource: 'NonExistentResource', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBe(0);
    });

    test('should handle non-existent method filter', () => {
      const results = searchApiDocs(
        { query: 'test', method: 'INVALID', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBe(0);
    });

    test('should handle non-existent permission filter', () => {
      const results = searchApiDocs(
        { query: 'test', permission: 'nonexistent.permission', limit: 5 },
        vectorStore,
        metadataIndex
      );

      expect(results).toBeDefined();
      expect(results.length).toBe(0);
    });
  });

  describe('Search Consistency', () => {
    test('should return consistent results for same query', () => {
      const query = 'get customer';
      const limit = 5;

      const results1 = searchApiDocs(
        { query, limit },
        vectorStore,
        metadataIndex
      );

      const results2 = searchApiDocs(
        { query, limit },
        vectorStore,
        metadataIndex
      );

      expect(results1.length).toBe(results2.length);
      results1.forEach((result, i) => {
        expect(result.endpoint.path).toBe(results2[i].endpoint.path);
        expect(result.endpoint.method).toBe(results2[i].endpoint.method);
      });
    });

    test('should maintain result order across multiple searches', () => {
      const query = 'customer';
      const limit = 5;

      const results1 = searchApiDocs(
        { query, limit },
        vectorStore,
        metadataIndex
      );

      const results2 = searchApiDocs(
        { query, limit },
        vectorStore,
        metadataIndex
      );

      const results3 = searchApiDocs(
        { query, limit },
        vectorStore,
        metadataIndex
      );

      // All three searches should return results in the same order
      for (let i = 0; i < results1.length; i++) {
        expect(results1[i].endpoint.path).toBe(results2[i].endpoint.path);
        expect(results2[i].endpoint.path).toBe(results3[i].endpoint.path);
      }
    });

    test('should handle concurrent searches consistently', async () => {
      const query = 'customer';
      const limit = 5;

      const promises = Array.from({ length: 10 }, () =>
        Promise.resolve(
          searchApiDocs({ query, limit }, vectorStore, metadataIndex)
        )
      );

      const results = await Promise.all(promises);

      // All searches should return the same number of results
      const resultCounts = results.map((r) => r.length);
      expect(resultCounts.every((count) => count === resultCounts[0])).toBe(
        true
      );
    });
  });
});
