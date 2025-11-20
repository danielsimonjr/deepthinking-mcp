/**
 * Optimization Mode Validator (v3.4.0)
 * Phase 4E Task 8.8: Validator for optimization mode
 *
 * Optimization involves finding the best solution according to
 * an objective function subject to constraints
 */

import { Thought, ValidationIssue } from '../../../types/index.js';
import { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class OptimizationValidator extends BaseValidator<Thought> {
  getMode(): string {
    return 'optimization';
  }

  validate(thought: Thought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Check for objective function
    if ('objectiveFunction' in thought) {
      const objFunc = thought.objectiveFunction as any;

      if (typeof objFunc === 'object') {
        if (!objFunc.type || !objFunc.description) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: 'Objective function should have type (minimize/maximize) and description',
            suggestion: 'Specify objective type and what is being optimized',
            category: 'structural',
          });
        }

        if (objFunc.type && !['minimize', 'maximize'].includes(objFunc.type)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: 'Objective type must be "minimize" or "maximize"',
            suggestion: 'Use "minimize" or "maximize" for objective type',
            category: 'structural',
          });
        }
      }
    } else if (thought.thoughtNumber === 1) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Optimization should define an objective function',
        suggestion: 'Add objectiveFunction with type (minimize/maximize) and description',
        category: 'structural',
      });
    }

    // Check for optimization-related keywords
    const optimizationKeywords = [
      'optimize', 'optimal', 'minimize', 'maximize',
      'objective', 'best', 'improve', 'efficiency'
    ];

    const hasOptimizationContent = optimizationKeywords.some(keyword =>
      thought.thought.toLowerCase().includes(keyword)
    );

    if (!hasOptimizationContent) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Optimization reasoning should discuss optimization objectives',
        suggestion: 'Make explicit what is being optimized and why',
        category: 'structural',
      });
    }

    // Check for convergence or solution quality discussion
    if (thought.thoughtNumber > 2) {
      const hasQualityDiscussion = thought.thought.toLowerCase().includes('better') ||
                                   thought.thought.toLowerCase().includes('improved') ||
                                   thought.thought.toLowerCase().includes('converge');

      if (!hasQualityDiscussion) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: 'Consider discussing solution quality or improvement',
          suggestion: 'Explain how current solution compares to previous iterations',
          category: 'logical',
        });
      }
    }

    return issues;
  }
}
