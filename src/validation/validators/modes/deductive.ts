/**
 * Deductive Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 *
 * Validates deductive reasoning from general principles to specific conclusions
 */

import type { DeductiveThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { validateCommon } from '../validation-utils.js';

/**
 * Validator for deductive reasoning mode
 * Validates premises-to-conclusion reasoning patterns
 */
export class DeductiveValidator implements ModeValidator<DeductiveThought> {
  getMode(): string {
    return 'deductive';
  }

  validate(thought: DeductiveThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

    // At least one premise required
    if (!thought.premises || thought.premises.length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Deductive reasoning requires at least one premise',
        suggestion: 'Provide general principles or axioms to reason from',
        category: 'structural',
      });
    }

    // Conclusion is required
    if (!thought.conclusion || thought.conclusion.trim().length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Deductive reasoning requires a conclusion',
        suggestion: 'Provide the specific conclusion derived from premises',
        category: 'structural',
      });
    }

    // ValidityCheck is required
    if (thought.validityCheck === undefined || thought.validityCheck === null) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Validity check is required',
        suggestion: 'Indicate whether the deduction is logically valid',
        category: 'structural',
      });
    }

    // Warning if deduction is invalid
    if (thought.validityCheck === false) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Deduction marked as invalid',
        suggestion: 'Review logical structure - invalid deductions should be corrected',
        category: 'logical',
      });
    }

    // Warning if valid but unsound
    if (
      thought.validityCheck === true &&
      thought.soundnessCheck === false
    ) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Deduction is valid but unsound (false premises)',
        suggestion: 'Valid deduction with false premises does not guarantee true conclusion',
        category: 'logical',
      });
    }

    // Info about logic form if provided
    if (thought.logicForm) {
      const knownForms = [
        'modus ponens',
        'modus tollens',
        'hypothetical syllogism',
        'disjunctive syllogism',
        'constructive dilemma',
        'destructive dilemma',
      ];

      const isKnownForm = knownForms.some((form) =>
        thought.logicForm!.toLowerCase().includes(form)
      );

      if (isKnownForm) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: `Using recognized logic form: ${thought.logicForm}`,
          suggestion: 'Standard logical forms help verify validity',
          category: 'structural',
        });
      }
    }

    // Warning if too many premises (complexity)
    if (thought.premises && thought.premises.length > 5) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Large number of premises may indicate complexity',
        suggestion: 'Consider breaking into multiple simpler deductions',
        category: 'structural',
      });
    }

    return issues;
  }
}
