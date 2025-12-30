/**
 * Analogical Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 *
 * Validates analogical reasoning (domain mapping)
 */

import type { AnalogicalThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';
import { validateCommon, validateConfidence, validateProbability } from '../validation-utils.js';

/**
 * Validator for analogical reasoning mode
 * Validates mappings between source and target domains
 */
export class AnalogicalValidator implements ModeValidator<AnalogicalThought> {
  getMode(): string {
    return 'analogical';
  }

  validate(thought: AnalogicalThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

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

    // Validate analogy strength range using shared method
    issues.push(...validateProbability(thought, thought.analogyStrength, 'Analogy strength'));

    // Validate mapping completeness
    if (thought.mapping && thought.mapping.length === 0) {
      issues.push({
        severity: IssueSeverity.INFO,
        thoughtNumber: thought.thoughtNumber,
        description: 'No mappings specified between domains',
        suggestion: 'Provide at least one mapping between source and target',
        category: IssueCategory.STRUCTURAL,
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
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Mapping references non-existent source entity: ${map.sourceEntityId}`,
            suggestion: 'Ensure mappings reference existing source entities',
            category: IssueCategory.STRUCTURAL,
          });
        }

        // Validate target entity reference
        if (!targetEntityIds.has(map.targetEntityId)) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Mapping references non-existent target entity: ${map.targetEntityId}`,
            suggestion: 'Ensure mappings reference existing target entities',
            category: IssueCategory.STRUCTURAL,
          });
        }

        // Validate confidence range using shared method
        issues.push(
          ...validateConfidence(
            thought,
            map.confidence,
            `Mapping confidence (${map.sourceEntityId} -> ${map.targetEntityId})`
          )
        );
      }
    }

    // Warn if no limitations identified
    if (!thought.limitations || thought.limitations.length === 0) {
      issues.push({
        severity: IssueSeverity.WARNING,
        thoughtNumber: thought.thoughtNumber,
        description: 'Good analogies acknowledge their limitations',
        suggestion: 'Consider identifying potential limitations or weaknesses of the analogy',
        category: 'completeness',
      });
    }

    // Validate insight novelty ranges using shared method
    if (thought.insights) {
      for (const insight of thought.insights) {
        issues.push(...validateProbability(thought, insight.novelty, 'Insight novelty'));
      }
    }

    // Validate inference confidence ranges using shared method
    if (thought.inferences) {
      for (const inference of thought.inferences) {
        issues.push(...validateConfidence(thought, inference.confidence, 'Inference confidence'));
      }
    }

    return issues;
  }
}
