/**
 * Unit tests for metadata extraction module
 */

import {
  buildMetadataIndex,
  getEndpointsByResource,
  getEndpointByPath,
  getEndpointsByPermission,
  getEndpointsByMethod,
  getAllParameters,
  getAllResponses
} from '../../src/parser/metadata';
import {
  ApiDocument,
  ApiEndpoint,
  ApiParameter,
  ApiResponse
} from '../../src/utils/types';

describe('Metadata Extraction', () => {
  // Test data
  const mockParameters = [
    {
      name: 'id',
      type: 'integer',
      required: true,
      description: 'Customer ID',
      paramType: 'path' as const
    },
    {
      name: 'include',
      type: 'string',
      required: false,
      description: 'Include related resources',
      paramType: 'query' as const
    }
  ];

  const mockRequestBody = [
    {
      name: 'name',
      type: 'string',
      required: true,
      description: 'Customer name',
      paramType: 'body' as const
    },
    {
      name: 'email',
      type: 'string',
      required: true,
      description: 'Customer email',
      paramType: 'body' as const
    }
  ];

  const mockResponses = [
    {
      statusCode: 200,
      description: 'Success',
      example: { id: 1, name: 'Test Customer' }
    },
    {
      statusCode: 404,
      description: 'Not found'
    }
  ];

  const mockEndpoints = [
    {
      resource: 'Customer',
      operation: 'Get Customer',
      description: 'Retrieve a single customer',
      method: 'GET',
      path: '/customers/{id}',
      permission: 'customer.view',
      parameters: mockParameters,
      responses: [mockResponses[0]]
    },
    {
      resource: 'Customer',
      operation: 'Create Customer',
      description: 'Create a new customer',
      method: 'POST',
      path: '/customers',
      permission: 'customer.create',
      parameters: [],
      requestBody: mockRequestBody,
      responses: [mockResponses[0]]
    },
    {
      resource: 'Ticket',
      operation: 'Get Ticket',
      description: 'Retrieve a single ticket',
      method: 'GET',
      path: '/tickets/{id}',
      permission: 'ticket.view',
      parameters: mockParameters,
      responses: [mockResponses[0]]
    },
    {
      resource: 'Ticket',
      operation: 'Update Ticket',
      description: 'Update a ticket',
      method: 'PUT',
      path: '/tickets/{id}',
      permission: 'ticket.edit',
      parameters: mockParameters,
      requestBody: mockRequestBody,
      responses: mockResponses
    }
  ];

  const mockDocuments = [
    {
      resourceName: 'Customer',
      endpoints: [mockEndpoints[0], mockEndpoints[1]]
    },
    {
      resourceName: 'Ticket',
      endpoints: [mockEndpoints[2], mockEndpoints[3]]
    }
  ];

  describe('buildMetadataIndex', () => {
    it('should build metadata index from parsed documents', () => {
      const index = buildMetadataIndex(mockDocuments);

      expect(index).toBeDefined();
      expect(index.resources).toBeInstanceOf(Map);
      expect(index.endpointsByPath).toBeInstanceOf(Map);
      expect(index.endpointsByPermission).toBeInstanceOf(Map);
      expect(index.endpointsByMethod).toBeInstanceOf(Map);
      expect(index.allEndpoints).toBeInstanceOf(Array);
    });

    it('should populate all endpoints array', () => {
      const index = buildMetadataIndex(mockDocuments);

      expect(index.allEndpoints).toHaveLength(4);
      expect(index.allEndpoints).toEqual(mockEndpoints);
    });

    it('should build resources map correctly', () => {
      const index = buildMetadataIndex(mockDocuments);

      expect(index.resources.size).toBe(2);
      expect(index.resources.get('Customer')).toHaveLength(2);
      expect(index.resources.get('Ticket')).toHaveLength(2);
      expect(index.resources.get('Customer')).toEqual([mockEndpoints[0], mockEndpoints[1]]);
      expect(index.resources.get('Ticket')).toEqual([mockEndpoints[2], mockEndpoints[3]]);
    });

    it('should build endpointsByPath map correctly', () => {
      const index = buildMetadataIndex(mockDocuments);

      expect(index.endpointsByPath.size).toBe(4);
      expect(index.endpointsByPath.get('GET:/customers/{id}')).toEqual(mockEndpoints[0]);
      expect(index.endpointsByPath.get('POST:/customers')).toEqual(mockEndpoints[1]);
      expect(index.endpointsByPath.get('GET:/tickets/{id}')).toEqual(mockEndpoints[2]);
      expect(index.endpointsByPath.get('PUT:/tickets/{id}')).toEqual(mockEndpoints[3]);
    });

    it('should build endpointsByPermission map correctly', () => {
      const index = buildMetadataIndex(mockDocuments);

      expect(index.endpointsByPermission.size).toBe(4);
      expect(index.endpointsByPermission.get('customer.view')).toHaveLength(1);
      expect(index.endpointsByPermission.get('customer.create')).toHaveLength(1);
      expect(index.endpointsByPermission.get('ticket.view')).toHaveLength(1);
      expect(index.endpointsByPermission.get('ticket.edit')).toHaveLength(1);
      const customerViewEndpoints = index.endpointsByPermission.get('customer.view');
      expect(customerViewEndpoints && customerViewEndpoints[0]).toEqual(mockEndpoints[0]);
    });

    it('should build endpointsByMethod map correctly', () => {
      const index = buildMetadataIndex(mockDocuments);

      expect(index.endpointsByMethod.size).toBe(3);
      expect(index.endpointsByMethod.get('GET')).toHaveLength(2);
      expect(index.endpointsByMethod.get('POST')).toHaveLength(1);
      expect(index.endpointsByMethod.get('PUT')).toHaveLength(1);
      const getEndpoints = index.endpointsByMethod.get('GET');
      expect(getEndpoints).toContainEqual(mockEndpoints[0]);
      expect(getEndpoints).toContainEqual(mockEndpoints[2]);
    });

    it('should handle empty documents array', () => {
      const index = buildMetadataIndex([]);

      expect(index.allEndpoints).toHaveLength(0);
      expect(index.resources.size).toBe(0);
      expect(index.endpointsByPath.size).toBe(0);
      expect(index.endpointsByPermission.size).toBe(0);
      expect(index.endpointsByMethod.size).toBe(0);
    });

    it('should handle documents with no endpoints', () => {
      const emptyDocuments = [
        { resourceName: 'Empty', endpoints: [] }
      ];

      const index = buildMetadataIndex(emptyDocuments);

      expect(index.allEndpoints).toHaveLength(0);
      expect(index.resources.size).toBe(1);
      expect(index.resources.get('Empty')).toHaveLength(0);
    });
  });

  describe('getEndpointsByResource', () => {
    it('should return endpoints for existing resource', () => {
      const index = buildMetadataIndex(mockDocuments);
      const endpoints = getEndpointsByResource(index, 'Customer');

      expect(endpoints).toHaveLength(2);
      expect(endpoints).toEqual([mockEndpoints[0], mockEndpoints[1]]);
    });

    it('should return empty array for non-existent resource', () => {
      const index = buildMetadataIndex(mockDocuments);
      const endpoints = getEndpointsByResource(index, 'NonExistent');

      expect(endpoints).toEqual([]);
    });
  });

  describe('getEndpointByPath', () => {
    it('should return endpoint for existing path and method', () => {
      const index = buildMetadataIndex(mockDocuments);
      const endpoint = getEndpointByPath(index, '/customers/{id}', 'GET');

      expect(endpoint).toBeDefined();
      expect(endpoint).toEqual(mockEndpoints[0]);
    });

    it('should return undefined for non-existent path', () => {
      const index = buildMetadataIndex(mockDocuments);
      const endpoint = getEndpointByPath(index, '/nonexistent', 'GET');

      expect(endpoint).toBeUndefined();
    });

    it('should return undefined for wrong method', () => {
      const index = buildMetadataIndex(mockDocuments);
      const endpoint = getEndpointByPath(index, '/customers/{id}', 'POST');

      expect(endpoint).toBeUndefined();
    });
  });

  describe('getEndpointsByPermission', () => {
    it('should return endpoints for existing permission', () => {
      const index = buildMetadataIndex(mockDocuments);
      const endpoints = getEndpointsByPermission(index, 'customer.view');

      expect(endpoints).toHaveLength(1);
      expect(endpoints[0]).toEqual(mockEndpoints[0]);
    });

    it('should return empty array for non-existent permission', () => {
      const index = buildMetadataIndex(mockDocuments);
      const endpoints = getEndpointsByPermission(index, 'nonexistent.permission');

      expect(endpoints).toEqual([]);
    });
  });

  describe('getEndpointsByMethod', () => {
    it('should return endpoints for existing method', () => {
      const index = buildMetadataIndex(mockDocuments);
      const endpoints = getEndpointsByMethod(index, 'GET');

      expect(endpoints).toHaveLength(2);
      expect(endpoints).toContainEqual(mockEndpoints[0]);
      expect(endpoints).toContainEqual(mockEndpoints[2]);
    });

    it('should return empty array for non-existent method', () => {
      const index = buildMetadataIndex(mockDocuments);
      const endpoints = getEndpointsByMethod(index, 'DELETE');

      expect(endpoints).toEqual([]);
    });
  });

  describe('getAllParameters', () => {
    it('should return all parameters from all endpoints', () => {
      const index = buildMetadataIndex(mockDocuments);
      const parameters = getAllParameters(index);

      expect(parameters.length).toBeGreaterThan(0);
      expect(parameters).toContainEqual(mockParameters[0]);
      expect(parameters).toContainEqual(mockParameters[1]);
      expect(parameters).toContainEqual(mockRequestBody[0]);
      expect(parameters).toContainEqual(mockRequestBody[1]);
    });

    it('should include both query/path and body parameters', () => {
      const index = buildMetadataIndex(mockDocuments);
      const parameters = getAllParameters(index);

      const queryParams = parameters.filter(p => p.paramType === 'query');
      const pathParams = parameters.filter(p => p.paramType === 'path');
      const bodyParams = parameters.filter(p => p.paramType === 'body');

      expect(queryParams.length).toBeGreaterThan(0);
      expect(pathParams.length).toBeGreaterThan(0);
      expect(bodyParams.length).toBeGreaterThan(0);
    });

    it('should return empty array for index with no parameters', () => {
      const emptyDocuments = [
        {
          resourceName: 'Empty',
          endpoints: [
            {
              resource: 'Empty',
              operation: 'Empty Operation',
              description: '',
              method: 'GET',
              path: '/empty',
              permission: '',
              parameters: [],
              responses: []
            }
          ]
        }
      ];

      const index = buildMetadataIndex(emptyDocuments);
      const parameters = getAllParameters(index);

      expect(parameters).toEqual([]);
    });
  });

  describe('getAllResponses', () => {
    it('should return all responses from all endpoints', () => {
      const index = buildMetadataIndex(mockDocuments);
      const responses = getAllResponses(index);

      expect(responses.length).toBeGreaterThan(0);
      expect(responses).toContainEqual(mockResponses[0]);
      expect(responses).toContainEqual(mockResponses[1]);
    });

    it('should include responses from all endpoints', () => {
      const index = buildMetadataIndex(mockDocuments);
      const responses = getAllResponses(index);

      // Should have at least 4 responses (one per endpoint minimum)
      expect(responses.length).toBeGreaterThanOrEqual(4);
    });

    it('should return empty array for index with no responses', () => {
      const emptyDocuments = [
        {
          resourceName: 'Empty',
          endpoints: [
            {
              resource: 'Empty',
              operation: 'Empty Operation',
              description: '',
              method: 'GET',
              path: '/empty',
              permission: '',
              parameters: [],
              responses: []
            }
          ]
        }
      ];

      const index = buildMetadataIndex(emptyDocuments);
      const responses = getAllResponses(index);

      expect(responses).toEqual([]);
    });
  });

  describe('Index Completeness', () => {
    it('should maintain consistency across all indexes', () => {
      const index = buildMetadataIndex(mockDocuments);

      // Count endpoints from all sources
      const fromAllEndpoints = index.allEndpoints.length;
      const fromResources = Array.from(index.resources.values()).reduce((sum, arr) => sum + arr.length, 0);
      const fromPaths = index.endpointsByPath.size;
      const fromPermissions = Array.from(index.endpointsByPermission.values()).reduce((sum, arr) => sum + arr.length, 0);
      const fromMethods = Array.from(index.endpointsByMethod.values()).reduce((sum, arr) => sum + arr.length, 0);

      expect(fromAllEndpoints).toBe(fromResources);
      expect(fromAllEndpoints).toBe(fromPaths);
      expect(fromAllEndpoints).toBe(fromPermissions);
      expect(fromAllEndpoints).toBe(fromMethods);
    });

    it('should handle endpoints with empty permissions', () => {
      const documentsWithEmptyPermission = [
        {
          resourceName: 'Test',
          endpoints: [
            {
              resource: 'Test',
              operation: 'Test Operation',
              description: '',
              method: 'GET',
              path: '/test',
              permission: '',
              parameters: [],
              responses: []
            }
          ]
        }
      ];

      const index = buildMetadataIndex(documentsWithEmptyPermission);

      expect(index.endpointsByPermission.size).toBe(0);
      expect(index.allEndpoints).toHaveLength(1);
    });
  });
});
