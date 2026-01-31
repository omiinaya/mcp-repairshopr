/**
 * MCP Server entry point
 */

import { server } from './server';
import { logger } from './utils/logger';

const handleShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    await server.stop();
    logger.info('Server shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
};

const startServer = async (): Promise<void> => {
  try {
    logger.info('Starting MCP server...');
    await server.start();
    
    const health = server.healthCheck();
    logger.info('Server health check', health);
    
    logger.info('Server is ready to accept connections');
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});

// Start the server
startServer();
