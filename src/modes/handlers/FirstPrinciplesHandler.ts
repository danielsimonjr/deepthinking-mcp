/**
 * FirstPrinciplesHandler - Phase 15 (v8.4.0)
 *
 * Specialized handler for First Principles reasoning:
 * - Foundational principle identification
 * - Derivation chain validation
 * - Assumption checking
 * - Bottom-up reasoning verification
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, FirstPrinciplesThought } from '../../types/core.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * FirstPrinciplesHandler - Specialized handler for first principles reasoning
 *
 * Provides semantic validation and enhancement:
 * - Validates derivation chains from fundamentals
 * - Identifies hidden assumptions
 * - Checks for circular reasoning
 * - Suggests missing logical steps
 */
export class FirstPrinciplesHandler implements ModeHandler {
  readonly mode = ThinkingMode.FIRSTPRINCIPLES;
  readonly modeName = 'First Principles Reasoning';
  readonly description = 'Bottom-up reasoning from fundamental truths with derivation chains';

  /**
   * Create a first principles thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): FirstPrinciplesThought {
    const inputAny = input as any;

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
      mode: ThinkingMode.FIRSTPRINCIPLES,
      question: inputAny.question || '',
      principles: inputAny.principles || [],
      derivationSteps: inputAny.derivationSteps || [],
      conclusion: inputAny.conclusion || {
        statement: '',
        derivationChain: [],
        certainty: 0,
      },
      alternativeInterpretations: inputAny.alternativeInterpretations || [],
    };
  }

  /**
   * Validate first principles-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Warn if no question defined
    if (!inputAny.question || inputAny.question.trim() === '') {
      warnings.push(
        createValidationWarning(
          'question',
          'No question specified',
          'Define the fundamental question you are trying to answer'
        )
      );
    }

    // Warn if no principles identified
    if (!inputAny.principles || inputAny.principles.length === 0) {
      warnings.push(
        createValidationWarning(
          'principles',
          'No foundational principles identified',
          'Identify the basic truths or axioms underlying your reasoning'
        )
      );
    }

    // Check for principles without justification
    if (inputAny.principles) {
      const unjustified = inputAny.principles.filter((p: any) => !p.justification || p.justification.trim() === '');
      if (unjustified.length > 0) {
        warnings.push(
          createValidationWarning(
            'principles',
            `${unjustified.length} principles lack justification`,
            'Provide justification for each foundational principle'
          )
        );
      }
    }

    // Check derivation chain integrity
    if (inputAny.derivationSteps && inputAny.derivationSteps.length > 0) {
      const principleIds = new Set((inputAny.principles || []).map((p: any) => p.id));
      for (const step of inputAny.derivationSteps) {
        if (step.principle && !principleIds.has(step.principle)) {
          warnings.push(
            createValidationWarning(
              'derivationSteps',
              `Step references unknown principle: ${step.principle}`,
              'Ensure all derivation steps reference defined principles'
            )
          );
        }
      }
    }

    return validationSuccess(warnings);
  }

  /**
   * Get mode-specific enhancements
   */
  getEnhancements(thought: FirstPrinciplesThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.DEDUCTIVE, ThinkingMode.ABDUCTIVE, ThinkingMode.FORMALLOGIC],
      metrics: {},
      guidingQuestions: [],
      mentalModels: [
        "Elon Musk's First Principles Method",
        'Socratic Questioning',
        'Aristotelian Axioms',
        'Foundationalism',
        'Decomposition and Reconstruction',
      ],
    };

    const principles = thought.principles || [];
    const derivationSteps = thought.derivationSteps || [];

    // Calculate metrics
    enhancements.metrics = {
      principleCount: principles.length,
      derivationStepCount: derivationSteps.length,
      conclusionCertainty: thought.conclusion?.certainty || 0,
      alternativeCount: thought.alternativeInterpretations?.length || 0,
    };

    // Suggestions
    if (principles.length === 0) {
      enhancements.suggestions!.push('Start by asking "What do we know for certain?"');
    }

    if (principles.length > 0 && derivationSteps.length === 0) {
      enhancements.suggestions!.push('Build up from principles to derive new insights');
    }

    if (!thought.question) {
      enhancements.suggestions!.push('Define the fundamental question you are investigating');
    }

    if (!thought.conclusion || !thought.conclusion.statement) {
      enhancements.suggestions!.push('Formulate a conclusion based on your derivation');
    }

    // Guiding questions (Socratic method)
    enhancements.guidingQuestions = [
      'What is the most fundamental truth here?',
      'What assumptions am I making that could be wrong?',
      'Can this be broken down further?',
      'What would have to be true for this to work?',
      'Am I reasoning from facts or from analogy/convention?',
      'What would someone with no prior knowledge need to understand this?',
    ];

    return enhancements;
  }

  supportsThoughtType(_thoughtType: string): boolean {
    // FirstPrinciplesThought doesn't have a thoughtType field
    return true;
  }
}
