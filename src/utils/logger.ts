/**
 * Logging utility for DeepThinking MCP
 * Provides structured logging with levels and context
 */

import { ILogger } from '../interfaces/ILogger.js';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableTimestamps: boolean;
  prettyPrint: boolean;
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  enableConsole: true,
  enableTimestamps: true,
  prettyPrint: true,
};

/**
 * Simple logger implementation
 */
export class Logger implements ILogger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    };

    this.logs.push(entry);

    if (this.config.enableConsole) {
      this.writeToConsole(entry);
    }
  }

  /**
   * Write log entry to console
   */
  private writeToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = this.config.enableTimestamps
      ? `[${entry.timestamp.toISOString()}] `
      : '';

    let message = `${timestamp}${levelName}: ${entry.message}`;

    if (entry.context && this.config.prettyPrint) {
      message += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.error) {
      message += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack && this.config.prettyPrint) {
        message += `\n  Stack: ${entry.error.stack}`;
      }
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
        console.error(message);
        break;
    }
  }

  /**
   * Get all log entries
   */
  getLogs(minLevel?: LogLevel): LogEntry[] {
    if (minLevel !== undefined) {
      return this.logs.filter(log => log.level >= minLevel);
    }
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs.map(log => ({
      ...log,
      level: LogLevel[log.level],
      timestamp: log.timestamp.toISOString(),
    })), null, 2);
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger();

/**
 * Create a logger instance with custom config
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}
