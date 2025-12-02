/**
 * Validation engine for DeepThinking MCP (v4.3.0)
 * Validates thoughts based on mode and provides feedback
 *
 * Refactored in v3.0.0 to use modular validator architecture
 * Sprint 9.3: Updated for async lazy-loaded validators
 */

import { Thought } from '../types/core.js';
import { ValidationResult, ValidationIssue } from '../types/session.js';
import { validationCache } from './cache.js';
import { getConfig } from '../config/index.js';
import { getValidatorForMode } from './validators/index.js';
import type { ValidationContext } from './constants.js';

/**
 * Validation confidence penalty constants
 */
const CONFIDENCE_PENALTY = {
  ERROR: 0.3,
  WARNING: 0.1,
  INFO: 0.05,
} as const;

/**
 * Strength metric penalty constants
 */
const STRENGTH_PENALTY = {
  PER_ISSUE: 0.2,
  EMPIRICAL_BASELINE: 0.8,
} as const;

/**
 * Main validator class
 */
export class ThoughtValidator {
  /**
   * Validate a thought based on its mode
   */
  async validate(thought: Thought, context: ValidationContext = {}): Promise<ValidationResult> {
    const config = getConfig();

    // Check cache if enabled
    if (config.enableValidationCache) {
      const cached = validationCache.get(thought);
      if (cached) {
        // Cache hit - return cached result
        return cached.result;
      }
    }

    // Cache miss or caching disabled - perform validation
    const result = await this.performValidation(thought, context);

    // Cache result if enabled
    if (config.enableValidationCache) {
      validationCache.set(thought, result);
    }

    return result;
  }

  /**
   * Perform actual validation (extracted for caching)
   */
  private async performValidation(thought: Thought, context: ValidationContext = {}): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Get validator for this mode (async lazy loading)
    const validator = await getValidatorForMode(thought.mode);

    if (validator) {
      // Use mode-specific validator
      issues.push(...validator.validate(thought, context));
    } else {
      // Unknown mode - add warning
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Unknown thinking mode: ${thought.mode}`,
        suggestion: 'Use a supported mode (sequential, shannon, mathematics, physics, hybrid, abductive, causal, bayesian, counterfactual, analogical, temporal, gametheory, evidential, firstprinciple, meta, modal, constraint, optimization, stochastic, recursive)',
        category: 'structural',
      });
    }

    // Calculate validation result
    const errors = issues.filter(i => i.severity === 'error');

    return {
      isValid: errors.length === 0,
      confidence: this.calculateConfidence(thought, issues),
      issues,
      strengthMetrics: this.calculateStrengthMetrics(thought, issues),
      suggestions: this.generateSuggestions(issues),
    };
  }

  /**
   * Calculate confidence score based on validation issues and thought uncertainty
   *
   * @param thought - The thought being validated
   * @param issues - Array of validation issues found
   * @returns Confidence score between 0 and 1
   */
  private calculateConfidence(thought: Thought, issues: ValidationIssue[]): number {
    let confidence = 1.0;

    // Reduce confidence for each issue based on severity
    for (const issue of issues) {
      if (issue.severity === 'error') {
        confidence -= CONFIDENCE_PENALTY.ERROR;
      } else if (issue.severity === 'warning') {
        confidence -= CONFIDENCE_PENALTY.WARNING;
      } else if (issue.severity === 'info') {
        confidence -= CONFIDENCE_PENALTY.INFO;
      }
    }

    // Adjust for thought-specific uncertainty if present
    if ('uncertainty' in thought) {
      const uncertainty = (thought as { uncertainty?: number }).uncertainty;
      if (typeof uncertainty === 'number') {
        confidence *= (1 - uncertainty);
      }
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate strength metrics based on issue categories
   *
   * @param _thought - The thought being validated (unused but kept for future use)
   * @param issues - Array of validation issues categorized by type
   * @returns Strength metrics object with scores between 0 and 1
   */
  private calculateStrengthMetrics(_thought: Thought, issues: ValidationIssue[]) {
    const logicalIssues = issues.filter(i => i.category === 'logical');
    const mathIssues = issues.filter(i => i.category === 'mathematical');
    const physicalIssues = issues.filter(i => i.category === 'physical');

    return {
      logicalSoundness: Math.max(0, 1 - (logicalIssues.length * STRENGTH_PENALTY.PER_ISSUE)),
      empiricalSupport: STRENGTH_PENALTY.EMPIRICAL_BASELINE, // Baseline - would need actual evidence checking
      mathematicalRigor: Math.max(0, 1 - (mathIssues.length * STRENGTH_PENALTY.PER_ISSUE)),
      physicalConsistency: Math.max(0, 1 - (physicalIssues.length * STRENGTH_PENALTY.PER_ISSUE)),
    };
  }

  /**
   * Generate suggestions from issues
   */
  private generateSuggestions(issues: ValidationIssue[]): string[] {
    return issues
      .filter(i => i.severity === 'error' || i.severity === 'warning')
      .map(i => i.suggestion);
  }
}

/**
 * Re-export ValidationContext from constants for backwards compatibility
 * Moved to constants.ts in v6.1.0 to break circular dependency
 */
export type { ValidationContext } from './constants.js';
