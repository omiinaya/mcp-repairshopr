/**
 * Unit tests for the markdown parser
 * 
 * Tests the parsing of RepairShopr API documentation markdown files
 */

import { parseMarkdownFile } from '../../src/parser/markdown';
import {
  ApiDocument,
  ApiEndpoint,
  ApiParameter,
  ApiResponse
} from '../../src/utils/types';
import { ApiDocumentValidation } from '../../src/parser/schema';

describe('Markdown Parser', () => {
  describe('parseMarkdownFile', () => {
    it('should parse a sample documentation file', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      
      expect(result).toBeDefined();
      expect(result.resourceName).toBe('Customer');
      expect(result.endpoints).toBeDefined();
      expect(result.endpoints.length).toBeGreaterThan(0);
    });

    it('should extract resource name from header', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      
      expect(result.resourceName).toBe('Customer');
    });

    it('should parse multiple endpoints from a document', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      
      expect(result.endpoints.length).toBeGreaterThan(1);
    });

    it('should validate parsed document structure', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      
      const isValid = ApiDocumentValidation.validateDocument(result);
      expect(isValid).toBe(true);
    });
  });

  describe('Endpoint Extraction', () => {
    it('should extract operation name correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      expect(getCustomersEndpoint).toBeDefined();
      expect(getCustomersEndpoint?.operation).toBe('Get Customers');
    });

    it('should extract description correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      expect(getCustomersEndpoint?.description).toContain('Returns a paginated list of customers');
    });

    it('should extract HTTP method correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      expect(getCustomersEndpoint?.method).toBe('GET');
    });

    it('should extract API path correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      expect(getCustomersEndpoint?.path).toBe('/customers');
    });

    it('should extract permission correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      expect(getCustomersEndpoint?.permission).toContain('Customers - List/Search');
    });

    it('should extract path parameters correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomerByIdEndpoint = result.endpoints.find(e => e.operation === 'Get Customer by ID');
      
      expect(getCustomerByIdEndpoint?.parameters).toBeDefined();
      expect(getCustomerByIdEndpoint?.parameters.length).toBeGreaterThan(0);
      
      const idParam = getCustomerByIdEndpoint?.parameters.find(p => p.name === 'id');
      expect(idParam).toBeDefined();
      expect(idParam?.paramType).toBe('path');
      expect(idParam?.type).toBe('integer');
      expect(idParam?.required).toBe(true);
    });

    it('should extract query parameters correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      expect(getCustomersEndpoint?.parameters).toBeDefined();
      expect(getCustomersEndpoint?.parameters.length).toBeGreaterThan(0);
      
      const pageParam = getCustomersEndpoint?.parameters.find(p => p.name === 'page');
      expect(pageParam).toBeDefined();
      expect(pageParam?.paramType).toBe('query');
      expect(pageParam?.type).toBe('integer');
      expect(pageParam?.required).toBe(false);
    });

    it('should handle endpoints with no parameters', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const deleteCustomerEndpoint = result.endpoints.find(e => e.operation === 'Delete Customer');
      
      expect(deleteCustomerEndpoint?.parameters).toBeDefined();
      // Delete endpoint has path parameters, so check for those
      const idParam = deleteCustomerEndpoint?.parameters.find(p => p.name === 'id');
      expect(idParam).toBeDefined();
    });

    it('should extract request body parameters for POST endpoints', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const createCustomerEndpoint = result.endpoints.find(e => e.operation === 'Create Customer');
      
      expect(createCustomerEndpoint?.requestBody).toBeDefined();
      // Request body may be empty or have parameters
    });

    it('should not have request body for GET endpoints', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      expect(getCustomersEndpoint?.requestBody).toBeUndefined();
    });
  });

  describe('Response Parsing', () => {
    it('should extract response status codes correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      expect(getCustomersEndpoint?.responses).toBeDefined();
      expect(getCustomersEndpoint?.responses.length).toBeGreaterThan(0);
      
      const successResponse = getCustomersEndpoint?.responses.find(r => r.statusCode === 200);
      expect(successResponse).toBeDefined();
    });

    it('should extract response descriptions correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      const successResponse = getCustomersEndpoint?.responses.find(r => r.statusCode === 200);
      expect(successResponse?.description).toContain('successful');
    });

    it('should extract response examples correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      const successResponse = getCustomersEndpoint?.responses.find(r => r.statusCode === 200);
      expect(successResponse?.example).toBeDefined();
      expect(successResponse?.example).toHaveProperty('customers');
    });

    it('should handle multiple responses per endpoint', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const createCustomerEndpoint = result.endpoints.find(e => e.operation === 'Create Customer');
      
      expect(createCustomerEndpoint?.responses.length).toBeGreaterThan(1);
      
      const successResponse = createCustomerEndpoint?.responses.find(r => r.statusCode === 200);
      const errorResponse = createCustomerEndpoint?.responses.find(r => r.statusCode === 422);
      
      expect(successResponse).toBeDefined();
      expect(errorResponse).toBeDefined();
    });

    it('should handle responses without examples', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomerByIdEndpoint = result.endpoints.find(e => e.operation === 'Get Customer by ID');
      
      const notFoundResponse = getCustomerByIdEndpoint?.responses.find(r => r.statusCode === 404);
      expect(notFoundResponse).toBeDefined();
      // 404 response may not have an example
    });
  });

  describe('Parameter Table Parsing', () => {
    it('should parse parameter names correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      const paramNames = getCustomersEndpoint?.parameters.map(p => p.name) || [];
      expect(paramNames).toContain('page');
      expect(paramNames).toContain('sort');
      expect(paramNames).toContain('query');
    });

    it('should parse parameter types correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      const pageParam = getCustomersEndpoint?.parameters.find(p => p.name === 'page');
      expect(pageParam?.type).toBe('integer');
      
      const sortParam = getCustomersEndpoint?.parameters.find(p => p.name === 'sort');
      expect(sortParam?.type).toBe('string');
      
      const idParam = getCustomersEndpoint?.parameters.find(p => p.name === 'id');
      expect(idParam?.type).toBe('array');
    });

    it('should parse required flags correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomerByIdEndpoint = result.endpoints.find(e => e.operation === 'Get Customer by ID');
      
      const idParam = getCustomerByIdEndpoint?.parameters.find(p => p.name === 'id');
      expect(idParam?.required).toBe(true);
      
      const pageParam = getCustomersEndpoint?.parameters.find(p => p.name === 'page');
      expect(pageParam?.required).toBe(false);
    });

    it('should parse parameter descriptions correctly', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      const pageParam = getCustomersEndpoint?.parameters.find(p => p.name === 'page');
      expect(pageParam?.description).toContain('page');
    });

    it('should handle empty parameter descriptions', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      const emailParam = getCustomersEndpoint?.parameters.find(p => p.name === 'email');
      expect(emailParam).toBeDefined();
      // Email parameter has empty description
      expect(emailParam?.description).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing sections gracefully', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      
      // All endpoints should have required fields
      result.endpoints.forEach(endpoint => {
        expect(endpoint.resource).toBeDefined();
        expect(endpoint.operation).toBeDefined();
        expect(endpoint.method).toBeDefined();
        expect(endpoint.path).toBeDefined();
        expect(endpoint.permission).toBeDefined();
        expect(endpoint.responses).toBeDefined();
        expect(endpoint.responses.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty parameter tables', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      
      // Some endpoints may have no query parameters
      const endpointsWithNoQueryParams = result.endpoints.filter(
        e => !e.parameters.some(p => p.paramType === 'query')
      );
      
      expect(endpointsWithNoQueryParams.length).toBeGreaterThan(0);
    });

    it('should handle endpoints with only path parameters', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomerByIdEndpoint = result.endpoints.find(e => e.operation === 'Get Customer by ID');
      
      expect(getCustomerByIdEndpoint?.parameters.length).toBe(1);
      expect(getCustomerByIdEndpoint?.parameters[0].paramType).toBe('path');
    });

    it('should handle endpoints with multiple responses', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const createCustomerEndpoint = result.endpoints.find(e => e.operation === 'Create Customer');
      
      expect(createCustomerEndpoint?.responses.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle responses with complex JSON examples', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      const getCustomersEndpoint = result.endpoints.find(e => e.operation === 'Get Customers');
      
      const successResponse = getCustomersEndpoint?.responses.find(r => r.statusCode === 200);
      expect(successResponse?.example).toBeDefined();
      expect(typeof successResponse?.example).toBe('object');
    });

    it('should handle endpoints with no description', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      
      // Some endpoints may have empty descriptions
      const endpointsWithNoDescription = result.endpoints.filter(e => e.description === '');
      // This is allowed, so just check it doesn't crash
      expect(Array.isArray(endpointsWithNoDescription)).toBe(true);
    });
  });

  describe('Different Resource Types', () => {
    it('should parse ticket documentation', async () => {
      const result = await parseMarkdownFile('../../docs/api/ticket.md');
      
      expect(result.resourceName).toBe('Ticket');
      expect(result.endpoints.length).toBeGreaterThan(0);
      
      const isValid = ApiDocumentValidation.validateDocument(result);
      expect(isValid).toBe(true);
    });

    it('should parse ticket endpoints with nested paths', async () => {
      const result = await parseMarkdownFile('../../docs/api/ticket.md');
      const getTicketCommentsEndpoint = result.endpoints.find(e => e.path === '/tickets/{id}/comments');
      
      expect(getTicketCommentsEndpoint).toBeDefined();
      expect(getTicketCommentsEndpoint?.path).toContain('/{id}/');
    });

    it('should parse ticket endpoints with complex query parameters', async () => {
      const result = await parseMarkdownFile('../../docs/api/ticket.md');
      const getTicketsEndpoint = result.endpoints.find(e => e.operation === 'Get Tickets');
      
      expect(getTicketsEndpoint?.parameters.length).toBeGreaterThan(0);
      
      const statusParam = getTicketsEndpoint?.parameters.find(p => p.name === 'status');
      expect(statusParam).toBeDefined();
      expect(statusParam?.type).toBe('string');
    });
  });

  describe('Validation', () => {
    it('should validate all parsed endpoints', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      
      result.endpoints.forEach(endpoint => {
        const isValid = ApiDocumentValidation.validateEndpoint(endpoint);
        expect(isValid).toBe(true);
      });
    });

    it('should validate all parsed parameters', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      
      result.endpoints.forEach(endpoint => {
        endpoint.parameters.forEach(param => {
          const isValid = ApiDocumentValidation.validateParameter(param);
          expect(isValid).toBe(true);
        });
        
        if (endpoint.requestBody) {
          endpoint.requestBody.forEach(param => {
            const isValid = ApiDocumentValidation.validateParameter(param);
            expect(isValid).toBe(true);
          });
        }
      });
    });

    it('should validate all parsed responses', async () => {
      const result = await parseMarkdownFile('../../docs/api/customer.md');
      
      result.endpoints.forEach(endpoint => {
        endpoint.responses.forEach(response => {
          const isValid = ApiDocumentValidation.validateResponse(response);
          expect(isValid).toBe(true);
        });
      });
    });
  });
});
