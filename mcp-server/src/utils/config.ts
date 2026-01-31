/**
 * Configuration management for the MCP server
 */

import { logger } from './logger';

export interface Config {
  serverName: string;
  serverVersion: string;
  port: number;
  logLevel: string;
}

const validateConfig = (config: Config): boolean => {
  if (!config.serverName || typeof config.serverName !== 'string') {
    logger.error('Invalid serverName in configuration');
    return false;
  }
  
  if (!config.serverVersion || typeof config.serverVersion !== 'string') {
    logger.error('Invalid serverVersion in configuration');
    return false;
  }
  
  if (typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
    logger.error('Invalid port in configuration');
    return false;
  }
  
  if (!config.logLevel || typeof config.logLevel !== 'string') {
    logger.error('Invalid logLevel in configuration');
    return false;
  }
  
  return true;
};

const loadConfig = (): Config => {
  const config: Config = {
    serverName: process.env.SERVER_NAME || 'mcp-repairshopr',
    serverVersion: process.env.SERVER_VERSION || '0.1.0',
    port: parseInt(process.env.PORT || '3000', 10),
    logLevel: process.env.LOG_LEVEL || 'info'
  };

  if (!validateConfig(config)) {
    throw new Error('Invalid configuration');
  }

  logger.info('Configuration loaded', {
    serverName: config.serverName,
    serverVersion: config.serverVersion,
    port: config.port,
    logLevel: config.logLevel
  });

  return config;
};

export const config = loadConfig();
