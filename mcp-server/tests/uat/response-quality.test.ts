/**
 * Response Quality Tests
 * Validates response quality for all tools
 */

import { MCPServer } from '../../src/server';
import { ApiEndpoint, ApiParameter, ApiResponse } from '../../src/utils/types';
import { generateEndpoint, generateParameter, generateResponse } from '../fixtures';

/**
 * Quality metrics interface
 */
export interface QualityMetrics {
  toolName: string;
  endpoint?: string;
  query?: string;
  accuracy: number; // 0-1
  completeness: number; // 0-1
  clarity: number; // 0-1
  usefulness: number; // 0-1
  overallQuality: number; // 0-1
  timestamp: string;
}

/**
 * Response validation interface
 */
export interface ResponseValidation {
  isValid: boolean;
  hasRequiredFields: boolean;
  hasValidFormat: boolean;
  hasCorrectTypes: boolean;
  hasNoErrors: boolean;
  issues: string[];
}

/**
 * Quality thresholds
 */
export const QUALITY_THRESHOLDS = {
  MIN_ACCURACY: 0.85,
  MIN_COMPLETENESS: 0.8,
  MIN_CLARITY: 0.85,
  MIN_USEFULNESS: 0.8,
  MIN_OVERALL_QUALITY: 0.82
};

/**
 * Validate response accuracy
 */
function validateAccuracy(
  expected: any,
  actual: any,
  fields: string[]
): { score: number; issues: string[] } {
  let correctFields = 0;
  const issues: string[] = [];

  for (const field of fields) {
    if (expected[field] === actual[field]) {
      correctFields++;
    } else {
      issues.push(`Field '${field}' mismatch: expected ${expected[field]}, got ${actual[field]}`);
    }
  }

  return {
    score: correctFields / fields.length,
    issues
  };
}

/**
 * Validate response completeness
 */
function validateCompleteness(
  endpoint: ApiEndpoint,
  response: any
): { score: number; issues: string[] } {
  const issues: string[] = [];
  let presentFields = 0;
  const requiredFields = ['resource', 'operation', 'method', 'path', 'description'];

  for (const field of requiredFields) {
    if (response[field]) {
      presentFields++;
    } else {
      issues.push(`Missing required field: ${field}`);
    }
  }

  // Check if parameters are included
  if (endpoint.parameters.length > 0 && !response.parameters) {
    issues.push('Missing parameters');
  } else if (response.parameters) {
    presentFields++;
  }

  // Check if responses are included
  if (endpoint.responses.length > 0 && !response.responses) {
    issues.push('Missing responses');
  } else if (response.responses) {
    presentFields++;
  }

  const totalFields = requiredFields.length + 2; // +2 for parameters and responses
  return {
    score: presentFields / totalFields,
    issues
  };
}

/**
 * Validate response clarity
 */
function validateClarity(response: any): { score: number; issues: string[] } {
  const issues: string[] = [];
  let clarityScore = 1.0;

  // Check if description is clear
  if (!response.description || response.description.length < 10) {
    issues.push('Description is too short or missing');
    clarityScore -= 0.2;
  }

  // Check if parameter descriptions are clear
  if (response.parameters) {
    for (const param of response.parameters) {
      if (!param.description || param.description.length < 5) {
        issues.push(`Parameter '${param.name}' has unclear description`);
        clarityScore -= 0.1;
      }
    }
  }

  // Check if response descriptions are clear
  if (response.responses) {
    for (const resp of response.responses) {
      if (!resp.description || resp.description.length < 5) {
        issues.push(`Response ${resp.statusCode} has unclear description`);
        clarityScore -= 0.1;
      }
    }
  }

  return {
    score: Math.max(0, clarityScore),
    issues
  };
}

/**
 * Validate response usefulness
 */
function validateUsefulness(
  query: string,
  response: any
): { score: number; issues: string[] } {
  const issues: string[] = [];
  let usefulnessScore = 1.0;

  // Check if response includes examples
  if (!response.example && !response.codeExample) {
    issues.push('Missing example or code example');
    usefulnessScore -= 0.2;
  }

  // Check if response includes all necessary information
  if (query.toLowerCase().includes('parameter') && !response.parameters) {
    issues.push('Query asks for parameters but none provided');
    usefulnessScore -= 0.3;
  }

  if (query.toLowerCase().includes('response') && !response.responses) {
    issues.push('Query asks for responses but none provided');
    usefulnessScore -= 0.3;
  }

  if (query.toLowerCase().includes('permission') && !response.permission) {
    issues.push('Query asks for permissions but none provided');
    usefulnessScore -= 0.2;
  }

  return {
    score: Math.max(0, usefulnessScore),
    issues
  };
}

/**
 * Calculate overall quality score
 */
function calculateOverallQuality(
  accuracy: number,
  completeness: number,
  clarity: number,
  usefulness: number
): number {
  return (accuracy * 0.3 + completeness * 0.25 + clarity * 0.2 + usefulness * 0.25);
}

/**
 * Test response accuracy for all tools
 */
describe('Response Quality Tests - Accuracy', () => {
  let server: MCPServer;
  let metrics: QualityMetrics[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json'
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test('should provide accurate responses for endpoint tool', async () => {
    const query = 'get customer by id';
    const result = await server.handleQuery(query);

    const expectedFields = ['resource', 'operation', 'method', 'path'];
    const validation = validateAccuracy(
      { resource: 'Customer', operation: 'Get Customer', method: 'GET' },
      result.endpoints[0],
      expectedFields
    );

    const metric: QualityMetrics = {
      toolName: 'endpoint',
      endpoint: result.endpoints[0]?.path,
      query,
      accuracy: validation.score,
      completeness: 0,
      clarity: 0,
      usefulness: 0,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_ACCURACY);
    expect(validation.issues.length).toBe(0);
  });

  test('should provide accurate responses for parameters tool', async () => {
    const query = 'what parameters does create customer need';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateAccuracy(
      { resource: 'Customer', operation: 'Create Customer' },
      endpoint,
      ['resource', 'operation']
    );

    const metric: QualityMetrics = {
      toolName: 'parameters',
      endpoint: endpoint?.path,
      query,
      accuracy: validation.score,
      completeness: 0,
      clarity: 0,
      usefulness: 0,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_ACCURACY);
  });

  test('should provide accurate responses for responses tool', async () => {
    const query = 'what does the customer endpoint return';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateAccuracy(
      { resource: 'Customer' },
      endpoint,
      ['resource']
    );

    const metric: QualityMetrics = {
      toolName: 'responses',
      endpoint: endpoint?.path,
      query,
      accuracy: validation.score,
      completeness: 0,
      clarity: 0,
      usefulness: 0,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_ACCURACY);
  });

  test('should provide accurate responses for permissions tool', async () => {
    const query = 'what permissions do I need for customers';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateAccuracy(
      { resource: 'Customer' },
      endpoint,
      ['resource']
    );

    const metric: QualityMetrics = {
      toolName: 'permissions',
      endpoint: endpoint?.path,
      query,
      accuracy: validation.score,
      completeness: 0,
      clarity: 0,
      usefulness: 0,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_ACCURACY);
  });

  test('should provide accurate responses for code examples tool', async () => {
    const query = 'show me how to create a customer';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateAccuracy(
      { resource: 'Customer', operation: 'Create Customer', method: 'POST' },
      endpoint,
      ['resource', 'operation', 'method']
    );

    const metric: QualityMetrics = {
      toolName: 'code-examples',
      endpoint: endpoint?.path,
      query,
      accuracy: validation.score,
      completeness: 0,
      clarity: 0,
      usefulness: 0,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_ACCURACY);
  });

  test('should calculate average accuracy across all tools', () => {
    const avgAccuracy = metrics.reduce((sum, m) => sum + m.accuracy, 0) / metrics.length;
    expect(avgAccuracy).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_ACCURACY);
  });
});

/**
 * Test response completeness for all tools
 */
describe('Response Quality Tests - Completeness', () => {
  let server: MCPServer;
  let metrics: QualityMetrics[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json'
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test('should provide complete responses for endpoint tool', async () => {
    const query = 'get customer by id';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateCompleteness(endpoint, endpoint);

    const metric: QualityMetrics = {
      toolName: 'endpoint',
      endpoint: endpoint?.path,
      query,
      accuracy: 0,
      completeness: validation.score,
      clarity: 0,
      usefulness: 0,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_COMPLETENESS);
  });

  test('should provide complete responses for parameters tool', async () => {
    const query = 'what parameters does create customer need';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateCompleteness(endpoint, endpoint);

    const metric: QualityMetrics = {
      toolName: 'parameters',
      endpoint: endpoint?.path,
      query,
      accuracy: 0,
      completeness: validation.score,
      clarity: 0,
      usefulness: 0,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_COMPLETENESS);
  });

  test('should provide complete responses for responses tool', async () => {
    const query = 'what does the customer endpoint return';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateCompleteness(endpoint, endpoint);

    const metric: QualityMetrics = {
      toolName: 'responses',
      endpoint: endpoint?.path,
      query,
      accuracy: 0,
      completeness: validation.score,
      clarity: 0,
      usefulness: 0,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_COMPLETENESS);
  });

  test('should calculate average completeness across all tools', () => {
    const avgCompleteness = metrics.reduce((sum, m) => sum + m.completeness, 0) / metrics.length;
    expect(avgCompleteness).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_COMPLETENESS);
  });
});

/**
 * Test response clarity for all tools
 */
describe('Response Quality Tests - Clarity', () => {
  let server: MCPServer;
  let metrics: QualityMetrics[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json'
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test('should provide clear responses for endpoint tool', async () => {
    const query = 'get customer by id';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateClarity(endpoint);

    const metric: QualityMetrics = {
      toolName: 'endpoint',
      endpoint: endpoint?.path,
      query,
      accuracy: 0,
      completeness: 0,
      clarity: validation.score,
      usefulness: 0,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_CLARITY);
  });

  test('should provide clear responses for parameters tool', async () => {
    const query = 'what parameters does create customer need';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateClarity(endpoint);

    const metric: QualityMetrics = {
      toolName: 'parameters',
      endpoint: endpoint?.path,
      query,
      accuracy: 0,
      completeness: 0,
      clarity: validation.score,
      usefulness: 0,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_CLARITY);
  });

  test('should provide clear responses for responses tool', async () => {
    const query = 'what does the customer endpoint return';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateClarity(endpoint);

    const metric: QualityMetrics = {
      toolName: 'responses',
      endpoint: endpoint?.path,
      query,
      accuracy: 0,
      completeness: 0,
      clarity: validation.score,
      usefulness: 0,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_CLARITY);
  });

  test('should calculate average clarity across all tools', () => {
    const avgClarity = metrics.reduce((sum, m) => sum + m.clarity, 0) / metrics.length;
    expect(avgClarity).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_CLARITY);
  });
});

/**
 * Test response usefulness for all tools
 */
describe('Response Quality Tests - Usefulness', () => {
  let server: MCPServer;
  let metrics: QualityMetrics[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json'
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test('should provide useful responses for endpoint tool', async () => {
    const query = 'get customer by id';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateUsefulness(query, endpoint);

    const metric: QualityMetrics = {
      toolName: 'endpoint',
      endpoint: endpoint?.path,
      query,
      accuracy: 0,
      completeness: 0,
      clarity: 0,
      usefulness: validation.score,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_USEFULNESS);
  });

  test('should provide useful responses for parameters tool', async () => {
    const query = 'what parameters does create customer need';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateUsefulness(query, endpoint);

    const metric: QualityMetrics = {
      toolName: 'parameters',
      endpoint: endpoint?.path,
      query,
      accuracy: 0,
      completeness: 0,
      clarity: 0,
      usefulness: validation.score,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_USEFULNESS);
  });

  test('should provide useful responses for responses tool', async () => {
    const query = 'what does the customer endpoint return';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const validation = validateUsefulness(query, endpoint);

    const metric: QualityMetrics = {
      toolName: 'responses',
      endpoint: endpoint?.path,
      query,
      accuracy: 0,
      completeness: 0,
      clarity: 0,
      usefulness: validation.score,
      overallQuality: 0,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(validation.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_USEFULNESS);
  });

  test('should calculate average usefulness across all tools', () => {
    const avgUsefulness = metrics.reduce((sum, m) => sum + m.usefulness, 0) / metrics.length;
    expect(avgUsefulness).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_USEFULNESS);
  });
});

/**
 * Test overall quality for all tools
 */
describe('Response Quality Tests - Overall Quality', () => {
  let server: MCPServer;
  let metrics: QualityMetrics[] = [];

  beforeAll(async () => {
    server = new MCPServer({
      configPath: './config/default.json'
    });
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test('should provide high quality responses for endpoint tool', async () => {
    const query = 'get customer by id';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const accuracyValidation = validateAccuracy(
      { resource: 'Customer', operation: 'Get Customer', method: 'GET' },
      endpoint,
      ['resource', 'operation', 'method']
    );
    const completenessValidation = validateCompleteness(endpoint, endpoint);
    const clarityValidation = validateClarity(endpoint);
    const usefulnessValidation = validateUsefulness(query, endpoint);

    const overallQuality = calculateOverallQuality(
      accuracyValidation.score,
      completenessValidation.score,
      clarityValidation.score,
      usefulnessValidation.score
    );

    const metric: QualityMetrics = {
      toolName: 'endpoint',
      endpoint: endpoint?.path,
      query,
      accuracy: accuracyValidation.score,
      completeness: completenessValidation.score,
      clarity: clarityValidation.score,
      usefulness: usefulnessValidation.score,
      overallQuality,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(overallQuality).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_OVERALL_QUALITY);
  });

  test('should provide high quality responses for parameters tool', async () => {
    const query = 'what parameters does create customer need';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const accuracyValidation = validateAccuracy(
      { resource: 'Customer', operation: 'Create Customer' },
      endpoint,
      ['resource', 'operation']
    );
    const completenessValidation = validateCompleteness(endpoint, endpoint);
    const clarityValidation = validateClarity(endpoint);
    const usefulnessValidation = validateUsefulness(query, endpoint);

    const overallQuality = calculateOverallQuality(
      accuracyValidation.score,
      completenessValidation.score,
      clarityValidation.score,
      usefulnessValidation.score
    );

    const metric: QualityMetrics = {
      toolName: 'parameters',
      endpoint: endpoint?.path,
      query,
      accuracy: accuracyValidation.score,
      completeness: completenessValidation.score,
      clarity: clarityValidation.score,
      usefulness: usefulnessValidation.score,
      overallQuality,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(overallQuality).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_OVERALL_QUALITY);
  });

  test('should provide high quality responses for responses tool', async () => {
    const query = 'what does the customer endpoint return';
    const result = await server.handleQuery(query);

    const endpoint = result.endpoints[0];
    const accuracyValidation = validateAccuracy(
      { resource: 'Customer' },
      endpoint,
      ['resource']
    );
    const completenessValidation = validateCompleteness(endpoint, endpoint);
    const clarityValidation = validateClarity(endpoint);
    const usefulnessValidation = validateUsefulness(query, endpoint);

    const overallQuality = calculateOverallQuality(
      accuracyValidation.score,
      completenessValidation.score,
      clarityValidation.score,
      usefulnessValidation.score
    );

    const metric: QualityMetrics = {
      toolName: 'responses',
      endpoint: endpoint?.path,
      query,
      accuracy: accuracyValidation.score,
      completeness: completenessValidation.score,
      clarity: clarityValidation.score,
      usefulness: usefulnessValidation.score,
      overallQuality,
      timestamp: new Date().toISOString()
    };

    metrics.push(metric);

    expect(overallQuality).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_OVERALL_QUALITY);
  });

  test('should calculate average overall quality across all tools', () => {
    const avgOverallQuality = metrics.reduce((sum, m) => sum + m.overallQuality, 0) / metrics.length;
    expect(avgOverallQuality).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_OVERALL_QUALITY);
  });

  test('should export quality metrics', () => {
    expect(metrics.length).toBeGreaterThan(0);
    metrics.forEach(metric => {
      expect(metric).toHaveProperty('toolName');
      expect(metric).toHaveProperty('accuracy');
      expect(metric).toHaveProperty('completeness');
      expect(metric).toHaveProperty('clarity');
      expect(metric).toHaveProperty('usefulness');
      expect(metric).toHaveProperty('overallQuality');
      expect(metric).toHaveProperty('timestamp');
    });
  });
});

/**
 * Create quality metrics report
 */
export function createQualityMetricsReport(metrics: QualityMetrics[]): string {
  const report = {
    summary: {
      totalTests: metrics.length,
      averageAccuracy: metrics.reduce((sum, m) => sum + m.accuracy, 0) / metrics.length,
      averageCompleteness: metrics.reduce((sum, m) => sum + m.completeness, 0) / metrics.length,
      averageClarity: metrics.reduce((sum, m) => sum + m.clarity, 0) / metrics.length,
      averageUsefulness: metrics.reduce((sum, m) => sum + m.usefulness, 0) / metrics.length,
      averageOverallQuality: metrics.reduce((sum, m) => sum + m.overallQuality, 0) / metrics.length
    },
    byTool: {} as Record<string, any>,
    thresholds: QUALITY_THRESHOLDS,
    metrics
  };

  // Group by tool
  metrics.forEach(metric => {
    if (!report.byTool[metric.toolName]) {
      report.byTool[metric.toolName] = [];
    }
    report.byTool[metric.toolName].push(metric);
  });

  // Calculate averages per tool
  Object.keys(report.byTool).forEach(toolName => {
    const toolMetrics = report.byTool[toolName];
    report.byTool[toolName] = {
      count: toolMetrics.length,
      averageAccuracy: toolMetrics.reduce((sum: number, m: QualityMetrics) => sum + m.accuracy, 0) / toolMetrics.length,
      averageCompleteness: toolMetrics.reduce((sum: number, m: QualityMetrics) => sum + m.completeness, 0) / toolMetrics.length,
      averageClarity: toolMetrics.reduce((sum: number, m: QualityMetrics) => sum + m.clarity, 0) / toolMetrics.length,
      averageUsefulness: toolMetrics.reduce((sum: number, m: QualityMetrics) => sum + m.usefulness, 0) / toolMetrics.length,
      averageOverallQuality: toolMetrics.reduce((sum: number, m: QualityMetrics) => sum + m.overallQuality, 0) / toolMetrics.length,
      metrics: toolMetrics
    };
  });

  return JSON.stringify(report, null, 2);
}
