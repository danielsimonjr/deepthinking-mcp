/**
 * Evidential Mode Validator (v7.1.0)
 * Refactored to use BaseValidator shared methods
 */

import { EvidentialThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';

export class EvidentialValidator extends BaseValidator<EvidentialThought> {
  getMode(): string {
    return 'evidential';
  }

  validate(thought: EvidentialThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Collect hypothesis IDs
    const hypothesisIds = new Set(thought.hypotheses?.map(h => h.id) || []);

    // Validate hypotheses
    if (thought.hypotheses) {
      for (const hypothesis of thought.hypotheses) {
        // Validate subset references
        if (hypothesis.subsets) {
          for (const subset of hypothesis.subsets) {
            if (!hypothesisIds.has(subset)) {
              issues.push({
                severity: IssueSeverity.ERROR,
                thoughtNumber: thought.thoughtNumber,
                description: `Hypothesis "${hypothesis.name}" references unknown subset: ${subset}`,
                suggestion: 'Ensure subsets reference existing hypotheses',
                category: IssueCategory.STRUCTURAL,
              });
            }
          }
        }
      }
    }

    // Validate evidence
    if (thought.evidence) {
      for (const evidence of thought.evidence) {
        // Validate reliability range using shared method
        issues.push(
          ...this.validateProbability(thought, evidence.reliability, `Evidence "${evidence.description}" reliability`)
        );

        // Validate evidence supports existing hypotheses
        if (evidence.supports) {
          for (const hypothesisId of evidence.supports) {
            if (!hypothesisIds.has(hypothesisId)) {
              issues.push({
                severity: IssueSeverity.ERROR,
                thoughtNumber: thought.thoughtNumber,
                description: `Evidence "${evidence.description}" supports unknown hypothesis: ${hypothesisId}`,
                suggestion: 'Ensure evidence references existing hypotheses',
                category: IssueCategory.STRUCTURAL,
              });
            }
          }
        }
      }
    }

    // Validate belief functions
    if (thought.beliefFunctions) {
      for (const beliefFunction of thought.beliefFunctions) {
        let totalMass = 0;

        for (const assignment of beliefFunction.massAssignments) {
          // Validate mass range using shared method
          issues.push(
            ...this.validateProbability(thought, assignment.mass, `Belief function "${beliefFunction.id}" mass`)
          );

          // Validate hypothesis set not empty using shared method (ERROR severity)
          issues.push(
            ...this.validateNonEmptyArray(
              thought,
              assignment.hypothesisSet,
              `Belief function "${beliefFunction.id}" hypothesis set`,
              IssueCategory.STRUCTURAL,
              IssueSeverity.ERROR
            )
          );

          totalMass += assignment.mass;
        }

        // Validate masses sum to 1
        const tolerance = 0.001;
        if (Math.abs(totalMass - 1.0) > tolerance) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Belief function "${beliefFunction.id}" mass assignments must sum to 1.0 (current: ${totalMass.toFixed(3)})`,
            suggestion: 'Ensure all mass assignments sum to exactly 1.0',
            category: IssueCategory.MATHEMATICAL,
          });
        }
      }
    }

    // Validate plausibility
    if (thought.plausibility) {
      for (const assignment of thought.plausibility.assignments) {
        // Validate belief does not exceed plausibility
        if (assignment.belief > assignment.plausibility) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Belief ${assignment.belief} cannot exceed plausibility ${assignment.plausibility}`,
            suggestion: 'Ensure Bel(A) ≤ Pl(A) for all hypotheses',
            category: IssueCategory.LOGICAL,
          });
        }

        // Validate uncertainty interval matches belief and plausibility
        if (assignment.uncertaintyInterval) {
          const [lower, upper] = assignment.uncertaintyInterval;
          if (Math.abs(lower - assignment.belief) > 0.001 ||
              Math.abs(upper - assignment.plausibility) > 0.001) {
            issues.push({
              severity: IssueSeverity.ERROR,
              thoughtNumber: thought.thoughtNumber,
              description: `Uncertainty interval [${lower}, ${upper}] does not match [belief, plausibility] [${assignment.belief}, ${assignment.plausibility}]`,
              suggestion: 'Ensure uncertainty interval is [belief, plausibility]',
              category: IssueCategory.STRUCTURAL,
            });
          }
        }
      }
    }

    // Validate decisions
    if (thought.decisions) {
      for (const decision of thought.decisions) {
        // Validate selected hypotheses exist
        if (decision.selectedHypothesis) {
          for (const hypothesisId of decision.selectedHypothesis) {
            if (!hypothesisIds.has(hypothesisId)) {
              issues.push({
                severity: IssueSeverity.ERROR,
                thoughtNumber: thought.thoughtNumber,
                description: `Decision "${decision.name}" selects unknown hypothesis: ${hypothesisId}`,
                suggestion: 'Ensure decisions reference existing hypotheses',
                category: IssueCategory.STRUCTURAL,
              });
            }
          }
        }
      }
    }

    return issues;
  }
}
