/**
 * Search tool for RepairShopr API documentation
 *
 * This module provides semantic and keyword search capabilities for API documentation,
 * with support for filtering by resource, method, and permission.
 */

import { ApiEndpoint } from '../utils/types';
import { VectorStore } from '../indexer/vector';
import { MetadataIndex, getEndpointsByResource, getEndpointsByMethod, getEndpointsByPermission } from '../parser/metadata';

/**
 * Search result with relevance score and context
 */
export interface SearchResult {
  /** The matching API endpoint */
  endpoint: ApiEndpoint;
  /** Relevance score (0-1, higher is better) */
  score: number;
  /** Context snippet showing why this result matched */
  context: string;
  /** Type of match (semantic, keyword, or hybrid) */
  matchType: 'semantic' | 'keyword' | 'hybrid';
}

/**
 * Search parameters for querying API documentation
 */
export interface SearchParams {
  /** Search query text */
  query: string;
  /** Optional filter by resource name */
  resource?: string;
  /** Optional filter by HTTP method */
  method?: string;
  /** Optional filter by permission */
  permission?: string;
  /** Maximum number of results to return (default: 5) */
  limit?: number;
}

/**
 * Performs semantic search using vector embeddings
 *
 * @param query - Search query
 * @param vectorStore - Vector store for semantic search
 * @param metadataIndex - Metadata index for filtering
 * @param filters - Optional filters to apply
 * @returns Array of search results with semantic scores
 */
function performSemanticSearch(
  query: string,
  vectorStore: VectorStore,
  metadataIndex: MetadataIndex,
  filters?: { resource?: string; method?: string; permission?: string }
): SearchResult[] {
  // Perform semantic search using vector store
  const semanticResults = vectorStore.search(query, 100); // Get more results for filtering

  const results: SearchResult[] = [];

  for (const result of semanticResults) {
    // Extract endpoint ID from metadata
    const endpointId = result.metadata.endpointId;
    if (!endpointId) continue;

    // Find the endpoint in the metadata index
    const endpoint = metadataIndex.allEndpoints.find(ep => 
      `${ep.method}:${ep.path}` === endpointId
    );
    
    if (!endpoint) continue;

    // Apply filters
    if (filters?.resource && endpoint.resource !== filters.resource) continue;
    if (filters?.method && endpoint.method !== filters.method) continue;
    if (filters?.permission && endpoint.permission !== filters.permission) continue;

    // Generate context from description
    const context = generateContext(endpoint, query);

    results.push({
      endpoint,
      score: result.score,
      context,
      matchType: 'semantic'
    });
  }

  return results;
}

/**
 * Performs keyword search using text matching
 *
 * @param query - Search query
 * @param metadataIndex - Metadata index for searching
 * @param filters - Optional filters to apply
 * @returns Array of search results with keyword scores
 */
function performKeywordSearch(
  query: string,
  metadataIndex: MetadataIndex,
  filters?: { resource?: string; method?: string; permission?: string }
): SearchResult[] {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 0);
  const results: SearchResult[] = [];

  for (const endpoint of metadataIndex.allEndpoints) {
    // Apply filters
    if (filters?.resource && endpoint.resource !== filters.resource) continue;
    if (filters?.method && endpoint.method !== filters.method) continue;
    if (filters?.permission && endpoint.permission !== filters.permission) continue;

    // Calculate keyword match score
    let score = 0;
    let matchCount = 0;

    // Search in resource name
    if (endpoint.resource.toLowerCase().includes(queryLower)) {
      score += 0.3;
      matchCount++;
    }

    // Search in operation name
    if (endpoint.operation.toLowerCase().includes(queryLower)) {
      score += 0.3;
      matchCount++;
    }

    // Search in description
    const descriptionLower = endpoint.description.toLowerCase();
    for (const term of queryTerms) {
      if (descriptionLower.includes(term)) {
        score += 0.2;
        matchCount++;
      }
    }

    // Search in path
    if (endpoint.path.toLowerCase().includes(queryLower)) {
      score += 0.1;
      matchCount++;
    }

    // Search in parameters
    for (const param of endpoint.parameters) {
      if (param.name.toLowerCase().includes(queryLower) || 
          param.description.toLowerCase().includes(queryLower)) {
        score += 0.1;
        matchCount++;
      }
    }

    // Only include results with at least one match
    if (matchCount > 0) {
      // Normalize score to 0-1 range
      score = Math.min(score, 1.0);

      const context = generateContext(endpoint, query);

      results.push({
        endpoint,
        score,
        context,
        matchType: 'keyword'
      });
    }
  }

  return results;
}

/**
 * Combines semantic and keyword search results using hybrid scoring
 *
 * @param semanticResults - Results from semantic search
 * @param keywordResults - Results from keyword search
 * @param semanticWeight - Weight for semantic scores (default: 0.6)
 * @returns Combined and deduplicated results
 */
function combineResults(
  semanticResults: SearchResult[],
  keywordResults: SearchResult[],
  semanticWeight: number = 0.6
): SearchResult[] {
  const combinedMap = new Map<string, SearchResult>();
  const keywordWeight = 1 - semanticWeight;

  // Process semantic results
  for (const result of semanticResults) {
    const key = `${result.endpoint.method}:${result.endpoint.path}`;
    combinedMap.set(key, {
      ...result,
      score: result.score * semanticWeight,
      matchType: 'hybrid'
    });
  }

  // Process keyword results and combine with semantic
  for (const result of keywordResults) {
    const key = `${result.endpoint.method}:${result.endpoint.path}`;
    const existing = combinedMap.get(key);

    if (existing) {
      // Combine scores
      existing.score = (existing.score / semanticWeight) * semanticWeight + result.score * keywordWeight;
    } else {
      combinedMap.set(key, {
        ...result,
        score: result.score * keywordWeight,
        matchType: 'hybrid'
      });
    }
  }

  // Convert map to array and sort by score
  return Array.from(combinedMap.values()).sort((a, b) => b.score - a.score);
}

/**
 * Generates a context snippet showing why an endpoint matched the query
 *
 * @param endpoint - The API endpoint
 * @param query - The search query
 * @returns Context string
 */
function generateContext(endpoint: ApiEndpoint, query: string): string {
  const queryLower = query.toLowerCase();
  
  // Try to find the query in the description
  const descriptionLower = endpoint.description.toLowerCase();
  const queryIndex = descriptionLower.indexOf(queryLower);
  
  if (queryIndex !== -1) {
    // Extract a snippet around the match
    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(endpoint.description.length, queryIndex + query.length + 50);
    let snippet = endpoint.description.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < endpoint.description.length) snippet = snippet + '...';
    
    return snippet;
  }

  // If no match in description, return the first part of the description
  if (endpoint.description.length > 150) {
    return endpoint.description.substring(0, 150) + '...';
  }
  
  return endpoint.description;
}

/**
 * Searches API documentation using semantic and keyword search
 *
 * This function performs a hybrid search combining semantic similarity (using vector embeddings)
 * and keyword matching to find the most relevant API endpoints. Results can be filtered by
 * resource, method, and permission, and are ranked by relevance score.
 *
 * @param params - Search parameters including query and optional filters
 * @param vectorStore - Vector store for semantic search
 * @param metadataIndex - Metadata index for filtering and keyword search
 * @returns Array of search results ranked by relevance
 *
 * @example
 * ```typescript
 * const results = await searchApiDocs(
 *   { query: 'create customer', limit: 5 },
 *   vectorStore,
 *   metadataIndex
 * );
 * ```
 */
export function searchApiDocs(
  params: SearchParams,
  vectorStore: VectorStore,
  metadataIndex: MetadataIndex
): SearchResult[] {
  const { query, resource, method, permission, limit = 5 } = params;

  // Validate required parameters
  if (!query || query.trim().length === 0) {
    throw new Error('Query parameter is required and cannot be empty');
  }

  // Build filters object
  const filters: { resource?: string; method?: string; permission?: string } = {};
  if (resource) filters.resource = resource;
  if (method) filters.method = method.toUpperCase();
  if (permission) filters.permission = permission;

  // Perform semantic search
  const semanticResults = performSemanticSearch(query, vectorStore, metadataIndex, filters);

  // Perform keyword search
  const keywordResults = performKeywordSearch(query, metadataIndex, filters);

  // Combine results using hybrid scoring
  const combinedResults = combineResults(semanticResults, keywordResults);

  // Apply pagination (limit)
  return combinedResults.slice(0, limit);
}

/**
 * Searches API documentation by resource name only
 *
 * @param resource - Resource name to search for
 * @param metadataIndex - Metadata index
 * @returns Array of endpoints for the specified resource
 */
export function searchByResource(resource: string, metadataIndex: MetadataIndex): ApiEndpoint[] {
  return getEndpointsByResource(metadataIndex, resource);
}

/**
 * Searches API documentation by HTTP method only
 *
 * @param method - HTTP method to search for
 * @param metadataIndex - Metadata index
 * @returns Array of endpoints using the specified method
 */
export function searchByMethod(method: string, metadataIndex: MetadataIndex): ApiEndpoint[] {
  return getEndpointsByMethod(metadataIndex, method.toUpperCase());
}

/**
 * Searches API documentation by permission only
 *
 * @param permission - Permission to search for
 * @param metadataIndex - Metadata index
 * @returns Array of endpoints requiring the specified permission
 */
export function searchByPermission(permission: string, metadataIndex: MetadataIndex): ApiEndpoint[] {
  return getEndpointsByPermission(metadataIndex, permission);
}
