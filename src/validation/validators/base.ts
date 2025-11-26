/**
 * Base Validator Interface and Abstract Class (v4.3.0)
 * Sprint 10: Added reusable validation methods
 *
 * Defines the contract that all mode-specific validators must implement
 */

import { Thought, ValidationIssue } from '../../types/index.js';
import { ValidationContext } from '../validator.js';
import {
  IssueSeverity,
  IssueCategory,
  ValidationThresholds,
  ValidationMessages,
  isInRange,
} from '../constants.js';

/**
 * Interface for mode-specific validators
 */
export interface ModeValidator<T extends Thought = Thought> {
  /**
   * Validate a thought of this mode
   */
  validate(thought: T, context: ValidationContext): ValidationIssue[];

  /**
   * Get the mode this validator handles
   */
  getMode(): string;
}

/**
 * Abstract base class with common validation logic
 */
export abstract class BaseValidator<T extends Thought = Thought> implements ModeValidator<T> {
  /**
   * Validate common thought properties
   */
  protected validateCommon(thought: Thought): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate thoughtNumber is positive
    if (thought.thoughtNumber <= 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Thought number must be positive',
        suggestion: 'Use sequential numbering starting from 1',
        category: 'structural',
      });
    }

    // Validate totalThoughts is positive
    if (thought.totalThoughts <= 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Total thoughts must be positive',
        suggestion: 'Specify expected total number of thoughts',
        category: 'structural',
      });
    }

    // Validate thoughtNumber doesn't exceed totalThoughts
    if (thought.thoughtNumber > thought.totalThoughts) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Thought number ${thought.thoughtNumber} exceeds total ${thought.totalThoughts}`,
        suggestion: 'Ensure thought number is within the declared total',
        category: 'logical',
      });
    }

    // Validate content exists (if present)
    if ('content' in thought && typeof thought.content === 'string' && thought.content.trim() === '') {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Thought content is empty',
        suggestion: 'Provide meaningful content for the thought',
        category: 'structural',
      });
    }

    return issues;
  }

  /**
   * Validate dependencies exist in context
   */
  protected validateDependencies(
    thought: Thought,
    dependencies: string[],
    context: ValidationContext
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (context.existingThoughts) {
      for (const depId of dependencies) {
        if (!context.existingThoughts.has(depId)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Dependency on non-existent thought: ${depId}`,
            suggestion: 'Verify all dependency IDs exist',
            category: 'logical',
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate uncertainty is in valid range [0, 1]
   */
  protected validateUncertainty(thought: Thought, uncertainty: number): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (uncertainty < 0 || uncertainty > 1) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Uncertainty must be between 0 and 1',
        suggestion: 'Provide uncertainty as a decimal (e.g., 0.2 for 20%)',
        category: 'structural',
      });
    }

    return issues;
  }

  /**
   * Validate a number is within a range (consolidates 56+ range checks)
   * Sprint 10: Reusable range validation
   */
  protected validateNumberRange(
    thought: Thought,
    value: number | undefined,
    fieldName: string,
    min: number = 0,
    max: number = 1,
    severity: IssueSeverity = IssueSeverity.ERROR,
    category: IssueCategory = IssueCategory.STRUCTURAL
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (value !== undefined && !isInRange(value, min, max)) {
      issues.push({
        severity,
        thoughtNumber: thought.thoughtNumber,
        description: ValidationMessages.INVALID_RANGE(fieldName, min, max),
        suggestion: `Provide ${fieldName} as a value between ${min} and ${max}`,
        category,
      });
    }

    return issues;
  }

  /**
   * Validate probability (0-1 range)
   */
  protected validateProbability(
    thought: Thought,
    value: number | undefined,
    fieldName: string = 'Probability'
  ): ValidationIssue[] {
    return this.validateNumberRange(
      thought,
      value,
      fieldName,
      ValidationThresholds.MIN_PROBABILITY,
      ValidationThresholds.MAX_PROBABILITY,
      IssueSeverity.ERROR,
      IssueCategory.MATHEMATICAL
    );
  }

  /**
   * Validate confidence (0-1 range)
   */
  protected validateConfidence(
    thought: Thought,
    value: number | undefined,
    fieldName: string = 'Confidence'
  ): ValidationIssue[] {
    return this.validateNumberRange(
      thought,
      value,
      fieldName,
      ValidationThresholds.MIN_CONFIDENCE,
      ValidationThresholds.MAX_CONFIDENCE,
      IssueSeverity.ERROR,
      IssueCategory.STRUCTURAL
    );
  }

  /**
   * Validate required field exists
   */
  protected validateRequired(
    thought: Thought,
    value: unknown,
    fieldName: string,
    category: IssueCategory = IssueCategory.STRUCTURAL
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (value === undefined || value === null) {
      issues.push({
        severity: IssueSeverity.ERROR,
        thoughtNumber: thought.thoughtNumber,
        description: ValidationMessages.REQUIRED_FIELD(fieldName),
        suggestion: `Provide a value for ${fieldName}`,
        category,
      });
    }

    return issues;
  }

  /**
   * Validate array is not empty
   */
  protected validateNonEmptyArray(
    thought: Thought,
    arr: unknown[] | undefined,
    fieldName: string,
    category: IssueCategory = IssueCategory.STRUCTURAL
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!arr || arr.length === 0) {
      issues.push({
        severity: IssueSeverity.WARNING,
        thoughtNumber: thought.thoughtNumber,
        description: ValidationMessages.EMPTY_ARRAY(fieldName),
        suggestion: `Add at least one item to ${fieldName}`,
        category,
      });
    }

    return issues;
  }

  /**
   * Abstract method - must be implemented by subclasses
   */
  abstract validate(thought: T, context: ValidationContext): ValidationIssue[];

  /**
   * Abstract method - must return the mode this validator handles
   */
  abstract getMode(): string;
}
