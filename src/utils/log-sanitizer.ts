/**
 * Log Sanitization Utilities (v3.4.5)
 * Sprint 2 Task 2.6: Remove sensitive data from logs
 *
 * Provides functions to sanitize log data before writing to files or stdout.
 * Prevents accidental exposure of PII and sensitive information in logs.
 *
 * PRIVACY COMPLIANCE:
 * - Redacts PII fields (author, email, phone, address, IP)
 * - Truncates long content to prevent log bloat
 * - Preserves debugging context (IDs, timestamps, status)
 * - Safe for production logging
 *
 * USAGE:
 * Always sanitize data before passing to logger:
 * ```typescript
 * logger.info('Session created', sanitizeForLogging({
 *   sessionId: session.id,
 *   author: session.author,  // Will be redacted
 *   title: session.title
 * }));
 * ```
 */

/**
 * Fields containing personally identifiable information (PII)
 * These fields will be redacted in logs
 */
const PII_FIELDS = [
  'author',
  'email',
  'phone',
  'phoneNumber',
  'address',
  'ip',
  'ipAddress',
  'username',
  'password',
  'token',
  'apiKey',
  'secret',
  'creditCard',
  'ssn',
  'taxId',
] as const;

/**
 * Fields containing sensitive content that should be truncated
 */
const TRUNCATE_FIELDS = [
  'thought',
  'content',
  'description',
  'summary',
  'notes',
  'message',
  'body',
] as const;

/**
 * Maximum length for truncated fields
 */
const MAX_CONTENT_LENGTH = 100;

/**
 * Redaction marker for PII fields
 */
const REDACTED = '[REDACTED]';

/**
 * Truncation suffix
 */
const TRUNCATED_SUFFIX = '...';

/**
 * Sanitizes an object for safe logging by:
 * - Redacting PII fields
 * - Truncating long content fields
 * - Preserving non-sensitive metadata
 *
 * @param data - The data object to sanitize
 * @returns Sanitized copy safe for logging
 *
 * @example
 * ```typescript
 * const logData = sanitizeForLogging({
 *   sessionId: '123',
 *   author: 'john@example.com',  // → '[REDACTED]'
 *   title: 'My Session',
 *   thought: 'Very long thought...' // → 'Very long thought...' (truncated)
 * });
 *
 * logger.info('Session created', logData);
 * // Output: { sessionId: '123', author: '[REDACTED]', title: 'My Session', ... }
 * ```
 */
export function sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    // Redact PII fields
    if (PII_FIELDS.some((piiField) => lowerKey.includes(piiField.toLowerCase()))) {
      sanitized[key] = REDACTED;
      continue;
    }

    // Truncate long content fields
    if (
      TRUNCATE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase())) &&
      typeof value === 'string' &&
      value.length > MAX_CONTENT_LENGTH
    ) {
      sanitized[key] = value.substring(0, MAX_CONTENT_LENGTH) + TRUNCATED_SUFFIX;
      continue;
    }

    // Recursively sanitize nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeForLogging(value as Record<string, unknown>);
      continue;
    }

    // Sanitize arrays by sanitizing each element
    if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        item && typeof item === 'object' && !Array.isArray(item)
          ? sanitizeForLogging(item as Record<string, unknown>)
          : item
      );
      continue;
    }

    // Pass through safe values
    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Sanitizes a session object for logging
 * Specialized sanitizer that preserves session metadata while removing PII
 *
 * @param session - Session object to sanitize
 * @returns Sanitized session safe for logging
 *
 * @example
 * ```typescript
 * logger.info('Session created', sanitizeSession({
 *   id: '123',
 *   title: 'Problem Solving',
 *   author: 'john@example.com',  // → '[REDACTED]'
 *   thoughts: [{ content: 'Long thought...' }]  // → truncated
 * }));
 * ```
 */
export function sanitizeSession(session: Record<string, unknown>): Record<string, unknown> {
  const sanitized = sanitizeForLogging(session);

  // Additionally truncate thoughts array for sessions with many thoughts
  if (Array.isArray(sanitized.thoughts) && sanitized.thoughts.length > 5) {
    sanitized.thoughts = [
      ...sanitized.thoughts.slice(0, 3),
      `... ${sanitized.thoughts.length - 3} more thoughts ...`,
    ];
  }

  return sanitized;
}

/**
 * Sanitizes an error object for logging
 * Preserves error message and stack trace while removing sensitive context
 *
 * @param error - Error object to sanitize
 * @returns Sanitized error safe for logging
 *
 * @example
 * ```typescript
 * try {
 *   // ... operation
 * } catch (error) {
 *   logger.error('Operation failed', sanitizeError(error));
 * }
 * ```
 */
export function sanitizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const sanitized: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    // Sanitize additional error properties
    if ('context' in error && typeof error.context === 'object' && error.context !== null) {
      sanitized.context = sanitizeForLogging(error.context as Record<string, unknown>);
    }

    return sanitized;
  }

  // For non-Error objects, sanitize as regular object
  if (typeof error === 'object' && error !== null) {
    return sanitizeForLogging(error as Record<string, unknown>);
  }

  // Primitive values
  return { error: String(error) };
}

/**
 * Sanitizes a batch of log entries
 * Useful for processing multiple log entries at once
 *
 * @param entries - Array of log entries to sanitize
 * @returns Array of sanitized log entries
 *
 * @example
 * ```typescript
 * const logBatch = sanitizeBatch([
 *   { event: 'session.created', data: session1 },
 *   { event: 'session.created', data: session2 },
 * ]);
 * logger.info('Batch operation', { entries: logBatch });
 * ```
 */
export function sanitizeBatch(
  entries: Array<Record<string, unknown>>
): Array<Record<string, unknown>> {
  return entries.map((entry) => sanitizeForLogging(entry));
}

/**
 * Creates a sanitized summary of an object
 * Removes all values, keeping only keys and types
 * Useful for logging structure without content
 *
 * @param data - Object to create summary from
 * @returns Structural summary
 *
 * @example
 * ```typescript
 * const summary = sanitizeSummary({
 *   sessionId: '123',
 *   author: 'john@example.com',
 *   thoughts: [1, 2, 3]
 * });
 * // Returns: { sessionId: 'string', author: 'string', thoughts: 'array[3]' }
 * ```
 */
export function sanitizeSummary(data: Record<string, unknown>): Record<string, string> {
  const summary: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null) {
      summary[key] = 'null';
    } else if (value === undefined) {
      summary[key] = 'undefined';
    } else if (Array.isArray(value)) {
      summary[key] = `array[${value.length}]`;
    } else if (typeof value === 'object') {
      summary[key] = 'object';
    } else {
      summary[key] = typeof value;
    }
  }

  return summary;
}
