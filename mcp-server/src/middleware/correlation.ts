/**
 * Correlation ID middleware
 * Adds unique request tracking IDs for distributed tracing
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface CorrelationConfig {
  headerName: string;
  generateId: () => string;
  includeInResponse: boolean;
}

// Simple UUID generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const DEFAULT_CONFIG: CorrelationConfig = {
  headerName: 'X-Request-ID',
  generateId: generateUUID,
  includeInResponse: true
};

// Store for correlation context (scoped to request)
const correlationStorage = new Map<string, {
  id: string;
  startTime: number;
  metadata: Map<string, any>;
}>();

/**
 * Correlation ID middleware
 */
export function correlationId(
  config: Partial<CorrelationConfig> = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const correlationConfig = { ...DEFAULT_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    // Get existing correlation ID from header or generate new one
    const existingId = req.headers[correlationConfig.headerName.toLowerCase()] as string;
    const correlationId = existingId || correlationConfig.generateId();

    // Store correlation data
    correlationStorage.set(correlationId, {
      id: correlationId,
      startTime: Date.now(),
      metadata: new Map()
    });

    // Attach to request
    (req as any).correlationId = correlationId;

    // Add to response headers if enabled
    if (correlationConfig.includeInResponse) {
      res.setHeader(correlationConfig.headerName, correlationId);
    }

    // Log with correlation ID
    logger.debug('Request started', {
      correlationId,
      method: req.method,
      path: req.path,
      ip: req.ip
    });

    // Cleanup on response finish
    res.on('finish', () => {
      const data = correlationStorage.get(correlationId);
      if (data) {
        const duration = Date.now() - data.startTime;
        logger.debug('Request completed', {
          correlationId,
          duration: `${duration}ms`,
          statusCode: res.statusCode
        });
        correlationStorage.delete(correlationId);
      }
    });

    next();
  };
}

/**
 * Get current correlation ID from request
 */
export function getCorrelationId(req: Request): string | undefined {
  return (req as any).correlationId;
}

/**
 * Get correlation data
 */
export function getCorrelationData(correlationId: string): {
  id: string;
  startTime: number;
  metadata: Map<string, any>;
} | undefined {
  return correlationStorage.get(correlationId);
}

/**
 * Set correlation metadata
 */
export function setCorrelationMetadata(
  req: Request,
  key: string,
  value: any
): void {
  const id = getCorrelationId(req);
  if (id) {
    const data = correlationStorage.get(id);
    if (data) {
      data.metadata.set(key, value);
    }
  }
}

/**
 * Get correlation metadata
 */
export function getCorrelationMetadata(
  req: Request,
  key: string
): any {
  const id = getCorrelationId(req);
  if (id) {
    const data = correlationStorage.get(id);
    return data?.metadata.get(key);
  }
  return undefined;
}

/**
 * Tracing span interface
 */
export interface Span {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  parentId?: string;
  metadata: Map<string, any>;
  end(): void;
  addEvent(name: string, attributes?: Record<string, any>): void;
  setAttribute(key: string, value: any): void;
}

/**
 * Lightweight tracing (simplified alternative to OpenTelemetry)
 */
class Tracer {
  private spans: Map<string, Span> = new Map();
  private activeSpan: string | null = null;

  /**
   * Start a new span
   */
  startSpan(name: string, parentId?: string): Span {
    const id = generateUUID();
    const span: Span = {
      id,
      name,
      startTime: Date.now(),
      parentId: parentId || this.activeSpan || undefined,
      metadata: new Map(),
      end: () => {
        span.endTime = Date.now();
        const duration = span.endTime - span.startTime;
        logger.debug(`Span ended: ${name}`, {
          spanId: id,
          duration: `${duration}ms`
        });
      },
      addEvent: (eventName: string, attributes?: Record<string, any>) => {
        logger.debug(`Span event: ${eventName}`, {
          spanId: id,
          spanName: name,
          ...attributes
        });
      },
      setAttribute: (key: string, value: any) => {
        span.metadata.set(key, value);
      }
    };

    this.spans.set(id, span);
    this.activeSpan = id;

    return span;
  }

  /**
   * Get span by ID
   */
  getSpan(id: string): Span | undefined {
    return this.spans.get(id);
  }

  /**
   * Get all spans
   */
  getAllSpans(): Span[] {
    return Array.from(this.spans.values());
  }

  /**
   * Clear all spans
   */
  clear(): void {
    this.spans.clear();
    this.activeSpan = null;
  }
}

export const tracer = new Tracer();

/**
 * Performance measurement utility
 */
export class PerformanceTimer {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, { start: string; end: string; duration: number }> = new Map();

  /**
   * Mark a point in time
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * Measure duration between two marks
   */
  measure(name: string, startMark: string, endMark: string): number {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);

    if (!start || !end) {
      throw new Error(`Marks not found: ${startMark}, ${endMark}`);
    }

    const duration = end - start;
    this.measures.set(name, { start: startMark, end: endMark, duration });
    return duration;
  }

  /**
   * Get all measures
   */
  getMeasures(): Map<string, { start: string; end: string; duration: number }> {
    return new Map(this.measures);
  }

  /**
   * Clear all marks and measures
   */
  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }
}

/**
 * Request performance tracking middleware
 */
export function requestPerformanceTracker(): (
  req: Request,
  res: Response,
  next: NextFunction
) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = new PerformanceTimer();
    timer.mark('request-start');

    // Attach timer to request
    (req as any).performanceTimer = timer;

    res.on('finish', () => {
      timer.mark('request-end');
      const duration = timer.measure('total', 'request-start', 'request-end');
      
      logger.debug('Request performance', {
        method: req.method,
        path: req.path,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        correlationId: getCorrelationId(req)
      });
    });

    next();
  };
}
