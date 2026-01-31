/**
 * TypeScript type definitions for parsed RepairShopr API documentation
 */

/**
 * Represents a single API endpoint with all its metadata
 */
export interface ApiEndpoint {
  /** The resource name (e.g., "Customer", "Ticket", "Invoice") */
  resource: string;
  /** The operation name (e.g., "Get Customers", "Create Ticket") */
  operation: string;
  /** Description of what the endpoint does */
  description: string;
  /** HTTP method (GET, POST, PUT, PATCH, DELETE) */
  method: string;
  /** API path (e.g., "/customers", "/tickets/{id}") */
  path: string;
  /** Required permission to access this endpoint */
  permission: string;
  /** Array of parameters for the endpoint */
  parameters: ApiParameter[];
  /** Optional request body parameters */
  requestBody?: ApiParameter[];
  /** Array of possible responses */
  responses: ApiResponse[];
}

/**
 * Represents a parameter for an API endpoint
 */
export interface ApiParameter {
  /** Parameter name */
  name: string;
  /** Parameter type (string, integer, boolean, array, object, number) */
  type: string;
  /** Whether the parameter is required */
  required: boolean;
  /** Description of the parameter */
  description: string;
  /** Parameter location (query, path, body) */
  paramType: 'query' | 'path' | 'body';
}

/**
 * Represents a response from an API endpoint
 */
export interface ApiResponse {
  /** HTTP status code */
  statusCode: number;
  /** Description of the response */
  description: string;
  /** Optional example response body */
  example?: any;
}

/**
 * Represents a complete API document file
 */
export interface ApiDocument {
  /** Name of the resource (extracted from file title) */
  resourceName: string;
  /** Array of endpoints in this document */
  endpoints: ApiEndpoint[];
}
