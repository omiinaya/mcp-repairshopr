/**
 * Unit tests for Tool Registry
 */

import { ToolRegistry, ToolDefinition } from '../../src/server/tool-registry';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  afterEach(() => {
    registry.clear();
  });

  describe('Tool Registration and Unregistration', () => {
    it('should register a tool successfully', () => {
      const definition: ToolDefinition = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {
            param1: { type: 'string' }
          }
        },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      const handler = jest.fn();
      registry.registerTool(definition, handler);

      expect(registry.hasTool('test-tool')).toBe(true);
      expect(registry.getTool('test-tool')).toEqual(definition);
      expect(registry.getToolHandler('test-tool')).toBe(handler);
    });

    it('should unregister a tool successfully', () => {
      const definition: ToolDefinition = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      registry.registerTool(definition, jest.fn());
      const result = registry.unregisterTool('test-tool');

      expect(result).toBe(true);
      expect(registry.hasTool('test-tool')).toBe(false);
    });

    it('should return false when unregistering non-existent tool', () => {
      const result = registry.unregisterTool('non-existent-tool');
      expect(result).toBe(false);
    });

    it('should overwrite existing tool when registering with same name', () => {
      const definition1: ToolDefinition = {
        name: 'test-tool',
        description: 'First version',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      const definition2: ToolDefinition = {
        name: 'test-tool',
        description: 'Second version',
        inputSchema: { type: 'object' },
        version: '2.0.0',
        deprecated: false,
        dependencies: []
      };

      const handler1 = jest.fn();
      const handler2 = jest.fn();

      registry.registerTool(definition1, handler1);
      registry.registerTool(definition2, handler2);

      const tool = registry.getTool('test-tool');
      expect(tool?.description).toBe('Second version');
      expect(tool?.version).toBe('2.0.0');
      expect(registry.getToolHandler('test-tool')).toBe(handler2);
    });
  });

  describe('Tool Retrieval', () => {
    it('should get tool by name', () => {
      const definition: ToolDefinition = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      registry.registerTool(definition, jest.fn());
      const retrieved = registry.getTool('test-tool');

      expect(retrieved).toEqual(definition);
    });

    it('should return undefined for non-existent tool', () => {
      const retrieved = registry.getTool('non-existent-tool');
      expect(retrieved).toBeUndefined();
    });

    it('should get all tools', () => {
      const definition1: ToolDefinition = {
        name: 'tool1',
        description: 'Tool 1',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      const definition2: ToolDefinition = {
        name: 'tool2',
        description: 'Tool 2',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      registry.registerTool(definition1, jest.fn());
      registry.registerTool(definition2, jest.fn());

      const allTools = registry.getAllTools();
      expect(allTools).toHaveLength(2);
      expect(allTools.map(t => t.name)).toContain('tool1');
      expect(allTools.map(t => t.name)).toContain('tool2');
    });

    it('should get tool handler by name', () => {
      const definition: ToolDefinition = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      const handler = jest.fn();
      registry.registerTool(definition, handler);

      const retrievedHandler = registry.getToolHandler('test-tool');
      expect(retrievedHandler).toBe(handler);
    });

    it('should return undefined for non-existent tool handler', () => {
      const retrievedHandler = registry.getToolHandler('non-existent-tool');
      expect(retrievedHandler).toBeUndefined();
    });
  });

  describe('Tool Discovery with Filters', () => {
    beforeEach(() => {
      const tools: ToolDefinition[] = [
        {
          name: 'active-tool',
          description: 'Active tool',
          inputSchema: { type: 'object' },
          version: '1.0.0',
          deprecated: false,
          dependencies: []
        },
        {
          name: 'deprecated-tool',
          description: 'Deprecated tool',
          inputSchema: { type: 'object' },
          version: '1.0.0',
          deprecated: true,
          dependencies: []
        },
        {
          name: 'v2-tool',
          description: 'Version 2 tool',
          inputSchema: { type: 'object' },
          version: '2.0.0',
          deprecated: false,
          dependencies: []
        }
      ];

      tools.forEach(tool => registry.registerTool(tool, jest.fn()));
    });

    it('should discover all tools without filters', () => {
      const discovered = registry.discoverTools();
      expect(discovered).toHaveLength(3);
    });

    it('should filter by deprecated status', () => {
      const activeTools = registry.discoverTools({ deprecated: false });
      expect(activeTools).toHaveLength(2);
      expect(activeTools.every(t => !t.deprecated)).toBe(true);

      const deprecatedTools = registry.discoverTools({ deprecated: true });
      expect(deprecatedTools).toHaveLength(1);
      expect(deprecatedTools[0].name).toBe('deprecated-tool');
    });

    it('should filter by version', () => {
      const v1Tools = registry.discoverTools({ version: '1.0.0' });
      expect(v1Tools).toHaveLength(2);
      expect(v1Tools.every(t => t.version === '1.0.0')).toBe(true);

      const v2Tools = registry.discoverTools({ version: '2.0.0' });
      expect(v2Tools).toHaveLength(1);
      expect(v2Tools[0].name).toBe('v2-tool');
    });

    it('should filter by both deprecated and version', () => {
      const filtered = registry.discoverTools({ deprecated: false, version: '1.0.0' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('active-tool');
    });
  });

  describe('Dependency Checking', () => {
    it('should check satisfied dependencies', () => {
      const tool1: ToolDefinition = {
        name: 'tool1',
        description: 'Tool 1',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      const tool2: ToolDefinition = {
        name: 'tool2',
        description: 'Tool 2',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: ['tool1']
      };

      registry.registerTool(tool1, jest.fn());
      registry.registerTool(tool2, jest.fn());

      const result = registry.checkDependencies('tool2');
      expect(result.satisfied).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should check unsatisfied dependencies', () => {
      const tool: ToolDefinition = {
        name: 'tool',
        description: 'Tool',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: ['missing-tool1', 'missing-tool2']
      };

      registry.registerTool(tool, jest.fn());

      const result = registry.checkDependencies('tool');
      expect(result.satisfied).toBe(false);
      expect(result.missing).toEqual(['missing-tool1', 'missing-tool2']);
    });

    it('should handle non-existent tool for dependency check', () => {
      const result = registry.checkDependencies('non-existent-tool');
      expect(result.satisfied).toBe(false);
      expect(result.missing).toEqual([]);
    });

    it('should check tool with no dependencies', () => {
      const tool: ToolDefinition = {
        name: 'tool',
        description: 'Tool',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      registry.registerTool(tool, jest.fn());

      const result = registry.checkDependencies('tool');
      expect(result.satisfied).toBe(true);
      expect(result.missing).toHaveLength(0);
    });
  });

  describe('Version Management', () => {
    it('should get tool version', () => {
      const definition: ToolDefinition = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: { type: 'object' },
        version: '1.2.3',
        deprecated: false,
        dependencies: []
      };

      registry.registerTool(definition, jest.fn());

      const version = registry.getToolVersion('test-tool');
      expect(version).toBe('1.2.3');
    });

    it('should return undefined for non-existent tool version', () => {
      const version = registry.getToolVersion('non-existent-tool');
      expect(version).toBeUndefined();
    });

    it('should support semantic versioning with pre-release', () => {
      const definition: ToolDefinition = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: { type: 'object' },
        version: '1.0.0-alpha.1',
        deprecated: false,
        dependencies: []
      };

      registry.registerTool(definition, jest.fn());
      expect(registry.getToolVersion('test-tool')).toBe('1.0.0-alpha.1');
    });

    it('should support semantic versioning with build metadata', () => {
      const definition: ToolDefinition = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: { type: 'object' },
        version: '1.0.0+build.123',
        deprecated: false,
        dependencies: []
      };

      registry.registerTool(definition, jest.fn());
      expect(registry.getToolVersion('test-tool')).toBe('1.0.0+build.123');
    });
  });

  describe('Deprecation Handling', () => {
    it('should check if tool is deprecated', () => {
      const deprecatedTool: ToolDefinition = {
        name: 'deprecated-tool',
        description: 'Deprecated tool',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: true,
        dependencies: []
      };

      const activeTool: ToolDefinition = {
        name: 'active-tool',
        description: 'Active tool',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      registry.registerTool(deprecatedTool, jest.fn());
      registry.registerTool(activeTool, jest.fn());

      expect(registry.isDeprecated('deprecated-tool')).toBe(true);
      expect(registry.isDeprecated('active-tool')).toBe(false);
    });

    it('should return false for non-existent tool deprecation check', () => {
      const result = registry.isDeprecated('non-existent-tool');
      expect(result).toBe(false);
    });
  });

  describe('Validation of Tool Definitions', () => {
    it('should throw error for missing name', () => {
      const definition: any = {
        description: 'Test',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      expect(() => registry.registerTool(definition, jest.fn())).toThrow(
        'Tool name is required and must be a string'
      );
    });

    it('should throw error for missing description', () => {
      const definition: any = {
        name: 'test-tool',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      expect(() => registry.registerTool(definition, jest.fn())).toThrow(
        'Tool description is required and must be a string'
      );
    });

    it('should throw error for missing inputSchema', () => {
      const definition: any = {
        name: 'test-tool',
        description: 'Test',
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      expect(() => registry.registerTool(definition, jest.fn())).toThrow(
        'Tool inputSchema is required and must be an object'
      );
    });

    it('should throw error for missing version', () => {
      const definition: any = {
        name: 'test-tool',
        description: 'Test',
        inputSchema: { type: 'object' },
        deprecated: false,
        dependencies: []
      };

      expect(() => registry.registerTool(definition, jest.fn())).toThrow(
        'Tool version is required and must be a string'
      );
    });

    it('should throw error for invalid version format', () => {
      const definition: any = {
        name: 'test-tool',
        description: 'Test',
        inputSchema: { type: 'object' },
        version: 'invalid-version',
        deprecated: false,
        dependencies: []
      };

      expect(() => registry.registerTool(definition, jest.fn())).toThrow(
        'Tool version must follow semantic versioning'
      );
    });

    it('should throw error for missing deprecated flag', () => {
      const definition: any = {
        name: 'test-tool',
        description: 'Test',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        dependencies: []
      };

      expect(() => registry.registerTool(definition, jest.fn())).toThrow(
        'Tool deprecated flag is required and must be a boolean'
      );
    });

    it('should throw error for missing dependencies array', () => {
      const definition: any = {
        name: 'test-tool',
        description: 'Test',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false
      };

      expect(() => registry.registerTool(definition, jest.fn())).toThrow(
        'Tool dependencies is required and must be an array'
      );
    });

    it('should throw error for non-string dependencies', () => {
      const definition: any = {
        name: 'test-tool',
        description: 'Test',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: ['valid', 123, 'also-valid']
      };

      expect(() => registry.registerTool(definition, jest.fn())).toThrow(
        'Tool dependencies must be an array of strings'
      );
    });

    it('should accept valid tool definition', () => {
      const definition: ToolDefinition = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {
            param1: { type: 'string' }
          },
          required: ['param1']
        },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      expect(() => registry.registerTool(definition, jest.fn())).not.toThrow();
    });
  });

  describe('Registry Statistics', () => {
    it('should return correct statistics', () => {
      const tools: ToolDefinition[] = [
        {
          name: 'active1',
          description: 'Active 1',
          inputSchema: { type: 'object' },
          version: '1.0.0',
          deprecated: false,
          dependencies: []
        },
        {
          name: 'active2',
          description: 'Active 2',
          inputSchema: { type: 'object' },
          version: '1.0.0',
          deprecated: false,
          dependencies: ['active1']
        },
        {
          name: 'deprecated1',
          description: 'Deprecated 1',
          inputSchema: { type: 'object' },
          version: '1.0.0',
          deprecated: true,
          dependencies: []
        }
      ];

      tools.forEach(tool => registry.registerTool(tool, jest.fn()));

      const stats = registry.getStats();
      expect(stats.totalTools).toBe(3);
      expect(stats.activeTools).toBe(2);
      expect(stats.deprecatedTools).toBe(1);
      expect(stats.toolsWithDependencies).toBe(1);
    });

    it('should return zero statistics for empty registry', () => {
      const stats = registry.getStats();
      expect(stats.totalTools).toBe(0);
      expect(stats.activeTools).toBe(0);
      expect(stats.deprecatedTools).toBe(0);
      expect(stats.toolsWithDependencies).toBe(0);
    });
  });

  describe('Clear Registry', () => {
    it('should clear all tools', () => {
      const definition: ToolDefinition = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      registry.registerTool(definition, jest.fn());
      expect(registry.hasTool('test-tool')).toBe(true);

      registry.clear();
      expect(registry.hasTool('test-tool')).toBe(false);
      expect(registry.getAllTools()).toHaveLength(0);
    });
  });

  describe('Has Tool', () => {
    it('should return true for registered tool', () => {
      const definition: ToolDefinition = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: { type: 'object' },
        version: '1.0.0',
        deprecated: false,
        dependencies: []
      };

      registry.registerTool(definition, jest.fn());
      expect(registry.hasTool('test-tool')).toBe(true);
    });

    it('should return false for non-registered tool', () => {
      expect(registry.hasTool('non-existent-tool')).toBe(false);
    });
  });
});
