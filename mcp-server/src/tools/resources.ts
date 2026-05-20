/**
 * Resource overview tool for RepairShopr API documentation
 *
 * This module provides comprehensive information about API resources,
 * including resource listing, summary information, available endpoints,
 * resource relationships, statistics, and navigation helpers.
 */

import { ApiEndpoint, ApiParameter, ApiResponse } from '../utils/types';
import { MetadataIndex, getEndpointsByResource, getAllParameters, getAllResponses } from '../parser/metadata';

/**
 * Resource summary information
 */
export interface ResourceSummary {
  /** Resource name */
  name: string;
  /** Resource description */
  description: string;
  /** Number of endpoints for this resource */
  endpointCount: number;
  /** HTTP methods used by this resource */
  methods: string[];
  /** Permissions required by this resource */
  permissions: string[];
}

/**
 * Endpoint information for a resource
 */
export interface ResourceEndpoint {
  /** Operation name */
  operation: string;
  /** Description */
  description: string;
  /** HTTP method */
  method: string;
  /** API path */
  path: string;
  /** Required permission */
  permission: string;
  /** Number of parameters */
  parameterCount: number;
  /** Number of responses */
  responseCount: number;
}

/**
 * Resource relationship information
 */
export interface ResourceRelationship {
  /** Related resource name */
  resource: string;
  /** Relationship type */
  relationshipType: 'parent' | 'child' | 'sibling' | 'reference';
  /** Description of the relationship */
  description: string;
  /** Number of shared endpoints or connections */
  connectionCount: number;
}

/**
 * Resource statistics
 */
export interface ResourceStatistics {
  /** Total number of endpoints */
  totalEndpoints: number;
  /** Total number of parameters */
  totalParameters: number;
  /** Total number of responses */
  totalResponses: number;
  /** Number of unique permissions */
  uniquePermissions: number;
  /** Most common HTTP method */
  mostCommonMethod: string;
  /** Average endpoints per resource */
  averageEndpointsPerResource: number;
}

/**
 * Resource navigation helpers
 */
export interface ResourceNavigation {
  /** Related resources */
  relatedResources: ResourceRelationship[];
  /** Common operations across all resources */
  commonOperations: string[];
  /** Resources with similar permissions */
  similarPermissionResources: Array<{
    resource: string;
    sharedPermissions: string[];
  }>;
}

/**
 * Complete resource information
 */
export interface ResourceInfo {
  /** Resource summary */
  summary: ResourceSummary;
  /** Available endpoints (if requested) */
  endpoints?: ResourceEndpoint[];
  /** Resource relationships (if requested) */
  relationships?: ResourceRelationship[];
  /** Resource statistics */
  statistics: ResourceStatistics;
  /** Navigation helpers */
  navigation: ResourceNavigation;
}

/**
 * Result of resource listing
 */
export interface ResourceListResult {
  /** Array of resource information */
  resources: ResourceInfo[];
  /** Overall statistics across all resources */
  overallStatistics: ResourceStatistics;
  /** Total number of resources */
  totalResources: number;
}

/**
 * Parameters for resource listing
 */
export interface ResourceListParams {
  /** Include endpoint details (default: false) */
  includeEndpoints?: boolean;
  /** Include relationship information (default: false) */
  includeRelationships?: boolean;
}

/**
 * Generates a description for a resource based on its endpoints
 *
 * @param resource - Resource name
 * @param endpoints - Endpoints for the resource
 * @returns Resource description
 */
function generateResourceDescription(resource: string, endpoints: ApiEndpoint[]): string {
  if (endpoints.length === 0) {
    return `API resource for ${resource}`;
  }

  const operations = endpoints.map(e => e.operation.toLowerCase());
  const hasRead = operations.some(op => op.includes('get') || op.includes('list') || op.includes('show') || op.includes('index'));
  const hasCreate = operations.some(op => op.includes('create') || op.includes('add') || op.includes('new'));
  const hasUpdate = operations.some(op => op.includes('update') || op.includes('edit') || op.includes('modify'));
  const hasDelete = operations.some(op => op.includes('delete') || op.includes('destroy') || op.includes('remove'));

  const capabilities: string[] = [];
  if (hasRead) capabilities.push('read');
  if (hasCreate) capabilities.push('create');
  if (hasUpdate) capabilities.push('update');
  if (hasDelete) capabilities.push('delete');

  if (capabilities.length === 0) {
    return `API resource for ${resource}`;
  }

  const capabilityStr = capabilities.join(', ');
  return `API resource for ${resource} with ${capabilityStr} capabilities`;
}

/**
 * Creates a resource summary from endpoints
 *
 * @param resource - Resource name
 * @param endpoints - Endpoints for the resource
 * @returns Resource summary
 */
function createResourceSummary(resource: string, endpoints: ApiEndpoint[]): ResourceSummary {
  const methods = new Set<string>();
  const permissions = new Set<string>();

  for (const endpoint of endpoints) {
    methods.add(endpoint.method);
    if (endpoint.permission) {
      permissions.add(endpoint.permission);
    }
  }

  return {
    name: resource,
    description: generateResourceDescription(resource, endpoints),
    endpointCount: endpoints.length,
    methods: Array.from(methods).sort((a, b) => a.localeCompare(b)),
    permissions: Array.from(permissions).sort((a, b) => a.localeCompare(b)),
  };
}

/**
 * Creates endpoint information for a resource
 *
 * @param endpoints - Endpoints for the resource
 * @returns Array of endpoint information
 */
function createEndpointInfo(endpoints: ApiEndpoint[]): ResourceEndpoint[] {
  return endpoints.map(endpoint => ({
    operation: endpoint.operation,
    description: endpoint.description,
    method: endpoint.method,
    path: endpoint.path,
    permission: endpoint.permission,
    parameterCount: endpoint.parameters.length + (endpoint.requestBody?.length || 0),
    responseCount: endpoint.responses.length
  }));
}

/**
 * Finds relationships between resources based on shared parameters
 *
 * @param resource - Resource name
 * @param endpoints - Endpoints for the resource
 * @param index - Metadata index
 * @returns Array of resource relationships
 */
function findResourceRelationships(
  resource: string,
  endpoints: ApiEndpoint[],
  index: MetadataIndex
): ResourceRelationship[] {
  const relationships: ResourceRelationship[] = [];
  const resourceParams = new Set<string>();

  // Collect all parameters from this resource
  for (const endpoint of endpoints) {
    for (const param of endpoint.parameters) {
      resourceParams.add(param.name.toLowerCase());
    }
    if (endpoint.requestBody) {
      for (const param of endpoint.requestBody) {
        resourceParams.add(param.name.toLowerCase());
      }
    }
  }

  // Check other resources for shared parameters
  for (const [otherResource, otherEndpoints] of index.resources.entries()) {
    if (otherResource === resource) {
      continue;
    }

    let sharedParamCount = 0;
    const otherResourceParams = new Set<string>();

    for (const endpoint of otherEndpoints) {
      for (const param of endpoint.parameters) {
        otherResourceParams.add(param.name.toLowerCase());
      }
      if (endpoint.requestBody) {
        for (const param of endpoint.requestBody) {
          otherResourceParams.add(param.name.toLowerCase());
        }
      }
    }

    // Count shared parameters
    for (const param of otherResourceParams) {
      if (resourceParams.has(param)) {
        sharedParamCount++;
      }
    }

    if (sharedParamCount > 0) {
      relationships.push({
        resource: otherResource,
        relationshipType: 'reference',
        description: `Shares ${sharedParamCount} parameter(s)`,
        connectionCount: sharedParamCount
      });
    }
  }

  // Sort by connection count (descending)
  relationships.sort((a, b) => b.connectionCount - a.connectionCount);

  return relationships.slice(0, 5); // Return top 5 relationships
}

/**
 * Calculates statistics for a resource
 *
 * @param endpoints - Endpoints for the resource
 * @returns Resource statistics
 */
function calculateResourceStatistics(endpoints: ApiEndpoint[]): ResourceStatistics {
  let totalParameters = 0;
  let totalResponses = 0;
  const methodCounts = new Map<string, number>();

  for (const endpoint of endpoints) {
    totalParameters += endpoint.parameters.length + (endpoint.requestBody?.length || 0);
    totalResponses += endpoint.responses.length;

    const count = methodCounts.get(endpoint.method) || 0;
    methodCounts.set(endpoint.method, count + 1);
  }

  // Find most common method
  let mostCommonMethod = '';
  let maxCount = 0;
  for (const [method, count] of methodCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonMethod = method;
    }
  }

  const uniquePermissions = new Set(
    endpoints.map(e => e.permission).filter(p => p !== undefined)
  );

  return {
    totalEndpoints: endpoints.length,
    totalParameters,
    totalResponses,
    uniquePermissions: uniquePermissions.size,
    mostCommonMethod,
    averageEndpointsPerResource: endpoints.length
  };
}

/**
 * Creates navigation helpers for a resource
 *
 * @param resource - Resource name
 * @param endpoints - Endpoints for the resource
 * @param index - Metadata index
 * @returns Resource navigation helpers
 */
function createNavigationHelpers(
  resource: string,
  endpoints: ApiEndpoint[],
  index: MetadataIndex
): ResourceNavigation {
  // Find related resources
  const relatedResources = findResourceRelationships(resource, endpoints, index);

  // Find common operations across all resources
  const allOperations = new Set<string>();
  for (const endpoint of index.allEndpoints) {
    allOperations.add(endpoint.operation.toLowerCase());
  }

  const resourceOperations = new Set(
    endpoints.map(e => e.operation.toLowerCase())
  );

  const commonOperations = Array.from(allOperations).filter(op =>
    resourceOperations.has(op)
  ).slice(0, 5);

  // Find resources with similar permissions
  const resourcePermissions = new Set(
    endpoints.map(e => e.permission).filter(p => p !== undefined)
  );

  const similarPermissionResources: Array<{
    resource: string;
    sharedPermissions: string[];
  }> = [];

  for (const [otherResource, otherEndpoints] of index.resources.entries()) {
    if (otherResource === resource) {
      continue;
    }

    const otherPermissions = new Set(
      otherEndpoints.map(e => e.permission).filter(p => p !== undefined)
    );

    const sharedPermissions: string[] = [];
    for (const perm of resourcePermissions) {
      if (otherPermissions.has(perm)) {
        sharedPermissions.push(perm);
      }
    }

    if (sharedPermissions.length > 0) {
      similarPermissionResources.push({
        resource: otherResource,
        sharedPermissions
      });
    }
  }

  // Sort by number of shared permissions (descending)
  similarPermissionResources.sort((a, b) => b.sharedPermissions.length - a.sharedPermissions.length);

  return {
    relatedResources,
    commonOperations,
    similarPermissionResources: similarPermissionResources.slice(0, 5)
  };
}

/**
 * Calculates overall statistics across all resources
 *
 * @param index - Metadata index
 * @returns Overall resource statistics
 */
function calculateOverallStatistics(index: MetadataIndex): ResourceStatistics {
  const allParameters = getAllParameters(index);
  const allResponses = getAllResponses(index);

  const methodCounts = new Map<string, number>();
  for (const endpoint of index.allEndpoints) {
    const count = methodCounts.get(endpoint.method) || 0;
    methodCounts.set(endpoint.method, count + 1);
  }

  // Find most common method
  let mostCommonMethod = '';
  let maxCount = 0;
  for (const [method, count] of methodCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonMethod = method;
    }
  }

  const uniquePermissions = index.endpointsByPermission.size;

  return {
    totalEndpoints: index.allEndpoints.length,
    totalParameters: allParameters.length,
    totalResponses: allResponses.length,
    uniquePermissions,
    mostCommonMethod,
    averageEndpointsPerResource: index.resources.size > 0
      ? index.allEndpoints.length / index.resources.size
      : 0
  };
}

/**
 * Lists all available API resources with summary information
 *
 * This function provides a comprehensive overview of all API resources,
 * including summary information, available endpoints (optional),
 * resource relationships (optional), statistics, and navigation helpers.
 *
 * @param params - Resource listing parameters
 * @param index - Metadata index for searching
 * @returns Resource list result
 *
 * @example
 * ```typescript
 * // List resources with basic information
 * const result = listResources({}, metadataIndex);
 *
 * // List resources with endpoint details
 * const result = listResources({ includeEndpoints: true }, metadataIndex);
 *
 * // List resources with endpoint details and relationships
 * const result = listResources(
 *   { includeEndpoints: true, includeRelationships: true },
 *   metadataIndex
 * );
 * ```
 */
export function listResources(
  params: ResourceListParams,
  index: MetadataIndex
): ResourceListResult {
  const { includeEndpoints = false, includeRelationships = false } = params;

  const resources: ResourceInfo[] = [];

  // Process each resource
  for (const [resourceName, endpoints] of index.resources.entries()) {
    const summary = createResourceSummary(resourceName, endpoints);
    const statistics = calculateResourceStatistics(endpoints);
    const navigation = createNavigationHelpers(resourceName, endpoints, index);

    const resourceInfo: ResourceInfo = {
      summary,
      statistics,
      navigation
    };

    // Add endpoints if requested
    if (includeEndpoints) {
      resourceInfo.endpoints = createEndpointInfo(endpoints);
    }

    // Add relationships if requested
    if (includeRelationships) {
      resourceInfo.relationships = findResourceRelationships(resourceName, endpoints, index);
    }

    resources.push(resourceInfo);
  }

  // Sort resources by name
  resources.sort((a, b) => a.summary.name.localeCompare(b.summary.name));

  // Calculate overall statistics
  const overallStatistics = calculateOverallStatistics(index);

  return {
    resources,
    overallStatistics,
    totalResources: resources.length
  };
}

/**
 * Gets detailed information about a specific resource
 *
 * @param resourceName - Resource name
 * @param includeEndpoints - Include endpoint details (default: true)
 * @param includeRelationships - Include relationship information (default: true)
 * @param index - Metadata index for searching
 * @returns Resource information or null if not found
 */
export function getResource(
  resourceName: string,
  includeEndpoints: boolean = true,
  includeRelationships: boolean = true,
  index: MetadataIndex
): ResourceInfo | null {
  const endpoints = getEndpointsByResource(index, resourceName);

  if (endpoints.length === 0) {
    return null;
  }

  const summary = createResourceSummary(resourceName, endpoints);
  const statistics = calculateResourceStatistics(endpoints);
  const navigation = createNavigationHelpers(resourceName, endpoints, index);

  const resourceInfo: ResourceInfo = {
    summary,
    statistics,
    navigation
  };

  if (includeEndpoints) {
    resourceInfo.endpoints = createEndpointInfo(endpoints);
  }

  if (includeRelationships) {
    resourceInfo.relationships = findResourceRelationships(resourceName, endpoints, index);
  }

  return resourceInfo;
}

/**
 * Gets all resource names
 *
 * @param index - Metadata index for searching
 * @returns Array of resource names
 */
export function getResourceNames(index: MetadataIndex): string[] {
    return Array.from(index.resources.keys()).sort((a, b) => a.localeCompare(b));
}

/**
 * Gets resources that use a specific HTTP method
 *
 * @param method - HTTP method
 * @param index - Metadata index for searching
 * @returns Array of resource names
 */
export function getResourcesByMethod(method: string, index: MetadataIndex): string[] {
  const resources = new Set<string>();

  for (const endpoint of index.allEndpoints) {
    if (endpoint.method.toUpperCase() === method.toUpperCase()) {
      resources.add(endpoint.resource);
    }
  }

  return Array.from(resources).sort((a, b) => a.localeCompare(b));
}

/**
 * Gets resources that require a specific permission
 *
 * @param permission - Permission name
 * @param index - Metadata index for searching
 * @returns Array of resource names
 */
export function getResourcesByPermission(permission: string, index: MetadataIndex): string[] {
  const resources = new Set<string>();

  for (const endpoint of index.allEndpoints) {
    if (endpoint.permission === permission) {
      resources.add(endpoint.resource);
    }
  }

  return Array.from(resources).sort((a, b) => a.localeCompare(b));
}
