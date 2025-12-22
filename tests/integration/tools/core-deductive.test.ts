/**
 * Core Mode Integration Tests - Deductive Reasoning
 *
 * Tests T-COR-021 through T-COR-035: Comprehensive integration tests
 * for the deepthinking_core tool with deductive mode.
 *
 * Phase 11 Sprint 1: Test Infrastructure and Core Mode Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type DeductiveThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import {
  createDeductiveThought,
  createDeductiveWithPremises,
  createDeductiveWithConclusion,
  createDeductiveWithLogicForm,
  createDeductiveWithValidityCheck,
  createDeductiveWithSoundnessCheck,
  createCompleteDeductiveThought,
  createClassicSyllogism,
  createThoughtWithBranch,
  createRevisionThought,
  createDeductiveProofChain,
} from '../../utils/thought-factory.js';
import {
  assertValidDeductiveThought,
  assertHasPremises,
  assertHasConclusion,
  assertHasLogicForm,
  assertDeductionIsValid,
  assertDeductionIsSound,
  assertValidationPassed,
  assertValidationFailed,
  assertHasErrorCode,
  assertHasWarning,
} from '../../utils/assertion-helpers.js';
import {
  CLASSIC_SYLLOGISMS,
  LOGIC_FORMS,
  SAMPLE_PREMISES,
  SAMPLE_CONCLUSIONS,
} from '../../utils/mock-data.js';

describe('Core Mode Integration - Deductive Reasoning', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-COR-021: Basic deductive thought creation
   */
  describe('T-COR-021: Basic Deductive Thought Creation', () => {
    it('should create a basic deductive thought with minimal params', () => {
      const input = createDeductiveThought({
        thought: 'Basic deductive reasoning step',
      });

      const thought = factory.createThought(input, 'session-021');

      expect(thought.mode).toBe(ThinkingMode.DEDUCTIVE);
      expect(thought.content).toBe('Basic deductive reasoning step');
      expect(thought.sessionId).toBe('session-021');
    });

    it('should assign unique IDs to deductive thoughts', () => {
      const input1 = createDeductiveThought({ thought: 'First premise' });
      const input2 = createDeductiveThought({ thought: 'Second premise' });

      const thought1 = factory.createThought(input1, 'session-021');
      const thought2 = factory.createThought(input2, 'session-021');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should set timestamp correctly', () => {
      const before = new Date();
      const input = createDeductiveThought();
      const thought = factory.createThought(input, 'session-021');
      const after = new Date();

      expect(thought.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(thought.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  /**
   * T-COR-022: Deductive thought with premises
   */
  describe('T-COR-022: Deductive Thought with Premises', () => {
    it('should include premises in thought', () => {
      const input = createDeductiveWithPremises(CLASSIC_SYLLOGISMS.mortality.premises);

      const thought = factory.createThought(input, 'session-022') as DeductiveThought;

      expect(thought.premises).toEqual(CLASSIC_SYLLOGISMS.mortality.premises);
      assertHasPremises(thought, 2);
    });

    it('should handle single premise', () => {
      const input = createDeductiveWithPremises(['All A are B']);

      const thought = factory.createThought(input, 'session-022') as DeductiveThought;

      expect(thought.premises).toHaveLength(1);
    });

    it('should handle multiple premises (chain)', () => {
      const input = createDeductiveWithPremises(SAMPLE_PREMISES.chain);

      const thought = factory.createThought(input, 'session-022') as DeductiveThought;

      expect(thought.premises).toHaveLength(4);
    });
  });

  /**
   * T-COR-023: Deductive thought with conclusion
   */
  describe('T-COR-023: Deductive Thought with Conclusion', () => {
    it('should include conclusion in thought', () => {
      const input = createDeductiveWithConclusion(
        CLASSIC_SYLLOGISMS.mortality.conclusion,
        CLASSIC_SYLLOGISMS.mortality.premises
      );

      const thought = factory.createThought(input, 'session-023') as DeductiveThought;

      expect(thought.conclusion).toBe(CLASSIC_SYLLOGISMS.mortality.conclusion);
      assertHasConclusion(thought);
    });

    it('should support conclusion without explicit premises', () => {
      const input = createDeductiveWithConclusion('Therefore X is true');

      const thought = factory.createThought(input, 'session-023') as DeductiveThought;

      expect(thought.conclusion).toBe('Therefore X is true');
    });
  });

  /**
   * T-COR-024: Logic form specification
   */
  describe('T-COR-024: Logic Form Specification', () => {
    it('should include modus ponens logic form', () => {
      const input = createDeductiveWithLogicForm(LOGIC_FORMS.MODUS_PONENS);

      const thought = factory.createThought(input, 'session-024') as DeductiveThought;

      expect(thought.logicForm).toBe(LOGIC_FORMS.MODUS_PONENS);
      assertHasLogicForm(thought, LOGIC_FORMS.MODUS_PONENS);
    });

    it('should include modus tollens logic form', () => {
      const input = createDeductiveWithLogicForm(LOGIC_FORMS.MODUS_TOLLENS);

      const thought = factory.createThought(input, 'session-024') as DeductiveThought;

      assertHasLogicForm(thought, LOGIC_FORMS.MODUS_TOLLENS);
    });

    it('should include hypothetical syllogism logic form', () => {
      const input = createDeductiveWithLogicForm(LOGIC_FORMS.HYPOTHETICAL_SYLLOGISM);

      const thought = factory.createThought(input, 'session-024') as DeductiveThought;

      assertHasLogicForm(thought, LOGIC_FORMS.HYPOTHETICAL_SYLLOGISM);
    });

    it('should include disjunctive syllogism logic form', () => {
      const input = createDeductiveWithLogicForm(LOGIC_FORMS.DISJUNCTIVE_SYLLOGISM);

      const thought = factory.createThought(input, 'session-024') as DeductiveThought;

      assertHasLogicForm(thought, LOGIC_FORMS.DISJUNCTIVE_SYLLOGISM);
    });
  });

  /**
   * T-COR-025: Validity check
   */
  describe('T-COR-025: Validity Check', () => {
    it('should include validity check when true', () => {
      const input = createDeductiveWithValidityCheck(true);

      const thought = factory.createThought(input, 'session-025') as DeductiveThought;

      expect(thought.validityCheck).toBe(true);
      assertDeductionIsValid(thought);
    });

    it('should include validity check when false', () => {
      const input = createDeductiveWithValidityCheck(false);

      const thought = factory.createThought(input, 'session-025') as DeductiveThought;

      expect(thought.validityCheck).toBe(false);
    });
  });

  /**
   * T-COR-026: Soundness check
   */
  describe('T-COR-026: Soundness Check', () => {
    it('should include soundness check when true', () => {
      const input = createDeductiveWithSoundnessCheck(true, { validityCheck: true });

      const thought = factory.createThought(input, 'session-026') as DeductiveThought;

      expect(thought.soundnessCheck).toBe(true);
      assertDeductionIsSound(thought);
    });

    it('should include soundness check when false', () => {
      const input = createDeductiveWithSoundnessCheck(false);

      const thought = factory.createThought(input, 'session-026') as DeductiveThought;

      expect(thought.soundnessCheck).toBe(false);
    });
  });

  /**
   * T-COR-027: Classic syllogism
   */
  describe('T-COR-027: Classic Syllogism', () => {
    it('should create classic mortality syllogism', () => {
      const input = createClassicSyllogism();

      const thought = factory.createThought(input, 'session-027') as DeductiveThought;

      assertValidDeductiveThought(thought);
      expect(thought.premises).toContain('All men are mortal');
      expect(thought.premises).toContain('Socrates is a man');
      expect(thought.conclusion).toBe('Socrates is mortal');
    });

    it('should handle modus tollens syllogism', () => {
      const input = createDeductiveWithConclusion(
        CLASSIC_SYLLOGISMS.modusTollens.conclusion,
        CLASSIC_SYLLOGISMS.modusTollens.premises,
        { logicForm: LOGIC_FORMS.MODUS_TOLLENS, validityCheck: true }
      );

      const thought = factory.createThought(input, 'session-027') as DeductiveThought;

      assertHasLogicForm(thought, LOGIC_FORMS.MODUS_TOLLENS);
      assertDeductionIsValid(thought);
    });

    it('should handle disjunctive syllogism', () => {
      const input = createDeductiveWithConclusion(
        CLASSIC_SYLLOGISMS.disjunctive.conclusion,
        CLASSIC_SYLLOGISMS.disjunctive.premises,
        { logicForm: LOGIC_FORMS.DISJUNCTIVE_SYLLOGISM, validityCheck: true }
      );

      const thought = factory.createThought(input, 'session-027') as DeductiveThought;

      assertHasLogicForm(thought, LOGIC_FORMS.DISJUNCTIVE_SYLLOGISM);
    });
  });

  /**
   * T-COR-028: Complete deductive thought
   */
  describe('T-COR-028: Complete Deductive Thought', () => {
    it('should create a complete deductive thought with all params', () => {
      const input = createCompleteDeductiveThought();

      const thought = factory.createThought(input, 'session-028') as DeductiveThought;

      assertValidDeductiveThought(thought);
      assertHasPremises(thought, 2);
      assertHasConclusion(thought);
      assertHasLogicForm(thought);
      assertDeductionIsValid(thought);
      assertDeductionIsSound(thought);
    });
  });

  /**
   * T-COR-029: Validation - empty thought rejection
   */
  describe('T-COR-029: Validation - Empty Thought', () => {
    it('should reject empty thought content', () => {
      const input = createDeductiveThought({ thought: '' });

      const result = factory.validate(input);

      assertValidationFailed(result);
      assertHasErrorCode(result, 'EMPTY_THOUGHT');
    });
  });

  /**
   * T-COR-030: Validation - premises warning
   */
  describe('T-COR-030: Validation - No Premises Warning', () => {
    it('should warn when no premises provided', () => {
      const input = createDeductiveThought({
        conclusion: 'Some conclusion',
      });
      delete (input as any).premises;

      const result = factory.validate(input);

      expect(result.valid).toBe(true);
      assertHasWarning(result, 'premises');
    });
  });

  /**
   * T-COR-031: Validation - conclusion warning
   */
  describe('T-COR-031: Validation - No Conclusion Warning', () => {
    it('should warn when premises exist but no conclusion', () => {
      const input = createDeductiveWithPremises(['Premise 1', 'Premise 2']);
      delete (input as any).conclusion;

      const result = factory.validate(input);

      expect(result.valid).toBe(true);
      assertHasWarning(result, 'conclusion');
    });
  });

  /**
   * T-COR-032: Branching support for deductive
   * Note: branchFrom/branchId are input parameters tracked at session level
   */
  describe('T-COR-032: Branching Support', () => {
    it('should accept branching parameters in input', () => {
      const input = createThoughtWithBranch('deductive', 'thought-3', 'branch-b');

      // Verify input has branching params
      expect((input as any).branchFrom).toBe('thought-3');
      expect((input as any).branchId).toBe('branch-b');

      // Thought should be created successfully
      const thought = factory.createThought(input, 'session-032');
      expect(thought.mode).toBe(ThinkingMode.DEDUCTIVE);
      expect(thought.sessionId).toBe('session-032');
    });
  });

  /**
   * T-COR-033: Revision support for deductive
   * Note: isRevision and revisesThought are tracked; revisionReason is input-only
   */
  describe('T-COR-033: Revision Support', () => {
    it('should create a revision deductive thought', () => {
      const input = createRevisionThought(
        'deductive',
        'thought-2',
        'Premise was incorrect'
      );

      const thought = factory.createThought(input, 'session-033');

      // isRevision and revisesThought are tracked on the thought
      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-2');
      // revisionReason is available in input but may not be on thought output
      expect((input as any).revisionReason).toBe('Premise was incorrect');
    });
  });

  /**
   * T-COR-034: Proof chain creation
   */
  describe('T-COR-034: Proof Chain Creation', () => {
    it('should create a deductive proof chain', () => {
      const steps = [
        { premises: ['All A are B', 'X is A'], conclusion: 'X is B' },
        { premises: ['All B are C', 'X is B'], conclusion: 'X is C' },
        { premises: ['All C are D', 'X is C'], conclusion: 'X is D' },
      ];
      const inputs = createDeductiveProofChain(steps);

      const thoughts = inputs.map((input, i) =>
        factory.createThought(input, `session-034-${i}`)
      ) as DeductiveThought[];

      expect(thoughts).toHaveLength(3);
      thoughts.forEach((thought, i) => {
        expect(thought.mode).toBe(ThinkingMode.DEDUCTIVE);
        expect(thought.thoughtNumber).toBe(i + 1);
        expect(thought.conclusion).toBe(steps[i].conclusion);
        assertHasLogicForm(thought, LOGIC_FORMS.MODUS_PONENS);
      });
    });
  });

  /**
   * T-COR-035: End-to-end deductive reasoning flow
   */
  describe('T-COR-035: End-to-End Deductive Flow', () => {
    it('should handle complete deductive reasoning process', () => {
      const sessionId = 'session-035-e2e';

      // Step 1: Establish premises
      const step1Input = createDeductiveWithPremises(
        ['All humans are mortal', 'All Greeks are humans'],
        {
          thought: 'Establishing foundational premises',
          thoughtNumber: 1,
          totalThoughts: 4,
          nextThoughtNeeded: true,
        }
      );
      const step1 = factory.createThought(step1Input, sessionId) as DeductiveThought;
      assertHasPremises(step1, 2);

      // Step 2: Identify logic form
      const step2Input = createDeductiveWithLogicForm(LOGIC_FORMS.HYPOTHETICAL_SYLLOGISM, {
        thought: 'Identifying logical structure',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        premises: ['All humans are mortal', 'All Greeks are humans'],
      });
      const step2 = factory.createThought(step2Input, sessionId) as DeductiveThought;
      assertHasLogicForm(step2);

      // Step 3: Draw intermediate conclusion
      const step3Input = createDeductiveWithConclusion(
        'All Greeks are mortal',
        ['All humans are mortal', 'All Greeks are humans'],
        {
          thought: 'Drawing intermediate conclusion',
          thoughtNumber: 3,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          logicForm: LOGIC_FORMS.HYPOTHETICAL_SYLLOGISM,
          validityCheck: true,
        }
      );
      const step3 = factory.createThought(step3Input, sessionId) as DeductiveThought;
      assertHasConclusion(step3);
      assertDeductionIsValid(step3);

      // Step 4: Apply to specific case
      const step4Input = createDeductiveWithConclusion(
        'Socrates is mortal',
        ['All Greeks are mortal', 'Socrates is a Greek'],
        {
          thought: 'Applying to specific case',
          thoughtNumber: 4,
          totalThoughts: 4,
          nextThoughtNeeded: false,
          logicForm: LOGIC_FORMS.MODUS_PONENS,
          validityCheck: true,
          soundnessCheck: true,
        }
      );
      const step4 = factory.createThought(step4Input, sessionId) as DeductiveThought;
      expect(step4.conclusion).toBe('Socrates is mortal');
      assertDeductionIsValid(step4);
      assertDeductionIsSound(step4);
    });

    it('should identify and handle invalid deduction', () => {
      const input = createDeductiveWithConclusion(
        CLASSIC_SYLLOGISMS.invalid.conclusion,
        CLASSIC_SYLLOGISMS.invalid.premises,
        {
          thought: 'Evaluating potentially invalid argument',
          validityCheck: false,
          soundnessCheck: false,
        }
      );

      const thought = factory.createThought(input, 'session-035') as DeductiveThought;

      expect(thought.validityCheck).toBe(false);
      expect(thought.soundnessCheck).toBe(false);
    });
  });
});
