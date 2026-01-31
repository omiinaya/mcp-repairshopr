/**
 * Endpoint lookup tool for RepairShopr API documentation
 *
 * This module provides detailed information about specific API endpoints,
 * including lookup by path, resource name, batch lookup, and related endpoint discovery.
 */

import { ApiEndpoint } from '../utils/types';
import { MetadataIndex, getEndpointByPath, getEndpointsByResource } from '../parser/metadata';

/**
 * Result of an endpoint lookup operation
 */
export interface EndpointLookupResult {
  /** The matching API endpoint */
  endpoint: ApiEndpoint;
  /** Whether this was an exact match */
  exactMatch: boolean;
}

/**
 * Result of a batch endpoint lookup operation
 */
export interface BatchEndpointLookupResult {
  /** Array of endpoint lookup results */
  results: EndpointLookupResult[];
  /** Number of successful lookups */
  successCount: number;
  /** Number of failed lookups */
  failureCount: number;
}

/**
 * Result of related endpoint discovery
 */
export interface RelatedEndpointsResult {
  /** The original endpoint */
  originalEndpoint: ApiEndpoint;
  /** Endpoints for the same resource */
  sameResource: ApiEndpoint[];
  /** Endpoints with related parameters */
  relatedByParameters: ApiEndpoint[];
  /** Endpoints with the same permission */
  samePermission: ApiEndpoint[];
}

/**
 * Parameters for endpoint lookup
 */
export interface EndpointLookupParams {
  /** Endpoint path (e.g., /customers/{id}) */
  path?: string;
  /** HTTP method (GET, POST, PUT, DELETE, PATCH) */
  method?: string;
  /** Resource name (alternative to path) */
  resource?: string;
}

/**
 * Parameters for batch endpoint lookup
 */
export interface BatchEndpointLookupParams {
  /** Array of endpoint paths to look up */
  paths: string[];
  /** Array of HTTP methods corresponding to paths */
  methods: string[];
}

/**
 * Looks up a specific API endpoint by path and method
 *
 * @param index - Metadata index for searching
 * @param path - API path
 * @param method - HTTP method
 * @returns Endpoint lookup result or null if not found
 */
function lookupByPathAndMethod(
  index: MetadataIndex,
  path: string,
  method: string
): EndpointLookupResult | null {
  const endpoint = getEndpointByPath(index, path, method.toUpperCase());
  
  if (!endpoint) {
    return null;
  }

  return {
    endpoint,
    exactMatch: true
  };
}

/**
 * Looks up endpoints by resource name
 *
 * @param index - Metadata index for searching
 * @param resource - Resource name
 * @returns Array of endpoint lookup results for the resource
 */
function lookupByResource(
  index: MetadataIndex,
  resource: string
): EndpointLookupResult[] {
  const endpoints = getEndpointsByResource(index, resource);
  
  return endpoints.map(endpoint => ({
    endpoint,
    exactMatch: true
  }));
}

/**
 * Performs endpoint lookup based on provided parameters
 *
 * This function supports multiple lookup strategies:
 * - By path and method (most specific)
 * - By resource name (returns all endpoints for the resource)
 *
 * @param params - Lookup parameters
 * @param index - Metadata index for searching
 * @returns Endpoint lookup result(s) or null if not found
 *
 * @example
 * ```typescript
 * // Lookup by path and method
 * const result = getEndpoint(
 *   { path: '/customers/{id}', method: 'GET' },
 *   metadataIndex
 * );
 *
 * // Lookup by resource name
 * const results = getEndpoint(
 *   { resource: 'Customer' },
 *   metadataIndex
 * );
 * ```
 */
export function getEndpoint(
  params: EndpointLookupParams,
  index: MetadataIndex
): EndpointLookupResult | EndpointLookupResult[] | null {
  const { path, method, resource } = params;

  // Validate that at least one lookup criterion is provided
  if (!path && !resource) {
    throw new Error('Either path or resource parameter must be provided');
  }

  // Priority 1: Lookup by path and method (most specific)
  if (path && method) {
    const result = lookupByPathAndMethod(index, path, method);
    if (result) {
      return result;
    }
    // If path+method lookup fails, return null (no fallback)
    return null;
  }

  // Priority 2: Lookup by path only (returns all endpoints with that path)
  if (path && !method) {
    const allEndpoints = index.allEndpoints.filter(ep => ep.path === path);
    if (allEndpoints.length === 0) {
      return null;
    }
    // Return all endpoints with the same path
    return allEndpoints.map(ep => ({
      endpoint: ep,
      exactMatch: true
    }));
  }

  // Priority 3: Lookup by resource name
  if (resource) {
    const results = lookupByResource(index, resource);
    if (results.length === 0) {
      return null;
    }
    return results;
  }

  return null;
}

/**
 * Performs batch endpoint lookup for multiple paths
 *
 * @param params - Batch lookup parameters
 * @param index - Metadata index for searching
 * @returns Batch lookup result with success/failure counts
 *
 * @example
 * ```typescript
 * const result = getEndpointsBatch(
 *   {
 *     paths: ['/customers/{id}', '/tickets/{id}'],
 *     methods: ['GET', 'GET']
 *   },
 *   metadataIndex
 * );
 * ```
 */
export function getEndpointsBatch(
  params: BatchEndpointLookupParams,
  index: MetadataIndex
): BatchEndpointLookupResult {
  const { paths, methods } = params;

  // Validate input
  if (paths.length !== methods.length) {
    throw new Error('Paths and methods arrays must have the same length');
  }

  if (paths.length === 0) {
    return {
      results: [],
      successCount: 0,
      failureCount: 0
    };
  }

  const results: EndpointLookupResult[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < paths.length; i++) {
    const result = lookupByPathAndMethod(index, paths[i], methods[i]);
    
    if (result) {
      results.push(result);
      successCount++;
    } else {
      failureCount++;
    }
  }

  return {
    results,
    successCount,
    failureCount
  };
}

/**
 * Discovers related endpoints for a given endpoint
 *
 * This function finds endpoints that are related to the specified endpoint
 * by various criteria:
 * - Same resource
 * - Related parameters (shared parameter names)
 * - Same permission requirements
 *
 * @param endpoint - The endpoint to find related endpoints for
 * @param index - Metadata index for searching
 * @returns Related endpoints result
 *
 * @example
 * ```typescript
 * const result = findRelatedEndpoints(
 *   endpoint,
 *   metadataIndex
 * );
 * ```
 */
export function findRelatedEndpoints(
  endpoint: ApiEndpoint,
  index: MetadataIndex
): RelatedEndpointsResult {
  // Find endpoints for the same resource (excluding the original)
  const sameResource = index.allEndpoints.filter(
    ep => ep.resource === endpoint.resource && 
          (ep.method !== endpoint.method || ep.path !== endpoint.path)
  );

  // Find endpoints with related parameters
  const relatedByParameters: ApiEndpoint[] = [];
  const endpointParamNames = new Set(
    endpoint.parameters.map(p => p.name.toLowerCase())
  );

  for (const ep of index.allEndpoints) {
    // Skip the original endpoint
    if (ep.method === endpoint.method && ep.path === endpoint.path) {
      continue;
    }

    // Check if this endpoint shares any parameters
    const epParamNames = new Set(
      ep.parameters.map(p => p.name.toLowerCase())
    );
    
    const hasSharedParam = Array.from(endpointParamNames).some(paramName =>
      epParamNames.has(paramName)
    );

    if (hasSharedParam) {
      relatedByParameters.push(ep);
    }
  }

  // Find endpoints with the same permission (excluding the original)
  const samePermission: ApiEndpoint[] = [];
  if (endpoint.permission) {
    const endpointsWithPermission = index.endpointsByPermission.get(endpoint.permission) || [];
    for (const ep of endpointsWithPermission) {
      if (ep.method !== endpoint.method || ep.path !== endpoint.path) {
        samePermission.push(ep);
      }
    }
  }

  return {
    originalEndpoint: endpoint,
    sameResource,
    relatedByParameters,
    samePermission
  };
}

/**
 * Gets complete endpoint details including all metadata
 *
 * @param endpoint - The endpoint to get details for
 * @returns Complete endpoint details object
 */
export function getEndpointDetails(endpoint: ApiEndpoint): {
  resource: string;
  operation: string;
  description: string;
  method: string;
  path: string;
  permission: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    paramType: 'query' | 'path' | 'body';
  }>;
  requestBody?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    paramType: 'query' | 'path' | 'body';
  }>;
  responses: Array<{
    statusCode: number;
    description: string;
    example?: any;
  }>;
} {
  return {
    resource: endpoint.resource,
    operation: endpoint.operation,
    description: endpoint.description,
    method: endpoint.method,
    path: endpoint.path,
    permission: endpoint.permission,
    parameters: endpoint.parameters.map(param => ({
      name: param.name,
      type: param.type,
      required: param.required,
      description: param.description,
      paramType: param.paramType
    })),
    requestBody: endpoint.requestBody?.map(param => ({
      name: param.name,
      type: param.type,
      required: param.required,
      description: param.description,
      paramType: param.paramType
    })),
    responses: endpoint.responses.map(response => ({
      statusCode: response.statusCode,
      description: response.description,
      example: response.example
    }))
  };
}
