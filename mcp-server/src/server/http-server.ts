/**
 * HTTP Server for health checks and metrics
 * Runs alongside the MCP server to provide HTTP endpoints
 */

import http from 'http';
import { logger } from '../utils/logger';
import { healthEndpoints } from './health-endpoints';
import {
  rateLimiters,
  createRateLimitMiddleware,
} from '../middleware/rate-limiter';
import { server as mcpServer } from '../server';

export class HTTPServer {
  private server: http.Server | null = null;
  private port: number;

  constructor(port: number = parseInt(process.env.PORT || '3000', 10)) {
    this.port = port;
  }

  /**
   * Start the HTTP server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(this.port, () => {
        logger.info(`HTTP server started on port ${this.port}`);
        resolve();
      });

      this.server.on('error', (error) => {
        logger.error('HTTP server error', { error });
        reject(error);
      });
    });
  }

  /**
   * Stop the HTTP server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close(() => {
        logger.info('HTTP server stopped');
        resolve();
      });
    });
  }

  /**
   * Handle HTTP requests
   */
  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method || 'GET';

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    try {
      switch (path) {
        case '/health':
          await this.handleHealthCheck(req, res);
          break;
        case '/ready':
          await this.handleReadinessCheck(req, res);
          break;
        case '/live':
          await this.handleLivenessCheck(req, res);
          break;
        case '/metrics':
          await this.handleMetrics(req, res);
          break;
        default:
          this.handleNotFound(res);
      }
    } catch (error) {
      logger.error('HTTP request handler error', { error, path, method });
      this.handleError(res, error);
    }
  }

  /**
   * Handle health check request
   */
  private async handleHealthCheck(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const rateLimitResult = rateLimiters.health.isAllowed('health');

    if (!rateLimitResult.allowed) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'X-RateLimit-Limit',
        rateLimiters.health.getStats().maxRequests
      );
      res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
      res.end(
        JSON.stringify({
          error: 'Too Many Requests',
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        })
      );
      return;
    }

    const healthStatus = healthEndpoints.getHealthStatus();

    res.statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'X-RateLimit-Limit',
      rateLimiters.health.getStats().maxRequests
    );
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
    res.end(JSON.stringify(healthStatus, null, 2));
  }

  /**
   * Handle readiness check request
   */
  private async handleReadinessCheck(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const rateLimitResult = rateLimiters.health.isAllowed('readiness');

    if (!rateLimitResult.allowed) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Too Many Requests',
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        })
      );
      return;
    }

    const readinessStatus = healthEndpoints.getReadinessStatus();

    res.statusCode = readinessStatus.ready ? 200 : 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(readinessStatus, null, 2));
  }

  /**
   * Handle liveness check request
   */
  private async handleLivenessCheck(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const rateLimitResult = rateLimiters.health.isAllowed('liveness');

    if (!rateLimitResult.allowed) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Too Many Requests',
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        })
      );
      return;
    }

    const livenessStatus = healthEndpoints.getLivenessStatus();

    res.statusCode = livenessStatus.alive ? 200 : 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(livenessStatus, null, 2));
  }

  /**
   * Handle metrics request
   */
  private async handleMetrics(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const rateLimitResult = rateLimiters.health.isAllowed('metrics');

    if (!rateLimitResult.allowed) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Too Many Requests',
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        })
      );
      return;
    }

    const metrics = healthEndpoints.getPrometheusMetrics();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(metrics);
  }

  /**
   * Handle 404 Not Found
   */
  private handleNotFound(res: http.ServerResponse): void {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify(
        {
          error: 'Not Found',
          message: 'The requested endpoint does not exist',
          availableEndpoints: ['/health', '/ready', '/live', '/metrics'],
        },
        null,
        2
      )
    );
  }

  /**
   * Handle error
   */
  private handleError(res: http.ServerResponse, error: any): void {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify(
        {
          error: 'Internal Server Error',
          message: error.message || 'An unexpected error occurred',
        },
        null,
        2
      )
    );
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

export const httpServer = new HTTPServer();
