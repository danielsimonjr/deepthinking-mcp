/**
 * SequentialHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Sequential reasoning mode with:
 * - Iterative thinking with revision tracking
 * - Branching support for alternative reasoning paths
 * - Dependency tracking between thoughts
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, SequentialThought } from '../../types/core.js';
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
 * SequentialHandler - Specialized handler for iterative reasoning
 *
 * Provides:
 * - Step-by-step logical progression
 * - Revision tracking with reasons
 * - Branching for alternative paths
 * - Dependency tracking between thoughts
 */
export class SequentialHandler implements ModeHandler {
  readonly mode = ThinkingMode.SEQUENTIAL;
  readonly modeName = 'Sequential Thinking';
  readonly description = 'Step-by-step logical reasoning with revision and branching support';

  /**
   * Supported thought types for sequential mode
   */
  private readonly supportedThoughtTypes = [
    'initial',
    'continuation',
    'revision',
    'branch',
    'conclusion',
  ];

  /**
   * Create a sequential thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): SequentialThought {
    const inputAny = input as any;

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.SEQUENTIAL,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
      revisionReason: input.revisionReason,

      // Dependency tracking
      dependencies: input.dependencies || [],
      buildUpon: inputAny.buildUpon || [],

      // Branching support
      branchFrom: input.branchFrom,
      branchId: input.branchId,
      branchFromThought: inputAny.branchFromThought,

      // Iteration control
      needsMoreThoughts: input.nextThoughtNeeded,
    };
  }

  /**
   * Validate sequential-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const warnings = [];

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Validate revision consistency
    if (input.isRevision && !input.revisesThought) {
      warnings.push(
        createValidationWarning(
          'revisesThought',
          'Revision marked but no thought ID specified to revise',
          'Specify which thought this revises using revisesThought field'
        )
      );
    }

    if (input.revisesThought && !input.isRevision) {
      warnings.push(
        createValidationWarning(
          'isRevision',
          'revisesThought specified but isRevision is not set',
          'Set isRevision: true when revising a previous thought'
        )
      );
    }

    // Validate branching consistency
    if (input.branchFrom && !input.branchId) {
      warnings.push(
        createValidationWarning(
          'branchId',
          'Branching from a thought but no branch ID specified',
          'Provide a branchId to identify this reasoning branch'
        )
      );
    }

    // Suggest revision reason if revising
    if (input.isRevision && !input.revisionReason) {
      warnings.push(
        createValidationWarning(
          'revisionReason',
          'Revision without a stated reason',
          'Explain why this revision is being made for better tracking'
        )
      );
    }

    return validationSuccess(warnings);
  }

  /**
   * Get sequential-specific enhancements
   */
  getEnhancements(thought: SequentialThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.HYBRID, ThinkingMode.SHANNON, ThinkingMode.METAREASONING],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        thoughtNumber: thought.thoughtNumber,
        totalThoughts: thought.totalThoughts,
        progress: thought.thoughtNumber / thought.totalThoughts,
      },
      mentalModels: [
        'Iterative Refinement',
        'Step-by-Step Analysis',
        'Progressive Elaboration',
      ],
    };

    // Progress-based suggestions
    const progress = thought.thoughtNumber / thought.totalThoughts;

    if (progress < 0.3) {
      enhancements.guidingQuestions!.push(
        'What are the key elements to explore in this problem?'
      );
      enhancements.suggestions!.push(
        'Focus on understanding the problem space before diving into solutions'
      );
    } else if (progress < 0.7) {
      enhancements.guidingQuestions!.push(
        'Are there alternative approaches worth considering?'
      );
      if (!thought.branchId) {
        enhancements.suggestions!.push(
          'Consider branching to explore alternative reasoning paths'
        );
      }
    } else {
      enhancements.guidingQuestions!.push(
        'What conclusions can be drawn from the reasoning so far?'
      );
      enhancements.suggestions!.push(
        'Start synthesizing findings into actionable conclusions'
      );
    }

    // Revision tracking
    if (thought.isRevision) {
      enhancements.metrics!.isRevision = 1;
      if (!thought.revisionReason) {
        enhancements.warnings!.push(
          'This revision lacks a documented reason - consider adding one for clarity'
        );
      }
    }

    // Branching tracking
    if (thought.branchId) {
      enhancements.metrics!.hasBranch = 1;
      enhancements.suggestions!.push(
        `Currently on branch: ${thought.branchId}`
      );
    }

    // Dependencies tracking
    if (thought.dependencies && thought.dependencies.length > 0) {
      enhancements.metrics!.dependencyCount = thought.dependencies.length;
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType);
  }
}
