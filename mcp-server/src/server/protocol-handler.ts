/**
 * MCP Protocol Handler
 * Handles MCP protocol message processing, tool registration, and request/response lifecycle
 */

import { Server } from '@modelcontextprotocol/sdk/server';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

// Define Zod schemas for MCP methods
const ListToolsRequestSchema = z.object({
  method: z.literal('tools/list'),
  params: z.object({}).optional()
});

const CallToolRequestSchema = z.object({
  method: z.literal('tools/call'),
  params: z.object({
    name: z.string(),
    arguments: z.any().optional()
  })
});

const InitializeRequestSchema = z.object({
  method: z.literal('initialize'),
  params: z.object({
    protocolVersion: z.string(),
    capabilities: z.object({}).optional(),
    clientInfo: z.object({
      name: z.string(),
      version: z.string()
    })
  })
});

const InitializedNotificationSchema = z.object({
  method: z.literal('notifications/initialized'),
  params: z.object({}).optional()
});

/**
 * MCP Tool definition interface
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  handler: (params: any) => Promise<any>;
}

/**
 * MCP Server capabilities
 */
export interface MCPCapabilities {
  tools: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
}

/**
 * MCP Request context
 */
export interface MCPRequestContext {
  requestId: string;
  method: string;
  params?: any;
  timestamp: number;
}

/**
 * MCP Response
 */
export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: {
    code: number;
    message: string;
    details?: any;
  };
}

/**
 * Protocol Handler class that wraps the MCP Server
 */
export class ProtocolHandler {
  private server: Server | null = null;
  private tools: Map<string, MCPTool> = new Map();
  private capabilities: MCPCapabilities;
  private requestCount: number = 0;
  private isInitialized: boolean = false;

  constructor() {
    this.capabilities = {
      tools: {
        listChanged: true
      }
    };
  }

  /**
   * Initialize the protocol handler with an MCP Server instance
   */
  async initialize(server: Server): Promise<void> {
    if (this.isInitialized) {
      logger.warn('ProtocolHandler already initialized');
      return;
    }

    try {
      this.server = server;
      await this.setupMessageHandlers();
      await this.setupCapabilityHandlers();
      this.isInitialized = true;
      logger.info('ProtocolHandler initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize ProtocolHandler', { error });
      throw error;
    }
  }

  /**
   * Set up message handlers for MCP protocol messages
   */
  private async setupMessageHandlers(): Promise<void> {
    if (!this.server) {
      throw new Error('Server not initialized');
    }

    // Set up tool list handler
    this.server.setRequestHandler(ListToolsRequestSchema, async (request) => {
      return this.handleToolsList(request);
    });

    // Set up tool call handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return this.handleToolCall(request);
    });

    logger.info('MCP message handlers configured');
  }

  /**
   * Set up capability handlers
   */
  private async setupCapabilityHandlers(): Promise<void> {
    if (!this.server) {
      throw new Error('Server not initialized');
    }

    // Set up initialize handler for capability negotiation
    this.server.setRequestHandler(InitializeRequestSchema, async (request) => {
      return this.handleInitialize(request);
    });

    // Set up initialized notification handler
    this.server.setNotificationHandler(InitializedNotificationSchema, async (notification) => {
      return this.handleInitialized(notification);
    });

    logger.info('MCP capability handlers configured');
  }

  /**
   * Handle initialize request for capability negotiation
   */
  private async handleInitialize(request: any): Promise<any> {
    const context = this.createRequestContext('initialize', request.params);

    try {
      logger.info('Handling initialize request', { context });

      // Validate client capabilities
      const clientCapabilities = request.params?.capabilities || {};
      this.validateClientCapabilities(clientCapabilities);

      // Return server capabilities
      return {
        protocolVersion: '2024-11-05',
        capabilities: this.capabilities,
        serverInfo: {
          name: config.serverName,
          version: config.serverVersion
        }
      };
    } catch (error) {
      logger.error('Initialize request failed', { context, error });
      // Re-throw the error to preserve the original message
      throw error;
    }
  }

  /**
   * Handle initialized notification
   */
  private async handleInitialized(request: any): Promise<any> {
    const context = this.createRequestContext('notifications/initialized', request.params);

    try {
      logger.info('Client initialized', { context });
      return { success: true };
    } catch (error) {
      logger.error('Initialized notification failed', { context, error });
      throw this.createErrorResponse(-32603, 'Initialized notification failed', error);
    }
  }

  /**
   * Handle tools/list request
   */
  private async handleToolsList(request: any): Promise<any> {
    const context = this.createRequestContext('tools/list', request.params);

    try {
      logger.debug('Handling tools/list request', { context });

      const tools = Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }));

      return {
        tools
      };
    } catch (error) {
      logger.error('Tools list request failed', { context, error });
      throw this.createErrorResponse(-32603, 'Failed to list tools', error);
    }
  }

  /**
   * Handle tools/call request
   */
  private async handleToolCall(request: any): Promise<any> {
    const context = this.createRequestContext('tools/call', request.params);
    this.requestCount++;

    try {
      const { name, arguments: args } = request.params;

      if (!name) {
        throw this.createErrorResponse(-32602, 'Tool name is required');
      }

      logger.info('Handling tool call', { context, toolName: name });

      // Validate tool exists
      const tool = this.tools.get(name);
      if (!tool) {
        throw this.createErrorResponse(-32601, `Tool not found: ${name}`);
      }

      // Validate arguments against schema
      this.validateToolArguments(tool, args);

      // Execute tool handler
      const result = await tool.handler(args);

      logger.info('Tool call completed', {
        context,
        toolName: name,
        requestCount: this.requestCount
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      logger.error('Tool call failed', { context, error });
      // Re-throw the error to preserve the original message
      throw error;
    }
  }

  /**
   * Register a new tool
   */
  registerTool(tool: MCPTool): void {
    if (!this.isInitialized) {
      throw new Error('ProtocolHandler not initialized');
    }

    if (!tool.name || !tool.description || !tool.inputSchema || !tool.handler) {
      throw new Error('Invalid tool definition');
    }

    if (this.tools.has(tool.name)) {
      logger.warn('Tool already registered, overwriting', { toolName: tool.name });
    }

    this.tools.set(tool.name, tool);
    logger.info('Tool registered', { toolName: tool.name });
  }

  /**
   * Unregister a tool
   */
  unregisterTool(toolName: string): boolean {
    const removed = this.tools.delete(toolName);
    if (removed) {
      logger.info('Tool unregistered', { toolName });
    }
    return removed;
  }

  /**
   * Get all registered tools
   */
  getTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get a specific tool by name
   */
  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool is registered
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get server capabilities
   */
  getCapabilities(): MCPCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Get request statistics
   */
  getRequestStats(): { count: number; toolCount: number } {
    return {
      count: this.requestCount,
      toolCount: this.tools.size
    };
  }

  /**
   * Create request context for logging
   */
  private createRequestContext(method: string, params?: any): MCPRequestContext {
    return {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      method,
      params,
      timestamp: Date.now()
    };
  }

  /**
   * Validate client capabilities
   */
  private validateClientCapabilities(capabilities: any): void {
    // Basic validation - can be extended based on requirements
    if (capabilities && typeof capabilities !== 'object') {
      throw new Error('Invalid client capabilities format');
    }
  }

  /**
   * Validate tool arguments against schema
   */
  private validateToolArguments(tool: MCPTool, args: any): void {
    if (!args) {
      // Check if there are required parameters
      const required = tool.inputSchema.required || [];
      if (required.length > 0) {
        throw this.createErrorResponse(-32602, `Missing required parameters: ${required.join(', ')}`);
      }
      return;
    }

    // Validate required parameters
    const required = tool.inputSchema.required || [];
    for (const param of required) {
      if (!(param in args)) {
        throw this.createErrorResponse(-32602, `Missing required parameter: ${param}`);
      }
    }

    // Validate parameter types
    const properties = tool.inputSchema.properties || {};
    for (const [key, value] of Object.entries(args)) {
      const schema = properties[key];
      if (schema) {
        this.validateParameterType(key, value, schema);
      }
    }
  }

  /**
   * Validate parameter type
   */
  private validateParameterType(name: string, value: any, schema: any): void {
    const type = schema.type;

    if (type === 'string' && typeof value !== 'string') {
      throw this.createErrorResponse(-32602, `Parameter '${name}' must be a string`);
    }

    if (type === 'number' && typeof value !== 'number') {
      throw this.createErrorResponse(-32602, `Parameter '${name}' must be a number`);
    }

    if (type === 'integer' && (!Number.isInteger(value) || typeof value !== 'number')) {
      throw this.createErrorResponse(-32602, `Parameter '${name}' must be an integer`);
    }

    if (type === 'boolean' && typeof value !== 'boolean') {
      throw this.createErrorResponse(-32602, `Parameter '${name}' must be a boolean`);
    }

    if (type === 'array' && !Array.isArray(value)) {
      throw this.createErrorResponse(-32602, `Parameter '${name}' must be an array`);
    }

    if (type === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
      throw this.createErrorResponse(-32602, `Parameter '${name}' must be an object`);
    }
  }

  /**
   * Create an error response
   */
  private createErrorResponse(code: number, message: string, details?: any): Error {
    const error = new Error(message) as any;
    error.code = code;
    error.details = details;
    return error;
  }

  /**
   * Handle streaming response (if needed)
   */
  async handleStreamingResponse(
    handler: () => AsyncIterable<any>
  ): Promise<AsyncIterable<any>> {
    if (!this.isInitialized) {
      throw new Error('ProtocolHandler not initialized');
    }

    return handler();
  }

  /**
   * Reset the protocol handler state
   */
  reset(): void {
    this.tools.clear();
    this.requestCount = 0;
    logger.info('ProtocolHandler reset');
  }

  /**
   * Check if the handler is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.server !== null;
  }
}
