/**
 * Custom error classes for DeepThinking MCP
 * Provides structured error handling with proper error codes and context
 *
 * STANDARDIZED ERROR FORMAT:
 * All errors extend DeepThinkingError and include:
 * - message: Human-readable error description
 * - code: Machine-readable error code (SCREAMING_SNAKE_CASE)
 * - context: Additional error context (sanitized, no PII)
 * - timestamp: When the error occurred
 * - stack: Stack trace for debugging
 *
 * USAGE GUIDELINES:
 * 1. Use specific error classes when available (e.g., SessionNotFoundError)
 * 2. Use ErrorFactory for common error patterns
 * 3. Never expose sensitive data in error messages or context
 * 4. Include relevant context for debugging (IDs, not content)
 * 5. Log errors with appropriate severity level
 *
 * ERROR CODE CONVENTIONS:
 * - SESSION_*: Session lifecycle errors
 * - VALIDATION_*: Input/data validation errors
 * - RESOURCE_*: Resource limits and availability
 * - SECURITY_*: Security and authentication errors
 * - RATE_LIMIT_*: Rate limiting errors
 * - EXPORT_*: Export and serialization errors
 */

/**
 * Base error class for all DeepThinking MCP errors
 */
export class DeepThinkingError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON for logging/serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Session-related errors
 */
export class SessionError extends DeepThinkingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'SESSION_ERROR', context);
  }
}

/**
 * Session not found error
 */
export class SessionNotFoundError extends DeepThinkingError {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`, 'SESSION_NOT_FOUND', { sessionId });
  }
}

/**
 * Session already exists error
 */
export class SessionAlreadyExistsError extends DeepThinkingError {
  constructor(sessionId: string) {
    super(`Session already exists: ${sessionId}`, 'SESSION_ALREADY_EXISTS', { sessionId });
  }
}

/**
 * Validation errors
 */
export class ValidationError extends DeepThinkingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
  }
}

/**
 * Input validation error
 */
export class InputValidationError extends DeepThinkingError {
  constructor(fieldName: string, reason: string, value?: unknown) {
    super(`Invalid ${fieldName}: ${reason}`, 'INPUT_VALIDATION_ERROR', {
      fieldName,
      reason,
      value: typeof value === 'object' ? '[object]' : value,
    });
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends DeepThinkingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', context);
  }
}

/**
 * Invalid mode error
 */
export class InvalidModeError extends DeepThinkingError {
  constructor(mode: string, validModes: string[]) {
    super(`Invalid thinking mode: ${mode}`, 'INVALID_MODE', { mode, validModes });
  }
}

/**
 * Thought processing errors
 */
export class ThoughtProcessingError extends DeepThinkingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'THOUGHT_PROCESSING_ERROR', context);
  }
}

/**
 * Export errors
 */
export class ExportError extends DeepThinkingError {
  constructor(message: string, format: string, context?: Record<string, unknown>) {
    super(message, 'EXPORT_ERROR', { ...context, format });
  }
}

/**
 * Resource limit errors
 */
export class ResourceLimitError extends DeepThinkingError {
  constructor(resource: string, limit: number, actual: number) {
    super(
      `Resource limit exceeded for ${resource}: ${actual} > ${limit}`,
      'RESOURCE_LIMIT_EXCEEDED',
      { resource, limit, actual }
    );
  }
}

/**
 * Error factory for creating appropriate error types
 */
export class ErrorFactory {
  static sessionNotFound(sessionId: string): SessionNotFoundError {
    return new SessionNotFoundError(sessionId);
  }

  static invalidInput(fieldName: string, reason: string, value?: unknown): InputValidationError {
    return new InputValidationError(fieldName, reason, value);
  }

  static invalidMode(mode: string, validModes: string[]): InvalidModeError {
    return new InvalidModeError(mode, validModes);
  }

  static resourceLimit(resource: string, limit: number, actual: number): ResourceLimitError {
    return new ResourceLimitError(resource, limit, actual);
  }

  static exportFailed(format: string, reason: string): ExportError {
    return new ExportError(`Export failed: ${reason}`, format);
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends DeepThinkingError {
  constructor(operation: string, limit?: number, windowMs?: number) {
    const message = limit
      ? `Rate limit exceeded for ${operation}: ${limit} requests per ${windowMs}ms`
      : `Rate limit exceeded for ${operation}`;

    super(message, 'RATE_LIMIT_EXCEEDED', { operation, limit, windowMs });
  }
}

/**
 * Security-related errors
 */
export class SecurityError extends DeepThinkingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'SECURITY_ERROR', context);
  }
}

/**
 * Path traversal security error
 */
export class PathTraversalError extends DeepThinkingError {
  constructor(attemptedPath: string) {
    super('Path traversal attempt detected', 'PATH_TRAVERSAL_DETECTED', { attemptedPath });
  }
}

/**
 * Storage and persistence errors
 */
export class StorageError extends DeepThinkingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'STORAGE_ERROR', context);
  }
}

/**
 * Backup operation errors
 */
export class BackupError extends DeepThinkingError {
  constructor(message: string, backupId?: string, context?: Record<string, unknown>) {
    super(message, 'BACKUP_ERROR', { ...context, backupId });
  }
}
