/**
 * Shannon Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 */

import type { ShannonThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';
import { validateCommon, validateUncertainty, validateDependencies } from '../validation-utils.js';

/**
 * Shannon mode validator using composition pattern
 */
export class ShannonValidator implements ModeValidator<ShannonThought> {
  getMode(): string {
    return 'shannon';
  }

  validate(thought: ShannonThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation via utility function
    issues.push(...validateCommon(thought));

    // Validate uncertainty is in range using utility function
    issues.push(...validateUncertainty(thought, thought.uncertainty));

    // Validate dependencies exist using utility function
    issues.push(...validateDependencies(thought, thought.dependencies, _context));

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
