/**
 * InductiveHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Inductive reasoning mode with:
 * - Pattern recognition from observations
 * - Generalization strength assessment
 * - Counterexample tracking
 * - Sample size and confidence correlation
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, InductiveThought } from '../../types/core.js';
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
 * InductiveHandler - Specialized handler for inductive reasoning
 *
 * Provides:
 * - Reasoning from specific observations to general principles
 * - Pattern identification and validation
 * - Confidence assessment based on sample size
 * - Counterexample management
 */
export class InductiveHandler implements ModeHandler {
  readonly mode = ThinkingMode.INDUCTIVE;
  readonly modeName = 'Inductive Reasoning';
  readonly description = 'Reasoning from specific observations to general principles with confidence tracking';

  /**
   * Supported thought types for inductive mode
   */
  private readonly supportedThoughtTypes = [
    'observation',
    'pattern_identification',
    'generalization',
    'counterexample_analysis',
    'confidence_assessment',
    'refinement',
  ];

  /**
   * Create an inductive thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): InductiveThought {
    const inputAny = input as any;

    // Calculate confidence if not provided
    const confidence = this.calculateConfidence(inputAny);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.INDUCTIVE,

      // Core inductive fields
      observations: inputAny.observations || [],
      pattern: inputAny.pattern,
      generalization: inputAny.generalization || '',
      confidence,
      counterexamples: inputAny.counterexamples || [],
      sampleSize: inputAny.sampleSize,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate inductive-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors = [];
    const warnings = [];
    const inputAny = input as any;

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

    // Validate confidence
    if (inputAny.confidence !== undefined) {
      if (inputAny.confidence < 0 || inputAny.confidence > 1) {
        errors.push(
          createValidationError(
            'confidence',
            `Confidence (${inputAny.confidence}) must be between 0 and 1`,
            'CONFIDENCE_OUT_OF_RANGE'
          )
        );
      }
    }

    // Validate observations
    if (!inputAny.observations || inputAny.observations.length === 0) {
      warnings.push(
        createValidationWarning(
          'observations',
          'No observations provided for inductive reasoning',
          'Add specific observations to form the basis of generalization'
        )
      );
    } else if (inputAny.observations.length < 3) {
      warnings.push(
        createValidationWarning(
          'observations',
          `Only ${inputAny.observations.length} observation(s) provided`,
          'More observations typically lead to stronger generalizations'
        )
      );
    }

    // Check for generalization without observations
    if (inputAny.generalization && (!inputAny.observations || inputAny.observations.length === 0)) {
      warnings.push(
        createValidationWarning(
          'generalization',
          'Generalization stated without supporting observations',
          'Ensure observations support the generalization'
        )
      );
    }

    // Validate sample size consistency
    if (inputAny.sampleSize !== undefined && inputAny.observations) {
      if (inputAny.sampleSize !== inputAny.observations.length) {
        warnings.push(
          createValidationWarning(
            'sampleSize',
            `Sample size (${inputAny.sampleSize}) differs from observation count (${inputAny.observations.length})`,
            'Ensure sample size accurately reflects your observations'
          )
        );
      }
    }

    // High confidence with counterexamples warning
    if (inputAny.confidence > 0.8 &&
        inputAny.counterexamples &&
        inputAny.counterexamples.length > 0) {
      warnings.push(
        createValidationWarning(
          'confidence',
          'High confidence despite known counterexamples',
          'Consider whether counterexamples require adjusting confidence'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get inductive-specific enhancements
   */
  getEnhancements(thought: InductiveThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.DEDUCTIVE, ThinkingMode.ABDUCTIVE, ThinkingMode.SCIENTIFICMETHOD],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        observationCount: thought.observations?.length || 0,
        confidence: thought.confidence,
        counterexampleCount: thought.counterexamples?.length || 0,
      },
      mentalModels: [
        'Pattern Recognition',
        'Enumeration Induction',
        'Statistical Generalization',
        'Analogical Reasoning',
        'Mill\'s Methods',
      ],
    };

    const obsCount = thought.observations?.length || 0;
    const counterCount = thought.counterexamples?.length || 0;

    // Observation-based guidance
    if (obsCount === 0) {
      enhancements.suggestions!.push(
        'Start by collecting specific observations or examples'
      );
      enhancements.guidingQuestions!.push(
        'What specific instances or cases have you observed?'
      );
    } else if (obsCount < 5) {
      enhancements.suggestions!.push(
        'Consider gathering more observations to strengthen the induction'
      );
      enhancements.guidingQuestions!.push(
        'Are there other examples that could confirm or challenge the pattern?'
      );
    }

    // Pattern identification guidance
    if (obsCount >= 3 && !thought.pattern) {
      enhancements.suggestions!.push(
        'Look for common features or relationships among observations'
      );
      enhancements.guidingQuestions!.push(
        'What do all these observations have in common?'
      );
    }

    // Generalization guidance
    if (thought.pattern && !thought.generalization) {
      enhancements.suggestions!.push(
        'Formulate a general principle from the identified pattern'
      );
      enhancements.guidingQuestions!.push(
        'What general rule or principle does this pattern suggest?'
      );
    }

    // Counterexample handling
    if (counterCount > 0) {
      enhancements.warnings!.push(
        `${counterCount} counterexample(s) exist - consider refining the generalization`
      );
      enhancements.guidingQuestions!.push(
        'Can the generalization be modified to account for counterexamples?'
      );

      // Adjust suggested confidence
      const suggestedConfidence = Math.max(0.3, thought.confidence - (counterCount * 0.1));
      if (thought.confidence > suggestedConfidence + 0.2) {
        enhancements.warnings!.push(
          `Consider lowering confidence given counterexamples (suggested: ${suggestedConfidence.toFixed(2)})`
        );
      }
    }

    // Confidence analysis
    if (thought.confidence > 0.9 && obsCount < 10) {
      enhancements.warnings!.push(
        'Very high confidence with limited sample size - consider more evidence'
      );
    } else if (thought.confidence < 0.3 && obsCount > 10 && counterCount === 0) {
      enhancements.suggestions!.push(
        'Low confidence despite good sample size and no counterexamples - pattern may be stronger than assessed'
      );
    }

    // Sample size analysis
    if (thought.sampleSize) {
      enhancements.metrics!.sampleSize = thought.sampleSize;

      // Suggest statistical significance
      if (thought.sampleSize >= 30) {
        enhancements.suggestions!.push(
          'Sample size sufficient for statistical analysis - consider calculating significance'
        );
      }
    }

    // Suggest deductive validation
    if (thought.generalization && thought.confidence > 0.7) {
      enhancements.suggestions!.push(
        'Consider testing this generalization deductively on new cases'
      );
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType);
  }

  /**
   * Calculate confidence based on observations and counterexamples
   */
  private calculateConfidence(input: any): number {
    if (input.confidence !== undefined) {
      return Math.max(0, Math.min(1, input.confidence));
    }

    const obsCount = input.observations?.length || 0;
    const counterCount = input.counterexamples?.length || 0;

    if (obsCount === 0) return 0.3;

    // Base confidence on observation count (diminishing returns)
    let baseConfidence = Math.min(0.9, 0.4 + (obsCount * 0.05));

    // Reduce for counterexamples
    baseConfidence -= counterCount * 0.15;

    return Math.max(0.1, Math.min(0.95, baseConfidence));
  }
}
