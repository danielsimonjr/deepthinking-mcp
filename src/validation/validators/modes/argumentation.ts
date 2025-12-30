/**
 * Argumentation Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 *
 * Validates:
 * - Toulmin argument structure completeness
 * - Warrant-grounds-claim connections
 * - Dialectic thesis-antithesis-synthesis structure
 * - Rhetorical strategy appropriateness
 */

import type { ValidationIssue } from '../../../types/index.js';
import type { ArgumentationThought } from '../../../types/modes/argumentation.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { validateCommon, validateProbability } from '../validation-utils.js';

/**
 * Validator for argumentation reasoning mode
 */
export class ArgumentationValidator implements ModeValidator<ArgumentationThought> {
  getMode(): string {
    return 'argumentation';
  }

  validate(thought: ArgumentationThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

    // Validate thought type if specified
    const validThoughtTypes = [
      'claim_formulation', 'grounds_identification', 'warrant_construction',
      'backing_provision', 'rebuttal_anticipation', 'qualifier_specification',
      'argument_assembly', 'dialectic_analysis'
    ];

    if (thought.thoughtType && !validThoughtTypes.includes(thought.thoughtType)) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Unknown argumentation thought type: ${thought.thoughtType}`,
        suggestion: `Use one of: ${validThoughtTypes.join(', ')}`,
        category: 'structural',
      });
    }

    // Validate claims if present
    if (thought.claims && thought.claims.length > 0) {
      const validClaimTypes = ['fact', 'value', 'policy', 'definition', 'cause'];
      const validScopes = ['universal', 'general', 'particular'];
      const validStrengths = ['strong', 'moderate', 'tentative'];

      for (const claim of thought.claims) {
        if (claim.type && !validClaimTypes.includes(claim.type)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid claim type: ${claim.type}`,
            suggestion: `Use one of: ${validClaimTypes.join(', ')}`,
            category: 'structural',
          });
        }

        if (claim.scope && !validScopes.includes(claim.scope)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual claim scope: ${claim.scope}`,
            suggestion: `Consider using: ${validScopes.join(', ')}`,
            category: 'structural',
          });
        }

        // Note: claim.strength is a string ('strong' | 'moderate' | 'tentative'), not a number
        if (claim.strength && !validStrengths.includes(claim.strength)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual claim strength: ${claim.strength}`,
            suggestion: `Consider using: ${validStrengths.join(', ')}`,
            category: 'structural',
          });
        }
      }
    }

    // Validate grounds if present
    if (thought.grounds && thought.grounds.length > 0) {
      const validGroundTypes = ['empirical', 'statistical', 'testimonial', 'analogical', 'logical', 'textual'];
      const validSufficiencyLevels = ['sufficient', 'partial', 'insufficient'];

      for (const ground of thought.grounds) {
        if (ground.type && !validGroundTypes.includes(ground.type)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid ground type: ${ground.type}`,
            suggestion: `Use one of: ${validGroundTypes.join(', ')}`,
            category: 'structural',
          });
        }

        // Validate reliability is 0-1
        if (ground.reliability !== undefined) {
          issues.push(...validateProbability(thought, ground.reliability, 'ground reliability'));
        }

        // Validate relevance is 0-1
        if (ground.relevance !== undefined) {
          issues.push(...validateProbability(thought, ground.relevance, 'ground relevance'));
        }

        if (ground.sufficiency && !validSufficiencyLevels.includes(ground.sufficiency)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual sufficiency level: ${ground.sufficiency}`,
            suggestion: `Consider using: ${validSufficiencyLevels.join(', ')}`,
            category: 'structural',
          });
        }
      }
    }

    // Validate warrants if present
    if (thought.warrants && thought.warrants.length > 0) {
      const validWarrantTypes = ['generalization', 'analogy', 'causal', 'authority', 'principle', 'definition'];

      for (const warrant of thought.warrants) {
        if (warrant.type && !validWarrantTypes.includes(warrant.type)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid warrant type: ${warrant.type}`,
            suggestion: `Use one of: ${validWarrantTypes.join(', ')}`,
            category: 'structural',
          });
        }

        // Validate strength is 0-1
        if (warrant.strength !== undefined) {
          issues.push(...validateProbability(thought, warrant.strength, 'warrant strength'));
        }
      }
    }

    // Validate backings if present
    if (thought.backings && thought.backings.length > 0) {
      const validBackingTypes = ['theoretical', 'empirical', 'authoritative', 'definitional', 'precedent'];

      for (const backing of thought.backings) {
        if (backing.type && !validBackingTypes.includes(backing.type)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid backing type: ${backing.type}`,
            suggestion: `Use one of: ${validBackingTypes.join(', ')}`,
            category: 'structural',
          });
        }

        // Validate credibility is 0-1
        if (backing.credibility !== undefined) {
          issues.push(...validateProbability(thought, backing.credibility, 'backing credibility'));
        }
      }
    }

    // Validate qualifiers if present
    if (thought.qualifiers && thought.qualifiers.length > 0) {
      for (const qualifier of thought.qualifiers) {
        // Validate certainty is 0-1
        if (qualifier.certainty !== undefined) {
          issues.push(...validateProbability(thought, qualifier.certainty, 'qualifier certainty'));
        }
      }
    }

    // Validate rebuttals if present
    if (thought.rebuttals && thought.rebuttals.length > 0) {
      const validRebuttalTypes = ['factual', 'logical', 'ethical', 'practical', 'definitional'];
      const validRebuttalStrengths = ['strong', 'moderate', 'weak'];
      const validTargets = ['claim', 'grounds', 'warrant', 'backing'];

      for (const rebuttal of thought.rebuttals) {
        if (rebuttal.type && !validRebuttalTypes.includes(rebuttal.type)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid rebuttal type: ${rebuttal.type}`,
            suggestion: `Use one of: ${validRebuttalTypes.join(', ')}`,
            category: 'structural',
          });
        }

        if (rebuttal.strength && !validRebuttalStrengths.includes(rebuttal.strength)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual rebuttal strength: ${rebuttal.strength}`,
            suggestion: `Consider using: ${validRebuttalStrengths.join(', ')}`,
            category: 'structural',
          });
        }

        if (rebuttal.targetElement && !validTargets.includes(rebuttal.targetElement)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid rebuttal target: ${rebuttal.targetElement}`,
            suggestion: `Use one of: ${validTargets.join(', ')}`,
            category: 'structural',
          });
        }

        // Validate response effectiveness if present
        if (rebuttal.response?.effectiveness !== undefined) {
          issues.push(...validateProbability(thought, rebuttal.response.effectiveness, 'rebuttal response effectiveness'));
        }
      }
    }

    // Validate dialectic if present (note: no 'exchanges' property)
    if (thought.dialectic) {
      const validResolutions = ['thesis_prevails', 'antithesis_prevails', 'synthesis_achieved', 'unresolved'];
      if (thought.dialectic.resolution && !validResolutions.includes(thought.dialectic.resolution)) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: `Invalid dialectic resolution: ${thought.dialectic.resolution}`,
          suggestion: `Use one of: ${validResolutions.join(', ')}`,
          category: 'structural',
        });
      }
    }

    // Validate rhetorical strategies if present (note: uses 'appeal' not 'type')
    if (thought.rhetoricalStrategies && thought.rhetoricalStrategies.length > 0) {
      const validAppeals = ['ethos', 'pathos', 'logos'];
      const validAppropriateness = ['appropriate', 'questionable', 'inappropriate'];

      for (const strategy of thought.rhetoricalStrategies) {
        if (strategy.appeal && !validAppeals.includes(strategy.appeal)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid rhetorical appeal: ${strategy.appeal}`,
            suggestion: `Use one of: ${validAppeals.join(', ')}`,
            category: 'structural',
          });
        }

        if (strategy.appropriateness && !validAppropriateness.includes(strategy.appropriateness)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual appropriateness value: ${strategy.appropriateness}`,
            suggestion: `Consider using: ${validAppropriateness.join(', ')}`,
            category: 'structural',
          });
        }

        // Validate effectiveness is 0-1
        if (strategy.effectiveness !== undefined) {
          issues.push(...validateProbability(thought, strategy.effectiveness, 'rhetorical strategy effectiveness'));
        }
      }
    }

    // Validate fallacies if present (note: severity is a string, not a number)
    if (thought.fallacies && thought.fallacies.length > 0) {
      const validCategories = ['formal', 'informal'];
      const validSeverities = ['critical', 'significant', 'minor'];

      for (const fallacy of thought.fallacies) {
        if (fallacy.category && !validCategories.includes(fallacy.category)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid fallacy category: ${fallacy.category}`,
            suggestion: `Use one of: ${validCategories.join(', ')}`,
            category: 'structural',
          });
        }

        if (fallacy.severity && !validSeverities.includes(fallacy.severity)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual fallacy severity: ${fallacy.severity}`,
            suggestion: `Consider using: ${validSeverities.join(', ')}`,
            category: 'structural',
          });
        }
      }
    }

    // Validate argument strength is 0-1
    if (thought.argumentStrength !== undefined) {
      issues.push(...validateProbability(thought, thought.argumentStrength, 'argument strength'));
    }

    // Validate arguments if present
    if (thought.arguments && thought.arguments.length > 0) {
      for (const arg of thought.arguments) {
        // Validate overall strength
        if (arg.overallStrength !== undefined) {
          issues.push(...validateProbability(thought, arg.overallStrength, `argument "${arg.id}" overall strength`));
        }
      }
    }

    // Validate current argument if present
    if (thought.currentArgument) {
      if (thought.currentArgument.overallStrength !== undefined) {
        issues.push(...validateProbability(thought, thought.currentArgument.overallStrength, 'current argument strength'));
      }
    }

    return issues;
  }
}
