/**
 * Parameter reference tool for RepairShopr API documentation
 *
 * This module provides detailed information about API endpoint parameters,
 * including lookup by endpoint, parameter type and constraint information,
 * required/optional status, parameter description and examples, validation hints,
 * and common parameter patterns.
 */

import { ApiParameter, ApiEndpoint } from '../utils/types';
import { MetadataIndex, getEndpointByPath } from '../parser/metadata';

/**
 * Parameter constraint information
 */
export interface ParameterConstraints {
  /** Minimum value for numeric parameters */
  min?: number;
  /** Maximum value for numeric parameters */
  max?: number;
  /** Pattern for string parameters (regex) */
  pattern?: string;
  /** Enum values for constrained parameters */
  enum?: string[];
  /** Minimum length for string parameters */
  minLength?: number;
  /** Maximum length for string parameters */
  maxLength?: number;
}

/**
 * Parameter validation hints
 */
export interface ParameterValidationHints {
  /** Suggested validation approach */
  validationType:
    | 'none'
    | 'required'
    | 'type'
    | 'range'
    | 'pattern'
    | 'enum'
    | 'custom';
  /** Validation message or description */
  message: string;
  /** Example of valid value */
  example?: string;
  /** Example of invalid value */
  invalidExample?: string;
}

/**
 * Common parameter pattern
 */
export interface ParameterPattern {
  /** Pattern name */
  name: string;
  /** Pattern description */
  description: string;
  /** Common parameter names for this pattern */
  commonNames: string[];
  /** Typical parameter type */
  type: string;
  /** Typical parameter location */
  paramType: 'query' | 'path' | 'body';
}

/**
 * Detailed parameter information
 */
export interface ParameterDetail {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: string;
  /** Whether the parameter is required */
  required: boolean;
  /** Parameter description */
  description: string;
  /** Parameter location (query, path, body) */
  paramType: 'query' | 'path' | 'body';
  /** Constraint information */
  constraints: ParameterConstraints;
  /** Validation hints */
  validationHints: ParameterValidationHints;
  /** Common pattern (if applicable) */
  pattern?: ParameterPattern;
}

/**
 * Result of parameter lookup
 */
export interface ParameterLookupResult {
  /** Endpoint path */
  endpointPath: string;
  /** HTTP method */
  method: string;
  /** Array of parameter details */
  parameters: ParameterDetail[];
  /** Total parameter count */
  totalCount: number;
  /** Required parameter count */
  requiredCount: number;
  /** Optional parameter count */
  optionalCount: number;
}

/**
 * Parameters for parameter lookup
 */
export interface ParameterLookupParams {
  /** Endpoint path (e.g., /customers/{id}) */
  endpointPath: string;
  /** HTTP method (GET, POST, PUT, DELETE, PATCH) */
  method: string;
  /** Filter by parameter type (query, path, body) */
  paramType?: 'query' | 'path' | 'body';
}

/**
 * Common parameter patterns recognized in the API
 */
const COMMON_PATTERNS: ParameterPattern[] = [
  {
    name: 'pagination',
    description: 'Pagination parameters for controlling result sets',
    commonNames: ['page', 'limit', 'per_page', 'offset', 'page_size'],
    type: 'integer',
    paramType: 'query',
  },
  {
    name: 'sorting',
    description: 'Sorting parameters for ordering results',
    commonNames: ['sort', 'order', 'sort_by', 'sort_field', 'sort_direction'],
    type: 'string',
    paramType: 'query',
  },
  {
    name: 'filtering',
    description: 'Filtering parameters for narrowing results',
    commonNames: ['filter', 'search', 'q', 'query', 'status', 'state', 'type'],
    type: 'string',
    paramType: 'query',
  },
  {
    name: 'id',
    description: 'Resource identifier parameter',
    commonNames: ['id', 'uuid', 'resource_id'],
    type: 'integer',
    paramType: 'path',
  },
  {
    name: 'date_range',
    description: 'Date range parameters for filtering by time',
    commonNames: [
      'start_date',
      'end_date',
      'from',
      'to',
      'date_from',
      'date_to',
    ],
    type: 'string',
    paramType: 'query',
  },
  {
    name: 'include',
    description: 'Include related resources in response',
    commonNames: ['include', 'expand', 'embed', 'with'],
    type: 'string',
    paramType: 'query',
  },
  {
    name: 'fields',
    description: 'Select specific fields to return',
    commonNames: ['fields', 'select', 'columns'],
    type: 'string',
    paramType: 'query',
  },
];

/**
 * Identifies common parameter pattern for a parameter
 *
 * @param parameter - The parameter to analyze
 * @returns Matching pattern or undefined
 */
function identifyParameterPattern(
  parameter: ApiParameter
): ParameterPattern | undefined {
  const paramName = parameter.name.toLowerCase();

  for (const pattern of COMMON_PATTERNS) {
    if (pattern.commonNames.some((name) => paramName.includes(name))) {
      return pattern;
    }
  }

  return undefined;
}

/**
 * Extracts constraint information from parameter description
 *
 * @param parameter - The parameter to analyze
 * @returns Constraint information
 */
function extractConstraints(parameter: ApiParameter): ParameterConstraints {
  const constraints: ParameterConstraints = {};
  const description = parameter.description.toLowerCase();

  // Extract min/max values
  const minMatch = description.match(/min(?:imum)?\s*:?\s*(\d+)/i);
  const maxMatch = description.match(/max(?:imum)?\s*:?\s*(\d+)/i);

  if (minMatch) {
    constraints.min = parseInt(minMatch[1], 10);
  }
  if (maxMatch) {
    constraints.max = parseInt(maxMatch[1], 10);
  }

  // Extract pattern
  const patternMatch = description.match(/pattern\s*:?\s*([^\s,\)]+)/i);
  if (patternMatch) {
    constraints.pattern = patternMatch[1];
  }

  // Extract enum values
  const enumMatch = description.match(/(?:enum|values?)\s*:?\s*\[([^\]]+)\]/i);
  if (enumMatch) {
    constraints.enum = enumMatch[1]
      .split(',')
      .map((v) => v.trim().replace(/['"]/g, ''));
  }

  // Extract min/max length
  const minLengthMatch = description.match(
    /min(?:imum)?\s*length\s*:?\s*(\d+)/i
  );
  const maxLengthMatch = description.match(
    /max(?:imum)?\s*length\s*:?\s*(\d+)/i
  );

  if (minLengthMatch) {
    constraints.minLength = parseInt(minLengthMatch[1], 10);
  }
  if (maxLengthMatch) {
    constraints.maxLength = parseInt(maxLengthMatch[1], 10);
  }

  return constraints;
}

/**
 * Generates validation hints for a parameter
 *
 * @param parameter - The parameter to analyze
 * @param constraints - Parameter constraints
 * @returns Validation hints
 */
function generateValidationHints(
  parameter: ApiParameter,
  constraints: ParameterConstraints
): ParameterValidationHints {
  const hints: ParameterValidationHints = {
    validationType: 'none',
    message: 'No specific validation required',
  };

  // Check for enum constraints first (highest priority)
  if (constraints.enum && constraints.enum.length > 0) {
    hints.validationType = 'enum';
    hints.message = `Value must be one of: ${constraints.enum.join(', ')}`;
    hints.example = constraints.enum[0];
    hints.invalidExample = 'invalid_value';
    return hints;
  }

  if (constraints.pattern) {
    hints.validationType = 'pattern';
    hints.message = `Value must match pattern: ${constraints.pattern}`;
    hints.example = 'example_matching_pattern';
    hints.invalidExample = 'invalid_pattern';
    return hints;
  }

  if (parameter.type === 'integer' || parameter.type === 'number') {
    if (constraints.min !== undefined && constraints.max !== undefined) {
      hints.validationType = 'range';
      hints.message = `Value must be between ${constraints.min} and ${constraints.max}`;
      hints.example = String(
        Math.floor((constraints.min + constraints.max) / 2)
      );
      hints.invalidExample = String(constraints.max + 1);
    } else if (constraints.min !== undefined) {
      hints.validationType = 'range';
      hints.message = `Value must be at least ${constraints.min}`;
      hints.example = String(constraints.min);
      hints.invalidExample = String(constraints.min - 1);
    } else if (constraints.max !== undefined) {
      hints.validationType = 'range';
      hints.message = `Value must be at most ${constraints.max}`;
      hints.example = String(constraints.max);
      hints.invalidExample = String(constraints.max + 1);
    } else {
      hints.validationType = 'type';
      hints.message = 'Value must be a valid number';
      hints.example = '123';
      hints.invalidExample = 'not_a_number';
    }
    return hints;
  }

  if (parameter.type === 'string') {
    if (
      constraints.minLength !== undefined &&
      constraints.maxLength !== undefined
    ) {
      hints.validationType = 'range';
      hints.message = `Length must be between ${constraints.minLength} and ${constraints.maxLength} characters`;
      hints.example = 'a'.repeat(
        Math.floor((constraints.minLength + constraints.maxLength) / 2)
      );
      hints.invalidExample = 'a'.repeat(constraints.maxLength + 1);
    } else if (constraints.minLength !== undefined) {
      hints.validationType = 'range';
      hints.message = `Length must be at least ${constraints.minLength} characters`;
      hints.example = 'a'.repeat(constraints.minLength);
      hints.invalidExample = 'a'.repeat(constraints.minLength - 1);
    } else if (constraints.maxLength !== undefined) {
      hints.validationType = 'range';
      hints.message = `Length must be at most ${constraints.maxLength} characters`;
      hints.example = 'a'.repeat(constraints.maxLength);
      hints.invalidExample = 'a'.repeat(constraints.maxLength + 1);
    } else {
      hints.validationType = 'type';
      hints.message = 'Value must be a valid string';
      hints.example = 'example_string';
      hints.invalidExample = '123';
    }
    return hints;
  }

  if (parameter.type === 'boolean') {
    hints.validationType = 'type';
    hints.message = 'Value must be true or false';
    hints.example = 'true';
    hints.invalidExample = 'not_a_boolean';
    return hints;
  }

  if (parameter.type === 'array') {
    hints.validationType = 'type';
    hints.message = 'Value must be an array';
    hints.example = '["item1", "item2"]';
    hints.invalidExample = 'not_an_array';
    return hints;
  }

  // Check for required parameter last (lowest priority)
  if (parameter.required) {
    hints.validationType = 'required';
    hints.message = 'This parameter is required and must be provided';
    hints.example = 'Provide a valid value';
    hints.invalidExample = 'Omitting this parameter will result in an error';
    return hints;
  }

  hints.validationType = 'type';
  hints.message = `Value must be of type ${parameter.type}`;
  hints.example = 'example_value';
  hints.invalidExample = 'invalid_value';

  return hints;
}

/**
 * Converts an ApiParameter to a ParameterDetail
 *
 * @param parameter - The parameter to convert
 * @returns Detailed parameter information
 */
function toParameterDetail(parameter: ApiParameter): ParameterDetail {
  const constraints = extractConstraints(parameter);
  const validationHints = generateValidationHints(parameter, constraints);
  const pattern = identifyParameterPattern(parameter);

  return {
    name: parameter.name,
    type: parameter.type,
    required: parameter.required,
    description: parameter.description,
    paramType: parameter.paramType,
    constraints,
    validationHints,
    pattern,
  };
}

/**
 * Gets parameters for a specific endpoint
 *
 * This function retrieves all parameters for a given endpoint, optionally
 * filtered by parameter type. It includes detailed information about each
 * parameter including constraints, validation hints, and common patterns.
 *
 * @param params - Lookup parameters
 * @param index - Metadata index for searching
 * @returns Parameter lookup result or null if endpoint not found
 *
 * @example
 * ```typescript
 * // Get all parameters for an endpoint
 * const result = getParameters(
 *   { endpointPath: '/customers/{id}', method: 'GET' },
 *   metadataIndex
 * );
 *
 * // Get only query parameters
 * const queryParams = getParameters(
 *   { endpointPath: '/customers', method: 'GET', paramType: 'query' },
 *   metadataIndex
 * );
 * ```
 */
export function getParameters(
  params: ParameterLookupParams,
  index: MetadataIndex
): ParameterLookupResult | null {
  const { endpointPath, method, paramType } = params;

  // Validate required parameters
  if (!endpointPath || !method) {
    throw new Error('endpointPath and method are required parameters');
  }

  // Lookup endpoint by path and method
  const endpoint = getEndpointByPath(index, endpointPath, method.toUpperCase());

  if (!endpoint) {
    return null;
  }

  // Collect all parameters (path, query, and body)
  let allParameters: ApiParameter[] = [...endpoint.parameters];

  // Add request body parameters if present
  if (endpoint.requestBody) {
    allParameters = [...allParameters, ...endpoint.requestBody];
  }

  // Filter by parameter type if specified
  let filteredParameters = allParameters;
  if (paramType) {
    filteredParameters = allParameters.filter((p) => p.paramType === paramType);
  }

  // Convert to detailed parameter information
  const parameterDetails = filteredParameters.map(toParameterDetail);

  // Calculate statistics
  const totalCount = parameterDetails.length;
  const requiredCount = parameterDetails.filter((p) => p.required).length;
  const optionalCount = totalCount - requiredCount;

  return {
    endpointPath,
    method: method.toUpperCase(),
    parameters: parameterDetails,
    totalCount,
    requiredCount,
    optionalCount,
  };
}

/**
 * Gets all common parameter patterns
 *
 * @returns Array of common parameter patterns
 */
export function getCommonPatterns(): ParameterPattern[] {
  return [...COMMON_PATTERNS];
}

/**
 * Identifies parameters matching a specific pattern
 *
 * @param endpoint - The endpoint to analyze
 * @param patternName - The pattern name to match
 * @returns Array of matching parameters
 */
export function getParametersByPattern(
  endpoint: ApiEndpoint,
  patternName: string
): ParameterDetail[] {
  const pattern = COMMON_PATTERNS.find((p) => p.name === patternName);

  if (!pattern) {
    return [];
  }

  const allParameters: ApiParameter[] = [...endpoint.parameters];
  if (endpoint.requestBody) {
    allParameters.push(...endpoint.requestBody);
  }

  return allParameters
    .filter((p) => {
      const paramName = p.name.toLowerCase();
      return pattern.commonNames.some((name) => paramName.includes(name));
    })
    .map(toParameterDetail);
}
