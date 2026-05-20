/**
 * Rate limiting middleware
 * Prevents abuse and ensures fair usage
 */

import { logger } from '../utils/logger';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: any) => string;
  handler?: (req: any, res: any) => void;
  onLimitReached?: (req: any, res: any) => void;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  skipSuccessfulRequests: false,
};

export class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.store = new Map();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanupInterval();
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.store.delete(key);
    logger.debug(`Rate limit reset for key: ${key}`);
  }

  /**
   * Get current rate limit status for a key
   */
  getStatus(
    key: string
  ): { count: number; remaining: number; resetTime: number } | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    return {
      count: entry.count,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Rate limiter cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.windowMs);
  }

  /**
   * Stop cleanup interval
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get store statistics
   */
  getStats(): { size: number; windowMs: number; maxRequests: number } {
    return {
      size: this.store.size,
      windowMs: this.config.windowMs,
      maxRequests: this.config.maxRequests,
    };
  }
}

// Different rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiter
  general: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  }),

  // Stricter limit for expensive operations
  expensive: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  }),

  // Health check rate limiter (more lenient)
  health: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  }),

  // Tool call rate limiter
  toolCall: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
  }),
};

/**
 * Middleware factory for rate limiting
 */
export function createRateLimitMiddleware(
  limiter: RateLimiter,
  keyGenerator?: (req: any) => string
) {
  return async (req: any, res: any, next: () => void): Promise<void> => {
    try {
      // Generate key (default to IP address)
      const key = keyGenerator ? keyGenerator(req) : req.ip || 'unknown';

      // Check rate limit
      const result = limiter.isAllowed(key);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limiter.getStats().maxRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

      if (!result.allowed) {
        logger.warn(`Rate limit exceeded for key: ${key}`);

        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          })
        );
        return;
      }

      next();
    } catch (error) {
      logger.error('Rate limiter error', { error });
      // Fail open - allow request on error
      next();
    }
  };
}

/**
 * Generate rate limit key from request
 */
export function generateRateLimitKey(req: any): string {
  // Use IP address and tool name (if applicable)
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const toolName = req.body?.tool || 'unknown';
  return `${ip}:${toolName}`;
}
