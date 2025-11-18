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
        description: 'Must have at least one counterfactual scenario',
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
    } else if (!thought.interventionPoint.description || thought.interventionPoint.description.trim() === '') {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Intervention point must be specified',
        suggestion: 'Provide a description of the intervention point',
        category: 'structural',
      });
    }

    // Validate intervention point ranges
    if (thought.interventionPoint) {
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

    // Validate scenario probability and likelihood ranges
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

    // Validate comparison differences
    if (thought.comparison && thought.comparison.differences) {
      for (const diff of thought.comparison.differences) {
        if (!diff.actual || diff.actual.trim() === '' || !diff.counterfactual || diff.counterfactual.trim() === '') {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: 'Comparison differences should reference both actual and counterfactual scenarios',
            suggestion: 'Provide both actual and counterfactual values for meaningful comparison',
            category: 'completeness',
          });
        }
      }
    }

    return issues;
  }
}
