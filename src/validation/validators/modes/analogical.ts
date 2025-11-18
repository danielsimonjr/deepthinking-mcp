/**
 * Analogical Mode Validator
 */

import { AnalogicalThought, ValidationIssue, ValidationContext } from '../../../types/index.js';
import { BaseValidator } from '../base.js';

export class AnalogicalValidator extends BaseValidator<AnalogicalThought> {
  getMode(): string {
    return 'analogical';
  }

  validate(thought: AnalogicalThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Require source domain
    if (!thought.sourceDomain) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Analogical reasoning requires a source domain',
        suggestion: 'Provide the source domain for the analogy',
        category: 'structural',
      });
    }

    // Require target domain
    if (!thought.targetDomain) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Analogical reasoning requires a target domain',
        suggestion: 'Provide the target domain for the analogy',
        category: 'structural',
      });
    }

    // Validate analogy strength range
    if (thought.analogyStrength !== undefined &&
        (thought.analogyStrength < 0 || thought.analogyStrength > 1)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Analogy strength must be between 0 and 1',
        suggestion: 'Provide analogy strength as decimal',
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

    // Validate mapping references and confidence scores
    if (thought.mapping && thought.sourceDomain && thought.targetDomain) {
      const sourceEntityIds = new Set(thought.sourceDomain.entities.map(e => e.id));
      const targetEntityIds = new Set(thought.targetDomain.entities.map(e => e.id));

      for (const map of thought.mapping) {
        // Validate source entity reference
        if (!sourceEntityIds.has(map.sourceEntityId)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Mapping references non-existent source entity: ${map.sourceEntityId}`,
            suggestion: 'Ensure mappings reference existing source entities',
            category: 'structural',
          });
        }

        // Validate target entity reference
        if (!targetEntityIds.has(map.targetEntityId)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Mapping references non-existent target entity: ${map.targetEntityId}`,
            suggestion: 'Ensure mappings reference existing target entities',
            category: 'structural',
          });
        }

        // Validate confidence range
        if (map.confidence < 0 || map.confidence > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Mapping confidence must be between 0 and 1: ${map.sourceEntityId} -> ${map.targetEntityId}`,
            suggestion: 'Provide confidence as decimal',
            category: 'structural',
          });
        }
      }
    }

    // Warn if no limitations identified
    if (!thought.limitations || thought.limitations.length === 0) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Good analogies acknowledge their limitations',
        suggestion: 'Consider identifying potential limitations or weaknesses of the analogy',
        category: 'completeness',
      });
    }

    // Validate insight novelty ranges
    if (thought.insights) {
      for (const insight of thought.insights) {
        if (insight.novelty !== undefined &&
            (insight.novelty < 0 || insight.novelty > 1)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: 'Insight novelty must be between 0 and 1',
            suggestion: 'Provide novelty as decimal',
            category: 'structural',
          });
        }
      }
    }

    // Validate inference confidence ranges
    if (thought.inferences) {
      for (const inference of thought.inferences) {
        if (inference.confidence < 0 || inference.confidence > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: 'Inference confidence must be between 0 and 1',
            suggestion: 'Provide confidence as decimal',
            category: 'structural',
          });
        }
      }
    }

    return issues;
  }
}
