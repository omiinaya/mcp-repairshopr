/**
 * Context management module for RepairShopr API documentation
 *
 * This module provides intelligent context window optimization, result summarization,
 * progressive disclosure, context prioritization, and caching to manage response size
 * and improve user experience.
 */

import { ApiEndpoint, ApiParameter, ApiResponse } from '../utils/types';
import { SearchResult } from './scoring';

/**
 * Optimized context with token management
 */
export interface OptimizedContext {
  /** Optimized content within token limits */
  content: string;
  /** Actual token count of the content */
  tokenCount: number;
  /** Number of results included */
  resultCount: number;
  /** Number of results excluded due to token limits */
  excludedCount: number;
  /** Whether content was truncated */
  truncated: boolean;
  /** Summary of excluded content */
  summary?: string;
}

/**
 * Formatted response with multiple format options
 */
export interface FormattedResponse {
  /** Markdown formatted content */
  markdown: string;
  /** JSON formatted content */
  json: string;
  /** HTML formatted content */
  html: string;
  /** Token count of the formatted content */
  tokenCount: number;
}

/**
 * Formatting template for different content types
 */
export interface Template {
  /** Template type */
  type: 'search' | 'endpoint' | 'parameters' | 'responses';
  /** Template content with placeholders */
  template: string;
  /** Placeholder descriptions */
  placeholders: Record<string, string>;
  /** Example usage */
  example: string;
}

/**
 * Progressive disclosure context with layers
 */
export interface ProgressiveContext {
  /** Initial summary layer (minimal tokens) */
  summary: string;
  /** Summary token count */
  summaryTokens: number;
  /** Detailed layer with key results */
  details: string;
  /** Details token count */
  detailsTokens: number;
  /** Full layer with all results */
  full: string;
  /** Full token count */
  fullTokens: number;
  /** Whether full content exceeds token limits */
  fullExceedsLimit: boolean;
}

/**
 * Context cache entry
 */
interface CacheEntry {
  /** Cached context */
  context: OptimizedContext;
  /** Cache timestamp */
  timestamp: number;
}

/**
 * Context management configuration
 */
export interface ContextManagerConfig {
  /** Default maximum tokens for context */
  defaultMaxTokens: number;
  /** Cache TTL in milliseconds */
  cacheTTL: number;
  /** Maximum cache size */
  maxCacheSize: number;
  /** Enable progressive disclosure */
  enableProgressiveDisclosure: boolean;
  /** Enable result summarization */
  enableSummarization: boolean;
  /** Minimum results to trigger summarization */
  summarizationThreshold: number;
}

/**
 * Default context manager configuration
 */
const DEFAULT_CONFIG: ContextManagerConfig = {
  defaultMaxTokens: 4000,
  cacheTTL: 300000, // 5 minutes
  maxCacheSize: 100,
  enableProgressiveDisclosure: true,
  enableSummarization: true,
  summarizationThreshold: 5
};

/**
 * Context manager for optimizing and managing API documentation context
 */
export class ContextManager {
  private config: ContextManagerConfig;
  private cache: Map<string, CacheEntry>;

  constructor(config?: Partial<ContextManagerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new Map();
  }

  /**
   * Optimize context window for token limits
   *
   * @param results - Search results to optimize
   * @param maxTokens - Maximum tokens allowed
   * @returns Optimized context
   */
  optimizeContextWindow(results: SearchResult[], maxTokens: number): OptimizedContext {
    if (results.length === 0) {
      return {
        content: '',
        tokenCount: 0,
        resultCount: 0,
        excludedCount: 0,
        truncated: false
      };
    }

    // Sort results by relevance score
    const sortedResults = this.prioritizeContext(results, '');

    // Build content incrementally
    let content = '';
    let tokenCount = 0;
    let includedCount = 0;

    for (const result of sortedResults) {
      const resultContent = this.formatResult(result);
      const resultTokens = this.estimateTokens(resultContent);

      if (tokenCount + resultTokens <= maxTokens) {
        content += resultContent + '\n\n';
        tokenCount += resultTokens;
        includedCount++;
      } else {
        break;
      }
    }

    const truncated = includedCount < sortedResults.length;
    const excludedCount = sortedResults.length - includedCount;

    // Generate summary if truncated and summarization enabled
    let summary: string | undefined;
    if (truncated && this.config.enableSummarization && excludedCount > 0) {
      summary = this.summarizeResults(
        sortedResults.slice(includedCount),
        maxTokens - tokenCount
      );
    }

    return {
      content: content.trim(),
      tokenCount,
      resultCount: includedCount,
      excludedCount,
      truncated,
      summary
    };
  }

  /**
   * Summarize results for large result sets
   *
   * @param results - Results to summarize
   * @param maxTokens - Maximum tokens for summary
   * @returns Summary string
   */
  summarizeResults(results: SearchResult[], maxTokens: number): string {
    if (results.length === 0) {
      return '';
    }

    // Group results by resource
    const grouped = new Map<string, SearchResult[]>();
    for (const result of results) {
      const resource = result.endpoint.resource;
      if (!grouped.has(resource)) {
        grouped.set(resource, []);
      }
      grouped.get(resource)!.push(result);
    }

    // Build summary
    const parts: string[] = [];
    parts.push(`\n\n--- Additional ${results.length} results ---`);

    for (const [resource, resourceResults] of grouped.entries()) {
      const count = resourceResults.length;
      const operations = resourceResults
        .map(r => r.endpoint.operation)
        .slice(0, 3)
        .join(', ');

      let part = `\n${resource} (${count} endpoint${count > 1 ? 's' : ''})`;
      if (operations) {
        part += `: ${operations}`;
        if (resourceResults.length > 3) {
          part += `...`;
        }
      }
      parts.push(part);
    }

    const summary = parts.join('\n');
    const summaryTokens = this.estimateTokens(summary);

    // Truncate summary if needed
    if (summaryTokens <= maxTokens) {
      return summary;
    }

    // Return truncated summary
    return summary.substring(0, Math.floor(maxTokens * 4)) + '...';
  }

  /**
   * Implement progressive disclosure (summary first, details on demand)
   *
   * @param results - Search results
   * @param maxTokens - Maximum tokens for full context
   * @returns Progressive disclosure context
   */
  progressiveDisclosure(results: SearchResult[], maxTokens: number): ProgressiveContext {
    if (results.length === 0) {
      return {
        summary: '',
        summaryTokens: 0,
        details: '',
        detailsTokens: 0,
        full: '',
        fullTokens: 0,
        fullExceedsLimit: false
      };
    }

    // Summary layer - minimal tokens
    const summary = this.buildSummaryLayer(results);
    const summaryTokens = this.estimateTokens(summary);

    // Details layer - top 3 results
    const topResults = results.slice(0, 3);
    const details = this.buildDetailsLayer(topResults);
    const detailsTokens = this.estimateTokens(details);

    // Full layer - all results
    const optimized = this.optimizeContextWindow(results, maxTokens);
    const full = optimized.content;
    const fullTokens = optimized.tokenCount;
    const fullExceedsLimit = optimized.truncated;

    return {
      summary,
      summaryTokens,
      details,
      detailsTokens,
      full,
      fullTokens,
      fullExceedsLimit
    };
  }

  /**
   * Prioritize context by relevance score
   *
   * @param results - Search results to prioritize
   * @param query - Original search query (for future enhancements)
   * @returns Prioritized results
   */
  prioritizeContext(results: SearchResult[], query: string): SearchResult[] {
    // Sort by score in descending order
    return [...results].sort((a, b) => b.score - a.score);
  }

  /**
   * Cache context for reuse
   *
   * @param key - Cache key
   * @param context - Context to cache
   */
  cacheContext(key: string, context: OptimizedContext): void {
    // Check cache size limit
    if (this.cache.size >= this.config.maxCacheSize) {
      // Remove oldest entry
      const oldestKey = this.findOldestCacheEntry();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      context,
      timestamp: Date.now()
    });
  }

  /**
   * Get cached context
   *
   * @param key - Cache key
   * @returns Cached context or null if not found/expired
   */
  getCachedContext(key: string): OptimizedContext | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.config.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.context;
  }

  /**
   * Clear context cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update context manager configuration
   *
   * @param config - New configuration options
   */
  updateConfig(config: Partial<ContextManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   *
   * @returns Current configuration
   */
  getConfig(): ContextManagerConfig {
    return { ...this.config };
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; ttl: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      ttl: this.config.cacheTTL
    };
  }

  /**
   * Estimate token count for markdown content
   *
   * @param content - Content to estimate tokens for
   * @returns Estimated token count
   */
  estimateTokens(content: string): number {
    if (!content) {
      return 0;
    }

    // Approximate token count: ~4 characters per token for English text
    // This is a rough estimate suitable for markdown content
    const charCount = content.length;
    const tokenCount = Math.ceil(charCount / 4);

    // Adjust for markdown syntax (code blocks, headers, etc.)
    // These typically use fewer tokens than their character count suggests
    const markdownMultiplier = 0.85;

    return Math.ceil(tokenCount * markdownMultiplier);
  }

  /**
   * Format a single search result as markdown
   *
   * @param result - Search result to format
   * @returns Formatted markdown string
   */
  private formatResult(result: SearchResult): string {
    const { endpoint, score, matchType } = result;

    let markdown = `## ${endpoint.operation}\n\n`;
    markdown += `**Resource:** ${endpoint.resource}\n`;
    markdown += `**Method:** ${endpoint.method}\n`;
    markdown += `**Path:** \`${endpoint.path}\`\n`;
    markdown += `**Permission:** ${endpoint.permission}\n`;
    markdown += `**Relevance:** ${(score * 100).toFixed(1)}% (${matchType})\n\n`;
    markdown += `**Description:** ${endpoint.description}\n\n`;

    if (endpoint.parameters.length > 0) {
      markdown += `**Parameters:**\n`;
      for (const param of endpoint.parameters) {
        const required = param.required ? ' (required)' : '';
        markdown += `- \`${param.name}\` (${param.type})${required}: ${param.description}\n`;
      }
      markdown += '\n';
    }

    if (endpoint.requestBody && endpoint.requestBody.length > 0) {
      markdown += `**Request Body:**\n`;
      for (const param of endpoint.requestBody) {
        const required = param.required ? ' (required)' : '';
        markdown += `- \`${param.name}\` (${param.type})${required}: ${param.description}\n`;
      }
      markdown += '\n';
    }

    if (endpoint.responses.length > 0) {
      markdown += `**Responses:**\n`;
      for (const response of endpoint.responses) {
        markdown += `- ${response.statusCode}: ${response.description}\n`;
      }
    }

    return markdown;
  }

  /**
   * Build summary layer for progressive disclosure
   *
   * @param results - Search results
   * @returns Summary layer content
   */
  private buildSummaryLayer(results: SearchResult[]): string {
    const parts: string[] = [];
    parts.push(`Found ${results.length} result${results.length > 1 ? 's' : ''}:\n`);

    // Group by resource
    const grouped = new Map<string, SearchResult[]>();
    for (const result of results) {
      const resource = result.endpoint.resource;
      if (!grouped.has(resource)) {
        grouped.set(resource, []);
      }
      grouped.get(resource)!.push(result);
    }

    for (const [resource, resourceResults] of grouped.entries()) {
      const count = resourceResults.length;
      const avgScore =
        resourceResults.reduce((sum, r) => sum + r.score, 0) / resourceResults.length;
      parts.push(
        `- ${resource}: ${count} endpoint${count > 1 ? 's' : ''} (avg relevance: ${(avgScore * 100).toFixed(0)}%)`
      );
    }

    return parts.join('\n');
  }

  /**
   * Build details layer for progressive disclosure
   *
   * @param results - Search results
   * @returns Details layer content
   */
  private buildDetailsLayer(results: SearchResult[]): string {
    let content = '### Top Results\n\n';

    for (const result of results) {
      const { endpoint, score } = result;
      content += `**${endpoint.operation}** (${endpoint.resource})\n`;
      content += `- Method: ${endpoint.method}\n`;
      content += `- Path: \`${endpoint.path}\`\n`;
      content += `- Relevance: ${(score * 100).toFixed(1)}%\n`;
      content += `- ${endpoint.description}\n\n`;
    }

    return content;
  }

  /**
   * Find oldest cache entry
   *
   * @returns Key of oldest entry or null
   */
  private findOldestCacheEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }
}

/**
 * Format search results in multiple formats
 *
 * @param results - Search results to format
 * @param format - Output format (markdown, json, html)
 * @returns Formatted response
 */
export function formatSearchResults(
  results: SearchResult[],
  format: 'markdown' | 'json' | 'html'
): FormattedResponse {
  const markdown = formatSearchResultsMarkdown(results);
  const json = formatSearchResultsJson(results);
  const html = formatSearchResultsHtml(results);

  return {
    markdown,
    json,
    html,
    tokenCount: estimateTokens(markdown)
  };
}

/**
 * Format search results as markdown
 */
function formatSearchResultsMarkdown(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No results found.';
  }

  let markdown = `# Search Results\n\n`;
  markdown += `Found ${results.length} result${results.length > 1 ? 's' : ''}:\n\n`;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    markdown += `## ${i + 1}. ${result.endpoint.operation}\n\n`;
    markdown += `**Resource:** ${result.endpoint.resource}\n`;
    markdown += `**Method:** ${result.endpoint.method}\n`;
    markdown += `**Path:** \`${result.endpoint.path}\`\n`;
    markdown += `**Permission:** ${result.endpoint.permission}\n`;
    markdown += `**Relevance:** ${(result.score * 100).toFixed(1)}% (${result.matchType})\n\n`;
    markdown += `**Description:** ${result.endpoint.description}\n\n`;

    if (result.endpoint.parameters.length > 0) {
      markdown += `**Parameters:**\n`;
      for (const param of result.endpoint.parameters) {
        const required = param.required ? ' (required)' : '';
        markdown += `- \`${param.name}\` (${param.type})${required}: ${param.description}\n`;
      }
      markdown += '\n';
    }

    if (result.endpoint.requestBody && result.endpoint.requestBody.length > 0) {
      markdown += `**Request Body:**\n`;
      for (const param of result.endpoint.requestBody) {
        const required = param.required ? ' (required)' : '';
        markdown += `- \`${param.name}\` (${param.type})${required}: ${param.description}\n`;
      }
      markdown += '\n';
    }

    if (result.endpoint.responses.length > 0) {
      markdown += `**Responses:**\n`;
      for (const response of result.endpoint.responses) {
        markdown += `- ${response.statusCode}: ${response.description}\n`;
      }
      markdown += '\n';
    }
  }

  return markdown.trim();
}

/**
 * Format search results as JSON
 */
function formatSearchResultsJson(results: SearchResult[]): string {
  const formatted = results.map(result => ({
    endpoint: {
      resource: result.endpoint.resource,
      operation: result.endpoint.operation,
      description: result.endpoint.description,
      method: result.endpoint.method,
      path: result.endpoint.path,
      permission: result.endpoint.permission,
      parameters: result.endpoint.parameters,
      requestBody: result.endpoint.requestBody,
      responses: result.endpoint.responses
    },
    score: result.score,
    matchType: result.matchType,
    context: result.context
  }));

  return JSON.stringify({ results: formatted, count: results.length }, null, 2);
}

/**
 * Format search results as HTML
 */
function formatSearchResultsHtml(results: SearchResult[]): string {
  if (results.length === 0) {
    return '<p>No results found.</p>';
  }

  let html = '<div class="search-results">\n';
  html += `<h1>Search Results</h1>\n`;
  html += `<p>Found ${results.length} result${results.length > 1 ? 's' : ''}:</p>\n`;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    html += '<div class="result-item">\n';
    html += `<h2>${i + 1}. ${escapeHtml(result.endpoint.operation)}</h2>\n`;
    html += '<dl>\n';
    html += `<dt>Resource:</dt><dd>${escapeHtml(result.endpoint.resource)}</dd>\n`;
    html += `<dt>Method:</dt><dd>${escapeHtml(result.endpoint.method)}</dd>\n`;
    html += `<dt>Path:</dt><dd><code>${escapeHtml(result.endpoint.path)}</code></dd>\n`;
    html += `<dt>Permission:</dt><dd>${escapeHtml(result.endpoint.permission)}</dd>\n`;
    html += `<dt>Relevance:</dt><dd>${(result.score * 100).toFixed(1)}% (${escapeHtml(result.matchType)})</dd>\n`;
    html += `<dt>Description:</dt><dd>${escapeHtml(result.endpoint.description)}</dd>\n`;
    html += '</dl>\n';

    if (result.endpoint.parameters.length > 0) {
      html += '<h3>Parameters</h3>\n';
      html += '<ul>\n';
      for (const param of result.endpoint.parameters) {
        const required = param.required ? ' <span class="required">(required)</span>' : '';
        html += `<li><code>${escapeHtml(param.name)}</code> (${escapeHtml(param.type)})${required}: ${escapeHtml(param.description)}</li>\n`;
      }
      html += '</ul>\n';
    }

    if (result.endpoint.requestBody && result.endpoint.requestBody.length > 0) {
      html += '<h3>Request Body</h3>\n';
      html += '<ul>\n';
      for (const param of result.endpoint.requestBody) {
        const required = param.required ? ' <span class="required">(required)</span>' : '';
        html += `<li><code>${escapeHtml(param.name)}</code> (${escapeHtml(param.type)})${required}: ${escapeHtml(param.description)}</li>\n`;
      }
      html += '</ul>\n';
    }

    if (result.endpoint.responses.length > 0) {
      html += '<h3>Responses</h3>\n';
      html += '<ul>\n';
      for (const response of result.endpoint.responses) {
        html += `<li>${response.statusCode}: ${escapeHtml(response.description)}</li>\n`;
      }
      html += '</ul>\n';
    }

    html += '</div>\n';
  }

  html += '</div>';
  return html;
}

/**
 * Format endpoint details in multiple formats
 *
 * @param endpoint - API endpoint to format
 * @param format - Output format (markdown, json, html)
 * @returns Formatted string
 */
export function formatEndpoint(
  endpoint: ApiEndpoint,
  format: 'markdown' | 'json' | 'html'
): string {
  switch (format) {
    case 'markdown':
      return formatEndpointMarkdown(endpoint);
    case 'json':
      return formatEndpointJson(endpoint);
    case 'html':
      return formatEndpointHtml(endpoint);
  }
}

/**
 * Format endpoint as markdown
 */
function formatEndpointMarkdown(endpoint: ApiEndpoint): string {
  let markdown = `# ${endpoint.operation}\n\n`;
  markdown += `**Resource:** ${endpoint.resource}\n`;
  markdown += `**Method:** ${endpoint.method}\n`;
  markdown += `**Path:** \`${endpoint.path}\`\n`;
  markdown += `**Permission:** ${endpoint.permission}\n\n`;
  markdown += `**Description:** ${endpoint.description}\n\n`;

  if (endpoint.parameters.length > 0) {
    markdown += `## Parameters\n\n`;
    markdown += formatParametersTable(endpoint.parameters, 'markdown');
  }

  if (endpoint.requestBody && endpoint.requestBody.length > 0) {
    markdown += `## Request Body\n\n`;
    markdown += formatParametersTable(endpoint.requestBody, 'markdown');
  }

  if (endpoint.responses.length > 0) {
    markdown += `## Responses\n\n`;
    markdown += formatResponsesList(endpoint.responses, 'markdown');
  }

  return markdown.trim();
}

/**
 * Format endpoint as JSON
 */
function formatEndpointJson(endpoint: ApiEndpoint): string {
  return JSON.stringify(endpoint, null, 2);
}

/**
 * Format endpoint as HTML
 */
function formatEndpointHtml(endpoint: ApiEndpoint): string {
  let html = '<div class="endpoint">\n';
  html += `<h1>${escapeHtml(endpoint.operation)}</h1>\n`;
  html += '<dl>\n';
  html += `<dt>Resource:</dt><dd>${escapeHtml(endpoint.resource)}</dd>\n`;
  html += `<dt>Method:</dt><dd>${escapeHtml(endpoint.method)}</dd>\n`;
  html += `<dt>Path:</dt><dd><code>${escapeHtml(endpoint.path)}</code></dd>\n`;
  html += `<dt>Permission:</dt><dd>${escapeHtml(endpoint.permission)}</dd>\n`;
  html += `<dt>Description:</dt><dd>${escapeHtml(endpoint.description)}</dd>\n`;
  html += '</dl>\n';

  if (endpoint.parameters.length > 0) {
    html += '<h2>Parameters</h2>\n';
    html += formatParametersTable(endpoint.parameters, 'html');
  }

  if (endpoint.requestBody && endpoint.requestBody.length > 0) {
    html += '<h2>Request Body</h2>\n';
    html += formatParametersTable(endpoint.requestBody, 'html');
  }

  if (endpoint.responses.length > 0) {
    html += '<h2>Responses</h2>\n';
    html += formatResponsesList(endpoint.responses, 'html');
  }

  html += '</div>';
  return html;
}

/**
 * Format parameters as tables in multiple formats
 *
 * @param parameters - API parameters to format
 * @param format - Output format (markdown, json, html)
 * @returns Formatted string
 */
export function formatParameters(
  parameters: ApiParameter[],
  format: 'markdown' | 'json' | 'html'
): string {
  switch (format) {
    case 'markdown':
      return formatParametersTable(parameters, 'markdown');
    case 'json':
      return formatParametersJson(parameters);
    case 'html':
      return formatParametersTable(parameters, 'html');
  }
}

/**
 * Format parameters as markdown table
 */
function formatParametersTable(parameters: ApiParameter[], format: 'markdown' | 'html'): string {
  if (parameters.length === 0) {
    return format === 'markdown' ? 'No parameters.\n' : '<p>No parameters.</p>\n';
  }

  if (format === 'markdown') {
    let markdown = '| Name | Type | Required | Description |\n';
    markdown += '|------|------|----------|-------------|\n';

    for (const param of parameters) {
      markdown += `| \`${param.name}\` | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
    }

    return markdown + '\n';
  } else {
    let html = '<table class="parameters">\n';
    html += '<thead>\n';
    html += '<tr>\n';
    html += '<th>Name</th>\n';
    html += '<th>Type</th>\n';
    html += '<th>Required</th>\n';
    html += '<th>Description</th>\n';
    html += '</tr>\n';
    html += '</thead>\n';
    html += '<tbody>\n';

    for (const param of parameters) {
      html += '<tr>\n';
      html += `<td><code>${escapeHtml(param.name)}</code></td>\n`;
      html += `<td>${escapeHtml(param.type)}</td>\n`;
      html += `<td>${param.required ? '<span class="required">Yes</span>' : 'No'}</td>\n`;
      html += `<td>${escapeHtml(param.description)}</td>\n`;
      html += '</tr>\n';
    }

    html += '</tbody>\n';
    html += '</table>\n';
    return html;
  }
}

/**
 * Format parameters as JSON
 */
function formatParametersJson(parameters: ApiParameter[]): string {
  return JSON.stringify(parameters, null, 2);
}

/**
 * Format responses in multiple formats
 *
 * @param responses - API responses to format
 * @param format - Output format (markdown, json, html)
 * @returns Formatted string
 */
export function formatResponses(
  responses: ApiResponse[],
  format: 'markdown' | 'json' | 'html'
): string {
  switch (format) {
    case 'markdown':
      return formatResponsesList(responses, 'markdown');
    case 'json':
      return formatResponsesJson(responses);
    case 'html':
      return formatResponsesList(responses, 'html');
  }
}

/**
 * Format responses as markdown list
 */
function formatResponsesList(responses: ApiResponse[], format: 'markdown' | 'html'): string {
  if (responses.length === 0) {
    return format === 'markdown' ? 'No responses.\n' : '<p>No responses.</p>\n';
  }

  if (format === 'markdown') {
    let markdown = '';
    for (const response of responses) {
      markdown += `- **${response.statusCode}**: ${response.description}\n`;
      if (response.example) {
        markdown += `  - Example: \`\`\`json\n${JSON.stringify(response.example, null, 2)}\n\`\`\`\n`;
      }
    }
    return markdown + '\n';
  } else {
    let html = '<ul class="responses">\n';
    for (const response of responses) {
      html += '<li>\n';
      html += `<strong>${response.statusCode}</strong>: ${escapeHtml(response.description)}\n`;
      if (response.example) {
        html += `<pre><code>${escapeHtml(JSON.stringify(response.example, null, 2))}</code></pre>\n`;
      }
      html += '</li>\n';
    }
    html += '</ul>\n';
    return html;
  }
}

/**
 * Format responses as JSON
 */
function formatResponsesJson(responses: ApiResponse[]): string {
  return JSON.stringify(responses, null, 2);
}

/**
 * Format code block with syntax highlighting
 *
 * @param code - Code content to format
 * @param language - Programming language for syntax highlighting
 * @returns Formatted code block string
 */
export function formatCodeBlock(code: string, language: string): string {
  return `\`\`\`${language}\n${code}\n\`\`\``;
}

/**
 * Format collapsible section
 *
 * @param title - Section title
 * @param content - Section content
 * @param defaultOpen - Whether section should be open by default
 * @returns Formatted collapsible section string
 */
export function formatCollapsibleSection(
  title: string,
  content: string,
  defaultOpen: boolean
): string {
  const openState = defaultOpen ? 'open' : 'closed';
  return `<details ${openState}>\n<summary>${escapeHtml(title)}</summary>\n\n${content}\n</details>`;
}

/**
 * Create formatting template for different content types
 *
 * @param type - Template type (search, endpoint, parameters, responses)
 * @returns Formatting template
 */
export function createFormattingTemplate(type: 'search' | 'endpoint' | 'parameters' | 'responses'): Template {
  switch (type) {
    case 'search':
      return {
        type: 'search',
        template: `# Search Results\n\nFound {{count}} result{{plural}}:\n\n{{results}}`,
        placeholders: {
          count: 'Number of results found',
          plural: 'Plural suffix (s) if count > 1',
          results: 'Formatted result items'
        },
        example: `# Search Results\n\nFound 3 results:\n\n## 1. Get Customers\n\n**Resource:** Customer\n**Method:** GET\n**Path:** /customers\n**Permission:** customer.view\n**Relevance:** 95.0% (semantic)\n\n**Description:** Retrieve a list of all customers\n\n`
      };

    case 'endpoint':
      return {
        type: 'endpoint',
        template: `# {{operation}}\n\n**Resource:** {{resource}}\n**Method:** {{method}}\n**Path:** {{path}}\n**Permission:** {{permission}}\n\n**Description:** {{description}}\n\n{{parameters}}{{requestBody}}{{responses}}`,
        placeholders: {
          operation: 'Endpoint operation name',
          resource: 'Resource name',
          method: 'HTTP method',
          path: 'API path',
          permission: 'Required permission',
          description: 'Endpoint description',
          parameters: 'Parameters section (if any)',
          requestBody: 'Request body section (if any)',
          responses: 'Responses section (if any)'
        },
        example: `# Get Customers\n\n**Resource:** Customer\n**Method:** GET\n**Path:** /customers\n**Permission:** customer.view\n\n**Description:** Retrieve a list of all customers\n\n## Parameters\n\n| Name | Type | Required | Description |\n|------|------|----------|-------------|\n| page | integer | No | Page number for pagination |\n\n`
      };

    case 'parameters':
      return {
        type: 'parameters',
        template: `## Parameters\n\n| Name | Type | Required | Description |\n|------|------|----------|-------------|\n{{rows}}`,
        placeholders: {
          rows: 'Table rows for each parameter'
        },
        example: `## Parameters\n\n| Name | Type | Required | Description |\n|------|------|----------|-------------|\n| page | integer | No | Page number for pagination |\n| limit | integer | No | Number of results per page |\n\n`
      };

    case 'responses':
      return {
        type: 'responses',
        template: `## Responses\n\n{{list}}`,
        placeholders: {
          list: 'List of response items'
        },
        example: `## Responses\n\n- **200**: List of customers\n  - Example: \`\`\`json\n{\n  \"customers\": [...]\n}\n\`\`\`\n- **401**: Unauthorized\n\n`
      };
  }
}

/**
 * Estimate token count for markdown content
 *
 * @param content - Content to estimate tokens for
 * @returns Estimated token count
 */
function estimateTokens(content: string): number {
  if (!content) {
    return 0;
  }

  // Approximate token count: ~4 characters per token for English text
  const charCount = content.length;
  const tokenCount = Math.ceil(charCount / 4);

  // Adjust for markdown syntax
  const markdownMultiplier = 0.85;

  return Math.ceil(tokenCount * markdownMultiplier);
}

/**
 * Escape HTML special characters
 *
 * @param text - Text to escape
 * @returns Escaped text
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, m => map[m]);
}
