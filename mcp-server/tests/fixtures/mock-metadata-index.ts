/**
 * Mock metadata index for testing
 */

import { MetadataIndex } from '../../src/parser/metadata';
import { ApiDocument, ApiEndpoint } from '../../src/utils/types';

export const mockEndpoints: ApiEndpoint[] = [
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
      },
      {
        name: 'sort',
        type: 'string',
        required: false,
        description: 'Sort field (name, created_at, etc.)',
        paramType: 'query'
      },
      {
        name: 'query',
        type: 'string',
        required: false,
        description: 'Search query for filtering',
        paramType: 'query'
      }
    ],
    responses: [
      {
        statusCode: 200,
        description: 'Successful response',
        example: {
          customers: [
            {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              phone: '555-1234',
              created_at: '2024-01-01T00:00:00Z'
            }
          ],
          meta: {
            total: 1,
            page: 1,
            per_page: 20
          }
        }
      },
      {
        statusCode: 401,
        description: 'Unauthorized',
        example: {
          error: 'Unauthorized',
          message: 'Invalid or missing authentication token'
        }
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
        example: {
          customer: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-1234',
            created_at: '2024-01-01T00:00:00Z'
          }
        }
      },
      {
        statusCode: 404,
        description: 'Not found',
        example: {
          error: 'Not Found',
          message: 'The requested customer could not be found'
        }
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
      },
      {
        name: 'phone',
        type: 'string',
        required: false,
        description: 'Customer phone number',
        paramType: 'body'
      }
    ],
    responses: [
      {
        statusCode: 201,
        description: 'Customer created successfully',
        example: {
          customer: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-1234',
            created_at: '2024-01-01T00:00:00Z'
          }
        }
      },
      {
        statusCode: 422,
        description: 'Validation error',
        example: {
          error: 'Validation Failed',
          message: 'The request could not be validated',
          errors: {
            name: ['Name is required'],
            email: ['Invalid email format']
          }
        }
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
      },
      {
        name: 'email',
        type: 'string',
        required: false,
        description: 'Customer email address',
        paramType: 'body'
      }
    ],
    responses: [
      {
        statusCode: 200,
        description: 'Customer updated successfully',
        example: {
          customer: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com'
          }
        }
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
      },
      {
        statusCode: 404,
        description: 'Not found',
        example: {
          error: 'Not Found',
          message: 'The requested customer could not be found'
        }
      }
    ]
  },
  {
    resource: 'Ticket',
    operation: 'Get Tickets',
    description: 'Retrieve a list of all tickets',
    method: 'GET',
    path: '/tickets',
    permission: 'ticket.view',
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
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Filter by ticket status',
        paramType: 'query'
      },
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
        example: {
          tickets: [
            {
              id: 1,
              subject: 'Support Request',
              status: 'open',
              customer_id: 1,
              created_at: '2024-01-01T00:00:00Z'
            }
          ]
        }
      }
    ]
  },
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
        example: {
          ticket: {
            id: 1,
            subject: 'Support Request',
            status: 'open',
            customer_id: 1,
            created_at: '2024-01-01T00:00:00Z'
          }
        }
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
      },
      {
        name: 'description',
        type: 'string',
        required: true,
        description: 'Ticket description',
        paramType: 'body'
      },
      {
        name: 'customer_id',
        type: 'integer',
        required: true,
        description: 'Customer ID',
        paramType: 'body'
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Initial ticket status',
        paramType: 'body'
      }
    ],
    responses: [
      {
        statusCode: 201,
        description: 'Ticket created successfully',
        example: {
          ticket: {
            id: 1,
            subject: 'Support Request',
            status: 'open',
            customer_id: 1,
            created_at: '2024-01-01T00:00:00Z'
          }
        }
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
      },
      {
        name: 'subject',
        type: 'string',
        required: false,
        description: 'Updated subject',
        paramType: 'body'
      }
    ],
    responses: [
      {
        statusCode: 200,
        description: 'Ticket updated successfully',
        example: {
          ticket: {
            id: 1,
            subject: 'Updated Subject',
            status: 'closed'
          }
        }
      }
    ]
  },
  {
    resource: 'Invoice',
    operation: 'Get Invoices',
    description: 'Retrieve a list of all invoices',
    method: 'GET',
    path: '/invoices',
    permission: 'invoice.view',
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
      },
      {
        name: 'customer_id',
        type: 'integer',
        required: false,
        description: 'Filter by customer ID',
        paramType: 'query'
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Filter by invoice status',
        paramType: 'query'
      }
    ],
    responses: [
      {
        statusCode: 200,
        description: 'Successful response',
        example: {
          invoices: [
            {
              id: 1,
              number: 'INV-001',
              customer_id: 1,
              total: 100.00,
              status: 'paid',
              created_at: '2024-01-01T00:00:00Z'
            }
          ]
        }
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
      },
      {
        name: 'total',
        type: 'number',
        required: true,
        description: 'Invoice total',
        paramType: 'body'
      }
    ],
    responses: [
      {
        statusCode: 201,
        description: 'Invoice created successfully',
        example: {
          invoice: {
            id: 1,
            number: 'INV-001',
            customer_id: 1,
            total: 100.00,
            status: 'pending'
          }
        }
      }
    ]
  }
];

export const mockDocuments: ApiDocument[] = [
  {
    resourceName: 'Customer',
    endpoints: mockEndpoints.filter(e => e.resource === 'Customer')
  },
  {
    resourceName: 'Ticket',
    endpoints: mockEndpoints.filter(e => e.resource === 'Ticket')
  },
  {
    resourceName: 'Invoice',
    endpoints: mockEndpoints.filter(e => e.resource === 'Invoice')
  }
];

export const mockMetadataIndex: MetadataIndex = {
  resources: new Map([
    ['Customer', mockEndpoints.filter(e => e.resource === 'Customer')],
    ['Ticket', mockEndpoints.filter(e => e.resource === 'Ticket')],
    ['Invoice', mockEndpoints.filter(e => e.resource === 'Invoice')]
  ]),
  endpointsByPath: new Map(
    mockEndpoints.map(e => [`${e.method}:${e.path}`, e] as [string, ApiEndpoint])
  ),
  endpointsByPermission: new Map([
    ['customer.view', mockEndpoints.filter(e => e.permission === 'customer.view')],
    ['customer.create', mockEndpoints.filter(e => e.permission === 'customer.create')],
    ['customer.update', mockEndpoints.filter(e => e.permission === 'customer.update')],
    ['customer.delete', mockEndpoints.filter(e => e.permission === 'customer.delete')],
    ['ticket.view', mockEndpoints.filter(e => e.permission === 'ticket.view')],
    ['ticket.create', mockEndpoints.filter(e => e.permission === 'ticket.create')],
    ['ticket.update', mockEndpoints.filter(e => e.permission === 'ticket.update')],
    ['invoice.view', mockEndpoints.filter(e => e.permission === 'invoice.view')],
    ['invoice.create', mockEndpoints.filter(e => e.permission === 'invoice.create')]
  ]),
  endpointsByMethod: new Map([
    ['GET', mockEndpoints.filter(e => e.method === 'GET')],
    ['POST', mockEndpoints.filter(e => e.method === 'POST')],
    ['PUT', mockEndpoints.filter(e => e.method === 'PUT')],
    ['DELETE', mockEndpoints.filter(e => e.method === 'DELETE')]
  ]),
  allEndpoints: mockEndpoints
};
