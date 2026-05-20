/**
 * Unit tests for ProtocolHandler
 */

import { ProtocolHandler, MCPTool } from '../../src/server/protocol-handler';
import { Server } from '@modelcontextprotocol/sdk/server';

// Mock the Server class
jest.mock('@modelcontextprotocol/sdk/server', () => {
  return {
    Server: jest.fn().mockImplementation(() => ({
      setRequestHandler: jest.fn(),
      setNotificationHandler: jest.fn(),
    })),
  };
});

describe('ProtocolHandler', () => {
  let protocolHandler: ProtocolHandler;
  let mockServer: jest.Mocked<Server>;

  beforeEach(() => {
    protocolHandler = new ProtocolHandler();
    mockServer = new Server({
      name: 'test',
      version: '1.0.0',
    }) as jest.Mocked<Server>;
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully with a server instance', async () => {
      await protocolHandler.initialize(mockServer);

      expect(protocolHandler.isReady()).toBe(true);
      expect(mockServer.setRequestHandler).toHaveBeenCalled();
    });

    it('should not initialize twice', async () => {
      await protocolHandler.initialize(mockServer);

      await expect(
        protocolHandler.initialize(mockServer)
      ).resolves.not.toThrow();
      expect(protocolHandler.isReady()).toBe(true);
    });

    it('should throw error if server is null', async () => {
      const handler = new ProtocolHandler();
      await expect(handler.initialize(null as any)).rejects.toThrow();
    });

    it('should set up message handlers on initialization', async () => {
      await protocolHandler.initialize(mockServer);

      expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
        'tools/list',
        expect.any(Function)
      );
      expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
        'tools/call',
        expect.any(Function)
      );
      expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
        'initialize',
        expect.any(Function)
      );
      expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
        'notifications/initialized',
        expect.any(Function)
      );
    });
  });

  describe('Tool Registration', () => {
    beforeEach(async () => {
      await protocolHandler.initialize(mockServer);
    });

    it('should register a valid tool', () => {
      const tool: MCPTool = {
        name: 'test_tool',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
        },
        handler: async (params) => ({ result: 'success' }),
      };

      protocolHandler.registerTool(tool);

      expect(protocolHandler.hasTool('test_tool')).toBe(true);
      expect(protocolHandler.getTool('test_tool')).toEqual(tool);
    });

    it('should throw error when registering tool before initialization', () => {
      const handler = new ProtocolHandler();
      const tool: MCPTool = {
        name: 'test_tool',
        description: 'A test tool',
        inputSchema: { type: 'object' },
        handler: async () => ({}),
      };

      expect(() => handler.registerTool(tool)).toThrow(
        'ProtocolHandler not initialized'
      );
    });

    it('should throw error for invalid tool definition', () => {
      const invalidTool = {
        name: 'invalid_tool',
        // Missing description, inputSchema, handler
      } as any;

      expect(() => protocolHandler.registerTool(invalidTool)).toThrow(
        'Invalid tool definition'
      );
    });

    it('should overwrite existing tool with same name', () => {
      const tool1: MCPTool = {
        name: 'test_tool',
        description: 'First version',
        inputSchema: { type: 'object' },
        handler: async () => ({ version: 1 }),
      };

      const tool2: MCPTool = {
        name: 'test_tool',
        description: 'Second version',
        inputSchema: { type: 'object' },
        handler: async () => ({ version: 2 }),
      };

      protocolHandler.registerTool(tool1);
      protocolHandler.registerTool(tool2);

      const retrieved = protocolHandler.getTool('test_tool');
      expect(retrieved?.description).toBe('Second version');
    });

    it('should unregister a tool', () => {
      const tool: MCPTool = {
        name: 'test_tool',
        description: 'A test tool',
        inputSchema: { type: 'object' },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);
      const removed = protocolHandler.unregisterTool('test_tool');

      expect(removed).toBe(true);
      expect(protocolHandler.hasTool('test_tool')).toBe(false);
    });

    it('should return false when unregistering non-existent tool', () => {
      const removed = protocolHandler.unregisterTool('non_existent');
      expect(removed).toBe(false);
    });

    it('should get all registered tools', () => {
      const tool1: MCPTool = {
        name: 'tool1',
        description: 'Tool 1',
        inputSchema: { type: 'object' },
        handler: async () => ({}),
      };

      const tool2: MCPTool = {
        name: 'tool2',
        description: 'Tool 2',
        inputSchema: { type: 'object' },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool1);
      protocolHandler.registerTool(tool2);

      const tools = protocolHandler.getTools();
      expect(tools).toHaveLength(2);
      expect(tools.map((t) => t.name)).toContain('tool1');
      expect(tools.map((t) => t.name)).toContain('tool2');
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      await protocolHandler.initialize(mockServer);
    });

    it('should handle initialize request', async () => {
      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const initializeHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'initialize'
      )?.[1];

      if (initializeHandler) {
        const request = {
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'test-client', version: '1.0.0' },
          },
        };

        const response = await initializeHandler(request);

        expect(response).toHaveProperty('protocolVersion');
        expect(response).toHaveProperty('capabilities');
        expect(response).toHaveProperty('serverInfo');
        expect(response.serverInfo.name).toBeDefined();
        expect(response.serverInfo.version).toBeDefined();
      }
    });

    it('should handle initialized notification', async () => {
      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const initializedHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'notifications/initialized'
      )?.[1];

      if (initializedHandler) {
        const request = { params: {} };
        const response = await initializedHandler(request);

        expect(response).toEqual({ success: true });
      }
    });

    it('should handle tools/list request', async () => {
      const tool: MCPTool = {
        name: 'test_tool',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
        },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);

      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const toolsListHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'tools/list'
      )?.[1];

      if (toolsListHandler) {
        const request = { params: {} };
        const response = await toolsListHandler(request);

        expect(response).toHaveProperty('tools');
        expect(response.tools).toHaveLength(1);
        expect(response.tools[0].name).toBe('test_tool');
        expect(response.tools[0].description).toBe('A test tool');
        expect(response.tools[0].inputSchema).toBeDefined();
      }
    });

    it('should handle tools/call request successfully', async () => {
      const tool: MCPTool = {
        name: 'echo_tool',
        description: 'Echo tool',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
        handler: async (params) => ({ echo: params.message }),
      };

      protocolHandler.registerTool(tool);

      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const toolCallHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'tools/call'
      )?.[1];

      if (toolCallHandler) {
        const request = {
          params: {
            name: 'echo_tool',
            arguments: { message: 'hello' },
          },
        };

        const response = await toolCallHandler(request);

        expect(response).toHaveProperty('content');
        expect(response.content).toHaveLength(1);
        expect(response.content[0].type).toBe('text');
        const parsedResult = JSON.parse(response.content[0].text);
        expect(parsedResult.echo).toBe('hello');
      }
    });

    it('should throw error for tool call without name', async () => {
      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const toolCallHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'tools/call'
      )?.[1];

      if (toolCallHandler) {
        const request = {
          params: {
            arguments: { message: 'hello' },
          },
        };

        await expect(toolCallHandler(request)).rejects.toThrow(
          'Tool name is required'
        );
      }
    });

    it('should throw error for non-existent tool', async () => {
      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const toolCallHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'tools/call'
      )?.[1];

      if (toolCallHandler) {
        const request = {
          params: {
            name: 'non_existent_tool',
            arguments: {},
          },
        };

        await expect(toolCallHandler(request)).rejects.toThrow(
          'Tool not found: non_existent_tool'
        );
      }
    });

    it('should throw error for missing required parameters', async () => {
      const tool: MCPTool = {
        name: 'required_tool',
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

      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const toolCallHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'tools/call'
      )?.[1];

      if (toolCallHandler) {
        const request = {
          params: {
            name: 'required_tool',
            arguments: {},
          },
        };

        await expect(toolCallHandler(request)).rejects.toThrow(
          'Missing required parameter: required_param'
        );
      }
    });

    it('should validate parameter types', async () => {
      const tool: MCPTool = {
        name: 'typed_tool',
        description: 'Tool with typed params',
        inputSchema: {
          type: 'object',
          properties: {
            number_param: { type: 'number' },
            string_param: { type: 'string' },
            boolean_param: { type: 'boolean' },
          },
        },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);

      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const toolCallHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'tools/call'
      )?.[1];

      if (toolCallHandler) {
        const request = {
          params: {
            name: 'typed_tool',
            arguments: {
              number_param: 'not a number',
              string_param: 123,
              boolean_param: 'not a boolean',
            },
          },
        };

        await expect(toolCallHandler(request)).rejects.toThrow();
      }
    });

    it('should handle tool execution errors', async () => {
      const tool: MCPTool = {
        name: 'failing_tool',
        description: 'Tool that fails',
        inputSchema: { type: 'object' },
        handler: async () => {
          throw new Error('Tool execution failed');
        },
      };

      protocolHandler.registerTool(tool);

      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const toolCallHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'tools/call'
      )?.[1];

      if (toolCallHandler) {
        const request = {
          params: {
            name: 'failing_tool',
            arguments: {},
          },
        };

        await expect(toolCallHandler(request)).rejects.toThrow(
          'Tool execution failed'
        );
      }
    });
  });

  describe('Capability Negotiation', () => {
    beforeEach(async () => {
      await protocolHandler.initialize(mockServer);
    });

    it('should return server capabilities', () => {
      const capabilities = protocolHandler.getCapabilities();

      expect(capabilities).toHaveProperty('tools');
      expect(capabilities.tools).toHaveProperty('listChanged');
      expect(capabilities.tools.listChanged).toBe(true);
    });

    it('should validate client capabilities', async () => {
      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const initializeHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'initialize'
      )?.[1];

      if (initializeHandler) {
        const request = {
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              resources: { subscribe: true },
            },
          },
        };

        await expect(initializeHandler(request)).resolves.not.toThrow();
      }
    });

    it('should reject invalid client capabilities', async () => {
      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const initializeHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'initialize'
      )?.[1];

      if (initializeHandler) {
        const request = {
          params: {
            protocolVersion: '2024-11-05',
            capabilities: 'invalid' as any,
          },
        };

        await expect(initializeHandler(request)).rejects.toThrow(
          'Invalid client capabilities format'
        );
      }
    });
  });

  describe('Request/Response Lifecycle', () => {
    beforeEach(async () => {
      await protocolHandler.initialize(mockServer);
    });

    it('should track request count', async () => {
      const tool: MCPTool = {
        name: 'counter_tool',
        description: 'Tool for counting',
        inputSchema: { type: 'object' },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);

      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const toolCallHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'tools/call'
      )?.[1];

      if (toolCallHandler) {
        const request = {
          params: {
            name: 'counter_tool',
            arguments: {},
          },
        };

        await toolCallHandler(request);
        await toolCallHandler(request);
        await toolCallHandler(request);

        const stats = protocolHandler.getRequestStats();
        expect(stats.count).toBe(3);
      }
    });

    it('should return request statistics', async () => {
      const tool: MCPTool = {
        name: 'stats_tool',
        description: 'Tool for stats',
        inputSchema: { type: 'object' },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);

      const stats = protocolHandler.getRequestStats();

      expect(stats).toHaveProperty('count');
      expect(stats).toHaveProperty('toolCount');
      expect(stats.toolCount).toBe(1);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await protocolHandler.initialize(mockServer);
    });

    it('should handle tool handler errors gracefully', async () => {
      const tool: MCPTool = {
        name: 'error_tool',
        description: 'Tool that throws',
        inputSchema: { type: 'object' },
        handler: async () => {
          throw new Error('Intentional error');
        },
      };

      protocolHandler.registerTool(tool);

      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const toolCallHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'tools/call'
      )?.[1];

      if (toolCallHandler) {
        const request = {
          params: {
            name: 'error_tool',
            arguments: {},
          },
        };

        await expect(toolCallHandler(request)).rejects.toThrow(
          'Intentional error'
        );
      }
    });

    it('should validate array parameter type', async () => {
      const tool: MCPTool = {
        name: 'array_tool',
        description: 'Tool with array param',
        inputSchema: {
          type: 'object',
          properties: {
            items: { type: 'array' },
          },
        },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);

      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const toolCallHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'tools/call'
      )?.[1];

      if (toolCallHandler) {
        const request = {
          params: {
            name: 'array_tool',
            arguments: {
              items: 'not an array',
            },
          },
        };

        await expect(toolCallHandler(request)).rejects.toThrow(
          "Parameter 'items' must be an array"
        );
      }
    });

    it('should validate object parameter type', async () => {
      const tool: MCPTool = {
        name: 'object_tool',
        description: 'Tool with object param',
        inputSchema: {
          type: 'object',
          properties: {
            data: { type: 'object' },
          },
        },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);

      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const toolCallHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'tools/call'
      )?.[1];

      if (toolCallHandler) {
        const request = {
          params: {
            name: 'object_tool',
            arguments: {
              data: 'not an object',
            },
          },
        };

        await expect(toolCallHandler(request)).rejects.toThrow(
          "Parameter 'data' must be an object"
        );
      }
    });

    it('should validate integer parameter type', async () => {
      const tool: MCPTool = {
        name: 'integer_tool',
        description: 'Tool with integer param',
        inputSchema: {
          type: 'object',
          properties: {
            count: { type: 'integer' },
          },
        },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);

      const setRequestHandlerMock = mockServer.setRequestHandler as jest.Mock;
      const toolCallHandler = setRequestHandlerMock.mock.calls.find(
        (call) => call[0] === 'tools/call'
      )?.[1];

      if (toolCallHandler) {
        const request = {
          params: {
            name: 'integer_tool',
            arguments: {
              count: 3.14,
            },
          },
        };

        await expect(toolCallHandler(request)).rejects.toThrow(
          "Parameter 'count' must be an integer"
        );
      }
    });
  });

  describe('Streaming Responses', () => {
    beforeEach(async () => {
      await protocolHandler.initialize(mockServer);
    });

    it('should handle streaming responses', async () => {
      async function* streamGenerator(): AsyncIterable<any> {
        yield { chunk: 1 };
        yield { chunk: 2 };
        yield { chunk: 3 };
      }

      const stream =
        await protocolHandler.handleStreamingResponse(streamGenerator);

      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual({ chunk: 1 });
      expect(chunks[1]).toEqual({ chunk: 2 });
      expect(chunks[2]).toEqual({ chunk: 3 });
    });

    it('should throw error for streaming when not initialized', async () => {
      const handler = new ProtocolHandler();

      async function* streamGenerator(): AsyncIterable<any> {
        yield { chunk: 1 };
      }

      await expect(
        handler.handleStreamingResponse(streamGenerator)
      ).rejects.toThrow('ProtocolHandler not initialized');
    });
  });

  describe('State Management', () => {
    beforeEach(async () => {
      await protocolHandler.initialize(mockServer);
    });

    it('should reset handler state', () => {
      const tool: MCPTool = {
        name: 'test_tool',
        description: 'A test tool',
        inputSchema: { type: 'object' },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);
      expect(protocolHandler.hasTool('test_tool')).toBe(true);

      protocolHandler.reset();

      expect(protocolHandler.hasTool('test_tool')).toBe(false);
      expect(protocolHandler.getTools()).toHaveLength(0);
    });

    it('should check if handler is ready', () => {
      expect(protocolHandler.isReady()).toBe(true);

      const newHandler = new ProtocolHandler();
      expect(newHandler.isReady()).toBe(false);
    });
  });

  describe('Tool Discovery', () => {
    beforeEach(async () => {
      await protocolHandler.initialize(mockServer);
    });

    it('should discover all registered tools', async () => {
      const tools: MCPTool[] = [
        {
          name: 'tool1',
          description: 'First tool',
          inputSchema: { type: 'object' },
          handler: async () => ({}),
        },
        {
          name: 'tool2',
          description: 'Second tool',
          inputSchema: { type: 'object' },
          handler: async () => ({}),
        },
        {
          name: 'tool3',
          description: 'Third tool',
          inputSchema: { type: 'object' },
          handler: async () => ({}),
        },
      ];

      tools.forEach((tool) => protocolHandler.registerTool(tool));

      const discoveredTools = protocolHandler.getTools();

      expect(discoveredTools).toHaveLength(3);
      expect(
        discoveredTools.every((t) => t.name && t.description && t.inputSchema)
      ).toBe(true);
    });

    it('should find specific tool by name', async () => {
      const tool: MCPTool = {
        name: 'searchable_tool',
        description: 'A searchable tool',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
        },
        handler: async () => ({}),
      };

      protocolHandler.registerTool(tool);

      const found = protocolHandler.getTool('searchable_tool');

      expect(found).toBeDefined();
      expect(found?.name).toBe('searchable_tool');
      expect(found?.description).toBe('A searchable tool');
    });

    it('should return undefined for non-existent tool', () => {
      const found = protocolHandler.getTool('non_existent');
      expect(found).toBeUndefined();
    });
  });
});
