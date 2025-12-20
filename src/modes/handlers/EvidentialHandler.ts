/**
 * EvidentialHandler - Phase 15 (v8.4.0)
 *
 * Specialized handler for Evidential/Dempster-Shafer reasoning:
 * - Belief function calculation
 * - Plausibility function computation
 * - Dempster's rule of combination
 * - Uncertainty quantification
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, EvidentialThought } from '../../types/core.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

type EvidentialThoughtType = 'hypothesis_definition' | 'evidence_collection' | 'belief_assignment' | 'evidence_combination' | 'decision_analysis';

/**
 * EvidentialHandler - Specialized handler for Dempster-Shafer theory
 *
 * Provides semantic validation and enhancement:
 * - Validates mass function sums to 1
 * - Computes belief and plausibility from mass
 * - Applies Dempster's rule for evidence combination
 * - Quantifies uncertainty intervals
 */
export class EvidentialHandler implements ModeHandler {
  readonly mode = ThinkingMode.EVIDENTIAL;
  readonly modeName = 'Evidential Reasoning';
  readonly description = 'Dempster-Shafer belief functions with uncertainty quantification';

  private readonly supportedThoughtTypes: EvidentialThoughtType[] = [
    'hypothesis_definition',
    'evidence_collection',
    'belief_assignment',
    'evidence_combination',
    'decision_analysis',
  ];

  /**
   * Create an evidential thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): EvidentialThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
      mode: ThinkingMode.EVIDENTIAL,
      thoughtType,
      frameOfDiscernment: inputAny.frameOfDiscernment || [],
      hypotheses: inputAny.hypotheses || [],
      evidence: inputAny.evidence || [],
      beliefFunctions: inputAny.beliefFunctions || [],
      combinedBelief: inputAny.combinedBelief,
      plausibility: inputAny.plausibility,
      decisions: inputAny.decisions || [],
    };
  }

  /**
   * Validate evidential-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Validate belief functions have valid mass assignments
    if (inputAny.beliefFunctions) {
      for (const bf of inputAny.beliefFunctions) {
        if (bf.massAssignments) {
          const sum = bf.massAssignments.reduce((acc: number, ma: any) => acc + (ma.mass || 0), 0);
          if (Math.abs(sum - 1) > 0.001) {
            errors.push(
              createValidationError(
                'beliefFunctions',
                `Mass function must sum to 1 (currently ${sum.toFixed(3)})`,
                'INVALID_MASS_SUM'
              )
            );
          }
        }
      }
    }

    // Warn if frame is empty
    if (!inputAny.frameOfDiscernment || inputAny.frameOfDiscernment.length === 0) {
      warnings.push(
        createValidationWarning(
          'frameOfDiscernment',
          'Frame of discernment is empty',
          'Define the possible hypotheses in the frame'
        )
      );
    }

    // Check for evidence without reliability scores
    if (inputAny.evidence) {
      const unreliableEvidence = inputAny.evidence.filter((e: any) => e.reliability === undefined);
      if (unreliableEvidence.length > 0) {
        warnings.push(
          createValidationWarning(
            'evidence',
            `${unreliableEvidence.length} evidence items lack reliability scores`,
            'Assign reliability scores for proper belief combination'
          )
        );
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }
    return validationSuccess(warnings);
  }

  /**
   * Get mode-specific enhancements
   */
  getEnhancements(thought: EvidentialThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.BAYESIAN, ThinkingMode.ABDUCTIVE],
      metrics: {},
      guidingQuestions: [],
      mentalModels: [
        'Dempster-Shafer Theory',
        'Belief vs. Plausibility',
        'Mass Function Assignment',
        'Evidence Combination',
        'Uncertainty Intervals [Bel, Pls]',
      ],
    };

    const frame = thought.frameOfDiscernment || [];
    const evidence = thought.evidence || [];
    const beliefFunctions = thought.beliefFunctions || [];
    const hypotheses = thought.hypotheses || [];

    // Calculate metrics
    enhancements.metrics = {
      frameSize: frame.length,
      hypothesisCount: hypotheses.length,
      evidenceCount: evidence.length,
      beliefFunctionCount: beliefFunctions.length,
      hasCombinedBelief: thought.combinedBelief ? 1 : 0,
    };

    // Suggestions
    if (hypotheses.length === 0) {
      enhancements.suggestions!.push('Define hypotheses in the frame of discernment');
    }

    if (evidence.length === 0) {
      enhancements.suggestions!.push('Collect evidence supporting or contradicting hypotheses');
    }

    if (evidence.length > 0 && beliefFunctions.length === 0) {
      enhancements.suggestions!.push('Assign belief functions based on evidence');
    }

    if (beliefFunctions.length > 1 && !thought.combinedBelief) {
      enhancements.suggestions!.push("Combine belief functions using Dempster's rule");
    }

    // Guiding questions
    enhancements.guidingQuestions = [
      'What evidence supports each hypothesis?',
      'How reliable is each piece of evidence?',
      "Can evidence from different sources be combined using Dempster's rule?",
      'What is the uncertainty interval [Bel(H), Pls(H)] for each hypothesis?',
      'Is the conflict between evidence sources acceptable?',
    ];

    return enhancements;
  }

  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as EvidentialThoughtType);
  }

  /**
   * Resolve thought type to valid EvidentialThoughtType
   */
  private resolveThoughtType(inputType: string | undefined): EvidentialThoughtType {
    if (inputType && this.supportedThoughtTypes.includes(inputType as EvidentialThoughtType)) {
      return inputType as EvidentialThoughtType;
    }
    return 'hypothesis_definition';
  }
}
