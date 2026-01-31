/**
 * Main MCP server implementation
 */

import { Server } from '@modelcontextprotocol/sdk/server';
import { logger } from './utils/logger';
import { config } from './utils/config';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  uptime: number;
}

class MCPServer {
  private server: Server | null = null;
  private startTime: number = 0;
  private isRunning: boolean = false;

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Server is already running');
      return;
    }

    try {
      this.startTime = Date.now();
      this.server = new Server({
        name: config.serverName,
        version: config.serverVersion
      });

      this.isRunning = true;
      logger.info('MCP server started', {
        name: config.serverName,
        version: config.serverVersion
      });
    } catch (error) {
      logger.error('Failed to start MCP server', { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Server is not running');
      return;
    }

    try {
      this.isRunning = false;
      this.server = null;
      logger.info('MCP server stopped');
    } catch (error) {
      logger.error('Failed to stop MCP server', { error });
      throw error;
    }
  }

  healthCheck(): HealthCheckResult {
    const uptime = this.startTime > 0 ? Date.now() - this.startTime : 0;
    
    return {
      status: this.isRunning ? 'healthy' : 'unhealthy',
      uptime
    };
  }

  getServer(): Server | null {
    return this.server;
  }

  isServerRunning(): boolean {
    return this.isRunning;
  }
}

export const server = new MCPServer();
