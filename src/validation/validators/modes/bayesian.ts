/**
 * Bayesian Mode Validator (v7.1.0)
 * Refactored to use BaseValidator shared methods
 */

import { BayesianThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';

export class BayesianValidator extends BaseValidator<BayesianThought> {
  getMode(): string {
    return 'bayesian';
  }

  validate(thought: BayesianThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate prior probability using shared method
    if (thought.prior !== undefined) {
      issues.push(...this.validateProbability(thought, thought.prior.probability, 'Prior probability'));
    }

    // Validate likelihood using shared method
    if (thought.likelihood !== undefined) {
      issues.push(...this.validateProbability(thought, thought.likelihood.probability, 'Likelihood probability'));
    }

    // Validate posterior probability
    if (thought.posterior !== undefined) {
      issues.push(...this.validateProbability(thought, thought.posterior.probability, 'Posterior probability'));

      // Warn if posterior calculation is missing
      if (!thought.posterior.calculation || thought.posterior.calculation.trim() === '') {
        issues.push({
          severity: IssueSeverity.WARNING,
          thoughtNumber: thought.thoughtNumber,
          description: 'Posterior calculation should be shown',
          suggestion: 'Provide calculation showing how posterior was derived',
          category: IssueCategory.STRUCTURAL,
        });
      }
    }

    // Validate evidence likelihoods using shared method
    if (thought.evidence) {
      for (const evidence of thought.evidence) {
        issues.push(
          ...this.validateProbability(
            thought,
            evidence.likelihoodGivenHypothesis,
            `Evidence "${evidence.description}" P(E|H)`
          )
        );
        issues.push(
          ...this.validateProbability(
            thought,
            evidence.likelihoodGivenNotHypothesis,
            `Evidence "${evidence.description}" P(E|¬H)`
          )
        );
      }
    }

    // Validate Bayes factor using shared method (non-negative)
    issues.push(
      ...this.validateNumberRange(
        thought,
        thought.bayesFactor,
        'Bayes factor',
        0,
        Infinity,
        IssueSeverity.ERROR,
        IssueCategory.MATHEMATICAL
      )
    );

    // Provide info when Bayes factor > 1 (supports hypothesis)
    if (thought.bayesFactor !== undefined && thought.bayesFactor > 1) {
      issues.push({
        severity: IssueSeverity.INFO,
        thoughtNumber: thought.thoughtNumber,
        description: `Bayes factor ${thought.bayesFactor.toFixed(2)} > 1: evidence supports hypothesis`,
        suggestion: 'Evidence favors the hypothesis over the alternative',
        category: IssueCategory.LOGICAL,
      });
    }

    // Provide info when Bayes factor < 1 (contradicts hypothesis)
    if (thought.bayesFactor !== undefined && thought.bayesFactor < 1 && thought.bayesFactor >= 0) {
      issues.push({
        severity: IssueSeverity.INFO,
        thoughtNumber: thought.thoughtNumber,
        description: `Bayes factor ${thought.bayesFactor.toFixed(2)} < 1: evidence contradicts hypothesis`,
        suggestion: 'Evidence favors the alternative over the hypothesis',
        category: IssueCategory.LOGICAL,
      });
    }

    return issues;
  }
}
