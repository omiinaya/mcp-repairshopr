/**
 * Unit tests for permission reference tool
 */

import {
  getPermissions,
  getPermissionHierarchyDefinitions,
  getAllPermissionDescriptions,
  PermissionLookupParams
} from '../../src/tools/permissions';
import { MetadataIndex, buildMetadataIndex } from '../../src/parser/metadata';
import { ApiDocument } from '../../src/utils/types';

describe('Permission Reference Tool', () => {
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

  describe('getPermissions - Permission lookup by endpoint', () => {
    test('should find permission by endpoint path and method', () => {
      const params: PermissionLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'GET'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission).toBeDefined();
      expect(result.permission?.name).toBe('customer.view');
      expect(result.permission?.endpoints.length).toBe(1);
      expect(result.permission?.endpoints[0]).toMatchObject({
        resource: 'Customer',
        method: 'GET',
        path: '/customers/{id}'
      });
    });

    test('should find permission for POST endpoint', () => {
      const params: PermissionLookupParams = {
        endpointPath: '/customers',
        method: 'POST'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission).toBeDefined();
      expect(result.permission?.name).toBe('customer.create');
      expect(result.permission?.endpoints[0].method).toBe('POST');
    });

    test('should find permission for DELETE endpoint', () => {
      const params: PermissionLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'DELETE'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission).toBeDefined();
      expect(result.permission?.name).toBe('customer.delete');
    });

    test('should handle lowercase method', () => {
      const params: PermissionLookupParams = {
        endpointPath: '/customers/{id}',
        method: 'get'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission).toBeDefined();
      expect(result.permission?.endpoints[0].method).toBe('GET');
    });

    test('should return null for non-existent endpoint', () => {
      const params: PermissionLookupParams = {
        endpointPath: '/nonexistent',
        method: 'GET'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission).toBeUndefined();
      expect(result.totalPermissions).toBeGreaterThan(0);
    });

    test('should throw error when method is not provided with endpointPath', () => {
      const params: PermissionLookupParams = {
        endpointPath: '/customers/{id}'
      };

      expect(() => {
        getPermissions(params, metadataIndex);
      }).toThrow('method parameter is required when using endpointPath');
    });
  });

  describe('getPermissions - Permission lookup by resource', () => {
    test('should find all permissions for a resource', () => {
      const params: PermissionLookupParams = {
        resource: 'Customer'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.allPermissions).toBeDefined();
      expect(result.allPermissions?.length).toBe(4); // view, create, update, delete
      expect(result.allPermissions?.every(p => p.name.startsWith('customer.'))).toBe(true);
    });

    test('should find permissions for Ticket resource', () => {
      const params: PermissionLookupParams = {
        resource: 'Ticket'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.allPermissions).toBeDefined();
      expect(result.allPermissions?.length).toBe(3); // view, create, admin
      expect(result.allPermissions?.every(p => p.name.startsWith('ticket.'))).toBe(true);
    });

    test('should include all endpoints for each permission', () => {
      const params: PermissionLookupParams = {
        resource: 'Customer'
      };

      const result = getPermissions(params, metadataIndex);

      const viewPermission = result.allPermissions?.find(p => p.name === 'customer.view');
      expect(viewPermission?.endpoints.length).toBe(2); // GET /customers and GET /customers/{id}
    });

    test('should return empty array for non-existent resource', () => {
      const params: PermissionLookupParams = {
        resource: 'NonExistent'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.allPermissions).toEqual([]);
      expect(result.totalPermissions).toBeGreaterThan(0);
    });
  });

  describe('getPermissions - Permission lookup by permission name', () => {
    test('should find permission by exact name', () => {
      const params: PermissionLookupParams = {
        permission: 'customer.view'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission).toBeDefined();
      expect(result.permission?.name).toBe('customer.view');
      expect(result.permission?.endpoints.length).toBe(2);
    });

    test('should find permission with single endpoint', () => {
      const params: PermissionLookupParams = {
        permission: 'customer.delete'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission).toBeDefined();
      expect(result.permission?.name).toBe('customer.delete');
      expect(result.permission?.endpoints.length).toBe(1);
    });

    test('should return null for non-existent permission', () => {
      const params: PermissionLookupParams = {
        permission: 'nonexistent.permission'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission).toBeUndefined();
      expect(result.totalPermissions).toBeGreaterThan(0);
    });
  });

  describe('getPermissions - Permission descriptions', () => {
    test('should include permission description for view permission', () => {
      const params: PermissionLookupParams = {
        permission: 'customer.view'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission?.description).toBeDefined();
      expect(result.permission?.description.category).toBe('read');
      expect(result.permission?.description.operations).toContain('GET');
    });

    test('should include permission description for create permission', () => {
      const params: PermissionLookupParams = {
        permission: 'customer.create'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission?.description).toBeDefined();
      expect(result.permission?.description.category).toBe('write');
      expect(result.permission?.description.operations).toContain('POST');
    });

    test('should include permission description for update permission', () => {
      const params: PermissionLookupParams = {
        permission: 'customer.update'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission?.description).toBeDefined();
      expect(result.permission?.description.category).toBe('write');
      expect(result.permission?.description.operations).toContain('PUT');
    });

    test('should include permission description for delete permission', () => {
      const params: PermissionLookupParams = {
        permission: 'customer.delete'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission?.description).toBeDefined();
      expect(result.permission?.description.category).toBe('write');
      expect(result.permission?.description.operations).toContain('DELETE');
    });

    test('should infer description from permission name', () => {
      const params: PermissionLookupParams = {
        permission: 'ticket.admin'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission?.description).toBeDefined();
      expect(result.permission?.description.category).toBe('admin');
    });
  });

  describe('getPermissions - Permission hierarchy information', () => {
    test('should include hierarchy for view permission', () => {
      const params: PermissionLookupParams = {
        permission: 'customer.view'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission?.hierarchy).toBeDefined();
      expect(result.permission?.hierarchy?.name).toBe('view');
      expect(result.permission?.hierarchy?.level).toBe('low');
      expect(result.permission?.hierarchy?.parent).toBe('manage');
    });

    test('should include hierarchy for create permission', () => {
      const params: PermissionLookupParams = {
        permission: 'customer.create'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission?.hierarchy).toBeDefined();
      expect(result.permission?.hierarchy?.name).toBe('create');
      expect(result.permission?.hierarchy?.level).toBe('medium');
      expect(result.permission?.hierarchy?.parent).toBe('manage');
    });

    test('should include hierarchy for admin permission', () => {
      const params: PermissionLookupParams = {
        permission: 'ticket.admin'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission?.hierarchy).toBeDefined();
      expect(result.permission?.hierarchy?.name).toBe('admin');
      expect(result.permission?.hierarchy?.level).toBe('highest');
      expect(result.permission?.hierarchy?.children.length).toBeGreaterThan(0);
    });

    test('should include hierarchy for manage permission', () => {
      const params: PermissionLookupParams = {
        permission: 'invoice.manage'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission?.hierarchy).toBeDefined();
      expect(result.permission?.hierarchy?.name).toBe('manage');
      expect(result.permission?.hierarchy?.level).toBe('high');
      expect(result.permission?.hierarchy?.parent).toBe('admin');
    });
  });

  describe('getPermissions - Permission-based filtering', () => {
    test('should return all permissions when no filters provided', () => {
      const params: PermissionLookupParams = {};

      const result = getPermissions(params, metadataIndex);

      expect(result.allPermissions).toBeDefined();
      expect(result.allPermissions?.length).toBeGreaterThan(0);
      expect(result.totalPermissions).toBe(result.allPermissions?.length);
    });

    test('should sort all permissions alphabetically', () => {
      const params: PermissionLookupParams = {};

      const result = getPermissions(params, metadataIndex);

      expect(result.allPermissions).toBeDefined();
      const permissionNames = result.allPermissions?.map(p => p.name) || [];
      const sortedNames = [...permissionNames].sort();
      expect(permissionNames).toEqual(sortedNames);
    });

    test('should include endpoints for each permission', () => {
      const params: PermissionLookupParams = {};

      const result = getPermissions(params, metadataIndex);

      expect(result.allPermissions).toBeDefined();
      result.allPermissions?.forEach(permission => {
        expect(permission.endpoints.length).toBeGreaterThan(0);
        permission.endpoints.forEach(endpoint => {
          expect(endpoint.resource).toBeDefined();
          expect(endpoint.method).toBeDefined();
          expect(endpoint.path).toBeDefined();
        });
      });
    });
  });

  describe('getPermissions - Permission requirement summaries', () => {
    test('should include permission summaries when requested', () => {
      const params: PermissionLookupParams = {
        includeSummaries: true
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.summaries).toBeDefined();
      expect(result.summaries?.length).toBeGreaterThan(0);
    });

    test('should include endpoint count in summaries', () => {
      const params: PermissionLookupParams = {
        includeSummaries: true
      };

      const result = getPermissions(params, metadataIndex);

      result.summaries?.forEach(summary => {
        expect(summary.endpointCount).toBeGreaterThan(0);
        expect(summary.endpointCount).toBeGreaterThanOrEqual(1);
      });
    });

    test('should include resources in summaries', () => {
      const params: PermissionLookupParams = {
        includeSummaries: true
      };

      const result = getPermissions(params, metadataIndex);

      result.summaries?.forEach(summary => {
        expect(summary.resources.length).toBeGreaterThan(0);
        expect(Array.isArray(summary.resources)).toBe(true);
      });
    });

    test('should include methods in summaries', () => {
      const params: PermissionLookupParams = {
        includeSummaries: true
      };

      const result = getPermissions(params, metadataIndex);

      result.summaries?.forEach(summary => {
        expect(summary.methods.length).toBeGreaterThan(0);
        expect(Array.isArray(summary.methods)).toBe(true);
      });
    });

    test('should include sample endpoints in summaries', () => {
      const params: PermissionLookupParams = {
        includeSummaries: true
      };

      const result = getPermissions(params, metadataIndex);

      result.summaries?.forEach(summary => {
        expect(summary.sampleEndpoints.length).toBeGreaterThan(0);
        expect(summary.sampleEndpoints.length).toBeLessThanOrEqual(3);
        summary.sampleEndpoints.forEach(endpoint => {
          expect(endpoint.resource).toBeDefined();
          expect(endpoint.method).toBeDefined();
          expect(endpoint.path).toBeDefined();
        });
      });
    });

    test('should sort summaries by endpoint count descending', () => {
      const params: PermissionLookupParams = {
        includeSummaries: true
      };

      const result = getPermissions(params, metadataIndex);

      const endpointCounts = result.summaries?.map(s => s.endpointCount) || [];
      const sortedCounts = [...endpointCounts].sort((a, b) => b - a);
      expect(endpointCounts).toEqual(sortedCounts);
    });
  });

  describe('getPermissions - Permission matrix', () => {
    test('should include permission matrix when requested', () => {
      const params: PermissionLookupParams = {
        includeMatrix: true
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.matrix).toBeDefined();
      expect(result.matrix?.length).toBeGreaterThan(0);
    });

    test('should include all required fields in matrix entries', () => {
      const params: PermissionLookupParams = {
        includeMatrix: true
      };

      const result = getPermissions(params, metadataIndex);

      result.matrix?.forEach(entry => {
        expect(entry.permission).toBeDefined();
        expect(entry.description).toBeDefined();
        expect(entry.category).toBeDefined();
        expect(entry.endpointCount).toBeGreaterThan(0);
        expect(entry.resources).toBeDefined();
        expect(entry.methods).toBeDefined();
      });
    });

    test('should include correct categories in matrix', () => {
      const params: PermissionLookupParams = {
        includeMatrix: true
      };

      const result = getPermissions(params, metadataIndex);

      const categories = new Set(result.matrix?.map(m => m.category));
      expect(categories.has('read')).toBe(true);
      expect(categories.has('write')).toBe(true);
    });

    test('should sort matrix by permission name', () => {
      const params: PermissionLookupParams = {
        includeMatrix: true
      };

      const result = getPermissions(params, metadataIndex);

      const permissionNames = result.matrix?.map(m => m.permission) || [];
      const sortedNames = [...permissionNames].sort();
      expect(permissionNames).toEqual(sortedNames);
    });

    test('should include both matrix and summaries when both requested', () => {
      const params: PermissionLookupParams = {
        includeMatrix: true,
        includeSummaries: true
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.matrix).toBeDefined();
      expect(result.summaries).toBeDefined();
      expect(result.matrix?.length).toBeGreaterThan(0);
      expect(result.summaries?.length).toBeGreaterThan(0);
    });
  });

  describe('getPermissions - Total permissions count', () => {
    test('should include total permissions count', () => {
      const params: PermissionLookupParams = {};

      const result = getPermissions(params, metadataIndex);

      expect(result.totalPermissions).toBeDefined();
      expect(result.totalPermissions).toBeGreaterThan(0);
    });

    test('should match actual number of unique permissions', () => {
      const params: PermissionLookupParams = {};

      const result = getPermissions(params, metadataIndex);

      expect(result.totalPermissions).toBe(result.allPermissions?.length);
    });

    test('should include total count in filtered results', () => {
      const params: PermissionLookupParams = {
        resource: 'Customer'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.totalPermissions).toBeGreaterThan(0);
      expect(result.totalPermissions).toBe(metadataIndex.endpointsByPermission.size);
    });
  });

  describe('getPermissionHierarchyDefinitions', () => {
    test('should return all hierarchy definitions', () => {
      const hierarchies = getPermissionHierarchyDefinitions();

      expect(hierarchies.length).toBeGreaterThan(0);
      expect(hierarchies.length).toBe(6); // admin, manage, create, update, delete, view
    });

    test('should include all required fields in hierarchy definitions', () => {
      const hierarchies = getPermissionHierarchyDefinitions();

      hierarchies.forEach(hierarchy => {
        expect(hierarchy.name).toBeDefined();
        expect(hierarchy.level).toBeDefined();
        expect(hierarchy.children).toBeDefined();
        expect(Array.isArray(hierarchy.children)).toBe(true);
        expect(hierarchy.description).toBeDefined();
      });
    });

    test('should have correct parent-child relationships', () => {
      const hierarchies = getPermissionHierarchyDefinitions();

      const admin = hierarchies.find(h => h.name === 'admin');
      expect(admin?.parent).toBeUndefined();
      expect(admin?.children.length).toBeGreaterThan(0);

      const view = hierarchies.find(h => h.name === 'view');
      expect(view?.parent).toBe('manage');
      expect(view?.children.length).toBe(0);
    });

    test('should have correct hierarchy levels', () => {
      const hierarchies = getPermissionHierarchyDefinitions();

      const admin = hierarchies.find(h => h.name === 'admin');
      expect(admin?.level).toBe('highest');

      const manage = hierarchies.find(h => h.name === 'manage');
      expect(manage?.level).toBe('high');

      const view = hierarchies.find(h => h.name === 'view');
      expect(view?.level).toBe('low');
    });
  });

  describe('getAllPermissionDescriptions', () => {
    test('should return all permission descriptions', () => {
      const descriptions = getAllPermissionDescriptions();

      expect(descriptions.length).toBeGreaterThan(0);
      expect(descriptions.length).toBe(6); // view, create, update, delete, admin, manage
    });

    test('should include all required fields in descriptions', () => {
      const descriptions = getAllPermissionDescriptions();

      descriptions.forEach(desc => {
        expect(desc.name).toBeDefined();
        expect(desc.description).toBeDefined();
        expect(desc.category).toBeDefined();
        expect(desc.operations).toBeDefined();
        expect(Array.isArray(desc.operations)).toBe(true);
      });
    });

    test('should have correct categories for permissions', () => {
      const descriptions = getAllPermissionDescriptions();

      const view = descriptions.find(d => d.name === 'view');
      expect(view?.category).toBe('read');

      const create = descriptions.find(d => d.name === 'create');
      expect(create?.category).toBe('write');

      const admin = descriptions.find(d => d.name === 'admin');
      expect(admin?.category).toBe('admin');
    });

    test('should have relevant operations for each permission', () => {
      const descriptions = getAllPermissionDescriptions();

      const view = descriptions.find(d => d.name === 'view');
      expect(view?.operations).toContain('GET');

      const create = descriptions.find(d => d.name === 'create');
      expect(create?.operations).toContain('POST');

      const deletePerm = descriptions.find(d => d.name === 'delete');
      expect(deletePerm?.operations).toContain('DELETE');
    });
  });

  describe('getPermissions - Edge cases', () => {
    test('should handle permission with no hierarchy match', () => {
      const params: PermissionLookupParams = {
        permission: 'custom.permission'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission).toBeUndefined();
    });

    test('should handle empty metadata index', () => {
      const emptyIndex: MetadataIndex = {
        resources: new Map(),
        endpointsByPath: new Map(),
        endpointsByPermission: new Map(),
        endpointsByMethod: new Map(),
        allEndpoints: []
      };

      const params: PermissionLookupParams = {};

      const result = getPermissions(params, emptyIndex);

      expect(result.allPermissions).toEqual([]);
      expect(result.totalPermissions).toBe(0);
    });

    test('should handle permission with special characters', () => {
      const params: PermissionLookupParams = {
        permission: 'customer.view_special'
      };

      const result = getPermissions(params, metadataIndex);

      expect(result.permission).toBeUndefined();
    });
  });
});
