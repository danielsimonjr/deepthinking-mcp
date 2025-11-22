/**
 * Input sanitization utilities for DeepThinking MCP
 * Provides basic security and validation for user inputs
 */

/**
 * Maximum allowed lengths for string inputs
 */
export const MAX_LENGTHS = {
  THOUGHT_CONTENT: 100000, // 100KB for thought content
  TITLE: 500,
  DOMAIN: 200,
  AUTHOR: 300,
  SESSION_ID: 100,
  HYPOTHESIS: 5000,
  DESCRIPTION: 10000,
  STRING_FIELD: 1000,
};

/**
 * Sanitize and validate a string input
 * @param input - The string to sanitize
 * @param maxLength - Maximum allowed length (default: MAX_LENGTHS.STRING_FIELD)
 * @param fieldName - Name of the field for error messages
 * @returns Sanitized string
 * @throws Error if input is invalid
 */
export function sanitizeString(
  input: string,
  maxLength: number = MAX_LENGTHS.STRING_FIELD,
  fieldName: string = 'input'
): string {
  if (typeof input !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  // Trim whitespace
  const trimmed = input.trim();

  // Check length
  if (trimmed.length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }

  // Check for null bytes (potential injection)
  if (trimmed.includes('\0')) {
    throw new Error(`${fieldName} contains invalid null bytes`);
  }

  return trimmed;
}

/**
 * Sanitize an optional string input
 */
export function sanitizeOptionalString(
  input: string | undefined,
  maxLength: number = MAX_LENGTHS.STRING_FIELD,
  fieldName: string = 'input'
): string | undefined {
  if (input === undefined || input === null || input === '') {
    return undefined;
  }
  return sanitizeString(input, maxLength, fieldName);
}

/**
 * Validate a session ID (should be a valid UUID v4)
 */
export function validateSessionId(sessionId: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(sessionId)) {
    throw new Error(`Invalid session ID format: ${sessionId}`);
  }

  return sessionId;
}

/**
 * Sanitize numeric input and ensure it's within range
 */
export function sanitizeNumber(
  input: number,
  min: number = -Infinity,
  max: number = Infinity,
  fieldName: string = 'number'
): number {
  if (typeof input !== 'number' || isNaN(input)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  if (!isFinite(input)) {
    throw new Error(`${fieldName} must be a finite number`);
  }

  if (input < min || input > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }

  return input;
}

/**
 * Sanitize an array of strings
 */
export function sanitizeStringArray(
  input: string[],
  maxLength: number = MAX_LENGTHS.STRING_FIELD,
  maxItems: number = 1000,
  fieldName: string = 'array'
): string[] {
  if (!Array.isArray(input)) {
    throw new Error(`${fieldName} must be an array`);
  }

  if (input.length > maxItems) {
    throw new Error(`${fieldName} exceeds maximum of ${maxItems} items`);
  }

  return input.map((item, index) =>
    sanitizeString(item, maxLength, `${fieldName}[${index}]`)
  );
}

/**
 * Sanitize thought content (allows larger size)
 */
export function sanitizeThoughtContent(content: string): string {
  return sanitizeString(content, MAX_LENGTHS.THOUGHT_CONTENT, 'thought content');
}

/**
 * Sanitize session title
 */
export function sanitizeTitle(title: string | undefined): string {
  if (!title) {
    return 'Untitled Session';
  }
  return sanitizeString(title, MAX_LENGTHS.TITLE, 'title');
}

/**
 * Sanitize domain name
 */
export function sanitizeDomain(domain: string | undefined): string | undefined {
  return sanitizeOptionalString(domain, MAX_LENGTHS.DOMAIN, 'domain');
}

/**
 * Sanitize author name
 */
export function sanitizeAuthor(author: string | undefined): string | undefined {
  return sanitizeOptionalString(author, MAX_LENGTHS.AUTHOR, 'author');
}

/**
 * Escape HTML special characters to prevent XSS
 * @param text - Text to escape
 * @returns HTML-safe string
 */
export function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Escape LaTeX special characters to prevent injection
 * @param text - Text to escape
 * @returns LaTeX-safe string
 */
export function escapeLatex(text: string): string {
  const latexEscapeMap: Record<string, string> = {
    '\\': '\\textbackslash{}',
    '{': '\\{',
    '}': '\\}',
    '$': '\\$',
    '&': '\\&',
    '%': '\\%',
    '#': '\\#',
    '_': '\\_',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}',
  };

  return text.replace(/[\\{}$&%#_~^]/g, (char) => latexEscapeMap[char] || char);
}
