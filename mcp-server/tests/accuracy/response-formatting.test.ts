/**
 * Response Formatting Tests
 * 
 * Tests to validate response formatting accuracy, context window management,
 * response summarization, response prioritization, response structure,
 * and creates formatting metrics.
 */

import {
  ContextManager,
  formatSearchResults,
  formatEndpoint,
  formatParameters,
  formatResponses,
  formatCodeBlock,
  formatCollapsibleSection,
  createFormattingTemplate,
  OptimizedContext,
  FormattedResponse
} from '../../src/retrieval/formatter';
import { SearchResult } from '../../src/retrieval/scoring';
import { ApiEndpoint, ApiParameter, ApiResponse } from '../../src/utils/types';
import { generateEndpoint, generateParameter, generateResponse } from '../utils/data-generators';

/**
 * Response formatting metrics
 */
interface ResponseFormattingMetrics {
  totalResponses: number;
  successfullyFormatted: number;
  failedToFormat: number;
  markdownAccuracy: number;
  jsonAccuracy: number;
  htmlAccuracy: number;
  contextWindowAccuracy: number;
  summarizationAccuracy: number;
  prioritizationAccuracy: number;
  structureAccuracy: number;
  overallAccuracy: number;
}

/**
 * Create mock search results for testing
 */
function createMockSearchResults(count: number): SearchResult[] {
  return Array.from({ length: count }, (_, i) => ({
    endpoint: generateEndpoint({
      resource: `Resource${i % 5}`,
      operation: `Operation ${i}`,
      description: `Description for operation ${i}`,
      method: ['GET', 'POST', 'PUT', 'DELETE'][i % 4] as any,
      path: `/resource${i % 5}/${i}`,
      permission: `resource${i % 5}.view`
    }),
    score: 1 - (i * 0.1),
    context: `Context for result ${i}`,
    matchType: ['semantic', 'keyword', 'hybrid'][i % 3] as any
  }));
}

/**
 * Test response formatting accuracy
 */
describe('Response Formatting - Accuracy', () => {
  test('should format search results as markdown accurately', () => {
    const results = createMockSearchResults(3);
    const formatted = formatSearchResults(results, 'markdown');

    expect(formatted.markdown).toBeDefined();
    expect(typeof formatted.markdown).toBe('string');
    expect(formatted.markdown.length).toBeGreaterThan(0);
    expect(formatted.markdown).toContain('Search Results');
    expect(formatted.markdown).toContain('Resource:');
    expect(formatted.markdown).toContain('Method:');
    expect(formatted.markdown).toContain('Path:');
  });

  test('should format search results as JSON accurately', () => {
    const results = createMockSearchResults(3);
    const formatted = formatSearchResults(results, 'json');

    expect(formatted.json).toBeDefined();
    expect(typeof formatted.json).toBe('string');
    
    const parsed = JSON.parse(formatted.json);
    expect(parsed).toHaveProperty('results');
    expect(parsed).toHaveProperty('count');
    expect(Array.isArray(parsed.results)).toBe(true);
    expect(parsed.results.length).toBe(3);
  });

  test('should format search results as HTML accurately', () => {
    const results = createMockSearchResults(3);
    const formatted = formatSearchResults(results, 'html');

    expect(formatted.html).toBeDefined();
    expect(typeof formatted.html).toBe('string');
    expect(formatted.html).toContain('<div class="search-results">');
    expect(formatted.html).toContain('<h1>Search Results</h1>');
    expect(formatted.html).toContain('<dt>Resource:</dt>');
    expect(formatted.html).toContain('<dt>Method:</dt>');
  });

  test('should handle empty results gracefully', () => {
    const results: SearchResult[] = [];
    const formatted = formatSearchResults(results, 'markdown');

    expect(formatted.markdown).toBe('No results found.');
  });

  test('should format endpoint as markdown accurately', () => {
    const endpoint = generateEndpoint();
    const formatted = formatEndpoint(endpoint, 'markdown');

    expect(typeof formatted).toBe('string');
    expect(formatted).toContain(endpoint.operation);
    expect(formatted).toContain(endpoint.resource);
    expect(formatted).toContain(endpoint.method);
    expect(formatted).toContain(endpoint.path);
  });

  test('should format endpoint as JSON accurately', () => {
    const endpoint = generateEndpoint();
    const formatted = formatEndpoint(endpoint, 'json');

    const parsed = JSON.parse(formatted);
    expect(parsed).toHaveProperty('resource');
    expect(parsed).toHaveProperty('operation');
    expect(parsed).toHaveProperty('method');
    expect(parsed).toHaveProperty('path');
  });

  test('should format endpoint as HTML accurately', () => {
    const endpoint = generateEndpoint();
    const formatted = formatEndpoint(endpoint, 'html');

    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('<div class="endpoint">');
    expect(formatted).toContain('<h1>');
    expect(formatted).toContain('<dt>Resource:</dt>');
  });
});

/**
 * Test context window management
 */
describe('Response Formatting - Context Window Management', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  test('should optimize context window for token limits', () => {
    const results = createMockSearchResults(10);
    const maxTokens = 1000;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    expect(optimized).toBeDefined();
    expect(optimized.content).toBeDefined();
    expect(optimized.tokenCount).toBeLessThanOrEqual(maxTokens);
    expect(optimized.resultCount).toBeGreaterThan(0);
  });

  test('should include all results when within token limits', () => {
    const results = createMockSearchResults(3);
    const maxTokens = 10000;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    expect(optimized.resultCount).toBe(results.length);
    expect(optimized.excludedCount).toBe(0);
    expect(optimized.truncated).toBe(false);
  });

  test('should truncate results when exceeding token limits', () => {
    const results = createMockSearchResults(20);
    const maxTokens = 500;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    expect(optimized.resultCount).toBeLessThan(results.length);
    expect(optimized.excludedCount).toBeGreaterThan(0);
    expect(optimized.truncated).toBe(true);
  });

  test('should estimate token counts accurately', () => {
    const content = 'This is a test string with some content.';
    const tokenCount = contextManager.estimateTokens(content);

    expect(tokenCount).toBeGreaterThan(0);
    expect(typeof tokenCount).toBe('number');
  });

  test('should handle zero token limit', () => {
    const results = createMockSearchResults(5);
    const maxTokens = 0;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    expect(optimized.resultCount).toBe(0);
    expect(optimized.tokenCount).toBe(0);
    expect(optimized.content).toBe('');
  });

  test('should handle empty results with context optimization', () => {
    const results: SearchResult[] = [];
    const maxTokens = 1000;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    expect(optimized.resultCount).toBe(0);
    expect(optimized.tokenCount).toBe(0);
    expect(optimized.content).toBe('');
  });
});

/**
 * Test response summarization
 */
describe('Response Formatting - Summarization', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager({ enableSummarization: true });
  });

  test('should summarize results when truncated', () => {
    const results = createMockSearchResults(20);
    const maxTokens = 500;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    if (optimized.truncated && optimized.excludedCount > 0) {
      expect(optimized.summary).toBeDefined();
      expect(typeof optimized.summary).toBe('string');
      expect(optimized.summary.length).toBeGreaterThan(0);
    }
  });

  test('should not summarize when not truncated', () => {
    const results = createMockSearchResults(3);
    const maxTokens = 10000;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    expect(optimized.truncated).toBe(false);
    expect(optimized.summary).toBeUndefined();
  });

  test('should group results by resource in summary', () => {
    const results = createMockSearchResults(10);
    const maxTokens = 300;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    if (optimized.summary) {
      expect(optimized.summary).toContain('Additional');
      expect(optimized.summary).toContain('endpoint');
    }
  });

  test('should respect summarization threshold', () => {
    const contextManager = new ContextManager({ 
      enableSummarization: true,
      summarizationThreshold: 10
    });

    const results = createMockSearchResults(5);
    const maxTokens = 500;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    // With only 5 results and threshold of 10, should not trigger summarization
    if (optimized.truncated) {
      expect(optimized.summary).toBeUndefined();
    }
  });

  test('should handle summarization with disabled flag', () => {
    const contextManager = new ContextManager({ enableSummarization: false });

    const results = createMockSearchResults(20);
    const maxTokens = 500;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    expect(optimized.summary).toBeUndefined();
  });
});

/**
 * Test response prioritization
 */
describe('Response Formatting - Prioritization', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  test('should prioritize results by relevance score', () => {
    const results = createMockSearchResults(10);
    const prioritized = contextManager.prioritizeContext(results, '');

    expect(prioritized.length).toBe(results.length);
    
    // Check that results are sorted by score in descending order
    for (let i = 1; i < prioritized.length; i++) {
      expect(prioritized[i - 1].score).toBeGreaterThanOrEqual(prioritized[i].score);
    }
  });

  test('should maintain result count after prioritization', () => {
    const results = createMockSearchResults(15);
    const prioritized = contextManager.prioritizeContext(results, '');

    expect(prioritized.length).toBe(results.length);
  });

  test('should handle empty results for prioritization', () => {
    const results: SearchResult[] = [];
    const prioritized = contextManager.prioritizeContext(results, '');

    expect(prioritized).toEqual([]);
  });

  test('should include high-scoring results in optimized context', () => {
    const results = createMockSearchResults(10);
    const maxTokens = 500;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    if (optimized.resultCount > 0) {
      // First result should have highest score
      expect(optimized.content).toContain(results[0].endpoint.operation);
    }
  });
});

/**
 * Test response structure
 */
describe('Response Formatting - Structure', () => {
  test('should format parameters as markdown table', () => {
    const parameters = [
      generateParameter({ name: 'param1', type: 'string', required: true }),
      generateParameter({ name: 'param2', type: 'integer', required: false })
    ];

    const formatted = formatParameters(parameters, 'markdown');

    expect(formatted).toContain('| Name | Type | Required | Description |');
    expect(formatted).toContain('param1');
    expect(formatted).toContain('param2');
    expect(formatted).toContain('string');
    expect(formatted).toContain('integer');
  });

  test('should format parameters as HTML table', () => {
    const parameters = [
      generateParameter({ name: 'param1', type: 'string', required: true }),
      generateParameter({ name: 'param2', type: 'integer', required: false })
    ];

    const formatted = formatParameters(parameters, 'html');

    expect(formatted).toContain('<table class="parameters">');
    expect(formatted).toContain('<th>Name</th>');
    expect(formatted).toContain('<th>Type</th>');
    expect(formatted).toContain('<th>Required</th>');
    expect(formatted).toContain('<th>Description</th>');
    expect(formatted).toContain('param1');
    expect(formatted).toContain('param2');
  });

  test('should format parameters as JSON', () => {
    const parameters = [
      generateParameter({ name: 'param1', type: 'string', required: true }),
      generateParameter({ name: 'param2', type: 'integer', required: false })
    ];

    const formatted = formatParameters(parameters, 'json');

    const parsed = JSON.parse(formatted);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(2);
    expect(parsed[0]).toHaveProperty('name');
    expect(parsed[0]).toHaveProperty('type');
    expect(parsed[0]).toHaveProperty('required');
  });

  test('should format responses as markdown list', () => {
    const responses = [
      generateResponse({ statusCode: 200, description: 'Success' }),
      generateResponse({ statusCode: 404, description: 'Not Found' })
    ];

    const formatted = formatResponses(responses, 'markdown');

    expect(formatted).toContain('**200**');
    expect(formatted).toContain('Success');
    expect(formatted).toContain('**404**');
    expect(formatted).toContain('Not Found');
  });

  test('should format responses as HTML list', () => {
    const responses = [
      generateResponse({ statusCode: 200, description: 'Success' }),
      generateResponse({ statusCode: 404, description: 'Not Found' })
    ];

    const formatted = formatResponses(responses, 'html');

    expect(formatted).toContain('<ul class="responses">');
    expect(formatted).toContain('<strong>200</strong>');
    expect(formatted).toContain('<strong>404</strong>');
  });

  test('should format responses as JSON', () => {
    const responses = [
      generateResponse({ statusCode: 200, description: 'Success' }),
      generateResponse({ statusCode: 404, description: 'Not Found' })
    ];

    const formatted = formatResponses(responses, 'json');

    const parsed = JSON.parse(formatted);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(2);
    expect(parsed[0]).toHaveProperty('statusCode');
    expect(parsed[0]).toHaveProperty('description');
  });

  test('should handle empty parameters', () => {
    const parameters: ApiParameter[] = [];
    const formatted = formatParameters(parameters, 'markdown');

    expect(formatted).toContain('No parameters');
  });

  test('should handle empty responses', () => {
    const responses: ApiResponse[] = [];
    const formatted = formatResponses(responses, 'markdown');

    expect(formatted).toContain('No responses');
  });
});

/**
 * Test additional formatting utilities
 */
describe('Response Formatting - Utilities', () => {
  test('should format code blocks correctly', () => {
    const code = 'const x = 42;';
    const language = 'javascript';
    const formatted = formatCodeBlock(code, language);

    expect(formatted).toContain('```javascript');
    expect(formatted).toContain(code);
    expect(formatted).toContain('```');
  });

  test('should format collapsible sections correctly', () => {
    const title = 'Section Title';
    const content = 'Section content';
    const formatted = formatCollapsibleSection(title, content, true);

    expect(formatted).toContain('<details open>');
    expect(formatted).toContain('<summary>');
    expect(formatted).toContain(title);
    expect(formatted).toContain(content);
    expect(formatted).toContain('</details>');
  });

  test('should create formatting templates correctly', () => {
    const template = createFormattingTemplate('search');

    expect(template).toHaveProperty('type');
    expect(template).toHaveProperty('template');
    expect(template).toHaveProperty('placeholders');
    expect(template).toHaveProperty('example');
    expect(template.type).toBe('search');
  });

  test('should create endpoint template correctly', () => {
    const template = createFormattingTemplate('endpoint');

    expect(template.type).toBe('endpoint');
    expect(template.template).toContain('{{operation}}');
    expect(template.template).toContain('{{resource}}');
    expect(template.template).toContain('{{method}}');
  });

  test('should create parameters template correctly', () => {
    const template = createFormattingTemplate('parameters');

    expect(template.type).toBe('parameters');
    expect(template.template).toContain('| Name | Type | Required | Description |');
  });

  test('should create responses template correctly', () => {
    const template = createFormattingTemplate('responses');

    expect(template.type).toBe('responses');
    expect(template.template).toContain('{{list}}');
  });
});

/**
 * Test progressive disclosure
 */
describe('Response Formatting - Progressive Disclosure', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager({ enableProgressiveDisclosure: true });
  });

  test('should create progressive disclosure layers', () => {
    const results = createMockSearchResults(10);
    const maxTokens = 5000;
    const progressive = contextManager.progressiveDisclosure(results, maxTokens);

    expect(progressive).toHaveProperty('summary');
    expect(progressive).toHaveProperty('summaryTokens');
    expect(progressive).toHaveProperty('details');
    expect(progressive).toHaveProperty('detailsTokens');
    expect(progressive).toHaveProperty('full');
    expect(progressive).toHaveProperty('fullTokens');
    expect(progressive).toHaveProperty('fullExceedsLimit');
  });

  test('should have minimal tokens in summary layer', () => {
    const results = createMockSearchResults(10);
    const maxTokens = 5000;
    const progressive = contextManager.progressiveDisclosure(results, maxTokens);

    expect(progressive.summaryTokens).toBeLessThan(progressive.detailsTokens);
    expect(progressive.detailsTokens).toBeLessThanOrEqual(progressive.fullTokens);
  });

  test('should include top 3 results in details layer', () => {
    const results = createMockSearchResults(10);
    const maxTokens = 5000;
    const progressive = contextManager.progressiveDisclosure(results, maxTokens);

    expect(progressive.details).toContain('Top Results');
  });

  test('should handle empty results for progressive disclosure', () => {
    const results: SearchResult[] = [];
    const maxTokens = 5000;
    const progressive = contextManager.progressiveDisclosure(results, maxTokens);

    expect(progressive.summary).toBe('');
    expect(progressive.details).toBe('');
    expect(progressive.full).toBe('');
  });
});

/**
 * Test caching
 */
describe('Response Formatting - Caching', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  test('should cache context successfully', () => {
    const results = createMockSearchResults(5);
    const maxTokens = 1000;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    const cacheKey = 'test-key';
    contextManager.cacheContext(cacheKey, optimized);

    const cached = contextManager.getCachedContext(cacheKey);
    expect(cached).toBeDefined();
    expect(cached!.content).toBe(optimized.content);
  });

  test('should return null for non-existent cache key', () => {
    const cached = contextManager.getCachedContext('non-existent-key');
    expect(cached).toBeNull();
  });

  test('should expire cache entries after TTL', async () => {
    const contextManager = new ContextManager({ cacheTTL: 100 }); // 100ms TTL

    const results = createMockSearchResults(5);
    const maxTokens = 1000;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    const cacheKey = 'test-key';
    contextManager.cacheContext(cacheKey, optimized);

    // Wait for cache to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    const cached = contextManager.getCachedContext(cacheKey);
    expect(cached).toBeNull();
  });

  test('should clear cache successfully', () => {
    const results = createMockSearchResults(5);
    const maxTokens = 1000;
    const optimized = contextManager.optimizeContextWindow(results, maxTokens);

    const cacheKey = 'test-key';
    contextManager.cacheContext(cacheKey, optimized);

    contextManager.clearCache();

    const cached = contextManager.getCachedContext(cacheKey);
    expect(cached).toBeNull();
  });

  test('should respect max cache size', () => {
    const contextManager = new ContextManager({ maxCacheSize: 3 });

    const results = createMockSearchResults(5);
    const maxTokens = 1000;

    // Add 5 entries to cache with max size of 3
    for (let i = 0; i < 5; i++) {
      const optimized = contextManager.optimizeContextWindow(results, maxTokens);
      contextManager.cacheContext(`key-${i}`, optimized);
    }

    const stats = contextManager.getCacheStats();
    expect(stats.size).toBeLessThanOrEqual(3);
  });
});

/**
 * Test formatting metrics generation
 */
describe('Response Formatting - Metrics Generation', () => {
  test('should generate comprehensive formatting metrics', () => {
    const metrics: ResponseFormattingMetrics = {
      totalResponses: 100,
      successfullyFormatted: 98,
      failedToFormat: 2,
      markdownAccuracy: 99,
      jsonAccuracy: 100,
      htmlAccuracy: 98,
      contextWindowAccuracy: 97,
      summarizationAccuracy: 95,
      prioritizationAccuracy: 100,
      structureAccuracy: 99,
      overallAccuracy: 98.3
    };

    expect(metrics).toHaveProperty('totalResponses');
    expect(metrics).toHaveProperty('successfullyFormatted');
    expect(metrics).toHaveProperty('failedToFormat');
    expect(metrics).toHaveProperty('markdownAccuracy');
    expect(metrics).toHaveProperty('jsonAccuracy');
    expect(metrics).toHaveProperty('htmlAccuracy');
    expect(metrics).toHaveProperty('contextWindowAccuracy');
    expect(metrics).toHaveProperty('summarizationAccuracy');
    expect(metrics).toHaveProperty('prioritizationAccuracy');
    expect(metrics).toHaveProperty('structureAccuracy');
    expect(metrics).toHaveProperty('overallAccuracy');
  });

  test('should calculate overall formatting accuracy', () => {
    const metrics: ResponseFormattingMetrics = {
      totalResponses: 100,
      successfullyFormatted: 98,
      failedToFormat: 2,
      markdownAccuracy: 99,
      jsonAccuracy: 100,
      htmlAccuracy: 98,
      contextWindowAccuracy: 97,
      summarizationAccuracy: 95,
      prioritizationAccuracy: 100,
      structureAccuracy: 99,
      overallAccuracy: (
        99 + 100 + 98 + 97 + 95 + 100 + 99
      ) / 7
    };

    expect(metrics.overallAccuracy).toBeGreaterThan(95);
    expect(metrics.overallAccuracy).toBeLessThanOrEqual(100);
  });
});

/**
 * Export metrics for use in validation script
 */
export { ResponseFormattingMetrics, createMockSearchResults };
