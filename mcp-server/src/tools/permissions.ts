/**
 * Permission reference tool for RepairShopr API documentation
 *
 * This module provides detailed information about API endpoint permissions,
 * including lookup by endpoint, permission descriptions, permission hierarchy
 * information, permission-based filtering, permission requirement summaries,
 * and permission matrix.
 */

import { ApiEndpoint } from '../utils/types';
import {
  MetadataIndex,
  getEndpointByPath,
  getEndpointsByResource,
  getEndpointsByPermission,
} from '../parser/metadata';

/**
 * Permission hierarchy information
 */
export interface PermissionHierarchy {
  /** Permission name */
  name: string;
  /** Parent permission (if any) */
  parent?: string;
  /** Child permissions */
  children: string[];
  /** Description of the permission level */
  level: string;
  /** Description of the permission */
  description: string;
}

/**
 * Permission description
 */
export interface PermissionDescription {
  /** Permission name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Permission category (read, write, admin, etc.) */
  category: string;
  /** Typical operations this permission allows */
  operations: string[];
}

/**
 * Permission requirement summary
 */
export interface PermissionRequirementSummary {
  /** Permission name */
  permission: string;
  /** Number of endpoints requiring this permission */
  endpointCount: number;
  /** Resources that use this permission */
  resources: string[];
  /** HTTP methods that use this permission */
  methods: string[];
  /** Sample endpoints using this permission */
  sampleEndpoints: Array<{
    resource: string;
    operation: string;
    method: string;
    path: string;
  }>;
}

/**
 * Permission matrix entry
 */
export interface PermissionMatrixEntry {
  /** Permission name */
  permission: string;
  /** Description */
  description: string;
  /** Category */
  category: string;
  /** Number of endpoints */
  endpointCount: number;
  /** Resources using this permission */
  resources: string[];
  /** Methods using this permission */
  methods: string[];
}

/**
 * Detailed permission information
 */
export interface PermissionDetail {
  /** Permission name */
  name: string;
  /** Permission description */
  description: PermissionDescription;
  /** Endpoints that require this permission */
  endpoints: Array<{
    resource: string;
    operation: string;
    method: string;
    path: string;
  }>;
  /** Permission hierarchy information */
  hierarchy?: PermissionHierarchy;
}

/**
 * Result of permission lookup
 */
export interface PermissionLookupResult {
  /** Permission details */
  permission?: PermissionDetail;
  /** All permissions (if no specific filter provided) */
  allPermissions?: PermissionDetail[];
  /** Permission requirement summaries */
  summaries?: PermissionRequirementSummary[];
  /** Permission matrix */
  matrix?: PermissionMatrixEntry[];
  /** Total number of unique permissions */
  totalPermissions: number;
}

/**
 * Parameters for permission lookup
 */
export interface PermissionLookupParams {
  /** Endpoint path (e.g., /customers/{id}) */
  endpointPath?: string;
  /** HTTP method (required when using endpointPath) */
  method?: string;
  /** Resource name */
  resource?: string;
  /** Permission name */
  permission?: string;
  /** Include permission matrix */
  includeMatrix?: boolean;
  /** Include permission summaries */
  includeSummaries?: boolean;
}

/**
 * Common permission descriptions based on naming patterns
 */
const PERMISSION_DESCRIPTIONS: Record<string, PermissionDescription> = {
  view: {
    name: 'view',
    description: 'Read-only access to view resources',
    category: 'read',
    operations: ['GET', 'list', 'show', 'index'],
  },
  create: {
    name: 'create',
    description: 'Permission to create new resources',
    category: 'write',
    operations: ['POST', 'create', 'new', 'add'],
  },
  update: {
    name: 'update',
    description: 'Permission to modify existing resources',
    category: 'write',
    operations: ['PUT', 'PATCH', 'update', 'edit', 'modify'],
  },
  delete: {
    name: 'delete',
    description: 'Permission to remove resources',
    category: 'write',
    operations: ['DELETE', 'destroy', 'remove'],
  },
  admin: {
    name: 'admin',
    description: 'Full administrative access to all operations',
    category: 'admin',
    operations: ['all operations'],
  },
  manage: {
    name: 'manage',
    description:
      'Full management access including create, read, update, and delete',
    category: 'admin',
    operations: ['create', 'read', 'update', 'delete'],
  },
};

/**
 * Permission hierarchy definitions
 */
const PERMISSION_HIERARCHY: PermissionHierarchy[] = [
  {
    name: 'admin',
    level: 'highest',
    children: ['manage', 'view', 'create', 'update', 'delete'],
    description: 'Full administrative access',
  },
  {
    name: 'manage',
    level: 'high',
    parent: 'admin',
    children: ['view', 'create', 'update', 'delete'],
    description: 'Full management access',
  },
  {
    name: 'create',
    level: 'medium',
    parent: 'manage',
    children: [],
    description: 'Create operations only',
  },
  {
    name: 'update',
    level: 'medium',
    parent: 'manage',
    children: [],
    description: 'Update operations only',
  },
  {
    name: 'delete',
    level: 'medium',
    parent: 'manage',
    children: [],
    description: 'Delete operations only',
  },
  {
    name: 'view',
    level: 'low',
    parent: 'manage',
    children: [],
    description: 'Read-only operations',
  },
];

/**
 * Gets permission description based on permission name
 *
 * @param permission - Permission name
 * @returns Permission description
 */
function getPermissionDescription(permission: string): PermissionDescription {
  const lowerPermission = permission.toLowerCase();

  // Check for exact match
  if (PERMISSION_DESCRIPTIONS[lowerPermission]) {
    return PERMISSION_DESCRIPTIONS[lowerPermission];
  }

  // Try to infer description from permission name
  if (
    lowerPermission.includes('view') ||
    lowerPermission.includes('read') ||
    lowerPermission.includes('get') ||
    lowerPermission.includes('list')
  ) {
    return PERMISSION_DESCRIPTIONS['view'];
  }

  if (
    lowerPermission.includes('create') ||
    lowerPermission.includes('add') ||
    lowerPermission.includes('new') ||
    lowerPermission.includes('post')
  ) {
    return PERMISSION_DESCRIPTIONS['create'];
  }

  if (
    lowerPermission.includes('update') ||
    lowerPermission.includes('edit') ||
    lowerPermission.includes('modify') ||
    lowerPermission.includes('patch') ||
    lowerPermission.includes('put')
  ) {
    return PERMISSION_DESCRIPTIONS['update'];
  }

  if (
    lowerPermission.includes('delete') ||
    lowerPermission.includes('destroy') ||
    lowerPermission.includes('remove')
  ) {
    return PERMISSION_DESCRIPTIONS['delete'];
  }

  if (lowerPermission.includes('admin') || lowerPermission.includes('super')) {
    return PERMISSION_DESCRIPTIONS['admin'];
  }

  if (lowerPermission.includes('manage')) {
    return PERMISSION_DESCRIPTIONS['manage'];
  }

  // Default description
  return {
    name: permission,
    description: `Permission for ${permission} operations`,
    category: 'custom',
    operations: ['custom operations'],
  };
}

/**
 * Gets permission hierarchy information
 *
 * @param permission - Permission name
 * @returns Permission hierarchy or undefined
 */
function getPermissionHierarchy(
  permission: string
): PermissionHierarchy | undefined {
  const lowerPermission = permission.toLowerCase();

  // Try to find exact match
  let hierarchy = PERMISSION_HIERARCHY.find((h) => h.name === lowerPermission);

  if (hierarchy) {
    return hierarchy;
  }

  // Try to infer hierarchy from permission name
  if (lowerPermission.includes('admin') || lowerPermission.includes('super')) {
    return PERMISSION_HIERARCHY.find((h) => h.name === 'admin');
  }

  if (lowerPermission.includes('manage')) {
    return PERMISSION_HIERARCHY.find((h) => h.name === 'manage');
  }

  if (lowerPermission.includes('create')) {
    return PERMISSION_HIERARCHY.find((h) => h.name === 'create');
  }

  if (lowerPermission.includes('update')) {
    return PERMISSION_HIERARCHY.find((h) => h.name === 'update');
  }

  if (lowerPermission.includes('delete')) {
    return PERMISSION_HIERARCHY.find((h) => h.name === 'delete');
  }

  if (lowerPermission.includes('view') || lowerPermission.includes('read')) {
    return PERMISSION_HIERARCHY.find((h) => h.name === 'view');
  }

  return undefined;
}

/**
 * Looks up permission by endpoint path
 *
 * @param index - Metadata index
 * @param endpointPath - Endpoint path
 * @param method - HTTP method
 * @returns Permission detail or null
 */
function lookupPermissionByEndpoint(
  index: MetadataIndex,
  endpointPath: string,
  method: string
): PermissionDetail | null {
  const endpoint = getEndpointByPath(index, endpointPath, method.toUpperCase());

  if (!endpoint || !endpoint.permission) {
    return null;
  }

  const description = getPermissionDescription(endpoint.permission);
  const hierarchy = getPermissionHierarchy(endpoint.permission);

  return {
    name: endpoint.permission,
    description,
    endpoints: [
      {
        resource: endpoint.resource,
        operation: endpoint.operation,
        method: endpoint.method,
        path: endpoint.path,
      },
    ],
    hierarchy,
  };
}

/**
 * Looks up permission by resource name
 *
 * @param index - Metadata index
 * @param resource - Resource name
 * @returns Array of permission details
 */
function lookupPermissionsByResource(
  index: MetadataIndex,
  resource: string
): PermissionDetail[] {
  const endpoints = getEndpointsByResource(index, resource);
  const permissionMap = new Map<string, PermissionDetail>();

  for (const endpoint of endpoints) {
    if (!endpoint.permission) {
      continue;
    }

    if (permissionMap.has(endpoint.permission)) {
      const existing = permissionMap.get(endpoint.permission)!;
      existing.endpoints.push({
        resource: endpoint.resource,
        operation: endpoint.operation,
        method: endpoint.method,
        path: endpoint.path,
      });
    } else {
      const description = getPermissionDescription(endpoint.permission);
      const hierarchy = getPermissionHierarchy(endpoint.permission);

      permissionMap.set(endpoint.permission, {
        name: endpoint.permission,
        description,
        endpoints: [
          {
            resource: endpoint.resource,
            operation: endpoint.operation,
            method: endpoint.method,
            path: endpoint.path,
          },
        ],
        hierarchy,
      });
    }
  }

  return Array.from(permissionMap.values());
}

/**
 * Looks up permission by permission name
 *
 * @param index - Metadata index
 * @param permission - Permission name
 * @returns Permission detail or null
 */
function lookupPermissionByName(
  index: MetadataIndex,
  permission: string
): PermissionDetail | null {
  const endpoints = getEndpointsByPermission(index, permission);

  if (endpoints.length === 0) {
    return null;
  }

  const description = getPermissionDescription(permission);
  const hierarchy = getPermissionHierarchy(permission);

  return {
    name: permission,
    description,
    endpoints: endpoints.map((endpoint) => ({
      resource: endpoint.resource,
      operation: endpoint.operation,
      method: endpoint.method,
      path: endpoint.path,
    })),
    hierarchy,
  };
}

/**
 * Creates permission requirement summaries
 *
 * @param index - Metadata index
 * @returns Array of permission requirement summaries
 */
function createPermissionSummaries(
  index: MetadataIndex
): PermissionRequirementSummary[] {
  const summaries: PermissionRequirementSummary[] = [];

  const permissionEntries = Array.from(index.endpointsByPermission.entries());

  for (const [permission, endpoints] of permissionEntries) {
    const resources = new Set<string>();
    const methods = new Set<string>();

    for (const endpoint of endpoints) {
      resources.add(endpoint.resource);
      methods.add(endpoint.method);
    }

    const sampleEndpoints = endpoints.slice(0, 3).map((endpoint) => ({
      resource: endpoint.resource,
      operation: endpoint.operation,
      method: endpoint.method,
      path: endpoint.path,
    }));

    summaries.push({
      permission,
      endpointCount: endpoints.length,
      resources: Array.from(resources),
      methods: Array.from(methods),
      sampleEndpoints,
    });
  }

  // Sort by endpoint count (descending)
  summaries.sort((a, b) => b.endpointCount - a.endpointCount);

  return summaries;
}

/**
 * Creates permission matrix
 *
 * @param index - Metadata index
 * @returns Array of permission matrix entries
 */
function createPermissionMatrix(index: MetadataIndex): PermissionMatrixEntry[] {
  const matrix: PermissionMatrixEntry[] = [];

  const permissionEntries = Array.from(index.endpointsByPermission.entries());

  for (const [permission, endpoints] of permissionEntries) {
    const resources = new Set<string>();
    const methods = new Set<string>();

    for (const endpoint of endpoints) {
      resources.add(endpoint.resource);
      methods.add(endpoint.method);
    }

    const description = getPermissionDescription(permission);

    matrix.push({
      permission,
      description: description.description,
      category: description.category,
      endpointCount: endpoints.length,
      resources: Array.from(resources),
      methods: Array.from(methods),
    });
  }

  // Sort by permission name
  matrix.sort((a, b) => a.permission.localeCompare(b.permission));

  return matrix;
}

/**
 * Gets all unique permissions from the metadata index
 *
 * @param index - Metadata index
 * @returns Array of all permission details
 */
function getAllPermissions(index: MetadataIndex): PermissionDetail[] {
  const permissions: PermissionDetail[] = [];

  const permissionEntries = Array.from(index.endpointsByPermission.entries());

  for (const [permission, endpoints] of permissionEntries) {
    const description = getPermissionDescription(permission);
    const hierarchy = getPermissionHierarchy(permission);

    permissions.push({
      name: permission,
      description,
      endpoints: endpoints.map((endpoint) => ({
        resource: endpoint.resource,
        operation: endpoint.operation,
        method: endpoint.method,
        path: endpoint.path,
      })),
      hierarchy,
    });
  }

  // Sort by permission name
  permissions.sort((a, b) => a.name.localeCompare(b.name));

  return permissions;
}

/**
 * Gets permission information based on provided parameters
 *
 * This function supports multiple lookup strategies:
 * - By endpoint path and method (returns permission for that endpoint)
 * - By resource name (returns all permissions for that resource)
 * - By permission name (returns detailed information about that permission)
 * - No filters (returns all permissions with optional matrix and summaries)
 *
 * @param params - Lookup parameters
 * @param index - Metadata index for searching
 * @returns Permission lookup result
 *
 * @example
 * ```typescript
 * // Lookup permission by endpoint
 * const result = getPermissions(
 *   { endpointPath: '/customers/{id}', method: 'GET' },
 *   metadataIndex
 * );
 *
 * // Lookup permissions by resource
 * const result = getPermissions(
 *   { resource: 'Customer' },
 *   metadataIndex
 * );
 *
 * // Lookup permission by name
 * const result = getPermissions(
 *   { permission: 'view_customers' },
 *   metadataIndex
 * );
 *
 * // Get all permissions with matrix and summaries
 * const result = getPermissions(
 *   { includeMatrix: true, includeSummaries: true },
 *   metadataIndex
 * );
 * ```
 */
export function getPermissions(
  params: PermissionLookupParams,
  index: MetadataIndex
): PermissionLookupResult {
  const {
    endpointPath,
    resource,
    permission,
    includeMatrix,
    includeSummaries,
  } = params;

  // Priority 1: Lookup by endpoint path and method
  if (endpointPath) {
    // Need method for endpoint lookup
    if (!params.method) {
      throw new Error('method parameter is required when using endpointPath');
    }

    const permissionDetail = lookupPermissionByEndpoint(
      index,
      endpointPath,
      params.method
    );

    if (!permissionDetail) {
      return {
        totalPermissions: index.endpointsByPermission.size,
      };
    }

    return {
      permission: permissionDetail,
      totalPermissions: index.endpointsByPermission.size,
    };
  }

  // Priority 2: Lookup by resource name
  if (resource) {
    const permissions = lookupPermissionsByResource(index, resource);

    return {
      allPermissions: permissions,
      totalPermissions: index.endpointsByPermission.size,
    };
  }

  // Priority 3: Lookup by permission name
  if (permission) {
    const permissionDetail = lookupPermissionByName(index, permission);

    if (!permissionDetail) {
      return {
        totalPermissions: index.endpointsByPermission.size,
      };
    }

    return {
      permission: permissionDetail,
      totalPermissions: index.endpointsByPermission.size,
    };
  }

  // Priority 4: Return all permissions with optional matrix and summaries
  const allPermissions = getAllPermissions(index);
  const result: PermissionLookupResult = {
    allPermissions,
    totalPermissions: index.endpointsByPermission.size,
  };

  if (includeSummaries) {
    result.summaries = createPermissionSummaries(index);
  }

  if (includeMatrix) {
    result.matrix = createPermissionMatrix(index);
  }

  return result;
}

/**
 * Gets permission hierarchy information for all permissions
 *
 * @returns Array of permission hierarchy definitions
 */
export function getPermissionHierarchyDefinitions(): PermissionHierarchy[] {
  return [...PERMISSION_HIERARCHY];
}

/**
 * Gets all permission descriptions
 *
 * @returns Array of permission descriptions
 */
export function getAllPermissionDescriptions(): PermissionDescription[] {
  return Object.values(PERMISSION_DESCRIPTIONS);
}
