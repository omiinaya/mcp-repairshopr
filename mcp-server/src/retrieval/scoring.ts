/**
 * Relevance scoring module for RepairShopr API documentation
 *
 * This module provides intelligent relevance scoring combining semantic similarity,
 * keyword matching, recency weighting, popularity weighting, and custom factors
 * to rank search results effectively.
 */

import { ApiEndpoint } from '../utils/types';
import { VectorStore } from '../indexer/vector';
import { QueryAnalysis } from './query';

/**
 * Scoring configuration options
 */
export interface ScoringConfig {
  /** Weight for semantic similarity score (0-1) */
  semanticWeight: number;
  /** Weight for keyword match score (0-1) */
  keywordWeight: number;
  /** Weight for recency factor (0-1) */
  recencyWeight: number;
  /** Weight for popularity factor (0-1) */
  popularityWeight: number;
  /** Enable recency weighting */
  enableRecency: boolean;
  /** Enable popularity weighting */
  enablePopularity: boolean;
  /** Recency decay rate (higher = faster decay) */
  recencyDecayRate: number;
  /** Base recency score for endpoints */
  baseRecencyScore: number;
}

/**
 * Custom relevance factors for scoring
 */
export interface CustomFactors {
  /** Boost factor for specific resources (resource name -> boost) */
  resourceBoosts?: Record<string, number>;
  /** Boost factor for specific methods (method -> boost) */
  methodBoosts?: Record<string, number>;
  /** Boost factor for specific permissions (permission -> boost) */
  permissionBoosts?: Record<string, number>;
  /** Penalty factor for deprecated endpoints */
  deprecatedPenalty?: number;
  /** Boost factor for endpoints with examples */
  exampleBoost?: number;
  /** Custom scoring function */
  customScorer?: (endpoint: ApiEndpoint, baseScore: number) => number;
}

/**
 * Detailed relevance score breakdown
 */
export interface RelevanceScore {
  /** Overall relevance score (0-1) */
  overallScore: number;
  /** Semantic similarity score (0-1) */
  semanticScore: number;
  /** Keyword match score (0-1) */
  keywordScore: number;
  /** Recency-weighted score (0-1) */
  recencyScore: number;
  /** Popularity-weighted score (0-1) */
  popularityScore: number;
  /** Custom factor score (0-1) */
  customScore: number;
  /** Score breakdown by component */
  breakdown: {
    semantic: number;
    keyword: number;
    recency: number;
    popularity: number;
    custom: number;
  };
}

/**
 * Search result with relevance score
 */
export interface SearchResult {
  /** The API endpoint */
  endpoint: ApiEndpoint;
  /** Overall relevance score (0-1) */
  score: number;
  /** Detailed relevance score breakdown */
  relevanceScore?: RelevanceScore;
  /** Match type (semantic, keyword, hybrid) */
  matchType: 'semantic' | 'keyword' | 'hybrid';
  /** Context information */
  context?: string;
}

/**
 * Default scoring configuration
 */
const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  semanticWeight: 0.5,
  keywordWeight: 0.3,
  recencyWeight: 0.1,
  popularityWeight: 0.1,
  enableRecency: true,
  enablePopularity: true,
  recencyDecayRate: 0.1,
  baseRecencyScore: 0.8,
};

/**
 * Relevance scorer for ranking API endpoints
 */
export class RelevanceScorer {
  private vectorStore: VectorStore;
  private config: ScoringConfig;
  private endpointUsageStats: Map<string, { count: number; lastUsed: number }>;

  constructor(vectorStore: VectorStore, config?: Partial<ScoringConfig>) {
    this.vectorStore = vectorStore;
    this.config = { ...DEFAULT_SCORING_CONFIG, ...config };
    this.endpointUsageStats = new Map();
  }

  /**
   * Calculate comprehensive relevance score for an endpoint
   *
   * @param query - Search query
   * @param endpoint - API endpoint to score
   * @param queryAnalysis - Optional query analysis results
   * @returns Relevance score with breakdown
   */
  calculateScore(
    query: string,
    endpoint: ApiEndpoint,
    queryAnalysis?: QueryAnalysis
  ): RelevanceScore {
    // Calculate individual scores
    const semanticScore = this.semanticSimilarityScore(query, endpoint);
    const keywordScore = this.keywordMatchScore(query, endpoint);
    const recencyScore = this.recencyWeighting(semanticScore, endpoint);
    const popularityScore = this.popularityWeighting(semanticScore, endpoint);
    const customScore = this.customRelevanceFactors(
      semanticScore,
      endpoint,
      {}
    );

    // Calculate weighted overall score
    const overallScore = this.calculateWeightedScore(
      semanticScore,
      keywordScore,
      recencyScore,
      popularityScore,
      customScore
    );

    return {
      overallScore,
      semanticScore,
      keywordScore,
      recencyScore,
      popularityScore,
      customScore,
      breakdown: {
        semantic: semanticScore * this.config.semanticWeight,
        keyword: keywordScore * this.config.keywordWeight,
        recency: recencyScore * this.config.recencyWeight,
        popularity: popularityScore * this.config.popularityWeight,
        custom: customScore * 0.1, // Small weight for custom factors
      },
    };
  }

  /**
   * Calculate semantic similarity score using vector embeddings
   *
   * @param query - Search query
   * @param endpoint - API endpoint to score
   * @returns Semantic similarity score (0-1)
   */
  semanticSimilarityScore(query: string, endpoint: ApiEndpoint): number {
    // Create searchable text from endpoint
    const endpointText = this.createEndpointText(endpoint);

    // Use vector store to calculate similarity
    const results = this.vectorStore.search(endpointText, 1);

    if (results.length === 0) {
      return 0;
    }

    // Search for query similarity
    const queryResults = this.vectorStore.search(query, 1);

    if (queryResults.length === 0) {
      return 0;
    }

    // Calculate similarity between query and endpoint
    const queryVector = this.vectorStore.getById(queryResults[0].id);
    const endpointVector = this.vectorStore.getById(results[0].id);

    if (!queryVector || !endpointVector) {
      return 0;
    }

    // Calculate cosine similarity
    const similarity = this.cosineSimilarity(
      queryVector.vector,
      endpointVector.vector
    );

    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * Calculate keyword match score
   *
   * @param query - Search query
   * @param endpoint - API endpoint to score
   * @returns Keyword match score (0-1)
   */
  keywordMatchScore(query: string, endpoint: ApiEndpoint): number {
    const queryWords = this.tokenizeQuery(query);
    const endpointText = this.createEndpointText(endpoint).toLowerCase();
    const endpointWords = this.tokenizeQuery(endpointText);

    let matchCount = 0;
    let totalWeight = 0;

    // Check for exact matches in resource name
    if (
      queryWords.some((word) => endpoint.resource.toLowerCase().includes(word))
    ) {
      matchCount += 3;
      totalWeight += 3;
    }

    // Check for matches in operation name
    if (
      queryWords.some((word) => endpoint.operation.toLowerCase().includes(word))
    ) {
      matchCount += 2;
      totalWeight += 2;
    }

    // Check for matches in description
    const descriptionWords = this.tokenizeQuery(
      endpoint.description.toLowerCase()
    );
    for (const queryWord of queryWords) {
      if (descriptionWords.includes(queryWord)) {
        matchCount += 1;
        totalWeight += 1;
      }
    }

    // Check for matches in parameters
    for (const param of endpoint.parameters) {
      if (queryWords.some((word) => param.name.toLowerCase().includes(word))) {
        matchCount += 1;
        totalWeight += 1;
      }
    }

    // Check for matches in path
    const pathWords = this.tokenizeQuery(endpoint.path.toLowerCase());
    for (const queryWord of queryWords) {
      if (pathWords.includes(queryWord)) {
        matchCount += 1;
        totalWeight += 1;
      }
    }

    // Check for HTTP method match
    if (queryWords.some((word) => word === endpoint.method.toLowerCase())) {
      matchCount += 2;
      totalWeight += 2;
    }

    // Calculate score
    if (totalWeight === 0) {
      return 0;
    }

    return Math.min(1, matchCount / totalWeight);
  }

  /**
   * Apply recency weighting to a score
   *
   * @param score - Base score to weight
   * @param endpoint - API endpoint
   * @returns Recency-weighted score (0-1)
   */
  recencyWeighting(score: number, endpoint: ApiEndpoint): number {
    if (!this.config.enableRecency) {
      return score;
    }

    // Get endpoint usage stats
    const stats = this.endpointUsageStats.get(endpoint.path);
    const now = Date.now();

    if (!stats) {
      // No usage data, return base score
      return this.config.baseRecencyScore * score;
    }

    // Calculate time since last use (in days)
    const daysSinceLastUse = (now - stats.lastUsed) / (1000 * 60 * 60 * 24);

    // Apply exponential decay
    const recencyFactor = Math.exp(
      -this.config.recencyDecayRate * daysSinceLastUse
    );

    // Blend with base score
    return Math.max(0, Math.min(1, score * (0.5 + 0.5 * recencyFactor)));
  }

  /**
   * Apply popularity weighting to a score
   *
   * @param score - Base score to weight
   * @param endpoint - API endpoint
   * @returns Popularity-weighted score (0-1)
   */
  popularityWeighting(score: number, endpoint: ApiEndpoint): number {
    if (!this.config.enablePopularity) {
      return score;
    }

    // Get endpoint usage stats
    const stats = this.endpointUsageStats.get(endpoint.path);

    if (!stats) {
      // No usage data, return base score
      return score;
    }

    // Calculate popularity based on usage count
    // Normalize to 0-1 range using logarithmic scaling
    const popularityFactor = Math.min(
      1,
      Math.log(stats.count + 1) / Math.log(100)
    );

    // Blend with base score
    return Math.max(0, Math.min(1, score * (0.7 + 0.3 * popularityFactor)));
  }

  /**
   * Apply custom relevance factors to a score
   *
   * @param score - Base score to weight
   * @param endpoint - API endpoint
   * @param factors - Custom factors to apply
   * @returns Custom-factor-weighted score (0-1)
   */
  customRelevanceFactors(
    score: number,
    endpoint: ApiEndpoint,
    factors: CustomFactors
  ): number {
    let adjustedScore = score;

    // Apply resource boosts
    if (factors.resourceBoosts) {
      const resourceBoost = factors.resourceBoosts[endpoint.resource];
      if (resourceBoost) {
        adjustedScore *= 1 + resourceBoost;
      }
    }

    // Apply method boosts
    if (factors.methodBoosts) {
      const method = endpoint.method.toLowerCase();
      const methodBoost = factors.methodBoosts[method];
      if (methodBoost) {
        adjustedScore *= 1 + methodBoost;
      }
    }

    // Apply permission boosts
    if (factors.permissionBoosts) {
      const permissionBoost = factors.permissionBoosts[endpoint.permission];
      if (permissionBoost) {
        adjustedScore *= 1 + permissionBoost;
      }
    }

    // Apply deprecated penalty
    if (
      factors.deprecatedPenalty &&
      endpoint.description.toLowerCase().includes('deprecated')
    ) {
      adjustedScore *= 1 - factors.deprecatedPenalty;
    }

    // Apply example boost
    if (factors.exampleBoost && endpoint.responses.some((r) => r.example)) {
      adjustedScore *= 1 + factors.exampleBoost;
    }

    // Apply custom scorer if provided
    if (factors.customScorer) {
      adjustedScore = factors.customScorer(endpoint, adjustedScore);
    }

    return Math.max(0, Math.min(1, adjustedScore));
  }

  /**
   * Rank search results by relevance score
   *
   * @param results - Array of search results
   * @param query - Original search query
   * @returns Ranked array of search results
   */
  rankResults(results: SearchResult[], query: string): SearchResult[] {
    // Sort by score in descending order
    const ranked = results.sort((a, b) => b.score - a.score);

    // Determine match type for each result
    return ranked.map((result) => {
      if (result.relevanceScore) {
        const { semanticScore, keywordScore } = result.relevanceScore;
        if (semanticScore > 0.7 && keywordScore > 0.7) {
          result.matchType = 'hybrid';
        } else if (semanticScore > keywordScore) {
          result.matchType = 'semantic';
        } else {
          result.matchType = 'keyword';
        }
      }
      return result;
    });
  }

  /**
   * Update scoring configuration
   *
   * @param config - New configuration options
   */
  updateConfig(config: Partial<ScoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current scoring configuration
   *
   * @returns Current configuration
   */
  getConfig(): ScoringConfig {
    return { ...this.config };
  }

  /**
   * Record endpoint usage for popularity/recency tracking
   *
   * @param endpoint - API endpoint that was used
   */
  recordEndpointUsage(endpoint: ApiEndpoint): void {
    const now = Date.now();
    const stats = this.endpointUsageStats.get(endpoint.path);

    if (stats) {
      stats.count++;
      stats.lastUsed = now;
    } else {
      this.endpointUsageStats.set(endpoint.path, {
        count: 1,
        lastUsed: now,
      });
    }
  }

  /**
   * Get endpoint usage statistics
   *
   * @returns Map of endpoint usage statistics
   */
  getUsageStats(): Map<string, { count: number; lastUsed: number }> {
    return new Map(this.endpointUsageStats);
  }

  /**
   * Clear usage statistics
   */
  clearUsageStats(): void {
    this.endpointUsageStats.clear();
  }

  /**
   * Calculate weighted overall score from component scores
   *
   * @param semantic - Semantic similarity score
   * @param keyword - Keyword match score
   * @param recency - Recency-weighted score
   * @param popularity - Popularity-weighted score
   * @param custom - Custom factor score
   * @returns Weighted overall score (0-1)
   */
  private calculateWeightedScore(
    semantic: number,
    keyword: number,
    recency: number,
    popularity: number,
    custom: number
  ): number {
    const totalWeight =
      this.config.semanticWeight +
      this.config.keywordWeight +
      this.config.recencyWeight +
      this.config.popularityWeight +
      0.1; // Custom factor weight

    const weightedSum =
      semantic * this.config.semanticWeight +
      keyword * this.config.keywordWeight +
      recency * this.config.recencyWeight +
      popularity * this.config.popularityWeight +
      custom * 0.1;

    return Math.max(0, Math.min(1, weightedSum / totalWeight));
  }

  /**
   * Create searchable text from endpoint
   *
   * @param endpoint - API endpoint
   * @returns Searchable text string
   */
  private createEndpointText(endpoint: ApiEndpoint): string {
    const parts: string[] = [
      endpoint.resource,
      endpoint.operation,
      endpoint.description,
      endpoint.method,
      endpoint.path,
      endpoint.permission,
    ];

    // Add parameter names
    for (const param of endpoint.parameters) {
      parts.push(param.name);
      parts.push(param.description);
    }

    // Add request body parameters
    if (endpoint.requestBody) {
      for (const param of endpoint.requestBody) {
        parts.push(param.name);
        parts.push(param.description);
      }
    }

    return parts.join(' ');
  }

  /**
   * Tokenize query into words
   *
   * @param query - Query string
   * @returns Array of tokens
   */
  private tokenizeQuery(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 0);
  }

  /**
   * Calculate cosine similarity between two vectors
   *
   * @param vecA - First vector
   * @param vecB - Second vector
   * @returns Cosine similarity (0-1)
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }
}
