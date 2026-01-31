/**
 * Code example generator tool for RepairShopr API documentation
 *
 * This module provides code examples in multiple languages (JavaScript, Python, cURL)
 * for API endpoints, including authentication, request/response examples, and error handling.
 */

import { ApiEndpoint, ApiParameter, ApiResponse } from '../utils/types';
import { MetadataIndex, getEndpointByPath } from '../parser/metadata';

/**
 * Supported programming languages for code examples
 */
export type CodeLanguage = 'javascript' | 'python' | 'curl';

/**
 * Parameters for generating code examples
 */
export interface CodeExampleParams {
  /** Endpoint path (e.g., /customers/{id}) */
  endpointPath: string;
  /** HTTP method (GET, POST, PUT, DELETE, PATCH) */
  method: string;
  /** Programming language for the code example */
  language: CodeLanguage;
  /** Whether to include authentication in the example */
  includeAuth?: boolean;
}

/**
 * Result of code example generation
 */
export interface CodeExampleResult {
  /** The endpoint information */
  endpoint: {
    resource: string;
    operation: string;
    description: string;
    method: string;
    path: string;
  };
  /** The generated code example */
  code: string;
  /** Language of the code example */
  language: CodeLanguage;
  /** Whether authentication is included */
  includesAuth: boolean;
  /** Example request data (if applicable) */
  exampleRequest?: any;
  /** Example response data (if available) */
  exampleResponse?: any;
  /** Error handling example */
  errorHandling: string;
}

/**
 * Template for JavaScript code examples
 */
function generateJavaScriptExample(
  endpoint: ApiEndpoint,
  includeAuth: boolean
): { code: string; errorHandling: string } {
  const { method, path, parameters, requestBody, responses } = endpoint;
  const pathParams = parameters.filter(p => p.paramType === 'path');
  const queryParams = parameters.filter(p => p.paramType === 'query');
  const bodyParams = requestBody || [];

  // Build URL with path parameters
  let url = `'https://api.repairshopr.com${path}'`;
  if (pathParams.length > 0) {
    url = pathParams.reduce((acc, param) => {
      return acc.replace(`{${param.name}}`, `\${${param.name}}`);
    }, url);
  }

  // Build query parameters
  let queryParamsCode = '';
  if (queryParams.length > 0) {
    const params = queryParams.map(p => `    '${p.name}': ${getJavaScriptExampleValue(p.type)}`).join(',\n');
    queryParamsCode = `\n  const queryParams = {\n${params}\n  };`;
  }

  // Build request body
  let bodyCode = '';
  let exampleRequest: any = {};
  if (bodyParams.length > 0) {
    const body = bodyParams.map(p => `    '${p.name}': ${getJavaScriptExampleValue(p.type)}`).join(',\n');
    bodyCode = `\n  const requestBody = {\n${body}\n  };`;
    exampleRequest = bodyParams.reduce((acc, p) => {
      acc[p.name] = getExampleValue(p.type);
      return acc;
    }, {} as any);
  }

  // Build headers
  let headersCode = `  const headers = {\n    'Content-Type': 'application/json'`;
  if (includeAuth) {
    headersCode += `,\n    'X-API-Key': 'YOUR_API_KEY'`;
  }
  headersCode += '\n  };';

  // Build fetch options
  let optionsCode = `  const options = {\n    method: '${method}',\n${headersCode}`;
  if (bodyParams.length > 0) {
    optionsCode += `,\n    body: JSON.stringify(requestBody)`;
  }
  optionsCode += '\n  };';

  // Build URL with query parameters
  let urlCode = `let url = ${url};`;
  if (queryParams.length > 0) {
    urlCode += `\n  const queryString = new URLSearchParams(queryParams).toString();\n  url += '?' + queryString;`;
  }

  // Generate the main code
  const code = `// ${endpoint.operation}
// ${endpoint.description}

${pathParams.map(p => `const ${p.name} = ${getJavaScriptExampleValue(p.type)};`).join('\n')}${queryParamsCode}${bodyCode}

${urlCode}

${optionsCode}

try {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  const data = await response.json();
  console.log('Success:', data);
} catch (error) {
  console.error('Error:', error);
}`;

  // Generate error handling example
  const errorHandling = `// Error handling for ${endpoint.operation}
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    switch (response.status) {
      case 400:
        console.error('Bad Request:', errorData.message || 'Invalid parameters');
        break;
      case 401:
        console.error('Unauthorized:', errorData.message || 'Invalid API key');
        break;
      case 403:
        console.error('Forbidden:', errorData.message || 'Insufficient permissions');
        break;
      case 404:
        console.error('Not Found:', errorData.message || 'Resource not found');
        break;
      case 422:
        console.error('Unprocessable Entity:', errorData.message || 'Validation failed');
        break;
      case 500:
        console.error('Server Error:', errorData.message || 'Internal server error');
        break;
      default:
        console.error('HTTP Error:', response.status, errorData.message || 'Unknown error');
    }
    throw errorData;
  }
  
  return await response.json();
} catch (error) {
  console.error('Request failed:', error);
  throw error;
}`;

  return { code, errorHandling };
}

/**
 * Template for Python code examples
 */
function generatePythonExample(
  endpoint: ApiEndpoint,
  includeAuth: boolean
): { code: string; errorHandling: string } {
  const { method, path, parameters, requestBody, responses } = endpoint;
  const pathParams = parameters.filter(p => p.paramType === 'path');
  const queryParams = parameters.filter(p => p.paramType === 'query');
  const bodyParams = requestBody || [];

  // Build URL with path parameters
  let url = `'https://api.repairshopr.com${path}'`;
  if (pathParams.length > 0) {
    url = pathParams.reduce((acc, param) => {
      return acc.replace(`{${param.name}}`, `{${param.name}}`);
    }, url);
  }

  // Build query parameters
  let queryParamsCode = '';
  if (queryParams.length > 0) {
    const params = queryParams.map(p => `    '${p.name}': ${getPythonExampleValue(p.type)}`).join(',\n');
    queryParamsCode = `\nquery_params = {\n${params}\n}`;
  }

  // Build request body
  let bodyCode = '';
  let exampleRequest: any = {};
  if (bodyParams.length > 0) {
    const body = bodyParams.map(p => `    '${p.name}': ${getPythonExampleValue(p.type)}`).join(',\n');
    bodyCode = `\nrequest_body = {\n${body}\n}`;
    exampleRequest = bodyParams.reduce((acc, p) => {
      acc[p.name] = getExampleValue(p.type);
      return acc;
    }, {} as any);
  }

  // Build headers
  let headersCode = `headers = {\n    'Content-Type': 'application/json'`;
  if (includeAuth) {
    headersCode += `,\n    'X-API-Key': 'YOUR_API_KEY'`;
  }
  headersCode += '\n}';

  // Build URL with query parameters
  let urlCode = `url = ${url}`;
  if (queryParams.length > 0) {
    urlCode += `\nresponse = requests.${method.toLowerCase()}(url, headers=headers, params=query_params`;
  } else {
    urlCode += `\nresponse = requests.${method.toLowerCase()}(url, headers=headers`;
  }

  // Add body to request if applicable
  if (bodyParams.length > 0) {
    urlCode += `, json=request_body`;
  }
  urlCode += ')';

  // Generate the main code
  const code = `# ${endpoint.operation}
# ${endpoint.description}

import requests

${pathParams.map(p => `${p.name} = ${getPythonExampleValue(p.type)}`).join('\n')}${queryParamsCode}${bodyCode}

${headersCode}

${urlCode}

if response.status_code == 200:
    data = response.json()
    print('Success:', data)
else:
    print(f'Error: {response.status_code}')
    print(response.text)`;

  // Generate error handling example
  const errorHandling = `# Error handling for ${endpoint.operation}
try:
    response = requests.${method.toLowerCase()}(
        url,
        headers=headers${queryParams.length > 0 ? ',\n        params=query_params' : ''}${bodyParams.length > 0 ? ',\n        json=request_body' : ''}
    )
    response.raise_for_status()
    return response.json()
except requests.exceptions.HTTPError as e:
    if response.status_code == 400:
        print('Bad Request:', response.json().get('message', 'Invalid parameters'))
    elif response.status_code == 401:
        print('Unauthorized:', response.json().get('message', 'Invalid API key'))
    elif response.status_code == 403:
        print('Forbidden:', response.json().get('message', 'Insufficient permissions'))
    elif response.status_code == 404:
        print('Not Found:', response.json().get('message', 'Resource not found'))
    elif response.status_code == 422:
        print('Unprocessable Entity:', response.json().get('message', 'Validation failed'))
    elif response.status_code >= 500:
        print('Server Error:', response.json().get('message', 'Internal server error'))
    else:
        print(f'HTTP Error: {response.status_code}', response.json().get('message', 'Unknown error'))
    raise
except requests.exceptions.RequestException as e:
    print('Request failed:', str(e))
    raise`;

  return { code, errorHandling };
}

/**
 * Template for cURL code examples
 */
function generateCurlExample(
  endpoint: ApiEndpoint,
  includeAuth: boolean
): { code: string; errorHandling: string } {
  const { method, path, parameters, requestBody, responses } = endpoint;
  const pathParams = parameters.filter(p => p.paramType === 'path');
  const queryParams = parameters.filter(p => p.paramType === 'query');
  const bodyParams = requestBody || [];

  // Build URL with path parameters
  let url = `https://api.repairshopr.com${path}`;
  if (pathParams.length > 0) {
    url = pathParams.reduce((acc, param) => {
      return acc.replace(`{${param.name}}`, getCurlExampleValue(param.type));
    }, url);
  }

  // Build query parameters
  let queryParamsCode = '';
  if (queryParams.length > 0) {
    const params = queryParams.map(p => `${p.name}=${getCurlExampleValue(p.type)}`).join('&');
    queryParamsCode = `?${params}`;
  }

  // Build cURL command
  let curlCode = `# ${endpoint.operation}\n# ${endpoint.description}\n\ncurl -X ${method} \\\n  "${url}${queryParamsCode}" \\\n  -H "Content-Type: application/json"`;
  
  if (includeAuth) {
    curlCode += ` \\\n  -H "X-API-Key: YOUR_API_KEY"`;
  }

  // Add body if applicable
  if (bodyParams.length > 0) {
    const body = bodyParams.map(p => `    "${p.name}": ${getCurlExampleValue(p.type)}`).join(',\n');
    curlCode += ` \\\n  -d '{\n${body}\n  }'`;
  }

  // Generate error handling example
  const errorHandling = `# Error handling for ${endpoint.operation}
# Check HTTP status code
response=$(curl -s -w "%{http_code}" -X ${method} \\
  "${url}${queryParamsCode}" \\
  -H "Content-Type: application/json"${includeAuth ? ' \\\n  -H "X-API-Key: YOUR_API_KEY"' : ''}${bodyParams.length > 0 ? ' \\\n  -d \'{\\n' + bodyParams.map(p => `    "${p.name}": ${getCurlExampleValue(p.type)}`).join(',\\n') + '\\n  }\'' : ''})

# Extract HTTP status code (last 3 characters)
http_code=\${response: -3}
# Extract response body (everything except last 3 characters)
body=\${response%???}

case \$http_code in
  200)
    echo "Success: \$body"
    ;;
  400)
    echo "Bad Request: \$(echo \$body | jq -r '.message // Invalid parameters')"
    ;;
  401)
    echo "Unauthorized: \$(echo \$body | jq -r '.message // Invalid API key')"
    ;;
  403)
    echo "Forbidden: \$(echo \$body | jq -r '.message // Insufficient permissions')"
    ;;
  404)
    echo "Not Found: \$(echo \$body | jq -r '.message // Resource not found')"
    ;;
  422)
    echo "Unprocessable Entity: \$(echo \$body | jq -r '.message // Validation failed')"
    ;;
  500)
    echo "Server Error: \$(echo \$body | jq -r '.message // Internal server error')"
    ;;
  *)
    echo "HTTP Error \$http_code: \$(echo \$body | jq -r '.message // Unknown error')"
    ;;
esac`;

  return { code: curlCode, errorHandling };
}

/**
 * Get example value for JavaScript based on type
 */
function getJavaScriptExampleValue(type: string): string {
  switch (type.toLowerCase()) {
    case 'string':
      return "'example_value'";
    case 'integer':
    case 'number':
      return '123';
    case 'boolean':
      return 'true';
    case 'array':
      return '[]';
    case 'object':
      return '{}';
    default:
      return "'example_value'";
  }
}

/**
 * Get example value for Python based on type
 */
function getPythonExampleValue(type: string): string {
  switch (type.toLowerCase()) {
    case 'string':
      return "'example_value'";
    case 'integer':
    case 'number':
      return '123';
    case 'boolean':
      return 'True';
    case 'array':
      return '[]';
    case 'object':
      return '{}';
    default:
      return "'example_value'";
  }
}

/**
 * Get example value for cURL based on type
 */
function getCurlExampleValue(type: string): string {
  switch (type.toLowerCase()) {
    case 'string':
      return '"example_value"';
    case 'integer':
    case 'number':
      return '123';
    case 'boolean':
      return 'true';
    case 'array':
      return '[]';
    case 'object':
      return '{}';
    default:
      return '"example_value"';
  }
}

/**
 * Get example value based on type
 */
function getExampleValue(type: string): any {
  switch (type.toLowerCase()) {
    case 'string':
      return 'example_value';
    case 'integer':
    case 'number':
      return 123;
    case 'boolean':
      return true;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return 'example_value';
  }
}

/**
 * Extract example response from endpoint responses
 */
function getExampleResponse(responses: ApiResponse[]): any {
  // Look for 200 response with example
  const successResponse = responses.find(r => r.statusCode === 200);
  if (successResponse?.example) {
    return successResponse.example;
  }

  // Look for any response with example
  const responseWithExample = responses.find(r => r.example);
  if (responseWithExample) {
    return responseWithExample.example;
  }

  // Return a generic example
  return {
    id: 123,
    message: 'Success'
  };
}

/**
 * Generates a code example for a specific API endpoint
 *
 * @param params - Code example generation parameters
 * @param index - Metadata index for searching endpoints
 * @returns Code example result with generated code and metadata
 *
 * @example
 * ```typescript
 * const result = generateCodeExample(
 *   {
 *     endpointPath: '/customers/{id}',
 *     method: 'GET',
 *     language: 'javascript',
 *     includeAuth: true
 *   },
 *   metadataIndex
 * );
 * ```
 */
export function generateCodeExample(
  params: CodeExampleParams,
  index: MetadataIndex
): CodeExampleResult {
  const { endpointPath, method, language, includeAuth = true } = params;

  // Validate language
  if (!['javascript', 'python', 'curl'].includes(language)) {
    throw new Error(`Unsupported language: ${language}. Supported languages: javascript, python, curl`);
  }

  // Lookup endpoint
  const endpoint = getEndpointByPath(index, endpointPath, method.toUpperCase());
  
  if (!endpoint) {
    throw new Error(`Endpoint not found: ${method} ${endpointPath}`);
  }

  // Generate code example based on language
  let code: string;
  let errorHandling: string;
  let exampleRequest: any;

  switch (language) {
    case 'javascript':
      const jsResult = generateJavaScriptExample(endpoint, includeAuth);
      code = jsResult.code;
      errorHandling = jsResult.errorHandling;
      exampleRequest = extractExampleRequest(endpoint);
      break;
    case 'python':
      const pyResult = generatePythonExample(endpoint, includeAuth);
      code = pyResult.code;
      errorHandling = pyResult.errorHandling;
      exampleRequest = extractExampleRequest(endpoint);
      break;
    case 'curl':
      const curlResult = generateCurlExample(endpoint, includeAuth);
      code = curlResult.code;
      errorHandling = curlResult.errorHandling;
      exampleRequest = extractExampleRequest(endpoint);
      break;
    default:
      throw new Error(`Unsupported language: ${language}`);
  }

  // Get example response
  const exampleResponse = getExampleResponse(endpoint.responses);

  return {
    endpoint: {
      resource: endpoint.resource,
      operation: endpoint.operation,
      description: endpoint.description,
      method: endpoint.method,
      path: endpoint.path
    },
    code,
    language,
    includesAuth: includeAuth,
    exampleRequest: Object.keys(exampleRequest).length > 0 ? exampleRequest : undefined,
    exampleResponse,
    errorHandling
  };
}

/**
 * Extract example request from endpoint parameters
 */
function extractExampleRequest(endpoint: ApiEndpoint): any {
  const bodyParams = endpoint.requestBody || [];
  
  if (bodyParams.length === 0) {
    return {};
  }

  return bodyParams.reduce((acc, param) => {
    acc[param.name] = getExampleValue(param.type);
    return acc;
  }, {} as any);
}

/**
 * Generate code examples for multiple languages
 *
 * @param params - Code example generation parameters
 * @param index - Metadata index for searching endpoints
 * @returns Array of code example results for each language
 *
 * @example
 * ```typescript
 * const results = generateCodeExamplesForAllLanguages(
 *   {
 *     endpointPath: '/customers/{id}',
 *     method: 'GET',
 *     includeAuth: true
 *   },
 *   metadataIndex
 * );
 * ```
 */
export function generateCodeExamplesForAllLanguages(
  params: Omit<CodeExampleParams, 'language'>,
  index: MetadataIndex
): CodeExampleResult[] {
  const languages: CodeLanguage[] = ['javascript', 'python', 'curl'];
  
  return languages.map(language => 
    generateCodeExample({ ...params, language }, index)
  );
}
