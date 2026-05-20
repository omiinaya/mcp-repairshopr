/**
 * Enhanced health check endpoints
 * Provides /health, /ready, /live, and /metrics endpoints
 */

import { logger } from '../utils/logger';
import { server } from '../server';
import { monitoringService } from './monitoring';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  uptime: number;
  timestamp: string;
  version: string;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  responseTime: number;
  message?: string;
}

export interface ReadinessStatus {
  ready: boolean;
  checks: {
    serverInitialized: boolean;
    metadataIndexLoaded: boolean;
    vectorStoreReady: boolean;
    cacheReady: boolean;
  };
  timestamp: string;
}

export interface LivenessStatus {
  alive: boolean;
  uptime: number;
  timestamp: string;
}

export class HealthEndpoints {
  private startTime: number;
  private version: string;

  constructor() {
    this.startTime = Date.now();
    this.version = process.env.npm_package_version || '0.1.0';
  }

  /**
   * Get comprehensive health status
   * /health endpoint
   */
  getHealthStatus(): HealthStatus {
    const checks: HealthCheck[] = [];
    const startCheck = Date.now();

    // Check server status
    checks.push(this.checkServerStatus());

    // Check memory usage
    checks.push(this.checkMemoryUsage());

    // Check cache status
    checks.push(this.checkCacheStatus());

    // Check metadata index
    checks.push(this.checkMetadataIndex());

    // Check vector store
    checks.push(this.checkVectorStore());

    const totalTime = Date.now() - startCheck;
    const allPassed = checks.every((c) => c.status === 'pass');
    const hasFailures = checks.some((c) => c.status === 'fail');

    const status: HealthStatus = {
      status: hasFailures ? 'unhealthy' : allPassed ? 'healthy' : 'degraded',
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
      version: this.version,
      checks: checks.map((c) => ({
        ...c,
        responseTime: totalTime / checks.length,
      })),
    };

    logger.debug('Health check completed', {
      status: status.status,
      checks: checks.length,
    });
    return status;
  }

  /**
   * Get readiness status
   * /ready endpoint - checks if server is ready to accept traffic
   */
  getReadinessStatus(): ReadinessStatus {
    const startCheck = Date.now();

    const checks = {
      serverInitialized: server.isServerRunning(),
      metadataIndexLoaded: server.getMetadataIndex() !== null,
      vectorStoreReady: server.getVectorStore() !== null,
      cacheReady: true, // Cache is always ready once initialized
    };

    const ready = Object.values(checks).every((v) => v === true);
    const responseTime = Date.now() - startCheck;

    logger.debug('Readiness check completed', { ready, responseTime });

    return {
      ready,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get liveness status
   * /live endpoint - checks if server is alive
   */
  getLivenessStatus(): LivenessStatus {
    return {
      alive: server.isServerRunning(),
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get Prometheus metrics
   * /metrics endpoint
   */
  getPrometheusMetrics(): string {
    const metrics: string[] = [];
    const healthStatus = monitoringService.getHealthStatus();

    // Uptime metric
    const uptime = (Date.now() - this.startTime) / 1000;
    metrics.push(`# HELP mcp_server_uptime_seconds Server uptime in seconds`);
    metrics.push(`# TYPE mcp_server_uptime_seconds gauge`);
    metrics.push(`mcp_server_uptime_seconds ${uptime}`);

    // Health status metric
    metrics.push(
      `# HELP mcp_server_health_status Server health status (1=healthy, 0=unhealthy)`
    );
    metrics.push(`# TYPE mcp_server_health_status gauge`);
    metrics.push(`mcp_server_health_status ${healthStatus.healthy ? 1 : 0}`);

    // Memory usage metrics
    const memUsage = process.memoryUsage();
    metrics.push(`# HELP mcp_server_memory_usage_bytes Memory usage in bytes`);
    metrics.push(`# TYPE mcp_server_memory_usage_bytes gauge`);
    metrics.push(`mcp_server_memory_usage_bytes{type="rss"} ${memUsage.rss}`);
    metrics.push(
      `mcp_server_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}`
    );
    metrics.push(
      `mcp_server_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}`
    );
    metrics.push(
      `mcp_server_memory_usage_bytes{type="external"} ${memUsage.external}`
    );

    // Request metrics
    const requestStats = server.getRequestStats();
    metrics.push(`# HELP mcp_server_requests_total Total number of requests`);
    metrics.push(`# TYPE mcp_server_requests_total counter`);
    metrics.push(`mcp_server_requests_total ${requestStats.count}`);

    metrics.push(
      `# HELP mcp_server_tool_calls_total Total number of tool calls`
    );
    metrics.push(`# TYPE mcp_server_tool_calls_total counter`);
    metrics.push(`mcp_server_tool_calls_total ${requestStats.toolCount}`);

    // Tool registry metrics
    const toolStats = server.getToolRegistryStats();
    metrics.push(
      `# HELP mcp_server_tools_total Total number of registered tools`
    );
    metrics.push(`# TYPE mcp_server_tools_total gauge`);
    metrics.push(`mcp_server_tools_total ${toolStats.totalTools}`);

    metrics.push(`# HELP mcp_server_tools_active Number of active tools`);
    metrics.push(`# TYPE mcp_server_tools_active gauge`);
    metrics.push(`mcp_server_tools_active ${toolStats.activeTools}`);

    // Cache metrics
    const cacheStats = server.getCacheStats();
    metrics.push(`# HELP mcp_server_cache_entries_total Total cache entries`);
    metrics.push(`# TYPE mcp_server_cache_entries_total gauge`);
    metrics.push(`mcp_server_cache_entries_total ${cacheStats.totalEntries}`);

    metrics.push(`# HELP mcp_server_cache_hits_total Total cache hits`);
    metrics.push(`# TYPE mcp_server_cache_hits_total counter`);
    metrics.push(`mcp_server_cache_hits_total ${cacheStats.hits}`);

    metrics.push(`# HELP mcp_server_cache_misses_total Total cache misses`);
    metrics.push(`# TYPE mcp_server_cache_misses_total counter`);
    metrics.push(`mcp_server_cache_misses_total ${cacheStats.misses}`);

    metrics.push(`# HELP mcp_server_cache_hit_ratio Cache hit ratio`);
    metrics.push(`# TYPE mcp_server_cache_hit_ratio gauge`);
    metrics.push(`mcp_server_cache_hit_ratio ${cacheStats.hitRate}`);

    // Node.js event loop lag
    const start = process.hrtime();
    setImmediate(() => {
      const delta = process.hrtime(start);
      const lag = delta[0] * 1000 + delta[1] / 1e6;
      metrics.push(
        `# HELP mcp_server_event_loop_lag_ms Event loop lag in milliseconds`
      );
      metrics.push(`# TYPE mcp_server_event_loop_lag_ms gauge`);
      metrics.push(`mcp_server_event_loop_lag_ms ${lag.toFixed(3)}`);
    });

    return metrics.join('\n') + '\n';
  }

  private checkServerStatus(): HealthCheck {
    const start = Date.now();
    const isRunning = server.isServerRunning();

    return {
      name: 'server_status',
      status: isRunning ? 'pass' : 'fail',
      responseTime: Date.now() - start,
      message: isRunning ? 'Server is running' : 'Server is not running',
    };
  }

  private checkMemoryUsage(): HealthCheck {
    const start = Date.now();
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const usagePercent = (heapUsedMB / heapTotalMB) * 100;

    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let message = `Memory usage: ${heapUsedMB.toFixed(2)} MB / ${heapTotalMB.toFixed(2)} MB (${usagePercent.toFixed(1)}%)`;

    if (usagePercent > 90) {
      status = 'fail';
      message += ' - CRITICAL: Memory usage exceeds 90%';
    } else if (usagePercent > 75) {
      status = 'warn';
      message += ' - WARNING: Memory usage exceeds 75%';
    }

    return {
      name: 'memory_usage',
      status,
      responseTime: Date.now() - start,
      message,
    };
  }

  private checkCacheStatus(): HealthCheck {
    const start = Date.now();

    try {
      const stats = server.getCacheStats();
      return {
        name: 'cache_status',
        status: 'pass',
        responseTime: Date.now() - start,
        message: `Cache has ${stats.totalEntries} entries, ${(stats.hitRate * 100).toFixed(1)}% hit rate`,
      };
    } catch (error) {
      return {
        name: 'cache_status',
        status: 'fail',
        responseTime: Date.now() - start,
        message: `Cache check failed: ${error}`,
      };
    }
  }

  private checkMetadataIndex(): HealthCheck {
    const start = Date.now();
    const metadataIndex = server.getMetadataIndex();

    if (!metadataIndex) {
      return {
        name: 'metadata_index',
        status: 'fail',
        responseTime: Date.now() - start,
        message: 'Metadata index is not loaded',
      };
    }

    return {
      name: 'metadata_index',
      status: 'pass',
      responseTime: Date.now() - start,
      message: 'Metadata index is loaded',
    };
  }

  private checkVectorStore(): HealthCheck {
    const start = Date.now();
    const vectorStore = server.getVectorStore();

    if (!vectorStore) {
      return {
        name: 'vector_store',
        status: 'fail',
        responseTime: Date.now() - start,
        message: 'Vector store is not initialized',
      };
    }

    return {
      name: 'vector_store',
      status: 'pass',
      responseTime: Date.now() - start,
      message: 'Vector store is initialized',
    };
  }
}

export const healthEndpoints = new HealthEndpoints();
