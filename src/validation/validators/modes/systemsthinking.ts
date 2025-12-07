/**
 * Systems Thinking Mode Validator (v7.1.0)
 * Refactored to use BaseValidator shared methods
 */

import { SystemsThinkingThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';

export class SystemsThinkingValidator extends BaseValidator<SystemsThinkingThought> {
  getMode(): string {
    return 'systemsthinking';
  }

  validate(thought: SystemsThinkingThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate system definition using shared methods
    if (thought.system) {
      issues.push(
        ...this.validateRequired(thought, thought.system.name?.trim(), 'System name', IssueCategory.STRUCTURAL)
      );

      if (!thought.system.boundary || thought.system.boundary.trim() === '') {
        issues.push({
          severity: IssueSeverity.WARNING,
          thoughtNumber: thought.thoughtNumber,
          description: 'System boundary should be explicitly defined',
          suggestion: 'Clarify what is included and excluded from the system',
          category: IssueCategory.STRUCTURAL,
        });
      }
    }

    // Validate components
    if (thought.components && thought.components.length > 0) {
      const componentIds = new Set<string>();

      for (const component of thought.components) {
        if (componentIds.has(component.id)) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Duplicate component ID: ${component.id}`,
            suggestion: 'Ensure all component IDs are unique',
            category: IssueCategory.STRUCTURAL,
          });
        }
        componentIds.add(component.id);

        // Validate component fields using shared method
        issues.push(
          ...this.validateRequired(thought, component.name?.trim(), `Component ${component.id} name`, IssueCategory.STRUCTURAL)
        );

        // Validate influences reference existing components
        if (component.influencedBy) {
          for (const influencerId of component.influencedBy) {
            if (!componentIds.has(influencerId) && !thought.components.some(c => c.id === influencerId)) {
              issues.push({
                severity: IssueSeverity.ERROR,
                thoughtNumber: thought.thoughtNumber,
                description: `Component ${component.id} references non-existent influencer ${influencerId}`,
                suggestion: 'Ensure all influences reference existing components',
                category: IssueCategory.LOGICAL,
              });
            }
          }
        }
      }
    }

    // Validate feedback loops
    if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
      const componentIds = new Set(thought.components?.map(c => c.id) || []);

      for (const loop of thought.feedbackLoops) {
        // Validate loop has at least 2 components
        if (!loop.components || loop.components.length < 2) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Feedback loop ${loop.id} must have at least 2 components`,
            suggestion: 'Add more components to form a complete feedback loop',
            category: IssueCategory.STRUCTURAL,
          });
        }

        // Validate all components exist
        if (loop.components) {
          for (const compId of loop.components) {
            if (!componentIds.has(compId)) {
              issues.push({
                severity: IssueSeverity.ERROR,
                thoughtNumber: thought.thoughtNumber,
                description: `Loop ${loop.id} references non-existent component ${compId}`,
                suggestion: 'Ensure loop references existing components',
                category: IssueCategory.LOGICAL,
              });
            }
          }
        }

        // Validate strength range using shared method
        issues.push(...this.validateProbability(thought, loop.strength, `Loop ${loop.id} strength`));

        // Validate delay is non-negative using shared method
        issues.push(
          ...this.validateNumberRange(
            thought,
            loop.delay,
            `Loop ${loop.id} delay`,
            0,
            Infinity,
            IssueSeverity.ERROR,
            IssueCategory.STRUCTURAL
          )
        );
      }
    }

    // Validate leverage points
    if (thought.leveragePoints && thought.leveragePoints.length > 0) {
      const allIds = new Set([
        ...(thought.components?.map(c => c.id) || []),
        ...(thought.feedbackLoops?.map(l => l.id) || []),
      ]);

      for (const leveragePoint of thought.leveragePoints) {
        // Validate location references existing component or loop
        if (!allIds.has(leveragePoint.location)) {
          issues.push({
            severity: IssueSeverity.WARNING,
            thoughtNumber: thought.thoughtNumber,
            description: `Leverage point ${leveragePoint.id} location ${leveragePoint.location} not found`,
            suggestion: 'Ensure leverage point references existing components or loops',
            category: IssueCategory.LOGICAL,
          });
        }

        // Validate effectiveness range using shared method
        issues.push(
          ...this.validateProbability(thought, leveragePoint.effectiveness, `Leverage point ${leveragePoint.id} effectiveness`)
        );

        // Validate difficulty range using shared method
        issues.push(
          ...this.validateProbability(thought, leveragePoint.difficulty, `Leverage point ${leveragePoint.id} difficulty`)
        );
      }
    }

    // Validate emergent behaviors
    if (thought.behaviors && thought.behaviors.length > 0) {
      const allIds = new Set([
        ...(thought.components?.map(c => c.id) || []),
        ...(thought.feedbackLoops?.map(l => l.id) || []),
      ]);

      for (const behavior of thought.behaviors) {
        if (behavior.causes) {
          for (const causeId of behavior.causes) {
            if (!allIds.has(causeId)) {
              issues.push({
                severity: IssueSeverity.WARNING,
                thoughtNumber: thought.thoughtNumber,
                description: `Behavior ${behavior.id} references non-existent cause ${causeId}`,
                suggestion: 'Ensure behavior causes reference existing components or loops',
                category: IssueCategory.LOGICAL,
              });
            }
          }
        }
      }
    }

    return issues;
  }
}
