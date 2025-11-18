/**
 * Bayesian Mode Validator
 */

import { BayesianThought, ValidationIssue, ValidationContext } from '../../../types/index.js';
import { BaseValidator } from '../base.js';

export class BayesianValidator extends BaseValidator<BayesianThought> {
  getMode(): string {
    return 'bayesian';
  }

  validate(thought: BayesianThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate prior probability
    if (thought.prior !== undefined && (thought.prior < 0 || thought.prior > 1)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Prior probability must be between 0 and 1',
        suggestion: 'Provide prior as decimal (e.g., 0.3 for 30%)',
        category: 'structural',
      });
    }

    // Validate likelihood
    if (thought.likelihood !== undefined && (thought.likelihood < 0 || thought.likelihood > 1)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Likelihood must be between 0 and 1',
        suggestion: 'Provide likelihood as decimal',
        category: 'structural',
      });
    }

    // Validate posterior probability
    if (thought.posterior !== undefined && (thought.posterior < 0 || thought.posterior > 1)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Posterior probability must be between 0 and 1',
        suggestion: 'Provide posterior as decimal',
        category: 'structural',
      });
    }

    // Validate evidence strengths
    if (thought.evidence) {
      for (const evidence of thought.evidence) {
        if (evidence.strength < 0 || evidence.strength > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Evidence "${evidence.description}" has invalid strength: ${evidence.strength}`,
            suggestion: 'Strength must be between 0 and 1',
            category: 'structural',
          });
        }
      }
    }

    return issues;
  }
}
