/**
 * MCP Server entry point
 */

import { server } from './server';
import { logger } from './utils/logger';
import { startupValidator } from './utils/startup-validator';
import { secretsManager } from './config/secrets';
import { httpServer } from './server/http-server';

const handleShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  try {
    await httpServer.stop();
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

    // Run startup validation
    logger.info('Running startup validation...');
    const validationResult = startupValidator.validate();
    
    if (!validationResult.valid) {
      logger.error('Startup validation failed with errors:', {
        errors: validationResult.errors
      });
      process.exit(1);
    }

    if (validationResult.warnings.length > 0) {
      logger.warn('Startup validation completed with warnings:', {
        warnings: validationResult.warnings
      });
    } else {
      logger.info('Startup validation passed');
    }

    // Initialize secrets manager
    logger.info('Initializing secrets manager...');
    secretsManager.initialize();
    
    if (secretsManager.isRepairShoprConfigured()) {
      logger.info('RepairShopr API configured', {
        subdomain: secretsManager.getRepairShoprConfig()?.subdomain,
        apiKey: secretsManager.getMaskedApiKey()
      });
      
      const credentialValidation = secretsManager.validateCredentials();
      if (!credentialValidation.valid) {
        logger.warn('RepairShopr credentials validation warnings:', {
          errors: credentialValidation.errors
        });
      }
    } else {
      logger.info('RepairShopr API not configured. Running in documentation-only mode.');
    }

    // Start the server
    await server.start();

    // Start HTTP server for health checks
    await httpServer.start();
    logger.info('HTTP server for health checks started', {
      address: httpServer.getAddress()
    });

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
