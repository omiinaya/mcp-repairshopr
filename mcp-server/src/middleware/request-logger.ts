/**
 * Request/Response logging middleware
 * Logs all incoming requests and outgoing responses
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { getCorrelationId } from './correlation';

export interface RequestLoggerConfig {
  logBody: boolean;
  logHeaders: boolean;
  logQuery: boolean;
  logParams: boolean;
  maxBodyLength: number;
  sensitiveHeaders: string[];
  sensitiveFields: string[];
}

const DEFAULT_CONFIG: RequestLoggerConfig = {
  logBody: process.env.LOG_REQUEST_BODY === 'true',
  logHeaders: process.env.LOG_REQUEST_HEADERS === 'true',
  logQuery: true,
  logParams: true,
  maxBodyLength: 1000,
  sensitiveHeaders: [
    'authorization',
    'cookie',
    'x-api-key',
    'x-csrf-token',
    'x-request-id',
  ],
  sensitiveFields: [
    'password',
    'token',
    'apiKey',
    'secret',
    'credential',
    'privateKey',
  ],
};

/**
 * Mask sensitive data
 */
function maskSensitiveData(obj: any, sensitiveFields: string[]): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const masked: any = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(masked)) {
    if (
      sensitiveFields.some((field) =>
        key.toLowerCase().includes(field.toLowerCase())
      )
    ) {
      masked[key] = '***REDACTED***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key], sensitiveFields);
    }
  }

  return masked;
}

/**
 * Filter sensitive headers
 */
function filterHeaders(headers: any, sensitiveHeaders: string[]): any {
  const filtered: any = {};

  for (const [key, value] of Object.entries(headers)) {
    if (
      !sensitiveHeaders.some((sh) =>
        key.toLowerCase().includes(sh.toLowerCase())
      )
    ) {
      filtered[key] = value;
    } else {
      filtered[key] = '***REDACTED***';
    }
  }

  return filtered;
}

/**
 * Request/Response logging middleware
 */
export function requestLogger(
  config: Partial<RequestLoggerConfig> = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const loggerConfig = { ...DEFAULT_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const correlationId = getCorrelationId(req);

    // Log request
    const requestLog: any = {
      correlationId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    if (loggerConfig.logQuery && Object.keys(req.query).length > 0) {
      requestLog.query = maskSensitiveData(
        req.query,
        loggerConfig.sensitiveFields
      );
    }

    if (loggerConfig.logParams && Object.keys(req.params).length > 0) {
      requestLog.params = req.params;
    }

    if (loggerConfig.logHeaders) {
      requestLog.headers = filterHeaders(
        req.headers,
        loggerConfig.sensitiveHeaders
      );
    }

    if (loggerConfig.logBody && req.body) {
      let body = req.body;
      if (typeof body === 'object') {
        body = maskSensitiveData(body, loggerConfig.sensitiveFields);
      }

      const bodyStr = JSON.stringify(body);
      if (bodyStr.length > loggerConfig.maxBodyLength) {
        requestLog.body =
          bodyStr.substring(0, loggerConfig.maxBodyLength) + '...[truncated]';
      } else {
        requestLog.body = body;
      }
    }

    logger.info('Request started', requestLog);

    // Capture original end function
    const originalEnd = res.end.bind(res);
    let responseBody = '';

    // Override end to capture response
    res.end = function (chunk: any, encoding?: any): Response {
      if (chunk) {
        responseBody += chunk.toString();
      }
      return originalEnd(chunk, encoding);
    };

    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      const responseLog: any = {
        correlationId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('content-length'),
      };

      // Log response body for errors
      if (res.statusCode >= 400 && responseBody) {
        try {
          const body = JSON.parse(responseBody);
          responseLog.responseBody = maskSensitiveData(
            body,
            loggerConfig.sensitiveFields
          );
        } catch {
          responseLog.responseBody = responseBody.substring(0, 200);
        }
      }

      // Log based on status code
      if (res.statusCode >= 500) {
        logger.error('Request failed', responseLog);
      } else if (res.statusCode >= 400) {
        logger.warn('Request error', responseLog);
      } else {
        logger.info('Request completed', responseLog);
      }
    });

    next();
  };
}

/**
 * Performance metrics collector
 */
export class PerformanceMetrics {
  private metrics: Map<
    string,
    {
      count: number;
      totalDuration: number;
      minDuration: number;
      maxDuration: number;
      errors: number;
    }
  > = new Map();

  /**
   * Record a request metric
   */
  record(
    path: string,
    method: string,
    statusCode: number,
    duration: number
  ): void {
    const key = `${method} ${path}`;
    const existing = this.metrics.get(key) || {
      count: 0,
      totalDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      errors: 0,
    };

    existing.count++;
    existing.totalDuration += duration;
    existing.minDuration = Math.min(existing.minDuration, duration);
    existing.maxDuration = Math.max(existing.maxDuration, duration);

    if (statusCode >= 400) {
      existing.errors++;
    }

    this.metrics.set(key, existing);
  }

  /**
   * Get all metrics
   */
  getMetrics(): Map<string, any> {
    const result = new Map();

    for (const [key, data] of this.metrics.entries()) {
      result.set(key, {
        ...data,
        averageDuration: data.count > 0 ? data.totalDuration / data.count : 0,
        errorRate: data.count > 0 ? (data.errors / data.count) * 100 : 0,
      });
    }

    return result;
  }

  /**
   * Get metrics for specific endpoint
   */
  getEndpointMetrics(path: string, method: string): any {
    return this.metrics.get(`${method} ${path}`);
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalRequests: number;
    totalErrors: number;
    averageResponseTime: number;
    errorRate: number;
  } {
    let totalRequests = 0;
    let totalErrors = 0;
    let totalDuration = 0;

    for (const data of this.metrics.values()) {
      totalRequests += data.count;
      totalErrors += data.errors;
      totalDuration += data.totalDuration;
    }

    return {
      totalRequests,
      totalErrors,
      averageResponseTime:
        totalRequests > 0 ? totalDuration / totalRequests : 0,
      errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

export const performanceMetrics = new PerformanceMetrics();

/**
 * Metrics collection middleware
 */
export function metricsCollector(): (
  req: Request,
  res: Response,
  next: NextFunction
) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      performanceMetrics.record(req.path, req.method, res.statusCode, duration);
    });

    next();
  };
}
