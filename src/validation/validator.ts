/**
 * Validation engine for DeepThinking MCP
 * Validates thoughts based on mode and provides feedback
 *
 * Refactored in v3.0.0 to use modular validator architecture
 */

import { Thought } from '../types/core.js';
import { ValidationResult, ValidationIssue } from '../types/session.js';
import { validationCache } from './cache.js';
import { getConfig } from '../config/index.js';
import { getValidatorForMode } from './validators/index.js';

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

    // Get validator for this mode
    const validator = getValidatorForMode(thought.mode);

    if (validator) {
      // Use mode-specific validator
      issues.push(...validator.validate(thought, context));
    } else {
      // Unknown mode - add warning
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Unknown thinking mode: ${thought.mode}`,
        suggestion: 'Use a supported mode (sequential, shannon, mathematics, physics, hybrid, abductive, causal, bayesian, counterfactual, analogical, temporal, gametheory, evidential)',
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
   * Calculate confidence score
   */
  private calculateConfidence(thought: Thought, issues: ValidationIssue[]): number {
    let confidence = 1.0;

    // Reduce confidence for each issue
    for (const issue of issues) {
      if (issue.severity === 'error') {
        confidence -= 0.3;
      } else if (issue.severity === 'warning') {
        confidence -= 0.1;
      } else if (issue.severity === 'info') {
        confidence -= 0.05;
      }
    }

    // Adjust for thought-specific factors
    if ('uncertainty' in thought) {
      const uncertainty = (thought as any).uncertainty;
      confidence *= (1 - uncertainty);
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate strength metrics
   */
  private calculateStrengthMetrics(_thought: Thought, issues: ValidationIssue[]) {
    const logicalIssues = issues.filter(i => i.category === 'logical');
    const mathIssues = issues.filter(i => i.category === 'mathematical');
    const physicalIssues = issues.filter(i => i.category === 'physical');

    return {
      logicalSoundness: 1 - (logicalIssues.length * 0.2),
      empiricalSupport: 0.8, // Would need actual evidence checking
      mathematicalRigor: 1 - (mathIssues.length * 0.2),
      physicalConsistency: 1 - (physicalIssues.length * 0.2),
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
 * Validation context
 */
export interface ValidationContext {
  existingThoughts?: Map<string, Thought>;
  strictMode?: boolean;
}
