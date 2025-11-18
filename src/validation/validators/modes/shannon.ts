/**
 * Shannon Mode Validator
 */

import { ShannonThought, ValidationIssue, ValidationContext } from '../../../types/index.js';
import { BaseValidator } from '../base.js';

export class ShannonValidator extends BaseValidator<ShannonThought> {
  getMode(): string {
    return 'shannon';
  }

  validate(thought: ShannonThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate uncertainty is in range
    issues.push(...this.validateUncertainty(thought, thought.uncertainty));

    // Validate dependencies exist
    issues.push(...this.validateDependencies(thought, thought.dependencies, context));

    // Warn if model stage has no assumptions
    if (thought.stage === 'model' && thought.assumptions.length === 0) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Model stage typically includes explicit assumptions',
        suggestion: 'Consider listing key assumptions for the model',
        category: 'structural',
      });
    }

    // Check uncertainty calibration
    if (thought.uncertainty < 0.1 && thought.assumptions.length > 3) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'High number of assumptions with low uncertainty',
        suggestion: 'Review if uncertainty should be higher given assumptions',
        category: 'logical',
      });
    }

    return issues;
  }
}
