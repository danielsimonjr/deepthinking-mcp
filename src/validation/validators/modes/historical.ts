/**
 * Historical Mode Validator (v9.1.0)
 * Uses composition with utility functions
 *
 * Validates historical reasoning (events, sources, periods, causal chains, actors)
 */

import type { HistoricalThought } from '../../../types/modes/historical.js';
import type { ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';
import { validateCommon, validateConfidence } from '../validation-utils.js';

/**
 * Validator for historical reasoning mode
 * Validates events, sources, periods, causal chains, and actors
 */
export class HistoricalValidator implements ModeValidator<HistoricalThought> {
  getMode(): string {
    return 'historical';
  }

  validate(thought: HistoricalThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

    // Collect all IDs for reference validation
    const eventIds = new Set(thought.events?.map(e => e.id) || []);
    const sourceIds = new Set(thought.sources?.map(s => s.id) || []);
    const periodIds = new Set(thought.periods?.map(p => p.id) || []);
    const actorIds = new Set(thought.actors?.map(a => a.id) || []);

    // Validate events
    if (thought.events) {
      issues.push(...this.validateEvents(thought, eventIds, sourceIds, actorIds));
    }

    // Validate sources
    if (thought.sources) {
      issues.push(...this.validateSources(thought, sourceIds));
    }

    // Validate periods
    if (thought.periods) {
      issues.push(...this.validatePeriods(thought, eventIds, actorIds));
    }

    // Validate causal chains
    if (thought.causalChains) {
      issues.push(...this.validateCausalChains(thought, eventIds, sourceIds));
    }

    // Validate actors
    if (thought.actors) {
      issues.push(...this.validateActors(thought, periodIds, actorIds));
    }

    // Validate aggregate reliability
    if (thought.aggregateReliability !== undefined) {
      issues.push(...validateConfidence(thought, thought.aggregateReliability, 'Aggregate reliability'));
    }

    return issues;
  }

  /**
   * Validate historical events
   */
  private validateEvents(
    thought: HistoricalThought,
    eventIds: Set<string>,
    sourceIds: Set<string>,
    actorIds: Set<string>
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const event of thought.events!) {
      // Validate required fields
      if (!event.name) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: `Event ${event.id} must have a name`,
          suggestion: 'Add a descriptive name for the event',
          category: IssueCategory.STRUCTURAL,
        });
      }

      if (!event.date) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: `Event ${event.id} must have a date`,
          suggestion: 'Add date as string or DateRange object',
          category: IssueCategory.STRUCTURAL,
        });
      }

      // Validate date range if provided
      if (typeof event.date === 'object' && event.date.start && event.date.end) {
        if (event.date.start > event.date.end) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Event ${event.id} date range is invalid (start > end)`,
            suggestion: 'Ensure date range start is before end',
            category: IssueCategory.LOGICAL,
          });
        }
      }

      // Validate cause/effect references
      if (event.causes) {
        for (const causeId of event.causes) {
          if (!eventIds.has(causeId)) {
            issues.push({
              severity: IssueSeverity.WARNING,
              thoughtNumber: thought.thoughtNumber,
              description: `Event ${event.id} references unknown cause event ${causeId}`,
              suggestion: 'Add the referenced cause event or remove the reference',
              category: IssueCategory.STRUCTURAL,
            });
          }
        }
      }

      if (event.effects) {
        for (const effectId of event.effects) {
          if (!eventIds.has(effectId)) {
            issues.push({
              severity: IssueSeverity.WARNING,
              thoughtNumber: thought.thoughtNumber,
              description: `Event ${event.id} references unknown effect event ${effectId}`,
              suggestion: 'Add the referenced effect event or remove the reference',
              category: IssueCategory.STRUCTURAL,
            });
          }
        }
      }

      // Validate source references
      if (event.sources) {
        for (const srcId of event.sources) {
          if (!sourceIds.has(srcId)) {
            issues.push({
              severity: IssueSeverity.WARNING,
              thoughtNumber: thought.thoughtNumber,
              description: `Event ${event.id} references unknown source ${srcId}`,
              suggestion: 'Add the referenced source or remove the reference',
              category: IssueCategory.STRUCTURAL,
            });
          }
        }
      }

      // Validate actor references
      if (event.actors) {
        for (const actorId of event.actors) {
          if (!actorIds.has(actorId)) {
            issues.push({
              severity: IssueSeverity.WARNING,
              thoughtNumber: thought.thoughtNumber,
              description: `Event ${event.id} references unknown actor ${actorId}`,
              suggestion: 'Add the referenced actor or remove the reference',
              category: IssueCategory.STRUCTURAL,
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Validate historical sources
   */
  private validateSources(thought: HistoricalThought, sourceIds: Set<string>): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const source of thought.sources!) {
      // Validate required fields
      if (!source.title) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: `Source ${source.id} must have a title`,
          suggestion: 'Add a title for the source',
          category: IssueCategory.STRUCTURAL,
        });
      }

      // Validate reliability range
      issues.push(...validateConfidence(thought, source.reliability, `Source ${source.id} reliability`));

      // Validate bias severity if present
      if (source.bias?.severity !== undefined) {
        issues.push(...validateConfidence(thought, source.bias.severity, `Source ${source.id} bias severity`));
      }

      // Validate corroboration references
      if (source.corroboratedBy) {
        for (const srcId of source.corroboratedBy) {
          if (!sourceIds.has(srcId)) {
            issues.push({
              severity: IssueSeverity.WARNING,
              thoughtNumber: thought.thoughtNumber,
              description: `Source ${source.id} corroboratedBy references unknown source ${srcId}`,
              suggestion: 'Add the referenced source or remove the reference',
              category: IssueCategory.STRUCTURAL,
            });
          }
        }
      }

      if (source.contradictedBy) {
        for (const srcId of source.contradictedBy) {
          if (!sourceIds.has(srcId)) {
            issues.push({
              severity: IssueSeverity.WARNING,
              thoughtNumber: thought.thoughtNumber,
              description: `Source ${source.id} contradictedBy references unknown source ${srcId}`,
              suggestion: 'Add the referenced source or remove the reference',
              category: IssueCategory.STRUCTURAL,
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Validate historical periods
   */
  private validatePeriods(
    thought: HistoricalThought,
    eventIds: Set<string>,
    actorIds: Set<string>
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const period of thought.periods!) {
      // Validate required fields
      if (!period.name) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: `Period ${period.id} must have a name`,
          suggestion: 'Add a descriptive name for the period',
          category: IssueCategory.STRUCTURAL,
        });
      }

      // Validate date order
      if (period.startDate && period.endDate && period.startDate > period.endDate) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: `Period ${period.id} startDate must be before endDate`,
          suggestion: 'Ensure chronological order: startDate < endDate',
          category: IssueCategory.LOGICAL,
        });
      }

      // Validate key event references
      if (period.keyEvents) {
        for (const eventId of period.keyEvents) {
          if (!eventIds.has(eventId)) {
            issues.push({
              severity: IssueSeverity.WARNING,
              thoughtNumber: thought.thoughtNumber,
              description: `Period ${period.id} references unknown event ${eventId}`,
              suggestion: 'Add the referenced event or remove the reference',
              category: IssueCategory.STRUCTURAL,
            });
          }
        }
      }

      // Validate key actor references
      if (period.keyActors) {
        for (const actorId of period.keyActors) {
          if (!actorIds.has(actorId)) {
            issues.push({
              severity: IssueSeverity.WARNING,
              thoughtNumber: thought.thoughtNumber,
              description: `Period ${period.id} references unknown actor ${actorId}`,
              suggestion: 'Add the referenced actor or remove the reference',
              category: IssueCategory.STRUCTURAL,
            });
          }
        }
      }

      // Validate characteristics non-empty
      if (!period.characteristics || period.characteristics.length === 0) {
        issues.push({
          severity: IssueSeverity.WARNING,
          thoughtNumber: thought.thoughtNumber,
          description: `Period ${period.id} should have at least one characteristic`,
          suggestion: 'Add characteristics that define this historical period',
          category: IssueCategory.LOGICAL,
        });
      }
    }

    return issues;
  }

  /**
   * Validate causal chains
   */
  private validateCausalChains(
    thought: HistoricalThought,
    eventIds: Set<string>,
    sourceIds: Set<string>
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const chain of thought.causalChains!) {
      // Validate required fields
      if (!chain.name) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: `CausalChain ${chain.id} must have a name`,
          suggestion: 'Add a descriptive name for the causal chain',
          category: IssueCategory.STRUCTURAL,
        });
      }

      // Validate links exist
      if (!chain.links || chain.links.length === 0) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: `CausalChain ${chain.id} must have at least one link`,
          suggestion: 'Add causal links to the chain',
          category: IssueCategory.STRUCTURAL,
        });
      }

      // Validate chain confidence
      issues.push(...validateConfidence(thought, chain.confidence, `CausalChain ${chain.id} confidence`));

      // Validate each link
      if (chain.links) {
        for (let i = 0; i < chain.links.length; i++) {
          const link = chain.links[i];

          // Validate cause reference
          if (!eventIds.has(link.cause)) {
            issues.push({
              severity: IssueSeverity.ERROR,
              thoughtNumber: thought.thoughtNumber,
              description: `CausalChain ${chain.id} link ${i} references unknown cause event ${link.cause}`,
              suggestion: 'Add the referenced cause event',
              category: IssueCategory.STRUCTURAL,
            });
          }

          // Validate effect reference
          if (!eventIds.has(link.effect)) {
            issues.push({
              severity: IssueSeverity.ERROR,
              thoughtNumber: thought.thoughtNumber,
              description: `CausalChain ${chain.id} link ${i} references unknown effect event ${link.effect}`,
              suggestion: 'Add the referenced effect event',
              category: IssueCategory.STRUCTURAL,
            });
          }

          // Validate link confidence
          issues.push(...validateConfidence(thought, link.confidence, `CausalChain ${chain.id} link ${i} confidence`));

          // Validate evidence references
          if (link.evidence) {
            for (const srcId of link.evidence) {
              if (!sourceIds.has(srcId)) {
                issues.push({
                  severity: IssueSeverity.WARNING,
                  thoughtNumber: thought.thoughtNumber,
                  description: `CausalChain ${chain.id} link ${i} references unknown source ${srcId}`,
                  suggestion: 'Add the referenced source or remove the reference',
                  category: IssueCategory.STRUCTURAL,
                });
              }
            }
          }
        }

        // Check chain continuity - each effect should be cause of next link
        for (let i = 0; i < chain.links.length - 1; i++) {
          if (chain.links[i].effect !== chain.links[i + 1].cause) {
            issues.push({
              severity: IssueSeverity.WARNING,
              thoughtNumber: thought.thoughtNumber,
              description: `CausalChain ${chain.id} has discontinuity between links ${i} and ${i + 1}`,
              suggestion: 'Ensure each link effect is the cause of the next link for chain continuity',
              category: IssueCategory.LOGICAL,
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Validate historical actors
   */
  private validateActors(
    thought: HistoricalThought,
    periodIds: Set<string>,
    actorIds: Set<string>
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const actor of thought.actors!) {
      // Validate required fields
      if (!actor.name) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: `Actor ${actor.id} must have a name`,
          suggestion: 'Add a name for the actor',
          category: IssueCategory.STRUCTURAL,
        });
      }

      // Validate period reference
      if (actor.period && !periodIds.has(actor.period)) {
        issues.push({
          severity: IssueSeverity.WARNING,
          thoughtNumber: thought.thoughtNumber,
          description: `Actor ${actor.id} references unknown period ${actor.period}`,
          suggestion: 'Add the referenced period or remove the reference',
          category: IssueCategory.STRUCTURAL,
        });
      }

      // Validate relationship references
      if (actor.relationships) {
        for (const rel of actor.relationships) {
          if (!actorIds.has(rel.actorId)) {
            issues.push({
              severity: IssueSeverity.WARNING,
              thoughtNumber: thought.thoughtNumber,
              description: `Actor ${actor.id} has relationship with unknown actor ${rel.actorId}`,
              suggestion: 'Add the referenced actor or remove the relationship',
              category: IssueCategory.STRUCTURAL,
            });
          }
        }
      }
    }

    return issues;
  }
}
