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
import { searchApiDocs, SearchParams } from './tools/search';
import { getEndpoint, getEndpointsBatch, findRelatedEndpoints, getEndpointDetails, EndpointLookupParams, BatchEndpointLookupParams } from './tools/endpoint';
import { getParameters, ParameterLookupParams } from './tools/parameters';
import { getResponses, ResponseLookupParams } from './tools/responses';
import { getPermissions, PermissionLookupParams } from './tools/permissions';
import { listResources, ResourceListParams } from './tools/resources';
import { generateCodeExample, CodeExampleParams } from './tools/code-examples';
import { VectorStore } from './indexer/vector';
import { MetadataIndex } from './parser/metadata';
import { QueryUnderstanding } from './retrieval/query';
import { RelevanceScorer, SearchResult } from './retrieval/scoring';
import { ContextManager, formatSearchResults, formatEndpoint, formatParameters, formatResponses } from './retrieval/formatter';
import { Cache } from './cache/cache';

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
  private vectorStore: VectorStore | null = null;
  private metadataIndex: MetadataIndex | null = null;
  private queryUnderstanding: QueryUnderstanding | null = null;
  private relevanceScorer: RelevanceScorer | null = null;
  private contextManager: ContextManager | null = null;
  private cache: Cache<any>;

  constructor() {
    // Load configuration on initialization
    this.config = configurationManager.loadConfig();
    // Initialize cache with default configuration
    this.cache = new Cache({
      maxSize: 10 * 1024 * 1024, // 10MB
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxEntries: 1000,
      enableWarming: true
    });
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

      // Initialize vector store and metadata index
      this.vectorStore = new VectorStore();
      logger.info('Vector store initialized');

      // Initialize query understanding
      this.queryUnderstanding = new QueryUnderstanding();
      logger.info('Query understanding initialized');

      // Initialize relevance scorer
      this.relevanceScorer = new RelevanceScorer(this.vectorStore);
      logger.info('Relevance scorer initialized');

      // Initialize context manager
      this.contextManager = new ContextManager();
      logger.info('Context manager initialized');

      // Warm cache with common queries
      this.warmCache();
      logger.info('Cache warmed');

      // Register the search tool
      this.registerSearchTool();
      logger.info('Search tool registered');

      // Register the endpoint tool
      this.registerEndpointTool();
      logger.info('Endpoint tool registered');

      // Register the parameters tool
      this.registerParametersTool();
      logger.info('Parameters tool registered');

      // Register the responses tool
      this.registerResponsesTool();
      logger.info('Responses tool registered');

      // Register the permissions tool
      this.registerPermissionsTool();
      logger.info('Permissions tool registered');

      // Register the resources tool
      this.registerResourcesTool();
      logger.info('Resources tool registered');

      // Register the code examples tool
      this.registerCodeExamplesTool();
      logger.info('Code examples tool registered');

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

      // Clear vector store and metadata index
      this.vectorStore = null;
      this.metadataIndex = null;
      this.queryUnderstanding = null;
      this.relevanceScorer = null;
      this.contextManager = null;

      // Clear cache
      this.cache.clear();

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

  /**
   * Set the metadata index for search functionality
   * @param index - Metadata index to use for search
   */
  setMetadataIndex(index: MetadataIndex): void {
    this.metadataIndex = index;
    if (this.queryUnderstanding) {
      this.queryUnderstanding.setMetadataIndex(index);
    }
    logger.info('Metadata index set for search functionality');
  }

  /**
   * Get the vector store
   * @returns Vector store instance or null
   */
  getVectorStore(): VectorStore | null {
    return this.vectorStore;
  }

  /**
   * Get the metadata index
   * @returns Metadata index or null
   */
  getMetadataIndex(): MetadataIndex | null {
    return this.metadataIndex;
  }

  /**
   * Get the query understanding instance
   * @returns Query understanding instance or null
   */
  getQueryUnderstanding(): QueryUnderstanding | null {
    return this.queryUnderstanding;
  }

  /**
   * Get the relevance scorer instance
   * @returns Relevance scorer instance or null
   */
  getRelevanceScorer(): RelevanceScorer | null {
    return this.relevanceScorer;
  }

  /**
   * Get the context manager instance
   * @returns Context manager instance or null
   */
  getContextManager(): ContextManager | null {
    return this.contextManager;
  }

  /**
   * Get the cache instance
   * @returns Cache instance
   */
  getCache(): Cache<any> {
    return this.cache;
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Warm cache with common queries on server start
   */
  private warmCache(): void {
    if (!this.metadataIndex) {
      return;
    }

    // Get common search patterns to warm the cache
    const commonQueries = [
      'customer',
      'invoice',
      'ticket',
      'estimate',
      'product',
      'appointment'
    ];

    // Pre-warm cache with common queries
    for (const query of commonQueries) {
      const cacheKey = `search:${query}`;
      // Cache will be populated on first actual search
      // This is a placeholder for future cache warming strategies
    }

    logger.info('Cache warming completed', {
      queriesPrepared: commonQueries.length
    });
  }

  /**
   * Register the search tool with the tool registry
   */
  private registerSearchTool(): void {
    if (!this.toolRegistry) {
      throw new Error('Tool registry not initialized');
    }

    const searchToolDefinition: ToolDefinition = {
      name: 'search_api_docs',
      description: 'Search RepairShopr API documentation using semantic and keyword search',
      version: '1.0.0',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          },
          resource: {
            type: 'string',
            description: 'Filter by resource name (optional)'
          },
          method: {
            type: 'string',
            description: 'Filter by HTTP method (optional)'
          },
          permission: {
            type: 'string',
            description: 'Filter by permission (optional)'
          },
          limit: {
            type: 'number',
            description: 'Maximum results to return (default: 5)'
          }
        },
        required: ['query']
      }
    };

    const searchToolHandler = async (args: any) => {
      if (!this.vectorStore || !this.metadataIndex) {
        throw new Error('Vector store or metadata index not initialized');
      }

      // Use query understanding to analyze and improve the search
      let searchQuery = args.query;
      let queryAnalysis = null;
      
      if (this.queryUnderstanding) {
        queryAnalysis = this.queryUnderstanding.analyzeQuery(args.query);
        
        // Use expanded queries for better results
        const expandedQueries = this.queryUnderstanding.expandQuery(
          args.query,
          queryAnalysis.entities
        );
        
        // Use the first expanded query if available, otherwise use original
        searchQuery = expandedQueries[0] || args.query;
        
        // Override filters with extracted entities if not explicitly provided
        const resourceFilter = args.resource || queryAnalysis.entities.resources[0];
        const methodFilter = args.method || queryAnalysis.entities.httpMethods[0];
        const permissionFilter = args.permission || queryAnalysis.entities.permissions[0];
        
        const params: SearchParams = {
          query: searchQuery,
          resource: resourceFilter,
          method: methodFilter,
          permission: permissionFilter,
          limit: args.limit || 5
        };

        const results = searchApiDocs(params, this.vectorStore, this.metadataIndex);

        // Apply relevance scoring to rank results
        let scoredResults: SearchResult[] = results.map(result => ({
          endpoint: result.endpoint,
          score: result.score,
          matchType: result.matchType,
          context: result.context
        }));

        // Use relevance scorer to calculate detailed scores and rank results
        if (this.relevanceScorer) {
          scoredResults = scoredResults.map(result => {
            const relevanceScore = this.relevanceScorer!.calculateScore(
              searchQuery,
              result.endpoint,
              queryAnalysis || undefined
            );
            return {
              ...result,
              score: relevanceScore.overallScore,
              relevanceScore
            };
          });

          // Rank results by relevance score
          scoredResults = this.relevanceScorer.rankResults(scoredResults, searchQuery);

          // Record usage for popularity tracking
          for (const result of scoredResults) {
            this.relevanceScorer!.recordEndpointUsage(result.endpoint);
          }

          // Apply context optimization to manage response size
          if (this.contextManager) {
            const maxTokens = this.contextManager.getConfig().defaultMaxTokens;
            const optimizedContext = this.contextManager.optimizeContextWindow(scoredResults, maxTokens);
            
            logger.info('Context optimized', {
              resultCount: optimizedContext.resultCount,
              excludedCount: optimizedContext.excludedCount,
              tokenCount: optimizedContext.tokenCount,
              truncated: optimizedContext.truncated
            });
          }
        }

        // Format search results using the formatter module
        const formattedResults = formatSearchResults(scoredResults, 'markdown');

        return {
          results: scoredResults.map(result => ({
            endpoint: {
              resource: result.endpoint.resource,
              operation: result.endpoint.operation,
              description: result.endpoint.description,
              method: result.endpoint.method,
              path: result.endpoint.path,
              permission: result.endpoint.permission
            },
            score: result.score,
            relevanceScore: result.relevanceScore ? {
              overallScore: result.relevanceScore.overallScore,
              semanticScore: result.relevanceScore.semanticScore,
              keywordScore: result.relevanceScore.keywordScore,
              recencyScore: result.relevanceScore.recencyScore,
              popularityScore: result.relevanceScore.popularityScore,
              customScore: result.relevanceScore.customScore,
              breakdown: result.relevanceScore.breakdown
            } : undefined,
            context: result.context,
            matchType: result.matchType
          })),
          formatted: {
            markdown: formattedResults.markdown,
            json: formattedResults.json,
            html: formattedResults.html,
            tokenCount: formattedResults.tokenCount
          },
          queryAnalysis: {
            originalQuery: queryAnalysis.originalQuery,
            intent: queryAnalysis.intent,
            queryType: queryAnalysis.queryType,
            confidence: queryAnalysis.confidence,
            entities: queryAnalysis.entities,
            suggestions: queryAnalysis.suggestions
          }
        };
      }

      // Fallback to basic search if query understanding is not available
      const params: SearchParams = {
        query: searchQuery,
        resource: args.resource,
        method: args.method,
        permission: args.permission,
        limit: args.limit || 5
      };

      const results = searchApiDocs(params, this.vectorStore, this.metadataIndex);

      // Apply relevance scoring to rank results
      let scoredResults: SearchResult[] = results.map(result => ({
        endpoint: result.endpoint,
        score: result.score,
        matchType: result.matchType,
        context: result.context
      }));

      // Use relevance scorer to calculate detailed scores and rank results
      if (this.relevanceScorer) {
        scoredResults = scoredResults.map(result => {
          const relevanceScore = this.relevanceScorer!.calculateScore(searchQuery, result.endpoint);
          return {
            ...result,
            score: relevanceScore.overallScore,
            relevanceScore
          };
        });

          // Rank results by relevance score
          scoredResults = this.relevanceScorer.rankResults(scoredResults, searchQuery);

          // Record usage for popularity tracking
          for (const result of scoredResults) {
            this.relevanceScorer!.recordEndpointUsage(result.endpoint);
          }

          // Apply context optimization to manage response size
          if (this.contextManager) {
            const maxTokens = this.contextManager.getConfig().defaultMaxTokens;
            const optimizedContext = this.contextManager.optimizeContextWindow(scoredResults, maxTokens);
            
            logger.info('Context optimized', {
              resultCount: optimizedContext.resultCount,
              excludedCount: optimizedContext.excludedCount,
              tokenCount: optimizedContext.tokenCount,
              truncated: optimizedContext.truncated
            });
          }
        }

        // Format search results using the formatter module
        const formattedResults = formatSearchResults(scoredResults, 'markdown');

        return {
          results: scoredResults.map(result => ({
            endpoint: {
              resource: result.endpoint.resource,
              operation: result.endpoint.operation,
              description: result.endpoint.description,
              method: result.endpoint.method,
              path: result.endpoint.path,
              permission: result.endpoint.permission
            },
            score: result.score,
            relevanceScore: result.relevanceScore ? {
              overallScore: result.relevanceScore.overallScore,
              semanticScore: result.relevanceScore.semanticScore,
              keywordScore: result.relevanceScore.keywordScore,
              recencyScore: result.relevanceScore.recencyScore,
              popularityScore: result.relevanceScore.popularityScore,
              customScore: result.relevanceScore.customScore,
              breakdown: result.relevanceScore.breakdown
            } : undefined,
            context: result.context,
            matchType: result.matchType
          })),
          formatted: {
            markdown: formattedResults.markdown,
            json: formattedResults.json,
            html: formattedResults.html,
            tokenCount: formattedResults.tokenCount
          }
        };
    };

    this.registerToolWithRegistry(searchToolDefinition, searchToolHandler);
    logger.info('Search tool registered successfully');
  }

  /**
   * Register the endpoint tool with the tool registry
   */
  private registerEndpointTool(): void {
    if (!this.toolRegistry) {
      throw new Error('Tool registry not initialized');
    }

    const endpointToolDefinition: ToolDefinition = {
      name: 'get_endpoint',
      description: 'Get detailed information about a specific API endpoint',
      version: '1.0.0',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Endpoint path (e.g., /customers/{id})'
          },
          method: {
            type: 'string',
            description: 'HTTP method (GET, POST, PUT, DELETE, PATCH)'
          },
          resource: {
            type: 'string',
            description: 'Resource name (alternative to path)'
          },
          includeRelated: {
            type: 'boolean',
            description: 'Include related endpoints (default: false)'
          }
        }
      }
    };

    const endpointToolHandler = async (args: any) => {
      if (!this.metadataIndex) {
        throw new Error('Metadata index not initialized');
      }

      const params: EndpointLookupParams = {
        path: args.path,
        method: args.method,
        resource: args.resource
      };

      const result = getEndpoint(params, this.metadataIndex);

      if (!result) {
        return {
          success: false,
          message: 'Endpoint not found',
          endpoint: null
        };
      }

      // Handle single endpoint result
      if (!Array.isArray(result)) {
        const endpointDetails = getEndpointDetails(result.endpoint);

        // Format endpoint using the formatter module
        const formattedEndpoint = formatEndpoint(result.endpoint, 'markdown');

        // Include related endpoints if requested
        let relatedEndpoints = null;
        if (args.includeRelated) {
          const related = findRelatedEndpoints(result.endpoint, this.metadataIndex);
          relatedEndpoints = {
            sameResource: related.sameResource.map(ep => ({
              resource: ep.resource,
              operation: ep.operation,
              method: ep.method,
              path: ep.path,
              permission: ep.permission
            })),
            relatedByParameters: related.relatedByParameters.map(ep => ({
              resource: ep.resource,
              operation: ep.operation,
              method: ep.method,
              path: ep.path,
              permission: ep.permission
            })),
            samePermission: related.samePermission.map(ep => ({
              resource: ep.resource,
              operation: ep.operation,
              method: ep.method,
              path: ep.path,
              permission: ep.permission
            }))
          };
        }

        return {
          success: true,
          exactMatch: result.exactMatch,
          endpoint: endpointDetails,
          formatted: {
            markdown: formattedEndpoint,
            json: formatEndpoint(result.endpoint, 'json'),
            html: formatEndpoint(result.endpoint, 'html')
          },
          relatedEndpoints
        };
      }

      // Handle multiple endpoints (resource lookup)
      const endpointsDetails = result.map(r => getEndpointDetails(r.endpoint));
      
      return {
        success: true,
        count: endpointsDetails.length,
        endpoints: endpointsDetails
      };
    };

    this.registerToolWithRegistry(endpointToolDefinition, endpointToolHandler);
    logger.info('Endpoint tool registered successfully');
  }

  /**
   * Register the parameters tool with the tool registry
   */
  private registerParametersTool(): void {
    if (!this.toolRegistry) {
      throw new Error('Tool registry not initialized');
    }

    const parametersToolDefinition: ToolDefinition = {
      name: 'get_parameters',
      description: 'Get parameter information for an API endpoint including types, constraints, and validation hints',
      version: '1.0.0',
      inputSchema: {
        type: 'object',
        properties: {
          endpoint_path: {
            type: 'string',
            description: 'Endpoint path (e.g., /customers/{id})'
          },
          method: {
            type: 'string',
            description: 'HTTP method (GET, POST, PUT, DELETE, PATCH)'
          },
          param_type: {
            type: 'string',
            description: 'Filter by parameter type (query, path, body)',
            enum: ['query', 'path', 'body']
          }
        },
        required: ['endpoint_path', 'method']
      }
    };

    const parametersToolHandler = async (args: any) => {
      if (!this.metadataIndex) {
        throw new Error('Metadata index not initialized');
      }

      const params: ParameterLookupParams = {
        endpointPath: args.endpoint_path,
        method: args.method,
        paramType: args.param_type
      };

      const result = getParameters(params, this.metadataIndex);

      if (!result) {
        return {
          success: false,
          message: 'Endpoint not found',
          endpoint: null
        };
      }

      // Format parameters using the formatter module
      const formattedParameters = formatParameters(result.parameters, 'markdown');

      return {
        success: true,
        endpointPath: result.endpointPath,
        method: result.method,
        parameters: result.parameters.map(param => ({
          name: param.name,
          type: param.type,
          required: param.required,
          description: param.description,
          paramType: param.paramType,
          constraints: param.constraints,
          validationHints: param.validationHints,
          pattern: param.pattern ? {
            name: param.pattern.name,
            description: param.pattern.description
          } : undefined
        })),
        formatted: {
          markdown: formattedParameters,
          json: formatParameters(result.parameters, 'json'),
          html: formatParameters(result.parameters, 'html')
        },
        totalCount: result.totalCount,
        requiredCount: result.requiredCount,
        optionalCount: result.optionalCount
      };
    };

    this.registerToolWithRegistry(parametersToolDefinition, parametersToolHandler);
    logger.info('Parameters tool registered successfully');
  }

  /**
   * Register the responses tool with the tool registry
   */
  private registerResponsesTool(): void {
    if (!this.toolRegistry) {
      throw new Error('Tool registry not initialized');
    }

    const responsesToolDefinition: ToolDefinition = {
      name: 'get_responses',
      description: 'Get response information for an API endpoint including status codes, schemas, examples, and error documentation',
      version: '1.0.0',
      inputSchema: {
        type: 'object',
        properties: {
          endpoint_path: {
            type: 'string',
            description: 'Endpoint path (e.g., /customers/{id})'
          },
          method: {
            type: 'string',
            description: 'HTTP method (GET, POST, PUT, DELETE, PATCH)'
          },
          status_code: {
            type: 'string',
            description: 'Filter by status code (optional)'
          }
        },
        required: ['endpoint_path', 'method']
      }
    };

    const responsesToolHandler = async (args: any) => {
      if (!this.metadataIndex) {
        throw new Error('Metadata index not initialized');
      }

      const params: ResponseLookupParams = {
        endpointPath: args.endpoint_path,
        method: args.method,
        statusCode: args.status_code
      };

      const result = getResponses(params, this.metadataIndex);

      if (!result) {
        return {
          success: false,
          message: 'Endpoint not found',
          endpoint: null
        };
      }

      // Format responses using the formatter module
      const formattedResponses = formatResponses(result.responses, 'markdown');

      return {
        success: true,
        endpointPath: result.endpointPath,
        method: result.method,
        responses: result.responses.map(response => ({
          statusCode: response.statusCode,
          statusCodeInfo: {
            code: response.statusCodeInfo.code,
            category: response.statusCodeInfo.category,
            name: response.statusCodeInfo.name,
            description: response.statusCodeInfo.description,
            isSuccess: response.statusCodeInfo.isSuccess,
            isError: response.statusCodeInfo.isError,
            isRedirect: response.statusCodeInfo.isRedirect
          },
          description: response.description,
          example: response.example,
          schema: response.schema,
          errorDocumentation: response.errorDocumentation,
          formatDescription: response.formatDescription,
          pattern: response.pattern ? {
            name: response.pattern.name,
            description: response.pattern.description,
            statusCodes: response.pattern.statusCodes,
            structure: response.pattern.structure,
            exampleUseCase: response.pattern.exampleUseCase
          } : undefined
        })),
        formatted: {
          markdown: formattedResponses,
          json: formatResponses(result.responses, 'json'),
          html: formatResponses(result.responses, 'html')
        },
        totalCount: result.totalCount,
        successCount: result.successCount,
        errorCount: result.errorCount,
        commonPatterns: result.commonPatterns.map(pattern => ({
          name: pattern.name,
          description: pattern.description,
          statusCodes: pattern.statusCodes,
          structure: pattern.structure,
          exampleUseCase: pattern.exampleUseCase
        }))
      };
    };

    this.registerToolWithRegistry(responsesToolDefinition, responsesToolHandler);
    logger.info('Responses tool registered successfully');
  }

  /**
   * Register the permissions tool with the tool registry
   */
  private registerPermissionsTool(): void {
    if (!this.toolRegistry) {
      throw new Error('Tool registry not initialized');
    }

    const permissionsToolDefinition: ToolDefinition = {
      name: 'get_permissions',
      description: 'Get permission requirements for API endpoints including descriptions, hierarchy, and usage information',
      version: '1.0.0',
      inputSchema: {
        type: 'object',
        properties: {
          endpoint_path: {
            type: 'string',
            description: 'Endpoint path (e.g., /customers/{id})'
          },
          method: {
            type: 'string',
            description: 'HTTP method (GET, POST, PUT, DELETE, PATCH) - required when using endpoint_path'
          },
          resource: {
            type: 'string',
            description: 'Resource name (alternative to endpoint_path)'
          },
          permission: {
            type: 'string',
            description: 'Filter by permission name (alternative to endpoint_path and resource)'
          },
          include_matrix: {
            type: 'boolean',
            description: 'Include permission matrix (default: false)'
          },
          include_summaries: {
            type: 'boolean',
            description: 'Include permission requirement summaries (default: false)'
          }
        }
      }
    };

    const permissionsToolHandler = async (args: any) => {
      if (!this.metadataIndex) {
        throw new Error('Metadata index not initialized');
      }

      const params: PermissionLookupParams = {
        endpointPath: args.endpoint_path,
        method: args.method,
        resource: args.resource,
        permission: args.permission,
        includeMatrix: args.include_matrix,
        includeSummaries: args.include_summaries
      };

      const result = getPermissions(params, this.metadataIndex);

      // Format the response for the tool
      const formattedResult: any = {
        totalPermissions: result.totalPermissions
      };

      if (result.permission) {
        formattedResult.permission = {
          name: result.permission.name,
          description: {
            name: result.permission.description.name,
            description: result.permission.description.description,
            category: result.permission.description.category,
            operations: result.permission.description.operations
          },
          endpoints: result.permission.endpoints,
          hierarchy: result.permission.hierarchy
        };
      }

      if (result.allPermissions) {
        formattedResult.allPermissions = result.allPermissions.map(p => ({
          name: p.name,
          description: {
            name: p.description.name,
            description: p.description.description,
            category: p.description.category,
            operations: p.description.operations
          },
          endpointCount: p.endpoints.length,
          endpoints: p.endpoints,
          hierarchy: p.hierarchy
        }));
      }

      if (result.summaries) {
        formattedResult.summaries = result.summaries;
      }

      if (result.matrix) {
        formattedResult.matrix = result.matrix;
      }

      return formattedResult;
    };

    this.registerToolWithRegistry(permissionsToolDefinition, permissionsToolHandler);
    logger.info('Permissions tool registered successfully');
  }

  /**
   * Register the resources tool with the tool registry
   */
  private registerResourcesTool(): void {
    if (!this.toolRegistry) {
      throw new Error('Tool registry not initialized');
    }

    const resourcesToolDefinition: ToolDefinition = {
      name: 'list_resources',
      description: 'List all available API resources with summary information, endpoints, relationships, and statistics',
      version: '1.0.0',
      inputSchema: {
        type: 'object',
        properties: {
          include_endpoints: {
            type: 'boolean',
            description: 'Include endpoint details for each resource (default: false)'
          },
          include_relationships: {
            type: 'boolean',
            description: 'Include resource relationship information (default: false)'
          }
        }
      }
    };

    const resourcesToolHandler = async (args: any) => {
      if (!this.metadataIndex) {
        throw new Error('Metadata index not initialized');
      }

      const params: ResourceListParams = {
        includeEndpoints: args.include_endpoints,
        includeRelationships: args.include_relationships
      };

      const result = listResources(params, this.metadataIndex);

      return {
        totalResources: result.totalResources,
        overallStatistics: {
          totalEndpoints: result.overallStatistics.totalEndpoints,
          totalParameters: result.overallStatistics.totalParameters,
          totalResponses: result.overallStatistics.totalResponses,
          uniquePermissions: result.overallStatistics.uniquePermissions,
          mostCommonMethod: result.overallStatistics.mostCommonMethod,
          averageEndpointsPerResource: result.overallStatistics.averageEndpointsPerResource
        },
        resources: result.resources.map(resource => ({
          summary: {
            name: resource.summary.name,
            description: resource.summary.description,
            endpointCount: resource.summary.endpointCount,
            methods: resource.summary.methods,
            permissions: resource.summary.permissions
          },
          endpoints: resource.endpoints,
          relationships: resource.relationships,
          statistics: {
            totalEndpoints: resource.statistics.totalEndpoints,
            totalParameters: resource.statistics.totalParameters,
            totalResponses: resource.statistics.totalResponses,
            uniquePermissions: resource.statistics.uniquePermissions,
            mostCommonMethod: resource.statistics.mostCommonMethod,
            averageEndpointsPerResource: resource.statistics.averageEndpointsPerResource
          },
          navigation: {
            relatedResources: resource.navigation.relatedResources,
            commonOperations: resource.navigation.commonOperations,
            similarPermissionResources: resource.navigation.similarPermissionResources
          }
        }))
      };
    };

    this.registerToolWithRegistry(resourcesToolDefinition, resourcesToolHandler);
    logger.info('Resources tool registered successfully');
  }

  /**
   * Register the code examples tool with the tool registry
   */
  private registerCodeExamplesTool(): void {
    if (!this.toolRegistry) {
      throw new Error('Tool registry not initialized');
    }

    const codeExamplesToolDefinition: ToolDefinition = {
      name: 'generate_code_example',
      description: 'Generate code examples for API endpoints in multiple languages (JavaScript, Python, cURL) with authentication, request/response examples, and error handling',
      version: '1.0.0',
      inputSchema: {
        type: 'object',
        properties: {
          endpoint_path: {
            type: 'string',
            description: 'Endpoint path (e.g., /customers/{id})'
          },
          method: {
            type: 'string',
            description: 'HTTP method (GET, POST, PUT, DELETE, PATCH)'
          },
          language: {
            type: 'string',
            description: 'Programming language for the code example',
            enum: ['javascript', 'python', 'curl']
          },
          include_auth: {
            type: 'boolean',
            description: 'Include authentication in the example (default: true)'
          }
        },
        required: ['endpoint_path', 'method', 'language']
      }
    };

    const codeExamplesToolHandler = async (args: any) => {
      if (!this.metadataIndex) {
        throw new Error('Metadata index not initialized');
      }

      const params: CodeExampleParams = {
        endpointPath: args.endpoint_path,
        method: args.method,
        language: args.language,
        includeAuth: args.include_auth !== undefined ? args.include_auth : true
      };

      const result = generateCodeExample(params, this.metadataIndex);

      return {
        endpoint: {
          resource: result.endpoint.resource,
          operation: result.endpoint.operation,
          description: result.endpoint.description,
          method: result.endpoint.method,
          path: result.endpoint.path
        },
        code: result.code,
        language: result.language,
        includesAuth: result.includesAuth,
        exampleRequest: result.exampleRequest,
        exampleResponse: result.exampleResponse,
        errorHandling: result.errorHandling
      };
    };

    this.registerToolWithRegistry(codeExamplesToolDefinition, codeExamplesToolHandler);
    logger.info('Code examples tool registered successfully');
  }
}

export const server = new MCPServer();
