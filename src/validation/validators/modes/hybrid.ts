/**
 * Hybrid Mode Validator
 */

import { HybridThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class HybridValidator extends BaseValidator<HybridThought> {
  getMode(): string {
    return 'hybrid';
  }

  validate(thought: HybridThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Hybrid mode is flexible - just common validation
    return issues;
  }
}
