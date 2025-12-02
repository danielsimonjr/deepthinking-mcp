/**
 * Stochastic Reasoning Mode Validator (v3.4.0)
 * Phase 4E Task 8.8: Validator for stochastic reasoning mode
 *
 * Stochastic reasoning involves random processes, probability distributions,
 * and uncertainty modeling
 */

import { Thought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class StochasticValidator extends BaseValidator<Thought> {
  getMode(): string {
    return 'stochastic';
  }

  validate(thought: Thought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Check for probability distributions
    if ('distribution' in thought) {
      const dist = thought.distribution as any;

      if (typeof dist === 'object') {
        if (!dist.type) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: 'Probability distribution should specify type',
            suggestion: 'Specify distribution type (e.g., normal, uniform, exponential)',
            category: 'structural',
          });
        }

        if (dist.parameters && typeof dist.parameters === 'object') {
          // Validate parameters based on distribution type
          if (dist.type === 'normal' && (!dist.parameters.mean || !dist.parameters.stddev)) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: 'Normal distribution requires mean and stddev parameters',
              suggestion: 'Add mean and stddev to distribution parameters',
              category: 'structural',
            });
          }
        }
      }
    }

    // Check for uncertainty quantification
    if ('uncertainty' in thought && typeof thought.uncertainty === 'number') {
      issues.push(...this.validateUncertainty(thought, thought.uncertainty));

      // Stochastic reasoning should typically have uncertainty
      if (thought.uncertainty === 0) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Stochastic reasoning usually involves non-zero uncertainty',
          suggestion: 'Consider quantifying the uncertainty in your stochastic process',
          category: 'logical',
        });
      }
    } else if (thought.thoughtNumber > 1) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Consider adding uncertainty quantification',
        suggestion: 'Stochastic reasoning benefits from explicit uncertainty measures',
        category: 'structural',
      });
    }

    // Check for stochastic-related keywords
    const stochasticKeywords = [
      'random', 'stochastic', 'probability', 'distribution',
      'variance', 'expected', 'sample', 'monte carlo'
    ];

    const hasStochasticContent = stochasticKeywords.some(keyword =>
      thought.content.toLowerCase().includes(keyword)
    );

    if (!hasStochasticContent) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Stochastic reasoning should discuss random processes or distributions',
        suggestion: 'Make explicit references to probability distributions or random variables',
        category: 'structural',
      });
    }

    return issues;
  }
}
