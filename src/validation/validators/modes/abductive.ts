/**
 * Abductive Mode Validator (v7.1.0)
 * Refactored to use BaseValidator shared methods
 */

import { AbductiveThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';

export class AbductiveValidator extends BaseValidator<AbductiveThought> {
  getMode(): string {
    return 'abductive';
  }

  validate(thought: AbductiveThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // At least one observation required using shared method (ERROR severity for required array)
    issues.push(
      ...this.validateNonEmptyArray(thought, thought.observations, 'observations', IssueCategory.STRUCTURAL, IssueSeverity.ERROR)
    );

    // Validate observation confidence values using shared method
    if (thought.observations) {
      for (const obs of thought.observations) {
        issues.push(
          ...this.validateConfidence(thought, obs.confidence, `Observation "${obs.description}" confidence`)
        );
      }
    }

    // Validate hypothesis uniqueness
    if (thought.hypotheses) {
      const hypothesisIds = new Set<string>();
      for (const hyp of thought.hypotheses) {
        if (hypothesisIds.has(hyp.id)) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Duplicate hypothesis ID: ${hyp.id}`,
            suggestion: 'Each hypothesis must have a unique ID',
            category: IssueCategory.LOGICAL,
          });
        }
        hypothesisIds.add(hyp.id);
      }
    }

    // Validate evaluation criteria using shared methods
    if (thought.evaluationCriteria) {
      const { parsimony, explanatoryPower, plausibility } = thought.evaluationCriteria;

      issues.push(...this.validateProbability(thought, parsimony, 'Parsimony score'));
      issues.push(...this.validateProbability(thought, explanatoryPower, 'Explanatory power'));
      issues.push(...this.validateProbability(thought, plausibility, 'Plausibility'));
    }

    // Validate best explanation references existing hypothesis
    if (thought.bestExplanation && thought.hypotheses) {
      const hypothesisIds = thought.hypotheses.map((h) => h.id);
      if (!hypothesisIds.includes(thought.bestExplanation.id)) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: 'Best explanation must be from the hypotheses list',
          suggestion: 'Ensure bestExplanation references an existing hypothesis',
          category: IssueCategory.LOGICAL,
        });
      }
    }

    return issues;
  }
}
