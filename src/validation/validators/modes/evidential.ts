/**
 * Evidential Mode Validator
 */

import { EvidentialThought, ValidationIssue, ValidationContext } from '../../../types/index.js';
import { BaseValidator } from '../base.js';

export class EvidentialValidator extends BaseValidator<EvidentialThought> {
  getMode(): string {
    return 'evidential';
  }

  validate(thought: EvidentialThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate frame of discernment
    if (thought.frameOfDiscernment && thought.frameOfDiscernment.length === 0) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Frame of discernment is empty',
        suggestion: 'Define the set of possible hypotheses',
        category: 'structural',
      });
    }

    // Validate belief masses sum to 1
    if (thought.beliefMasses) {
      let totalMass = 0;
      for (const mass of thought.beliefMasses) {
        if (mass.mass < 0 || mass.mass > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Belief mass for "${mass.hypothesis}" must be between 0 and 1`,
            suggestion: 'Provide mass as decimal',
            category: 'structural',
          });
        }
        totalMass += mass.mass;
      }

      const tolerance = 0.001;
      if (Math.abs(totalMass - 1.0) > tolerance) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Belief masses must sum to 1 (current sum: ${totalMass.toFixed(3)})`,
          suggestion: 'Ensure all belief masses sum to exactly 1.0',
          category: 'structural',
        });
      }
    }

    // Validate plausibility and belief functions
    if (thought.beliefFunction && thought.plausibilityFunction) {
      for (const key of Object.keys(thought.beliefFunction)) {
        const belief = thought.beliefFunction[key];
        const plausibility = thought.plausibilityFunction[key];

        if (belief > plausibility) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Belief cannot exceed plausibility for "${key}"`,
            suggestion: 'Ensure Bel(A) ≤ Pl(A) for all hypotheses',
            category: 'logical',
          });
        }
      }
    }

    return issues;
  }
}
