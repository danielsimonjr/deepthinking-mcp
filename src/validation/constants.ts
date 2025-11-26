/**
 * Validation Constants (v4.3.0)
 * Sprint 10: Centralized validation enums and constants
 * Eliminates ~300 hardcoded string literals across validators
 */

/**
 * Issue severity levels (matches ValidationIssue type)
 */
export const IssueSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type IssueSeverity = (typeof IssueSeverity)[keyof typeof IssueSeverity];

/**
 * Issue categories (matches ValidationIssue type)
 */
export const IssueCategory = {
  STRUCTURAL: 'structural',
  LOGICAL: 'logical',
  MATHEMATICAL: 'mathematical',
  PHYSICAL: 'physical',
} as const;

export type IssueCategory = (typeof IssueCategory)[keyof typeof IssueCategory];

/**
 * Common validation thresholds
 */
export const ValidationThresholds = {
  MIN_PROBABILITY: 0,
  MAX_PROBABILITY: 1,
  MIN_CONFIDENCE: 0,
  MAX_CONFIDENCE: 1,
  MIN_PROGRESS: 0,
  MAX_PROGRESS: 100,
  MIN_WEIGHT: 0,
  MAX_WEIGHT: 1,
} as const;

/**
 * Common validation messages
 */
export const ValidationMessages = {
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_RANGE: (field: string, min: number, max: number) => `${field} must be between ${min} and ${max}`,
  INVALID_TYPE: (field: string, expected: string) => `${field} must be of type ${expected}`,
  EMPTY_ARRAY: (field: string) => `${field} must not be empty`,
  MISSING_DEPENDENCY: (field: string, dependency: string) => `${field} requires ${dependency} to be defined`,
} as const;

/**
 * Range validation helper
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Probability validation (0-1)
 */
export function isValidProbability(value: number): boolean {
  return isInRange(value, ValidationThresholds.MIN_PROBABILITY, ValidationThresholds.MAX_PROBABILITY);
}

/**
 * Confidence validation (0-1)
 */
export function isValidConfidence(value: number): boolean {
  return isInRange(value, ValidationThresholds.MIN_CONFIDENCE, ValidationThresholds.MAX_CONFIDENCE);
}
