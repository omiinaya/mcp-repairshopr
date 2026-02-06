/**
 * CSRF (Cross-Site Request Forgery) protection middleware
 * Validates CSRF tokens for state-changing operations
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface CsrfConfig {
  enabled: boolean;
  cookieName: string;
  headerName: string;
  tokenLength: number;
  cookieSecure: boolean;
  cookieHttpOnly: boolean;
  cookieSameSite: 'strict' | 'lax' | 'none';
  excludedPaths: string[];
  excludedMethods: string[];
}

const DEFAULT_CONFIG: CsrfConfig = {
  enabled: process.env.CSRF_ENABLED === 'true',
  cookieName: 'csrf-token',
  headerName: 'X-CSRF-Token',
  tokenLength: 32,
  cookieSecure: process.env.NODE_ENV === 'production',
  cookieHttpOnly: true,
  cookieSameSite: 'strict',
  excludedPaths: ['/health', '/ready', '/live', '/metrics'],
  excludedMethods: ['GET', 'HEAD', 'OPTIONS']
};

/**
 * Generate a new CSRF token
 */
function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Store for CSRF tokens (in production, use Redis or database)
 */
class CsrfTokenStore {
  private tokens: Map<string, { token: string; createdAt: number }> = new Map();
  private readonly maxAge: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    // Clean up expired tokens periodically
    setInterval(() => this.cleanup(), 60 * 60 * 1000); // Every hour
  }

  /**
   * Create a new token for a session
   */
  create(sessionId: string): string {
    const token = generateToken();
    this.tokens.set(sessionId, {
      token,
      createdAt: Date.now()
    });
    return token;
  }

  /**
   * Validate a token for a session
   */
  validate(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored) {
      return false;
    }

    // Check if token is expired
    if (Date.now() - stored.createdAt > this.maxAge) {
      this.tokens.delete(sessionId);
      return false;
    }

    // Use timing-safe comparison to prevent timing attacks
    try {
      return crypto.timingSafeEqual(
        Buffer.from(stored.token),
        Buffer.from(token)
      );
    } catch {
      return false;
    }
  }

  /**
   * Remove a token
   */
  remove(sessionId: string): void {
    this.tokens.delete(sessionId);
  }

  /**
   * Clean up expired tokens
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now - data.createdAt > this.maxAge) {
        this.tokens.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`CSRF token cleanup: removed ${cleaned} expired tokens`);
    }
  }
}

const tokenStore = new CsrfTokenStore();

/**
 * Get session ID from request (uses IP + User-Agent as fallback)
 */
function getSessionId(req: Request): string {
  // In production, use actual session ID from cookie/session store
  const ip = req.ip || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(
  config: Partial<CsrfConfig> = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const csrfConfig = { ...DEFAULT_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip if CSRF protection is disabled
    if (!csrfConfig.enabled) {
      return next();
    }

    // Skip excluded paths
    if (csrfConfig.excludedPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Skip excluded methods
    if (csrfConfig.excludedMethods.includes(req.method)) {
      return next();
    }

    const sessionId = getSessionId(req);
    const submittedToken = req.headers[csrfConfig.headerName.toLowerCase()] as string ||
                          req.body?._csrf ||
                          req.query?._csrf;

    // Validate the token
    if (!submittedToken) {
      logger.warn('CSRF token missing', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      res.status(403).json({
        error: 'Forbidden',
        message: 'CSRF token is required'
      });
      return;
    }

    if (!tokenStore.validate(sessionId, submittedToken)) {
      logger.warn('Invalid CSRF token', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid CSRF token'
      });
      return;
    }

    // Token is valid, continue
    next();
  };
}

/**
 * Middleware to generate and set CSRF token
 */
export function generateCsrfToken(
  config: Partial<CsrfConfig> = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const csrfConfig = { ...DEFAULT_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!csrfConfig.enabled) {
      return next();
    }

    const sessionId = getSessionId(req);
    
    // Check if token already exists
    const existingToken = req.cookies?.[csrfConfig.cookieName];
    
    if (!existingToken || !tokenStore.validate(sessionId, existingToken)) {
      // Generate new token
      const newToken = tokenStore.create(sessionId);
      
      // Set cookie
      res.cookie(csrfConfig.cookieName, newToken, {
        secure: csrfConfig.cookieSecure,
        httpOnly: csrfConfig.cookieHttpOnly,
        sameSite: csrfConfig.cookieSameSite,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Attach to response locals for use in templates
      res.locals.csrfToken = newToken;
    } else {
      res.locals.csrfToken = existingToken;
    }

    next();
  };
}

/**
 * Get CSRF token for a session (for testing/debugging)
 */
export function getCsrfToken(sessionId?: string): string | null {
  if (!sessionId) {
    return null;
  }
  
  const stored = tokenStore as any;
  const data = stored.tokens?.get(sessionId);
  return data?.token || null;
}

export { tokenStore };
