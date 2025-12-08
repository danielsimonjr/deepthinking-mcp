/**
 * First-Principles Mode Validator (v7.1.0)
 * Refactored to use BaseValidator shared methods
 */

import { FirstPrinciplesThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';

export class FirstPrinciplesValidator extends BaseValidator<FirstPrinciplesThought> {
  getMode(): string {
    return 'firstprinciples';
  }

  validate(thought: FirstPrinciplesThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate question using shared method
    issues.push(...this.validateRequired(thought, thought.question?.trim(), 'Question', IssueCategory.STRUCTURAL));

    // Validate principles using shared method (ERROR severity)
    issues.push(
      ...this.validateNonEmptyArray(thought, thought.principles, 'Foundational principles', IssueCategory.STRUCTURAL, IssueSeverity.ERROR)
    );

    if (thought.principles && thought.principles.length > 0) {
      const principleIds = new Set<string>();

      for (const principle of thought.principles) {
        // Validate unique IDs
        if (principleIds.has(principle.id)) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Duplicate principle ID: ${principle.id}`,
            suggestion: 'Ensure all principle IDs are unique',
            category: IssueCategory.STRUCTURAL,
          });
        }
        principleIds.add(principle.id);

        // Validate required fields
        issues.push(
          ...this.validateRequired(thought, principle.statement?.trim(), `Principle ${principle.id} statement`, IssueCategory.STRUCTURAL)
        );
        issues.push(
          ...this.validateRequired(thought, principle.justification?.trim(), `Principle ${principle.id} justification`, IssueCategory.STRUCTURAL)
        );

        // Validate confidence range using shared method
        issues.push(
          ...this.validateConfidence(thought, principle.confidence, `Principle ${principle.id} confidence`)
        );

        // Validate dependencies exist
        if (principle.dependsOn) {
          for (const depId of principle.dependsOn) {
            if (!principleIds.has(depId) && !thought.principles.some((p) => p.id === depId)) {
              issues.push({
                severity: IssueSeverity.ERROR,
                thoughtNumber: thought.thoughtNumber,
                description: `Principle ${principle.id} depends on non-existent principle ${depId}`,
                suggestion: 'Ensure dependency references exist',
                category: IssueCategory.LOGICAL,
              });
            }
          }
        }
      }
    }

    // Validate derivation steps using shared method (ERROR severity)
    issues.push(
      ...this.validateNonEmptyArray(thought, thought.derivationSteps, 'Derivation steps', IssueCategory.STRUCTURAL, IssueSeverity.ERROR)
    );

    if (thought.derivationSteps && thought.derivationSteps.length > 0) {
      const principleIds = new Set(thought.principles?.map((p) => p.id) || []);
      const stepNumbers = new Set<number>();

      for (const step of thought.derivationSteps) {
        // Validate unique step numbers
        if (stepNumbers.has(step.stepNumber)) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Duplicate step number: ${step.stepNumber}`,
            suggestion: 'Ensure all step numbers are unique',
            category: IssueCategory.STRUCTURAL,
          });
        }
        stepNumbers.add(step.stepNumber);

        // Validate step number is positive using shared method
        issues.push(
          ...this.validateNumberRange(
            thought,
            step.stepNumber,
            `Step number`,
            1,
            Infinity,
            IssueSeverity.ERROR,
            IssueCategory.STRUCTURAL
          )
        );

        // Validate principle reference
        if (!principleIds.has(step.principle)) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Step ${step.stepNumber} references non-existent principle ${step.principle}`,
            suggestion: 'Ensure step references existing principles',
            category: IssueCategory.LOGICAL,
          });
        }

        // Validate inference
        issues.push(
          ...this.validateRequired(thought, step.inference?.trim(), `Step ${step.stepNumber} inference`, IssueCategory.STRUCTURAL)
        );

        // Validate confidence range using shared method
        issues.push(
          ...this.validateConfidence(thought, step.confidence, `Step ${step.stepNumber} confidence`)
        );
      }
    }

    // Validate conclusion using shared method
    issues.push(...this.validateRequired(thought, thought.conclusion, 'Conclusion', IssueCategory.STRUCTURAL));

    if (thought.conclusion) {
      // Validate conclusion statement
      issues.push(
        ...this.validateRequired(thought, thought.conclusion.statement?.trim(), 'Conclusion statement', IssueCategory.STRUCTURAL)
      );

      // Validate derivation chain (ERROR severity)
      issues.push(
        ...this.validateNonEmptyArray(thought, thought.conclusion.derivationChain, 'Derivation chain', IssueCategory.STRUCTURAL, IssueSeverity.ERROR)
      );

      if (thought.conclusion.derivationChain && thought.conclusion.derivationChain.length > 0) {
        const stepNumbers = new Set(thought.derivationSteps?.map((s) => s.stepNumber) || []);

        for (const stepNum of thought.conclusion.derivationChain) {
          if (!stepNumbers.has(stepNum)) {
            issues.push({
              severity: IssueSeverity.ERROR,
              thoughtNumber: thought.thoughtNumber,
              description: `Conclusion references non-existent step ${stepNum}`,
              suggestion: 'Ensure derivation chain references existing steps',
              category: IssueCategory.LOGICAL,
            });
          }
        }
      }

      // Validate certainty range using shared method
      issues.push(
        ...this.validateProbability(thought, thought.conclusion.certainty, 'Conclusion certainty')
      );
    }

    return issues;
  }
}
