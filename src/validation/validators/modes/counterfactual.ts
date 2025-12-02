/**
 * Counterfactual Mode Validator
 */

import { CounterfactualThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class CounterfactualValidator extends BaseValidator<CounterfactualThought> {
  getMode(): string {
    return 'counterfactual';
  }

  validate(thought: CounterfactualThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Require actual scenario
    if (!thought.actual) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Counterfactual reasoning requires an actual scenario',
        suggestion: 'Provide the actual scenario that occurred',
        category: 'structural',
      });
    }

    // Require at least one counterfactual scenario
    if (!thought.counterfactuals || thought.counterfactuals.length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'at least one counterfactual scenario is required',
        suggestion: 'Provide at least one alternative scenario',
        category: 'structural',
      });
    }

    // Require intervention point
    if (!thought.interventionPoint || !thought.interventionPoint.description) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Intervention point must be specified',
        suggestion: 'Specify where and how intervention could change the outcome',
        category: 'structural',
      });
    } else {
      // Validate intervention point ranges
      if (thought.interventionPoint.feasibility !== undefined &&
          (thought.interventionPoint.feasibility < 0 || thought.interventionPoint.feasibility > 1)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Intervention point feasibility must be between 0 and 1',
          suggestion: 'Provide feasibility as decimal',
          category: 'structural',
        });
      }
      if (thought.interventionPoint.expectedImpact !== undefined &&
          (thought.interventionPoint.expectedImpact < 0 || thought.interventionPoint.expectedImpact > 1)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Intervention point expectedImpact must be between 0 and 1',
          suggestion: 'Provide expectedImpact as decimal',
          category: 'structural',
        });
      }
    }

    // Validate scenario likelihood ranges
    if (thought.actual && thought.actual.likelihood !== undefined &&
        (thought.actual.likelihood < 0 || thought.actual.likelihood > 1)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Actual scenario has invalid likelihood',
        suggestion: 'Provide likelihood as decimal between 0 and 1',
        category: 'structural',
      });
    }

    if (thought.counterfactuals) {
      for (const scenario of thought.counterfactuals) {
        if (scenario.likelihood !== undefined &&
            (scenario.likelihood < 0 || scenario.likelihood > 1)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Counterfactual scenario "${scenario.name}" has invalid likelihood`,
            suggestion: 'Provide likelihood as decimal between 0 and 1',
            category: 'structural',
          });
        }
        // Validate outcome magnitude
        if (scenario.outcomes) {
          for (const outcome of scenario.outcomes) {
            if (outcome.magnitude !== undefined &&
                (outcome.magnitude < 0 || outcome.magnitude > 1)) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Counterfactual scenario "${scenario.name}" outcome magnitude must be between 0 and 1`,
                suggestion: 'Provide magnitude as decimal',
                category: 'structural',
              });
            }
          }
        }
      }
    }

    // Validate comparison differences
    if (thought.comparison && thought.comparison.differences) {
      for (const diff of thought.comparison.differences) {
        if (!diff.actual || !diff.counterfactual) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Difference "${diff.aspect}" should reference both actual and counterfactual values`,
            suggestion: 'Provide both actual and counterfactual values for complete comparison',
            category: 'structural',
          });
        }
      }
    }

    return issues;
  }
}
