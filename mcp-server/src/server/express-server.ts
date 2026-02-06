/**
 * Express HTTP Server with security middleware
 * Provides health checks, metrics, and MCP endpoints
 */

import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { logger } from '../utils/logger';
import { healthEndpoints } from './health-endpoints';
import { rateLimiters } from '../middleware/rate-limiter';
import { 
  getHelmetMiddleware, 
  getCorsMiddleware, 
  getCompressionMiddleware,
  getTimeoutMiddleware
} from '../middleware/security';
import { authenticateApiKey } from '../middleware/auth';
import { csrfProtection, generateCsrfToken } from '../middleware/csrf';
import { validateRequest } from '../middleware/validation';
import { correlationId, requestPerformanceTracker } from '../middleware/correlation';
import { requestLogger, metricsCollector } from '../middleware/request-logger';
import { performanceMetrics } from '../middleware/request-logger';

export class ExpressServer {
  private app: express.Application;
  private server: any;
  private port: number;

  constructor(port: number = parseInt(process.env.PORT || '3000', 10)) {
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup security and utility middleware
   */
  private setupMiddleware(): void {
    // Trust proxy for accurate client IP
    this.app.set('trust proxy', 1);
    
    // Security headers (Helmet)
    this.app.use(getHelmetMiddleware());
    
    // CORS
    this.app.use(getCorsMiddleware());
    
    // Compression
    this.app.use(getCompressionMiddleware());
    
    // Request timeout
    this.app.use(getTimeoutMiddleware(30000));
    
    // Cookie parser (required for CSRF)
    this.app.use(cookieParser());
    
    // Correlation ID for distributed tracing
    this.app.use(correlationId());
    
    // Request/Response logging
    this.app.use(requestLogger());
    
    // Performance tracking
    this.app.use(requestPerformanceTracker());
    
    // Metrics collection
    this.app.use(metricsCollector());
    
    // Request validation and sanitization
    this.app.use(validateRequest());
    
    // Body parsing with size limits
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // CSRF token generation (must be after cookie-parser)
    this.app.use(generateCsrfToken());
    
    // API Key authentication
    this.app.use(authenticateApiKey());
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // Health check endpoints
    this.app.get('/health', this.handleHealthCheck.bind(this));
    this.app.get('/ready', this.handleReadinessCheck.bind(this));
    this.app.get('/live', this.handleLivenessCheck.bind(this));
    this.app.get('/metrics', this.handleMetrics.bind(this));
    
    // Performance metrics endpoint
    this.app.get('/admin/performance', this.handlePerformanceMetrics.bind(this));
    
    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'MCP RepairShopr Server',
        version: process.env.npm_package_version || '0.1.0',
        status: 'running',
        endpoints: ['/health', '/ready', '/live', '/metrics']
      });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
        availableEndpoints: ['/health', '/ready', '/live', '/metrics']
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      logger.error('Express error handler', { 
        error: err.message,
        stack: err.stack,
        path: req.path
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : err.message
      });
    });
  }

  /**
   * Handle health check
   */
  private async handleHealthCheck(req: Request, res: Response): Promise<void> {
    const rateLimitResult = rateLimiters.health.isAllowed('health');
    
    if (!rateLimitResult.allowed) {
      res.status(429)
        .set('X-RateLimit-Limit', rateLimiters.health.getStats().maxRequests.toString())
        .set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
        .json({
          error: 'Too Many Requests',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        });
      return;
    }

    const healthStatus = healthEndpoints.getHealthStatus();
    
    res.status(healthStatus.status === 'healthy' ? 200 : 503)
      .set('X-RateLimit-Limit', rateLimiters.health.getStats().maxRequests.toString())
      .set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      .json(healthStatus);
  }

  /**
   * Handle readiness check
   */
  private async handleReadinessCheck(req: Request, res: Response): Promise<void> {
    const rateLimitResult = rateLimiters.health.isAllowed('readiness');
    
    if (!rateLimitResult.allowed) {
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      });
      return;
    }

    const readinessStatus = healthEndpoints.getReadinessStatus();
    
    res.status(readinessStatus.ready ? 200 : 503).json(readinessStatus);
  }

  /**
   * Handle liveness check
   */
  private async handleLivenessCheck(req: Request, res: Response): Promise<void> {
    const rateLimitResult = rateLimiters.health.isAllowed('liveness');
    
    if (!rateLimitResult.allowed) {
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      });
      return;
    }

    const livenessStatus = healthEndpoints.getLivenessStatus();
    
    res.status(livenessStatus.alive ? 200 : 503).json(livenessStatus);
  }

  /**
   * Handle metrics
   */
  private async handleMetrics(req: Request, res: Response): Promise<void> {
    const rateLimitResult = rateLimiters.health.isAllowed('metrics');
    
    if (!rateLimitResult.allowed) {
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      });
      return;
    }

    const metrics = healthEndpoints.getPrometheusMetrics();
    
    res.set('Content-Type', 'text/plain').send(metrics);
  }

  /**
   * Handle performance metrics endpoint
   */
  private async handlePerformanceMetrics(req: Request, res: Response): Promise<void> {
    const summary = performanceMetrics.getSummary();
    const endpointMetrics = Array.from(performanceMetrics.getMetrics().entries());
    
    res.json({
      summary,
      endpoints: endpointMetrics.map(([key, data]) => ({
        endpoint: key,
        ...data
      }))
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, () => {
        logger.info(`Express server started on port ${this.port}`);
        resolve();
      });

      this.server.on('error', (error: any) => {
        logger.error('Express server error', { error });
        reject(error);
      });
    });
  }

  /**
   * Stop the server gracefully
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close(() => {
        logger.info('Express server stopped');
        resolve();
      });
    });
  }

  /**
   * Get server address
   */
  getAddress(): string | null {
    if (!this.server) return null;
    const address = this.server.address();
    if (typeof address === 'string') return address;
    if (address) return `${address.address}:${address.port}`;
    return null;
  }
}

export const expressServer = new ExpressServer();
