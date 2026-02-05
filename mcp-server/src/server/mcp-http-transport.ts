/**
 * MCP HTTP/SSE Transport Server
 * Allows remote MCP clients to connect via HTTP
 */

import http from 'http';
import { logger } from '../utils/logger';
import { server as mcpServer } from '../server';
import { rateLimiters } from '../middleware/rate-limiter';

export class MCPHTTPTransport {
  private server: http.Server | null = null;
  private port: number;
  private clients: Map<string, http.ServerResponse> = new Map();

  constructor(port: number = parseInt(process.env.MCP_HTTP_PORT || '3001', 10)) {
    this.port = port;
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(this.port, '0.0.0.0', () => {
        logger.info(`MCP HTTP transport started on port ${this.port}`);
        resolve();
      });

      this.server.on('error', (error) => {
        logger.error('MCP HTTP transport error', { error });
        reject(error);
      });
    });
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const path = url.pathname;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    // SSE endpoint for MCP
    if (path === '/mcp' && req.method === 'GET') {
      this.handleSSE(req, res);
      return;
    }

    // POST endpoint for messages
    if (path === '/mcp' && req.method === 'POST') {
      this.handleMessage(req, res);
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found' }));
  }

  private handleSSE(req: http.IncomingMessage, res: http.ServerResponse): void {
    const clientId = Math.random().toString(36).substring(7);
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    this.clients.set(clientId, res);
    logger.info(`MCP client connected: ${clientId}`);

    // Send initial endpoint message
    res.write(`data: ${JSON.stringify({ type: 'endpoint', clientId })}\n\n`);

    req.on('close', () => {
      this.clients.delete(clientId);
      logger.info(`MCP client disconnected: ${clientId}`);
    });
  }

  private async handleMessage(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const message = JSON.parse(body);
        logger.debug('MCP message received', { message });
        
        // Process message through MCP server
        // This is a simplified version - you'd integrate with your protocol handler
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'received', message }));
      } catch (error) {
        logger.error('Failed to process MCP message', { error });
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid message' }));
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      // Close all client connections
      this.clients.forEach((res) => {
        res.end();
      });
      this.clients.clear();

      this.server.close(() => {
        logger.info('MCP HTTP transport stopped');
        resolve();
      });
    });
  }
}

export const mcpHttpTransport = new MCPHTTPTransport();
