/**
 * ExampleModeHandler - ModeHandler Template (v8+ Architecture)
 *
 * INSTRUCTIONS:
 * 1. Copy this file to: src/modes/handlers/YourModeHandler.ts
 * 2. Replace "ExampleMode" with your mode name (PascalCase)
 * 3. Replace "examplemode" with your mode name (lowercase)
 * 4. Replace "EXAMPLEMODE" with your mode name (UPPERCASE)
 * 5. Implement createThought, validate, and optionally getEnhancements
 * 6. Export from src/modes/handlers/index.ts
 * 7. Register with ModeHandlerRegistry (automatic via index.ts)
 * 8. Remove this instruction block
 *
 * REFERENCE: See src/modes/handlers/SequentialHandler.ts for a complete example
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, ExampleModeThought } from '../../types/core.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * ExampleModeHandler - Specialized handler for ExampleMode reasoning
 *
 * TODO: Add description of what this handler provides
 */
export class ExampleModeHandler implements ModeHandler {
  readonly mode = ThinkingMode.EXAMPLEMODE;
  readonly modeName = 'ExampleMode Thinking';
  readonly description = 'TODO: Brief description of this reasoning mode';

  /**
   * Supported thought types for this mode
   * TODO: Define your mode's thought sub-types
   */
  private readonly supportedThoughtTypes = [
    'step_type_1',
    'step_type_2',
    'step_type_3',
  ];

  /**
   * Create a thought from input
   *
   * Maps MCP tool input to your ExampleModeThought type.
   * This is where you construct the thought object with mode-specific properties.
   */
  createThought(input: ThinkingToolInput, sessionId: string): ExampleModeThought {
    // Cast to any to access mode-specific properties not in base type
    const inputAny = input as any;

    return {
      // Base thought properties (required)
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.EXAMPLEMODE,

      // Common optional properties
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
      revisionReason: input.revisionReason,
      dependencies: input.dependencies || [],
      branchFrom: input.branchFrom,
      branchId: input.branchId,
      uncertainty: input.uncertainty,
      assumptions: input.assumptions || [],

      // Mode-specific thought type
      thoughtType: inputAny.thoughtType,

      // ============================================================
      // MODE-SPECIFIC PROPERTIES
      // ============================================================
      //
      // Map input properties to thought properties.
      //
      // Examples:
      //
      // Simple mapping:
      //   hypothesis: inputAny.hypothesis,
      //   confidence: inputAny.confidence,
      //
      // With defaults:
      //   observations: inputAny.observations || [],
      //   priority: inputAny.priority || 'medium',
      //
      // With transformation:
      //   entities: (inputAny.entities || []).map((e: any) => ({
      //     ...e,
      //     createdAt: new Date(),
      //   })),
      //
      // REPLACE THIS COMMENT BLOCK WITH YOUR PROPERTY MAPPINGS
    };
  }

  /**
   * Validate mode-specific input
   *
   * Performs semantic validation beyond schema validation.
   * Return validation errors for critical issues, warnings for suggestions.
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const warnings = [];
    const inputAny = input as any;

    // ============================================================
    // BASIC VALIDATION (keep these)
    // ============================================================

    // Required: thought content
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    // Required: valid thought number
    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // ============================================================
    // MODE-SPECIFIC VALIDATION
    // ============================================================
    //
    // Add your validation rules here.
    //
    // Examples:
    //
    // Required field:
    //   if (!inputAny.hypothesis) {
    //     return validationFailure([
    //       createValidationError('hypothesis', 'Hypothesis is required for this mode', 'MISSING_HYPOTHESIS'),
    //     ]);
    //   }
    //
    // Range validation:
    //   if (inputAny.confidence !== undefined && (inputAny.confidence < 0 || inputAny.confidence > 1)) {
    //     return validationFailure([
    //       createValidationError('confidence', 'Confidence must be between 0 and 1', 'INVALID_CONFIDENCE'),
    //     ]);
    //   }
    //
    // Reference validation:
    //   if (inputAny.relationships) {
    //     const entityIds = new Set((inputAny.entities || []).map((e: any) => e.id));
    //     for (const rel of inputAny.relationships) {
    //       if (!entityIds.has(rel.from)) {
    //         return validationFailure([
    //           createValidationError('relationships', `Invalid reference: ${rel.from}`, 'INVALID_REFERENCE'),
    //         ]);
    //       }
    //     }
    //   }
    //
    // Warning (non-blocking):
    //   if (inputAny.observations && inputAny.observations.length < 3) {
    //     warnings.push(
    //       createValidationWarning(
    //         'observations',
    //         'Few observations provided',
    //         'Consider adding more observations for stronger reasoning'
    //       )
    //     );
    //   }
    //
    // REPLACE THIS COMMENT BLOCK WITH YOUR VALIDATION

    return validationSuccess(warnings);
  }

  /**
   * Get mode-specific enhancements (optional)
   *
   * Provides suggestions, guiding questions, and metrics based on the thought.
   * This helps guide the reasoning process.
   */
  getEnhancements(thought: ExampleModeThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        thoughtNumber: thought.thoughtNumber,
        totalThoughts: thought.totalThoughts,
        progress: `${Math.round((thought.thoughtNumber / thought.totalThoughts) * 100)}%`,
      },
      mentalModels: [],
    };

    // ============================================================
    // MODE-SPECIFIC ENHANCEMENTS
    // ============================================================
    //
    // Add contextual guidance based on the thought.
    //
    // Examples:
    //
    // Progress-based suggestions:
    //   const progress = thought.thoughtNumber / thought.totalThoughts;
    //   if (progress < 0.3) {
    //     enhancements.guidingQuestions!.push('What are the key factors to consider?');
    //     enhancements.suggestions!.push('Focus on gathering and analyzing data');
    //   } else if (progress > 0.7) {
    //     enhancements.guidingQuestions!.push('What conclusions can be drawn?');
    //     enhancements.suggestions!.push('Start synthesizing findings');
    //   }
    //
    // Related modes:
    //   enhancements.relatedModes = [
    //     ThinkingMode.SEQUENTIAL,
    //     ThinkingMode.CAUSAL,
    //   ];
    //
    // Mental models:
    //   enhancements.mentalModels = [
    //     'First Principles',
    //     'Systems Thinking',
    //   ];
    //
    // Mode-specific metrics:
    //   if (thought.entities) {
    //     enhancements.metrics!.entityCount = thought.entities.length;
    //   }
    //
    // Warnings:
    //   if (thought.confidence && thought.confidence < 0.5) {
    //     enhancements.warnings!.push('Low confidence - consider gathering more evidence');
    //   }
    //
    // REPLACE THIS COMMENT BLOCK WITH YOUR ENHANCEMENTS

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType);
  }
}
