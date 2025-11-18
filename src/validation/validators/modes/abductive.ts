/**
 * Abductive Mode Validator
 */

import { AbductiveThought, ValidationIssue, ValidationContext } from '../../../types/index.js';
import { BaseValidator } from '../base.js';

export class AbductiveValidator extends BaseValidator<AbductiveThought> {
  getMode(): string {
    return 'abductive';
  }

  validate(thought: AbductiveThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // At least one observation required
    if (!thought.observations || thought.observations.length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Abductive reasoning requires at least one observation',
        suggestion: 'Provide observations that need explanation',
        category: 'structural',
      });
    }

    // Validate observation confidence values
    if (thought.observations) {
      for (const obs of thought.observations) {
        if (obs.confidence < 0 || obs.confidence > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Observation "${obs.description}" has invalid confidence: ${obs.confidence}`,
            suggestion: 'Confidence must be between 0 and 1',
            category: 'structural',
          });
        }
      }
    }

    // Validate hypothesis uniqueness
    if (thought.hypotheses) {
      const hypothesisIds = new Set<string>();
      for (const hyp of thought.hypotheses) {
        if (hypothesisIds.has(hyp.id)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Duplicate hypothesis ID: ${hyp.id}`,
            suggestion: 'Each hypothesis must have a unique ID',
            category: 'logical',
          });
        }
        hypothesisIds.add(hyp.id);
      }
    }

    // Validate evaluation criteria
    if (thought.evaluationCriteria) {
      const { parsimony, explanatoryPower, plausibility } = thought.evaluationCriteria;

      if (parsimony < 0 || parsimony > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Parsimony score must be between 0 and 1',
          suggestion: 'Provide parsimony as decimal',
          category: 'structural',
        });
      }

      if (explanatoryPower < 0 || explanatoryPower > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Explanatory power must be between 0 and 1',
          suggestion: 'Provide explanatory power as decimal',
          category: 'structural',
        });
      }

      if (plausibility < 0 || plausibility > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Plausibility must be between 0 and 1',
          suggestion: 'Provide plausibility as decimal',
          category: 'structural',
        });
      }
    }

    // Validate best explanation references existing hypothesis
    if (thought.bestExplanation && thought.hypotheses) {
      const hypothesisIds = thought.hypotheses.map((h) => h.id);
      if (!hypothesisIds.includes(thought.bestExplanation.id)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Best explanation must be from the hypotheses list',
          suggestion: 'Ensure bestExplanation references an existing hypothesis',
          category: 'logical',
        });
      }
    }

    return issues;
  }
}
