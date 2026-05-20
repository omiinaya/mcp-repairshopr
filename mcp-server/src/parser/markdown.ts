/**
 * Markdown parser for RepairShopr API documentation
 *
 * This module parses markdown files in the docs/api/ directory and extracts
 * structured API documentation information including endpoints, parameters,
 * request bodies, responses, and permissions.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  ApiDocument,
  ApiEndpoint,
  ApiParameter,
  ApiResponse,
} from '../utils/types';

/**
 * Parses a markdown file and extracts API documentation
 *
 * @param filePath - Path to the markdown file to parse
 * @returns Promise<ApiDocument> - Parsed API document with all endpoints
 *
 * @throws Error if file cannot be read or parsing fails
 */
export async function parseMarkdownFile(
  filePath: string
): Promise<ApiDocument> {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  // Extract resource name from header
  const resourceName = extractResourceName(lines);

  // Parse all endpoints
  const endpoints = parseEndpoints(lines, resourceName);

  return {
    resourceName,
    endpoints,
  };
}

/**
 * Extracts the resource name from the file header
 *
 * Expected format: "# RepairShopr API Documentation - {Resource Name}"
 *
 * @param lines - Array of markdown lines
 * @returns Resource name string
 */
function extractResourceName(lines: string[]): string {
  const headerLine = lines.find((line) =>
    line.startsWith('# RepairShopr API Documentation -')
  );

  if (!headerLine) {
    throw new Error('Could not find resource name header in file');
  }

  const match = headerLine.match(/^# RepairShopr API Documentation - (.+)$/);
  if (!match || !match[1]) {
    throw new Error('Could not parse resource name from header');
  }

  return match[1].trim();
}

/**
 * Parses all endpoints from the markdown content
 *
 * @param lines - Array of markdown lines
 * @param resourceName - Name of the resource
 * @returns Array of parsed endpoints
 */
function parseEndpoints(lines: string[], resourceName: string): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];

  // Find all endpoint sections (lines starting with ####)
  const endpointIndices: number[] = [];
  lines.forEach((line, index) => {
    if (line.startsWith('#### ')) {
      endpointIndices.push(index);
    }
  });

  // Parse each endpoint
  for (let i = 0; i < endpointIndices.length; i++) {
    const startIndex = endpointIndices[i];
    const endIndex =
      i < endpointIndices.length - 1 ? endpointIndices[i + 1] : lines.length;
    const endpointLines = lines.slice(startIndex, endIndex);

    try {
      const endpoint = parseEndpoint(endpointLines, resourceName);
      endpoints.push(endpoint);
    } catch (error) {
      console.warn(
        `Failed to parse endpoint at line ${startIndex + 1}:`,
        error
      );
    }
  }

  return endpoints;
}

/**
 * Parses a single endpoint from its markdown section
 *
 * @param lines - Array of lines for this endpoint
 * @param resourceName - Name of the resource
 * @returns Parsed endpoint object
 */
function parseEndpoint(lines: string[], resourceName: string): ApiEndpoint {
  // Extract operation name (first line: #### {Operation Name})
  const operation = lines[0].replace(/^####\s+/, '').trim();

  // Extract description (text between operation name and Endpoint line)
  const description = extractDescription(lines);

  // Extract method and path from **Endpoint:** line
  const { method, path } = extractEndpointInfo(lines);

  // Extract permission from **Required Permission:** line
  const permission = extractPermission(lines);

  // Extract parameters (query and path)
  const parameters = extractParameters(lines);

  // Extract request body if present
  const requestBody = extractRequestBody(lines);

  // Extract responses
  const responses = extractResponses(lines);

  return {
    resource: resourceName,
    operation,
    description,
    method,
    path,
    permission,
    parameters,
    requestBody,
    responses,
  };
}

/**
 * Extracts the description from endpoint lines
 *
 * @param lines - Array of lines for this endpoint
 * @returns Description string
 */
function extractDescription(lines: string[]): string {
  const endpointIndex = lines.findIndex((line) =>
    line.startsWith('**Endpoint:**')
  );

  if (endpointIndex === -1) {
    return '';
  }

  // Description is between line 1 (operation name) and endpoint line
  const descriptionLines = lines.slice(1, endpointIndex);
  return descriptionLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

/**
 * Extracts method and path from endpoint line
 *
 * Expected format: "**Endpoint:** `METHOD {path}`"
 *
 * @param lines - Array of lines for this endpoint
 * @returns Object with method and path
 */
function extractEndpointInfo(lines: string[]): {
  method: string;
  path: string;
} {
  const endpointLine = lines.find((line) => line.startsWith('**Endpoint:**'));

  if (!endpointLine) {
    throw new Error('Could not find endpoint line');
  }

  const match = endpointLine.match(/\*\*Endpoint:\*\*\s*`(\w+)\s+(.+)`/);
  if (!match) {
    throw new Error('Could not parse endpoint line');
  }

  return {
    method: match[1].toUpperCase(),
    path: match[2].trim(),
  };
}

/**
 * Extracts permission from the endpoint
 *
 * Expected format: "**Required Permission:** {permission}"
 *
 * @param lines - Array of lines for this endpoint
 * @returns Permission string
 */
function extractPermission(lines: string[]): string {
  const permissionLine = lines.find((line) =>
    line.startsWith('**Required Permission:**')
  );

  if (!permissionLine) {
    return '';
  }

  return permissionLine.replace(/^\*\*Required Permission:\*\*\s*/, '').trim();
}

/**
 * Extracts parameters from the endpoint
 *
 * Looks for "**Query Parameters:**" and "**Path Parameters:**" sections
 * followed by markdown tables
 *
 * @param lines - Array of lines for this endpoint
 * @returns Array of parameters
 */
function extractParameters(lines: string[]): ApiParameter[] {
  const parameters: ApiParameter[] = [];

  // Find query parameters section
  const queryParamIndex = lines.findIndex(
    (line) => line === '**Query Parameters:**'
  );
  if (queryParamIndex !== -1) {
    const tableParams = parseParameterTable(lines, queryParamIndex, 'query');
    parameters.push(...tableParams);
  }

  // Find path parameters section
  const pathParamIndex = lines.findIndex(
    (line) => line === '**Path Parameters:**'
  );
  if (pathParamIndex !== -1) {
    const tableParams = parseParameterTable(lines, pathParamIndex, 'path');
    parameters.push(...tableParams);
  }

  return parameters;
}

/**
 * Parses a parameter table from markdown
 *
 * Expected format:
 * | Parameter | Type | Required | Description |
 * |-----------|------|----------|-------------|
 * | name | type | Yes/No | description |
 *
 * @param lines - Array of lines for this endpoint
 * @param startIndex - Index where parameter section starts
 * @param paramType - Type of parameter ('query', 'path', or 'body')
 * @returns Array of parsed parameters
 */
function parseParameterTable(
  lines: string[],
  startIndex: number,
  paramType: 'query' | 'path' | 'body'
): ApiParameter[] {
  const parameters: ApiParameter[] = [];

  // Find the table (starts after the header line)
  let tableStartIndex = startIndex + 1;

  // Skip empty lines
  while (
    tableStartIndex < lines.length &&
    lines[tableStartIndex].trim() === ''
  ) {
    tableStartIndex++;
  }

  // Check if we have a table (starts with |)
  if (
    tableStartIndex >= lines.length ||
    !lines[tableStartIndex].startsWith('|')
  ) {
    return parameters;
  }

  // Skip header row
  tableStartIndex++;

  // Skip separator row
  if (
    tableStartIndex < lines.length &&
    lines[tableStartIndex].startsWith('|')
  ) {
    tableStartIndex++;
  }

  // Parse data rows
  while (
    tableStartIndex < lines.length &&
    lines[tableStartIndex].startsWith('|')
  ) {
    const row = lines[tableStartIndex];
    const cells = row
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);

    if (cells.length >= 4) {
      const name = cells[0];
      const type = cells[1].toLowerCase();
      const required = cells[2].toLowerCase() === 'yes';
      const description = cells[3] || '';

      parameters.push({
        name,
        type,
        required,
        description,
        paramType,
      });
    }

    tableStartIndex++;
  }

  return parameters;
}

/**
 * Extracts request body parameters from the endpoint
 *
 * Looks for "**Request Body:**" section followed by markdown table
 *
 * @param lines - Array of lines for this endpoint
 * @returns Array of request body parameters or undefined
 */
function extractRequestBody(lines: string[]): ApiParameter[] | undefined {
  const requestBodyIndex = lines.findIndex(
    (line) => line === '**Request Body:**'
  );

  if (requestBodyIndex === -1) {
    return undefined;
  }

  const parameters = parseParameterTable(lines, requestBodyIndex, 'body');

  return parameters.length > 0 ? parameters : undefined;
}

/**
 * Extracts responses from the endpoint
 *
 * Looks for "**Response: {code}**" sections with descriptions and examples
 *
 * @param lines - Array of lines for this endpoint
 * @returns Array of responses
 */
function extractResponses(lines: string[]): ApiResponse[] {
  const responses: ApiResponse[] = [];

  // Find all response sections
  const responseIndices: Array<{ index: number; statusCode: number }> = [];
  lines.forEach((line, index) => {
    const match = line.match(/^\*\*Response:\s*(\d+)\*\*$/);
    if (match) {
      responseIndices.push({ index, statusCode: parseInt(match[1], 10) });
    }
  });

  // Parse each response
  for (let i = 0; i < responseIndices.length; i++) {
    const { index: startIndex, statusCode } = responseIndices[i];
    const endIndex =
      i < responseIndices.length - 1
        ? responseIndices[i + 1].index
        : lines.length;
    const responseLines = lines.slice(startIndex, endIndex);

    const response = parseResponse(responseLines, statusCode);
    responses.push(response);
  }

  return responses;
}

/**
 * Parses a single response from its section
 *
 * @param lines - Array of lines for this response
 * @param statusCode - HTTP status code
 * @returns Parsed response object
 */
function parseResponse(lines: string[], statusCode: number): ApiResponse {
  // Extract description (text between response header and JSON code block)
  const description = extractResponseDescription(lines);

  // Extract example from JSON code block if present
  const example = extractResponseExample(lines);

  return {
    statusCode,
    description,
    example,
  };
}

/**
 * Extracts description from response section
 *
 * @param lines - Array of lines for this response
 * @returns Description string
 */
function extractResponseDescription(lines: string[]): string {
  // Skip the first line (the response header)
  const descriptionLines: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    // Stop at JSON code block
    if (line.startsWith('```json') || line.startsWith('```')) {
      break;
    }

    // Stop at next response section
    if (line.startsWith('**Response:')) {
      break;
    }

    if (line.length > 0) {
      descriptionLines.push(line);
    }
  }

  return descriptionLines.join('\n');
}

/**
 * Extracts example JSON from response section
 *
 * @param lines - Array of lines for this response
 * @returns Parsed JSON object or undefined
 */
function extractResponseExample(lines: string[]): any {
  const codeBlockStart = lines.findIndex((line) => line.startsWith('```json'));

  if (codeBlockStart === -1) {
    return undefined;
  }

  const codeBlockEnd = lines.findIndex(
    (line, index) => index > codeBlockStart && line.startsWith('```')
  );

  if (codeBlockEnd === -1) {
    return undefined;
  }

  const jsonLines = lines.slice(codeBlockStart + 1, codeBlockEnd);
  const jsonText = jsonLines.join('\n').trim();

  if (!jsonText) {
    return undefined;
  }

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.warn('Failed to parse JSON example:', error);
    return undefined;
  }
}
