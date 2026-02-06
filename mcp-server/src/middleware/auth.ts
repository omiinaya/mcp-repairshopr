/**
 * API Key authentication middleware
 * Provides authentication for sensitive endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AuthConfig {
  apiKeys: string[];
  enabled: boolean;
  protectedPaths: string[];
  headerName: string;
}

const DEFAULT_CONFIG: AuthConfig = {
  apiKeys: process.env.API_KEYS?.split(',') || [],
  enabled: process.env.AUTH_ENABLED === 'true',
  protectedPaths: ['/admin', '/debug', '/config'],
  headerName: 'X-API-Key'
};

/**
 * Parse API keys from environment variable
 * Format: key1:description1,key2:description2
 */
function parseApiKeys(): Map<string, { key: string; description: string; createdAt: Date }> {
  const keys = new Map();
  const envKeys = process.env.API_KEYS || '';
  
  if (!envKeys) {
    return keys;
  }

  envKeys.split(',').forEach((entry, index) => {
    const parts = entry.split(':');
    const key = parts[0].trim();
    const description = parts[1]?.trim() || `Key ${index + 1}`;
    
    if (key) {
      keys.set(key, {
        key,
        description,
        createdAt: new Date()
      });
    }
  });

  return keys;
}

const validApiKeys = parseApiKeys();

/**
 * API key authentication middleware
 */
export function authenticateApiKey(
  config: Partial<AuthConfig> = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const authConfig = { ...DEFAULT_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip auth if disabled
    if (!authConfig.enabled) {
      return next();
    }

    // Skip auth for non-protected paths
    const isProtected = authConfig.protectedPaths.some(path => 
      req.path.startsWith(path)
    );
    
    if (!isProtected) {
      return next();
    }

    // Get API key from header
    const apiKey = req.headers[authConfig.headerName.toLowerCase()] as string;

    if (!apiKey) {
      logger.warn('API key missing', { 
        path: req.path, 
        ip: req.ip,
        headers: Object.keys(req.headers)
      });
      
      res.status(401).json({
        error: 'Unauthorized',
        message: 'API key is required'
      });
      return;
    }

    // Validate API key
    if (!validApiKeys.has(apiKey)) {
      logger.warn('Invalid API key', { 
        path: req.path, 
        ip: req.ip,
        keyPrefix: apiKey.substring(0, 4) + '...'
      });
      
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key'
      });
      return;
    }

    // Log successful authentication
    const keyInfo = validApiKeys.get(apiKey);
    logger.debug('API key authenticated', { 
      path: req.path,
      description: keyInfo?.description
    });

    // Attach user info to request
    (req as any).user = {
      apiKey: apiKey.substring(0, 4) + '...',
      description: keyInfo?.description
    };

    next();
  };
}

/**
 * Check if authentication is configured
 */
export function isAuthConfigured(): boolean {
  return validApiKeys.size > 0;
}

/**
 * Get number of configured API keys
 */
export function getApiKeyCount(): number {
  return validApiKeys.size;
}

/**
 * Middleware to require authentication for all routes
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!DEFAULT_CONFIG.enabled || validApiKeys.size === 0) {
    return next();
  }

  const apiKey = req.headers[DEFAULT_CONFIG.headerName.toLowerCase()] as string;

  if (!apiKey || !validApiKeys.has(apiKey)) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid API key is required'
    });
    return;
  }

  next();
}
