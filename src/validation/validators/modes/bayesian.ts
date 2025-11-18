/**
 * Bayesian Mode Validator
 */

import { BayesianThought, ValidationIssue, ValidationContext } from '../../../types/index.js';
import { BaseValidator } from '../base.js';

export class BayesianValidator extends BaseValidator<BayesianThought> {
  getMode(): string {
    return 'bayesian';
  }

  validate(thought: BayesianThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate prior probability
    if (thought.prior !== undefined) {
      if (thought.prior.probability < 0 || thought.prior.probability > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Prior probability must be between 0 and 1',
          suggestion: 'Provide prior as decimal (e.g., 0.3 for 30%)',
          category: 'structural',
        });
      }
    }

    // Validate likelihood
    if (thought.likelihood !== undefined) {
      if (thought.likelihood.probability < 0 || thought.likelihood.probability > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Likelihood probability must be between 0 and 1',
          suggestion: 'Provide likelihood as decimal',
          category: 'structural',
        });
      }
    }

    // Validate posterior probability
    if (thought.posterior !== undefined) {
      if (thought.posterior.probability < 0 || thought.posterior.probability > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Posterior probability must be between 0 and 1',
          suggestion: 'Provide posterior as decimal',
          category: 'structural',
        });
      }

      // Warn if posterior calculation is missing
      if (!thought.posterior.calculation || thought.posterior.calculation.trim() === '') {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Posterior calculation should be shown',
          suggestion: 'Provide calculation showing how posterior was derived',
          category: 'completeness',
        });
      }
    }

    // Validate evidence likelihoods
    if (thought.evidence) {
      for (const evidence of thought.evidence) {
        if (evidence.likelihoodGivenHypothesis < 0 || evidence.likelihoodGivenHypothesis > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Evidence "${evidence.description}" has invalid P(E|H): ${evidence.likelihoodGivenHypothesis}`,
            suggestion: 'Likelihood must be between 0 and 1',
            category: 'structural',
          });
        }
        if (evidence.likelihoodGivenNotHypothesis < 0 || evidence.likelihoodGivenNotHypothesis > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Evidence "${evidence.description}" has invalid P(E|¬H): ${evidence.likelihoodGivenNotHypothesis}`,
            suggestion: 'Likelihood must be between 0 and 1',
            category: 'structural',
          });
        }
      }
    }

    // Validate Bayes factor
    if (thought.bayesFactor !== undefined) {
      if (thought.bayesFactor < 0) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Bayes factor must be non-negative',
          suggestion: 'Bayes factor should be >= 0',
          category: 'structural',
        });
      }

      // Provide info when Bayes factor > 1 (supports hypothesis)
      if (thought.bayesFactor > 1) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: `Bayes factor ${thought.bayesFactor.toFixed(2)} > 1, evidence supports hypothesis`,
          suggestion: 'Evidence favors the hypothesis over the alternative',
          category: 'interpretation',
        });
      }

      // Provide info when Bayes factor < 1 (contradicts hypothesis)
      if (thought.bayesFactor < 1 && thought.bayesFactor >= 0) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: `Bayes factor ${thought.bayesFactor.toFixed(2)} < 1, evidence contradicts hypothesis`,
          suggestion: 'Evidence favors the alternative over the hypothesis',
          category: 'interpretation',
        });
      }
    }

    return issues;
  }
}
