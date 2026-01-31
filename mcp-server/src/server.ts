/**
 * Main MCP server implementation
 */

import { Server } from '@modelcontextprotocol/sdk/server';
import { logger } from './utils/logger';
import { configurationManager, ServerConfig } from './server/configuration';
import { ProtocolHandler, MCPTool } from './server/protocol-handler';
import { ToolRegistry, ToolDefinition } from './server/tool-registry';
import { monitoringService } from './server/monitoring';
import { structuredLogger } from './server/structured-logger';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  metrics?: any;
}

class MCPServer {
  private server: Server | null = null;
  private protocolHandler: ProtocolHandler | null = null;
  private toolRegistry: ToolRegistry | null = null;
  private startTime: number = 0;
  private isRunning: boolean = false;
  private config: ServerConfig;

  constructor() {
    // Load configuration on initialization
    this.config = configurationManager.loadConfig();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Server is already running');
      return;
    }

    try {
      this.startTime = Date.now();
      this.server = new Server({
        name: this.config.serverName,
        version: this.config.serverVersion
      });

      // Start monitoring service
      monitoringService.startMonitoring();
      logger.info('Monitoring service started');

      // Initialize protocol handler
      this.protocolHandler = new ProtocolHandler();
      await this.protocolHandler.initialize(this.server);

      // Initialize tool registry
      this.toolRegistry = new ToolRegistry();
      logger.info('Tool registry initialized');

      // Enable hot-reload if configured
      if (this.config.enableHotReload) {
        this.enableHotReload();
      }

      this.isRunning = true;
      logger.info('MCP server started', {
        name: this.config.serverName,
        version: this.config.serverVersion,
        port: this.config.port,
        logLevel: this.config.logLevel,
        enableHotReload: this.config.enableHotReload,
        enableMetrics: this.config.enableMetrics
      });
    } catch (error) {
      logger.error('Failed to start MCP server', { error });
      structuredLogger.logError(error as Error, { phase: 'startup' });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Server is not running');
      return;
    }

    try {
      // Stop monitoring service
      monitoringService.stopMonitoring();
      logger.info('Monitoring service stopped');

      // Reset protocol handler
      if (this.protocolHandler) {
        this.protocolHandler.reset();
        this.protocolHandler = null;
      }

      // Clear tool registry
      if (this.toolRegistry) {
        this.toolRegistry.clear();
        this.toolRegistry = null;
      }

      // Clean up configuration manager
      configurationManager.destroy();

      this.isRunning = false;
      this.server = null;
      logger.info('MCP server stopped');
    } catch (error) {
      logger.error('Failed to stop MCP server', { error });
      structuredLogger.logError(error as Error, { phase: 'shutdown' });
      throw error;
    }
  }

  healthCheck(): HealthCheckResult {
    const uptime = this.startTime > 0 ? Date.now() - this.startTime : 0;
    const healthStatus = monitoringService.getHealthStatus();
    
    const result: HealthCheckResult = {
      status: this.isRunning && healthStatus.healthy ? 'healthy' : 'unhealthy',
      uptime,
      metrics: healthStatus.metrics
    };

    // Log health check
    structuredLogger.logHealthCheck(result.status, uptime, healthStatus.metrics);

    return result;
  }

  getServer(): Server | null {
    return this.server;
  }

  getProtocolHandler(): ProtocolHandler | null {
    return this.protocolHandler;
  }

  getToolRegistry(): ToolRegistry | null {
    return this.toolRegistry;
  }

  isServerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Register a tool with the protocol handler
   */
  registerTool(tool: MCPTool): void {
    if (!this.protocolHandler) {
      throw new Error('Protocol handler not initialized. Server must be started first.');
    }
    this.protocolHandler.registerTool(tool);
    monitoringService.recordToolCall(tool.name);
  }

  /**
   * Register a tool with the tool registry
   * @param definition - Tool definition
   * @param handler - Tool handler function
   */
  registerToolWithRegistry(definition: ToolDefinition, handler: Function): void {
    if (!this.toolRegistry) {
      throw new Error('Tool registry not initialized. Server must be started first.');
    }
    this.toolRegistry.registerTool(definition, handler);
    monitoringService.recordToolCall(definition.name);
  }

  /**
   * Unregister a tool from the protocol handler
   */
  unregisterTool(toolName: string): boolean {
    if (!this.protocolHandler) {
      throw new Error('Protocol handler not initialized. Server must be started first.');
    }
    return this.protocolHandler.unregisterTool(toolName);
  }

  /**
   * Unregister a tool from the tool registry
   * @param toolName - Name of the tool to unregister
   */
  unregisterToolFromRegistry(toolName: string): boolean {
    if (!this.toolRegistry) {
      throw new Error('Tool registry not initialized. Server must be started first.');
    }
    return this.toolRegistry.unregisterTool(toolName);
  }

  /**
   * Get all registered tools
   */
  getTools(): MCPTool[] {
    if (!this.protocolHandler) {
      return [];
    }
    return this.protocolHandler.getTools();
  }

  /**
   * Get tool definition from tool registry
   * @param name - Tool name
   */
  getToolDefinition(name: string): ToolDefinition | undefined {
    if (!this.toolRegistry) {
      return undefined;
    }
    return this.toolRegistry.getTool(name);
  }

  /**
   * Get all tool definitions from tool registry
   */
  getAllToolDefinitions(): ToolDefinition[] {
    if (!this.toolRegistry) {
      return [];
    }
    return this.toolRegistry.getAllTools();
  }

  /**
   * Get tool handler from tool registry
   * @param name - Tool name
   */
  getToolHandler(name: string): Function | undefined {
    if (!this.toolRegistry) {
      return undefined;
    }
    return this.toolRegistry.getToolHandler(name);
  }

  /**
   * Discover tools with optional filters
   * @param filter - Optional filter criteria
   */
  discoverTools(filter?: { deprecated?: boolean; version?: string }): ToolDefinition[] {
    if (!this.toolRegistry) {
      return [];
    }
    return this.toolRegistry.discoverTools(filter);
  }

  /**
   * Check if tool dependencies are satisfied
   * @param toolName - Name of the tool to check
   */
  checkToolDependencies(toolName: string): { satisfied: boolean; missing: string[] } {
    if (!this.toolRegistry) {
      return { satisfied: false, missing: [] };
    }
    return this.toolRegistry.checkDependencies(toolName);
  }

  /**
   * Check if a tool is deprecated
   * @param name - Tool name
   */
  isToolDeprecated(name: string): boolean {
    if (!this.toolRegistry) {
      return false;
    }
    return this.toolRegistry.isDeprecated(name);
  }

  /**
   * Get tool version
   * @param name - Tool name
   */
  getToolVersion(name: string): string | undefined {
    if (!this.toolRegistry) {
      return undefined;
    }
    return this.toolRegistry.getToolVersion(name);
  }

  /**
   * Get tool registry statistics
   */
  getToolRegistryStats(): {
    totalTools: number;
    activeTools: number;
    deprecatedTools: number;
    toolsWithDependencies: number;
  } {
    if (!this.toolRegistry) {
      return {
        totalTools: 0,
        activeTools: 0,
        deprecatedTools: 0,
        toolsWithDependencies: 0
      };
    }
    return this.toolRegistry.getStats();
  }

  /**
   * Get request statistics from protocol handler
   */
  getRequestStats(): { count: number; toolCount: number } {
    if (!this.protocolHandler) {
      return { count: 0, toolCount: 0 };
    }
    return this.protocolHandler.getRequestStats();
  }

  /**
   * Get current server configuration
   */
  getConfig(): ServerConfig {
    return { ...this.config };
  }

  /**
   * Enable hot-reload for configuration changes
   */
  private enableHotReload(): void {
    const configPath = process.env.CONFIG_PATH || './config/default.json';

    configurationManager.watchConfig(configPath, (newConfig: ServerConfig) => {
      const oldConfig = this.config;
      logger.info('Configuration changed via hot-reload', {
        oldConfig,
        newConfig
      });

      // Log configuration change
      structuredLogger.logConfigChange(oldConfig, newConfig);

      // Update server configuration
      this.config = newConfig;

      // Apply configuration changes
      this.applyConfiguration();
    });
  }

  /**
   * Apply configuration changes to running server
   */
  private applyConfiguration(): void {
    // Update logger level
    logger.setLevel(this.config.logLevel);

    // Note: Server name and version cannot be changed while running
    // These would require a server restart

    logger.info('Configuration applied', {
      logLevel: this.config.logLevel,
      enableMetrics: this.config.enableMetrics,
      maxConcurrentRequests: this.config.maxConcurrentRequests,
      requestTimeout: this.config.requestTimeout
    });
  }
}

export const server = new MCPServer();
