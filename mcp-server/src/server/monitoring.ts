/**
 * Monitoring module for MCP server
 * Tracks metrics, performance, and health status
 */

export interface Metrics {
  requestsTotal: number;
  requestsSuccessful: number;
  requestsFailed: number;
  averageResponseTime: number;
  activeConnections: number;
  toolCalls: Map<string, number>;
  errors: Array<{ timestamp: Date; error: string; context: any }>;
}

export interface HealthStatus {
  healthy: boolean;
  uptime: number;
  metrics: Metrics;
}

export class MonitoringService {
  private metrics: Metrics;
  private startTime: number;
  private isMonitoring: boolean;
  private responseTimes: number[];
  private maxResponseTimes: number = 1000;

  constructor() {
    this.metrics = {
      requestsTotal: 0,
      requestsSuccessful: 0,
      requestsFailed: 0,
      averageResponseTime: 0,
      activeConnections: 0,
      toolCalls: new Map<string, number>(),
      errors: [],
    };
    this.startTime = 0;
    this.isMonitoring = false;
    this.responseTimes = [];
  }

  /**
   * Start monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }
    this.startTime = Date.now();
    this.isMonitoring = true;
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }
    this.isMonitoring = false;
  }

  /**
   * Record a request with duration and success status
   */
  recordRequest(duration: number, success: boolean): void {
    if (!this.isMonitoring) {
      return;
    }

    this.metrics.requestsTotal++;

    if (success) {
      this.metrics.requestsSuccessful++;
    } else {
      this.metrics.requestsFailed++;
    }

    // Track response time for average calculation
    this.responseTimes.push(duration);
    if (this.responseTimes.length > this.maxResponseTimes) {
      this.responseTimes.shift();
    }

    // Calculate average response time
    const sum = this.responseTimes.reduce((acc, time) => acc + time, 0);
    this.metrics.averageResponseTime = sum / this.responseTimes.length;
  }

  /**
   * Record a tool call
   */
  recordToolCall(toolName: string): void {
    if (!this.isMonitoring) {
      return;
    }

    const currentCount = this.metrics.toolCalls.get(toolName) || 0;
    this.metrics.toolCalls.set(toolName, currentCount + 1);
  }

  /**
   * Record an error with context
   */
  recordError(error: Error, context?: any): void {
    if (!this.isMonitoring) {
      return;
    }

    const errorRecord = {
      timestamp: new Date(),
      error: error.message,
      context: context || {},
    };

    this.metrics.errors.push(errorRecord);

    // Keep only last 100 errors to prevent memory issues
    if (this.metrics.errors.length > 100) {
      this.metrics.errors.shift();
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): Metrics {
    return {
      requestsTotal: this.metrics.requestsTotal,
      requestsSuccessful: this.metrics.requestsSuccessful,
      requestsFailed: this.metrics.requestsFailed,
      averageResponseTime: this.metrics.averageResponseTime,
      activeConnections: this.metrics.activeConnections,
      toolCalls: new Map(this.metrics.toolCalls),
      errors: [...this.metrics.errors],
    };
  }

  /**
   * Reset all metrics
   */
  resetMetrics(): void {
    this.metrics = {
      requestsTotal: 0,
      requestsSuccessful: 0,
      requestsFailed: 0,
      averageResponseTime: 0,
      activeConnections: 0,
      toolCalls: new Map<string, number>(),
      errors: [],
    };
    this.responseTimes = [];
  }

  /**
   * Get health status
   */
  getHealthStatus(): HealthStatus {
    const uptime = this.isMonitoring ? Date.now() - this.startTime : 0;
    const errorRate =
      this.metrics.requestsTotal > 0
        ? this.metrics.requestsFailed / this.metrics.requestsTotal
        : 0;

    // Consider unhealthy if error rate exceeds 50%
    const healthy = this.isMonitoring && errorRate < 0.5;

    return {
      healthy,
      uptime,
      metrics: this.getMetrics(),
    };
  }

  /**
   * Increment active connections
   */
  incrementActiveConnections(): void {
    this.metrics.activeConnections++;
  }

  /**
   * Decrement active connections
   */
  decrementActiveConnections(): void {
    if (this.metrics.activeConnections > 0) {
      this.metrics.activeConnections--;
    }
  }

  /**
   * Check if monitoring is active
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}

export const monitoringService = new MonitoringService();
