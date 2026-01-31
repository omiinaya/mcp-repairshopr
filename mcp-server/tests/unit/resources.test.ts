/**
 * Unit tests for resource overview tool
 */

import {
  listResources,
  getResource,
  getResourceNames,
  getResourcesByMethod,
  getResourcesByPermission,
  ResourceListParams
} from '../../src/tools/resources';
import { MetadataIndex, buildMetadataIndex } from '../../src/parser/metadata';
import { ApiDocument } from '../../src/utils/types';

describe('Resource Overview Tool', () => {
  let metadataIndex: MetadataIndex;

  beforeEach(() => {
    // Create sample API documents for testing
    const sampleDocuments: ApiDocument[] = [
      {
        resourceName: 'Customer',
        endpoints: [
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
                example: { customer: {} }
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
                description: 'Customer created successfully',
                example: { customer: {} }
              }
            ]
          },
          {
            resource: 'Customer',
            operation: 'Update Customer',
            description: 'Update an existing customer',
            method: 'PUT',
            path: '/customers/{id}',
            permission: 'customer.update',
            parameters: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'Customer ID',
                paramType: 'path'
              }
            ],
            requestBody: [
              {
                name: 'name',
                type: 'string',
                required: false,
                description: 'Customer name',
                paramType: 'body'
              }
            ],
            responses: [
              {
                statusCode: 200,
                description: 'Customer updated successfully',
                example: { customer: {} }
              }
            ]
          },
          {
            resource: 'Customer',
            operation: 'Delete Customer',
            description: 'Delete a customer',
            method: 'DELETE',
            path: '/customers/{id}',
            permission: 'customer.delete',
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
                statusCode: 204,
                description: 'Customer deleted successfully'
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
            description: 'Retrieve a list of tickets',
            method: 'GET',
            path: '/tickets',
            permission: 'ticket.view',
            parameters: [
              {
                name: 'customer_id',
                type: 'integer',
                required: false,
                description: 'Filter by customer ID',
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
            description: 'Create a new ticket',
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
                example: { ticket: {} }
              }
            ]
          },
          {
            resource: 'Ticket',
            operation: 'Manage Tickets',
            description: 'Full management access to tickets',
            method: 'POST',
            path: '/tickets/manage',
            permission: 'ticket.admin',
            parameters: [],
            responses: [
              {
                statusCode: 200,
                description: 'Tickets managed successfully'
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
            description: 'Retrieve a list of invoices',
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
          },
          {
            resource: 'Invoice',
            operation: 'Manage Invoices',
            description: 'Full management access to invoices',
            method: 'POST',
            path: '/invoices/manage',
            permission: 'invoice.manage',
            parameters: [],
            responses: [
              {
                statusCode: 200,
                description: 'Invoices managed successfully'
              }
            ]
          }
        ]
      }
    ];

    // Build metadata index from sample documents
    metadataIndex = buildMetadataIndex(sampleDocuments);
  });

  describe('listResources - Resource listing', () => {
    test('should list all resources', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      expect(result.resources).toBeDefined();
      expect(result.resources.length).toBe(3);
      expect(result.totalResources).toBe(3);
    });

    test('should include resource names', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const resourceNames = result.resources.map(r => r.summary.name);
      expect(resourceNames).toContain('Customer');
      expect(resourceNames).toContain('Ticket');
      expect(resourceNames).toContain('Invoice');
    });

    test('should sort resources alphabetically', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const resourceNames = result.resources.map(r => r.summary.name);
      const sortedNames = [...resourceNames].sort();
      expect(resourceNames).toEqual(sortedNames);
    });

    test('should handle empty metadata index', () => {
      const emptyIndex: MetadataIndex = {
        resources: new Map(),
        endpointsByPath: new Map(),
        endpointsByPermission: new Map(),
        endpointsByMethod: new Map(),
        allEndpoints: []
      };

      const params: ResourceListParams = {};
      const result = listResources(params, emptyIndex);

      expect(result.resources).toEqual([]);
      expect(result.totalResources).toBe(0);
    });
  });

  describe('listResources - Resource summary information', () => {
    test('should include resource summary for each resource', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      result.resources.forEach(resource => {
        expect(resource.summary).toBeDefined();
        expect(resource.summary.name).toBeDefined();
        expect(resource.summary.description).toBeDefined();
        expect(resource.summary.endpointCount).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(resource.summary.methods)).toBe(true);
        expect(Array.isArray(resource.summary.permissions)).toBe(true);
      });
    });

    test('should include correct endpoint count for Customer', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      expect(customer?.summary.endpointCount).toBe(5);
    });

    test('should include correct endpoint count for Ticket', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const ticket = result.resources.find(r => r.summary.name === 'Ticket');
      expect(ticket?.summary.endpointCount).toBe(3);
    });

    test('should include correct methods for Customer', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      expect(customer?.summary.methods).toContain('GET');
      expect(customer?.summary.methods).toContain('POST');
      expect(customer?.summary.methods).toContain('PUT');
      expect(customer?.summary.methods).toContain('DELETE');
    });

    test('should include correct permissions for Customer', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      expect(customer?.summary.permissions).toContain('customer.view');
      expect(customer?.summary.permissions).toContain('customer.create');
      expect(customer?.summary.permissions).toContain('customer.update');
      expect(customer?.summary.permissions).toContain('customer.delete');
    });

    test('should generate appropriate description for resource', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      expect(customer?.summary.description).toContain('Customer');
      expect(customer?.summary.description).toContain('read');
      expect(customer?.summary.description).toContain('create');
      expect(customer?.summary.description).toContain('update');
      expect(customer?.summary.description).toContain('delete');
    });
  });

  describe('listResources - Available endpoints per resource', () => {
    test('should not include endpoints by default', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      result.resources.forEach(resource => {
        expect(resource.endpoints).toBeUndefined();
      });
    });

    test('should include endpoints when requested', () => {
      const params: ResourceListParams = { includeEndpoints: true };
      const result = listResources(params, metadataIndex);

      result.resources.forEach(resource => {
        expect(resource.endpoints).toBeDefined();
        expect(Array.isArray(resource.endpoints)).toBe(true);
      });
    });

    test('should include correct number of endpoints for Customer', () => {
      const params: ResourceListParams = { includeEndpoints: true };
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      expect(customer?.endpoints?.length).toBe(5);
    });

    test('should include all required endpoint fields', () => {
      const params: ResourceListParams = { includeEndpoints: true };
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      customer?.endpoints?.forEach(endpoint => {
        expect(endpoint.operation).toBeDefined();
        expect(endpoint.description).toBeDefined();
        expect(endpoint.method).toBeDefined();
        expect(endpoint.path).toBeDefined();
        expect(endpoint.permission).toBeDefined();
        expect(endpoint.parameterCount).toBeGreaterThanOrEqual(0);
        expect(endpoint.responseCount).toBeGreaterThanOrEqual(0);
      });
    });

    test('should include correct parameter count for endpoints', () => {
      const params: ResourceListParams = { includeEndpoints: true };
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      const getCustomers = customer?.endpoints?.find(e => e.operation === 'Get Customers');
      expect(getCustomers?.parameterCount).toBe(1); // page parameter

      const createCustomer = customer?.endpoints?.find(e => e.operation === 'Create Customer');
      expect(createCustomer?.parameterCount).toBe(1); // name in requestBody
    });

    test('should include correct response count for endpoints', () => {
      const params: ResourceListParams = { includeEndpoints: true };
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      customer?.endpoints?.forEach(endpoint => {
        expect(endpoint.responseCount).toBe(1);
      });
    });
  });

  describe('listResources - Resource relationship information', () => {
    test('should not include relationships by default', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      result.resources.forEach(resource => {
        expect(resource.relationships).toBeUndefined();
      });
    });

    test('should include relationships when requested', () => {
      const params: ResourceListParams = { includeRelationships: true };
      const result = listResources(params, metadataIndex);

      result.resources.forEach(resource => {
        expect(resource.relationships).toBeDefined();
        expect(Array.isArray(resource.relationships)).toBe(true);
      });
    });

    test('should include relationship type', () => {
      const params: ResourceListParams = { includeRelationships: true };
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      customer?.relationships?.forEach(relationship => {
        expect(relationship.relationshipType).toBeDefined();
        expect(['parent', 'child', 'sibling', 'reference']).toContain(relationship.relationshipType);
      });
    });

    test('should include related resource name', () => {
      const params: ResourceListParams = { includeRelationships: true };
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      customer?.relationships?.forEach(relationship => {
        expect(relationship.resource).toBeDefined();
        expect(relationship.resource).not.toBe('Customer');
      });
    });

    test('should include connection count', () => {
      const params: ResourceListParams = { includeRelationships: true };
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      customer?.relationships?.forEach(relationship => {
        expect(relationship.connectionCount).toBeGreaterThanOrEqual(0);
      });
    });

    test('should sort relationships by connection count descending', () => {
      const params: ResourceListParams = { includeRelationships: true };
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      const connectionCounts = customer?.relationships?.map(r => r.connectionCount) || [];
      const sortedCounts = [...connectionCounts].sort((a, b) => b - a);
      expect(connectionCounts).toEqual(sortedCounts);
    });

    test('should limit relationships to top 5', () => {
      const params: ResourceListParams = { includeRelationships: true };
      const result = listResources(params, metadataIndex);

      result.resources.forEach(resource => {
        expect(resource.relationships?.length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('listResources - Resource statistics', () => {
    test('should include statistics for each resource', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      result.resources.forEach(resource => {
        expect(resource.statistics).toBeDefined();
        expect(resource.statistics.totalEndpoints).toBeGreaterThanOrEqual(0);
        expect(resource.statistics.totalParameters).toBeGreaterThanOrEqual(0);
        expect(resource.statistics.totalResponses).toBeGreaterThanOrEqual(0);
        expect(resource.statistics.uniquePermissions).toBeGreaterThanOrEqual(0);
        expect(resource.statistics.mostCommonMethod).toBeDefined();
        expect(resource.statistics.averageEndpointsPerResource).toBeGreaterThanOrEqual(0);
      });
    });

    test('should calculate correct total endpoints for Customer', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      expect(customer?.statistics.totalEndpoints).toBe(5);
    });

    test('should calculate correct total parameters for Customer', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      // Get Customers: 1 param, Get Customer by ID: 1 param, Create Customer: 1 param, Update Customer: 2 params, Delete Customer: 1 param
      expect(customer?.statistics.totalParameters).toBe(6);
    });

    test('should calculate correct total responses for Customer', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      expect(customer?.statistics.totalResponses).toBe(5); // 1 response per endpoint
    });

    test('should calculate correct unique permissions for Customer', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      expect(customer?.statistics.uniquePermissions).toBe(4); // view, create, update, delete
    });

    test('should identify most common method for Customer', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      expect(customer?.statistics.mostCommonMethod).toBe('GET'); // 2 GET endpoints
    });

    test('should include overall statistics', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      expect(result.overallStatistics).toBeDefined();
      expect(result.overallStatistics.totalEndpoints).toBe(10); // 5 + 3 + 2
      expect(result.overallStatistics.totalParameters).toBe(8);
      expect(result.overallStatistics.totalResponses).toBe(10);
      expect(result.overallStatistics.uniquePermissions).toBe(7);
    });
  });

  describe('listResources - Resource navigation helpers', () => {
    test('should include navigation helpers for each resource', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      result.resources.forEach(resource => {
        expect(resource.navigation).toBeDefined();
        expect(Array.isArray(resource.navigation.relatedResources)).toBe(true);
        expect(Array.isArray(resource.navigation.commonOperations)).toBe(true);
        expect(Array.isArray(resource.navigation.similarPermissionResources)).toBe(true);
      });
    });

    test('should include related resources', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      expect(customer?.navigation.relatedResources.length).toBeGreaterThanOrEqual(0);
    });

    test('should include common operations', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      expect(customer?.navigation.commonOperations.length).toBeGreaterThan(0);
    });

    test('should include similar permission resources', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      const customer = result.resources.find(r => r.summary.name === 'Customer');
      expect(customer?.navigation.similarPermissionResources.length).toBeGreaterThanOrEqual(0);
    });

    test('should limit similar permission resources to top 5', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      result.resources.forEach(resource => {
        expect(resource.navigation.similarPermissionResources.length).toBeLessThanOrEqual(5);
      });
    });

    test('should include shared permissions in similar permission resources', () => {
      const params: ResourceListParams = {};
      const result = listResources(params, metadataIndex);

      result.resources.forEach(resource => {
        resource.navigation.similarPermissionResources.forEach(similar => {
          expect(similar.resource).toBeDefined();
          expect(Array.isArray(similar.sharedPermissions)).toBe(true);
        });
      });
    });
  });

  describe('getResource - Get specific resource', () => {
    test('should get Customer resource', () => {
      const result = getResource('Customer', false, false, metadataIndex);

      expect(result).toBeDefined();
      expect(result?.summary.name).toBe('Customer');
    });

    test('should get Ticket resource', () => {
      const result = getResource('Ticket', false, false, metadataIndex);

      expect(result).toBeDefined();
      expect(result?.summary.name).toBe('Ticket');
    });

    test('should return null for non-existent resource', () => {
      const result = getResource('NonExistent', false, false, metadataIndex);

      expect(result).toBeNull();
    });

    test('should include endpoints when requested', () => {
      const result = getResource('Customer', true, false, metadataIndex);

      expect(result?.endpoints).toBeDefined();
      expect(result?.endpoints?.length).toBe(5);
    });

    test('should not include endpoints when not requested', () => {
      const result = getResource('Customer', false, false, metadataIndex);

      expect(result?.endpoints).toBeUndefined();
    });

    test('should include relationships when requested', () => {
      const result = getResource('Customer', false, true, metadataIndex);

      expect(result?.relationships).toBeDefined();
    });

    test('should not include relationships when not requested', () => {
      const result = getResource('Customer', false, false, metadataIndex);

      expect(result?.relationships).toBeUndefined();
    });

    test('should include statistics by default', () => {
      const result = getResource('Customer', false, false, metadataIndex);

      expect(result?.statistics).toBeDefined();
    });

    test('should include navigation helpers by default', () => {
      const result = getResource('Customer', false, false, metadataIndex);

      expect(result?.navigation).toBeDefined();
    });
  });

  describe('getResourceNames - Get all resource names', () => {
    test('should return all resource names', () => {
      const names = getResourceNames(metadataIndex);

      expect(names).toBeDefined();
      expect(names.length).toBe(3);
      expect(names).toContain('Customer');
      expect(names).toContain('Ticket');
      expect(names).toContain('Invoice');
    });

    test('should sort resource names alphabetically', () => {
      const names = getResourceNames(metadataIndex);

      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    test('should return empty array for empty index', () => {
      const emptyIndex: MetadataIndex = {
        resources: new Map(),
        endpointsByPath: new Map(),
        endpointsByPermission: new Map(),
        endpointsByMethod: new Map(),
        allEndpoints: []
      };

      const names = getResourceNames(emptyIndex);

      expect(names).toEqual([]);
    });
  });

  describe('getResourcesByMethod - Get resources by HTTP method', () => {
    test('should return resources using GET method', () => {
      const resources = getResourcesByMethod('GET', metadataIndex);

      expect(resources).toContain('Customer');
      expect(resources).toContain('Ticket');
      expect(resources).toContain('Invoice');
    });

    test('should return resources using POST method', () => {
      const resources = getResourcesByMethod('POST', metadataIndex);

      expect(resources).toContain('Customer');
      expect(resources).toContain('Ticket');
      expect(resources).toContain('Invoice');
    });

    test('should return resources using DELETE method', () => {
      const resources = getResourcesByMethod('DELETE', metadataIndex);

      expect(resources).toContain('Customer');
      expect(resources).not.toContain('Ticket');
      expect(resources).not.toContain('Invoice');
    });

    test('should return resources using PUT method', () => {
      const resources = getResourcesByMethod('PUT', metadataIndex);

      expect(resources).toContain('Customer');
      expect(resources).not.toContain('Ticket');
      expect(resources).not.toContain('Invoice');
    });

    test('should handle case-insensitive method', () => {
      const resourcesUpper = getResourcesByMethod('GET', metadataIndex);
      const resourcesLower = getResourcesByMethod('get', metadataIndex);

      expect(resourcesUpper).toEqual(resourcesLower);
    });

    test('should return empty array for non-existent method', () => {
      const resources = getResourcesByMethod('PATCH', metadataIndex);

      expect(resources).toEqual([]);
    });

    test('should sort resource names alphabetically', () => {
      const resources = getResourcesByMethod('GET', metadataIndex);

      const sortedResources = [...resources].sort();
      expect(resources).toEqual(sortedResources);
    });
  });

  describe('getResourcesByPermission - Get resources by permission', () => {
    test('should return resources using customer.view permission', () => {
      const resources = getResourcesByPermission('customer.view', metadataIndex);

      expect(resources).toContain('Customer');
      expect(resources.length).toBe(1);
    });

    test('should return resources using ticket.view permission', () => {
      const resources = getResourcesByPermission('ticket.view', metadataIndex);

      expect(resources).toContain('Ticket');
      expect(resources.length).toBe(1);
    });

    test('should return empty array for non-existent permission', () => {
      const resources = getResourcesByPermission('nonexistent.permission', metadataIndex);

      expect(resources).toEqual([]);
    });

    test('should sort resource names alphabetically', () => {
      const resources = getResourcesByPermission('customer.view', metadataIndex);

      const sortedResources = [...resources].sort();
      expect(resources).toEqual(sortedResources);
    });
  });

  describe('listResources - Edge cases', () => {
    test('should handle resource with no endpoints', () => {
      const documents: ApiDocument[] = [
        {
          resourceName: 'EmptyResource',
          endpoints: []
        }
      ];

      const index = buildMetadataIndex(documents);
      const params: ResourceListParams = {};
      const result = listResources(params, index);

      expect(result.resources.length).toBe(1);
      expect(result.resources[0].summary.name).toBe('EmptyResource');
      expect(result.resources[0].summary.endpointCount).toBe(0);
    });

    test('should handle resource with no permissions', () => {
      const documents: ApiDocument[] = [
        {
          resourceName: 'NoPermission',
          endpoints: [
            {
              resource: 'NoPermission',
              operation: 'Get No Permission',
              description: 'Test endpoint',
              method: 'GET',
              path: '/nopermission',
              permission: '',
              parameters: [],
              responses: [
                {
                  statusCode: 200,
                  description: 'Success'
                }
              ]
            }
          ]
        }
      ];

      const index = buildMetadataIndex(documents);
      const params: ResourceListParams = {};
      const result = listResources(params, index);

      expect(result.resources[0].summary.permissions).toEqual([]);
      expect(result.resources[0].statistics.uniquePermissions).toBe(0);
    });

    test('should handle resource with no parameters', () => {
      const documents: ApiDocument[] = [
        {
          resourceName: 'NoParams',
          endpoints: [
            {
              resource: 'NoParams',
              operation: 'Get No Params',
              description: 'Test endpoint',
              method: 'GET',
              path: '/noparams',
              permission: 'noparams.view',
              parameters: [],
              responses: [
                {
                  statusCode: 200,
                  description: 'Success'
                }
              ]
            }
          ]
        }
      ];

      const index = buildMetadataIndex(documents);
      const params: ResourceListParams = {};
      const result = listResources(params, index);

      expect(result.resources[0].statistics.totalParameters).toBe(0);
    });

    test('should handle both includeEndpoints and includeRelationships', () => {
      const params: ResourceListParams = {
        includeEndpoints: true,
        includeRelationships: true
      };
      const result = listResources(params, metadataIndex);

      result.resources.forEach(resource => {
        expect(resource.endpoints).toBeDefined();
        expect(resource.relationships).toBeDefined();
      });
    });
  });
});
