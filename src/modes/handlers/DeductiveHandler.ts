/**
 * DeductiveHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Deductive reasoning mode with:
 * - Premise-conclusion structure validation
 * - Logical form tracking (modus ponens, modus tollens, etc.)
 * - Validity and soundness assessment
 * - Logical fallacy detection
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, DeductiveThought } from '../../types/core.js';
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
 * Valid logical forms for deductive arguments
 */
const VALID_LOGIC_FORMS = [
  'modus_ponens',
  'modus_tollens',
  'hypothetical_syllogism',
  'disjunctive_syllogism',
  'constructive_dilemma',
  'destructive_dilemma',
  'universal_instantiation',
  'existential_generalization',
  'categorical_syllogism',
  'reductio_ad_absurdum',
  'proof_by_contradiction',
  'proof_by_cases',
  'conditional_proof',
];

/**
 * DeductiveHandler - Specialized handler for deductive reasoning
 *
 * Provides:
 * - Reasoning from general principles to specific conclusions
 * - Logical form identification
 * - Validity checking (logical structure)
 * - Soundness assessment (premise truth)
 */
export class DeductiveHandler implements ModeHandler {
  readonly mode = ThinkingMode.DEDUCTIVE;
  readonly modeName = 'Deductive Reasoning';
  readonly description = 'Reasoning from general principles to specific conclusions with validity checking';

  /**
   * Supported thought types for deductive mode
   */
  private readonly supportedThoughtTypes = [
    'premise_statement',
    'inference',
    'conclusion',
    'validity_check',
    'soundness_check',
    'fallacy_identification',
  ];

  /**
   * Create a deductive thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): DeductiveThought {
    const inputAny = input as any;

    // Auto-assess validity if premises and conclusion provided
    const validityCheck = this.assessValidity(inputAny);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.DEDUCTIVE,

      // Core deductive fields
      premises: inputAny.premises || [],
      conclusion: inputAny.conclusion || '',
      logicForm: inputAny.logicForm,
      validityCheck,
      soundnessCheck: inputAny.soundnessCheck,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate deductive-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: { field: string; message: string; code: string }[] = [];
    const warnings: ReturnType<typeof createValidationWarning>[] = [];
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

    // Validate premises
    if (!inputAny.premises || inputAny.premises.length === 0) {
      warnings.push(
        createValidationWarning(
          'premises',
          'No premises provided for deductive reasoning',
          'State the general principles from which to derive the conclusion'
        )
      );
    } else if (inputAny.premises.length === 1) {
      warnings.push(
        createValidationWarning(
          'premises',
          'Only one premise provided',
          'Most deductive arguments require at least two premises'
        )
      );
    }

    // Validate conclusion
    if (!inputAny.conclusion || inputAny.conclusion.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          'conclusion',
          'No conclusion specified',
          'State the specific conclusion derived from the premises'
        )
      );
    }

    // Validate logical form
    if (inputAny.logicForm) {
      const normalizedForm = inputAny.logicForm.toLowerCase().replace(/\s+/g, '_');
      if (!VALID_LOGIC_FORMS.includes(normalizedForm)) {
        warnings.push(
          createValidationWarning(
            'logicForm',
            `Unknown logical form: ${inputAny.logicForm}`,
            `Common forms: ${VALID_LOGIC_FORMS.slice(0, 5).join(', ')}, ...`
          )
        );
      }
    }

    // Suggest logical form if not provided
    if (!inputAny.logicForm && inputAny.premises?.length >= 2 && inputAny.conclusion) {
      warnings.push(
        createValidationWarning(
          'logicForm',
          'No logical form specified',
          'Identify the logical form to verify validity'
        )
      );
    }

    // Validity without soundness warning
    if (inputAny.validityCheck === true && inputAny.soundnessCheck === undefined) {
      warnings.push(
        createValidationWarning(
          'soundnessCheck',
          'Validity checked but soundness not assessed',
          'Valid arguments need true premises to be sound'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get deductive-specific enhancements
   */
  getEnhancements(thought: DeductiveThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.INDUCTIVE, ThinkingMode.FORMALLOGIC, ThinkingMode.MATHEMATICS],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        premiseCount: thought.premises?.length || 0,
        isValid: thought.validityCheck ? 1 : 0,
        isSound: thought.soundnessCheck ? 1 : 0,
      },
      mentalModels: [
        'Syllogistic Logic',
        'Propositional Logic',
        'Predicate Logic',
        'Formal Proof',
        'Logical Implication',
      ],
    };

    const premiseCount = thought.premises?.length || 0;

    // Premise-based guidance
    if (premiseCount === 0) {
      enhancements.suggestions!.push(
        'State the general principles or axioms from which to reason'
      );
      enhancements.guidingQuestions!.push(
        'What general truths or established facts can serve as premises?'
      );
    } else if (premiseCount === 1) {
      enhancements.suggestions!.push(
        'Consider whether a second premise is needed for the inference'
      );
      enhancements.guidingQuestions!.push(
        'What additional premise connects this to the conclusion?'
      );
    }

    // Conclusion guidance
    if (!thought.conclusion && premiseCount >= 2) {
      enhancements.suggestions!.push(
        'Derive the conclusion that logically follows from the premises'
      );
      enhancements.guidingQuestions!.push(
        'What necessarily follows from these premises?'
      );
    }

    // Logical form analysis
    if (thought.logicForm) {
      enhancements.metrics!.logicForm = thought.logicForm;
      enhancements.suggestions!.push(`Using ${thought.logicForm} argument form`);

      // Form-specific guidance
      switch (thought.logicForm.toLowerCase().replace(/\s+/g, '_')) {
        case 'modus_ponens':
          enhancements.suggestions!.push(
            'Structure: P → Q, P, therefore Q'
          );
          break;
        case 'modus_tollens':
          enhancements.suggestions!.push(
            'Structure: P → Q, ¬Q, therefore ¬P'
          );
          break;
        case 'hypothetical_syllogism':
          enhancements.suggestions!.push(
            'Structure: P → Q, Q → R, therefore P → R'
          );
          break;
        case 'disjunctive_syllogism':
          enhancements.suggestions!.push(
            'Structure: P ∨ Q, ¬P, therefore Q'
          );
          break;
        case 'reductio_ad_absurdum':
          enhancements.suggestions!.push(
            'Assume the negation, derive a contradiction'
          );
          break;
      }
    }

    // Validity assessment
    if (thought.validityCheck) {
      enhancements.suggestions!.push(
        '✓ Argument is logically valid - conclusion follows from premises'
      );

      if (thought.soundnessCheck) {
        enhancements.suggestions!.push(
          '✓ Argument is sound - premises are true and conclusion follows'
        );
      } else if (thought.soundnessCheck === false) {
        enhancements.warnings!.push(
          'Argument is valid but NOT sound - one or more premises may be false'
        );
        enhancements.guidingQuestions!.push(
          'Which premise(s) might be false or questionable?'
        );
      } else {
        enhancements.guidingQuestions!.push(
          'Are all the premises actually true?'
        );
      }
    } else if (thought.validityCheck === false) {
      enhancements.warnings!.push(
        'Argument is NOT valid - conclusion does not follow from premises'
      );
      enhancements.guidingQuestions!.push(
        'What hidden premise would make this argument valid?',
        'Is there a logical fallacy in the reasoning?'
      );
    }

    // Suggest common fallacy checks
    if (thought.premises?.length >= 2 && thought.conclusion && !thought.validityCheck) {
      enhancements.suggestions!.push(
        'Check for common fallacies: affirming the consequent, denying the antecedent'
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
   * Assess validity of the argument structure
   *
   * This is a heuristic assessment - full validity checking would require
   * symbolic logic parsing.
   */
  private assessValidity(input: any): boolean {
    // If explicitly provided, use that
    if (input.validityCheck !== undefined) {
      return input.validityCheck;
    }

    const premises = input.premises || [];
    const conclusion = input.conclusion || '';
    const logicForm = input.logicForm?.toLowerCase().replace(/\s+/g, '_');

    // Need at least one premise and a conclusion
    if (premises.length === 0 || !conclusion) {
      return false;
    }

    // If a recognized logical form is specified, assume it's valid
    // (the user should verify the structure matches)
    if (logicForm && VALID_LOGIC_FORMS.includes(logicForm)) {
      return true;
    }

    // Default to false if we can't determine
    return false;
  }
}
