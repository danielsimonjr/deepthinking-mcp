/**
 * Analogical Mode Validator (v7.1.0)
 * Refactored to use BaseValidator shared methods
 */

import { AnalogicalThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';

export class AnalogicalValidator extends BaseValidator<AnalogicalThought> {
  getMode(): string {
    return 'analogical';
  }

  validate(thought: AnalogicalThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Require source domain using shared method
    issues.push(...this.validateRequired(thought, thought.sourceDomain, 'Source domain', IssueCategory.STRUCTURAL));

    // Require target domain using shared method
    issues.push(...this.validateRequired(thought, thought.targetDomain, 'Target domain', IssueCategory.STRUCTURAL));

    // Validate analogy strength range using shared method
    issues.push(...this.validateProbability(thought, thought.analogyStrength, 'Analogy strength'));

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
          ...this.validateConfidence(
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
        suggestion: 'Identify where the analogy breaks down or doesn\'t apply',
        category: IssueCategory.LOGICAL,
      });
    }

    // Validate insight novelty ranges using shared method
    if (thought.insights) {
      for (const insight of thought.insights) {
        issues.push(...this.validateProbability(thought, insight.novelty, 'Insight novelty'));
      }
    }

    // Validate inference confidence ranges using shared method
    if (thought.inferences) {
      for (const inference of thought.inferences) {
        issues.push(...this.validateConfidence(thought, inference.confidence, 'Inference confidence'));
      }
    }

    return issues;
  }
}
