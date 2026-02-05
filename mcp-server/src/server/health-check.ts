/**
 * Health check endpoint for MCP server
 * Provides health status and metrics for monitoring
 */

import { Request, Response } from 'express';
import { monitoringService } from './monitoring';
import { logger } from '../utils/logger';

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    server: boolean;
    monitoring: boolean;
    cache: boolean;
  };
  metrics?: {
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

/**
 * Health check handler
 */
export const healthCheckHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const healthStatus = monitoringService.getHealthStatus();
    const memoryUsage = process.memoryUsage();

    const response: HealthCheckResponse = {
      status: healthStatus.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      checks: {
        server: healthStatus.healthy,
        monitoring: true,
        cache: true
      },
      metrics: {
        requestCount: healthStatus.metrics?.requestsTotal || 0,
        errorCount: healthStatus.metrics?.requestsFailed || 0,
        averageResponseTime: healthStatus.metrics?.averageResponseTime || 0,
        memoryUsage
      }
    };

    const statusCode = healthStatus.healthy ? 200 : 503;
    res.status(statusCode).json(response);

    logger.info('Health check completed', {
      status: response.status,
      uptime: response.uptime,
      memoryUsage: memoryUsage.heapUsed
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
};

/**
 * Readiness check handler
 */
export const readinessCheckHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const healthStatus = monitoringService.getHealthStatus();

    if (healthStatus.healthy) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Readiness check failed', { error });
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Liveness check handler
 */
export const livenessCheckHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

/**
 * Metrics endpoint handler
 */
export const metricsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const healthStatus = monitoringService.getHealthStatus();
    const memoryUsage = process.memoryUsage();

    // Format metrics in Prometheus format
    const metrics = [
      `# HELP mcp_server_uptime_seconds Server uptime in seconds`,
      `# TYPE mcp_server_uptime_seconds gauge`,
      `mcp_server_uptime_seconds ${process.uptime()}`,
      ``,
      `# HELP mcp_server_memory_heap_used_bytes Memory heap used in bytes`,
      `# TYPE mcp_server_memory_heap_used_bytes gauge`,
      `mcp_server_memory_heap_used_bytes ${memoryUsage.heapUsed}`,
      ``,
      `# HELP mcp_server_memory_heap_total_bytes Memory heap total in bytes`,
      `# TYPE mcp_server_memory_heap_total_bytes gauge`,
      `mcp_server_memory_heap_total_bytes ${memoryUsage.heapTotal}`,
      ``,
      `# HELP mcp_server_memory_external_bytes Memory external in bytes`,
      `# TYPE mcp_server_memory_external_bytes gauge`,
      `mcp_server_memory_external_bytes ${memoryUsage.external}`,
      ``,
      `# HELP mcp_server_request_count_total Total number of requests`,
      `# TYPE mcp_server_request_count_total counter`,
      `mcp_server_request_count_total ${healthStatus.metrics?.requestsTotal || 0}`,
      ``,
      `# HELP mcp_server_error_count_total Total number of errors`,
      `# TYPE mcp_server_error_count_total counter`,
      `mcp_server_error_count_total ${healthStatus.metrics?.requestsFailed || 0}`,
      ``,
      `# HELP mcp_server_average_response_time_ms Average response time in milliseconds`,
      `# TYPE mcp_server_average_response_time_ms gauge`,
      `mcp_server_average_response_time_ms ${healthStatus.metrics?.averageResponseTime || 0}`,
      ``,
      `# HELP mcp_server_health_status Server health status (1=healthy, 0=unhealthy)`,
      `# TYPE mcp_server_health_status gauge`,
      `mcp_server_health_status ${healthStatus.healthy ? 1 : 0}`
    ].join('\n');

    res.set('Content-Type', 'text/plain');
    res.status(200).send(metrics);

    logger.debug('Metrics endpoint accessed');
  } catch (error) {
    logger.error('Metrics endpoint failed', { error });
    res.status(500).send('Failed to retrieve metrics');
  }
};
