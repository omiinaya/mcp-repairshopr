/**
 * Logging utility for the MCP server
 */

export interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: string, message: string, metadata?: LogMetadata): string {
    const timestamp = this.formatTimestamp();
    const logLine = `[${timestamp}] [${level}] ${message}`;
    
    if (metadata && Object.keys(metadata).length > 0) {
      return `${logLine}\n${JSON.stringify(metadata, null, 2)}`;
    }
    
    return logLine;
  }

  info(message: string, metadata?: LogMetadata): void {
    console.log(this.formatMessage('INFO', message, metadata));
  }

  warn(message: string, metadata?: LogMetadata): void {
    console.warn(this.formatMessage('WARN', message, metadata));
  }

  error(message: string, metadata?: LogMetadata): void {
    console.error(this.formatMessage('ERROR', message, metadata));
  }

  debug(message: string, metadata?: LogMetadata): void {
    console.debug(this.formatMessage('DEBUG', message, metadata));
  }
}

export const logger = new Logger();
