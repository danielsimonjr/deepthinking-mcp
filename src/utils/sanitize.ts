/**
 * File and Input Sanitization Utilities (v3.4.5)
 * Sprint 2 Task 2.4: Sanitize file operations for security
 *
 * Provides security-focused sanitization functions to prevent:
 * - Path traversal attacks
 * - Directory escape attempts
 * - Invalid filename characters
 * - Malformed UUIDs
 *
 * SECURITY NOTES:
 * - All file operations should use validatePath() before disk access
 * - Never trust user-provided paths without sanitization
 * - Session IDs must be validated before file operations
 * - Filenames should be sanitized to prevent OS-specific exploits
 */

import * as path from 'path';
import { PathTraversalError, InputValidationError } from './errors.js';

/**
 * UUID v4 validation regex
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * Where x is any hexadecimal digit and y is one of 8, 9, a, or b
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Sanitizes a filename by removing or replacing dangerous characters
 *
 * Security considerations:
 * - Removes path separators (/ and \)
 * - Removes parent directory references (..)
 * - Removes hidden file prefix (.)
 * - Allows only alphanumeric, dash, underscore, and period
 * - Prevents command injection via special characters
 *
 * @param filename - The filename to sanitize
 * @returns Sanitized filename safe for file operations
 *
 * @example
 * ```typescript
 * sanitizeFilename('../../../etc/passwd') // Returns '___etc_passwd'
 * sanitizeFilename('my file.txt') // Returns 'my_file.txt'
 * sanitizeFilename('test; rm -rf /') // Returns 'test__rm__rf__'
 * ```
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new InputValidationError('filename', 'Filename must be a non-empty string');
  }

  // Remove any path components
  const basename = path.basename(filename);

  // Replace dangerous characters with underscore
  // Allow: alphanumeric, dash, underscore, period
  const sanitized = basename.replace(/[^a-zA-Z0-9_.-]/g, '_');

  // Remove leading dots to prevent hidden files
  const noLeadingDots = sanitized.replace(/^\.+/, '');

  // Remove multiple consecutive underscores
  const cleaned = noLeadingDots.replace(/_+/g, '_');

  // Ensure result is not empty
  if (!cleaned) {
    throw new InputValidationError('filename', 'Filename cannot be empty after sanitization');
  }

  return cleaned;
}

/**
 * Validates that a path is within the allowed base directory
 *
 * Prevents path traversal attacks by ensuring the resolved path
 * stays within the base directory. Uses path.resolve() to normalize
 * paths and handle all forms of directory traversal.
 *
 * @param targetPath - The path to validate
 * @param baseDir - The base directory that targetPath must be within
 * @throws {PathTraversalError} If path escapes base directory
 *
 * @example
 * ```typescript
 * // Safe - path is within base directory
 * validatePath('/data/sessions/123.json', '/data')
 *
 * // THROWS PathTraversalError - path escapes base directory
 * validatePath('/data/../etc/passwd', '/data')
 * validatePath('../../secrets.txt', '/data/sessions')
 * ```
 */
export function validatePath(targetPath: string, baseDir: string): void {
  if (!targetPath || typeof targetPath !== 'string') {
    throw new InputValidationError('targetPath', 'Path must be a non-empty string');
  }

  if (!baseDir || typeof baseDir !== 'string') {
    throw new InputValidationError('baseDir', 'Base directory must be a non-empty string');
  }

  // Resolve both paths to absolute, normalized form
  const resolvedTarget = path.resolve(targetPath);
  const resolvedBase = path.resolve(baseDir);

  // Check if target path starts with base directory
  // Using path.relative() to handle edge cases across platforms
  const relative = path.relative(resolvedBase, resolvedTarget);

  // If relative path starts with '..' or is absolute, it's outside base dir
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new PathTraversalError(targetPath);
  }

  // Additional check: ensure resolved target actually starts with base
  if (!resolvedTarget.startsWith(resolvedBase)) {
    throw new PathTraversalError(targetPath);
  }
}

/**
 * Validates a session ID is a valid UUID v4
 *
 * UUID v4 format ensures:
 * - Consistent length (36 characters with hyphens)
 * - No path traversal attempts
 * - No special characters
 * - Version 4 (random) identifier
 *
 * @param id - The session ID to validate
 * @returns True if valid UUID v4, false otherwise
 *
 * @example
 * ```typescript
 * isValidSessionId('550e8400-e29b-41d4-a716-446655440000') // true
 * isValidSessionId('invalid-id') // false
 * isValidSessionId('../../../etc') // false
 * isValidSessionId('') // false
 * ```
 */
export function isValidSessionId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  return UUID_V4_REGEX.test(id);
}

/**
 * Validates and sanitizes a session ID for file operations
 *
 * Combines validation and sanitization for convenience.
 * Use this before constructing file paths from session IDs.
 *
 * @param id - The session ID to validate and sanitize
 * @returns The validated session ID (unchanged if valid)
 * @throws {InputValidationError} If session ID is invalid
 *
 * @example
 * ```typescript
 * const safeId = validateSessionId('550e8400-e29b-41d4-a716-446655440000')
 * const filePath = path.join(baseDir, `${safeId}.json`) // Safe to use
 * ```
 */
export function validateSessionId(id: string): string {
  if (!isValidSessionId(id)) {
    throw new InputValidationError(
      'sessionId',
      'Session ID must be a valid UUID v4 format',
      id
    );
  }

  return id;
}

/**
 * Safely constructs a file path within a base directory
 *
 * Convenience function that combines validation and path construction.
 * Ensures the resulting path is within the base directory.
 *
 * @param baseDir - The base directory
 * @param filename - The filename or relative path
 * @returns Validated absolute path
 * @throws {PathTraversalError} If resulting path is outside base directory
 *
 * @example
 * ```typescript
 * const safePath = safePathJoin('/data/sessions', '123.json')
 * // Returns: '/data/sessions/123.json'
 *
 * // THROWS: Path traversal attempt
 * safePathJoin('/data/sessions', '../../../etc/passwd')
 * ```
 */
export function safePathJoin(baseDir: string, filename: string): string {
  const sanitizedFilename = sanitizeFilename(filename);
  const fullPath = path.join(baseDir, sanitizedFilename);
  validatePath(fullPath, baseDir);
  return fullPath;
}

/**
 * Safely constructs a session file path
 *
 * Specialized function for session file paths that:
 * 1. Validates session ID is UUID v4
 * 2. Constructs path with .json extension
 * 3. Validates path is within base directory
 *
 * @param baseDir - The session storage directory
 * @param sessionId - The session ID (must be UUID v4)
 * @returns Validated absolute path to session file
 * @throws {InputValidationError} If session ID is invalid
 * @throws {PathTraversalError} If path is outside base directory
 *
 * @example
 * ```typescript
 * const sessionPath = safeSessionPath(
 *   '/data/sessions',
 *   '550e8400-e29b-41d4-a716-446655440000'
 * )
 * // Returns: '/data/sessions/550e8400-e29b-41d4-a716-446655440000.json'
 * ```
 */
export function safeSessionPath(baseDir: string, sessionId: string): string {
  const validatedId = validateSessionId(sessionId);
  const filename = `${validatedId}.json`;
  const fullPath = path.join(baseDir, filename);
  validatePath(fullPath, baseDir);
  return fullPath;
}
