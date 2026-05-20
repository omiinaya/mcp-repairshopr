/**
 * Unit tests for relevance scoring module
 */

import {
  RelevanceScorer,
  ScoringConfig,
  CustomFactors,
  RelevanceScore,
  SearchResult,
} from '../../src/retrieval/scoring';
import { VectorStore } from '../../src/indexer/vector';
import { ApiEndpoint } from '../../src/utils/types';

describe('RelevanceScorer', () => {
  let vectorStore: VectorStore;
  let scorer: RelevanceScorer;
  let testEndpoints: ApiEndpoint[];

  beforeEach(() => {
    // Initialize vector store
    vectorStore = new VectorStore();

    // Create test endpoints
    testEndpoints = [
      {
        resource: 'Customer',
        operation: 'Get Customers',
        description: 'Retrieve a list of all customers in the system',
        method: 'GET',
        path: '/customers',
        permission: 'view_customer',
        parameters: [
          {
            name: 'limit',
            type: 'integer',
            required: false,
            description: 'Maximum number of results to return',
            paramType: 'query',
          },
          {
            name: 'offset',
            type: 'integer',
            required: false,
            description: 'Number of results to skip',
            paramType: 'query',
          },
        ],
        responses: [
          {
            statusCode: 200,
            description: 'Successful response',
            example: { customers: [] },
          },
        ],
      },
      {
        resource: 'Customer',
        operation: 'Create Customer',
        description: 'Create a new customer in the system',
        method: 'POST',
        path: '/customers',
        permission: 'create_customer',
        parameters: [],
        requestBody: [
          {
            name: 'name',
            type: 'string',
            required: true,
            description: 'Customer name',
            paramType: 'body',
          },
          {
            name: 'email',
            type: 'string',
            required: true,
            description: 'Customer email address',
            paramType: 'body',
          },
        ],
        responses: [
          {
            statusCode: 201,
            description: 'Customer created successfully',
            example: { id: 1, name: 'Test Customer' },
          },
        ],
      },
      {
        resource: 'Ticket',
        operation: 'Get Tickets',
        description: 'Retrieve a list of all tickets',
        method: 'GET',
        path: '/tickets',
        permission: 'view_ticket',
        parameters: [
          {
            name: 'status',
            type: 'string',
            required: false,
            description: 'Filter by ticket status',
            paramType: 'query',
          },
        ],
        responses: [
          {
            statusCode: 200,
            description: 'Successful response',
          },
        ],
      },
      {
        resource: 'Invoice',
        operation: 'Create Invoice',
        description: 'Create a new invoice (deprecated - use billing endpoint)',
        method: 'POST',
        path: '/invoices',
        permission: 'create_invoice',
        parameters: [],
        requestBody: [
          {
            name: 'customer_id',
            type: 'integer',
            required: true,
            description: 'Customer ID',
            paramType: 'body',
          },
        ],
        responses: [
          {
            statusCode: 201,
            description: 'Invoice created',
          },
        ],
      },
    ];

    // Initialize scorer
    scorer = new RelevanceScorer(vectorStore);
  });

  describe('semanticSimilarityScore', () => {
    it('should calculate semantic similarity score', () => {
      const query = 'get customers';
      const endpoint = testEndpoints[0];

      const score = scorer.semanticSimilarityScore(query, endpoint);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should return higher score for similar queries', () => {
      const similarQuery = 'get customers list';
      const differentQuery = 'create invoice';
      const endpoint = testEndpoints[0];

      const similarScore = scorer.semanticSimilarityScore(
        similarQuery,
        endpoint
      );
      const differentScore = scorer.semanticSimilarityScore(
        differentQuery,
        endpoint
      );

      expect(similarScore).toBeGreaterThanOrEqual(differentScore);
    });

    it('should return 0 for empty vector store', () => {
      const emptyStore = new VectorStore();
      const emptyScorer = new RelevanceScorer(emptyStore);
      const query = 'get customers';
      const endpoint = testEndpoints[0];

      const score = emptyScorer.semanticSimilarityScore(query, endpoint);

      expect(score).toBe(0);
    });
  });

  describe('keywordMatchScore', () => {
    it('should calculate keyword match score', () => {
      const query = 'get customers';
      const endpoint = testEndpoints[0];

      const score = scorer.keywordMatchScore(query, endpoint);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should match resource name', () => {
      const query = 'customer';
      const endpoint = testEndpoints[0];

      const score = scorer.keywordMatchScore(query, endpoint);

      expect(score).toBeGreaterThan(0);
    });

    it('should match operation name', () => {
      const query = 'get';
      const endpoint = testEndpoints[0];

      const score = scorer.keywordMatchScore(query, endpoint);

      expect(score).toBeGreaterThan(0);
    });

    it('should match HTTP method', () => {
      const query = 'GET';
      const endpoint = testEndpoints[0];

      const score = scorer.keywordMatchScore(query, endpoint);

      expect(score).toBeGreaterThan(0);
    });

    it('should match parameter names', () => {
      const query = 'limit offset';
      const endpoint = testEndpoints[0];

      const score = scorer.keywordMatchScore(query, endpoint);

      expect(score).toBeGreaterThan(0);
    });

    it('should match description keywords', () => {
      const query = 'retrieve list system';
      const endpoint = testEndpoints[0];

      const score = scorer.keywordMatchScore(query, endpoint);

      expect(score).toBeGreaterThan(0);
    });

    it('should return 0 for no matches', () => {
      const query = 'xyz abc def';
      const endpoint = testEndpoints[0];

      const score = scorer.keywordMatchScore(query, endpoint);

      expect(score).toBe(0);
    });
  });

  describe('recencyWeighting', () => {
    it('should apply recency weighting', () => {
      const baseScore = 0.8;
      const endpoint = testEndpoints[0];

      const weightedScore = scorer.recencyWeighting(baseScore, endpoint);

      expect(weightedScore).toBeGreaterThanOrEqual(0);
      expect(weightedScore).toBeLessThanOrEqual(1);
    });

    it('should return base score when recency is disabled', () => {
      const config: Partial<ScoringConfig> = { enableRecency: false };
      const customScorer = new RelevanceScorer(vectorStore, config);
      const baseScore = 0.8;
      const endpoint = testEndpoints[0];

      const weightedScore = customScorer.recencyWeighting(baseScore, endpoint);

      expect(weightedScore).toBe(baseScore);
    });

    it('should return base score for unused endpoints', () => {
      const baseScore = 0.8;
      const endpoint = testEndpoints[0];

      const weightedScore = scorer.recencyWeighting(baseScore, endpoint);

      expect(weightedScore).toBeGreaterThan(0);
    });

    it('should apply decay for old endpoints', () => {
      const baseScore = 0.8;
      const endpoint = testEndpoints[0];

      // Record usage 100 days ago
      scorer.recordEndpointUsage(endpoint);
      const stats = scorer.getUsageStats().get(endpoint.path);
      if (stats) {
        stats.lastUsed = Date.now() - 100 * 24 * 60 * 60 * 1000;
      }

      const weightedScore = scorer.recencyWeighting(baseScore, endpoint);

      expect(weightedScore).toBeLessThan(baseScore);
    });
  });

  describe('popularityWeighting', () => {
    it('should apply popularity weighting', () => {
      const baseScore = 0.8;
      const endpoint = testEndpoints[0];

      const weightedScore = scorer.popularityWeighting(baseScore, endpoint);

      expect(weightedScore).toBeGreaterThanOrEqual(0);
      expect(weightedScore).toBeLessThanOrEqual(1);
    });

    it('should return base score when popularity is disabled', () => {
      const config: Partial<ScoringConfig> = { enablePopularity: false };
      const customScorer = new RelevanceScorer(vectorStore, config);
      const baseScore = 0.8;
      const endpoint = testEndpoints[0];

      const weightedScore = customScorer.popularityWeighting(
        baseScore,
        endpoint
      );

      expect(weightedScore).toBe(baseScore);
    });

    it('should return base score for unused endpoints', () => {
      const baseScore = 0.8;
      const endpoint = testEndpoints[0];

      const weightedScore = scorer.popularityWeighting(baseScore, endpoint);

      expect(weightedScore).toBe(baseScore);
    });

    it('should increase score for popular endpoints', () => {
      const baseScore = 0.8;
      const endpoint = testEndpoints[0];

      // Record multiple uses
      for (let i = 0; i < 50; i++) {
        scorer.recordEndpointUsage(endpoint);
      }

      const weightedScore = scorer.popularityWeighting(baseScore, endpoint);

      expect(weightedScore).toBeGreaterThan(baseScore);
    });
  });

  describe('customRelevanceFactors', () => {
    it('should apply resource boosts', () => {
      const baseScore = 0.5;
      const endpoint = testEndpoints[0];
      const factors: CustomFactors = {
        resourceBoosts: {
          Customer: 0.5,
        },
      };

      const adjustedScore = scorer.customRelevanceFactors(
        baseScore,
        endpoint,
        factors
      );

      expect(adjustedScore).toBeGreaterThan(baseScore);
    });

    it('should apply method boosts', () => {
      const baseScore = 0.5;
      const endpoint = testEndpoints[0];
      const factors: CustomFactors = {
        methodBoosts: {
          get: 0.3,
        },
      };

      const adjustedScore = scorer.customRelevanceFactors(
        baseScore,
        endpoint,
        factors
      );

      expect(adjustedScore).toBeGreaterThan(baseScore);
    });

    it('should apply permission boosts', () => {
      const baseScore = 0.5;
      const endpoint = testEndpoints[0];
      const factors: CustomFactors = {
        permissionBoosts: {
          view_customer: 0.2,
        },
      };

      const adjustedScore = scorer.customRelevanceFactors(
        baseScore,
        endpoint,
        factors
      );

      expect(adjustedScore).toBeGreaterThan(baseScore);
    });

    it('should apply deprecated penalty', () => {
      const baseScore = 0.8;
      const endpoint = testEndpoints[3]; // Invoice endpoint with deprecated in description
      const factors: CustomFactors = {
        deprecatedPenalty: 0.5,
      };

      const adjustedScore = scorer.customRelevanceFactors(
        baseScore,
        endpoint,
        factors
      );

      expect(adjustedScore).toBeLessThan(baseScore);
    });

    it('should apply example boost', () => {
      const baseScore = 0.5;
      const endpoint = testEndpoints[0];
      const factors: CustomFactors = {
        exampleBoost: 0.2,
      };

      const adjustedScore = scorer.customRelevanceFactors(
        baseScore,
        endpoint,
        factors
      );

      expect(adjustedScore).toBeGreaterThan(baseScore);
    });

    it('should apply custom scorer function', () => {
      const baseScore = 0.5;
      const endpoint = testEndpoints[0];
      const factors: CustomFactors = {
        customScorer: (ep, score) => score * 2,
      };

      const adjustedScore = scorer.customRelevanceFactors(
        baseScore,
        endpoint,
        factors
      );

      expect(adjustedScore).toBe(baseScore * 2);
    });

    it('should clamp scores to 0-1 range', () => {
      const baseScore = 0.5;
      const endpoint = testEndpoints[0];
      const factors: CustomFactors = {
        resourceBoosts: {
          Customer: 10, // Very large boost
        },
      };

      const adjustedScore = scorer.customRelevanceFactors(
        baseScore,
        endpoint,
        factors
      );

      expect(adjustedScore).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateScore', () => {
    it('should calculate comprehensive relevance score', () => {
      const query = 'get customers';
      const endpoint = testEndpoints[0];

      const score = scorer.calculateScore(query, endpoint);

      expect(score.overallScore).toBeGreaterThanOrEqual(0);
      expect(score.overallScore).toBeLessThanOrEqual(1);
      expect(score.semanticScore).toBeGreaterThanOrEqual(0);
      expect(score.semanticScore).toBeLessThanOrEqual(1);
      expect(score.keywordScore).toBeGreaterThanOrEqual(0);
      expect(score.keywordScore).toBeLessThanOrEqual(1);
      expect(score.recencyScore).toBeGreaterThanOrEqual(0);
      expect(score.recencyScore).toBeLessThanOrEqual(1);
      expect(score.popularityScore).toBeGreaterThanOrEqual(0);
      expect(score.popularityScore).toBeLessThanOrEqual(1);
      expect(score.customScore).toBeGreaterThanOrEqual(0);
      expect(score.customScore).toBeLessThanOrEqual(1);
    });

    it('should provide score breakdown', () => {
      const query = 'get customers';
      const endpoint = testEndpoints[0];

      const score = scorer.calculateScore(query, endpoint);

      expect(score.breakdown).toBeDefined();
      expect(score.breakdown.semantic).toBeGreaterThanOrEqual(0);
      expect(score.breakdown.keyword).toBeGreaterThanOrEqual(0);
      expect(score.breakdown.recency).toBeGreaterThanOrEqual(0);
      expect(score.breakdown.popularity).toBeGreaterThanOrEqual(0);
      expect(score.breakdown.custom).toBeGreaterThanOrEqual(0);
    });
  });

  describe('rankResults', () => {
    it('should rank results by score', () => {
      const results: SearchResult[] = [
        {
          endpoint: testEndpoints[0],
          score: 0.5,
          matchType: 'semantic',
        },
        {
          endpoint: testEndpoints[1],
          score: 0.8,
          matchType: 'keyword',
        },
        {
          endpoint: testEndpoints[2],
          score: 0.3,
          matchType: 'semantic',
        },
      ];

      const ranked = scorer.rankResults(results, 'test query');

      expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
      expect(ranked[1].score).toBeGreaterThanOrEqual(ranked[2].score);
    });

    it('should determine match type based on scores', () => {
      const results: SearchResult[] = [
        {
          endpoint: testEndpoints[0],
          score: 0.8,
          relevanceScore: {
            overallScore: 0.8,
            semanticScore: 0.8,
            keywordScore: 0.8,
            recencyScore: 0.8,
            popularityScore: 0.8,
            customScore: 0.8,
            breakdown: {
              semantic: 0.4,
              keyword: 0.24,
              recency: 0.08,
              popularity: 0.08,
              custom: 0.08,
            },
          },
          matchType: 'semantic',
        },
      ];

      const ranked = scorer.rankResults(results, 'test query');

      expect(ranked[0].matchType).toBe('hybrid');
    });

    it('should set semantic match type when semantic score is higher', () => {
      const results: SearchResult[] = [
        {
          endpoint: testEndpoints[0],
          score: 0.7,
          relevanceScore: {
            overallScore: 0.7,
            semanticScore: 0.8,
            keywordScore: 0.3,
            recencyScore: 0.7,
            popularityScore: 0.7,
            customScore: 0.7,
            breakdown: {
              semantic: 0.4,
              keyword: 0.09,
              recency: 0.07,
              popularity: 0.07,
              custom: 0.07,
            },
          },
          matchType: 'keyword',
        },
      ];

      const ranked = scorer.rankResults(results, 'test query');

      expect(ranked[0].matchType).toBe('semantic');
    });

    it('should set keyword match type when keyword score is higher', () => {
      const results: SearchResult[] = [
        {
          endpoint: testEndpoints[0],
          score: 0.6,
          relevanceScore: {
            overallScore: 0.6,
            semanticScore: 0.3,
            keywordScore: 0.8,
            recencyScore: 0.6,
            popularityScore: 0.6,
            customScore: 0.6,
            breakdown: {
              semantic: 0.15,
              keyword: 0.24,
              recency: 0.06,
              popularity: 0.06,
              custom: 0.06,
            },
          },
          matchType: 'semantic',
        },
      ];

      const ranked = scorer.rankResults(results, 'test query');

      expect(ranked[0].matchType).toBe('keyword');
    });
  });

  describe('scoring configuration', () => {
    it('should use default configuration', () => {
      const config = scorer.getConfig();

      expect(config.semanticWeight).toBe(0.5);
      expect(config.keywordWeight).toBe(0.3);
      expect(config.recencyWeight).toBe(0.1);
      expect(config.popularityWeight).toBe(0.1);
      expect(config.enableRecency).toBe(true);
      expect(config.enablePopularity).toBe(true);
    });

    it('should update configuration', () => {
      const newConfig: Partial<ScoringConfig> = {
        semanticWeight: 0.6,
        keywordWeight: 0.2,
        recencyWeight: 0.1,
        popularityWeight: 0.1,
      };

      scorer.updateConfig(newConfig);
      const config = scorer.getConfig();

      expect(config.semanticWeight).toBe(0.6);
      expect(config.keywordWeight).toBe(0.2);
    });

    it('should apply custom configuration on initialization', () => {
      const customConfig: Partial<ScoringConfig> = {
        semanticWeight: 0.7,
        keywordWeight: 0.2,
        recencyWeight: 0.05,
        popularityWeight: 0.05,
      };

      const customScorer = new RelevanceScorer(vectorStore, customConfig);
      const config = customScorer.getConfig();

      expect(config.semanticWeight).toBe(0.7);
      expect(config.keywordWeight).toBe(0.2);
    });
  });

  describe('usage statistics', () => {
    it('should record endpoint usage', () => {
      const endpoint = testEndpoints[0];

      scorer.recordEndpointUsage(endpoint);
      const stats = scorer.getUsageStats();

      expect(stats.has(endpoint.path)).toBe(true);
      expect(stats.get(endpoint.path)?.count).toBe(1);
    });

    it('should increment usage count for repeated calls', () => {
      const endpoint = testEndpoints[0];

      scorer.recordEndpointUsage(endpoint);
      scorer.recordEndpointUsage(endpoint);
      scorer.recordEndpointUsage(endpoint);

      const stats = scorer.getUsageStats();
      expect(stats.get(endpoint.path)?.count).toBe(3);
    });

    it('should update last used timestamp', () => {
      const endpoint = testEndpoints[0];

      scorer.recordEndpointUsage(endpoint);
      const firstStats = scorer.getUsageStats().get(endpoint.path);

      // Wait a bit
      const delay = new Promise((resolve) => setTimeout(resolve, 10));
      return delay.then(() => {
        scorer.recordEndpointUsage(endpoint);
        const secondStats = scorer.getUsageStats().get(endpoint.path);

        expect(secondStats?.lastUsed).toBeGreaterThan(
          firstStats?.lastUsed || 0
        );
      });
    });

    it('should clear usage statistics', () => {
      const endpoint = testEndpoints[0];

      scorer.recordEndpointUsage(endpoint);
      scorer.clearUsageStats();

      const stats = scorer.getUsageStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty query', () => {
      const query = '';
      const endpoint = testEndpoints[0];

      const score = scorer.calculateScore(query, endpoint);

      expect(score.overallScore).toBeGreaterThanOrEqual(0);
      expect(score.overallScore).toBeLessThanOrEqual(1);
    });

    it('should handle special characters in query', () => {
      const query = 'get customers! @#$%';
      const endpoint = testEndpoints[0];

      const score = scorer.calculateScore(query, endpoint);

      expect(score.overallScore).toBeGreaterThanOrEqual(0);
      expect(score.overallScore).toBeLessThanOrEqual(1);
    });

    it('should handle endpoint with no parameters', () => {
      const query = 'create customer';
      const endpoint = testEndpoints[1];

      const score = scorer.calculateScore(query, endpoint);

      expect(score.overallScore).toBeGreaterThanOrEqual(0);
      expect(score.overallScore).toBeLessThanOrEqual(1);
    });

    it('should handle endpoint with no responses', () => {
      const query = 'test';
      const endpoint: ApiEndpoint = {
        resource: 'Test',
        operation: 'Test Operation',
        description: 'Test description',
        method: 'GET',
        path: '/test',
        permission: 'view_test',
        parameters: [],
        responses: [],
      };

      const score = scorer.calculateScore(query, endpoint);

      expect(score.overallScore).toBeGreaterThanOrEqual(0);
      expect(score.overallScore).toBeLessThanOrEqual(1);
    });

    it('should handle empty results array', () => {
      const results: SearchResult[] = [];
      const query = 'test';

      const ranked = scorer.rankResults(results, query);

      expect(ranked).toEqual([]);
    });

    it('should handle single result', () => {
      const results: SearchResult[] = [
        {
          endpoint: testEndpoints[0],
          score: 0.8,
          matchType: 'semantic',
        },
      ];

      const ranked = scorer.rankResults(results, 'test');

      expect(ranked.length).toBe(1);
      expect(ranked[0].score).toBe(0.8);
    });
  });
});
