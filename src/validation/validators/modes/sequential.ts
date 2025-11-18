/**
 * Sequential Mode Validator
 */

import { SequentialThought, ValidationIssue, ValidationContext } from '../../../types/index.js';
import { BaseValidator } from '../base.js';

export class SequentialValidator extends BaseValidator<SequentialThought> {
  getMode(): string {
    return 'sequential';
  }

  validate(thought: SequentialThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

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

    if (thought.isRevision && context.existingThoughts) {
      const revisedThought = context.existingThoughts.get(thought.revisesThought || '');
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
