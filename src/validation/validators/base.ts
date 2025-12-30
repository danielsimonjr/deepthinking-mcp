/**
 * Mode Validator Interface (v9.0.0)
 * Phase 15A Sprint 3: Simplified to interface only
 *
 * The abstract BaseValidator class has been replaced with utility functions
 * in validation-utils.ts (composition over inheritance pattern).
 *
 * Validators now implement this interface directly and use utility functions.
 */

import type { Thought, ValidationIssue } from '../../types/index.js';
import type { ValidationContext } from '../constants.js';

/**
 * Interface for mode-specific validators
 */
export interface ModeValidator<T extends Thought = Thought> {
  /**
   * Validate a thought of this mode
   */
  validate(thought: T, context: ValidationContext): ValidationIssue[];

  /**
   * Get the mode this validator handles
   */
  getMode(): string;
}

/**
 * @deprecated Use utility functions from validation-utils.ts instead
 * BaseValidator is maintained for backwards compatibility only.
 * New validators should implement ModeValidator directly.
 */
export { ModeValidator as BaseValidator };
