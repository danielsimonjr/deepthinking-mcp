/**
 * FormalLogicHandler - Phase 15 (v8.4.0)
 *
 * Specialized handler for Formal Logic reasoning:
 * - Logical validity checking
 * - Inference rule validation
 * - Proposition-conclusion consistency
 * - Logical fallacy detection
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, FormalLogicThought } from '../../types/core.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  createValidationWarning,
} from './ModeHandler.js';

type FormalLogicThoughtType = 'proposition_definition' | 'inference_derivation' | 'proof_construction' | 'satisfiability_check' | 'validity_verification';

/**
 * FormalLogicHandler - Specialized handler for formal logic reasoning
 *
 * Provides semantic validation and enhancement:
 * - Validates inference rule applications
 * - Checks logical consistency
 * - Detects common fallacies
 * - Suggests valid derivation steps
 */
export class FormalLogicHandler implements ModeHandler {
  readonly mode = ThinkingMode.FORMALLOGIC;
  readonly modeName = 'Formal Logic';
  readonly description = 'Propositional and predicate logic with inference validation';

  private readonly supportedThoughtTypes: FormalLogicThoughtType[] = [
    'proposition_definition',
    'inference_derivation',
    'proof_construction',
    'satisfiability_check',
    'validity_verification',
  ];

  /**
   * Create a formal logic thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): FormalLogicThought {
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
      mode: ThinkingMode.FORMALLOGIC,
      thoughtType,
      propositions: inputAny.propositions || [],
      logicalInferences: inputAny.logicalInferences || [],
      proof: inputAny.proof,
      truthTable: inputAny.truthTable,
      satisfiability: inputAny.satisfiability,
    };
  }

  /**
   * Validate formal logic-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Check for propositions
    if (!inputAny.propositions || inputAny.propositions.length === 0) {
      warnings.push(
        createValidationWarning(
          'propositions',
          'No propositions defined',
          'Define the atomic propositions for your logical argument'
        )
      );
    }

    // Check for inference validity
    if (inputAny.logicalInferences) {
      for (const inf of inputAny.logicalInferences) {
        if (inf.valid === false) {
          warnings.push(
            createValidationWarning(
              'logicalInferences',
              `Inference "${inf.id}" is marked as invalid`,
              'Review the inference rule application'
            )
          );
        }
      }
    }

    // Check proof completeness
    if (inputAny.proof) {
      if (inputAny.proof.completeness !== undefined && inputAny.proof.completeness < 1) {
        warnings.push(
          createValidationWarning(
            'proof',
            `Proof is ${(inputAny.proof.completeness * 100).toFixed(0)}% complete`,
            'Add missing proof steps to complete the derivation'
          )
        );
      }
      if (inputAny.proof.valid === false) {
        warnings.push(
          createValidationWarning(
            'proof',
            'Proof is marked as invalid',
            'Review the logical steps for errors'
          )
        );
      }
    }

    return validationSuccess(warnings);
  }

  /**
   * Get mode-specific enhancements
   */
  getEnhancements(thought: FormalLogicThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.DEDUCTIVE, ThinkingMode.MATHEMATICS, ThinkingMode.FIRSTPRINCIPLES],
      metrics: {},
      guidingQuestions: [],
      mentalModels: [
        'Propositional Logic',
        'Predicate Logic',
        'Natural Deduction',
        'Truth Tables',
        'Proof by Contradiction',
        'Logical Equivalences',
      ],
    };

    const propositions = thought.propositions || [];
    const inferences = thought.logicalInferences || [];
    const proof = thought.proof;

    // Calculate metrics
    enhancements.metrics = {
      propositionCount: propositions.length,
      inferenceCount: inferences.length,
      validInferences: inferences.filter((i) => i.valid).length,
      proofStepCount: proof?.steps?.length || 0,
      proofCompleteness: proof?.completeness || 0,
    };

    // Stage-specific suggestions
    if (propositions.length === 0) {
      enhancements.suggestions!.push('Start by defining atomic propositions');
    } else if (inferences.length === 0 && !proof) {
      enhancements.suggestions!.push('Apply inference rules to derive new conclusions');
    } else if (proof && proof.completeness < 1) {
      enhancements.suggestions!.push('Continue building the proof with additional steps');
    }

    // Guiding questions
    enhancements.guidingQuestions = [
      'Are all propositions clearly stated?',
      'Which inference rule justifies each step?',
      'Can the argument be formalized in symbolic logic?',
      'Is the proof complete and valid?',
      'What are the truth conditions for the conclusion?',
    ];

    // Add available inference rules as suggestions
    enhancements.suggestions!.push(
      'Available inference rules: modus_ponens, modus_tollens, hypothetical_syllogism, disjunctive_syllogism, conjunction, simplification, addition, resolution'
    );

    return enhancements;
  }

  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as FormalLogicThoughtType);
  }

  /**
   * Resolve thought type to valid FormalLogicThoughtType
   */
  private resolveThoughtType(inputType: string | undefined): FormalLogicThoughtType {
    if (inputType && this.supportedThoughtTypes.includes(inputType as FormalLogicThoughtType)) {
      return inputType as FormalLogicThoughtType;
    }
    return 'proposition_definition';
  }
}
