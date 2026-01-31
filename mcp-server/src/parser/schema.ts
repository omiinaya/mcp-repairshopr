/**
 * Schema definition for parsed RepairShopr API documentation
 * 
 * This module defines the structure and validation rules for API documentation
 * parsed from markdown files in the docs/api/ directory.
 */

export {
  ApiEndpoint,
  ApiParameter,
  ApiResponse,
  ApiDocument
} from '../utils/types';

/**
 * Represents a single API endpoint with all its metadata
 * 
 * @remarks
 * This interface captures all the essential information about an API endpoint
 * extracted from the markdown documentation files.
 * 
 * @example
 * ```typescript
 * const endpoint: ApiEndpoint = {
 *   resource: "Customer",
 *   operation: "Get Customers",
 *   description: "Returns a paginated list of customers",
 *   method: "GET",
 *   path: "/customers",
 *   permission: "Required permission: Customers - List/Search",
 *   parameters: [
 *     {
 *       name: "page",
 *       type: "integer",
 *       required: false,
 *       description: "Returns provided page of results",
 *       paramType: "query"
 *     }
 *   ],
 *   responses: [
 *     {
 *       statusCode: 200,
 *       description: "successful",
 *       example: { customers: [...] }
 *     }
 *   ]
 * };
 * ```
 */
export interface ApiEndpoint {
  /**
   * The resource name extracted from the file header
   * 
   * @remarks
   * Expected markdown format: `# RepairShopr API Documentation - [Resource Name]`
   * 
   * Validation rules:
   * - Must be a non-empty string
   * - Must start with an uppercase letter
   * - Can contain spaces and hyphens
   * 
   * Examples: "Customer", "Appointment Type", "Ticket Timer"
   */
  resource: string;

  /**
   * The operation name extracted from the fourth-level header
   * 
   * @remarks
   * Expected markdown format: `#### [Operation Name]`
   * 
   * Validation rules:
   * - Must be a non-empty string
   * - Typically follows pattern: "[Verb] [Resource]" (e.g., "Get Customers", "Create Ticket")
   * - Can be "Get", "Create", "Update", "Delete", or custom action names
   * 
   * Examples: "Get Customers", "Create Ticket", "Update Appointment", "Delete Invoice"
   */
  operation: string;

  /**
   * Description of what the endpoint does
   * 
   * @remarks
   * Expected markdown format: Text between `#### [Operation Name]` and `**Endpoint:**` line
   * 
   * Validation rules:
   * - Can be empty string (some endpoints have no description)
   * - Can span multiple lines
   * - May include permission notes and restrictions
   * 
   * Examples: "Returns a paginated list of customers", "Creates a new Ticket"
   */
  description: string;

  /**
   * HTTP method for the endpoint
   * 
   * @remarks
   * Expected markdown format: `**Endpoint:** `METHOD /path``
   * 
   * Validation rules:
   * - Must be one of: "GET", "POST", "PUT", "PATCH", "DELETE"
   * - Must be uppercase
   * 
   * Examples: "GET", "POST", "PUT", "PATCH", "DELETE"
   */
  method: string;

  /**
   * API path including path parameters
   * 
   * @remarks
   * Expected markdown format: `**Endpoint:** `METHOD /path``
   * 
   * Validation rules:
   * - Must start with "/"
   * - Can contain path parameters in format `{parameter_name}`
   * - Can be nested (e.g., `/customers/{id}/phones`)
   * 
   * Examples: "/customers", "/tickets/{id}", "/customers/{customer_id}/phones"
   */
  path: string;

  /**
   * Required permission to access this endpoint
   * 
   * @remarks
   * Expected markdown format: `**Required Permission:** [permission text]`
   * 
   * Validation rules:
   * - Can be "No special permissions required." or "Required permission: None"
   * - Can be single permission: "Required permission: Global Admin"
   * - Can be multiple permissions: "Required permissions: \"A\" and \"B\""
   * - Can include conditional notes
   * 
   * Examples: "Required permission: Customers - List/Search", "No special permissions required."
   */
  permission: string;

  /**
   * Array of parameters for the endpoint
   * 
   * @remarks
   * Parameters are extracted from markdown tables under:
   * - `**Query Parameters:**` header (paramType: 'query')
   * - `**Path Parameters:**` header (paramType: 'path')
   * - `**Request Body:**` header (paramType: 'body')
   * 
   * Validation rules:
   * - Can be empty array (endpoints with no parameters)
   * - Each parameter must have valid name, type, required flag, and description
   * - Path parameters must match {parameter_name} in the path
   * 
   * @see ApiParameter
   */
  parameters: ApiParameter[];

  /**
   * Optional request body parameters
   * 
   * @remarks
   * Extracted from the `**Request Body:**` markdown table
   * 
   * Validation rules:
   * - Optional (may be undefined for GET/DELETE endpoints)
   * - Only present for POST, PUT, PATCH endpoints
   * - Same structure as parameters but always paramType: 'body'
   * 
   * @see ApiParameter
   */
  requestBody?: ApiParameter[];

  /**
   * Array of possible responses from the endpoint
   * 
   * @remarks
   * Extracted from `**Response: [Code]**` sections
   * 
   * Validation rules:
   * - Must have at least one response (usually 200)
   * - Common status codes: 200, 201, 204, 401, 404, 422
   * - Each response must have statusCode and description
   * - Example is optional (some responses have no JSON body)
   * 
   * @see ApiResponse
   */
  responses: ApiResponse[];
}

/**
 * Represents a parameter for an API endpoint
 * 
 * @remarks
 * Parameters are extracted from markdown tables with the structure:
 * | Parameter | Type | Required | Description |
 * |-----------|------|----------|-------------|
 * | name | type | Yes/No | description |
 * 
 * @example
 * ```typescript
 * const parameter: ApiParameter = {
 *   name: "page",
 *   type: "integer",
 *   required: false,
 *   description: "Returns provided page of results, each 'page' contains 25 results",
 *   paramType: "query"
 * };
 * ```
 */
export interface ApiParameter {
  /**
   * Parameter name
   * 
   * @remarks
   * Expected markdown format: First column of parameter table
   * 
   * Validation rules:
   * - Must be a non-empty string
   * - Must be a valid identifier (alphanumeric, underscores, hyphens)
   * - For path parameters, must match {parameter_name} in the endpoint path
   * 
   * Examples: "page", "customer_id", "id", "sort", "query"
   */
  name: string;

  /**
   * Parameter data type
   * 
   * @remarks
   * Expected markdown format: Second column of parameter table
   * 
   * Validation rules:
   * - Must be one of: "string", "integer", "boolean", "array", "object", "number"
   * - Case-sensitive (must be lowercase)
   * 
   * Examples: "string", "integer", "boolean", "array", "object", "number"
   */
  type: string;

  /**
   * Whether the parameter is required
   * 
   * @remarks
   * Expected markdown format: Third column of parameter table ("Yes" or "No")
   * 
   * Validation rules:
   * - Must be a boolean
   * - "Yes" in markdown → true
   * - "No" in markdown → false
   * 
   * Examples: true (required), false (optional)
   */
  required: boolean;

  /**
   * Description of the parameter
   * 
   * @remarks
   * Expected markdown format: Fourth column of parameter table
   * 
   * Validation rules:
   * - Can be empty string (some parameters have no description)
   * - Can include examples and additional context
   * 
   * Examples: "Returns provided page of results", "Any customers with ID included in the list"
   */
  description: string;

  /**
   * Parameter location in the HTTP request
   * 
   * @remarks
   * Determined by which section the parameter table appears under:
   * - `**Query Parameters:**` → "query"
   * - `**Path Parameters:**` → "path"
   * - `**Request Body:**` → "body"
   * 
   * Validation rules:
   * - Must be one of: "query", "path", "body"
   * - Path parameters must have corresponding {parameter_name} in endpoint path
   * - Query parameters appear in URL query string
   * - Body parameters appear in request body (JSON)
   * 
   * Examples: "query", "path", "body"
   */
  paramType: 'query' | 'path' | 'body';
}

/**
 * Represents a response from an API endpoint
 * 
 * @remarks
 * Responses are extracted from sections with format:
 * **Response: [Code]**
 * 
 * [description]
 * 
 * ```json
 * {example}
 * ```
 * 
 * @example
 * ```typescript
 * const response: ApiResponse = {
 *   statusCode: 200,
 *   description: "successful",
 *   example: {
 *     customers: [
 *       {
 *         id: 1,
 *         firstname: "John",
 *         lastname: "Doe"
 *       }
 *     ]
 *   }
 * };
 * ```
 */
export interface ApiResponse {
  /**
   * HTTP status code
   * 
   * @remarks
   * Expected markdown format: `**Response: [Code]**`
   * 
   * Validation rules:
   * - Must be a valid HTTP status code (100-599)
   * - Common codes: 200 (OK), 201 (Created), 204 (No Content), 401 (Unauthorized), 404 (Not Found), 422 (Unprocessable Entity)
   * - Must be a number
   * 
   * Examples: 200, 201, 204, 401, 404, 422
   */
  statusCode: number;

  /**
   * Description of the response
   * 
   * @remarks
   * Expected markdown format: Text between `**Response: [Code]**` and JSON code block
   * 
   * Validation rules:
   * - Can be empty string (some responses have minimal description)
   * - Typically one or two words (e.g., "successful", "Invalid request")
   * 
   * Examples: "successful", "Invalid request", "Not found", "Requires permission"
   */
  description: string;

  /**
   * Optional example response body
   * 
   * @remarks
   * Expected markdown format: JSON code block after response description
   * 
   * Validation rules:
   * - Optional (may be undefined for responses with no body)
   * - Must be valid JSON when present
   * - Can be any JSON structure (object, array, string, etc.)
   * - Some responses (like 204 No Content) have no example
   * 
   * Examples: { customers: [...] }, { error: "Not authorized" }
   */
  example?: any;
}

/**
 * Represents a complete API document file
 * 
 * @remarks
 * Each markdown file in docs/api/ represents one ApiDocument containing
 * multiple endpoints for a single resource.
 * 
 * @example
 * ```typescript
 * const document: ApiDocument = {
 *   resourceName: "Customer",
 *   endpoints: [
 *     {
 *       resource: "Customer",
 *       operation: "Get Customers",
 *       description: "Returns a paginated list of customers",
 *       method: "GET",
 *       path: "/customers",
 *       permission: "Required permission: Customers - List/Search",
 *       parameters: [...],
 *       responses: [...]
 *     },
 *     {
 *       resource: "Customer",
 *       operation: "Create Customer",
 *       description: "Creates a Customer",
 *       method: "POST",
 *       path: "/customers",
 *       permission: "Required permission: Customers - Create",
 *       parameters: [],
 *       requestBody: [...],
 *       responses: [...]
 *     }
 *   ]
 * };
 * ```
 */
export interface ApiDocument {
  /**
   * Name of the resource extracted from the file header
   * 
   * @remarks
   * Expected markdown format: `# RepairShopr API Documentation - [Resource Name]`
   * 
   * Validation rules:
   * - Must be a non-empty string
   * - Must match the resource name in all endpoints within the document
   * - Typically singular form (e.g., "Customer" not "Customers")
   * 
   * Examples: "Customer", "Ticket", "Invoice", "Appointment Type"
   */
  resourceName: string;

  /**
   * Array of endpoints in this document
   * 
   * @remarks
   * All endpoints extracted from the markdown file
   * 
   * Validation rules:
   * - Must have at least one endpoint
   * - All endpoints must have the same resource name
   * - Each endpoint must have valid method, path, permission, and responses
   * 
   * @see ApiEndpoint
   */
  endpoints: ApiEndpoint[];
}

/**
 * Validation utility functions for parsed API documentation
 */
export const ApiDocumentValidation = {
  /**
   * Validates an ApiEndpoint object
   * 
   * @param endpoint - The endpoint to validate
   * @returns True if valid, false otherwise
   */
  validateEndpoint(endpoint: ApiEndpoint): boolean {
    // Check required fields
    if (!endpoint.resource || typeof endpoint.resource !== 'string') return false;
    if (!endpoint.operation || typeof endpoint.operation !== 'string') return false;
    if (!endpoint.method || typeof endpoint.method !== 'string') return false;
    if (!endpoint.path || typeof endpoint.path !== 'string') return false;
    if (!endpoint.permission || typeof endpoint.permission !== 'string') return false;
    if (!Array.isArray(endpoint.parameters)) return false;
    if (!Array.isArray(endpoint.responses) || endpoint.responses.length === 0) return false;

    // Validate method
    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    if (!validMethods.includes(endpoint.method)) return false;

    // Validate path
    if (!endpoint.path.startsWith('/')) return false;

    // Validate parameters
    for (const param of endpoint.parameters) {
      if (!this.validateParameter(param)) return false;
    }

    // Validate request body if present
    if (endpoint.requestBody) {
      if (!Array.isArray(endpoint.requestBody)) return false;
      for (const param of endpoint.requestBody) {
        if (!this.validateParameter(param)) return false;
      }
    }

    // Validate responses
    for (const response of endpoint.responses) {
      if (!this.validateResponse(response)) return false;
    }

    return true;
  },

  /**
   * Validates an ApiParameter object
   * 
   * @param parameter - The parameter to validate
   * @returns True if valid, false otherwise
   */
  validateParameter(parameter: ApiParameter): boolean {
    if (!parameter.name || typeof parameter.name !== 'string') return false;
    if (!parameter.type || typeof parameter.type !== 'string') return false;
    if (typeof parameter.required !== 'boolean') return false;
    if (!parameter.description || typeof parameter.description !== 'string') return false;
    
    const validTypes = ['string', 'integer', 'boolean', 'array', 'object', 'number'];
    if (!validTypes.includes(parameter.type)) return false;
    
    const validParamTypes = ['query', 'path', 'body'];
    if (!validParamTypes.includes(parameter.paramType)) return false;

    return true;
  },

  /**
   * Validates an ApiResponse object
   * 
   * @param response - The response to validate
   * @returns True if valid, false otherwise
   */
  validateResponse(response: ApiResponse): boolean {
    if (typeof response.statusCode !== 'number') return false;
    if (response.statusCode < 100 || response.statusCode > 599) return false;
    if (!response.description || typeof response.description !== 'string') return false;
    
    // Example is optional, but if present should be valid
    if (response.example !== undefined) {
      // We can't deeply validate arbitrary JSON, but we can check it's not null/undefined
      if (response.example === null) return false;
    }

    return true;
  },

  /**
   * Validates an ApiDocument object
   * 
   * @param document - The document to validate
   * @returns True if valid, false otherwise
   */
  validateDocument(document: ApiDocument): boolean {
    if (!document.resourceName || typeof document.resourceName !== 'string') return false;
    if (!Array.isArray(document.endpoints) || document.endpoints.length === 0) return false;

    // All endpoints should have the same resource name
    for (const endpoint of document.endpoints) {
      if (endpoint.resource !== document.resourceName) return false;
      if (!this.validateEndpoint(endpoint)) return false;
    }

    return true;
  }
};
