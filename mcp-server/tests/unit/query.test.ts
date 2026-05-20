/**
 * Unit tests for query understanding module
 */

import {
  QueryUnderstanding,
  QueryAnalysis,
  QueryEntities,
  DisambiguationResult,
  QueryType,
  QueryIntent,
} from '../../src/retrieval/query';
import { MetadataIndex, buildMetadataIndex } from '../../src/parser/metadata';
import { ApiDocument, ApiEndpoint } from '../../src/utils/types';

describe('QueryUnderstanding', () => {
  let queryUnderstanding: QueryUnderstanding;
  let mockMetadataIndex: MetadataIndex;

  beforeEach(() => {
    // Create mock metadata index
    const mockDocuments: ApiDocument[] = [
      {
        resourceName: 'Customer',
        endpoints: [
          {
            resource: 'Customer',
            operation: 'Get Customers',
            description: 'Retrieve a list of customers',
            method: 'GET',
            path: '/customers',
            permission: 'view_customer',
            parameters: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'Customer ID',
                paramType: 'query',
              },
              {
                name: 'name',
                type: 'string',
                required: false,
                description: 'Customer name',
                paramType: 'query',
              },
              {
                name: 'email',
                type: 'string',
                required: false,
                description: 'Customer email',
                paramType: 'query',
              },
            ],
            responses: [],
          },
          {
            resource: 'Customer',
            operation: 'Create Customer',
            description: 'Create a new customer',
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
                description: 'Customer email',
                paramType: 'body',
              },
            ],
            responses: [],
          },
        ],
      },
      {
        resourceName: 'Ticket',
        endpoints: [
          {
            resource: 'Ticket',
            operation: 'Get Tickets',
            description: 'Retrieve a list of tickets',
            method: 'GET',
            path: '/tickets',
            permission: 'view_ticket',
            parameters: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'Ticket ID',
                paramType: 'query',
              },
              {
                name: 'status',
                type: 'string',
                required: false,
                description: 'Ticket status',
                paramType: 'query',
              },
            ],
            responses: [],
          },
          {
            resource: 'Ticket',
            operation: 'Update Ticket',
            description: 'Update an existing ticket',
            method: 'PUT',
            path: '/tickets/{id}',
            permission: 'edit_ticket',
            parameters: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'Ticket ID',
                paramType: 'path',
              },
            ],
            requestBody: [
              {
                name: 'status',
                type: 'string',
                required: false,
                description: 'Ticket status',
                paramType: 'body',
              },
            ],
            responses: [],
          },
        ],
      },
      {
        resourceName: 'Invoice',
        endpoints: [
          {
            resource: 'Invoice',
            operation: 'Get Invoices',
            description: 'Retrieve a list of invoices',
            method: 'GET',
            path: '/invoices',
            permission: 'view_invoice',
            parameters: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'Invoice ID',
                paramType: 'query',
              },
            ],
            responses: [],
          },
        ],
      },
    ];

    mockMetadataIndex = buildMetadataIndex(mockDocuments);
    queryUnderstanding = new QueryUnderstanding(mockMetadataIndex);
  });

  describe('analyzeQuery', () => {
    it('should analyze a simple resource query', () => {
      const analysis = queryUnderstanding.analyzeQuery('get customers');

      expect(analysis.originalQuery).toBe('get customers');
      expect(analysis.entities.resources).toContain('Customer');
      expect(analysis.entities.methods).toContain('get');
      expect(analysis.confidence).toBeGreaterThan(0.5);
    });

    it('should analyze a query with multiple entities', () => {
      const analysis = queryUnderstanding.analyzeQuery(
        'GET customer by id and email'
      );

      expect(analysis.entities.resources).toContain('Customer');
      expect(analysis.entities.httpMethods).toContain('GET');
      expect(analysis.entities.parameters).toContain('id');
      expect(analysis.entities.parameters).toContain('email');
    });

    it('should detect search intent', () => {
      const analysis = queryUnderstanding.analyzeQuery('search for tickets');

      expect(analysis.intent).toBe('search');
      expect(analysis.entities.resources).toContain('Ticket');
    });

    it('should detect lookup intent', () => {
      const analysis = queryUnderstanding.analyzeQuery('lookup customer by id');

      expect(analysis.intent).toBe('lookup');
      expect(analysis.entities.resources).toContain('Customer');
    });

    it('should detect list intent', () => {
      const analysis = queryUnderstanding.analyzeQuery('list all invoices');

      expect(analysis.intent).toBe('list');
      expect(analysis.entities.resources).toContain('Invoice');
    });

    it('should detect compare intent', () => {
      const analysis = queryUnderstanding.analyzeQuery(
        'compare customer and ticket'
      );

      expect(analysis.intent).toBe('compare');
    });

    it('should detect validate intent', () => {
      const analysis = queryUnderstanding.analyzeQuery(
        'validate customer email'
      );

      expect(analysis.intent).toBe('validate');
    });

    it('should generate suggestions for incomplete queries', () => {
      const analysis = queryUnderstanding.analyzeQuery('search');

      expect(analysis.suggestions.length).toBeGreaterThan(0);
      expect(analysis.suggestions.some((s) => s.includes('resource'))).toBe(
        true
      );
    });

    it('should classify as resource_query when resource is present', () => {
      const analysis = queryUnderstanding.analyzeQuery('get customers');

      expect(analysis.queryType).toBe('resource_query');
    });

    it('should classify as endpoint_query when HTTP method is present', () => {
      const analysis = queryUnderstanding.analyzeQuery(
        'GET /customers endpoint'
      );

      expect(analysis.queryType).toBe('endpoint_query');
    });

    it('should classify as parameter_query when parameter is mentioned', () => {
      const analysis = queryUnderstanding.analyzeQuery('customer id parameter');

      expect(analysis.queryType).toBe('parameter_query');
    });

    it('should classify as permission_query when permission is mentioned', () => {
      const analysis = queryUnderstanding.analyzeQuery(
        'view_customer permission'
      );

      expect(analysis.queryType).toBe('permission_query');
    });

    it('should classify as general_query when no specific entities', () => {
      const analysis = queryUnderstanding.analyzeQuery('how to use the api');

      expect(analysis.queryType).toBe('general_query');
    });
  });

  describe('extractEntities', () => {
    it('should extract resource entities', () => {
      const entities = queryUnderstanding.extractEntities('get customers');

      expect(entities.resources).toContain('Customer');
    });

    it('should extract multiple resources', () => {
      const entities = queryUnderstanding.extractEntities(
        'customers and tickets'
      );

      expect(entities.resources).toContain('Customer');
      expect(entities.resources).toContain('Ticket');
    });

    it('should extract method entities', () => {
      const entities = queryUnderstanding.extractEntities('create customer');

      expect(entities.methods).toContain('create');
    });

    it('should extract parameter entities', () => {
      const entities = queryUnderstanding.extractEntities(
        'customer with id and email'
      );

      expect(entities.parameters).toContain('id');
      expect(entities.parameters).toContain('email');
    });

    it('should extract HTTP method entities', () => {
      const entities = queryUnderstanding.extractEntities('GET customers');

      expect(entities.httpMethods).toContain('GET');
    });

    it('should extract permission entities', () => {
      const entities = queryUnderstanding.extractEntities(
        'view_customer permission'
      );

      expect(entities.permissions).toContain('view_customer');
    });

    it('should handle case insensitivity', () => {
      const entities1 = queryUnderstanding.extractEntities('GET customers');
      const entities2 = queryUnderstanding.extractEntities('get customers');

      expect(entities1.httpMethods).toContain('GET');
      expect(entities2.httpMethods).toContain('GET');
    });

    it('should extract entities from complex query', () => {
      const entities = queryUnderstanding.extractEntities(
        'POST create customer with name and email'
      );

      expect(entities.resources).toContain('Customer');
      expect(entities.methods).toContain('create');
      expect(entities.httpMethods).toContain('POST');
      expect(entities.parameters).toContain('name');
      expect(entities.parameters).toContain('email');
    });

    it('should return empty entities for query with no matches', () => {
      const entities = queryUnderstanding.extractEntities(
        'random words with no meaning'
      );

      expect(entities.resources).toHaveLength(0);
      expect(entities.methods).toHaveLength(0);
      expect(entities.parameters).toHaveLength(0);
    });
  });

  describe('expandQuery', () => {
    it('should return original query in expanded results', () => {
      const entities: QueryEntities = {
        resources: ['Customer'],
        methods: ['get'],
        parameters: [],
        permissions: [],
        httpMethods: [],
      };

      const expanded = queryUnderstanding.expandQuery('search', entities);

      expect(expanded).toContain('search');
    });

    it('should expand with resource variations', () => {
      const entities: QueryEntities = {
        resources: ['Customer'],
        methods: [],
        parameters: [],
        permissions: [],
        httpMethods: [],
      };

      const expanded = queryUnderstanding.expandQuery('search', entities);

      expect(expanded.some((q) => q.includes('Customer'))).toBe(true);
    });

    it('should expand with method variations', () => {
      const entities: QueryEntities = {
        resources: [],
        methods: ['get'],
        parameters: [],
        permissions: [],
        httpMethods: [],
      };

      const expanded = queryUnderstanding.expandQuery('customers', entities);

      expect(expanded.some((q) => q.includes('get'))).toBe(true);
    });

    it('should expand with HTTP method variations', () => {
      const entities: QueryEntities = {
        resources: [],
        methods: [],
        parameters: [],
        permissions: [],
        httpMethods: ['GET'],
      };

      const expanded = queryUnderstanding.expandQuery('customers', entities);

      expect(expanded.some((q) => q.includes('GET'))).toBe(true);
    });

    it('should handle singular/plural variations', () => {
      const entities: QueryEntities = {
        resources: ['Customer'],
        methods: [],
        parameters: [],
        permissions: [],
        httpMethods: [],
      };

      const expanded = queryUnderstanding.expandQuery('customer', entities);

      expect(expanded.some((q) => q.includes('customers'))).toBe(true);
    });

    it('should remove duplicate queries', () => {
      const entities: QueryEntities = {
        resources: ['Customer'],
        methods: ['get'],
        parameters: [],
        permissions: [],
        httpMethods: [],
      };

      const expanded = queryUnderstanding.expandQuery(
        'get customers',
        entities
      );

      const uniqueExpanded = Array.from(new Set(expanded));
      expect(expanded).toEqual(uniqueExpanded);
    });
  });

  describe('handleSynonyms', () => {
    it('should return original query in synonym results', () => {
      const synonyms = queryUnderstanding.handleSynonyms('get customers');

      expect(synonyms).toContain('get customers');
    });

    it('should generate synonyms for "get"', () => {
      const synonyms = queryUnderstanding.handleSynonyms('get customers');

      expect(synonyms.some((s) => s.includes('retrieve'))).toBe(true);
      expect(synonyms.some((s) => s.includes('fetch'))).toBe(true);
    });

    it('should generate synonyms for "create"', () => {
      const synonyms = queryUnderstanding.handleSynonyms('create customer');

      expect(synonyms.some((s) => s.includes('add'))).toBe(true);
      expect(synonyms.some((s) => s.includes('new'))).toBe(true);
    });

    it('should generate synonyms for "update"', () => {
      const synonyms = queryUnderstanding.handleSynonyms('update ticket');

      expect(synonyms.some((s) => s.includes('edit'))).toBe(true);
      expect(synonyms.some((s) => s.includes('modify'))).toBe(true);
    });

    it('should generate synonyms for "delete"', () => {
      const synonyms = queryUnderstanding.handleSynonyms('delete invoice');

      expect(synonyms.some((s) => s.includes('remove'))).toBe(true);
    });

    it('should generate synonyms for "customer"', () => {
      const synonyms = queryUnderstanding.handleSynonyms('get customer');

      expect(synonyms.some((s) => s.includes('client'))).toBe(true);
    });

    it('should handle multiple synonym replacements', () => {
      const synonyms = queryUnderstanding.handleSynonyms('get customer');

      expect(synonyms.length).toBeGreaterThan(1);
    });

    it('should remove duplicate synonym queries', () => {
      const synonyms = queryUnderstanding.handleSynonyms('get customers');

      const uniqueSynonyms = Array.from(new Set(synonyms));
      expect(synonyms).toEqual(uniqueSynonyms);
    });

    it('should return only original query if no synonyms found', () => {
      const synonyms = queryUnderstanding.handleSynonyms('random words');

      expect(synonyms).toHaveLength(1);
      expect(synonyms[0]).toBe('random words');
    });
  });

  describe('disambiguateQuery', () => {
    it('should not need disambiguation for single resource', () => {
      const entities: QueryEntities = {
        resources: ['Customer'],
        methods: [],
        parameters: [],
        permissions: [],
        httpMethods: [],
      };

      const result = queryUnderstanding.disambiguateQuery(
        'get customers',
        entities
      );

      expect(result.needsDisambiguation).toBe(false);
      expect(result.ambiguousTerms).toHaveLength(0);
    });

    it('should detect ambiguous resources', () => {
      const entities: QueryEntities = {
        resources: ['Customer', 'Ticket'],
        methods: [],
        parameters: [],
        permissions: [],
        httpMethods: [],
      };

      const result = queryUnderstanding.disambiguateQuery(
        'customers and tickets',
        entities
      );

      expect(result.needsDisambiguation).toBe(true);
      expect(result.ambiguousTerms).toContain('Customer');
      expect(result.ambiguousTerms).toContain('Ticket');
    });

    it('should generate interpretations for ambiguous resources', () => {
      const entities: QueryEntities = {
        resources: ['Customer', 'Ticket'],
        methods: [],
        parameters: [],
        permissions: [],
        httpMethods: [],
      };

      const result = queryUnderstanding.disambiguateQuery(
        'customers and tickets',
        entities
      );

      expect(result.interpretations.length).toBeGreaterThan(0);
      expect(
        result.interpretations.some((i) =>
          i.interpretation.includes('Customer')
        )
      ).toBe(true);
      expect(
        result.interpretations.some((i) => i.interpretation.includes('Ticket'))
      ).toBe(true);
    });

    it('should detect ambiguous methods', () => {
      const entities: QueryEntities = {
        resources: [],
        methods: ['get', 'create'],
        parameters: [],
        permissions: [],
        httpMethods: [],
      };

      const result = queryUnderstanding.disambiguateQuery(
        'get and create',
        entities
      );

      expect(result.needsDisambiguation).toBe(true);
      expect(result.ambiguousTerms).toContain('get');
      expect(result.ambiguousTerms).toContain('create');
    });

    it('should recommend interpretation with highest confidence', () => {
      const entities: QueryEntities = {
        resources: ['Customer', 'Ticket'],
        methods: [],
        parameters: [],
        permissions: [],
        httpMethods: [],
      };

      const result = queryUnderstanding.disambiguateQuery(
        'customers and tickets',
        entities
      );

      expect(result.recommendedInterpretation).toBeDefined();
      expect(result.recommendedInterpretation?.confidence).toBeGreaterThan(0);
    });

    it('should detect ambiguous HTTP methods', () => {
      const entities: QueryEntities = {
        resources: [],
        methods: [],
        parameters: [],
        permissions: [],
        httpMethods: ['GET', 'POST'],
      };

      const result = queryUnderstanding.disambiguateQuery(
        'GET and POST',
        entities
      );

      expect(result.needsDisambiguation).toBe(true);
      expect(result.ambiguousTerms).toContain('GET');
      expect(result.ambiguousTerms).toContain('POST');
    });
  });

  describe('classifyQuery', () => {
    it('should classify as resource_query for resource queries', () => {
      const entities: QueryEntities = {
        resources: ['Customer'],
        methods: [],
        parameters: [],
        permissions: [],
        httpMethods: [],
      };

      const queryType = queryUnderstanding.classifyQuery(
        'get customers',
        entities
      );

      expect(queryType).toBe('resource_query');
    });

    it('should classify as endpoint_query for endpoint queries', () => {
      const entities: QueryEntities = {
        resources: [],
        methods: [],
        parameters: [],
        permissions: [],
        httpMethods: ['GET'],
      };

      const queryType = queryUnderstanding.classifyQuery(
        'GET endpoint',
        entities
      );

      expect(queryType).toBe('endpoint_query');
    });

    it('should classify as parameter_query for parameter queries', () => {
      const entities: QueryEntities = {
        resources: [],
        methods: [],
        parameters: ['id'],
        permissions: [],
        httpMethods: [],
      };

      const queryType = queryUnderstanding.classifyQuery(
        'id parameter',
        entities
      );

      expect(queryType).toBe('parameter_query');
    });

    it('should classify as permission_query for permission queries', () => {
      const entities: QueryEntities = {
        resources: [],
        methods: [],
        parameters: [],
        permissions: ['view_customer'],
        httpMethods: [],
      };

      const queryType = queryUnderstanding.classifyQuery(
        'view_customer permission',
        entities
      );

      expect(queryType).toBe('permission_query');
    });

    it('should classify as general_query for general queries', () => {
      const entities: QueryEntities = {
        resources: [],
        methods: [],
        parameters: [],
        permissions: [],
        httpMethods: [],
      };

      const queryType = queryUnderstanding.classifyQuery(
        'how to use api',
        entities
      );

      expect(queryType).toBe('general_query');
    });

    it('should prioritize permission_query over other types', () => {
      const entities: QueryEntities = {
        resources: ['Customer'],
        methods: [],
        parameters: ['id'],
        permissions: ['view_customer'],
        httpMethods: [],
      };

      const queryType = queryUnderstanding.classifyQuery(
        'view_customer permission for customer',
        entities
      );

      expect(queryType).toBe('permission_query');
    });

    it('should prioritize parameter_query over resource_query', () => {
      const entities: QueryEntities = {
        resources: ['Customer'],
        methods: [],
        parameters: ['id'],
        permissions: [],
        httpMethods: [],
      };

      const queryType = queryUnderstanding.classifyQuery(
        'customer id parameter',
        entities
      );

      expect(queryType).toBe('parameter_query');
    });

    it('should prioritize endpoint_query over resource_query', () => {
      const entities: QueryEntities = {
        resources: ['Customer'],
        methods: [],
        parameters: [],
        permissions: [],
        httpMethods: ['GET'],
      };

      const queryType = queryUnderstanding.classifyQuery(
        'GET customer endpoint',
        entities
      );

      expect(queryType).toBe('endpoint_query');
    });
  });

  describe('setMetadataIndex', () => {
    it('should update known resources when metadata index is set', () => {
      const newQueryUnderstanding = new QueryUnderstanding();
      expect(newQueryUnderstanding.getKnownResources()).toHaveLength(0);

      newQueryUnderstanding.setMetadataIndex(mockMetadataIndex);
      expect(newQueryUnderstanding.getKnownResources().length).toBeGreaterThan(
        0
      );
    });

    it('should update known parameters when metadata index is set', () => {
      const newQueryUnderstanding = new QueryUnderstanding();
      expect(newQueryUnderstanding.getKnownParameters()).toHaveLength(0);

      newQueryUnderstanding.setMetadataIndex(mockMetadataIndex);
      expect(newQueryUnderstanding.getKnownParameters().length).toBeGreaterThan(
        0
      );
    });

    it('should update known permissions when metadata index is set', () => {
      const newQueryUnderstanding = new QueryUnderstanding();
      expect(newQueryUnderstanding.getKnownPermissions()).toHaveLength(0);

      newQueryUnderstanding.setMetadataIndex(mockMetadataIndex);
      expect(
        newQueryUnderstanding.getKnownPermissions().length
      ).toBeGreaterThan(0);
    });
  });

  describe('getKnownEntities', () => {
    it('should return all known resources', () => {
      const resources = queryUnderstanding.getKnownResources();

      expect(resources).toContain('Customer');
      expect(resources).toContain('Ticket');
      expect(resources).toContain('Invoice');
    });

    it('should return all known parameters', () => {
      const parameters = queryUnderstanding.getKnownParameters();

      expect(parameters).toContain('id');
      expect(parameters).toContain('name');
      expect(parameters).toContain('email');
      expect(parameters).toContain('status');
    });

    it('should return all known permissions', () => {
      const permissions = queryUnderstanding.getKnownPermissions();

      expect(permissions).toContain('view_customer');
      expect(permissions).toContain('create_customer');
      expect(permissions).toContain('view_ticket');
      expect(permissions).toContain('edit_ticket');
      expect(permissions).toContain('view_invoice');
    });
  });

  describe('integration tests', () => {
    it('should handle complex multi-step query analysis', () => {
      const query = 'GET customer by id and email';
      const analysis = queryUnderstanding.analyzeQuery(query);

      expect(analysis.entities.resources).toContain('Customer');
      expect(analysis.entities.httpMethods).toContain('GET');
      expect(analysis.entities.parameters).toContain('id');
      expect(analysis.entities.parameters).toContain('email');
      expect(analysis.intent).toBe('lookup');
      expect(analysis.queryType).toBe('endpoint_query');
    });

    it('should provide complete workflow for ambiguous query', () => {
      const query = 'customers and tickets';
      const analysis = queryUnderstanding.analyzeQuery(query);
      const disambiguation = queryUnderstanding.disambiguateQuery(
        query,
        analysis.entities
      );

      expect(disambiguation.needsDisambiguation).toBe(true);
      expect(disambiguation.interpretations.length).toBeGreaterThan(0);
      expect(disambiguation.recommendedInterpretation).toBeDefined();
    });

    it('should expand and handle synonyms for better search', () => {
      const query = 'get customers';
      const analysis = queryUnderstanding.analyzeQuery(query);
      const expanded = queryUnderstanding.expandQuery(query, analysis.entities);
      const synonyms = queryUnderstanding.handleSynonyms(query);

      expect(expanded.length).toBeGreaterThan(0);
      expect(synonyms.length).toBeGreaterThan(0);
      expect(expanded[0]).toBe(query);
      expect(synonyms[0]).toBe(query);
    });
  });
});
