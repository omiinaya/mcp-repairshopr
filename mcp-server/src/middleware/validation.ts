/**
 * Request validation and sanitization middleware
 * Validates and sanitizes incoming requests
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ValidationConfig {
  maxUrlLength: number;
  maxHeaderCount: number;
  maxHeaderSize: number;
  allowedContentTypes: string[];
  sanitizeInput: boolean;
  blockSuspiciousPatterns: boolean;
}

const DEFAULT_CONFIG: ValidationConfig = {
  maxUrlLength: 2048,
  maxHeaderCount: 50,
  maxHeaderSize: 8192, // 8KB
  allowedContentTypes: [
    'application/json',
    'application/x-www-form-urlencoded',
    'text/plain',
    'multipart/form-data',
  ],
  sanitizeInput: true,
  blockSuspiciousPatterns: true,
};

// Suspicious patterns to block
const SUSPICIOUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /\.\./,
  /\/etc\/passwd/i,
  /\/proc\/self/i,
  /union\s+select/i,
  /drop\s+table/i,
  /insert\s+into/i,
  /delete\s+from/i,
];

/**
 * Sanitize string input
 */
function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/["']/g, '') // Remove quotes
    .trim();
}

/**
 * Recursively sanitize object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize keys too
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Check for suspicious patterns
 */
function containsSuspiciousPatterns(input: string): boolean {
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Validate request size and structure
 */
export function validateRequest(
  config: Partial<ValidationConfig> = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const validationConfig = { ...DEFAULT_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate URL length
      if (req.url.length > validationConfig.maxUrlLength) {
        logger.warn('URL too long', {
          length: req.url.length,
          max: validationConfig.maxUrlLength,
          ip: req.ip,
        });

        res.status(414).json({
          error: 'Request Too Long',
          message: 'URL exceeds maximum length',
        });
        return;
      }

      // Validate header count
      const headerCount = Object.keys(req.headers).length;
      if (headerCount > validationConfig.maxHeaderCount) {
        logger.warn('Too many headers', {
          count: headerCount,
          max: validationConfig.maxHeaderCount,
          ip: req.ip,
        });

        res.status(400).json({
          error: 'Bad Request',
          message: 'Too many headers',
        });
        return;
      }

      // Validate header size
      const headerSize = JSON.stringify(req.headers).length;
      if (headerSize > validationConfig.maxHeaderSize) {
        logger.warn('Headers too large', {
          size: headerSize,
          max: validationConfig.maxHeaderSize,
          ip: req.ip,
        });

        res.status(400).json({
          error: 'Bad Request',
          message: 'Headers exceed maximum size',
        });
        return;
      }

      // Validate content type for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'] || '';
        const isAllowed = validationConfig.allowedContentTypes.some((type) =>
          contentType.includes(type)
        );

        if (!isAllowed && contentType) {
          logger.warn('Invalid content type', {
            contentType,
            ip: req.ip,
          });

          res.status(415).json({
            error: 'Unsupported Media Type',
            message: 'Content type not allowed',
          });
          return;
        }
      }

      // Check for suspicious patterns in URL
      if (
        validationConfig.blockSuspiciousPatterns &&
        containsSuspiciousPatterns(req.url)
      ) {
        logger.warn('Suspicious pattern detected in URL', {
          url: req.url,
          ip: req.ip,
        });

        res.status(403).json({
          error: 'Forbidden',
          message: 'Request contains suspicious patterns',
        });
        return;
      }

      // Sanitize request body
      if (validationConfig.sanitizeInput && req.body) {
        req.body = sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (validationConfig.sanitizeInput && req.query) {
        req.query = sanitizeObject(req.query);
      }

      // Sanitize URL parameters
      if (validationConfig.sanitizeInput && req.params) {
        req.params = sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      logger.error('Validation error', { error, path: req.path });
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Request validation failed',
      });
    }
  };
}

/**
 * Validate specific fields in request body
 */
export function validateFields(
  fields: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }[]
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const field of fields) {
      const value = req.body[field.name];

      // Check required
      if (
        field.required &&
        (value === undefined || value === null || value === '')
      ) {
        errors.push(`Field '${field.name}' is required`);
        continue;
      }

      // Skip validation if field is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Check type
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== field.type) {
        errors.push(`Field '${field.name}' must be of type ${field.type}`);
        continue;
      }

      // Check string constraints
      if (field.type === 'string') {
        if (field.minLength !== undefined && value.length < field.minLength) {
          errors.push(
            `Field '${field.name}' must be at least ${field.minLength} characters`
          );
        }
        if (field.maxLength !== undefined && value.length > field.maxLength) {
          errors.push(
            `Field '${field.name}' must be at most ${field.maxLength} characters`
          );
        }
        if (field.pattern && !field.pattern.test(value)) {
          errors.push(`Field '${field.name}' has invalid format`);
        }
      }

      // Check array constraints
      if (field.type === 'array') {
        if (field.minLength !== undefined && value.length < field.minLength) {
          errors.push(
            `Field '${field.name}' must have at least ${field.minLength} items`
          );
        }
        if (field.maxLength !== undefined && value.length > field.maxLength) {
          errors.push(
            `Field '${field.name}' must have at most ${field.maxLength} items`
          );
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Request validation failed',
        details: errors,
      });
      return;
    }

    next();
  };
}

export { sanitizeObject, sanitizeString };
