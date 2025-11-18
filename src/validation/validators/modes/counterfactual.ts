/**
 * Counterfactual Mode Validator
 */

import { CounterfactualThought, ValidationIssue, ValidationContext } from '../../../types/index.js';
import { BaseValidator } from '../base.js';

export class CounterfactualValidator extends BaseValidator<CounterfactualThought> {
  getMode(): string {
    return 'counterfactual';
  }

  validate(thought: CounterfactualThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Actual world should be specified
    if (thought.actualWorld && !thought.actualWorld.description) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Actual world should have a description',
        suggestion: 'Provide clear description of the actual world state',
        category: 'structural',
      });
    }

    // Counterfactual world should be specified
    if (thought.counterfactualWorld && !thought.counterfactualWorld.description) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Counterfactual world should have a description',
        suggestion: 'Provide clear description of the counterfactual scenario',
        category: 'structural',
      });
    }

    // Validate intervention point exists
    if (thought.interventionPoint && !thought.interventionPoint.description) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Intervention point lacks description',
        suggestion: 'Describe what changes between actual and counterfactual',
        category: 'structural',
      });
    }

    return issues;
  }
}
