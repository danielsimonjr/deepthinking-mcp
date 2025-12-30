/**
 * Hybrid Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 */

import type { HybridThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { validateCommon } from '../validation-utils.js';

/**
 * Hybrid mode validator using composition pattern
 */
export class HybridValidator implements ModeValidator<HybridThought> {
  getMode(): string {
    return 'hybrid';
  }

  validate(thought: HybridThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation via utility function
    issues.push(...validateCommon(thought));

    // Hybrid mode is flexible - just common validation
    return issues;
  }
}
