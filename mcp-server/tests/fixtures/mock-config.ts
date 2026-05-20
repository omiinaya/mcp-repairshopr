/**
 * Mock configuration for testing
 */

import { ServerConfig } from '../../src/server/configuration';

export const mockDefaultConfig: ServerConfig = {
  serverName: 'mcp-repairshopr',
  serverVersion: '0.1.0',
  port: 3000,
  logLevel: 'info',
  docsPath: './docs',
  dataPath: './data',
  enableHotReload: true,
  enableMetrics: false,
  maxConcurrentRequests: 100,
  requestTimeout: 30000,
};

export const mockCustomConfig: ServerConfig = {
  serverName: 'custom-server',
  serverVersion: '2.0.0',
  port: 4000,
  logLevel: 'debug',
  docsPath: './custom-docs',
  dataPath: './custom-data',
  enableHotReload: false,
  enableMetrics: true,
  maxConcurrentRequests: 200,
  requestTimeout: 60000,
};

export const mockMinimalConfig: Partial<ServerConfig> = {
  serverName: 'minimal-server',
  port: 5000,
};

export const mockInvalidConfigs: Partial<ServerConfig>[] = [
  {
    serverName: '',
    serverVersion: '1.0.0',
    port: 3000,
    logLevel: 'info',
    docsPath: './docs',
    dataPath: './data',
    enableHotReload: true,
    enableMetrics: false,
    maxConcurrentRequests: 100,
    requestTimeout: 30000,
  },
  {
    serverName: 'test-server',
    serverVersion: '1.0.0',
    port: 70000,
    logLevel: 'info',
    docsPath: './docs',
    dataPath: './data',
    enableHotReload: true,
    enableMetrics: false,
    maxConcurrentRequests: 100,
    requestTimeout: 30000,
  },
  {
    serverName: 'test-server',
    serverVersion: '1.0.0',
    port: 3000,
    logLevel: 'invalid',
    docsPath: './docs',
    dataPath: './data',
    enableHotReload: true,
    enableMetrics: false,
    maxConcurrentRequests: 100,
    requestTimeout: 30000,
  },
  {
    serverName: 'test-server',
    serverVersion: '1.0.0',
    port: 3000,
    logLevel: 'info',
    docsPath: './docs',
    dataPath: './data',
    enableHotReload: true,
    enableMetrics: false,
    maxConcurrentRequests: -1,
    requestTimeout: 30000,
  },
  {
    serverName: 'test-server',
    serverVersion: '1.0.0',
    port: 3000,
    logLevel: 'info',
    docsPath: './docs',
    dataPath: './data',
    enableHotReload: true,
    enableMetrics: false,
    maxConcurrentRequests: 100,
    requestTimeout: -1000,
  },
];

export const mockEnvVars = {
  SERVER_NAME: 'env-server',
  SERVER_VERSION: '2.0.0',
  PORT: '6000',
  LOG_LEVEL: 'warn',
  DOCS_PATH: './env-docs',
  DATA_PATH: './env-data',
  ENABLE_HOT_RELOAD: 'false',
  ENABLE_METRICS: 'true',
  MAX_CONCURRENT_REQUESTS: '150',
  REQUEST_TIMEOUT: '45000',
};

export const mockInvalidEnvVars = {
  PORT: 'invalid',
  ENABLE_HOT_RELOAD: 'not-a-boolean',
  ENABLE_METRICS: 'not-a-boolean',
  MAX_CONCURRENT_REQUESTS: 'not-a-number',
  REQUEST_TIMEOUT: 'not-a-number',
};
