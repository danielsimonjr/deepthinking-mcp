/**
 * Type guards for runtime type checking
 *
 * Provides safe type narrowing without using 'as any' assertions
 */

import { ExtendedThoughtType } from '../types/core.js';

/**
 * Valid ExtendedThoughtType values
 */
const VALID_THOUGHT_TYPES: readonly ExtendedThoughtType[] = [
  'problem_definition',
  'constraints',
  'model',
  'proof',
  'implementation',
  'axiom_definition',
  'theorem_statement',
  'proof_construction',
  'lemma_derivation',
  'corollary',
  'counterexample',
  'algebraic_manipulation',
  'symbolic_computation',
  'numerical_analysis',
  'symmetry_analysis',
  'gauge_theory',
  'field_equations',
  'lagrangian',
  'hamiltonian',
  'conservation_law',
  'dimensional_analysis',
  'tensor_formulation',
  'differential_geometry',
  'decomposition',
  'synthesis',
  'abstraction',
  'analogy',
  'metacognition',
] as const;

/**
 * Type guard for ExtendedThoughtType
 *
 * @param value - Value to check
 * @returns true if value is a valid ExtendedThoughtType
 */
export function isExtendedThoughtType(value: unknown): value is ExtendedThoughtType {
  return typeof value === 'string' && VALID_THOUGHT_TYPES.includes(value as ExtendedThoughtType);
}

/**
 * Validate and cast to ExtendedThoughtType
 *
 * @param value - Value to validate
 * @param fallback - Fallback value if invalid (optional)
 * @returns Validated ExtendedThoughtType
 * @throws Error if value is invalid and no fallback provided
 */
export function toExtendedThoughtType(
  value: unknown,
  fallback?: ExtendedThoughtType
): ExtendedThoughtType {
  if (isExtendedThoughtType(value)) {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(
    `Invalid ExtendedThoughtType: ${value}. Must be one of: ${VALID_THOUGHT_TYPES.join(', ')}`
  );
}

/**
 * Type guard for checking if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Type guard for checking if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for checking if value is an array
 */
export function isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) {
    return false;
  }

  if (itemGuard) {
    return value.every(itemGuard);
  }

  return true;
}

/**
 * Type guard for checking if value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Safe type cast with runtime validation
 *
 * @param value - Value to cast
 * @param guard - Type guard function
 * @param errorMessage - Error message if validation fails
 * @returns Validated value
 * @throws Error if validation fails
 */
export function safeCast<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  errorMessage: string
): T {
  if (guard(value)) {
    return value;
  }
  throw new Error(errorMessage);
}
