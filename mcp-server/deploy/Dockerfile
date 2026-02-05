# Multi-stage Dockerfile for MCP RepairShopr Server
# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Ensure NODE_ENV doesn't affect npm install during build
ENV NODE_ENV=development

# Copy package files explicitly
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev) for build
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcpserver -u 1001

# Copy package files explicitly
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built files from builder stage
COPY --from=builder --chown=mcpserver:nodejs /app/dist ./dist
COPY --from=builder --chown=mcpserver:nodejs /app/config ./config
COPY --from=builder --chown=mcpserver:nodejs /app/data ./data

# Create necessary directories
RUN mkdir -p /app/logs /app/tmp && \
    chown -R mcpserver:nodejs /app/logs /app/tmp

# Switch to non-root user
USER mcpserver

# Expose port (Coolify will override with dynamic port)
EXPOSE 3000

# Health check - uses PORT environment variable for dynamic port support
# Using curl for more reliable health checks
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Set environment variables with defaults (Coolify will override)
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

# Start the server with graceful shutdown support
CMD ["sh", "-c", "echo 'Starting MCP RepairShopr Server...' && node dist/index.js"]
