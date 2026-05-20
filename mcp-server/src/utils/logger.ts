/**
 * Logging utility for the MCP server
 */

export interface LogMetadata {
  [key: string]: any;
}

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
};

class Logger {
  private currentLevel: LogLevel = 'info';

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(
    level: string,
    message: string,
    metadata?: LogMetadata
  ): string {
    const timestamp = this.formatTimestamp();
    const logLine = `[${timestamp}] [${level}] ${message}`;

    if (metadata && Object.keys(metadata).length > 0) {
      return `${logLine}\n${JSON.stringify(metadata, null, 2)}`;
    }

    return logLine;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.currentLevel];
  }

  setLevel(level: LogLevel): void {
    if (LOG_LEVELS[level] !== undefined) {
      this.currentLevel = level;
    }
  }

  getLevel(): LogLevel {
    return this.currentLevel;
  }

  info(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('INFO', message, metadata));
    }
  }

  warn(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('WARN', message, metadata));
    }
  }

  error(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('ERROR', message, metadata));
    }
  }

  debug(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('DEBUG', message, metadata));
    }
  }

  trace(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('trace')) {
      console.log(this.formatMessage('TRACE', message, metadata));
    }
  }
}

export const logger = new Logger();
