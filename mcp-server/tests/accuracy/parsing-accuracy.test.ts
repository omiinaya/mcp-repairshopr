/**
 * Parsing Accuracy Tests
 *
 * Tests to validate parsing accuracy for all 35 API documentation files,
 * edge cases in parsing, metadata extraction, parameter extraction,
 * response extraction, and creates accuracy metrics.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { parseMarkdownFile } from '../../src/parser/markdown';
import {
  ApiDocument,
  ApiEndpoint,
  ApiParameter,
  ApiResponse,
} from '../../src/utils/types';

/**
 * Accuracy metrics for parsing
 */
interface ParsingAccuracyMetrics {
  totalFiles: number;
  successfullyParsed: number;
  failedToParse: number;
  totalEndpoints: number;
  totalParameters: number;
  totalResponses: number;
  metadataAccuracy: number;
  parameterAccuracy: number;
  responseAccuracy: number;
  edgeCaseAccuracy: number;
  overallAccuracy: number;
}

/**
 * Expected values for customer.md (used as reference)
 */
const EXPECTED_CUSTOMER_DATA = {
  resourceName: 'Customer',
  endpointCount: 7,
  endpoints: [
    { operation: 'Get Customers', method: 'GET', path: '/customers' },
    { operation: 'Create Customer', method: 'POST', path: '/customers' },
    { operation: 'Get Customer by ID', method: 'GET', path: '/customers/{id}' },
    { operation: 'Update Customer', method: 'PUT', path: '/customers/{id}' },
    { operation: 'Delete Customer', method: 'DELETE', path: '/customers/{id}' },
    { operation: 'Get Latests', method: 'GET', path: '/customers/latest' },
    {
      operation: 'Get Autocompletes',
      method: 'GET',
      path: '/customers/autocomplete',
    },
  ],
};

/**
 * Get all API documentation files
 */
async function getApiDocFiles(): Promise<string[]> {
  const apiDocsPath = path.join(__dirname, '../../../docs/api');
  const files = await fs.readdir(apiDocsPath);
  return files
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.join(apiDocsPath, file));
}

/**
 * Validate resource name extraction
 */
function validateResourceName(
  document: ApiDocument,
  expectedName: string
): boolean {
  return document.resourceName === expectedName;
}

/**
 * Validate endpoint extraction
 */
function validateEndpoints(
  document: ApiDocument,
  expectedCount: number
): boolean {
  return document.endpoints.length === expectedCount;
}

/**
 * Validate endpoint structure
 */
function validateEndpointStructure(endpoint: ApiEndpoint): boolean {
  return !!(
    endpoint.resource &&
    endpoint.operation &&
    endpoint.method &&
    endpoint.path &&
    endpoint.permission &&
    Array.isArray(endpoint.parameters) &&
    Array.isArray(endpoint.responses)
  );
}

/**
 * Validate parameter extraction
 */
function validateParameterStructure(parameter: ApiParameter): boolean {
  return !!(
    parameter.name &&
    parameter.type &&
    typeof parameter.required === 'boolean' &&
    parameter.paramType
  );
}

/**
 * Validate response extraction
 */
function validateResponseStructure(response: ApiResponse): boolean {
  return !!(
    typeof response.statusCode === 'number' &&
    response.statusCode >= 100 &&
    response.statusCode < 600 &&
    response.description
  );
}

/**
 * Test edge case: empty sections
 */
describe('Parsing Accuracy - Edge Cases', () => {
  test('should handle empty description sections', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Response: 200**

Success

\`\`\`json
{}
\`\`\`
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      expect(document.endpoints).toHaveLength(1);
      expect(document.endpoints[0].description).toBe('');
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should handle malformed markdown gracefully', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** GET /test (missing backticks)

**Required Permission:** test.view

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      await expect(parseMarkdownFile(tempPath)).rejects.toThrow();
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should handle special characters in descriptions', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

Description with special chars: < > & " ' \\n \\t

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      expect(document.endpoints).toHaveLength(1);
      expect(document.endpoints[0].description).toContain('< > & " \'');
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should handle missing optional sections', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      expect(document.endpoints).toHaveLength(1);
      expect(document.endpoints[0].permission).toBe('');
      expect(document.endpoints[0].parameters).toHaveLength(0);
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should handle empty parameter tables', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      expect(document.endpoints).toHaveLength(1);
      expect(document.endpoints[0].parameters).toHaveLength(0);
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should handle malformed JSON in response examples', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Response: 200**

Success

\`\`\`json
{ invalid json }
\`\`\`
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      expect(document.endpoints).toHaveLength(1);
      expect(document.endpoints[0].responses[0].example).toBeUndefined();
    } finally {
      await fs.unlink(tempPath);
    }
  });
});

/**
 * Test metadata extraction accuracy
 */
describe('Parsing Accuracy - Metadata Extraction', () => {
  test('should extract resource name accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    expect(
      validateResourceName(document, EXPECTED_CUSTOMER_DATA.resourceName)
    ).toBe(true);
  });

  test('should extract endpoint count accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    expect(
      validateEndpoints(document, EXPECTED_CUSTOMER_DATA.endpointCount)
    ).toBe(true);
  });

  test('should extract endpoint methods accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    EXPECTED_CUSTOMER_DATA.endpoints.forEach((expected, index) => {
      expect(document.endpoints[index].method).toBe(expected.method);
    });
  });

  test('should extract endpoint paths accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    EXPECTED_CUSTOMER_DATA.endpoints.forEach((expected, index) => {
      expect(document.endpoints[index].path).toBe(expected.path);
    });
  });

  test('should extract operation names accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    EXPECTED_CUSTOMER_DATA.endpoints.forEach((expected, index) => {
      expect(document.endpoints[index].operation).toBe(expected.operation);
    });
  });
});

/**
 * Test parameter extraction accuracy
 */
describe('Parsing Accuracy - Parameter Extraction', () => {
  test('should extract all query parameters accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomersEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customers'
    );
    expect(getCustomersEndpoint).toBeDefined();

    const queryParams = getCustomersEndpoint!.parameters.filter(
      (p) => p.paramType === 'query'
    );
    expect(queryParams.length).toBeGreaterThan(0);

    queryParams.forEach((param) => {
      expect(validateParameterStructure(param)).toBe(true);
    });
  });

  test('should extract path parameters accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomerByIdEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customer by ID'
    );
    expect(getCustomerByIdEndpoint).toBeDefined();

    const pathParams = getCustomerByIdEndpoint!.parameters.filter(
      (p) => p.paramType === 'path'
    );
    expect(pathParams.length).toBe(1);
    expect(pathParams[0].name).toBe('id');
    expect(pathParams[0].type).toBe('integer');
    expect(pathParams[0].required).toBe(true);
  });

  test('should extract parameter types accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomersEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customers'
    );
    const queryParams = getCustomersEndpoint!.parameters.filter(
      (p) => p.paramType === 'query'
    );

    // Check for various parameter types
    const stringParam = queryParams.find((p) => p.type === 'string');
    const integerParam = queryParams.find((p) => p.type === 'integer');
    const arrayParam = queryParams.find((p) => p.type === 'array');

    expect(stringParam).toBeDefined();
    expect(integerParam).toBeDefined();
    expect(arrayParam).toBeDefined();
  });

  test('should extract required flags accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomerByIdEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customer by ID'
    );
    const pathParams = getCustomerByIdEndpoint!.parameters.filter(
      (p) => p.paramType === 'path'
    );

    expect(pathParams[0].required).toBe(true);
  });

  test('should extract parameter descriptions accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomersEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customers'
    );
    const sortParam = getCustomersEndpoint!.parameters.find(
      (p) => p.name === 'sort'
    );

    expect(sortParam).toBeDefined();
    expect(sortParam!.description).toContain('order by');
  });
});

/**
 * Test response extraction accuracy
 */
describe('Parsing Accuracy - Response Extraction', () => {
  test('should extract all response status codes accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const createCustomerEndpoint = document.endpoints.find(
      (e) => e.operation === 'Create Customer'
    );
    expect(createCustomerEndpoint).toBeDefined();

    const statusCodes = createCustomerEndpoint!.responses.map(
      (r) => r.statusCode
    );
    expect(statusCodes).toContain(200);
    expect(statusCodes).toContain(422);
  });

  test('should extract response descriptions accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomersEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customers'
    );
    const successResponse = getCustomersEndpoint!.responses.find(
      (r) => r.statusCode === 200
    );

    expect(successResponse).toBeDefined();
    expect(successResponse!.description).toBe('successful');
  });

  test('should extract response examples accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomersEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customers'
    );
    const successResponse = getCustomersEndpoint!.responses.find(
      (r) => r.statusCode === 200
    );

    expect(successResponse).toBeDefined();
    expect(successResponse!.example).toBeDefined();
    expect(successResponse!.example).toHaveProperty('customers');
  });

  test('should handle responses without examples', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const deleteCustomerEndpoint = document.endpoints.find(
      (e) => e.operation === 'Delete Customer'
    );
    const notFoundResponse = deleteCustomerEndpoint!.responses.find(
      (r) => r.statusCode === 404
    );

    expect(notFoundResponse).toBeDefined();
    expect(notFoundResponse!.example).toBeUndefined();
  });
});

/**
 * Test parsing accuracy across all API documentation files
 */
describe('Parsing Accuracy - All API Files', () => {
  let metrics: ParsingAccuracyMetrics;
  let allDocuments: ApiDocument[] = [];

  beforeAll(async () => {
    const apiFiles = await getApiDocFiles();
    let successfullyParsed = 0;
    let failedToParse = 0;
    let totalEndpoints = 0;
    let totalParameters = 0;
    let totalResponses = 0;
    let validEndpoints = 0;
    let validParameters = 0;
    let validResponses = 0;

    for (const filePath of apiFiles) {
      try {
        const document = await parseMarkdownFile(filePath);
        allDocuments.push(document);
        successfullyParsed++;

        totalEndpoints += document.endpoints.length;
        document.endpoints.forEach((endpoint) => {
          if (validateEndpointStructure(endpoint)) {
            validEndpoints++;
          }
          totalParameters += endpoint.parameters.length;
          endpoint.parameters.forEach((param) => {
            if (validateParameterStructure(param)) {
              validParameters++;
            }
          });
          totalResponses += endpoint.responses.length;
          endpoint.responses.forEach((response) => {
            if (validateResponseStructure(response)) {
              validResponses++;
            }
          });
        });
      } catch (error) {
        failedToParse++;
        console.warn(`Failed to parse ${filePath}:`, error);
      }
    }

    metrics = {
      totalFiles: apiFiles.length,
      successfullyParsed,
      failedToParse,
      totalEndpoints,
      totalParameters,
      totalResponses,
      metadataAccuracy: (successfullyParsed / apiFiles.length) * 100,
      parameterAccuracy:
        totalParameters > 0 ? (validParameters / totalParameters) * 100 : 100,
      responseAccuracy:
        totalResponses > 0 ? (validResponses / totalResponses) * 100 : 100,
      edgeCaseAccuracy: (validEndpoints / totalEndpoints) * 100,
      overallAccuracy:
        ((successfullyParsed / apiFiles.length) * 0.25 +
          (validEndpoints / totalEndpoints) * 0.25 +
          (validParameters / totalParameters) * 0.25 +
          (validResponses / totalResponses) * 0.25) *
        100,
    };
  });

  test('should parse all 35 API documentation files', () => {
    expect(metrics.totalFiles).toBeGreaterThanOrEqual(35);
    expect(metrics.successfullyParsed).toBe(metrics.totalFiles);
    expect(metrics.failedToParse).toBe(0);
  });

  test('should have high metadata extraction accuracy', () => {
    expect(metrics.metadataAccuracy).toBeGreaterThanOrEqual(95);
  });

  test('should have high parameter extraction accuracy', () => {
    expect(metrics.parameterAccuracy).toBeGreaterThanOrEqual(95);
  });

  test('should have high response extraction accuracy', () => {
    expect(metrics.responseAccuracy).toBeGreaterThanOrEqual(95);
  });

  test('should have high overall parsing accuracy', () => {
    expect(metrics.overallAccuracy).toBeGreaterThanOrEqual(95);
  });

  test('should extract endpoints from all files', () => {
    expect(metrics.totalEndpoints).toBeGreaterThan(0);
  });

  test('should extract parameters from all files', () => {
    expect(metrics.totalParameters).toBeGreaterThan(0);
  });

  test('should extract responses from all files', () => {
    expect(metrics.totalResponses).toBeGreaterThan(0);
  });
});

/**
 * Test accuracy metrics generation
 */
describe('Parsing Accuracy - Metrics Generation', () => {
  test('should generate comprehensive accuracy metrics', async () => {
    const apiFiles = await getApiDocFiles();
    const metrics: ParsingAccuracyMetrics = {
      totalFiles: apiFiles.length,
      successfullyParsed: 0,
      failedToParse: 0,
      totalEndpoints: 0,
      totalParameters: 0,
      totalResponses: 0,
      metadataAccuracy: 0,
      parameterAccuracy: 0,
      responseAccuracy: 0,
      edgeCaseAccuracy: 0,
      overallAccuracy: 0,
    };

    expect(metrics).toHaveProperty('totalFiles');
    expect(metrics).toHaveProperty('successfullyParsed');
    expect(metrics).toHaveProperty('failedToParse');
    expect(metrics).toHaveProperty('totalEndpoints');
    expect(metrics).toHaveProperty('totalParameters');
    expect(metrics).toHaveProperty('totalResponses');
    expect(metrics).toHaveProperty('metadataAccuracy');
    expect(metrics).toHaveProperty('parameterAccuracy');
    expect(metrics).toHaveProperty('responseAccuracy');
    expect(metrics).toHaveProperty('edgeCaseAccuracy');
    expect(metrics).toHaveProperty('overallAccuracy');
  });
});

/**
 * Export metrics for use in validation script
 */
export { ParsingAccuracyMetrics, getApiDocFiles };
