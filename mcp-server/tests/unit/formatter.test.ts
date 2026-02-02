/**
 * Unit tests for context management module
 */

import {
  ContextManager,
  OptimizedContext,
  ProgressiveContext,
  formatSearchResults,
  formatEndpoint,
  formatParameters,
  formatResponses,
  formatCodeBlock,
  formatCollapsibleSection,
  createFormattingTemplate,
  FormattedResponse,
  Template
} from '../../src/retrieval/formatter';
import { SearchResult } from '../../src/retrieval/scoring';
import { ApiEndpoint, ApiParameter, ApiResponse } from '../../src/utils/types';

describe('ContextManager', () => {
  let contextManager: ContextManager;
  let mockResults: SearchResult[];

  beforeEach(() => {
    contextManager = new ContextManager();
    mockResults = createMockSearchResults();
  });

  describe('optimizeContextWindow', () => {
    it('should return empty context for empty results', () => {
      const result = contextManager.optimizeContextWindow([], 1000);

      expect(result.content).toBe('');
      expect(result.tokenCount).toBe(0);
      expect(result.resultCount).toBe(0);
      expect(result.excludedCount).toBe(0);
      expect(result.truncated).toBe(false);
    });

    it('should include all results when within token limit', () => {
      const result = contextManager.optimizeContextWindow(mockResults, 10000);

      expect(result.resultCount).toBe(mockResults.length);
      expect(result.excludedCount).toBe(0);
      expect(result.truncated).toBe(false);
      expect(result.content).toContain(mockResults[0].endpoint.operation);
    });

    it('should truncate results when exceeding token limit', () => {
      const result = contextManager.optimizeContextWindow(mockResults, 500);

      expect(result.resultCount).toBeLessThan(mockResults.length);
      expect(result.excludedCount).toBeGreaterThan(0);
      expect(result.truncated).toBe(true);
    });

    it('should prioritize results by relevance score', () => {
      const result = contextManager.optimizeContextWindow(mockResults, 500);

      // First result should have highest score
      const firstResult = mockResults[0];
      expect(result.content).toContain(firstResult.endpoint.operation);
    });

    it('should generate summary when truncated', () => {
      const result = contextManager.optimizeContextWindow(mockResults, 500);

      if (result.truncated) {
        expect(result.summary).toBeDefined();
        expect(result.summary).toContain('Additional');
      }
    });

    it('should estimate token count accurately', () => {
      const result = contextManager.optimizeContextWindow(mockResults, 10000);

      expect(result.tokenCount).toBeGreaterThan(0);
      expect(result.tokenCount).toBeLessThanOrEqual(10000);
    });
  });

  describe('summarizeResults', () => {
    it('should return empty string for empty results', () => {
      const summary = contextManager.summarizeResults([], 1000);

      expect(summary).toBe('');
    });

    it('should group results by resource', () => {
      const summary = contextManager.summarizeResults(mockResults, 1000);

      expect(summary).toContain('Customer');
      expect(summary).toContain('Ticket');
      expect(summary).toContain('Invoice');
    });

    it('should show count of endpoints per resource', () => {
      const summary = contextManager.summarizeResults(mockResults, 1000);

      expect(summary).toMatch(/\d+ endpoint/);
    });

    it('should list operations for each resource', () => {
      const summary = contextManager.summarizeResults(mockResults, 1000);

      expect(summary).toContain('Get Customers');
      expect(summary).toContain('Create Ticket');
    });

    it('should truncate summary if exceeding token limit', () => {
      const summary = contextManager.summarizeResults(mockResults, 10);

      expect(summary.length).toBeLessThan(100);
      expect(summary.endsWith('...')).toBe(true);
    });
  });

  describe('progressiveDisclosure', () => {
    it('should return empty layers for empty results', () => {
      const result = contextManager.progressiveDisclosure([], 10000);

      expect(result.summary).toBe('');
      expect(result.details).toBe('');
      expect(result.full).toBe('');
      expect(result.summaryTokens).toBe(0);
      expect(result.detailsTokens).toBe(0);
      expect(result.fullTokens).toBe(0);
      expect(result.fullExceedsLimit).toBe(false);
    });

    it('should create summary layer with minimal tokens', () => {
      const result = contextManager.progressiveDisclosure(mockResults, 10000);

      expect(result.summary).toContain('Found');
      expect(result.summaryTokens).toBeLessThan(result.detailsTokens);
      expect(result.summaryTokens).toBeLessThan(result.fullTokens);
    });

    it('should create details layer with top 3 results', () => {
      const result = contextManager.progressiveDisclosure(mockResults, 10000);

      expect(result.details).toContain('Top Results');
      expect(result.detailsTokens).toBeGreaterThan(result.summaryTokens);
    });

    it('should create full layer with all results', () => {
      const result = contextManager.progressiveDisclosure(mockResults, 10000);

      expect(result.full).toContain(mockResults[0].endpoint.operation);
      expect(result.fullTokens).toBeGreaterThan(result.detailsTokens);
    });

    it('should indicate if full layer exceeds limit', () => {
      const result = contextManager.progressiveDisclosure(mockResults, 500);

      if (result.fullExceedsLimit) {
        expect(result.fullExceedsLimit).toBe(true);
      }
    });

    it('should maintain token hierarchy: summary < details < full', () => {
      const result = contextManager.progressiveDisclosure(mockResults, 10000);

      expect(result.summaryTokens).toBeLessThanOrEqual(result.detailsTokens);
      expect(result.detailsTokens).toBeLessThanOrEqual(result.fullTokens);
    });
  });

  describe('prioritizeContext', () => {
    it('should sort results by relevance score descending', () => {
      const prioritized = contextManager.prioritizeContext(mockResults, '');

      for (let i = 0; i < prioritized.length - 1; i++) {
        expect(prioritized[i].score).toBeGreaterThanOrEqual(prioritized[i + 1].score);
      }
    });

    it('should not modify original results array', () => {
      const originalOrder = mockResults.map(r => r.endpoint.operation);
      const prioritized = contextManager.prioritizeContext(mockResults, '');

      expect(mockResults.map(r => r.endpoint.operation)).toEqual(originalOrder);
    });

    it('should return empty array for empty input', () => {
      const result = contextManager.prioritizeContext([], '');

      expect(result).toEqual([]);
    });

    it('should handle single result', () => {
      const singleResult = [mockResults[0]];
      const result = contextManager.prioritizeContext(singleResult, '');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(singleResult[0]);
    });
  });

  describe('context caching', () => {
    it('should cache context successfully', () => {
      const context: OptimizedContext = {
        content: 'Test content',
        tokenCount: 10,
        resultCount: 1,
        excludedCount: 0,
        truncated: false
      };

      contextManager.cacheContext('test-key', context);
      const cached = contextManager.getCachedContext('test-key');

      expect(cached).toEqual(context);
    });

    it('should return null for non-existent cache key', () => {
      const cached = contextManager.getCachedContext('non-existent');

      expect(cached).toBeNull();
    });

    it('should return null for expired cache entries', () => {
      const context: OptimizedContext = {
        content: 'Test content',
        tokenCount: 10,
        resultCount: 1,
        excludedCount: 0,
        truncated: false
      };

      // Create context manager with very short TTL
      const shortTTLManager = new ContextManager({ cacheTTL: 1 });
      shortTTLManager.cacheContext('test-key', context);

      // Wait for cache to expire
      return new Promise<void>(resolve => {
        setTimeout(() => {
          const cached = shortTTLManager.getCachedContext('test-key');
          expect(cached).toBeNull();
          resolve();
        }, 10);
      });
    });

    it('should clear all cache entries', () => {
      const context: OptimizedContext = {
        content: 'Test content',
        tokenCount: 10,
        resultCount: 1,
        excludedCount: 0,
        truncated: false
      };

      contextManager.cacheContext('key1', context);
      contextManager.cacheContext('key2', context);

      contextManager.clearCache();

      expect(contextManager.getCachedContext('key1')).toBeNull();
      expect(contextManager.getCachedContext('key2')).toBeNull();
    });

    it('should respect max cache size limit', () => {
      const context: OptimizedContext = {
        content: 'Test content',
        tokenCount: 10,
        resultCount: 1,
        excludedCount: 0,
        truncated: false
      };

      // Create context manager with small cache size
      const smallCacheManager = new ContextManager({ maxCacheSize: 2 });

      smallCacheManager.cacheContext('key1', context);
      smallCacheManager.cacheContext('key2', context);
      smallCacheManager.cacheContext('key3', context);

      // First entry should be evicted
      expect(smallCacheManager.getCachedContext('key1')).toBeNull();
      expect(smallCacheManager.getCachedContext('key2')).not.toBeNull();
      expect(smallCacheManager.getCachedContext('key3')).not.toBeNull();
    });
  });

  describe('token estimation', () => {
    it('should return 0 for empty string', () => {
      const tokens = contextManager.estimateTokens('');

      expect(tokens).toBe(0);
    });

    it('should estimate tokens for plain text', () => {
      const text = 'This is a test string with some words';
      const tokens = contextManager.estimateTokens(text);

      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(text.length);
    });

    it('should estimate tokens for markdown content', () => {
      const markdown = '# Header\n\nSome **bold** text and `code`.\n\n- List item 1\n- List item 2';
      const tokens = contextManager.estimateTokens(markdown);

      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(markdown.length);
    });

    it('should handle large content efficiently', () => {
      const largeContent = 'A'.repeat(10000);
      const tokens = contextManager.estimateTokens(largeContent);

      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(largeContent.length);
    });
  });

  describe('configuration', () => {
    it('should use default configuration', () => {
      const config = contextManager.getConfig();

      expect(config.defaultMaxTokens).toBe(4000);
      expect(config.cacheTTL).toBe(300000);
      expect(config.maxCacheSize).toBe(100);
      expect(config.enableProgressiveDisclosure).toBe(true);
      expect(config.enableSummarization).toBe(true);
      expect(config.summarizationThreshold).toBe(5);
    });

    it('should update configuration', () => {
      contextManager.updateConfig({
        defaultMaxTokens: 8000,
        cacheTTL: 600000
      });

      const config = contextManager.getConfig();

      expect(config.defaultMaxTokens).toBe(8000);
      expect(config.cacheTTL).toBe(600000);
    });

    it('should preserve unchanged configuration values', () => {
      const originalConfig = contextManager.getConfig();

      contextManager.updateConfig({ defaultMaxTokens: 8000 });

      const newConfig = contextManager.getConfig();

      expect(newConfig.cacheTTL).toBe(originalConfig.cacheTTL);
      expect(newConfig.maxCacheSize).toBe(originalConfig.maxCacheSize);
    });
  });

  describe('cache statistics', () => {
    it('should return correct cache statistics', () => {
      const stats = contextManager.getCacheStats();

      expect(stats.size).toBe(0);
      expect(stats.maxSize).toBe(100);
      expect(stats.ttl).toBe(300000);
    });

    it('should update cache size after adding entries', () => {
      const context: OptimizedContext = {
        content: 'Test',
        tokenCount: 5,
        resultCount: 1,
        excludedCount: 0,
        truncated: false
      };

      contextManager.cacheContext('key1', context);
      contextManager.cacheContext('key2', context);

      const stats = contextManager.getCacheStats();

      expect(stats.size).toBe(2);
    });

    it('should update cache size after clearing', () => {
      const context: OptimizedContext = {
        content: 'Test',
        tokenCount: 5,
        resultCount: 1,
        excludedCount: 0,
        truncated: false
      };

      contextManager.cacheContext('key1', context);
      contextManager.clearCache();

      const stats = contextManager.getCacheStats();

      expect(stats.size).toBe(0);
    });
  });
});

/**
 * Helper function to create mock search results
 */
function createMockSearchResults(): SearchResult[] {
  const endpoints: ApiEndpoint[] = [
    {
      resource: 'Customer',
      operation: 'Get Customers',
      description: 'Retrieve a list of all customers',
      method: 'GET',
      path: '/customers',
      permission: 'customer.view',
      parameters: [
        {
          name: 'page',
          type: 'integer',
          required: false,
          description: 'Page number for pagination',
          paramType: 'query'
        }
      ],
      responses: [
        {
          statusCode: 200,
          description: 'List of customers'
        }
      ]
    },
    {
      resource: 'Customer',
      operation: 'Create Customer',
      description: 'Create a new customer',
      method: 'POST',
      path: '/customers',
      permission: 'customer.create',
      parameters: [],
      requestBody: [
        {
          name: 'name',
          type: 'string',
          required: true,
          description: 'Customer name',
          paramType: 'body'
        }
      ],
      responses: [
        {
          statusCode: 201,
          description: 'Customer created'
        }
      ]
    },
    {
      resource: 'Ticket',
      operation: 'Create Ticket',
      description: 'Create a new support ticket',
      method: 'POST',
      path: '/tickets',
      permission: 'ticket.create',
      parameters: [],
      requestBody: [
        {
          name: 'subject',
          type: 'string',
          required: true,
          description: 'Ticket subject',
          paramType: 'body'
        }
      ],
      responses: [
        {
          statusCode: 201,
          description: 'Ticket created'
        }
      ]
    },
    {
      resource: 'Ticket',
      operation: 'Get Tickets',
      description: 'Retrieve a list of tickets',
      method: 'GET',
      path: '/tickets',
      permission: 'ticket.view',
      parameters: [
        {
          name: 'status',
          type: 'string',
          required: false,
          description: 'Filter by status',
          paramType: 'query'
        }
      ],
      responses: [
        {
          statusCode: 200,
          description: 'List of tickets'
        }
      ]
    },
    {
      resource: 'Invoice',
      operation: 'Create Invoice',
      description: 'Create a new invoice',
      method: 'POST',
      path: '/invoices',
      permission: 'invoice.create',
      parameters: [],
      requestBody: [
        {
          name: 'customer_id',
          type: 'integer',
          required: true,
          description: 'Customer ID',
          paramType: 'body'
        }
      ],
      responses: [
        {
          statusCode: 201,
          description: 'Invoice created'
        }
      ]
    }
  ];

  return endpoints.map((endpoint, index) => ({
    endpoint,
    score: 1 - index * 0.15, // Decreasing scores
    matchType: 'hybrid' as const,
    context: 'Test context'
  }));
}

describe('Structured Response Formatting', () => {
  describe('formatSearchResults', () => {
    it('should format search results as markdown', () => {
      const results = createMockSearchResults();
      const formatted = formatSearchResults(results, 'markdown');

      expect(formatted.markdown).toContain('# Search Results');
      expect(formatted.markdown).toContain('Found 5 results:');
      expect(formatted.markdown).toContain('## 1. Get Customers');
      expect(formatted.markdown).toContain('**Resource:** Customer');
      expect(formatted.markdown).toContain('**Method:** GET');
      expect(formatted.markdown).toContain('**Path:** `/customers`');
      expect(formatted.markdown).toContain('**Permission:** customer.view');
      expect(formatted.markdown).toContain('**Relevance:**');
      expect(formatted.json).toBeDefined();
      expect(formatted.html).toBeDefined();
      expect(formatted.tokenCount).toBeGreaterThan(0);
    });

    it('should format search results as JSON', () => {
      const results = createMockSearchResults();
      const formatted = formatSearchResults(results, 'json');

      expect(formatted.json).toContain('"results"');
      expect(formatted.json).toContain('"count": 5');
      expect(formatted.json).toContain('"resource": "Customer"');
      expect(formatted.json).toContain('"operation": "Get Customers"');
      expect(formatted.markdown).toBeDefined();
      expect(formatted.html).toBeDefined();
      expect(formatted.tokenCount).toBeGreaterThan(0);
    });

    it('should format search results as HTML', () => {
      const results = createMockSearchResults();
      const formatted = formatSearchResults(results, 'html');

      expect(formatted.html).toContain('<div class="search-results">');
      expect(formatted.html).toContain('<h1>Search Results</h1>');
      expect(formatted.html).toContain('Found 5 results:');
      expect(formatted.html).toContain('<h2>1. Get Customers</h2>');
      expect(formatted.html).toContain('<dt>Resource:</dt>');
      expect(formatted.html).toContain('<dt>Method:</dt>');
      expect(formatted.html).toContain('<dt>Path:</dt>');
      expect(formatted.markdown).toBeDefined();
      expect(formatted.json).toBeDefined();
      expect(formatted.tokenCount).toBeGreaterThan(0);
    });

    it('should handle empty results', () => {
      const formatted = formatSearchResults([], 'markdown');

      expect(formatted.markdown).toBe('No results found.');
      expect(formatted.html).toContain('No results found.');
      expect(formatted.json).toContain('"count": 0');
      expect(formatted.tokenCount).toBe(0);
    });

    it('should include all three formats in response', () => {
      const results = createMockSearchResults();
      const formatted = formatSearchResults(results, 'markdown');

      expect(formatted).toHaveProperty('markdown');
      expect(formatted).toHaveProperty('json');
      expect(formatted).toHaveProperty('html');
      expect(formatted).toHaveProperty('tokenCount');
    });
  });

  describe('formatEndpoint', () => {
    it('should format endpoint as markdown', () => {
      const endpoint = createMockSearchResults()[0].endpoint;
      const formatted = formatEndpoint(endpoint, 'markdown');

      expect(formatted).toContain('# Get Customers');
      expect(formatted).toContain('**Resource:** Customer');
      expect(formatted).toContain('**Method:** GET');
      expect(formatted).toContain('**Path:** `/customers`');
      expect(formatted).toContain('**Permission:** customer.view');
      expect(formatted).toContain('## Parameters');
      expect(formatted).toContain('| Name | Type | Required | Description |');
    });

    it('should format endpoint as JSON', () => {
      const endpoint = createMockSearchResults()[0].endpoint;
      const formatted = formatEndpoint(endpoint, 'json');

      expect(formatted).toContain('"resource": "Customer"');
      expect(formatted).toContain('"operation": "Get Customers"');
      expect(formatted).toContain('"method": "GET"');
      expect(formatted).toContain('"path": "/customers"');
      expect(formatted).toContain('"permission": "customer.view"');
    });

    it('should format endpoint as HTML', () => {
      const endpoint = createMockSearchResults()[0].endpoint;
      const formatted = formatEndpoint(endpoint, 'html');

      expect(formatted).toContain('<div class="endpoint">');
      expect(formatted).toContain('<h1>Get Customers</h1>');
      expect(formatted).toContain('<dt>Resource:</dt>');
      expect(formatted).toContain('<dt>Method:</dt>');
      expect(formatted).toContain('<dt>Path:</dt>');
      expect(formatted).toContain('<h2>Parameters</h2>');
      expect(formatted).toContain('<table class="parameters">');
    });

    it('should handle endpoint with request body', () => {
      const endpoint = createMockSearchResults()[1].endpoint; // Create Customer
      const formatted = formatEndpoint(endpoint, 'markdown');

      expect(formatted).toContain('## Request Body');
      expect(formatted).toContain('| Name | Type | Required | Description |');
    });

    it('should handle endpoint with responses', () => {
      const endpoint = createMockSearchResults()[0].endpoint;
      const formatted = formatEndpoint(endpoint, 'markdown');

      expect(formatted).toContain('## Responses');
      expect(formatted).toContain('- **200**');
    });
  });

  describe('formatParameters', () => {
    it('should format parameters as markdown table', () => {
      const parameters = createMockParameters();
      const formatted = formatParameters(parameters, 'markdown');

      expect(formatted).toContain('| Name | Type | Required | Description |');
      expect(formatted).toContain('|------|------|----------|-------------|');
      expect(formatted).toContain('| `page` | integer | Yes | Page number |');
      expect(formatted).toContain('| `limit` | string | No | Limit results |');
    });

    it('should format parameters as JSON', () => {
      const parameters = createMockParameters();
      const formatted = formatParameters(parameters, 'json');

      expect(formatted).toContain('"name": "page"');
      expect(formatted).toContain('"type": "integer"');
      expect(formatted).toContain('"required": true');
      expect(formatted).toContain('"name": "limit"');
    });

    it('should format parameters as HTML table', () => {
      const parameters = createMockParameters();
      const formatted = formatParameters(parameters, 'html');

      expect(formatted).toContain('<table class="parameters">');
      expect(formatted).toContain('<thead>');
      expect(formatted).toContain('<th>Name</th>');
      expect(formatted).toContain('<th>Type</th>');
      expect(formatted).toContain('<th>Required</th>');
      expect(formatted).toContain('<th>Description</th>');
      expect(formatted).toContain('<tbody>');
      expect(formatted).toContain('<td><code>page</code></td>');
      expect(formatted).toContain('<span class="required">Yes</span>');
    });

    it('should handle empty parameters', () => {
      const formattedMarkdown = formatParameters([], 'markdown');
      const formattedHtml = formatParameters([], 'html');

      expect(formattedMarkdown).toBe('No parameters.\n');
      expect(formattedHtml).toContain('No parameters.');
    });
  });

  describe('formatResponses', () => {
    it('should format responses as markdown list', () => {
      const responses = createMockResponses();
      const formatted = formatResponses(responses, 'markdown');

      expect(formatted).toContain('- **200**');
      expect(formatted).toContain('- **201**');
      expect(formatted).toContain('- **401**');
      expect(formatted).toContain('List of customers');
      expect(formatted).toContain('Customer created');
      expect(formatted).toContain('Unauthorized');
    });

    it('should format responses as JSON', () => {
      const responses = createMockResponses();
      const formatted = formatResponses(responses, 'json');

      expect(formatted).toContain('"statusCode": 200');
      expect(formatted).toContain('"statusCode": 201');
      expect(formatted).toContain('"statusCode": 401');
      expect(formatted).toContain('"description": "List of customers"');
    });

    it('should format responses as HTML list', () => {
      const responses = createMockResponses();
      const formatted = formatResponses(responses, 'html');

      expect(formatted).toContain('<ul class="responses">');
      expect(formatted).toContain('<li>');
      expect(formatted).toContain('<strong>200</strong>');
      expect(formatted).toContain('List of customers');
    });

    it('should handle responses with examples', () => {
      const responses = createMockResponses();
      const formatted = formatResponses(responses, 'markdown');

      expect(formatted).toContain('```json');
      expect(formatted).toContain('```');
    });

    it('should handle empty responses', () => {
      const formattedMarkdown = formatResponses([], 'markdown');
      const formattedHtml = formatResponses([], 'html');

      expect(formattedMarkdown).toBe('No responses.\n');
      expect(formattedHtml).toContain('No responses.');
    });
  });

  describe('formatCodeBlock', () => {
    it('should format code block with language', () => {
      const code = 'const x = 42;';
      const formatted = formatCodeBlock(code, 'javascript');

      expect(formatted).toContain('```javascript');
      expect(formatted).toContain('const x = 42;');
      expect(formatted).toContain('```');
    });

    it('should format code block with different languages', () => {
      const pythonCode = 'x = 42';
      const formattedPython = formatCodeBlock(pythonCode, 'python');

      expect(formattedPython).toContain('```python');
      expect(formattedPython).toContain('x = 42');

      const curlCode = 'curl -X GET https://api.example.com';
      const formattedCurl = formatCodeBlock(curlCode, 'bash');

      expect(formattedCurl).toContain('```bash');
      expect(formattedCurl).toContain('curl -X GET');
    });

    it('should handle multi-line code', () => {
      const code = 'const x = 42;\nconst y = 24;\nconsole.log(x + y);';
      const formatted = formatCodeBlock(code, 'javascript');

      expect(formatted).toContain('```javascript');
      expect(formatted).toContain('const x = 42;');
      expect(formatted).toContain('const y = 24;');
      expect(formatted).toContain('console.log(x + y);');
      expect(formatted).toContain('```');
    });

    it('should handle empty code', () => {
      const formatted = formatCodeBlock('', 'javascript');

      expect(formatted).toContain('```javascript');
      expect(formatted).toContain('```');
    });
  });

  describe('formatCollapsibleSection', () => {
    it('should format collapsible section with default open', () => {
      const title = 'Section Title';
      const content = 'Section content here.';
      const formatted = formatCollapsibleSection(title, content, true);

      expect(formatted).toContain('<details open>');
      expect(formatted).toContain('<summary>Section Title</summary>');
      expect(formatted).toContain('Section content here.');
      expect(formatted).toContain('</details>');
    });

    it('should format collapsible section with default closed', () => {
      const title = 'Section Title';
      const content = 'Section content here.';
      const formatted = formatCollapsibleSection(title, content, false);

      expect(formatted).toContain('<details closed>');
      expect(formatted).toContain('<summary>Section Title</summary>');
      expect(formatted).toContain('Section content here.');
      expect(formatted).toContain('</details>');
    });

    it('should escape HTML in title', () => {
      const title = '<script>alert("xss")</script>';
      const content = 'Content';
      const formatted = formatCollapsibleSection(title, content, true);

      expect(formatted).toContain('&lt;script&gt;');
      expect(formatted).not.toContain('<script>');
    });

    it('should handle multi-line content', () => {
      const title = 'Section';
      const content = 'Line 1\nLine 2\nLine 3';
      const formatted = formatCollapsibleSection(title, content, true);

      expect(formatted).toContain('Line 1');
      expect(formatted).toContain('Line 2');
      expect(formatted).toContain('Line 3');
    });
  });

  describe('createFormattingTemplate', () => {
    it('should create search template', () => {
      const template = createFormattingTemplate('search');

      expect(template.type).toBe('search');
      expect(template.template).toContain('# Search Results');
      expect(template.template).toContain('{{count}}');
      expect(template.template).toContain('{{results}}');
      expect(template.placeholders).toHaveProperty('count');
      expect(template.placeholders).toHaveProperty('results');
      expect(template.example).toContain('# Search Results');
    });

    it('should create endpoint template', () => {
      const template = createFormattingTemplate('endpoint');

      expect(template.type).toBe('endpoint');
      expect(template.template).toContain('# {{operation}}');
      expect(template.template).toContain('{{resource}}');
      expect(template.template).toContain('{{method}}');
      expect(template.template).toContain('{{path}}');
      expect(template.placeholders).toHaveProperty('operation');
      expect(template.placeholders).toHaveProperty('resource');
      expect(template.example).toContain('# Get Customers');
    });

    it('should create parameters template', () => {
      const template = createFormattingTemplate('parameters');

      expect(template.type).toBe('parameters');
      expect(template.template).toContain('## Parameters');
      expect(template.template).toContain('| Name | Type | Required | Description |');
      expect(template.template).toContain('{{rows}}');
      expect(template.placeholders).toHaveProperty('rows');
      expect(template.example).toContain('## Parameters');
    });

    it('should create responses template', () => {
      const template = createFormattingTemplate('responses');

      expect(template.type).toBe('responses');
      expect(template.template).toContain('## Responses');
      expect(template.template).toContain('{{list}}');
      expect(template.placeholders).toHaveProperty('list');
      expect(template.example).toContain('## Responses');
    });

    it('should include all required template properties', () => {
      const template = createFormattingTemplate('search');

      expect(template).toHaveProperty('type');
      expect(template).toHaveProperty('template');
      expect(template).toHaveProperty('placeholders');
      expect(template).toHaveProperty('example');
    });
  });
});

/**
 * Helper function to create mock parameters
 */
function createMockParameters(): ApiParameter[] {
  return [
    {
      name: 'page',
      type: 'integer',
      required: true,
      description: 'Page number',
      paramType: 'query'
    },
    {
      name: 'limit',
      type: 'string',
      required: false,
      description: 'Limit results',
      paramType: 'query'
    }
  ];
}

/**
 * Helper function to create mock responses
 */
function createMockResponses(): ApiResponse[] {
  return [
    {
      statusCode: 200,
      description: 'List of customers',
      example: { customers: [] }
    },
    {
      statusCode: 201,
      description: 'Customer created',
      example: { id: 1, name: 'Test Customer' }
    },
    {
      statusCode: 401,
      description: 'Unauthorized'
    }
  ];
}
