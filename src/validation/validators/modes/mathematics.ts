/**
 * Mathematics Mode Validator
 */

import { MathematicsThought, ValidationIssue } from '../../../types/index.js';
import { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class MathematicsValidator extends BaseValidator<MathematicsThought> {
  getMode(): string {
    return 'mathematics';
  }

  validate(thought: MathematicsThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Check proof strategy completeness
    if (thought.proofStrategy) {
      if (thought.proofStrategy.completeness < 0 || thought.proofStrategy.completeness > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Proof completeness must be between 0 and 1',
          suggestion: 'Provide completeness as decimal (e.g., 0.8 for 80% complete)',
          category: 'mathematical',
        });
      }

      if (thought.proofStrategy.type === 'induction' && !thought.proofStrategy.baseCase) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Induction proof should include base case',
          suggestion: 'Specify the base case for induction',
          category: 'mathematical',
        });
      }
    }

    // Validate mathematical model
    if (thought.mathematicalModel) {
      if (!thought.mathematicalModel.latex && !thought.mathematicalModel.symbolic) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Mathematical model should have LaTeX or symbolic representation',
          suggestion: 'Provide at least one representation format',
          category: 'mathematical',
        });
      }
    }

    // Check logical form
    if (thought.logicalForm) {
      if (thought.logicalForm.premises.length === 0) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: 'Logical form has no premises',
          suggestion: 'Consider adding premises for the logical argument',
          category: 'logical',
        });
      }
    }

    return issues;
  }
}
