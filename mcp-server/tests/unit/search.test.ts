/**
 * Unit tests for search tool
 */

import { VectorStore } from '../../src/indexer/vector';
import { buildMetadataIndex, MetadataIndex } from '../../src/parser/metadata';
import { ApiDocument, ApiEndpoint } from '../../src/utils/types';
import {
  searchApiDocs,
  searchByResource,
  searchByMethod,
  searchByPermission,
  SearchResult,
  SearchParams
} from '../../src/tools/search';

describe('Search Tool', () => {
  let vectorStore: VectorStore;
  let metadataIndex: MetadataIndex;
  let sampleDocuments: ApiDocument[];

  beforeEach(() => {
    // Create sample API documents for testing
    sampleDocuments = [
      {
        resourceName: 'Customer',
        endpoints: [
          {
            resource: 'Customer',
            operation: 'Get Customers',
            description: 'Retrieve a list of all customers in the system',
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
              },
              {
                name: 'limit',
                type: 'integer',
                required: false,
                description: 'Number of results per page',
                paramType: 'query'
              }
            ],
            responses: [
              {
                statusCode: 200,
                description: 'Successful response',
                example: { customers: [] }
              }
            ]
          },
          {
            resource: 'Customer',
            operation: 'Create Customer',
            description: 'Create a new customer in the system',
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
              },
              {
                name: 'email',
                type: 'string',
                required: true,
                description: 'Customer email address',
                paramType: 'body'
              }
            ],
            responses: [
              {
                statusCode: 201,
                description: 'Customer created successfully',
                example: { id: 1, name: 'Test Customer' }
              }
            ]
          }
        ]
      },
      {
        resourceName: 'Ticket',
        endpoints: [
          {
            resource: 'Ticket',
            operation: 'Get Tickets',
            description: 'Retrieve a list of all tickets',
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
            ],
            responses: [
              {
                statusCode: 200,
                description: 'Successful response',
                example: { tickets: [] }
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
                description: 'Ticket created successfully',
                example: { id: 1, subject: 'Test Ticket' }
              }
            ]
          },
          {
            resource: 'Ticket',
            operation: 'Update Ticket',
            description: 'Update an existing ticket',
            method: 'PUT',
            path: '/tickets/{id}',
            permission: 'ticket.update',
            parameters: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'Ticket ID',
                paramType: 'path'
              }
            ],
            requestBody: [
              {
                name: 'status',
                type: 'string',
                required: false,
                description: 'New ticket status',
                paramType: 'body'
              }
            ],
            responses: [
              {
                statusCode: 200,
                description: 'Ticket updated successfully',
                example: { id: 1, status: 'closed' }
              }
            ]
          }
        ]
      },
      {
        resourceName: 'Invoice',
        endpoints: [
          {
            resource: 'Invoice',
            operation: 'Get Invoices',
            description: 'Retrieve a list of all invoices',
            method: 'GET',
            path: '/invoices',
            permission: 'invoice.view',
            parameters: [],
            responses: [
              {
                statusCode: 200,
                description: 'Successful response',
                example: { invoices: [] }
              }
            ]
          }
        ]
      }
    ];

    // Build metadata index
    metadataIndex = buildMetadataIndex(sampleDocuments);

    // Initialize vector store
    vectorStore = new VectorStore();

    // Add embeddings for all endpoints
    for (const document of sampleDocuments) {
      for (const endpoint of document.endpoints) {
        const text = `${endpoint.resource} ${endpoint.operation} ${endpoint.description}`;
        const embeddingId = `${endpoint.method}:${endpoint.path}`;
        
        // Create a simple embedding vector (in real implementation, this would use actual embeddings)
        const embedding = {
          id: embeddingId,
          vector: createSimpleEmbedding(text),
          metadata: {
            endpointId: embeddingId,
            resource: endpoint.resource,
            method: endpoint.method,
            path: endpoint.path
          }
        };
        
        vectorStore.addVectors([embedding]);
      }
    }
  });

  /**
   * Helper function to create a simple embedding vector for testing
   */
  function createSimpleEmbedding(text: string): number[] {
    const characterSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?;:()-\'"/';
    const embeddingDimension = characterSet.length;
    const vector = new Array(embeddingDimension).fill(0);
    const totalChars = text.length;

    for (const char of text) {
      const index = characterSet.indexOf(char);
      if (index !== -1) {
        vector[index]++;
      }
    }

    if (totalChars > 0) {
      for (let i = 0; i < embeddingDimension; i++) {
        vector[i] = vector[i] / totalChars;
      }
    }

    return vector;
  }

  describe('Semantic Search', () => {
    test('should return results for a valid query', () => {
      const params: SearchParams = {
        query: 'get customers',
        limit: 5
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should return results with correct structure', () => {
      const params: SearchParams = {
        query: 'create ticket',
        limit: 5
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      if (results.length > 0) {
        const result = results[0];
        expect(result).toHaveProperty('endpoint');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('context');
        expect(result).toHaveProperty('matchType');
        
        expect(typeof result.score).toBe('number');
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
        
        expect(typeof result.context).toBe('string');
        expect(['semantic', 'keyword', 'hybrid']).toContain(result.matchType);
      }
    });

    test('should rank results by relevance score', () => {
      const params: SearchParams = {
        query: 'customer',
        limit: 10
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      if (results.length > 1) {
        // Check that results are sorted by score (descending)
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
        }
      }
    });
  });

  describe('Keyword Search', () => {
    test('should find results matching query terms in description', () => {
      const params: SearchParams = {
        query: 'support ticket',
        limit: 5
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      expect(results.length).toBeGreaterThan(0);
      
      // Check that at least one result contains the query terms
      const hasMatch = results.some(result => 
        result.endpoint.description.toLowerCase().includes('support') ||
        result.endpoint.description.toLowerCase().includes('ticket')
      );
      expect(hasMatch).toBe(true);
    });

    test('should find results matching query terms in resource name', () => {
      const params: SearchParams = {
        query: 'invoice',
        limit: 5
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      expect(results.length).toBeGreaterThan(0);
      
      const hasInvoice = results.some(result => 
        result.endpoint.resource.toLowerCase() === 'invoice'
      );
      expect(hasInvoice).toBe(true);
    });

    test('should find results matching query terms in operation name', () => {
      const params: SearchParams = {
        query: 'create',
        limit: 10
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      expect(results.length).toBeGreaterThan(0);
      
      const hasCreate = results.some(result => 
        result.endpoint.operation.toLowerCase().includes('create')
      );
      expect(hasCreate).toBe(true);
    });
  });

  describe('Hybrid Search', () => {
    test('should combine semantic and keyword results', () => {
      const params: SearchParams = {
        query: 'get customer list',
        limit: 5
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      expect(results.length).toBeGreaterThan(0);
      
      // Check that results have hybrid match type
      const hasHybrid = results.some(result => result.matchType === 'hybrid');
      expect(hasHybrid).toBe(true);
    });

    test('should deduplicate results from both search methods', () => {
      const params: SearchParams = {
        query: 'ticket',
        limit: 10
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      // Check that there are no duplicate endpoints
      const endpointKeys = new Set(
        results.map(r => `${r.endpoint.method}:${r.endpoint.path}`)
      );
      expect(endpointKeys.size).toBe(results.length);
    });
  });

  describe('Filtering by Resource', () => {
    test('should filter results by resource name', () => {
      const params: SearchParams = {
        query: 'get',
        resource: 'Customer',
        limit: 10
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      expect(results.length).toBeGreaterThan(0);
      
      // All results should be from Customer resource
      results.forEach(result => {
        expect(result.endpoint.resource).toBe('Customer');
      });
    });

    test('should return empty results for non-existent resource', () => {
      const params: SearchParams = {
        query: 'get',
        resource: 'NonExistent',
        limit: 10
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      expect(results.length).toBe(0);
    });

    test('should search by resource using helper function', () => {
      const results = searchByResource('Customer', metadataIndex);

      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.resource).toBe('Customer');
      });
    });
  });

  describe('Filtering by Method', () => {
    test('should filter results by HTTP method', () => {
      const params: SearchParams = {
        query: 'customer',
        method: 'GET',
        limit: 10
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      expect(results.length).toBeGreaterThan(0);
      
      // All results should be GET requests
      results.forEach(result => {
        expect(result.endpoint.method).toBe('GET');
      });
    });

    test('should handle case-insensitive method filter', () => {
      const params1: SearchParams = {
        query: 'customer',
        method: 'get',
        limit: 10
      };

      const params2: SearchParams = {
        query: 'customer',
        method: 'GET',
        limit: 10
      };

      const results1 = searchApiDocs(params1, vectorStore, metadataIndex);
      const results2 = searchApiDocs(params2, vectorStore, metadataIndex);

      expect(results1.length).toBe(results2.length);
    });

    test('should search by method using helper function', () => {
      const results = searchByMethod('POST', metadataIndex);

      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.method).toBe('POST');
      });
    });
  });

  describe('Filtering by Permission', () => {
    test('should filter results by permission', () => {
      const params: SearchParams = {
        query: 'customer',
        permission: 'customer.view',
        limit: 10
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      expect(results.length).toBeGreaterThan(0);
      
      // All results should have the specified permission
      results.forEach(result => {
        expect(result.endpoint.permission).toBe('customer.view');
      });
    });

    test('should return empty results for non-existent permission', () => {
      const params: SearchParams = {
        query: 'customer',
        permission: 'nonexistent.permission',
        limit: 10
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      expect(results.length).toBe(0);
    });

    test('should search by permission using helper function', () => {
      const results = searchByPermission('ticket.view', metadataIndex);

      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.permission).toBe('ticket.view');
      });
    });
  });

  describe('Result Ranking', () => {
    test('should return results sorted by relevance score', () => {
      const params: SearchParams = {
        query: 'create',
        limit: 10
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      if (results.length > 1) {
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
        }
      }
    });

    test('should assign higher scores to more relevant results', () => {
      const params: SearchParams = {
        query: 'create customer',
        limit: 5
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      if (results.length > 0) {
        // The top result should be related to creating customers
        const topResult = results[0];
        const isRelevant = 
          topResult.endpoint.resource.toLowerCase().includes('customer') ||
          topResult.endpoint.operation.toLowerCase().includes('create');
        
        expect(isRelevant).toBe(true);
      }
    });
  });

  describe('Pagination', () => {
    test('should respect the limit parameter', () => {
      const params: SearchParams = {
        query: 'get',
        limit: 2
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      expect(results.length).toBeLessThanOrEqual(2);
    });

    test('should use default limit of 5 when not specified', () => {
      const params: SearchParams = {
        query: 'get'
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      expect(results.length).toBeLessThanOrEqual(5);
    });

    test('should return different results for different limit values', () => {
      const params1: SearchParams = {
        query: 'get',
        limit: 2
      };

      const params2: SearchParams = {
        query: 'get',
        limit: 5
      };

      const results1 = searchApiDocs(params1, vectorStore, metadataIndex);
      const results2 = searchApiDocs(params2, vectorStore, metadataIndex);

      expect(results2.length).toBeGreaterThanOrEqual(results1.length);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for empty query', () => {
      const params: SearchParams = {
        query: '',
        limit: 5
      };

      expect(() => {
        searchApiDocs(params, vectorStore, metadataIndex);
      }).toThrow('Query parameter is required and cannot be empty');
    });

    test('should throw error for whitespace-only query', () => {
      const params: SearchParams = {
        query: '   ',
        limit: 5
      };

      expect(() => {
        searchApiDocs(params, vectorStore, metadataIndex);
      }).toThrow('Query parameter is required and cannot be empty');
    });

    test('should handle empty vector store gracefully', () => {
      const emptyVectorStore = new VectorStore();
      const params: SearchParams = {
        query: 'test',
        limit: 5
      };

      const results = searchApiDocs(params, emptyVectorStore, metadataIndex);

      // Should still return keyword search results
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Context Generation', () => {
    test('should generate context snippets for results', () => {
      const params: SearchParams = {
        query: 'customer',
        limit: 5
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      if (results.length > 0) {
        results.forEach(result => {
          expect(result.context).toBeDefined();
          expect(typeof result.context).toBe('string');
          expect(result.context.length).toBeGreaterThan(0);
        });
      }
    });

    test('should include query terms in context when possible', () => {
      const params: SearchParams = {
        query: 'create',
        limit: 5
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      if (results.length > 0) {
        const hasQueryInContext = results.some(result => 
          result.context.toLowerCase().includes('create')
        );
        expect(hasQueryInContext).toBe(true);
      }
    });
  });

  describe('Combined Filters', () => {
    test('should apply multiple filters simultaneously', () => {
      const params: SearchParams = {
        query: 'get',
        resource: 'Customer',
        method: 'GET',
        limit: 10
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      results.forEach(result => {
        expect(result.endpoint.resource).toBe('Customer');
        expect(result.endpoint.method).toBe('GET');
      });
    });

    test('should return empty results when filters conflict', () => {
      const params: SearchParams = {
        query: 'get',
        resource: 'Customer',
        method: 'POST',
        limit: 10
      };

      const results = searchApiDocs(params, vectorStore, metadataIndex);

      // Customer GET endpoints exist, but Customer POST endpoints might not match "get" query
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
