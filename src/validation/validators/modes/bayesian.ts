/**
 * Bayesian Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 */

import type { BayesianThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';
import { validateCommon, validateProbability, validateNumberRange } from '../validation-utils.js';

/**
 * Bayesian mode validator using composition pattern
 */
export class BayesianValidator implements ModeValidator<BayesianThought> {
  getMode(): string {
    return 'bayesian';
  }

  validate(thought: BayesianThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation via utility function
    issues.push(...validateCommon(thought));

    // Validate prior probability using utility function
    if (thought.prior !== undefined) {
      issues.push(...validateProbability(thought, thought.prior.probability, 'Prior probability'));
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
      issues.push(...validateProbability(thought, thought.posterior.probability, 'Posterior probability'));

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

    // Validate Bayes factor using utility function (non-negative)
    issues.push(
      ...validateNumberRange(
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
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: `Bayes factor ${thought.bayesFactor.toFixed(2)} > 1, evidence supports hypothesis`,
        suggestion: 'Evidence favors the hypothesis over the alternative',
        category: 'interpretation',
      });
    }

    // Provide info when Bayes factor < 1 (contradicts hypothesis)
    if (thought.bayesFactor !== undefined && thought.bayesFactor < 1 && thought.bayesFactor >= 0) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: `Bayes factor ${thought.bayesFactor.toFixed(2)} < 1, evidence contradicts hypothesis`,
        suggestion: 'Evidence favors the alternative over the hypothesis',
        category: 'interpretation',
      });
    }

    return issues;
  }
}
