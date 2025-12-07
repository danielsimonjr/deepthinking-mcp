/**
 * Shannon Mode Validator (v7.1.0)
 * Already using BaseValidator shared methods
 */

import { ShannonThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';

export class ShannonValidator extends BaseValidator<ShannonThought> {
  getMode(): string {
    return 'shannon';
  }

  validate(thought: ShannonThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate uncertainty is in range using shared method
    issues.push(...this.validateUncertainty(thought, thought.uncertainty));

    // Validate dependencies exist using shared method
    issues.push(...this.validateDependencies(thought, thought.dependencies, _context));

    // Warn if model stage has no assumptions
    if (thought.stage === 'model' && thought.assumptions.length === 0) {
      issues.push({
        severity: IssueSeverity.INFO,
        thoughtNumber: thought.thoughtNumber,
        description: 'Model stage typically includes explicit assumptions',
        suggestion: 'Consider listing key assumptions for the model',
        category: IssueCategory.STRUCTURAL,
      });
    }

    // Check uncertainty calibration
    if (thought.uncertainty < 0.1 && thought.assumptions.length > 3) {
      issues.push({
        severity: IssueSeverity.INFO,
        thoughtNumber: thought.thoughtNumber,
        description: 'High number of assumptions with low uncertainty',
        suggestion: 'Review if uncertainty should be higher given assumptions',
        category: IssueCategory.LOGICAL,
      });
    }

    return issues;
  }
}
