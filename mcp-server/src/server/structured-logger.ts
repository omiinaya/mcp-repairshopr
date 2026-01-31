/**
 * Structured logger for MCP server
 * Extends the existing logger with structured logging support
 */

import { logger, LogMetadata } from '../utils/logger';

export interface RequestLog {
  correlationId: string;
  method: string;
  params: any;
  timestamp: Date;
}

export interface ResponseLog {
  correlationId: string;
  method: string;
  success: boolean;
  duration: number;
  result?: any;
  error?: string;
  timestamp: Date;
}

export interface PerformanceLog {
  operation: string;
  duration: number;
  metadata?: LogMetadata;
  timestamp: Date;
}

export interface ErrorLog {
  correlationId?: string;
  error: Error;
  stackTrace?: string;
  context?: any;
  timestamp: Date;
}

class StructuredLogger {
  private correlationIdCounter: number = 0;

  /**
   * Generate a unique correlation ID
   */
  private generateCorrelationId(): string {
    this.correlationIdCounter++;
    return `req-${Date.now()}-${this.correlationIdCounter}`;
  }

  /**
   * Log an incoming request
   */
  logRequest(method: string, params: any): string {
    const correlationId = this.generateCorrelationId();
    const requestLog: RequestLog = {
      correlationId,
      method,
      params,
      timestamp: new Date()
    };

    logger.info('Incoming request', {
      correlationId,
      method,
      params: this.sanitizeParams(params),
      timestamp: requestLog.timestamp.toISOString()
    });

    return correlationId;
  }

  /**
   * Log an outgoing response
   */
  logResponse(
    correlationId: string,
    method: string,
    success: boolean,
    duration: number,
    result?: any,
    error?: string
  ): void {
    const responseLog: ResponseLog = {
      correlationId,
      method,
      success,
      duration,
      result,
      error,
      timestamp: new Date()
    };

    const logLevel = success ? 'info' : 'error';
    const message = success ? 'Request completed' : 'Request failed';

    logger[logLevel](message, {
      correlationId,
      method,
      success,
      duration: `${duration}ms`,
      result: success ? this.sanitizeResult(result) : undefined,
      error: error,
      timestamp: responseLog.timestamp.toISOString()
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, metadata?: LogMetadata): void {
    const performanceLog: PerformanceLog = {
      operation,
      duration,
      metadata,
      timestamp: new Date()
    };

    logger.info('Performance metric', {
      operation,
      duration: `${duration}ms`,
      metadata,
      timestamp: performanceLog.timestamp.toISOString()
    });
  }

  /**
   * Log an error with stack trace and context
   */
  logError(error: Error, context?: any, correlationId?: string): void {
    const errorLog: ErrorLog = {
      correlationId,
      error,
      stackTrace: error.stack,
      context,
      timestamp: new Date()
    };

    logger.error('Error occurred', {
      correlationId,
      error: error.message,
      stackTrace: error.stack,
      context,
      timestamp: errorLog.timestamp.toISOString()
    });
  }

  /**
   * Log a warning with context
   */
  logWarning(message: string, context?: any, correlationId?: string): void {
    logger.warn(message, {
      correlationId,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log debug information
   */
  logDebug(message: string, context?: any, correlationId?: string): void {
    logger.debug(message, {
      correlationId,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log trace information
   */
  logTrace(message: string, context?: any, correlationId?: string): void {
    logger.trace(message, {
      correlationId,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Sanitize request params to remove sensitive data
   */
  private sanitizeParams(params: any): any {
    if (!params) {
      return params;
    }

    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'credential'];
    const sanitized = { ...params };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Sanitize result to limit size
   */
  private sanitizeResult(result: any): any {
    if (!result) {
      return result;
    }

    const resultString = JSON.stringify(result);
    if (resultString.length > 1000) {
      return { _truncated: true, _length: resultString.length };
    }

    return result;
  }

  /**
   * Log tool execution start
   */
  logToolStart(toolName: string, params: any): string {
    const correlationId = this.generateCorrelationId();

    logger.info('Tool execution started', {
      correlationId,
      toolName,
      params: this.sanitizeParams(params),
      timestamp: new Date().toISOString()
    });

    return correlationId;
  }

  /**
   * Log tool execution completion
   */
  logToolComplete(
    correlationId: string,
    toolName: string,
    success: boolean,
    duration: number,
    result?: any,
    error?: string
  ): void {
    const logLevel = success ? 'info' : 'error';
    const message = success ? 'Tool execution completed' : 'Tool execution failed';

    logger[logLevel](message, {
      correlationId,
      toolName,
      success,
      duration: `${duration}ms`,
      result: success ? this.sanitizeResult(result) : undefined,
      error,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log health check
   */
  logHealthCheck(status: 'healthy' | 'unhealthy', uptime: number, metrics?: any): void {
    logger.info('Health check', {
      status,
      uptime: `${uptime}ms`,
      metrics,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log configuration change
   */
  logConfigChange(oldConfig: any, newConfig: any): void {
    logger.info('Configuration changed', {
      oldConfig,
      newConfig,
      timestamp: new Date().toISOString()
    });
  }
}

export const structuredLogger = new StructuredLogger();
