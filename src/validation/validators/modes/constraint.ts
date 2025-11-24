/**
 * Constraint-Based Reasoning Mode Validator (v3.4.0)
 * Phase 4E Task 8.8: Validator for constraint-based reasoning mode
 *
 * Constraint-based reasoning involves defining and satisfying constraints
 */

import { Thought, ValidationIssue } from '../../../types/index.js';
import { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class ConstraintValidator extends BaseValidator<Thought> {
  getMode(): string {
    return 'constraint';
  }

  validate(thought: Thought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Check for constraint specification
    if ('constraints' in thought && Array.isArray(thought.constraints)) {
      if (thought.constraints.length === 0) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Constraint-based reasoning should define constraints',
          suggestion: 'Add constraints array with problem constraints',
          category: 'structural',
        });
      }

      // Validate constraint structure
      for (const constraint of thought.constraints as any[]) {
        if (!constraint.description && !constraint.type) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: 'Each constraint should have a description or type',
            suggestion: 'Provide clear constraint specifications',
            category: 'structural',
          });
        }
      }
    }

    // Check for constraint-related keywords
    const constraintKeywords = ['constraint', 'satisfy', 'violate', 'requirement', 'condition', 'limit'];
    const hasConstraintContent = constraintKeywords.some(keyword =>
      thought.content.toLowerCase().includes(keyword)
    );

    if (!hasConstraintContent) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Constraint-based reasoning typically discusses constraints explicitly',
        suggestion: 'Consider making explicit references to constraints being satisfied or violated',
        category: 'structural',
      });
    }

    // Check for solution validation
    if ('solution' in thought && thought.thoughtNumber > 1) {
      const hasSatisfaction = thought.content.toLowerCase().includes('satisf') ||
                             thought.content.toLowerCase().includes('meets') ||
                             thought.content.toLowerCase().includes('valid');

      if (!hasSatisfaction) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: 'Solution should be validated against constraints',
          suggestion: 'Verify that the solution satisfies all constraints',
          category: 'logical',
        });
      }
    }

    return issues;
  }
}
