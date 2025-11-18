/**
 * Counterfactual Mode Validator
 */

import { CounterfactualThought, ValidationIssue, ValidationContext } from '../../../types/index.js';
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
        description: 'Actual scenario is required',
        suggestion: 'Provide the actual scenario that occurred',
        category: 'structural',
      });
    }

    // Require at least one counterfactual scenario
    if (!thought.counterfactuals || thought.counterfactuals.length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'At least one counterfactual scenario is required',
        suggestion: 'Provide at least one alternative scenario',
        category: 'structural',
      });
    }

    // Require intervention point
    if (!thought.interventionPoint) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Intervention point is required',
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

    // Validate scenario probability ranges
    if (thought.actual && thought.actual.probability !== undefined &&
        (thought.actual.probability < 0 || thought.actual.probability > 1)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Actual scenario probability must be between 0 and 1',
        suggestion: 'Provide probability as decimal',
        category: 'structural',
      });
    }

    if (thought.counterfactuals) {
      for (const scenario of thought.counterfactuals) {
        if (scenario.probability !== undefined &&
            (scenario.probability < 0 || scenario.probability > 1)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Counterfactual scenario "${scenario.name}" probability must be between 0 and 1`,
            suggestion: 'Provide probability as decimal',
            category: 'structural',
          });
        }
        // Validate outcome magnitude
        if (scenario.outcome && scenario.outcome.magnitude !== undefined &&
            (scenario.outcome.magnitude < 0 || scenario.outcome.magnitude > 1)) {
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

    return issues;
  }
}
