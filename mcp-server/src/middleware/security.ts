/**
 * Security middleware configuration
 * Provides Helmet, CORS, and compression settings
 */

import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface SecurityConfig {
  corsOrigin?: string | string[];
  corsEnabled?: boolean;
  hstsEnabled?: boolean;
  contentSecurityPolicy?: boolean;
}

const DEFAULT_CONFIG: SecurityConfig = {
  corsOrigin: process.env.CORS_ORIGIN || '*',
  corsEnabled: process.env.CORS_ENABLED !== 'false',
  hstsEnabled: process.env.HSTS_ENABLED !== 'false',
  contentSecurityPolicy: process.env.CSP_ENABLED !== 'false'
};

/**
 * Helmet configuration for security headers
 */
export function getHelmetMiddleware(config: SecurityConfig = DEFAULT_CONFIG) {
  return helmet({
    contentSecurityPolicy: config.contentSecurityPolicy ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    } : false,
    crossOriginEmbedderPolicy: false,
    hsts: config.hstsEnabled ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    } : false,
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  });
}

/**
 * CORS configuration
 */
export function getCorsMiddleware(config: SecurityConfig = DEFAULT_CONFIG) {
  if (!config.corsEnabled) {
    return cors();
  }

  const origin = config.corsOrigin;
  
  return cors({
    origin: origin === '*' ? true : (typeof origin === 'string' ? origin.split(',') : origin),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400 // 24 hours
  });
}

/**
 * Compression configuration
 */
export function getCompressionMiddleware() {
  return compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use default filter
      return compression.filter(req, res);
    },
    level: 6 // Balanced compression level
  });
}

/**
 * Request size limit middleware
 */
export function getRequestSizeLimit() {
  const maxSize = parseInt(process.env.MAX_REQUEST_SIZE_MB || '10', 10);
  return {
    limit: `${maxSize}mb`
  };
}

/**
 * Request timeout middleware
 */
export function getTimeoutMiddleware(timeoutMs: number = 30000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout', { 
          path: req.path, 
          method: req.method,
          timeoutMs 
        });
        res.status(408).json({
          error: 'Request Timeout',
          message: 'The request took too long to process'
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
}

export { DEFAULT_CONFIG as defaultSecurityConfig };
