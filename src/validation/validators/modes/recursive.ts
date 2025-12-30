/**
 * Recursive Reasoning Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 *
 * Recursive reasoning involves breaking problems into smaller self-similar
 * subproblems and building solutions from base cases
 */

import type { Thought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { validateCommon } from '../validation-utils.js';

/**
 * Validator for recursive reasoning mode
 */
export class RecursiveValidator implements ModeValidator<Thought> {
  getMode(): string {
    return 'recursive';
  }

  validate(thought: Thought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

    // Check for base case definition (should appear early)
    if (thought.thoughtNumber <= 2) {
      const hasBaseCase = thought.content.toLowerCase().includes('base case') ||
                         thought.content.toLowerCase().includes('base condition') ||
                         thought.content.toLowerCase().includes('termination');

      if (!hasBaseCase) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Recursive reasoning should define base cases early',
          suggestion: 'Define base/termination cases before recursive steps',
          category: 'structural',
        });
      }
    }

    // Check for recursive structure
    const recursiveKeywords = [
      'recursive', 'recursion', 'self-similar', 'subproblem',
      'divide', 'conquer', 'smaller instance'
    ];

    const hasRecursiveContent = recursiveKeywords.some(keyword =>
      thought.content.toLowerCase().includes(keyword)
    );

    if (!hasRecursiveContent) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Recursive reasoning should make recursive structure explicit',
        suggestion: 'Describe how the problem breaks down into smaller instances',
        category: 'structural',
      });
    }

    // Check for dependencies (recursive steps should reference previous steps)
    if ('dependencies' in thought && Array.isArray(thought.dependencies)) {
      if (thought.thoughtNumber > 2 && thought.dependencies.length === 0) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Recursive steps should depend on previous subproblems or base cases',
          suggestion: 'Add dependencies to show how subproblems combine',
          category: 'structural',
        });
      }
    }

    // Check for combination/merging logic (after recursion)
    if (thought.thoughtNumber > 2) {
      const hasCombination = thought.content.toLowerCase().includes('combine') ||
                            thought.content.toLowerCase().includes('merge') ||
                            thought.content.toLowerCase().includes('build up');

      if (!hasCombination && thought.nextThoughtNeeded) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: 'Consider explaining how subproblem solutions combine',
          suggestion: 'Describe how to build the final solution from recursive calls',
          category: 'logical',
        });
      }
    }

    // Warn about potential infinite recursion
    if (thought.thoughtNumber > thought.totalThoughts * 0.8) {
      const hasTermination = thought.content.toLowerCase().includes('terminat') ||
                            thought.content.toLowerCase().includes('base') ||
                            thought.content.toLowerCase().includes('stop');

      if (!hasTermination && thought.nextThoughtNeeded) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Deep recursion detected - ensure termination conditions are met',
          suggestion: 'Verify that base cases are being reached',
          category: 'logical',
        });
      }
    }

    return issues;
  }
}
