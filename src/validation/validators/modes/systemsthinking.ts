/**
 * Systems Thinking Mode Validator
 */

import { SystemsThinkingThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class SystemsThinkingValidator extends BaseValidator<SystemsThinkingThought> {
  getMode(): string {
    return 'systemsthinking';
  }

  validate(thought: SystemsThinkingThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate system definition
    if (thought.system) {
      if (!thought.system.name || thought.system.name.trim() === '') {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'System must have a name',
          suggestion: 'Provide a clear system name',
          category: 'structural',
        });
      }

      if (!thought.system.boundary || thought.system.boundary.trim() === '') {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'System boundary should be explicitly defined',
          suggestion: 'Clarify what is included and excluded from the system',
          category: 'structural',
        });
      }
    }

    // Validate components
    if (thought.components && thought.components.length > 0) {
      const componentIds = new Set<string>();

      for (const component of thought.components) {
        if (componentIds.has(component.id)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Duplicate component ID: ${component.id}`,
            suggestion: 'Ensure all component IDs are unique',
            category: 'structural',
          });
        }
        componentIds.add(component.id);

        // Validate component fields
        if (!component.name || component.name.trim() === '') {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Component ${component.id} must have a name`,
            suggestion: 'Provide descriptive component names',
            category: 'structural',
          });
        }

        // Validate influences reference existing components
        if (component.influencedBy) {
          for (const influencerId of component.influencedBy) {
            if (!componentIds.has(influencerId) && !thought.components.some(c => c.id === influencerId)) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Component ${component.id} references non-existent influencer ${influencerId}`,
                suggestion: 'Ensure all influences reference existing components',
                category: 'logical',
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
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Feedback loop ${loop.id} must have at least 2 components`,
            suggestion: 'Add more components to form a complete feedback loop',
            category: 'structural',
          });
        }

        // Validate all components exist
        if (loop.components) {
          for (const compId of loop.components) {
            if (!componentIds.has(compId)) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Loop ${loop.id} references non-existent component ${compId}`,
                suggestion: 'Ensure loop references existing components',
                category: 'logical',
              });
            }
          }
        }

        // Validate strength range
        if (loop.strength < 0 || loop.strength > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Loop ${loop.id} strength must be 0-1`,
            suggestion: 'Use decimal strength values between 0 and 1',
            category: 'structural',
          });
        }

        // Validate delay is non-negative
        if (loop.delay !== undefined && loop.delay < 0) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Loop ${loop.id} delay cannot be negative`,
            suggestion: 'Use non-negative delay values',
            category: 'structural',
          });
        }
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
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Leverage point ${leveragePoint.id} location ${leveragePoint.location} not found`,
            suggestion: 'Ensure leverage point references existing components or loops',
            category: 'logical',
          });
        }

        // Validate effectiveness range
        if (leveragePoint.effectiveness < 0 || leveragePoint.effectiveness > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Leverage point ${leveragePoint.id} effectiveness must be 0-1`,
            suggestion: 'Use decimal effectiveness values between 0 and 1',
            category: 'structural',
          });
        }

        // Validate difficulty range
        if (leveragePoint.difficulty < 0 || leveragePoint.difficulty > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Leverage point ${leveragePoint.id} difficulty must be 0-1`,
            suggestion: 'Use decimal difficulty values between 0 and 1',
            category: 'structural',
          });
        }
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
                severity: 'warning',
                thoughtNumber: thought.thoughtNumber,
                description: `Behavior ${behavior.id} references non-existent cause ${causeId}`,
                suggestion: 'Ensure behavior causes reference existing components or loops',
                category: 'logical',
              });
            }
          }
        }
      }
    }

    return issues;
  }
}
