/**
 * Logger Interface (v3.4.5)
 * Sprint 3 Task 3.2: Dependency Injection
 *
 * Defines the contract for logging implementations, enabling:
 * - Dependency injection in classes
 * - Easy mocking in unit tests
 * - Swappable logging backends (console, file, remote)
 * - Type-safe logging throughout the application
 *
 * USAGE:
 * ```typescript
 * class MyService {
 *   constructor(private logger: ILogger) {}
 *
 *   doSomething() {
 *     this.logger.info('Operation started');
 *     this.logger.debug('Details', { key: 'value' });
 *   }
 * }
 * ```
 */

import type { LogLevel, LogEntry } from '../utils/logger-types.js';

/**
 * Logger interface for dependency injection
 *
 * Provides structured logging with multiple severity levels.
 * Implementations can output to console, files, or remote services.
 *
 * @example
 * ```typescript
 * // Production code with real logger
 * const logger: ILogger = createLogger({ minLevel: LogLevel.INFO });
 * const service = new MyService(logger);
 *
 * // Test code with mock logger
 * const mockLogger: ILogger = {
 *   debug: jest.fn(),
 *   info: jest.fn(),
 *   warn: jest.fn(),
 *   error: jest.fn(),
 *   getLogs: () => [],
 *   clearLogs: () => {},
 *   setLevel: () => {},
 *   exportLogs: () => '[]'
 * };
 * const service = new MyService(mockLogger);
 * ```
 */
export interface ILogger {
  /**
   * Log a debug message
   *
   * Used for detailed diagnostic information during development.
   * Typically disabled in production.
   *
   * @param message - The debug message
   * @param context - Optional context data
   *
   * @example
   * ```typescript
   * logger.debug('Processing started', { itemId: '123', count: 5 });
   * ```
   */
  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Log an informational message
   *
   * Used for general application events and milestones.
   *
   * @param message - The info message
   * @param context - Optional context data
   *
   * @example
   * ```typescript
   * logger.info('Session created', { sessionId: 'abc-123' });
   * ```
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Log a warning message
   *
   * Used for potentially harmful situations that don't prevent
   * the application from functioning.
   *
   * @param message - The warning message
   * @param context - Optional context data
   *
   * @example
   * ```typescript
   * logger.warn('Rate limit approaching', { current: 95, limit: 100 });
   * ```
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Log an error message
   *
   * Used for error conditions that require attention.
   *
   * @param message - The error message
   * @param error - Optional Error object
   * @param context - Optional context data
   *
   * @example
   * ```typescript
   * try {
   *   await riskyOperation();
   * } catch (error) {
   *   logger.error('Operation failed', error, { sessionId: '123' });
   * }
   * ```
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void;

  /**
   * Get all log entries, optionally filtered by minimum level
   *
   * @param minLevel - Optional minimum log level to filter by
   * @returns Array of log entries
   *
   * @example
   * ```typescript
   * const errors = logger.getLogs(LogLevel.ERROR);
   * console.log(`Found ${errors.length} errors`);
   * ```
   */
  getLogs(minLevel?: LogLevel): LogEntry[];

  /**
   * Clear all stored log entries
   *
   * Useful for resetting state between test cases.
   *
   * @example
   * ```typescript
   * logger.clearLogs();
   * ```
   */
  clearLogs(): void;

  /**
   * Set the minimum log level
   *
   * Messages below this level will be ignored.
   *
   * @param level - The minimum log level
   *
   * @example
   * ```typescript
   * logger.setLevel(LogLevel.WARN); // Only log warnings and errors
   * ```
   */
  setLevel(level: LogLevel): void;

  /**
   * Export all logs as JSON string
   *
   * Useful for persistence or sending logs to remote services.
   *
   * @returns JSON string containing all log entries
   *
   * @example
   * ```typescript
   * const logsJson = logger.exportLogs();
   * await fs.writeFile('logs.json', logsJson);
   * ```
   */
  exportLogs(): string;
}
