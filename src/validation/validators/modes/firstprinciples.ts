/**
 * First-Principles Mode Validator
 */

import { FirstPrinciplesThought, ValidationIssue } from '../../../types/index.js';
import { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class FirstPrinciplesValidator extends BaseValidator<FirstPrinciplesThought> {
  getMode(): string {
    return 'firstprinciples';
  }

  validate(thought: FirstPrinciplesThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate question
    if (!thought.question || thought.question.trim() === '') {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'First-Principles thought must have a question',
        suggestion: 'Provide the question being answered from first principles',
        category: 'structural',
      });
    }

    // Validate principles
    if (!thought.principles || thought.principles.length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'First-Principles thought must have at least one foundational principle',
        suggestion: 'Add foundational principles (axioms, definitions, observations)',
        category: 'structural',
      });
    } else {
      const principleIds = new Set<string>();

      for (const principle of thought.principles) {
        // Validate unique IDs
        if (principleIds.has(principle.id)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Duplicate principle ID: ${principle.id}`,
            suggestion: 'Ensure all principle IDs are unique',
            category: 'structural',
          });
        }
        principleIds.add(principle.id);

        // Validate required fields
        if (!principle.statement || principle.statement.trim() === '') {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Principle ${principle.id} must have a statement`,
            suggestion: 'Provide a clear statement of the principle',
            category: 'structural',
          });
        }

        if (!principle.justification || principle.justification.trim() === '') {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Principle ${principle.id} must have a justification`,
            suggestion: 'Explain why this principle is valid',
            category: 'structural',
          });
        }

        // Validate confidence range for observations and assumptions
        if (
          principle.confidence !== undefined &&
          (principle.confidence < 0 || principle.confidence > 1)
        ) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Principle ${principle.id} confidence must be 0-1`,
            suggestion: 'Use decimal confidence values between 0 and 1',
            category: 'structural',
          });
        }

        // Validate dependencies exist
        if (principle.dependsOn) {
          for (const depId of principle.dependsOn) {
            if (!principleIds.has(depId) && !thought.principles.some((p) => p.id === depId)) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Principle ${principle.id} depends on non-existent principle ${depId}`,
                suggestion: 'Ensure dependency references exist',
                category: 'logical',
              });
            }
          }
        }
      }
    }

    // Validate derivation steps
    if (!thought.derivationSteps || thought.derivationSteps.length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'First-Principles thought must have derivation steps',
        suggestion: 'Add derivation steps showing the reasoning chain',
        category: 'structural',
      });
    } else {
      const principleIds = new Set(thought.principles?.map((p) => p.id) || []);
      const stepNumbers = new Set<number>();

      for (const step of thought.derivationSteps) {
        // Validate unique step numbers
        if (stepNumbers.has(step.stepNumber)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Duplicate step number: ${step.stepNumber}`,
            suggestion: 'Ensure all step numbers are unique',
            category: 'structural',
          });
        }
        stepNumbers.add(step.stepNumber);

        // Validate step number is positive
        if (step.stepNumber <= 0) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Step ${step.stepNumber} must have a positive step number`,
            suggestion: 'Use positive integers for step numbers',
            category: 'structural',
          });
        }

        // Validate principle reference
        if (!principleIds.has(step.principle)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Step ${step.stepNumber} references non-existent principle ${step.principle}`,
            suggestion: 'Ensure step references existing principles',
            category: 'logical',
          });
        }

        // Validate inference
        if (!step.inference || step.inference.trim() === '') {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Step ${step.stepNumber} must have an inference`,
            suggestion: 'Describe what is inferred from the principle',
            category: 'structural',
          });
        }

        // Validate confidence range
        if (step.confidence < 0 || step.confidence > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Step ${step.stepNumber} confidence must be 0-1`,
            suggestion: 'Use decimal confidence values between 0 and 1',
            category: 'structural',
          });
        }
      }
    }

    // Validate conclusion
    if (!thought.conclusion) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'First-Principles thought must have a conclusion',
        suggestion: 'Provide a conclusion derived from the principles',
        category: 'structural',
      });
    } else {
      // Validate conclusion statement
      if (!thought.conclusion.statement || thought.conclusion.statement.trim() === '') {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Conclusion must have a statement',
          suggestion: 'Provide a clear conclusion statement',
          category: 'structural',
        });
      }

      // Validate derivation chain
      if (!thought.conclusion.derivationChain || thought.conclusion.derivationChain.length === 0) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Conclusion must have a derivation chain',
          suggestion: 'Specify which steps lead to the conclusion',
          category: 'structural',
        });
      } else {
        const stepNumbers = new Set(thought.derivationSteps?.map((s) => s.stepNumber) || []);

        for (const stepNum of thought.conclusion.derivationChain) {
          if (!stepNumbers.has(stepNum)) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Conclusion references non-existent step ${stepNum}`,
              suggestion: 'Ensure derivation chain references existing steps',
              category: 'logical',
            });
          }
        }
      }

      // Validate certainty range
      if (thought.conclusion.certainty < 0 || thought.conclusion.certainty > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Conclusion certainty must be 0-1',
          suggestion: 'Use decimal certainty values between 0 and 1',
          category: 'structural',
        });
      }
    }

    return issues;
  }
}
