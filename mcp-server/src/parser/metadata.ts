/**
 * Metadata extraction module for RepairShopr API documentation
 *
 * This module builds indexes for quick lookups of API endpoints by various
 * criteria including resource name, path, permission, and HTTP method.
 */

import {
  ApiDocument,
  ApiEndpoint,
  ApiParameter,
  ApiResponse,
} from '../utils/types';

/**
 * Metadata index containing multiple lookup maps for fast access
 */
export interface MetadataIndex {
  /** Map of resource name to array of endpoints */
  resources: Map<string, ApiEndpoint[]>;
  /** Map of path+method combination to endpoint */
  endpointsByPath: Map<string, ApiEndpoint>;
  /** Map of permission to array of endpoints */
  endpointsByPermission: Map<string, ApiEndpoint[]>;
  /** Map of HTTP method to array of endpoints */
  endpointsByMethod: Map<string, ApiEndpoint[]>;
  /** Flat array of all endpoints */
  allEndpoints: ApiEndpoint[];
}

/**
 * Builds a complete metadata index from parsed API documents
 *
 * @param documents - Array of parsed API documents
 * @returns Complete metadata index with all lookup maps
 */
export function buildMetadataIndex(documents: ApiDocument[]): MetadataIndex {
  const index: MetadataIndex = {
    resources: new Map(),
    endpointsByPath: new Map(),
    endpointsByPermission: new Map(),
    endpointsByMethod: new Map(),
    allEndpoints: [],
  };

  // Iterate through all documents and endpoints
  for (const document of documents) {
    const { resourceName, endpoints } = document;

    // Add endpoints to resources map
    if (!index.resources.has(resourceName)) {
      index.resources.set(resourceName, []);
    }
    index.resources.get(resourceName)!.push(...endpoints);

    // Add each endpoint to various indexes
    for (const endpoint of endpoints) {
      // Add to all endpoints array
      index.allEndpoints.push(endpoint);

      // Add to endpointsByPath map (key: "METHOD:path")
      const pathKey = `${endpoint.method}:${endpoint.path}`;
      index.endpointsByPath.set(pathKey, endpoint);

      // Add to endpointsByPermission map
      if (endpoint.permission) {
        if (!index.endpointsByPermission.has(endpoint.permission)) {
          index.endpointsByPermission.set(endpoint.permission, []);
        }
        index.endpointsByPermission.get(endpoint.permission)!.push(endpoint);
      }

      // Add to endpointsByMethod map
      if (!index.endpointsByMethod.has(endpoint.method)) {
        index.endpointsByMethod.set(endpoint.method, []);
      }
      index.endpointsByMethod.get(endpoint.method)!.push(endpoint);
    }
  }

  return index;
}

/**
 * Retrieves all endpoints for a specific resource
 *
 * @param index - Metadata index
 * @param resource - Resource name to look up
 * @returns Array of endpoints for the resource, or empty array if not found
 */
export function getEndpointsByResource(
  index: MetadataIndex,
  resource: string
): ApiEndpoint[] {
  return index.resources.get(resource) || [];
}

/**
 * Retrieves a specific endpoint by path and HTTP method
 *
 * @param index - Metadata index
 * @param path - API path
 * @param method - HTTP method
 * @returns Endpoint if found, undefined otherwise
 */
export function getEndpointByPath(
  index: MetadataIndex,
  path: string,
  method: string
): ApiEndpoint | undefined {
  const pathKey = `${method}:${path}`;
  return index.endpointsByPath.get(pathKey);
}

/**
 * Retrieves all endpoints that require a specific permission
 *
 * @param index - Metadata index
 * @param permission - Permission to look up
 * @returns Array of endpoints requiring the permission, or empty array if not found
 */
export function getEndpointsByPermission(
  index: MetadataIndex,
  permission: string
): ApiEndpoint[] {
  return index.endpointsByPermission.get(permission) || [];
}

/**
 * Retrieves all endpoints that use a specific HTTP method
 *
 * @param index - Metadata index
 * @param method - HTTP method to look up
 * @returns Array of endpoints using the method, or empty array if not found
 */
export function getEndpointsByMethod(
  index: MetadataIndex,
  method: string
): ApiEndpoint[] {
  return index.endpointsByMethod.get(method) || [];
}

/**
 * Retrieves all parameters from all endpoints in the index
 *
 * @param index - Metadata index
 * @returns Array of all parameters from all endpoints
 */
export function getAllParameters(index: MetadataIndex): ApiParameter[] {
  const parameters: ApiParameter[] = [];

  for (const endpoint of index.allEndpoints) {
    parameters.push(...endpoint.parameters);
    if (endpoint.requestBody) {
      parameters.push(...endpoint.requestBody);
    }
  }

  return parameters;
}

/**
 * Retrieves all responses from all endpoints in the index
 *
 * @param index - Metadata index
 * @returns Array of all responses from all endpoints
 */
export function getAllResponses(index: MetadataIndex): ApiResponse[] {
  const responses: ApiResponse[] = [];

  for (const endpoint of index.allEndpoints) {
    responses.push(...endpoint.responses);
  }

  return responses;
}
