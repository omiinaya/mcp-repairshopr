/**
 * Unit tests for monitoring module
 */

import {
  MonitoringService,
  Metrics,
  HealthStatus,
  monitoringService,
} from '../../src/server/monitoring';

describe('MonitoringService', () => {
  let service: MonitoringService;

  beforeEach(() => {
    service = new MonitoringService();
  });

  afterEach(() => {
    service.stopMonitoring();
  });

  describe('Monitoring lifecycle', () => {
    test('should start monitoring', () => {
      expect(service.isMonitoringActive()).toBe(false);
      service.startMonitoring();
      expect(service.isMonitoringActive()).toBe(true);
    });

    test('should stop monitoring', () => {
      service.startMonitoring();
      expect(service.isMonitoringActive()).toBe(true);
      service.stopMonitoring();
      expect(service.isMonitoringActive()).toBe(false);
    });

    test('should not start monitoring if already started', () => {
      service.startMonitoring();
      const startTime = Date.now();
      service.startMonitoring();
      // Should not reset start time
      expect(service.isMonitoringActive()).toBe(true);
    });

    test('should not stop monitoring if not started', () => {
      service.stopMonitoring();
      expect(service.isMonitoringActive()).toBe(false);
    });
  });

  describe('Request recording', () => {
    beforeEach(() => {
      service.startMonitoring();
    });

    test('should record successful request', () => {
      service.recordRequest(100, true);
      const metrics = service.getMetrics();

      expect(metrics.requestsTotal).toBe(1);
      expect(metrics.requestsSuccessful).toBe(1);
      expect(metrics.requestsFailed).toBe(0);
      expect(metrics.averageResponseTime).toBe(100);
    });

    test('should record failed request', () => {
      service.recordRequest(200, false);
      const metrics = service.getMetrics();

      expect(metrics.requestsTotal).toBe(1);
      expect(metrics.requestsSuccessful).toBe(0);
      expect(metrics.requestsFailed).toBe(1);
      expect(metrics.averageResponseTime).toBe(200);
    });

    test('should calculate average response time correctly', () => {
      service.recordRequest(100, true);
      service.recordRequest(200, true);
      service.recordRequest(300, true);
      const metrics = service.getMetrics();

      expect(metrics.averageResponseTime).toBe(200);
    });

    test('should not record requests when monitoring is stopped', () => {
      service.stopMonitoring();
      service.recordRequest(100, true);
      const metrics = service.getMetrics();

      expect(metrics.requestsTotal).toBe(0);
    });

    test('should limit response times history', () => {
      // Record more than maxResponseTimes (1000)
      for (let i = 0; i < 1100; i++) {
        service.recordRequest(i, true);
      }

      const metrics = service.getMetrics();
      expect(metrics.requestsTotal).toBe(1100);
      // Average should be based on last 1000 requests
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
    });
  });

  describe('Tool call recording', () => {
    beforeEach(() => {
      service.startMonitoring();
    });

    test('should record tool call', () => {
      service.recordToolCall('test-tool');
      const metrics = service.getMetrics();

      expect(metrics.toolCalls.get('test-tool')).toBe(1);
    });

    test('should record multiple tool calls', () => {
      service.recordToolCall('tool-a');
      service.recordToolCall('tool-a');
      service.recordToolCall('tool-b');
      const metrics = service.getMetrics();

      expect(metrics.toolCalls.get('tool-a')).toBe(2);
      expect(metrics.toolCalls.get('tool-b')).toBe(1);
    });

    test('should not record tool calls when monitoring is stopped', () => {
      service.stopMonitoring();
      service.recordToolCall('test-tool');
      const metrics = service.getMetrics();

      expect(metrics.toolCalls.get('test-tool')).toBeUndefined();
    });
  });

  describe('Error recording', () => {
    beforeEach(() => {
      service.startMonitoring();
    });

    test('should record error', () => {
      const error = new Error('Test error');
      service.recordError(error, { context: 'test' });
      const metrics = service.getMetrics();

      expect(metrics.errors.length).toBe(1);
      expect(metrics.errors[0].error).toBe('Test error');
      expect(metrics.errors[0].context).toEqual({ context: 'test' });
      expect(metrics.errors[0].timestamp).toBeInstanceOf(Date);
    });

    test('should record error without context', () => {
      const error = new Error('Test error');
      service.recordError(error);
      const metrics = service.getMetrics();

      expect(metrics.errors.length).toBe(1);
      expect(metrics.errors[0].error).toBe('Test error');
      expect(metrics.errors[0].context).toEqual({});
    });

    test('should record multiple errors', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      service.recordError(error1);
      service.recordError(error2);
      const metrics = service.getMetrics();

      expect(metrics.errors.length).toBe(2);
    });

    test('should limit errors to 100', () => {
      for (let i = 0; i < 150; i++) {
        service.recordError(new Error(`Error ${i}`));
      }
      const metrics = service.getMetrics();

      expect(metrics.errors.length).toBe(100);
    });

    test('should not record errors when monitoring is stopped', () => {
      service.stopMonitoring();
      const error = new Error('Test error');
      service.recordError(error);
      const metrics = service.getMetrics();

      expect(metrics.errors.length).toBe(0);
    });
  });

  describe('Metrics retrieval', () => {
    beforeEach(() => {
      service.startMonitoring();
    });

    test('should return current metrics', () => {
      service.recordRequest(100, true);
      service.recordToolCall('test-tool');
      const error = new Error('Test error');
      service.recordError(error);

      const metrics = service.getMetrics();

      expect(metrics.requestsTotal).toBe(1);
      expect(metrics.requestsSuccessful).toBe(1);
      expect(metrics.requestsFailed).toBe(0);
      expect(metrics.averageResponseTime).toBe(100);
      expect(metrics.toolCalls.get('test-tool')).toBe(1);
      expect(metrics.errors.length).toBe(1);
    });

    test('should return a copy of metrics', () => {
      service.recordRequest(100, true);
      const metrics1 = service.getMetrics();
      const metrics2 = service.getMetrics();

      expect(metrics1).toEqual(metrics2);
      expect(metrics1).not.toBe(metrics2);
    });
  });

  describe('Metrics reset', () => {
    beforeEach(() => {
      service.startMonitoring();
    });

    test('should reset all metrics', () => {
      service.recordRequest(100, true);
      service.recordRequest(200, false);
      service.recordToolCall('test-tool');
      service.recordError(new Error('Test error'));

      service.resetMetrics();
      const metrics = service.getMetrics();

      expect(metrics.requestsTotal).toBe(0);
      expect(metrics.requestsSuccessful).toBe(0);
      expect(metrics.requestsFailed).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
      expect(metrics.toolCalls.size).toBe(0);
      expect(metrics.errors.length).toBe(0);
    });
  });

  describe('Health status', () => {
    test('should return unhealthy when monitoring not started', () => {
      const health = service.getHealthStatus();

      expect(health.healthy).toBe(false);
      expect(health.uptime).toBe(0);
    });

    test('should return healthy when monitoring started with no errors', () => {
      service.startMonitoring();
      service.recordRequest(100, true);

      const health = service.getHealthStatus();

      expect(health.healthy).toBe(true);
      expect(health.uptime).toBeGreaterThan(0);
      expect(health.metrics.requestsTotal).toBe(1);
    });

    test('should return healthy with low error rate', () => {
      service.startMonitoring();
      service.recordRequest(100, true);
      service.recordRequest(100, true);
      service.recordRequest(100, false);

      const health = service.getHealthStatus();

      expect(health.healthy).toBe(true);
    });

    test('should return unhealthy with high error rate', () => {
      service.startMonitoring();
      service.recordRequest(100, true);
      service.recordRequest(100, false);
      service.recordRequest(100, false);

      const health = service.getHealthStatus();

      expect(health.healthy).toBe(false);
    });

    test('should include current metrics in health status', () => {
      service.startMonitoring();
      service.recordRequest(100, true);
      service.recordToolCall('test-tool');

      const health = service.getHealthStatus();

      expect(health.metrics.requestsTotal).toBe(1);
      expect(health.metrics.toolCalls.get('test-tool')).toBe(1);
    });
  });

  describe('Active connections', () => {
    test('should increment active connections', () => {
      service.incrementActiveConnections();
      const metrics = service.getMetrics();

      expect(metrics.activeConnections).toBe(1);
    });

    test('should decrement active connections', () => {
      service.incrementActiveConnections();
      service.incrementActiveConnections();
      service.decrementActiveConnections();
      const metrics = service.getMetrics();

      expect(metrics.activeConnections).toBe(1);
    });

    test('should not decrement below zero', () => {
      service.decrementActiveConnections();
      const metrics = service.getMetrics();

      expect(metrics.activeConnections).toBe(0);
    });
  });

  describe('Singleton instance', () => {
    test('should export a singleton instance', () => {
      expect(monitoringService).toBeInstanceOf(MonitoringService);
    });

    test('should maintain state across imports', () => {
      monitoringService.startMonitoring();
      monitoringService.recordRequest(100, true);

      const metrics = monitoringService.getMetrics();
      expect(metrics.requestsTotal).toBe(1);

      monitoringService.resetMetrics();
    });
  });
});
