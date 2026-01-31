/**
 * Schema definition for parsed RepairShopr API documentation
 *
 * This module defines the validation rules for API documentation
 * parsed from markdown files in the docs/api/ directory.
 *
 * Type definitions are imported from ../utils/types.ts
 */

import {
  ApiEndpoint,
  ApiParameter,
  ApiResponse,
  ApiDocument
} from '../utils/types';

/**
 * Validation utility functions for parsed API documentation
 */
export const ApiDocumentValidation = {
  /**
   * Validates an ApiEndpoint object
   * 
   * @param endpoint - The endpoint to validate
   * @returns True if valid, false otherwise
   */
  validateEndpoint(endpoint: ApiEndpoint): boolean {
    // Check required fields
    if (!endpoint.resource || typeof endpoint.resource !== 'string') return false;
    if (!endpoint.operation || typeof endpoint.operation !== 'string') return false;
    if (!endpoint.method || typeof endpoint.method !== 'string') return false;
    if (!endpoint.path || typeof endpoint.path !== 'string') return false;
    // Permission can be empty string for endpoints without permission requirements
    if (typeof endpoint.permission !== 'string') return false;
    if (!Array.isArray(endpoint.parameters)) return false;
    if (!Array.isArray(endpoint.responses) || endpoint.responses.length === 0) return false;

    // Validate method
    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    if (!validMethods.includes(endpoint.method)) return false;

    // Validate path
    if (!endpoint.path.startsWith('/')) return false;

    // Validate parameters
    for (const param of endpoint.parameters) {
      if (!this.validateParameter(param)) return false;
    }

    // Validate request body if present
    if (endpoint.requestBody) {
      if (!Array.isArray(endpoint.requestBody)) return false;
      for (const param of endpoint.requestBody) {
        if (!this.validateParameter(param)) return false;
      }
    }

    // Validate responses
    for (const response of endpoint.responses) {
      if (!this.validateResponse(response)) return false;
    }

    return true;
  },

  /**
   * Validates an ApiParameter object
   * 
   * @param parameter - The parameter to validate
   * @returns True if valid, false otherwise
   */
  validateParameter(parameter: ApiParameter): boolean {
    if (!parameter.name || typeof parameter.name !== 'string') return false;
    if (!parameter.type || typeof parameter.type !== 'string') return false;
    if (typeof parameter.required !== 'boolean') return false;
    if (!parameter.description || typeof parameter.description !== 'string') return false;
    
    const validTypes = ['string', 'integer', 'boolean', 'array', 'object', 'number'];
    if (!validTypes.includes(parameter.type)) return false;
    
    const validParamTypes = ['query', 'path', 'body'];
    if (!validParamTypes.includes(parameter.paramType)) return false;

    return true;
  },

  /**
   * Validates an ApiResponse object
   * 
   * @param response - The response to validate
   * @returns True if valid, false otherwise
   */
  validateResponse(response: ApiResponse): boolean {
    if (typeof response.statusCode !== 'number') return false;
    if (response.statusCode < 100 || response.statusCode > 599) return false;
    if (!response.description || typeof response.description !== 'string') return false;
    
    // Example is optional, but if present should be valid
    if (response.example !== undefined) {
      // We can't deeply validate arbitrary JSON, but we can check it's not null/undefined
      if (response.example === null) return false;
    }

    return true;
  },

  /**
   * Validates an ApiDocument object
   * 
   * @param document - The document to validate
   * @returns True if valid, false otherwise
   */
  validateDocument(document: ApiDocument): boolean {
    if (!document.resourceName || typeof document.resourceName !== 'string') return false;
    if (!Array.isArray(document.endpoints) || document.endpoints.length === 0) return false;

    // All endpoints should have the same resource name
    for (const endpoint of document.endpoints) {
      if (endpoint.resource !== document.resourceName) return false;
      if (!this.validateEndpoint(endpoint)) return false;
    }

    return true;
  }
};
