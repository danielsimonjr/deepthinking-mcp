/**
 * Analogical Mode Validator
 */

import { AnalogicalThought, ValidationIssue, ValidationContext } from '../../../types/index.js';
import { BaseValidator } from '../base.js';

export class AnalogicalValidator extends BaseValidator<AnalogicalThought> {
  getMode(): string {
    return 'analogical';
  }

  validate(thought: AnalogicalThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Source domain should be specified
    if (thought.sourceDomain && !thought.sourceDomain.description) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Source domain should have a description',
        suggestion: 'Provide clear description of the source domain',
        category: 'structural',
      });
    }

    // Target domain should be specified
    if (thought.targetDomain && !thought.targetDomain.description) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Target domain should have a description',
        suggestion: 'Provide clear description of the target domain',
        category: 'structural',
      });
    }

    // Validate mapping completeness
    if (thought.mapping && thought.mapping.length === 0) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'No mappings specified between domains',
        suggestion: 'Provide at least one mapping between source and target',
        category: 'structural',
      });
    }

    // Validate mapping confidence scores
    if (thought.mapping) {
      for (const map of thought.mapping) {
        if (map.confidence < 0 || map.confidence > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Mapping confidence must be between 0 and 1: ${map.sourceElement} -> ${map.targetElement}`,
            suggestion: 'Provide confidence as decimal',
            category: 'structural',
          });
        }
      }
    }

    return issues;
  }
}
