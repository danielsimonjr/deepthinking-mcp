/**
 * Inductive Mode Validator
 * Validates inductive reasoning from specific observations to general principles
 */

import { InductiveThought, ValidationIssue } from '../../../types/index.js';
import { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class InductiveValidator extends BaseValidator<InductiveThought> {
  getMode(): string {
    return 'inductive';
  }

  validate(thought: InductiveThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // At least one observation required
    if (!thought.observations || thought.observations.length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Inductive reasoning requires at least one observation',
        suggestion: 'Provide specific cases or observations to generalize from',
        category: 'structural',
      });
    }

    // Generalization is required
    if (!thought.generalization || thought.generalization.trim().length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Inductive reasoning requires a generalization',
        suggestion: 'Provide the general principle formed from observations',
        category: 'structural',
      });
    }

    // Confidence must be between 0 and 1
    if (thought.confidence < 0 || thought.confidence > 1) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Invalid confidence value: ${thought.confidence}`,
        suggestion: 'Confidence must be between 0 and 1',
        category: 'structural',
      });
    }

    // Sample size should be positive if provided
    if (thought.sampleSize !== undefined && thought.sampleSize < 1) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Invalid sample size: ${thought.sampleSize}`,
        suggestion: 'Sample size must be at least 1',
        category: 'structural',
      });
    }

    // Warning if sample size is small
    if (thought.sampleSize !== undefined && thought.sampleSize < 3) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Small sample size may lead to weak generalizations',
        suggestion: 'Consider gathering more observations to strengthen inference',
        category: 'logical',
      });
    }

    // Warning if high confidence with small sample
    if (
      thought.confidence > 0.8 &&
      thought.sampleSize !== undefined &&
      thought.sampleSize < 10
    ) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'High confidence with small sample size',
        suggestion: 'Consider lowering confidence or increasing sample size',
        category: 'logical',
      });
    }

    // Info if counterexamples exist
    if (thought.counterexamples && thought.counterexamples.length > 0) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: `${thought.counterexamples.length} counterexample(s) noted`,
        suggestion: 'Counterexamples may indicate need to refine generalization',
        category: 'structural',
      });
    }

    return issues;
  }
}
