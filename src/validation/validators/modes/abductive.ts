/**
 * Abductive Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 *
 * Validates abductive reasoning (inference to best explanation)
 */

import type { AbductiveThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';
import { validateCommon, validateConfidence, validateProbability, validateNonEmptyArray } from '../validation-utils.js';

/**
 * Validator for abductive reasoning mode
 * Validates hypothesis generation from observations
 */
export class AbductiveValidator implements ModeValidator<AbductiveThought> {
  getMode(): string {
    return 'abductive';
  }

  validate(thought: AbductiveThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

    // At least one observation required using shared method (ERROR severity for required array)
    issues.push(
      ...validateNonEmptyArray(thought, thought.observations, 'observations', IssueCategory.STRUCTURAL, IssueSeverity.ERROR)
    );

    // Validate observation confidence values using shared method
    if (thought.observations) {
      for (const obs of thought.observations) {
        issues.push(
          ...validateConfidence(thought, obs.confidence, `Observation "${obs.description}" confidence`)
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

      issues.push(...validateProbability(thought, parsimony, 'Parsimony score'));
      issues.push(...validateProbability(thought, explanatoryPower, 'Explanatory power'));
      issues.push(...validateProbability(thought, plausibility, 'Plausibility'));
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
