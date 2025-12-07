/**
 * Counterfactual Mode Validator (v7.1.0)
 * Refactored to use BaseValidator shared methods
 */

import { CounterfactualThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';

export class CounterfactualValidator extends BaseValidator<CounterfactualThought> {
  getMode(): string {
    return 'counterfactual';
  }

  validate(thought: CounterfactualThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Require actual scenario using shared method
    issues.push(...this.validateRequired(thought, thought.actual, 'Actual scenario', IssueCategory.STRUCTURAL));

    // Require at least one counterfactual scenario using shared method (ERROR severity)
    issues.push(
      ...this.validateNonEmptyArray(thought, thought.counterfactuals, 'counterfactual scenarios', IssueCategory.STRUCTURAL, IssueSeverity.ERROR)
    );

    // Require intervention point
    if (!thought.interventionPoint || !thought.interventionPoint.description) {
      issues.push({
        severity: IssueSeverity.ERROR,
        thoughtNumber: thought.thoughtNumber,
        description: 'Intervention point must be specified',
        suggestion: 'Specify where and how intervention could change the outcome',
        category: IssueCategory.STRUCTURAL,
      });
    } else {
      // Validate intervention point ranges using shared methods
      issues.push(
        ...this.validateProbability(thought, thought.interventionPoint.feasibility, 'Intervention point feasibility')
      );
      issues.push(
        ...this.validateProbability(thought, thought.interventionPoint.expectedImpact, 'Intervention point expectedImpact')
      );
    }

    // Validate scenario likelihood ranges using shared methods
    if (thought.actual) {
      issues.push(...this.validateProbability(thought, thought.actual.likelihood, 'Actual scenario likelihood'));
    }

    if (thought.counterfactuals) {
      for (const scenario of thought.counterfactuals) {
        issues.push(
          ...this.validateProbability(thought, scenario.likelihood, `Counterfactual scenario "${scenario.name}" likelihood`)
        );
        // Validate outcome magnitude
        if (scenario.outcomes) {
          for (const outcome of scenario.outcomes) {
            issues.push(
              ...this.validateProbability(
                thought,
                outcome.magnitude,
                `Counterfactual scenario "${scenario.name}" outcome magnitude`
              )
            );
          }
        }
      }
    }

    // Validate comparison differences
    if (thought.comparison && thought.comparison.differences) {
      for (const diff of thought.comparison.differences) {
        if (!diff.actual || !diff.counterfactual) {
          issues.push({
            severity: IssueSeverity.WARNING,
            thoughtNumber: thought.thoughtNumber,
            description: `Difference "${diff.aspect}" should reference both actual and counterfactual values`,
            suggestion: 'Provide both actual and counterfactual values for complete comparison',
            category: IssueCategory.STRUCTURAL,
          });
        }
      }
    }

    return issues;
  }
}
