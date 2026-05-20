/**
 * Response reference tool for RepairShopr API documentation
 *
 * This module provides detailed information about API endpoint responses,
 * including lookup by endpoint, status code information, response schema and examples,
 * error response documentation, response format descriptions, and common response patterns.
 */

import { ApiResponse, ApiEndpoint } from '../utils/types';
import { MetadataIndex, getEndpointByPath } from '../parser/metadata';

/**
 * Status code information
 */
export interface StatusCodeInfo {
  /** HTTP status code */
  code: number;
  /** Status code category (1xx, 2xx, 3xx, 4xx, 5xx) */
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
  /** Standard status code name */
  name: string;
  /** Description of what this status code means */
  description: string;
  /** Whether this is a success response */
  isSuccess: boolean;
  /** Whether this is an error response */
  isError: boolean;
  /** Whether this is a redirect response */
  isRedirect: boolean;
}

/**
 * Response schema structure
 */
export interface ResponseSchema {
  /** Schema type (object, array, string, number, boolean, null) */
  type: string;
  /** Description of the schema */
  description?: string;
  /** Required properties (for object type) */
  required?: string[];
  /** Properties (for object type) */
  properties?: Record<string, ResponseSchema>;
  /** Items schema (for array type) */
  items?: ResponseSchema;
  /** Enum values (if constrained) */
  enum?: any[];
  /** Example value */
  example?: any;
}

/**
 * Error response documentation
 */
export interface ErrorResponseDocumentation {
  /** Error code or identifier */
  errorCode?: string;
  /** Error message */
  message: string;
  /** Error type (validation, authentication, authorization, not_found, server_error, etc.) */
  errorType: string;
  /** Detailed error description */
  details?: string;
  /** Suggested resolution */
  resolution?: string;
  /** HTTP status code */
  statusCode: number;
}

/**
 * Response format description
 */
export interface ResponseFormatDescription {
  /** Format name */
  name: string;
  /** Format description */
  description: string;
  /** Content type */
  contentType: string;
  /** Response structure */
  structure: string;
  /** Common fields */
  commonFields: string[];
}

/**
 * Common response pattern
 */
export interface ResponsePattern {
  /** Pattern name */
  name: string;
  /** Pattern description */
  description: string;
  /** Typical status codes for this pattern */
  statusCodes: number[];
  /** Common response structure */
  structure: string;
  /** Example use case */
  exampleUseCase: string;
}

/**
 * Detailed response information
 */
export interface ResponseDetail {
  /** HTTP status code */
  statusCode: number;
  /** Status code information */
  statusCodeInfo: StatusCodeInfo;
  /** Response description */
  description: string;
  /** Response example */
  example?: any;
  /** Response schema */
  schema?: ResponseSchema;
  /** Error documentation (for error responses) */
  errorDocumentation?: ErrorResponseDocumentation;
  /** Response format description */
  formatDescription?: ResponseFormatDescription;
  /** Common pattern (if applicable) */
  pattern?: ResponsePattern;
}

/**
 * Result of response lookup
 */
export interface ResponseLookupResult {
  /** Endpoint path */
  endpointPath: string;
  /** HTTP method */
  method: string;
  /** Array of response details */
  responses: ResponseDetail[];
  /** Total response count */
  totalCount: number;
  /** Success response count */
  successCount: number;
  /** Error response count */
  errorCount: number;
  /** Common patterns found */
  commonPatterns: ResponsePattern[];
}

/**
 * Parameters for response lookup
 */
export interface ResponseLookupParams {
  /** Endpoint path (e.g., /customers/{id}) */
  endpointPath: string;
  /** HTTP method (GET, POST, PUT, DELETE, PATCH) */
  method: string;
  /** Filter by status code (optional) */
  statusCode?: string;
}

/**
 * Standard HTTP status code information
 */
const STATUS_CODE_INFO: Record<number, StatusCodeInfo> = {
  100: {
    code: 100,
    category: '1xx',
    name: 'Continue',
    description:
      'The server has received the request headers and the client should proceed to send the request body',
    isSuccess: false,
    isError: false,
    isRedirect: false,
  },
  101: {
    code: 101,
    category: '1xx',
    name: 'Switching Protocols',
    description: 'The requester has asked the server to switch protocols',
    isSuccess: false,
    isError: false,
    isRedirect: false,
  },
  200: {
    code: 200,
    category: '2xx',
    name: 'OK',
    description: 'The request succeeded',
    isSuccess: true,
    isError: false,
    isRedirect: false,
  },
  201: {
    code: 201,
    category: '2xx',
    name: 'Created',
    description: 'The request succeeded and a new resource was created',
    isSuccess: true,
    isError: false,
    isRedirect: false,
  },
  202: {
    code: 202,
    category: '2xx',
    name: 'Accepted',
    description: 'The request has been accepted for processing',
    isSuccess: true,
    isError: false,
    isRedirect: false,
  },
  204: {
    code: 204,
    category: '2xx',
    name: 'No Content',
    description: 'The request succeeded but there is no content to return',
    isSuccess: true,
    isError: false,
    isRedirect: false,
  },
  301: {
    code: 301,
    category: '3xx',
    name: 'Moved Permanently',
    description: 'The resource has been moved to a new URL permanently',
    isSuccess: false,
    isError: false,
    isRedirect: true,
  },
  302: {
    code: 302,
    category: '3xx',
    name: 'Found',
    description: 'The resource has been temporarily moved to a different URL',
    isSuccess: false,
    isError: false,
    isRedirect: true,
  },
  304: {
    code: 304,
    category: '3xx',
    name: 'Not Modified',
    description: 'The resource has not been modified since the last request',
    isSuccess: false,
    isError: false,
    isRedirect: true,
  },
  400: {
    code: 400,
    category: '4xx',
    name: 'Bad Request',
    description:
      'The request could not be understood or was missing required parameters',
    isSuccess: false,
    isError: true,
    isRedirect: false,
  },
  401: {
    code: 401,
    category: '4xx',
    name: 'Unauthorized',
    description:
      'Authentication is required and has failed or has not been provided',
    isSuccess: false,
    isError: true,
    isRedirect: false,
  },
  403: {
    code: 403,
    category: '4xx',
    name: 'Forbidden',
    description:
      'The server understood the request but refuses to authorize it',
    isSuccess: false,
    isError: true,
    isRedirect: false,
  },
  404: {
    code: 404,
    category: '4xx',
    name: 'Not Found',
    description: 'The requested resource could not be found',
    isSuccess: false,
    isError: true,
    isRedirect: false,
  },
  405: {
    code: 405,
    category: '4xx',
    name: 'Method Not Allowed',
    description:
      'The request method is not supported for the requested resource',
    isSuccess: false,
    isError: true,
    isRedirect: false,
  },
  409: {
    code: 409,
    category: '4xx',
    name: 'Conflict',
    description: 'The request conflicts with the current state of the resource',
    isSuccess: false,
    isError: true,
    isRedirect: false,
  },
  422: {
    code: 422,
    category: '4xx',
    name: 'Unprocessable Entity',
    description:
      'The request was well-formed but was unable to be followed due to semantic errors',
    isSuccess: false,
    isError: true,
    isRedirect: false,
  },
  429: {
    code: 429,
    category: '4xx',
    name: 'Too Many Requests',
    description:
      'The user has sent too many requests in a given amount of time',
    isSuccess: false,
    isError: true,
    isRedirect: false,
  },
  500: {
    code: 500,
    category: '5xx',
    name: 'Internal Server Error',
    description: 'The server encountered an unexpected condition',
    isSuccess: false,
    isError: true,
    isRedirect: false,
  },
  502: {
    code: 502,
    category: '5xx',
    name: 'Bad Gateway',
    description:
      'The server received an invalid response from an upstream server',
    isSuccess: false,
    isError: true,
    isRedirect: false,
  },
  503: {
    code: 503,
    category: '5xx',
    name: 'Service Unavailable',
    description: 'The server is currently unavailable',
    isSuccess: false,
    isError: true,
    isRedirect: false,
  },
  504: {
    code: 504,
    category: '5xx',
    name: 'Gateway Timeout',
    description:
      'The server did not receive a timely response from an upstream server',
    isSuccess: false,
    isError: true,
    isRedirect: false,
  },
};

/**
 * Common response patterns recognized in the API
 */
const COMMON_PATTERNS: ResponsePattern[] = [
  {
    name: 'pagination',
    description: 'Paginated response with metadata about the result set',
    statusCodes: [200],
    structure: '{ data: [...], meta: { total, page, per_page, total_pages } }',
    exampleUseCase: 'GET /customers returns paginated list of customers',
  },
  {
    name: 'single_resource',
    description: 'Single resource object response',
    statusCodes: [200],
    structure: '{ id, name, ...other_fields }',
    exampleUseCase: 'GET /customers/{id} returns a single customer',
  },
  {
    name: 'created_resource',
    description: 'Newly created resource with ID',
    statusCodes: [201],
    structure: '{ id, name, ...other_fields, created_at }',
    exampleUseCase: 'POST /customers returns the created customer',
  },
  {
    name: 'validation_error',
    description: 'Validation error with field-specific messages',
    statusCodes: [422],
    structure:
      '{ error: "Validation failed", errors: { field_name: ["error message"] } }',
    exampleUseCase:
      'POST /customers with invalid data returns validation errors',
  },
  {
    name: 'authentication_error',
    description: 'Authentication failure response',
    statusCodes: [401],
    structure:
      '{ error: "Unauthorized", message: "Invalid or missing authentication" }',
    exampleUseCase: 'Request without valid API token returns 401',
  },
  {
    name: 'authorization_error',
    description: 'Authorization failure response',
    statusCodes: [403],
    structure:
      '{ error: "Forbidden", message: "You do not have permission to access this resource" }',
    exampleUseCase: 'Request with insufficient permissions returns 403',
  },
  {
    name: 'not_found_error',
    description: 'Resource not found response',
    statusCodes: [404],
    structure:
      '{ error: "Not Found", message: "The requested resource could not be found" }',
    exampleUseCase: 'GET /customers/{id} with non-existent ID returns 404',
  },
  {
    name: 'rate_limit_error',
    description: 'Rate limit exceeded response',
    statusCodes: [429],
    structure:
      '{ error: "Too Many Requests", message: "Rate limit exceeded", retry_after: 60 }',
    exampleUseCase: 'Too many requests in a short period returns 429',
  },
  {
    name: 'server_error',
    description: 'Internal server error response',
    statusCodes: [500, 502, 503, 504],
    structure:
      '{ error: "Internal Server Error", message: "An unexpected error occurred" }',
    exampleUseCase: 'Server-side error returns 5xx status code',
  },
  {
    name: 'no_content',
    description: 'Successful operation with no content to return',
    statusCodes: [204],
    structure: '(empty body)',
    exampleUseCase: 'DELETE /customers/{id} returns 204 on successful deletion',
  },
];

/**
 * Gets status code information for a given status code
 *
 * @param statusCode - HTTP status code
 * @returns Status code information
 */
function getStatusCodeInfo(statusCode: number): StatusCodeInfo {
  return (
    STATUS_CODE_INFO[statusCode] || {
      code: statusCode,
      category: `${Math.floor(statusCode / 100)}xx` as
        | '1xx'
        | '2xx'
        | '3xx'
        | '4xx'
        | '5xx',
      name: 'Unknown',
      description: `Status code ${statusCode}`,
      isSuccess: statusCode >= 200 && statusCode < 300,
      isError: statusCode >= 400,
      isRedirect: statusCode >= 300 && statusCode < 400,
    }
  );
}

/**
 * Extracts response schema from example data
 *
 * @param example - Example response data
 * @returns Response schema structure
 */
function extractSchemaFromExample(example: any): ResponseSchema | undefined {
  if (!example) {
    return undefined;
  }

  if (Array.isArray(example)) {
    return {
      type: 'array',
      description: 'Array of items',
      items:
        example.length > 0
          ? extractSchemaFromExample(example[0])
          : { type: 'object' },
    };
  }

  if (typeof example === 'object' && example !== null) {
    const properties: Record<string, ResponseSchema> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(example)) {
      properties[key] = extractSchemaFromExample(value) || {
        type: typeof value,
      };
      if (value !== null && value !== undefined) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      description: 'Object with properties',
      properties,
      required,
    };
  }

  return {
    type: typeof example,
    description: `Value of type ${typeof example}`,
    example,
  };
}

/**
 * Extracts error documentation from an error response
 *
 * @param response - API response
 * @param statusCode - HTTP status code
 * @returns Error response documentation or undefined
 */
function extractErrorDocumentation(
  response: ApiResponse,
  statusCode: number
): ErrorResponseDocumentation | undefined {
  // Only extract error documentation for error status codes
  if (statusCode < 400) {
    return undefined;
  }

  const errorType = getErrorType(statusCode);
  const errorDocumentation: ErrorResponseDocumentation = {
    statusCode,
    errorType,
    message: response.description || 'An error occurred',
  };

  // Extract error details from example if available
  if (response.example && typeof response.example === 'object') {
    const example = response.example as any;

    if (example.error) {
      errorDocumentation.errorCode = example.error;
    }

    if (example.message) {
      errorDocumentation.message = example.message;
    }

    if (example.details) {
      errorDocumentation.details = example.details;
    }

    if (example.resolution) {
      errorDocumentation.resolution = example.resolution;
    }
  }

  // Add default resolution based on error type
  if (!errorDocumentation.resolution) {
    errorDocumentation.resolution = getDefaultResolution(errorType);
  }

  return errorDocumentation;
}

/**
 * Gets error type based on status code
 *
 * @param statusCode - HTTP status code
 * @returns Error type string
 */
function getErrorType(statusCode: number): string {
  if (statusCode === 400) return 'bad_request';
  if (statusCode === 401) return 'authentication';
  if (statusCode === 403) return 'authorization';
  if (statusCode === 404) return 'not_found';
  if (statusCode === 405) return 'method_not_allowed';
  if (statusCode === 409) return 'conflict';
  if (statusCode === 422) return 'validation';
  if (statusCode === 429) return 'rate_limit';
  if (statusCode >= 500) return 'server_error';
  return 'unknown_error';
}

/**
 * Gets default resolution for an error type
 *
 * @param errorType - Error type
 * @returns Default resolution message
 */
function getDefaultResolution(errorType: string): string {
  const resolutions: Record<string, string> = {
    bad_request:
      'Check the request parameters and ensure all required fields are provided with valid values',
    authentication:
      'Provide valid authentication credentials (API key or token)',
    authorization:
      'Ensure you have the necessary permissions to access this resource',
    not_found: 'Verify the resource ID is correct and the resource exists',
    method_not_allowed: 'Use the correct HTTP method for this endpoint',
    conflict:
      'The request conflicts with the current state. Check for duplicate resources or concurrent modifications',
    validation: 'Review the validation errors and correct the invalid fields',
    rate_limit:
      'Wait before making another request or implement exponential backoff',
    server_error:
      'Try the request again later. If the problem persists, contact support',
    unknown_error: 'Review the error details and try again',
  };

  return resolutions[errorType] || 'Review the error details and try again';
}

/**
 * Gets response format description based on status code and example
 *
 * @param statusCode - HTTP status code
 * @param example - Example response data
 * @returns Response format description
 */
function getResponseFormatDescription(
  statusCode: number,
  example?: any
): ResponseFormatDescription | undefined {
  if (statusCode === 204) {
    return {
      name: 'no_content',
      description: 'Empty response body',
      contentType: 'application/json',
      structure: '(empty)',
      commonFields: [],
    };
  }

  if (!example) {
    return undefined;
  }

  if (Array.isArray(example)) {
    return {
      name: 'array',
      description: 'Array of items',
      contentType: 'application/json',
      structure: '[...items]',
      commonFields: ['data'],
    };
  }

  if (typeof example === 'object' && example !== null) {
    const fields = Object.keys(example);
    const hasData = 'data' in example;
    const hasMeta = 'meta' in example;
    const hasError = 'error' in example;

    if (hasData && hasMeta) {
      return {
        name: 'paginated',
        description: 'Paginated response with metadata',
        contentType: 'application/json',
        structure: '{ data: [...], meta: {...} }',
        commonFields: ['data', 'meta'],
      };
    }

    if (hasError) {
      return {
        name: 'error',
        description: 'Error response',
        contentType: 'application/json',
        structure: '{ error: "...", message: "..." }',
        commonFields: ['error', 'message'],
      };
    }

    return {
      name: 'object',
      description: 'Single object response',
      contentType: 'application/json',
      structure: '{ ...fields }',
      commonFields: fields,
    };
  }

  return {
    name: 'primitive',
    description: 'Primitive value response',
    contentType: 'application/json',
    structure: typeof example,
    commonFields: [],
  };
}

/**
 * Identifies common response pattern for a response
 *
 * @param statusCode - HTTP status code
 * @param example - Example response data
 * @returns Matching pattern or undefined
 */
function identifyResponsePattern(
  statusCode: number,
  example?: any
): ResponsePattern | undefined {
  // First try to match by status code
  const patternsByStatusCode = COMMON_PATTERNS.filter((p) =>
    p.statusCodes.includes(statusCode)
  );

  if (patternsByStatusCode.length === 1) {
    return patternsByStatusCode[0];
  }

  // If multiple patterns match, try to refine by example structure
  if (example && patternsByStatusCode.length > 1) {
    if (Array.isArray(example)) {
      return patternsByStatusCode.find((p) => p.name === 'pagination');
    }

    if (typeof example === 'object' && example !== null) {
      const hasData = 'data' in example;
      const hasMeta = 'meta' in example;
      const hasError = 'error' in example;

      if (hasData && hasMeta) {
        return patternsByStatusCode.find((p) => p.name === 'pagination');
      }

      if (hasError) {
        return patternsByStatusCode.find((p) => p.name.includes('error'));
      }
    }
  }

  // Return first matching pattern if any
  return patternsByStatusCode[0];
}

/**
 * Converts an ApiResponse to a ResponseDetail
 *
 * @param response - The response to convert
 * @returns Detailed response information
 */
function toResponseDetail(response: ApiResponse): ResponseDetail {
  const statusCodeInfo = getStatusCodeInfo(response.statusCode);
  const schema = response.example
    ? extractSchemaFromExample(response.example)
    : undefined;
  const errorDocumentation = extractErrorDocumentation(
    response,
    response.statusCode
  );
  const formatDescription = getResponseFormatDescription(
    response.statusCode,
    response.example
  );
  const pattern = identifyResponsePattern(
    response.statusCode,
    response.example
  );

  return {
    statusCode: response.statusCode,
    statusCodeInfo,
    description: response.description,
    example: response.example,
    schema,
    errorDocumentation,
    formatDescription,
    pattern,
  };
}

/**
 * Gets responses for a specific endpoint
 *
 * This function retrieves all responses for a given endpoint, optionally
 * filtered by status code. It includes detailed information about each
 * response including status code information, schema, error documentation,
 * format descriptions, and common patterns.
 *
 * @param params - Lookup parameters
 * @param index - Metadata index for searching
 * @returns Response lookup result or null if endpoint not found
 *
 * @example
 * ```typescript
 * // Get all responses for an endpoint
 * const result = getResponses(
 *   { endpointPath: '/customers/{id}', method: 'GET' },
 *   metadataIndex
 * );
 *
 * // Get only 200 responses
 * const successResponses = getResponses(
 *   { endpointPath: '/customers/{id}', method: 'GET', statusCode: '200' },
 *   metadataIndex
 * );
 * ```
 */
export function getResponses(
  params: ResponseLookupParams,
  index: MetadataIndex
): ResponseLookupResult | null {
  const { endpointPath, method, statusCode } = params;

  // Validate required parameters
  if (!endpointPath || !method) {
    throw new Error('endpointPath and method are required parameters');
  }

  // Lookup endpoint by path and method
  const endpoint = getEndpointByPath(index, endpointPath, method.toUpperCase());

  if (!endpoint) {
    return null;
  }

  // Filter responses by status code if specified
  let filteredResponses = endpoint.responses;
  if (statusCode) {
    const codeNum = parseInt(statusCode, 10);
    if (isNaN(codeNum)) {
      throw new Error('statusCode must be a valid number');
    }
    filteredResponses = endpoint.responses.filter(
      (r) => r.statusCode === codeNum
    );
  }

  // Convert to detailed response information
  const responseDetails = filteredResponses.map(toResponseDetail);

  // Calculate statistics
  const totalCount = responseDetails.length;
  const successCount = responseDetails.filter(
    (r) => r.statusCodeInfo.isSuccess
  ).length;
  const errorCount = responseDetails.filter(
    (r) => r.statusCodeInfo.isError
  ).length;

  // Identify common patterns across all responses
  const patternsSet = new Set<ResponsePattern>();
  responseDetails.forEach((r) => {
    if (r.pattern) {
      patternsSet.add(r.pattern);
    }
  });
  const commonPatterns = Array.from(patternsSet);

  return {
    endpointPath,
    method: method.toUpperCase(),
    responses: responseDetails,
    totalCount,
    successCount,
    errorCount,
    commonPatterns,
  };
}

/**
 * Gets all common response patterns
 *
 * @returns Array of common response patterns
 */
export function getCommonPatterns(): ResponsePattern[] {
  return [...COMMON_PATTERNS];
}

/**
 * Gets status code information for a specific status code
 *
 * @param statusCode - HTTP status code
 * @returns Status code information
 */
export function getStatusInfo(statusCode: number): StatusCodeInfo {
  return getStatusCodeInfo(statusCode);
}

/**
 * Identifies responses matching a specific pattern
 *
 * @param endpoint - The endpoint to analyze
 * @param patternName - The pattern name to match
 * @returns Array of matching responses
 */
export function getResponsesByPattern(
  endpoint: ApiEndpoint,
  patternName: string
): ResponseDetail[] {
  const pattern = COMMON_PATTERNS.find((p) => p.name === patternName);

  if (!pattern) {
    return [];
  }

  return endpoint.responses
    .filter((r) => pattern.statusCodes.includes(r.statusCode))
    .map(toResponseDetail)
    .filter((r) => r.pattern?.name === patternName);
}
