/**
 * Unit tests for code example generator tool
 */

import {
  generateCodeExample,
  generateCodeExamplesForAllLanguages,
  CodeExampleParams,
  CodeLanguage
} from '../../src/tools/code-examples';
import { MetadataIndex, buildMetadataIndex } from '../../src/parser/metadata';
import { ApiDocument } from '../../src/utils/types';

describe('Code Example Generator Tool', () => {
  let metadataIndex: MetadataIndex;

  beforeEach(() => {
    // Create sample API documents for testing
    const sampleDocuments: ApiDocument[] = [
      {
        resourceName: 'Customer',
        endpoints: [
          {
            resource: 'Customer',
            operation: 'Get Customer by ID',
            description: 'Retrieve a specific customer by ID',
            method: 'GET',
            path: '/customers/{id}',
            permission: 'customer.view',
            parameters: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'Customer ID',
                paramType: 'path'
              }
            ],
            responses: [
              {
                statusCode: 200,
                description: 'Successful response',
                example: { customer: { id: 123, name: 'John Doe' } }
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
              },
              {
                name: 'email',
                type: 'string',
                required: false,
                description: 'Customer email',
                paramType: 'body'
              }
            ],
            responses: [
              {
                statusCode: 201,
                description: 'Customer created successfully',
                example: { customer: { id: 123, name: 'John Doe', email: 'john@example.com' } }
              }
            ]
          },
          {
            resource: 'Customer',
            operation: 'Get Customers',
            description: 'Retrieve a list of customers',
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
          }
        ]
      },
      {
        resourceName: 'Ticket',
        endpoints: [
          {
            resource: 'Ticket',
            operation: 'Get Ticket by ID',
            description: 'Retrieve a specific ticket by ID',
            method: 'GET',
            path: '/tickets/{id}',
            permission: 'ticket.view',
            parameters: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'Ticket ID',
                paramType: 'path'
              }
            ],
            responses: [
              {
                statusCode: 200,
                description: 'Successful response',
                example: { ticket: { id: 456, subject: 'Support Request' } }
              }
            ]
          }
        ]
      }
    ];

    // Build metadata index from sample documents
    metadataIndex = buildMetadataIndex(sampleDocuments);
  });

  describe('generateCodeExample - JavaScript code generation', () => {
    test('should generate JavaScript code for GET endpoint', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.language).toBe('javascript');
      expect(result.includesAuth).toBe(true);
      expect(result.code).toContain('fetch');
      expect(result.code).toContain('GET');
      expect(result.code).toContain('X-API-Key');
      expect(result.code).toContain('https://api.repairshopr.com');
      expect(result.endpoint.resource).toBe('Customer');
      expect(result.endpoint.operation).toBe('Get Customer by ID');
    });

    test('should generate JavaScript code for POST endpoint with body', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers',
        method: 'POST',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.language).toBe('javascript');
      expect(result.code).toContain('POST');
      expect(result.code).toContain('requestBody');
      expect(result.code).toContain('JSON.stringify');
      expect(result.code).toContain('name');
      expect(result.code).toContain('email');
      expect(result.exampleRequest).toBeDefined();
      expect(result.exampleRequest?.name).toBe('example_value');
    });

    test('should generate JavaScript code with query parameters', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.code).toContain('queryParams');
      expect(result.code).toContain('page');
      expect(result.code).toContain('limit');
      expect(result.code).toContain('URLSearchParams');
    });

    test('should generate JavaScript code without authentication', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'javascript',
        includeAuth: false
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.includesAuth).toBe(false);
      expect(result.code).not.toContain('X-API-Key');
    });

    test('should include JavaScript error handling', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.errorHandling).toBeDefined();
      expect(result.errorHandling).toContain('try');
      expect(result.errorHandling).toContain('catch');
      expect(result.errorHandling).toContain('400');
      expect(result.errorHandling).toContain('401');
      expect(result.errorHandling).toContain('403');
      expect(result.errorHandling).toContain('404');
      expect(result.errorHandling).toContain('422');
      expect(result.errorHandling).toContain('500');
    });
  });

  describe('generateCodeExample - Python code generation', () => {
    test('should generate Python code for GET endpoint', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'python',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.language).toBe('python');
      expect(result.includesAuth).toBe(true);
      expect(result.code).toContain('import requests');
      expect(result.code).toContain('requests.get');
      expect(result.code).toContain('X-API-Key');
      expect(result.code).toContain('https://api.repairshopr.com');
      expect(result.endpoint.resource).toBe('Customer');
    });

    test('should generate Python code for POST endpoint with body', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers',
        method: 'POST',
        language: 'python',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.language).toBe('python');
      expect(result.code).toContain('requests.post');
      expect(result.code).toContain('request_body');
      expect(result.code).toContain('json=request_body');
      expect(result.code).toContain('name');
      expect(result.code).toContain('email');
      expect(result.exampleRequest).toBeDefined();
    });

    test('should generate Python code with query parameters', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers',
        method: 'GET',
        language: 'python',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.code).toContain('query_params');
      expect(result.code).toContain('params=query_params');
      expect(result.code).toContain('page');
      expect(result.code).toContain('limit');
    });

    test('should generate Python code without authentication', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'python',
        includeAuth: false
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.includesAuth).toBe(false);
      expect(result.code).not.toContain('X-API-Key');
    });

    test('should include Python error handling', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'python',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.errorHandling).toBeDefined();
      expect(result.errorHandling).toContain('try');
      expect(result.errorHandling).toContain('except');
      expect(result.errorHandling).toContain('HTTPError');
      expect(result.errorHandling).toContain('400');
      expect(result.errorHandling).toContain('401');
      expect(result.errorHandling).toContain('403');
      expect(result.errorHandling).toContain('404');
      expect(result.errorHandling).toContain('422');
      expect(result.errorHandling).toContain('500');
    });
  });

  describe('generateCodeExample - cURL code generation', () => {
    test('should generate cURL code for GET endpoint', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'curl',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.language).toBe('curl');
      expect(result.includesAuth).toBe(true);
      expect(result.code).toContain('curl');
      expect(result.code).toContain('-X GET');
      expect(result.code).toContain('X-API-Key');
      expect(result.code).toContain('https://api.repairshopr.com');
      expect(result.endpoint.resource).toBe('Customer');
    });

    test('should generate cURL code for POST endpoint with body', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers',
        method: 'POST',
        language: 'curl',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.language).toBe('curl');
      expect(result.code).toContain('-X POST');
      expect(result.code).toContain('-d');
      expect(result.code).toContain('name');
      expect(result.code).toContain('email');
      expect(result.exampleRequest).toBeDefined();
    });

    test('should generate cURL code with query parameters', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers',
        method: 'GET',
        language: 'curl',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.code).toContain('?');
      expect(result.code).toContain('page=');
      expect(result.code).toContain('limit=');
    });

    test('should generate cURL code without authentication', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'curl',
        includeAuth: false
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.includesAuth).toBe(false);
      expect(result.code).not.toContain('X-API-Key');
    });

    test('should include cURL error handling', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'curl',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.errorHandling).toBeDefined();
      expect(result.errorHandling).toContain('case');
      expect(result.errorHandling).toContain('200');
      expect(result.errorHandling).toContain('400');
      expect(result.errorHandling).toContain('401');
      expect(result.errorHandling).toContain('403');
      expect(result.errorHandling).toContain('404');
      expect(result.errorHandling).toContain('422');
      expect(result.errorHandling).toContain('500');
    });
  });

  describe('generateCodeExample - Authentication examples', () => {
    test('should include API key authentication in JavaScript', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.code).toContain("'X-API-Key': 'YOUR_API_KEY'");
    });

    test('should include API key authentication in Python', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'python',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.code).toContain("'X-API-Key': 'YOUR_API_KEY'");
    });

    test('should include API key authentication in cURL', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'curl',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.code).toContain('-H "X-API-Key: YOUR_API_KEY"');
    });
  });

  describe('generateCodeExample - Request/Response examples', () => {
    test('should include example request for POST endpoints', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers',
        method: 'POST',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.exampleRequest).toBeDefined();
      expect(result.exampleRequest).toHaveProperty('name');
      expect(result.exampleRequest).toHaveProperty('email');
    });

    test('should include example response from endpoint', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.exampleResponse).toBeDefined();
      expect(result.exampleResponse).toHaveProperty('customer');
    });

    test('should handle endpoints with example responses', () => {
      const params: CodeExampleParams = {
        endpointPath: '/tickets/{id}',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.exampleResponse).toBeDefined();
      // Should have the example from the endpoint
      expect(result.exampleResponse).toHaveProperty('ticket');
    });

    test('should not include example request for GET endpoints', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.exampleRequest).toBeUndefined();
    });
  });

  describe('generateCodeExample - Error handling examples', () => {
    test('should include comprehensive error handling for JavaScript', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.errorHandling).toContain('Bad Request');
      expect(result.errorHandling).toContain('Unauthorized');
      expect(result.errorHandling).toContain('Forbidden');
      expect(result.errorHandling).toContain('Not Found');
      expect(result.errorHandling).toContain('Unprocessable Entity');
      expect(result.errorHandling).toContain('Server Error');
    });

    test('should include comprehensive error handling for Python', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'python',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.errorHandling).toContain('Bad Request');
      expect(result.errorHandling).toContain('Unauthorized');
      expect(result.errorHandling).toContain('Forbidden');
      expect(result.errorHandling).toContain('Not Found');
      expect(result.errorHandling).toContain('Unprocessable Entity');
      expect(result.errorHandling).toContain('Server Error');
    });

    test('should include comprehensive error handling for cURL', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'curl',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.errorHandling).toContain('Bad Request');
      expect(result.errorHandling).toContain('Unauthorized');
      expect(result.errorHandling).toContain('Forbidden');
      expect(result.errorHandling).toContain('Not Found');
      expect(result.errorHandling).toContain('Unprocessable Entity');
      expect(result.errorHandling).toContain('Server Error');
    });
  });

  describe('generateCodeExample - Example templates', () => {
    test('should use consistent template structure for JavaScript', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.code).toContain('// Get Customer by ID');
      expect(result.code).toContain('// Retrieve a specific customer by ID');
      expect(result.code).toContain('const headers');
      expect(result.code).toContain('const options');
      expect(result.code).toContain('try {');
      expect(result.code).toContain('} catch (error)');
    });

    test('should use consistent template structure for Python', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'python',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.code).toContain('# Get Customer by ID');
      expect(result.code).toContain('# Retrieve a specific customer by ID');
      expect(result.code).toContain('import requests');
      expect(result.code).toContain('headers =');
      expect(result.code).toContain('if response.status_code == 200:');
    });

    test('should use consistent template structure for cURL', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'curl',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.code).toContain('# Get Customer by ID');
      expect(result.code).toContain('# Retrieve a specific customer by ID');
      expect(result.code).toContain('curl -X');
      expect(result.code).toContain('-H "Content-Type: application/json"');
    });
  });

  describe('generateCodeExample - Error handling', () => {
    test('should throw error for unsupported language', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'ruby' as CodeLanguage,
        includeAuth: true
      };

      expect(() => {
        generateCodeExample(params, metadataIndex);
      }).toThrow('Unsupported language: ruby');
    });

    test('should throw error for non-existent endpoint', () => {
      const params: CodeExampleParams = {
        endpointPath: '/nonexistent',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      expect(() => {
        generateCodeExample(params, metadataIndex);
      }).toThrow('Endpoint not found: GET /nonexistent');
    });

    test('should handle case-insensitive method', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'get',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.endpoint.method).toBe('GET');
    });
  });

  describe('generateCodeExamplesForAllLanguages - Multi-language generation', () => {
    test('should generate examples for all supported languages', () => {
      const params = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        includeAuth: true
      };

      const results = generateCodeExamplesForAllLanguages(params, metadataIndex);

      expect(results).toHaveLength(3);
      expect(results[0].language).toBe('javascript');
      expect(results[1].language).toBe('python');
      expect(results[2].language).toBe('curl');
    });

    test('should include consistent endpoint information across languages', () => {
      const params = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        includeAuth: true
      };

      const results = generateCodeExamplesForAllLanguages(params, metadataIndex);

      results.forEach(result => {
        expect(result.endpoint.resource).toBe('Customer');
        expect(result.endpoint.operation).toBe('Get Customer by ID');
        expect(result.endpoint.method).toBe('GET');
        expect(result.endpoint.path).toBe('/customers/{id}');
        expect(result.includesAuth).toBe(true);
      });
    });

    test('should include error handling for all languages', () => {
      const params = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        includeAuth: true
      };

      const results = generateCodeExamplesForAllLanguages(params, metadataIndex);

      results.forEach(result => {
        expect(result.errorHandling).toBeDefined();
        expect(result.errorHandling.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generateCodeExample - Different parameter types', () => {
    test('should handle integer parameters', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.code).toContain('123');
    });

    test('should handle integer parameters', () => {
      const params: CodeExampleParams = {
        endpointPath: '/customers/{id}',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, metadataIndex);

      expect(result.code).toContain('const id = 123');
    });

    test('should handle boolean parameters', () => {
      // Create a test endpoint with boolean parameter
      const testDocuments: ApiDocument[] = [
        {
          resourceName: 'Test',
          endpoints: [
            {
              resource: 'Test',
              operation: 'Test',
              description: 'Test',
              method: 'GET',
              path: '/test',
              permission: 'test.view',
              parameters: [
                {
                  name: 'active',
                  type: 'boolean',
                  required: false,
                  description: 'Active status',
                  paramType: 'query'
                }
              ],
              responses: []
            }
          ]
        }
      ];

      const testIndex = buildMetadataIndex(testDocuments);
      const params: CodeExampleParams = {
        endpointPath: '/test',
        method: 'GET',
        language: 'javascript',
        includeAuth: true
      };

      const result = generateCodeExample(params, testIndex);

      expect(result.code).toContain('true');
    });
  });
});
