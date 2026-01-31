/**
 * Tool Registry Module
 * Provides tool registration, discovery, versioning, dependency management, and deprecation handling
 */

import { logger } from '../utils/logger';

/**
 * Tool definition interface with metadata
 */
export interface ToolDefinition {
  /** Unique name of the tool */
  name: string;
  /** Description of what the tool does */
  description: string;
  /** JSON Schema for tool input validation */
  inputSchema: Record<string, any>;
  /** Tool version (semantic versioning) */
  version: string;
  /** Whether the tool is deprecated */
  deprecated: boolean;
  /** List of tool names this tool depends on */
  dependencies: string[];
}

/**
 * Tool dependency check result
 */
export interface DependencyCheckResult {
  /** Whether all dependencies are satisfied */
  satisfied: boolean;
  /** List of missing dependency names */
  missing: string[];
}

/**
 * Tool discovery filter options
 */
export interface ToolDiscoveryFilter {
  /** Filter by deprecation status */
  deprecated?: boolean;
  /** Filter by version (exact match) */
  version?: string;
}

/**
 * Tool Registry class for managing tool definitions and handlers
 */
export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private handlers: Map<string, Function> = new Map();

  /**
   * Register a tool with its handler
   * @param definition - Tool definition
   * @param handler - Tool handler function
   * @throws Error if definition is invalid
   */
  registerTool(definition: ToolDefinition, handler: Function): void {
    // Validate tool definition
    this.validateToolDefinition(definition);

    // Check if tool already exists
    if (this.tools.has(definition.name)) {
      logger.warn('Tool already registered, overwriting', { toolName: definition.name });
    }

    // Store tool definition and handler
    this.tools.set(definition.name, definition);
    this.handlers.set(definition.name, handler);

    logger.info('Tool registered', {
      toolName: definition.name,
      version: definition.version,
      deprecated: definition.deprecated,
      dependencies: definition.dependencies.length
    });
  }

  /**
   * Unregister a tool
   * @param name - Tool name to unregister
   * @returns True if tool was unregistered, false if not found
   */
  unregisterTool(name: string): boolean {
    const toolExists = this.tools.has(name);
    if (toolExists) {
      this.tools.delete(name);
      this.handlers.delete(name);
      logger.info('Tool unregistered', { toolName: name });
      return true;
    }
    logger.warn('Tool not found for unregistration', { toolName: name });
    return false;
  }

  /**
   * Get tool definition by name
   * @param name - Tool name
   * @returns Tool definition or undefined if not found
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tool definitions
   * @returns Array of all tool definitions
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool handler by name
   * @param name - Tool name
   * @returns Tool handler function or undefined if not found
   */
  getToolHandler(name: string): Function | undefined {
    return this.handlers.get(name);
  }

  /**
   * Discover tools with optional filters
   * @param filter - Optional filter criteria
   * @returns Array of matching tool definitions
   */
  discoverTools(filter?: ToolDiscoveryFilter): ToolDefinition[] {
    let tools = Array.from(this.tools.values());

    // Apply filters if provided
    if (filter) {
      if (filter.deprecated !== undefined) {
        tools = tools.filter(tool => tool.deprecated === filter.deprecated);
      }
      if (filter.version) {
        tools = tools.filter(tool => tool.version === filter.version);
      }
    }

    return tools;
  }

  /**
   * Check if tool dependencies are satisfied
   * @param toolName - Name of the tool to check
   * @returns Dependency check result
   */
  checkDependencies(toolName: string): DependencyCheckResult {
    const tool = this.tools.get(toolName);

    if (!tool) {
      logger.warn('Tool not found for dependency check', { toolName });
      return { satisfied: false, missing: [] };
    }

    const missing: string[] = [];

    for (const dep of tool.dependencies) {
      if (!this.tools.has(dep)) {
        missing.push(dep);
      }
    }

    const result = {
      satisfied: missing.length === 0,
      missing
    };

    if (!result.satisfied) {
      logger.warn('Tool dependencies not satisfied', {
        toolName,
        missing: result.missing
      });
    }

    return result;
  }

  /**
   * Check if a tool is deprecated
   * @param name - Tool name
   * @returns True if tool is deprecated, false otherwise
   */
  isDeprecated(name: string): boolean {
    const tool = this.tools.get(name);
    return tool ? tool.deprecated : false;
  }

  /**
   * Get tool version
   * @param name - Tool name
   * @returns Tool version string or undefined if not found
   */
  getToolVersion(name: string): string | undefined {
    const tool = this.tools.get(name);
    return tool ? tool.version : undefined;
  }

  /**
   * Validate tool definition
   * @param definition - Tool definition to validate
   * @throws Error if definition is invalid
   */
  private validateToolDefinition(definition: ToolDefinition): void {
    if (!definition.name || typeof definition.name !== 'string') {
      throw new Error('Tool name is required and must be a string');
    }

    if (!definition.description || typeof definition.description !== 'string') {
      throw new Error('Tool description is required and must be a string');
    }

    if (!definition.inputSchema || typeof definition.inputSchema !== 'object') {
      throw new Error('Tool inputSchema is required and must be an object');
    }

    if (!definition.version || typeof definition.version !== 'string') {
      throw new Error('Tool version is required and must be a string');
    }

    // Validate semantic version format (basic check)
    const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
    if (!versionRegex.test(definition.version)) {
      throw new Error(
        `Tool version must follow semantic versioning (e.g., 1.0.0): ${definition.version}`
      );
    }

    if (typeof definition.deprecated !== 'boolean') {
      throw new Error('Tool deprecated flag is required and must be a boolean');
    }

    if (!Array.isArray(definition.dependencies)) {
      throw new Error('Tool dependencies is required and must be an array');
    }

    // Validate that dependencies are strings
    for (const dep of definition.dependencies) {
      if (typeof dep !== 'string') {
        throw new Error('Tool dependencies must be an array of strings');
      }
    }
  }

  /**
   * Get registry statistics
   * @returns Statistics about the registry
   */
  getStats(): {
    totalTools: number;
    activeTools: number;
    deprecatedTools: number;
    toolsWithDependencies: number;
  } {
    const tools = Array.from(this.tools.values());
    return {
      totalTools: tools.length,
      activeTools: tools.filter(t => !t.deprecated).length,
      deprecatedTools: tools.filter(t => t.deprecated).length,
      toolsWithDependencies: tools.filter(t => t.dependencies.length > 0).length
    };
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    const count = this.tools.size;
    this.tools.clear();
    this.handlers.clear();
    logger.info('Tool registry cleared', { count });
  }

  /**
   * Check if a tool is registered
   * @param name - Tool name
   * @returns True if tool is registered
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }
}
