/**
 * ExampleMode Validator Template
 *
 * INSTRUCTIONS:
 * 1. Copy this file to: src/validation/validators/modes/yourmode.ts
 * 2. Replace "ExampleMode" with your mode name (PascalCase)
 * 3. Replace "examplemode" with your mode name (lowercase)
 * 4. Implement your validation logic
 * 5. Register in src/validation/validator.ts
 * 6. Remove this instruction block
 */

import { ExampleModeThought, ValidationIssue } from '../../../types/index.js';
import { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

/**
 * Validator for ExampleMode reasoning mode
 *
 * CUSTOMIZE: Add description of what this validator checks
 */
export class ExampleModeValidator extends BaseValidator<ExampleModeThought> {
  /**
   * Returns the mode identifier
   * CUSTOMIZE: Replace 'examplemode' with your mode name (lowercase)
   */
  getMode(): string {
    return 'examplemode';
  }

  /**
   * Validate ExampleMode thought
   *
   * CUSTOMIZE: Implement your mode-specific validation rules
   *
   * @param thought - The thought to validate
   * @param _context - Validation context (session info, etc.)
   * @returns Array of validation issues (empty if valid)
   */
  validate(thought: ExampleModeThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // REQUIRED: Always include common validation (content, thoughtNumber, etc.)
    issues.push(...this.validateCommon(thought));

    // ============================================================
    // MODE-SPECIFIC VALIDATION
    // ============================================================
    // CUSTOMIZE: Add your validation rules here
    //
    // Common validation patterns:
    //
    // 1. Required field validation:
    //    if (!thought.requiredField) {
    //      issues.push({
    //        severity: 'error',
    //        thoughtNumber: thought.thoughtNumber,
    //        description: 'requiredField is missing',
    //        suggestion: 'Add the requiredField property',
    //        category: 'structural',
    //      });
    //    }
    //
    // 2. Range validation:
    //    if (thought.confidence !== undefined && (thought.confidence < 0 || thought.confidence > 1)) {
    //      issues.push({
    //        severity: 'error',
    //        thoughtNumber: thought.thoughtNumber,
    //        description: 'confidence must be between 0 and 1',
    //        suggestion: 'Use decimal values in range [0, 1]',
    //        category: 'structural',
    //      });
    //    }
    //
    // 3. Reference validation:
    //    if (thought.relationships) {
    //      const entityIds = new Set(thought.entities?.map(e => e.id) || []);
    //      for (const rel of thought.relationships) {
    //        if (!entityIds.has(rel.from)) {
    //          issues.push({
    //            severity: 'error',
    //            thoughtNumber: thought.thoughtNumber,
    //            description: `Relationship references non-existent entity: ${rel.from}`,
    //            suggestion: 'Ensure all relationship references point to existing entities',
    //            category: 'reference',
    //          });
    //        }
    //      }
    //    }
    //
    // 4. Logical consistency:
    //    if (thought.startTime !== undefined && thought.endTime !== undefined) {
    //      if (thought.startTime >= thought.endTime) {
    //        issues.push({
    //          severity: 'error',
    //          thoughtNumber: thought.thoughtNumber,
    //          description: 'startTime must be before endTime',
    //          suggestion: 'Ensure chronological order',
    //          category: 'logical',
    //        });
    //      }
    //    }
    //
    // 5. Array validation:
    //    if (thought.items && thought.items.length === 0) {
    //      issues.push({
    //        severity: 'warning',
    //        thoughtNumber: thought.thoughtNumber,
    //        description: 'items array is empty',
    //        suggestion: 'Add at least one item or remove the property',
    //        category: 'semantic',
    //      });
    //    }
    //
    // VALIDATION CATEGORIES:
    // - 'structural': Missing fields, type mismatches, invalid structure
    // - 'logical': Logical inconsistencies (e.g., A > B when A should be < B)
    // - 'semantic': Meaning issues (e.g., empty arrays, nonsensical values)
    // - 'reference': Broken references (e.g., ID doesn't exist)
    //
    // SEVERITY LEVELS:
    // - 'error': Critical issues that prevent proper processing
    // - 'warning': Issues that should be addressed but don't break functionality
    // - 'info': Suggestions for improvement
    //
    // REPLACE THIS COMMENT BLOCK WITH YOUR VALIDATION LOGIC

    return issues;
  }
}
