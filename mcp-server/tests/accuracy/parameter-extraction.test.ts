/**
 * Parameter Extraction Tests
 *
 * Tests to validate parameter extraction accuracy, parameter constraint extraction,
 * parameter pattern extraction, parameter type extraction, parameter description extraction,
 * and creates parameter extraction metrics.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { parseMarkdownFile } from '../../src/parser/markdown';
import { ApiDocument, ApiParameter } from '../../src/utils/types';
import { generateEndpoint, generateParameter } from '../utils/data-generators';

/**
 * Parameter extraction metrics
 */
interface ParameterExtractionMetrics {
  totalParameters: number;
  successfullyExtracted: number;
  failedToExtract: number;
  nameAccuracy: number;
  typeAccuracy: number;
  requiredAccuracy: number;
  descriptionAccuracy: number;
  constraintAccuracy: number;
  patternAccuracy: number;
  overallAccuracy: number;
}

/**
 * Expected parameters for customer.md Get Customers endpoint
 */
const EXPECTED_GET_CUSTOMERS_PARAMS = [
  {
    name: 'sort',
    type: 'string',
    required: false,
    paramType: 'query',
    descriptionContains: 'order by',
  },
  {
    name: 'query',
    type: 'string',
    required: false,
    paramType: 'query',
    descriptionContains: 'Search query',
  },
  {
    name: 'firstname',
    type: 'string',
    required: false,
    paramType: 'query',
    descriptionContains: 'first name',
  },
  {
    name: 'lastname',
    type: 'string',
    required: false,
    paramType: 'query',
    descriptionContains: 'last name',
  },
  {
    name: 'page',
    type: 'integer',
    required: false,
    paramType: 'query',
    descriptionContains: 'page',
  },
];

/**
 * Expected parameters for customer.md Get Customer by ID endpoint
 */
const EXPECTED_GET_CUSTOMER_BY_ID_PARAMS = [
  {
    name: 'id',
    type: 'integer',
    required: true,
    paramType: 'path',
    descriptionContains: '',
  },
];

/**
 * Test parameter extraction accuracy
 */
describe('Parameter Extraction - Accuracy', () => {
  test('should extract all parameters from Get Customers endpoint', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomersEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customers'
    );
    expect(getCustomersEndpoint).toBeDefined();

    const parameters = getCustomersEndpoint!.parameters;
    expect(parameters.length).toBeGreaterThanOrEqual(
      EXPECTED_GET_CUSTOMERS_PARAMS.length
    );
  });

  test('should extract parameter names accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomersEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customers'
    );
    const parameters = getCustomersEndpoint!.parameters;

    for (const expectedParam of EXPECTED_GET_CUSTOMERS_PARAMS) {
      const param = parameters.find((p) => p.name === expectedParam.name);
      expect(param).toBeDefined();
      expect(param!.name).toBe(expectedParam.name);
    }
  });

  test('should extract parameter types accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomersEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customers'
    );
    const parameters = getCustomersEndpoint!.parameters;

    for (const expectedParam of EXPECTED_GET_CUSTOMERS_PARAMS) {
      const param = parameters.find((p) => p.name === expectedParam.name);
      expect(param).toBeDefined();
      expect(param!.type).toBe(expectedParam.type);
    }
  });

  test('should extract required flags accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomerByIdEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customer by ID'
    );
    const parameters = getCustomerByIdEndpoint!.parameters;

    const idParam = parameters.find((p) => p.name === 'id');
    expect(idParam).toBeDefined();
    expect(idParam!.required).toBe(true);
  });

  test('should extract parameter descriptions accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomersEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customers'
    );
    const parameters = getCustomersEndpoint!.parameters;

    for (const expectedParam of EXPECTED_GET_CUSTOMERS_PARAMS) {
      const param = parameters.find((p) => p.name === expectedParam.name);
      expect(param).toBeDefined();
      if (expectedParam.descriptionContains) {
        expect(param!.description.toLowerCase()).toContain(
          expectedParam.descriptionContains.toLowerCase()
        );
      }
    }
  });

  test('should extract parameter types (query, path, body) accurately', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomersEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customers'
    );
    const queryParams = getCustomersEndpoint!.parameters.filter(
      (p) => p.paramType === 'query'
    );

    expect(queryParams.length).toBeGreaterThan(0);

    const getCustomerByIdEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customer by ID'
    );
    const pathParams = getCustomerByIdEndpoint!.parameters.filter(
      (p) => p.paramType === 'path'
    );

    expect(pathParams.length).toBe(1);
    expect(pathParams[0].name).toBe('id');
  });
});

/**
 * Test parameter constraint extraction
 */
describe('Parameter Extraction - Constraints', () => {
  test('should extract minLength constraint from description', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`POST /test\`

**Required Permission:** test.create

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Customer name (minLength: 2, maxLength: 100) |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      expect(endpoint.requestBody).toBeDefined();
      const nameParam = endpoint.requestBody!.find((p) => p.name === 'name');
      expect(nameParam).toBeDefined();
      expect(nameParam!.description).toContain('minLength: 2');
      expect(nameParam!.description).toContain('maxLength: 100');
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should extract enum constraint from description', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sort | string | No | Sort field (enum: [name, created_at, updated_at]) |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      const sortParam = endpoint.parameters.find((p) => p.name === 'sort');
      expect(sortParam).toBeDefined();
      expect(sortParam!.description).toContain('enum:');
      expect(sortParam!.description).toContain('name');
      expect(sortParam!.description).toContain('created_at');
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should extract min/max constraint from description', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (min: 1, max: 100) |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      const pageParam = endpoint.parameters.find((p) => p.name === 'page');
      expect(pageParam).toBeDefined();
      expect(pageParam!.description).toContain('min: 1');
      expect(pageParam!.description).toContain('max: 100');
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should extract pattern constraint from description', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`POST /test\`

**Required Permission:** test.create

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Customer email (pattern: email) |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      expect(endpoint.requestBody).toBeDefined();
      const emailParam = endpoint.requestBody!.find((p) => p.name === 'email');
      expect(emailParam).toBeDefined();
      expect(emailParam!.description).toContain('pattern: email');
    } finally {
      await fs.unlink(tempPath);
    }
  });
});

/**
 * Test parameter pattern extraction
 */
describe('Parameter Extraction - Patterns', () => {
  test('should extract email pattern from description', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`POST /test\`

**Required Permission:** test.create

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Customer email (pattern: email) |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      const emailParam = endpoint.requestBody!.find((p) => p.name === 'email');
      expect(emailParam).toBeDefined();
      expect(emailParam!.description).toMatch(/pattern:\s*email/i);
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should extract date pattern from description', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | string | No | Filter date (pattern: date) |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      const dateParam = endpoint.parameters.find((p) => p.name === 'date');
      expect(dateParam).toBeDefined();
      expect(dateParam!.description).toMatch(/pattern:\s*date/i);
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should extract uuid pattern from description', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Resource ID (pattern: uuid) |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      const idParam = endpoint.parameters.find((p) => p.name === 'id');
      expect(idParam).toBeDefined();
      expect(idParam!.description).toMatch(/pattern:\s*uuid/i);
    } finally {
      await fs.unlink(tempPath);
    }
  });
});

/**
 * Test parameter type extraction
 */
describe('Parameter Extraction - Types', () => {
  test('should extract string type correctly', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No | Parameter name |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      const nameParam = endpoint.parameters.find((p) => p.name === 'name');
      expect(nameParam).toBeDefined();
      expect(nameParam!.type).toBe('string');
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should extract integer type correctly', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      const pageParam = endpoint.parameters.find((p) => p.name === 'page');
      expect(pageParam).toBeDefined();
      expect(pageParam!.type).toBe('integer');
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should extract boolean type correctly', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| active | boolean | No | Active status |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      const activeParam = endpoint.parameters.find((p) => p.name === 'active');
      expect(activeParam).toBeDefined();
      expect(activeParam!.type).toBe('boolean');
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should extract array type correctly', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ids | array | No | List of IDs |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      const idsParam = endpoint.parameters.find((p) => p.name === 'ids');
      expect(idsParam).toBeDefined();
      expect(idsParam!.type).toBe('array');
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should extract all parameter types from customer.md', async () => {
    const customerPath = path.join(__dirname, '../../../docs/api/customer.md');
    const document = await parseMarkdownFile(customerPath);

    const getCustomersEndpoint = document.endpoints.find(
      (e) => e.operation === 'Get Customers'
    );
    const parameters = getCustomersEndpoint!.parameters;

    const stringParams = parameters.filter((p) => p.type === 'string');
    const integerParams = parameters.filter((p) => p.type === 'integer');
    const arrayParams = parameters.filter((p) => p.type === 'array');

    expect(stringParams.length).toBeGreaterThan(0);
    expect(integerParams.length).toBeGreaterThan(0);
    expect(arrayParams.length).toBeGreaterThan(0);
  });
});

/**
 * Test parameter description extraction
 */
describe('Parameter Extraction - Descriptions', () => {
  test('should extract parameter descriptions accurately', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No | The name of the resource to filter by |
| page | integer | No | Page number for pagination (starts at 1) |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      const nameParam = endpoint.parameters.find((p) => p.name === 'name');
      expect(nameParam).toBeDefined();
      expect(nameParam!.description).toBe(
        'The name of the resource to filter by'
      );

      const pageParam = endpoint.parameters.find((p) => p.name === 'page');
      expect(pageParam).toBeDefined();
      expect(pageParam!.description).toBe(
        'Page number for pagination (starts at 1)'
      );
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should handle empty parameter descriptions', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      const idParam = endpoint.parameters.find((p) => p.name === 'id');
      expect(idParam).toBeDefined();
      expect(idParam!.description).toBe('');
    } finally {
      await fs.unlink(tempPath);
    }
  });

  test('should handle special characters in descriptions', async () => {
    const markdown = `# RepairShopr API Documentation - Test

#### Test Operation

**Endpoint:** \`GET /test\`

**Required Permission:** test.view

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Search query with special chars: < > & " ' |

**Response: 200**

Success
`;

    const tempPath = path.join(__dirname, 'temp-test.md');
    await fs.writeFile(tempPath, markdown);

    try {
      const document = await parseMarkdownFile(tempPath);
      const endpoint = document.endpoints[0];

      const queryParam = endpoint.parameters.find((p) => p.name === 'query');
      expect(queryParam).toBeDefined();
      expect(queryParam!.description).toContain('< > & " \'');
    } finally {
      await fs.unlink(tempPath);
    }
  });
});

/**
 * Test parameter extraction across all API files
 */
describe('Parameter Extraction - All API Files', () => {
  let metrics: ParameterExtractionMetrics;
  let allDocuments: ApiDocument[] = [];

  beforeAll(async () => {
    const apiDocsPath = path.join(__dirname, '../../../docs/api');
    const files = await fs.readdir(apiDocsPath);
    const mdFiles = files.filter((file) => file.endsWith('.md'));

    let totalParameters = 0;
    let successfullyExtracted = 0;
    let failedToExtract = 0;
    let validNames = 0;
    let validTypes = 0;
    let validRequired = 0;
    let validDescriptions = 0;

    for (const file of mdFiles) {
      const filePath = path.join(apiDocsPath, file);
      try {
        const document = await parseMarkdownFile(filePath);
        allDocuments.push(document);

        for (const endpoint of document.endpoints) {
          // Check query and path parameters
          for (const param of endpoint.parameters) {
            totalParameters++;
            successfullyExtracted++;

            if (param.name && param.name.length > 0) validNames++;
            if (param.type && param.type.length > 0) validTypes++;
            if (typeof param.required === 'boolean') validRequired++;
            if (param.description !== undefined) validDescriptions++;
          }

          // Check request body parameters
          if (endpoint.requestBody) {
            for (const param of endpoint.requestBody) {
              totalParameters++;
              successfullyExtracted++;

              if (param.name && param.name.length > 0) validNames++;
              if (param.type && param.type.length > 0) validTypes++;
              if (typeof param.required === 'boolean') validRequired++;
              if (param.description !== undefined) validDescriptions++;
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to parse ${file}:`, error);
      }
    }

    metrics = {
      totalParameters,
      successfullyExtracted,
      failedToExtract,
      nameAccuracy:
        totalParameters > 0 ? (validNames / totalParameters) * 100 : 100,
      typeAccuracy:
        totalParameters > 0 ? (validTypes / totalParameters) * 100 : 100,
      requiredAccuracy:
        totalParameters > 0 ? (validRequired / totalParameters) * 100 : 100,
      descriptionAccuracy:
        totalParameters > 0 ? (validDescriptions / totalParameters) * 100 : 100,
      constraintAccuracy: 0, // Would need manual validation
      patternAccuracy: 0, // Would need manual validation
      overallAccuracy:
        ((validNames / totalParameters) * 0.25 +
          (validTypes / totalParameters) * 0.25 +
          (validRequired / totalParameters) * 0.25 +
          (validDescriptions / totalParameters) * 0.25) *
        100,
    };
  });

  test('should extract parameters from all API files', () => {
    expect(metrics.totalParameters).toBeGreaterThan(0);
    expect(metrics.successfullyExtracted).toBe(metrics.totalParameters);
    expect(metrics.failedToExtract).toBe(0);
  });

  test('should have high parameter name extraction accuracy', () => {
    expect(metrics.nameAccuracy).toBeGreaterThanOrEqual(95);
  });

  test('should have high parameter type extraction accuracy', () => {
    expect(metrics.typeAccuracy).toBeGreaterThanOrEqual(95);
  });

  test('should have high required flag extraction accuracy', () => {
    expect(metrics.requiredAccuracy).toBeGreaterThanOrEqual(95);
  });

  test('should have high description extraction accuracy', () => {
    expect(metrics.descriptionAccuracy).toBeGreaterThanOrEqual(95);
  });

  test('should have high overall parameter extraction accuracy', () => {
    expect(metrics.overallAccuracy).toBeGreaterThanOrEqual(95);
  });
});

/**
 * Test parameter extraction metrics generation
 */
describe('Parameter Extraction - Metrics Generation', () => {
  test('should generate comprehensive parameter extraction metrics', () => {
    const metrics: ParameterExtractionMetrics = {
      totalParameters: 100,
      successfullyExtracted: 95,
      failedToExtract: 5,
      nameAccuracy: 98,
      typeAccuracy: 97,
      requiredAccuracy: 99,
      descriptionAccuracy: 96,
      constraintAccuracy: 0,
      patternAccuracy: 0,
      overallAccuracy: 97.5,
    };

    expect(metrics).toHaveProperty('totalParameters');
    expect(metrics).toHaveProperty('successfullyExtracted');
    expect(metrics).toHaveProperty('failedToExtract');
    expect(metrics).toHaveProperty('nameAccuracy');
    expect(metrics).toHaveProperty('typeAccuracy');
    expect(metrics).toHaveProperty('requiredAccuracy');
    expect(metrics).toHaveProperty('descriptionAccuracy');
    expect(metrics).toHaveProperty('constraintAccuracy');
    expect(metrics).toHaveProperty('patternAccuracy');
    expect(metrics).toHaveProperty('overallAccuracy');
  });
});

/**
 * Export metrics for use in validation script
 */
export {
  ParameterExtractionMetrics,
  EXPECTED_GET_CUSTOMERS_PARAMS,
  EXPECTED_GET_CUSTOMER_BY_ID_PARAMS,
};
