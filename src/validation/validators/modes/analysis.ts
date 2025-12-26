/**
 * Analysis Mode Validator (v7.4.0)
 * Phase 13: Validates qualitative analysis thoughts
 *
 * Validates:
 * - Analysis methodology appropriateness
 * - Coding structure validity
 * - Theme development rigor
 * - Qualitative analysis framework adherence
 */

import { ValidationIssue } from '../../../types/index.js';
import type { AnalysisThought } from '../../../types/modes/analysis.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class AnalysisValidator extends BaseValidator<AnalysisThought> {
  getMode(): string {
    return 'analysis';
  }

  validate(thought: AnalysisThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate thought type if specified
    const validThoughtTypes = [
      'data_familiarization', 'initial_coding', 'focused_coding',
      'theme_development', 'theme_refinement', 'theoretical_integration',
      'memo_writing', 'saturation_assessment'
    ];

    if (thought.thoughtType && !validThoughtTypes.includes(thought.thoughtType)) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Unknown analysis thought type: ${thought.thoughtType}`,
        suggestion: `Use one of: ${validThoughtTypes.join(', ')}`,
        category: 'structural',
      });
    }

    // Validate methodology if specified (it's a string union, not an object)
    const validMethods = [
      'thematic_analysis', 'grounded_theory', 'discourse_analysis',
      'content_analysis', 'phenomenological', 'narrative_analysis',
      'framework_analysis', 'template_analysis', 'mixed_qualitative'
    ];

    if (thought.methodology && !validMethods.includes(thought.methodology)) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Unknown analysis methodology: ${thought.methodology}`,
        suggestion: `Use one of: ${validMethods.join(', ')}`,
        category: 'structural',
      });
    }

    // Validate current codes if present
    if (thought.currentCodes && thought.currentCodes.length > 0) {
      for (const code of thought.currentCodes) {
        // Validate code type
        const validCodeTypes = [
          'descriptive', 'in_vivo', 'process', 'initial', 'focused',
          'axial', 'theoretical', 'emotion', 'value', 'versus', 'evaluation'
        ];
        if (code.type && !validCodeTypes.includes(code.type)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual code type: ${code.type}`,
            suggestion: `Consider using: ${validCodeTypes.slice(0, 5).join(', ')}...`,
            category: 'structural',
          });
        }

        // Validate frequency is positive
        if (code.frequency !== undefined && code.frequency < 0) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Code "${code.label}" has negative frequency: ${code.frequency}`,
            suggestion: 'Frequency should be a non-negative integer',
            category: 'logical',
          });
        }
      }
    }

    // Validate grounded theory categories if present
    if (thought.gtCategories && thought.gtCategories.length > 0) {
      const validSaturationLevels = ['saturated', 'developing', 'sparse'];
      for (const category of thought.gtCategories) {
        // Validate saturation level (it's a string enum, not a number)
        if (category.saturation && !validSaturationLevels.includes(category.saturation)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid saturation level for category "${category.name}": ${category.saturation}`,
            suggestion: `Use one of: ${validSaturationLevels.join(', ')}`,
            category: 'structural',
          });
        }
      }
    }

    // Validate themes if present
    if (thought.themes && thought.themes.length > 0) {
      const validLevels = ['initial', 'candidate', 'refined', 'final'];
      for (const theme of thought.themes) {
        // Validate theme level
        if (theme.level && !validLevels.includes(theme.level)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual theme level: ${theme.level}`,
            suggestion: `Consider using: ${validLevels.join(', ')}`,
            category: 'structural',
          });
        }

        // Validate prevalence is 0-1
        if (theme.prevalence !== undefined) {
          issues.push(...this.validateProbability(thought, theme.prevalence, `theme "${theme.name}" prevalence`));
        }

        // Validate richness is 0-1
        if (theme.richness !== undefined) {
          issues.push(...this.validateProbability(thought, theme.richness, `theme "${theme.name}" richness`));
        }
      }
    }

    // Validate memos if present
    if (thought.memos && thought.memos.length > 0) {
      const validMemoTypes = ['code_memo', 'theoretical_memo', 'operational_memo', 'analytical_memo', 'reflective_memo'];
      for (const memo of thought.memos) {
        if (memo.type && !validMemoTypes.includes(memo.type)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual memo type: ${memo.type}`,
            suggestion: `Consider using: ${validMemoTypes.join(', ')}`,
            category: 'structural',
          });
        }
      }
    }

    // Validate coding progress
    if (thought.codingProgress) {
      if (thought.codingProgress.segmentsCoded > thought.codingProgress.totalSegments) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Coded segments exceeds total segments',
          suggestion: 'Check coding progress values',
          category: 'logical',
        });
      }

      // Validate percent complete is 0-100
      if (thought.codingProgress.percentComplete !== undefined) {
        if (thought.codingProgress.percentComplete < 0 || thought.codingProgress.percentComplete > 100) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid percent complete: ${thought.codingProgress.percentComplete}`,
            suggestion: 'Percent complete should be between 0 and 100',
            category: 'logical',
          });
        }
      }
    }

    // Validate data sources if present
    if (thought.dataSources && thought.dataSources.length > 0) {
      for (const source of thought.dataSources) {
        // Validate quality is 0-1
        if (source.quality !== undefined) {
          issues.push(...this.validateProbability(thought, source.quality, `data source "${source.id}" quality`));
        }
      }
    }

    // Validate rigor assessment if present
    if (thought.rigorAssessment) {
      const rigor = thought.rigorAssessment;
      if (rigor.credibility?.rating !== undefined) {
        issues.push(...this.validateProbability(thought, rigor.credibility.rating, 'credibility rating'));
      }
      if (rigor.transferability?.rating !== undefined) {
        issues.push(...this.validateProbability(thought, rigor.transferability.rating, 'transferability rating'));
      }
      if (rigor.dependability?.rating !== undefined) {
        issues.push(...this.validateProbability(thought, rigor.dependability.rating, 'dependability rating'));
      }
      if (rigor.confirmability?.rating !== undefined) {
        issues.push(...this.validateProbability(thought, rigor.confirmability.rating, 'confirmability rating'));
      }
    }

    return issues;
  }
}
