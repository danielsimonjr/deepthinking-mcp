/**
 * Visual Export Utilities (v4.3.0)
 * Sprint 8 Task 8.1: Shared utilities for visual exporters
 */

/**
 * Sanitize ID for use in diagram formats
 */
export function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

/**
 * Truncate a string to `maxLength`, counting the suffix against the budget.
 *
 * The one implementation. `truncateLabel` (mermaid), `truncateText` (svg),
 * `truncateDotLabel` (dot), `truncate` (markdown) and `truncateAscii` (ascii)
 * are all exported API and all delegate here; they differ only in their
 * default length. Five separate copies is how `escapeLatex` ended up with two
 * wrong ones - identical-looking code that nothing compared.
 *
 * `tests/unit/export/duplicate-implementations.test.ts` compares their output.
 */
export function truncateWithSuffix(
  text: string,
  maxLength: number,
  suffix: string = "...",
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}
