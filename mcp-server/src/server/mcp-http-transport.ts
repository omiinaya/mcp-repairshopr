/**
 * MCP HTTP/SSE Transport Server
 * Implements the Model Context Protocol over HTTP with Server-Sent Events
 *
 * Protocol Flow:
 * 1. Client makes GET request to /mcp to establish SSE connection
 * 2. Server sends endpoint URL via SSE (session ID in URL)
 * 3. Client POSTs JSON-RPC messages to /mcp?sessionId=xxx
 * 4. Server responds via SSE stream
 */

import http from 'http';
import { URL } from 'url';
import { logger } from '../utils/logger';
import { server as mcpServer } from '../server';
import { rateLimiters } from '../middleware/rate-limiter';

interface MCPClient {
  id: string;
  response: http.ServerResponse;
  initialized: boolean;
  lastActivity: number;
}

interface JSONRPCMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class MCPHTTPTransport {
  private server: http.Server | null = null;
  private port: number;
  private clients: Map<string, MCPClient> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    port: number = parseInt(process.env.MCP_HTTP_PORT || '6001', 10)
  ) {
    this.port = port;
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res).catch((error) => {
          logger.error('Request handler error', { error });
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal server error' }));
        });
      });

      this.server.listen(this.port, '0.0.0.0', () => {
        logger.info(`MCP HTTP transport started on port ${this.port}`);
        logger.info(
          `MCP endpoint available at: http://0.0.0.0:${this.port}/mcp`
        );
        this.startCleanupInterval();
        resolve();
      });

      this.server.on('error', (error) => {
        logger.error('MCP HTTP transport error', { error });
        reject(error);
      });
    });
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method || 'GET';

    // Enable CORS for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Accept, Mcp-Session-Id'
    );
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');

    if (method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    // Rate limiting for MCP endpoints
    if (path === '/mcp') {
      const rateLimitResult = rateLimiters.general.isAllowed(
        req.socket.remoteAddress || 'unknown'
      );
      res.setHeader(
        'X-RateLimit-Limit',
        rateLimiters.general.getStats().maxRequests
      );
      res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);

      if (!rateLimitResult.allowed) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Rate limit exceeded',
            },
          })
        );
        return;
      }
    }

    // Handle SSE endpoint (GET /mcp)
    if (path === '/mcp' && method === 'GET') {
      await this.handleSSE(req, res, url);
      return;
    }

    // Handle message posting (POST /mcp or POST /mcp?sessionId=xxx)
    if (path === '/mcp' && method === 'POST') {
      await this.handleMessage(req, res, url);
      return;
    }

    // Handle session deletion (DELETE /mcp?sessionId=xxx)
    if (path === '/mcp' && method === 'DELETE') {
      await this.handleDeleteSession(req, res, url);
      return;
    }

    // 404 for unknown paths
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found',
          data: { path, method },
        },
      })
    );
  }

  private async handleSSE(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    url: URL
  ): Promise<void> {
    // Check for Last-Event-ID header (for reconnection)
    const lastEventId = req.headers['last-event-id'] as string;

    // Generate or restore session ID
    const sessionId = lastEventId || this.generateSessionId();

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Mcp-Session-Id': sessionId,
    });

    // Store client
    const client: MCPClient = {
      id: sessionId,
      response: res,
      initialized: false,
      lastActivity: Date.now(),
    };
    this.clients.set(sessionId, client);

    logger.info(`MCP client connected: ${sessionId}`, {
      remoteAddress: req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      restored: !!lastEventId,
    });

    // Send endpoint event with session ID
    this.sendSSEEvent(client, 'endpoint', {
      uri: `/mcp?sessionId=${sessionId}`,
    });

    // Handle client disconnect
    req.on('close', () => {
      logger.info(`MCP client disconnected: ${sessionId}`);
      this.clients.delete(sessionId);
    });

    // Handle errors
    req.on('error', (error) => {
      logger.error(`MCP client error: ${sessionId}`, { error });
      this.clients.delete(sessionId);
    });

    // Keep connection alive with periodic newlines
    const keepAlive = setInterval(() => {
      if (this.clients.has(sessionId)) {
        res.write('\n');
      } else {
        clearInterval(keepAlive);
      }
    }, 30000);

    // Clean up on response close
    res.on('close', () => {
      clearInterval(keepAlive);
      this.clients.delete(sessionId);
    });
  }

  private async handleMessage(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    url: URL
  ): Promise<void> {
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Invalid Request: sessionId required',
          },
        })
      );
      return;
    }

    const client = this.clients.get(sessionId);
    if (!client) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Session not found',
          },
        })
      );
      return;
    }

    // Read request body
    const body = await this.readBody(req);

    try {
      const message: JSONRPCMessage = JSON.parse(body);
      logger.debug('MCP message received', {
        sessionId,
        method: message.method,
      });

      // Update activity timestamp
      client.lastActivity = Date.now();

      // Process the message
      const response = await this.processMessage(message, client);

      // Send response via SSE if it has an ID (not a notification)
      if (message.id !== undefined && response) {
        this.sendSSEEvent(client, 'message', response);
      }

      // Return 202 Accepted for successful processing
      res.statusCode = 202;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          result: 'accepted',
        })
      );
    } catch (error) {
      logger.error('Failed to process MCP message', { sessionId, error });

      // Send error via SSE
      if (client) {
        this.sendSSEEvent(client, 'error', {
          code: -32700,
          message: 'Parse error',
          data: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32700,
            message: 'Parse error',
          },
        })
      );
    }
  }

  private async handleDeleteSession(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    url: URL
  ): Promise<void> {
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'sessionId required' }));
      return;
    }

    const client = this.clients.get(sessionId);
    if (client) {
      this.sendSSEEvent(client, 'error', {
        code: -32000,
        message: 'Session terminated by client',
      });
      client.response.end();
      this.clients.delete(sessionId);
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'terminated' }));
  }

  private async processMessage(
    message: JSONRPCMessage,
    client: MCPClient
  ): Promise<JSONRPCMessage | null> {
    const { method, params, id } = message;

    // Handle initialize
    if (method === 'initialize') {
      client.initialized = true;
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: true },
            resources: { subscribe: true, listChanged: true },
            prompts: { listChanged: true },
            logging: {},
            experimental: {},
          },
          serverInfo: {
            name: mcpServer.getConfig().serverName,
            version: mcpServer.getConfig().serverVersion,
          },
        },
      };
    }

    // Handle initialized notification
    if (method === 'notifications/initialized') {
      logger.info('Client initialized notification received');
      return null; // No response for notifications
    }

    // Handle tools/list
    if (method === 'tools/list') {
      const tools = mcpServer.getTools().map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));

      return {
        jsonrpc: '2.0',
        id,
        result: { tools },
      };
    }

    // Handle tools/call
    if (method === 'tools/call') {
      try {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};

        const tool = mcpServer.getTools().find((t) => t.name === toolName);
        if (!tool) {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Tool not found: ${toolName}`,
            },
          };
        }

        const result = await tool.handler(toolArgs);

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          },
        };
      } catch (error) {
        logger.error('Tool call failed', { method, params, error });
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32603,
            message:
              error instanceof Error ? error.message : 'Tool execution failed',
            data: error,
          },
        };
      }
    }

    // Unknown method
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`,
      },
    };
  }

  private sendSSEEvent(client: MCPClient, event: string, data: any): void {
    try {
      const message = JSON.stringify(data);
      client.response.write(`event: ${event}\n`);
      client.response.write(`id: ${client.id}\n`);
      client.response.write(`data: ${message}\n\n`);
    } catch (error) {
      logger.error(`Failed to send SSE event to ${client.id}`, { error });
      this.clients.delete(client.id);
    }
  }

  private readBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => resolve(body));
      req.on('error', reject);
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private startCleanupInterval(): void {
    // Clean up stale sessions every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        const now = Date.now();
        const staleTimeout = 10 * 60 * 1000; // 10 minutes

        for (const [sessionId, client] of this.clients.entries()) {
          if (now - client.lastActivity > staleTimeout) {
            logger.info(`Cleaning up stale session: ${sessionId}`);
            client.response.end();
            this.clients.delete(sessionId);
          }
        }
      },
      5 * 60 * 1000
    );
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      // Close all client connections
      this.clients.forEach((client) => {
        try {
          this.sendSSEEvent(client, 'error', {
            code: -32000,
            message: 'Server shutting down',
          });
          client.response.end();
        } catch (error) {
          // Ignore errors during shutdown
        }
      });
      this.clients.clear();

      if (!this.server) {
        resolve();
        return;
      }

      this.server.close(() => {
        logger.info('MCP HTTP transport stopped');
        resolve();
      });
    });
  }

  getStats(): { clients: number; port: number } {
    return {
      clients: this.clients.size,
      port: this.port,
    };
  }
}

export const mcpHttpTransport = new MCPHTTPTransport();
