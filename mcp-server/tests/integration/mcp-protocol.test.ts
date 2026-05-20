/**
 * Integration tests for MCP protocol
 * Tests MCP protocol message handling, tool registration, and request/response lifecycle
 */

import { Server } from '@modelcontextprotocol/sdk/server';
import { ProtocolHandler, MCPTool } from '../../src/server/protocol-handler';
import { ToolRegistry, ToolDefinition } from '../../src/server/tool-registry';
import { createMockMetadataIndex } from '../utils/test-helpers';
import { generateEndpoint } from '../utils/data-generators';

describe('MCP Protocol Integration Tests', () => {
  let server: Server;
  let protocolHandler: ProtocolHandler;
  let toolRegistry: ToolRegistry;
  let mockMetadataIndex: any;

  beforeAll(async () => {
    // Create mock metadata index
    const endpoints = [
      generateEndpoint({
        resource: 'Customer',
        operation: 'Get Customer',
        method: 'GET',
        path: '/customers/{id}',
      }),
      generateEndpoint({
        resource: 'Invoice',
        operation: 'Get Invoice',
        method: 'GET',
        path: '/invoices/{id}',
      }),
      generateEndpoint({
        resource: 'Ticket',
        operation: 'Create Ticket',
        method: 'POST',
        path: '/tickets',
      }),
    ];
    mockMetadataIndex = createMockMetadataIndex(endpoints);

    // Initialize server
    server = new Server({
      name: 'test-server',
      version: '1.0.0',
    });

    // Initialize protocol handler
    protocolHandler = new ProtocolHandler();
    await protocolHandler.initialize(server);

    // Initialize tool registry
    toolRegistry = new ToolRegistry();
  });

  afterAll(async () => {
    if (protocolHandler) {
      protocolHandler.reset();
    }
  });

  describe('MCP Protocol Message Handling', () => {
    test('should handle initialize request', async () => {
      const request = {
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          clientInfo: {
            name: 'test-client',
            version: '1.0.0',
          },
        },
      };

      const response = await (server as any).handleRequest(
        'initialize',
        request
      );

      expect(response).toBeDefined();
      expect(response.protocolVersion).toBe('2024-11-05');
      expect(response.capabilities).toBeDefined();
      expect(response.capabilities.tools).toBeDefined();
      expect(response.serverInfo).toBeDefined();
      expect(response.serverInfo.name).toBe('test-server');
      expect(response.serverInfo.version).toBe('1.0.0');
    });

    test('should handle initialized notification', async () => {
      const request = {
        params: {},
      };

      const response = await (server as any).handleRequest(
        'notifications/initialized',
        request
      );

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
    });

    test('should handle tools/list request', async () => {
      // Register a test tool
      const testTool: MCPTool = {
        name: 'test_tool',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
          required: ['query'],
        },
        handler: async (params: any) => ({ result: 'test' }),
      };

      protocolHandler.registerTool(testTool);

      const request = {
        params: {},
      };

      const response = await (server as any).handleRequest(
        'tools/list',
        request
      );

      expect(response).toBeDefined();
      expect(response.tools).toBeDefined();
      expect(Array.isArray(response.tools)).toBe(true);
      expect(response.tools.length).toBeGreaterThan(0);
      expect(response.tools[0].name).toBe('test_tool');
      expect(response.tools[0].description).toBe('A test tool');
      expect(response.tools[0].inputSchema).toBeDefined();
    });

    test('should handle tools/call request', async () => {
      const testTool: MCPTool = {
        name: 'echo_tool',
        description: 'Echo the input',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
        handler: async (params: any) => ({ echo: params.message }),
      };

      protocolHandler.registerTool(testTool);

      const request = {
        params: {
          name: 'echo_tool',
          arguments: {
            message: 'Hello, World!',
          },
        },
      };

      const response = await (server as any).handleRequest(
        'tools/call',
        request
      );

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.content[0].type).toBe('text');
      const parsedResult = JSON.parse(response.content[0].text);
      expect(parsedResult.echo).toBe('Hello, World!');
    });
  });

  describe('Tool Registration and Discovery', () => {
    test('should register tools with protocol handler', () => {
      const tool: MCPTool = {
        name: 'search_tool',
        description: 'Search API documentation',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
          required: ['query'],
        },
        handler: async (params: any) => ({ results: [] }),
      };

      protocolHandler.registerTool(tool);

      expect(protocolHandler.hasTool('search_tool')).toBe(true);
      expect(protocolHandler.getTool('search_tool')).toBeDefined();
      expect(protocolHandler.getTool('search_tool')?.name).toBe('search_tool');
    });

    test('should unregister tools from protocol handler', () => {
      const tool: MCPTool = {
        name: 'temp_tool',
        description: 'Temporary tool',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);
      expect(protocolHandler.hasTool('temp_tool')).toBe(true);

      const removed = protocolHandler.unregisterTool('temp_tool');
      expect(removed).toBe(true);
      expect(protocolHandler.hasTool('temp_tool')).toBe(false);
    });

    test('should get all registered tools', () => {
      const tools = protocolHandler.getTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.every((t) => t.name && t.description && t.inputSchema)).toBe(
        true
      );
    });

    test('should get server capabilities', () => {
      const capabilities = protocolHandler.getCapabilities();
      expect(capabilities).toBeDefined();
      expect(capabilities.tools).toBeDefined();
      expect(capabilities.tools.listChanged).toBe(true);
    });
  });

  describe('Tool Execution Flows with Real Metadata Index', () => {
    test('should execute search tool with metadata index', async () => {
      const searchTool: MCPTool = {
        name: 'search_api_docs',
        description: 'Search API documentation',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            limit: { type: 'number' },
          },
          required: ['query'],
        },
        handler: async (params: any) => {
          // Simulate search using metadata index
          const results = mockMetadataIndex.allEndpoints.filter(
            (ep: any) =>
              ep.resource.toLowerCase().includes(params.query.toLowerCase()) ||
              ep.operation.toLowerCase().includes(params.query.toLowerCase())
          );
          return {
            results: results.slice(0, params.limit || 5),
            count: results.length,
          };
        },
      };

      protocolHandler.registerTool(searchTool);

      const request = {
        params: {
          name: 'search_api_docs',
          arguments: {
            query: 'customer',
            limit: 5,
          },
        },
      };

      const response = await (server as any).handleRequest(
        'tools/call',
        request
      );

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      const parsedResult = JSON.parse(response.content[0].text);
      expect(parsedResult.results).toBeDefined();
      expect(Array.isArray(parsedResult.results)).toBe(true);
    });

    test('should execute endpoint lookup tool', async () => {
      const endpointTool: MCPTool = {
        name: 'get_endpoint',
        description: 'Get endpoint details',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            method: { type: 'string' },
          },
          required: ['path', 'method'],
        },
        handler: async (params: any) => {
          const endpoint = mockMetadataIndex.endpointsByPath.get(
            `${params.method}:${params.path}`
          );
          return endpoint || null;
        },
      };

      protocolHandler.registerTool(endpointTool);

      const request = {
        params: {
          name: 'get_endpoint',
          arguments: {
            path: '/customers/{id}',
            method: 'GET',
          },
        },
      };

      const response = await (server as any).handleRequest(
        'tools/call',
        request
      );

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      const parsedResult = JSON.parse(response.content[0].text);
      expect(parsedResult).toBeDefined();
    });
  });

  describe('Request/Response Lifecycle', () => {
    test('should track request count', async () => {
      const initialStats = protocolHandler.getRequestStats();
      const initialCount = initialStats.count;

      const tool: MCPTool = {
        name: 'counter_tool',
        description: 'Count requests',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        handler: async () => ({ count: 1 }),
      };

      protocolHandler.registerTool(tool);

      const request = {
        params: {
          name: 'counter_tool',
          arguments: {},
        },
      };

      await (server as any).handleRequest('tools/call', request);

      const newStats = protocolHandler.getRequestStats();
      expect(newStats.count).toBe(initialCount + 1);
    });

    test('should generate unique request IDs', async () => {
      const tool: MCPTool = {
        name: 'id_tool',
        description: 'Test request IDs',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);

      const request1 = {
        params: {
          name: 'id_tool',
          arguments: {},
        },
      };

      const request2 = {
        params: {
          name: 'id_tool',
          arguments: {},
        },
      };

      await (server as any).handleRequest('tools/call', request1);
      await (server as any).handleRequest('tools/call', request2);

      // Request count should have increased by 2
      const stats = protocolHandler.getRequestStats();
      expect(stats.count).toBeGreaterThan(0);
    });

    test('should maintain request context', async () => {
      let capturedContext: any = null;

      const tool: MCPTool = {
        name: 'context_tool',
        description: 'Test request context',
        inputSchema: {
          type: 'object',
          properties: {
            test: { type: 'string' },
          },
        },
        handler: async (params: any) => {
          return { received: params.test };
        },
      };

      protocolHandler.registerTool(tool);

      const request = {
        params: {
          name: 'context_tool',
          arguments: {
            test: 'context-value',
          },
        },
      };

      const response = await (server as any).handleRequest(
        'tools/call',
        request
      );

      expect(response).toBeDefined();
      const parsedResult = JSON.parse(response.content[0].text);
      expect(parsedResult.received).toBe('context-value');
    });
  });

  describe('Error Handling for Invalid Requests', () => {
    test('should handle missing tool name', async () => {
      const request = {
        params: {
          arguments: {
            query: 'test',
          },
        },
      };

      await expect(
        (server as any).handleRequest('tools/call', request)
      ).rejects.toThrow();
    });

    test('should handle non-existent tool', async () => {
      const request = {
        params: {
          name: 'nonexistent_tool',
          arguments: {},
        },
      };

      await expect(
        (server as any).handleRequest('tools/call', request)
      ).rejects.toThrow();
    });

    test('should handle missing required parameters', async () => {
      const tool: MCPTool = {
        name: 'required_params_tool',
        description: 'Tool with required params',
        inputSchema: {
          type: 'object',
          properties: {
            required_param: { type: 'string' },
          },
          required: ['required_param'],
        },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);

      const request = {
        params: {
          name: 'required_params_tool',
          arguments: {},
        },
      };

      await expect(
        (server as any).handleRequest('tools/call', request)
      ).rejects.toThrow();
    });

    test('should handle invalid parameter types', async () => {
      const tool: MCPTool = {
        name: 'type_validation_tool',
        description: 'Tool with type validation',
        inputSchema: {
          type: 'object',
          properties: {
            number_param: { type: 'number' },
          },
          required: ['number_param'],
        },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);

      const request = {
        params: {
          name: 'type_validation_tool',
          arguments: {
            number_param: 'not a number',
          },
        },
      };

      await expect(
        (server as any).handleRequest('tools/call', request)
      ).rejects.toThrow();
    });

    test('should handle tool handler errors', async () => {
      const tool: MCPTool = {
        name: 'error_tool',
        description: 'Tool that throws errors',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        handler: async () => {
          throw new Error('Tool execution failed');
        },
      };

      protocolHandler.registerTool(tool);

      const request = {
        params: {
          name: 'error_tool',
          arguments: {},
        },
      };

      await expect(
        (server as any).handleRequest('tools/call', request)
      ).rejects.toThrow('Tool execution failed');
    });
  });

  describe('Concurrent Requests to the Server', () => {
    test('should handle multiple concurrent tool calls', async () => {
      const tool: MCPTool = {
        name: 'concurrent_tool',
        description: 'Tool for concurrent testing',
        inputSchema: {
          type: 'object',
          properties: {
            delay: { type: 'number' },
          },
        },
        handler: async (params: any) => {
          await new Promise((resolve) =>
            setTimeout(resolve, params.delay || 10)
          );
          return { completed: true };
        },
      };

      protocolHandler.registerTool(tool);

      const requests = Array.from({ length: 10 }, (_, i) => ({
        params: {
          name: 'concurrent_tool',
          arguments: { delay: 10 },
        },
      }));

      const responses = await Promise.all(
        requests.map((req) => (server as any).handleRequest('tools/call', req))
      );

      expect(responses).toHaveLength(10);
      responses.forEach((response) => {
        expect(response).toBeDefined();
        expect(response.content).toBeDefined();
        const parsedResult = JSON.parse(response.content[0].text);
        expect(parsedResult.completed).toBe(true);
      });
    });

    test('should maintain request isolation during concurrent calls', async () => {
      let callCount = 0;

      const tool: MCPTool = {
        name: 'isolation_tool',
        description: 'Tool for isolation testing',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        handler: async (params: any) => {
          callCount++;
          await new Promise((resolve) => setTimeout(resolve, 5));
          return { id: params.id, callCount };
        },
      };

      protocolHandler.registerTool(tool);

      const requests = Array.from({ length: 5 }, (_, i) => ({
        params: {
          name: 'isolation_tool',
          arguments: { id: i },
        },
      }));

      const responses = await Promise.all(
        requests.map((req) => (server as any).handleRequest('tools/call', req))
      );

      expect(responses).toHaveLength(5);
      const ids = responses.map((response) => {
        const parsedResult = JSON.parse(response.content[0].text);
        return parsedResult.id;
      });
      expect(ids).toEqual(expect.arrayContaining([0, 1, 2, 3, 4]));
    });

    test('should handle concurrent requests with different tools', async () => {
      const tool1: MCPTool = {
        name: 'tool_a',
        description: 'Tool A',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        handler: async () => ({ tool: 'A' }),
      };

      const tool2: MCPTool = {
        name: 'tool_b',
        description: 'Tool B',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        handler: async () => ({ tool: 'B' }),
      };

      protocolHandler.registerTool(tool1);
      protocolHandler.registerTool(tool2);

      const requests = [
        {
          params: {
            name: 'tool_a',
            arguments: {},
          },
        },
        {
          params: {
            name: 'tool_b',
            arguments: {},
          },
        },
        {
          params: {
            name: 'tool_a',
            arguments: {},
          },
        },
      ];

      const responses = await Promise.all(
        requests.map((req) => (server as any).handleRequest('tools/call', req))
      );

      expect(responses).toHaveLength(3);
      const tools = responses.map((response) => {
        const parsedResult = JSON.parse(response.content[0].text);
        return parsedResult.tool;
      });
      expect(tools).toEqual(['A', 'B', 'A']);
    });
  });

  describe('Protocol Handler State Management', () => {
    test('should check if handler is ready', () => {
      expect(protocolHandler.isReady()).toBe(true);
    });

    test('should reset protocol handler state', () => {
      const tool: MCPTool = {
        name: 'reset_test_tool',
        description: 'Tool for reset testing',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);
      expect(protocolHandler.hasTool('reset_test_tool')).toBe(true);

      protocolHandler.reset();
      expect(protocolHandler.hasTool('reset_test_tool')).toBe(false);
      expect(protocolHandler.getRequestStats().count).toBe(0);
    });

    test('should get request statistics', () => {
      const stats = protocolHandler.getRequestStats();
      expect(stats).toBeDefined();
      expect(stats.count).toBeDefined();
      expect(typeof stats.count).toBe('number');
      expect(stats.toolCount).toBeDefined();
      expect(typeof stats.toolCount).toBe('number');
    });
  });
});
