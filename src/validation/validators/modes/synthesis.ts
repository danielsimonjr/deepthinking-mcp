/**
 * Synthesis Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 *
 * Validates:
 * - Source quality assessment completeness
 * - Theme extraction rigor
 * - Gap identification structure
 * - Framework development coherence
 */

import type { ValidationIssue } from '../../../types/index.js';
import type { SynthesisThought } from '../../../types/modes/synthesis.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { validateCommon, validateProbability } from '../validation-utils.js';

/**
 * Validator for synthesis reasoning mode
 */
export class SynthesisValidator implements ModeValidator<SynthesisThought> {
  getMode(): string {
    return 'synthesis';
  }

  validate(thought: SynthesisThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

    // Validate thought type if specified
    const validThoughtTypes = [
      'source_identification', 'source_evaluation', 'theme_extraction',
      'pattern_integration', 'gap_identification', 'synthesis_construction',
      'framework_development'
    ];

    if (thought.thoughtType && !validThoughtTypes.includes(thought.thoughtType)) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Unknown synthesis thought type: ${thought.thoughtType}`,
        suggestion: `Use one of: ${validThoughtTypes.join(', ')}`,
        category: 'structural',
      });
    }

    // Validate sources if present
    if (thought.sources && thought.sources.length > 0) {
      const validSourceTypes = [
        'journal_article', 'conference_paper', 'book', 'book_chapter',
        'thesis', 'preprint', 'technical_report', 'review_article',
        'meta_analysis', 'grey_literature', 'dataset', 'other'
      ];

      for (const source of thought.sources) {
        if (source.type && !validSourceTypes.includes(source.type)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid source type: ${source.type}`,
            suggestion: `Use one of: ${validSourceTypes.join(', ')}`,
            category: 'structural',
          });
        }

        // Validate quality metrics are 0-1
        if (source.quality) {
          if (source.quality.methodologicalRigor !== undefined) {
            issues.push(...validateProbability(thought, source.quality.methodologicalRigor, `source "${source.id}" methodological rigor`));
          }
          if (source.quality.relevance !== undefined) {
            issues.push(...validateProbability(thought, source.quality.relevance, `source "${source.id}" relevance`));
          }
          if (source.quality.recency !== undefined) {
            issues.push(...validateProbability(thought, source.quality.recency, `source "${source.id}" recency`));
          }
          if (source.quality.authorCredibility !== undefined) {
            issues.push(...validateProbability(thought, source.quality.authorCredibility, `source "${source.id}" author credibility`));
          }
          if (source.quality.overallQuality !== undefined) {
            issues.push(...validateProbability(thought, source.quality.overallQuality, `source "${source.id}" overall quality`));
          }
        }
      }
    }

    // Validate concepts if present
    if (thought.concepts && thought.concepts.length > 0) {
      for (const concept of thought.concepts) {
        // Validate importance is 0-1
        if (concept.importance !== undefined) {
          issues.push(...validateProbability(thought, concept.importance, `concept "${concept.term}" importance`));
        }

        // Validate frequency is non-negative
        if (concept.frequency !== undefined && concept.frequency < 0) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Concept "${concept.term}" has negative frequency: ${concept.frequency}`,
            suggestion: 'Frequency should be a non-negative number',
            category: 'logical',
          });
        }
      }
    }

    // Validate themes if present
    if (thought.themes && thought.themes.length > 0) {
      const validConsensusLevels = ['strong', 'moderate', 'weak', 'contested'];

      for (const theme of thought.themes) {
        // Validate strength is 0-1
        if (theme.strength !== undefined) {
          issues.push(...validateProbability(thought, theme.strength, `theme "${theme.name}" strength`));
        }

        if (theme.consensus && !validConsensusLevels.includes(theme.consensus)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual consensus level: ${theme.consensus}`,
            suggestion: `Consider using: ${validConsensusLevels.join(', ')}`,
            category: 'structural',
          });
        }
      }
    }

    // Validate findings if present
    if (thought.findings && thought.findings.length > 0) {
      const validEvidenceStrengths = ['strong', 'moderate', 'weak', 'conflicting'];
      const validReplicationStatuses = ['replicated', 'partial', 'not_replicated', 'unknown'];

      for (const finding of thought.findings) {
        if (finding.evidenceStrength && !validEvidenceStrengths.includes(finding.evidenceStrength)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid evidence strength: ${finding.evidenceStrength}`,
            suggestion: `Use one of: ${validEvidenceStrengths.join(', ')}`,
            category: 'structural',
          });
        }

        if (finding.replicationStatus && !validReplicationStatuses.includes(finding.replicationStatus)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual replication status: ${finding.replicationStatus}`,
            suggestion: `Consider using: ${validReplicationStatuses.join(', ')}`,
            category: 'structural',
          });
        }
      }
    }

    // Validate patterns if present
    if (thought.patterns && thought.patterns.length > 0) {
      const validPatternTypes = ['trend', 'correlation', 'causal', 'methodological', 'theoretical'];

      for (const pattern of thought.patterns) {
        if (pattern.type && !validPatternTypes.includes(pattern.type)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid pattern type: ${pattern.type}`,
            suggestion: `Use one of: ${validPatternTypes.join(', ')}`,
            category: 'structural',
          });
        }

        // Validate confidence is 0-1
        if (pattern.confidence !== undefined) {
          issues.push(...validateProbability(thought, pattern.confidence, `pattern "${pattern.name}" confidence`));
        }
      }
    }

    // Validate relations if present
    if (thought.relations && thought.relations.length > 0) {
      const validRelationTypes = ['causes', 'correlates', 'contradicts', 'supports', 'extends', 'refines', 'subsumes'];

      for (const relation of thought.relations) {
        if (relation.type && !validRelationTypes.includes(relation.type)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid relation type: ${relation.type}`,
            suggestion: `Use one of: ${validRelationTypes.join(', ')}`,
            category: 'structural',
          });
        }

        // Validate strength is 0-1
        if (relation.strength !== undefined) {
          issues.push(...validateProbability(thought, relation.strength, `relation "${relation.id}" strength`));
        }
      }
    }

    // Validate gaps if present
    if (thought.gaps && thought.gaps.length > 0) {
      const validGapTypes = ['empirical', 'theoretical', 'methodological', 'population', 'contextual'];
      const validImportanceLevels = ['critical', 'significant', 'moderate', 'minor'];

      for (const gap of thought.gaps) {
        if (gap.type && !validGapTypes.includes(gap.type)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid gap type: ${gap.type}`,
            suggestion: `Use one of: ${validGapTypes.join(', ')}`,
            category: 'structural',
          });
        }

        if (gap.importance && !validImportanceLevels.includes(gap.importance)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual gap importance: ${gap.importance}`,
            suggestion: `Consider using: ${validImportanceLevels.join(', ')}`,
            category: 'structural',
          });
        }
      }
    }

    // Validate framework if present (note: it's 'framework' not 'synthesisFramework')
    if (thought.framework) {
      // Validate relationships have valid types
      if (thought.framework.relationships && thought.framework.relationships.length > 0) {
        const validRelTypes = ['causes', 'correlates', 'contradicts', 'supports', 'extends', 'refines', 'subsumes'];
        for (const rel of thought.framework.relationships) {
          if (rel.type && !validRelTypes.includes(rel.type)) {
            issues.push({
              severity: 'warning',
              thoughtNumber: thought.thoughtNumber,
              description: `Invalid framework relationship type: ${rel.type}`,
              suggestion: `Use one of: ${validRelTypes.join(', ')}`,
              category: 'structural',
            });
          }

          // Validate strength is 0-1
          if (rel.strength !== undefined) {
            issues.push(...validateProbability(thought, rel.strength, 'framework relation strength'));
          }
        }
      }
    }

    // Validate conclusions if present
    if (thought.conclusions && thought.conclusions.length > 0) {
      for (const conclusion of thought.conclusions) {
        // Validate confidence is 0-1
        if (conclusion.confidence !== undefined) {
          issues.push(...validateProbability(thought, conclusion.confidence, 'conclusion confidence'));
        }
      }
    }

    return issues;
  }
}
