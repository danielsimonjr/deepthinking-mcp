/**
 * Visual Export Utilities (v4.3.0)
 * Sprint 8 Task 8.1: Shared utilities for visual exporters
 */

/**
 * Sanitize ID for use in diagram formats
 */
export function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}
