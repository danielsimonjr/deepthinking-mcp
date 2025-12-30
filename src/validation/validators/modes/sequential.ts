/**
 * Sequential Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 */

import type { SequentialThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { validateCommon } from '../validation-utils.js';

/**
 * Sequential mode validator using composition pattern
 */
export class SequentialValidator implements ModeValidator<SequentialThought> {
  getMode(): string {
    return 'sequential';
  }

  validate(thought: SequentialThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation via utility function
    issues.push(...validateCommon(thought));

    // Check revision logic
    if (thought.isRevision && !thought.revisesThought) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Revision thought should specify which thought it revises',
        suggestion: 'Provide revisesThought ID',
        category: 'logical',
      });
    }

    if (thought.isRevision && _context.existingThoughts) {
      const revisedThought = _context.existingThoughts.get(thought.revisesThought || '');
      if (!revisedThought) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Cannot revise non-existent thought: ${thought.revisesThought}`,
          suggestion: 'Verify the thought ID being revised exists',
          category: 'logical',
        });
      }
    }

    return issues;
  }
}
