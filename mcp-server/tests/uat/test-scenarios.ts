/**
 * Test scenarios for AI assistants
 * Defines common use case scenarios for UAT testing
 */

import { ApiEndpoint, ApiParameter, ApiResponse } from '../../src/utils/types';
import {
  generateEndpoint,
  generateParameter,
  generateResponse,
} from '../fixtures';

/**
 * Test scenario interface
 */
export interface TestScenario {
  id: string;
  name: string;
  description: string;
  category: ScenarioCategory;
  query: string;
  expectedBehavior: ExpectedBehavior;
  acceptanceCriteria: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Scenario categories
 */
export type ScenarioCategory =
  | 'api-discovery'
  | 'parameter-lookup'
  | 'response-format'
  | 'permission-checking'
  | 'code-example-generation'
  | 'error-handling'
  | 'edge-case';

/**
 * Expected behavior interface
 */
export interface ExpectedBehavior {
  shouldReturnEndpoints: boolean;
  shouldReturnParameters: boolean;
  shouldReturnResponses: boolean;
  shouldReturnPermissions: boolean;
  shouldReturnCodeExamples: boolean;
  shouldHandleErrors: boolean;
  expectedEndpointCount?: number;
  expectedParameterCount?: number;
  expectedResponseCount?: number;
}

/**
 * API Discovery Scenarios
 * Tests for discovering available API endpoints
 */
export const apiDiscoveryScenarios: TestScenario[] = [
  {
    id: 'DISC-001',
    name: 'Discover all available endpoints',
    description:
      'AI assistant should be able to discover all available API endpoints',
    category: 'api-discovery',
    query: 'What endpoints are available?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
    },
    acceptanceCriteria: [
      'Response includes list of available endpoints',
      'Each endpoint has resource name and operation',
      'Response is clear and easy to understand',
      'No errors occur during discovery',
    ],
    priority: 'critical',
  },
  {
    id: 'DISC-002',
    name: 'Discover endpoints for specific resource',
    description:
      'AI assistant should discover endpoints for a specific resource',
    category: 'api-discovery',
    query: 'What endpoints are available for customers?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
    },
    acceptanceCriteria: [
      'Response includes only customer-related endpoints',
      'Endpoints are relevant to the customer resource',
      'Response is accurate and complete',
    ],
    priority: 'critical',
  },
  {
    id: 'DISC-003',
    name: 'Discover endpoints by HTTP method',
    description:
      'AI assistant should discover endpoints filtered by HTTP method',
    category: 'api-discovery',
    query: 'What POST endpoints are available?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
    },
    acceptanceCriteria: [
      'Response includes only POST endpoints',
      'All returned endpoints use POST method',
      'Response is accurate',
    ],
    priority: 'high',
  },
  {
    id: 'DISC-004',
    name: 'Discover endpoints by permission',
    description:
      'AI assistant should discover endpoints filtered by permission',
    category: 'api-discovery',
    query: 'What endpoints require customer.view permission?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: true,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
    },
    acceptanceCriteria: [
      'Response includes endpoints with customer.view permission',
      'All returned endpoints have the specified permission',
      'Permission information is clearly displayed',
    ],
    priority: 'high',
  },
];

/**
 * Parameter Lookup Scenarios
 * Tests for looking up endpoint parameters
 */
export const parameterLookupScenarios: TestScenario[] = [
  {
    id: 'PARAM-001',
    name: 'Lookup parameters for specific endpoint',
    description:
      'AI assistant should lookup parameters for a specific endpoint',
    category: 'parameter-lookup',
    query: 'What parameters does the create customer endpoint require?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: true,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
      expectedParameterCount: 1,
    },
    acceptanceCriteria: [
      'Response includes all parameters for the endpoint',
      'Each parameter has name, type, and required status',
      'Parameter descriptions are clear',
      'Required parameters are clearly marked',
    ],
    priority: 'critical',
  },
  {
    id: 'PARAM-002',
    name: 'Lookup required parameters only',
    description: 'AI assistant should identify required parameters',
    category: 'parameter-lookup',
    query: 'What are the required parameters for creating a ticket?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: true,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
      expectedParameterCount: 1,
    },
    acceptanceCriteria: [
      'Response includes only required parameters',
      'No optional parameters are included',
      'Required status is clearly indicated',
    ],
    priority: 'critical',
  },
  {
    id: 'PARAM-003',
    name: 'Lookup parameter types and constraints',
    description: 'AI assistant should provide parameter types and constraints',
    category: 'parameter-lookup',
    query: 'What are the types and constraints for customer parameters?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: true,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
      expectedParameterCount: 1,
    },
    acceptanceCriteria: [
      'Response includes parameter types',
      'Constraints (min, max, pattern) are included',
      'Type information is accurate',
      'Constraints are clearly explained',
    ],
    priority: 'high',
  },
  {
    id: 'PARAM-004',
    name: 'Lookup body parameters',
    description: 'AI assistant should lookup request body parameters',
    category: 'parameter-lookup',
    query: 'What body parameters are needed for POST /customers?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: true,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
      expectedParameterCount: 1,
    },
    acceptanceCriteria: [
      'Response includes body parameters',
      'Body parameters are distinguished from query/path parameters',
      'All body parameters are listed',
    ],
    priority: 'high',
  },
];

/**
 * Response Format Scenarios
 * Tests for understanding API response formats
 */
export const responseFormatScenarios: TestScenario[] = [
  {
    id: 'RESP-001',
    name: 'Lookup response format for endpoint',
    description: 'AI assistant should lookup response format for an endpoint',
    category: 'response-format',
    query: 'What does the customer endpoint return?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: true,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
      expectedResponseCount: 1,
    },
    acceptanceCriteria: [
      'Response includes status codes',
      'Response descriptions are clear',
      'Response examples are provided if available',
      'Multiple response codes are listed',
    ],
    priority: 'critical',
  },
  {
    id: 'RESP-002',
    name: 'Lookup success response format',
    description: 'AI assistant should lookup successful response format',
    category: 'response-format',
    query: 'What does a successful customer creation return?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: true,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
      expectedResponseCount: 1,
    },
    acceptanceCriteria: [
      'Response includes 200/201 status code',
      'Success response example is provided',
      'Response structure is clear',
    ],
    priority: 'critical',
  },
  {
    id: 'RESP-003',
    name: 'Lookup error response formats',
    description: 'AI assistant should lookup error response formats',
    category: 'response-format',
    query: 'What error responses can the customer endpoint return?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: true,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
      expectedResponseCount: 1,
    },
    acceptanceCriteria: [
      'Response includes error status codes',
      'Error response examples are provided',
      'Error messages are clear',
      'All possible error codes are listed',
    ],
    priority: 'high',
  },
  {
    id: 'RESP-004',
    name: 'Lookup response by status code',
    description: 'AI assistant should lookup response format by status code',
    category: 'response-format',
    query: 'What does a 404 response look like for customers?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: true,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
      expectedResponseCount: 1,
    },
    acceptanceCriteria: [
      'Response includes 404 status code',
      '404 response example is provided',
      'Error message is clear',
    ],
    priority: 'medium',
  },
];

/**
 * Permission Checking Scenarios
 * Tests for checking endpoint permissions
 */
export const permissionCheckingScenarios: TestScenario[] = [
  {
    id: 'PERM-001',
    name: 'Check endpoint permissions',
    description: 'AI assistant should check permissions for an endpoint',
    category: 'permission-checking',
    query: 'What permissions are required for customer endpoints?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: true,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
    },
    acceptanceCriteria: [
      'Response includes required permissions',
      'Permissions are clearly listed',
      'Permission format is correct (resource.action)',
    ],
    priority: 'critical',
  },
  {
    id: 'PERM-002',
    name: 'Check permissions by resource',
    description:
      'AI assistant should check permissions for all endpoints of a resource',
    category: 'permission-checking',
    query: 'What permissions do I need for ticket operations?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: true,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
    },
    acceptanceCriteria: [
      'Response includes all ticket-related permissions',
      'Permissions are grouped by operation',
      'All required permissions are listed',
    ],
    priority: 'high',
  },
  {
    id: 'PERM-003',
    name: 'Check if specific permission exists',
    description:
      'AI assistant should check if a specific permission is required',
    category: 'permission-checking',
    query: 'Do I need customer.view permission to get customers?',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: true,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
    },
    acceptanceCriteria: [
      'Response confirms or denies permission requirement',
      'Answer is clear and direct',
      'Relevant endpoints are listed',
    ],
    priority: 'medium',
  },
];

/**
 * Code Example Generation Scenarios
 * Tests for generating code examples
 */
export const codeExampleScenarios: TestScenario[] = [
  {
    id: 'CODE-001',
    name: 'Generate code example for endpoint',
    description: 'AI assistant should generate code example for an endpoint',
    category: 'code-example-generation',
    query: 'Show me how to create a customer',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: true,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: true,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
      expectedParameterCount: 1,
    },
    acceptanceCriteria: [
      'Response includes code example',
      'Code example is syntactically correct',
      'Code example includes all required parameters',
      'Code example is well-formatted',
    ],
    priority: 'critical',
  },
  {
    id: 'CODE-002',
    name: 'Generate code example with specific language',
    description:
      'AI assistant should generate code example in a specific language',
    category: 'code-example-generation',
    query: 'Show me how to get a customer in JavaScript',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: true,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: true,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
      expectedParameterCount: 1,
    },
    acceptanceCriteria: [
      'Response includes JavaScript code example',
      'Code example is valid JavaScript',
      'Code example uses appropriate libraries',
    ],
    priority: 'high',
  },
  {
    id: 'CODE-003',
    name: 'Generate code example with all parameters',
    description:
      'AI assistant should generate code example with all parameters',
    category: 'code-example-generation',
    query: 'Show me a complete example for creating a ticket',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: true,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: true,
      shouldHandleErrors: false,
      expectedEndpointCount: 1,
      expectedParameterCount: 1,
    },
    acceptanceCriteria: [
      'Response includes all parameters',
      'Optional parameters are included with default values',
      'Code example is complete and runnable',
    ],
    priority: 'high',
  },
  {
    id: 'CODE-004',
    name: 'Generate code example with error handling',
    description:
      'AI assistant should generate code example with error handling',
    category: 'code-example-generation',
    query: 'Show me how to handle errors when creating a customer',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: true,
      shouldReturnResponses: true,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: true,
      shouldHandleErrors: true,
      expectedEndpointCount: 1,
      expectedParameterCount: 1,
      expectedResponseCount: 1,
    },
    acceptanceCriteria: [
      'Response includes error handling code',
      'Common error cases are handled',
      'Error messages are logged appropriately',
    ],
    priority: 'medium',
  },
];

/**
 * Error Handling Scenarios
 * Tests for error handling
 */
export const errorHandlingScenarios: TestScenario[] = [
  {
    id: 'ERR-001',
    name: 'Handle invalid resource query',
    description:
      'AI assistant should handle queries for non-existent resources',
    category: 'error-handling',
    query: 'What endpoints are available for nonexistent?',
    expectedBehavior: {
      shouldReturnEndpoints: false,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: true,
    },
    acceptanceCriteria: [
      'Response indicates resource not found',
      'Error message is clear and helpful',
      'Suggestion is provided if possible',
    ],
    priority: 'high',
  },
  {
    id: 'ERR-002',
    name: 'Handle ambiguous query',
    description: 'AI assistant should handle ambiguous queries',
    category: 'error-handling',
    query: 'get',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
    },
    acceptanceCriteria: [
      'Response includes multiple possible endpoints',
      'Options are clearly presented',
      'User is asked to clarify if needed',
    ],
    priority: 'medium',
  },
  {
    id: 'ERR-003',
    name: 'Handle empty query',
    description: 'AI assistant should handle empty queries gracefully',
    category: 'error-handling',
    query: '',
    expectedBehavior: {
      shouldReturnEndpoints: false,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: true,
    },
    acceptanceCriteria: [
      'Response indicates empty query',
      'Helpful message is provided',
      'Suggestions are given for valid queries',
    ],
    priority: 'medium',
  },
];

/**
 * Edge Case Scenarios
 * Tests for edge cases
 */
export const edgeCaseScenarios: TestScenario[] = [
  {
    id: 'EDGE-001',
    name: 'Handle very long query',
    description: 'AI assistant should handle very long queries',
    category: 'edge-case',
    query: 'a'.repeat(1000),
    expectedBehavior: {
      shouldReturnEndpoints: false,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: true,
    },
    acceptanceCriteria: [
      'Response handles long query gracefully',
      'Error message is clear if query is too long',
      'System remains stable',
    ],
    priority: 'low',
  },
  {
    id: 'EDGE-002',
    name: 'Handle special characters in query',
    description: 'AI assistant should handle special characters in queries',
    category: 'edge-case',
    query: '!!!@#$%',
    expectedBehavior: {
      shouldReturnEndpoints: false,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: true,
    },
    acceptanceCriteria: [
      'Response handles special characters gracefully',
      'No crashes or errors occur',
      'Helpful message is provided',
    ],
    priority: 'low',
  },
  {
    id: 'EDGE-003',
    name: 'Handle complex nested path query',
    description: 'AI assistant should handle complex nested path queries',
    category: 'edge-case',
    query: 'GET /customers/{id}/tickets/{ticket_id}/comments',
    expectedBehavior: {
      shouldReturnEndpoints: true,
      shouldReturnParameters: false,
      shouldReturnResponses: false,
      shouldReturnPermissions: false,
      shouldReturnCodeExamples: false,
      shouldHandleErrors: false,
    },
    acceptanceCriteria: [
      'Response handles nested paths correctly',
      'Path parameters are identified',
      'Response is accurate',
    ],
    priority: 'medium',
  },
];

/**
 * Get all test scenarios
 */
export function getAllTestScenarios(): TestScenario[] {
  return [
    ...apiDiscoveryScenarios,
    ...parameterLookupScenarios,
    ...responseFormatScenarios,
    ...permissionCheckingScenarios,
    ...codeExampleScenarios,
    ...errorHandlingScenarios,
    ...edgeCaseScenarios,
  ];
}

/**
 * Get test scenarios by category
 */
export function getScenariosByCategory(
  category: ScenarioCategory
): TestScenario[] {
  return getAllTestScenarios().filter(
    (scenario) => scenario.category === category
  );
}

/**
 * Get test scenarios by priority
 */
export function getScenariosByPriority(
  priority: 'critical' | 'high' | 'medium' | 'low'
): TestScenario[] {
  return getAllTestScenarios().filter(
    (scenario) => scenario.priority === priority
  );
}

/**
 * Get critical test scenarios
 */
export function getCriticalScenarios(): TestScenario[] {
  return getScenariosByPriority('critical');
}

/**
 * Get high priority test scenarios
 */
export function getHighPriorityScenarios(): TestScenario[] {
  return getScenariosByPriority('high');
}
