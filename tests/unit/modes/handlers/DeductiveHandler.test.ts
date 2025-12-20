/**
 * DeductiveHandler Unit Tests - Phase 10 Sprint 3
 *
 * Tests for the specialized DeductiveHandler:
 * - Premise-conclusion structure validation
 * - Logical form tracking (modus ponens, modus tollens, etc.)
 * - Validity and soundness assessment
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DeductiveHandler } from '../../../../src/modes/handlers/DeductiveHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('DeductiveHandler', () => {
  let handler: DeductiveHandler;

  beforeEach(() => {
    handler = new DeductiveHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.DEDUCTIVE);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Deductive Reasoning');
    });

    it('should have a description', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description).toContain('general');
    });
  });

  describe('createThought', () => {
    it('should create a basic deductive thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Applying logic',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.DEDUCTIVE);
      expect(thought.content).toBe('Applying logic');
      expect(thought.sessionId).toBe('session-1');
    });

    it('should include premises', () => {
      const input: ThinkingToolInput = {
        thought: 'Setting up argument',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['All men are mortal', 'Socrates is a man'],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.premises).toEqual(['All men are mortal', 'Socrates is a man']);
    });

    it('should include conclusion', () => {
      const input: ThinkingToolInput = {
        thought: 'Drawing conclusion',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        conclusion: 'Socrates is mortal',
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.conclusion).toBe('Socrates is mortal');
    });

    it('should include logical form', () => {
      const input: ThinkingToolInput = {
        thought: 'Using modus ponens',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        logicForm: 'modus_ponens',
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.logicForm).toBe('modus_ponens');
    });

    it('should auto-assess validity with recognized logic form', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid argument',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['If P then Q', 'P'],
        conclusion: 'Q',
        logicForm: 'modus_ponens',
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.validityCheck).toBe(true);
    });

    it('should set validity to false without logic form', () => {
      const input: ThinkingToolInput = {
        thought: 'Unverified argument',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['Some X are Y', 'Some Y are Z'],
        conclusion: 'Some X are Z',
        // No logicForm specified
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.validityCheck).toBe(false);
    });

    it('should use provided validity check', () => {
      const input: ThinkingToolInput = {
        thought: 'Explicit validity',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['P1', 'P2'],
        conclusion: 'C',
        validityCheck: true,
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.validityCheck).toBe(true);
    });

    it('should include soundness check', () => {
      const input: ThinkingToolInput = {
        thought: 'Checking soundness',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['All men are mortal', 'Socrates is a man'],
        conclusion: 'Socrates is mortal',
        validityCheck: true,
        soundnessCheck: true,
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.soundnessCheck).toBe(true);
    });

    it('should track revision', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised argument',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        isRevision: true,
        revisesThought: 'thought-2',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-2');
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid deductive argument',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['All A are B', 'All B are C'],
        conclusion: 'All A are C',
        logicForm: 'hypothetical_syllogism',
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should warn when no premises provided', () => {
      const input: ThinkingToolInput = {
        thought: 'Missing premises',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'premises')).toBe(true);
    });

    it('should warn when only one premise provided', () => {
      const input: ThinkingToolInput = {
        thought: 'Single premise',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['All men are mortal'],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'premises' && w.message.includes('one'))).toBe(true);
    });

    it('should warn when no conclusion provided', () => {
      const input: ThinkingToolInput = {
        thought: 'No conclusion',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['P1', 'P2'],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'conclusion')).toBe(true);
    });

    it('should warn for unknown logical form', () => {
      const input: ThinkingToolInput = {
        thought: 'Unknown form',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        logicForm: 'invalid_logic_form',
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'logicForm')).toBe(true);
    });

    it('should warn when logical form not specified with complete argument', () => {
      const input: ThinkingToolInput = {
        thought: 'Complete but unspecified form',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['If P then Q', 'P'],
        conclusion: 'Q',
        // No logicForm
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'logicForm')).toBe(true);
    });

    it('should warn when validity checked but not soundness', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid but soundness not checked',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        validityCheck: true,
        // No soundnessCheck
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'soundnessCheck')).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.INDUCTIVE);
      expect(enhancements.relatedModes).toContain(ThinkingMode.FORMALLOGIC);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Syllogistic Logic');
      expect(enhancements.mentalModels).toContain('Formal Proof');
    });

    it('should suggest stating premises when none provided', () => {
      const thought = handler.createThought({
        thought: 'No premises',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('general principles') || s.includes('axiom'))).toBe(true);
    });

    it('should suggest second premise when only one provided', () => {
      const thought = handler.createThought({
        thought: 'Single premise',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['All A are B'],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('second premise') || s.includes('additional'))).toBe(true);
    });

    it('should suggest deriving conclusion when premises exist', () => {
      const thought = handler.createThought({
        thought: 'Premises without conclusion',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['All men are mortal', 'Socrates is a man'],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('conclusion'))).toBe(true);
    });

    it('should provide form-specific guidance for modus ponens', () => {
      const thought = handler.createThought({
        thought: 'Modus ponens',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        logicForm: 'modus_ponens',
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('P → Q'))).toBe(true);
    });

    it('should provide form-specific guidance for modus tollens', () => {
      const thought = handler.createThought({
        thought: 'Modus tollens',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        logicForm: 'modus_tollens',
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('¬Q'))).toBe(true);
    });

    it('should confirm validity when valid', () => {
      const thought = handler.createThought({
        thought: 'Valid argument',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['If P then Q', 'P'],
        conclusion: 'Q',
        logicForm: 'modus_ponens',
        validityCheck: true,
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('✓') && s.includes('valid'))).toBe(true);
    });

    it('should confirm soundness when sound', () => {
      const thought = handler.createThought({
        thought: 'Sound argument',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['All men are mortal', 'Socrates is a man'],
        conclusion: 'Socrates is mortal',
        logicForm: 'categorical_syllogism',
        validityCheck: true,
        soundnessCheck: true,
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('sound'))).toBe(true);
    });

    it('should warn about unsound argument', () => {
      const thought = handler.createThought({
        thought: 'Valid but unsound',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['All unicorns are purple', 'X is a unicorn'],
        conclusion: 'X is purple',
        logicForm: 'categorical_syllogism',
        validityCheck: true,
        soundnessCheck: false,
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some(w => w.includes('NOT sound'))).toBe(true);
    });

    it('should warn about invalid argument', () => {
      const thought = handler.createThought({
        thought: 'Invalid argument',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['If P then Q', 'Q'],
        conclusion: 'P',
        validityCheck: false,
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some(w => w.includes('NOT valid'))).toBe(true);
    });

    it('should include metrics', () => {
      const thought = handler.createThought({
        thought: 'Metrics test',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['P1', 'P2', 'P3'],
        validityCheck: true,
        soundnessCheck: true,
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.premiseCount).toBe(3);
      expect(enhancements.metrics!.isValid).toBe(1);
      expect(enhancements.metrics!.isSound).toBe(1);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support premise_statement', () => {
      expect(handler.supportsThoughtType('premise_statement')).toBe(true);
    });

    it('should support inference', () => {
      expect(handler.supportsThoughtType('inference')).toBe(true);
    });

    it('should support conclusion', () => {
      expect(handler.supportsThoughtType('conclusion')).toBe(true);
    });

    it('should support validity_check', () => {
      expect(handler.supportsThoughtType('validity_check')).toBe(true);
    });

    it('should support soundness_check', () => {
      expect(handler.supportsThoughtType('soundness_check')).toBe(true);
    });

    it('should support fallacy_identification', () => {
      expect(handler.supportsThoughtType('fallacy_identification')).toBe(true);
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete deductive reasoning (modus ponens)', () => {
      // Step 1: State first premise
      const step1 = handler.createThought({
        thought: 'If it is raining, then the ground is wet',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['If it is raining, then the ground is wet'],
      } as any, 'session-1');

      expect(step1.premises).toHaveLength(1);

      // Step 2: State second premise
      const step2 = handler.createThought({
        thought: 'It is raining',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: [...step1.premises, 'It is raining'],
        logicForm: 'modus_ponens',
      } as any, 'session-1');

      expect(step2.premises).toHaveLength(2);

      // Step 3: Draw conclusion
      const step3 = handler.createThought({
        thought: 'Therefore, the ground is wet',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: step2.premises,
        conclusion: 'The ground is wet',
        logicForm: 'modus_ponens',
        validityCheck: true,
      } as any, 'session-1');

      expect(step3.conclusion).toBe('The ground is wet');
      expect(step3.validityCheck).toBe(true);

      // Step 4: Verify soundness
      const step4 = handler.createThought({
        thought: 'Both premises are true in this situation',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'deductive',
        premises: step2.premises,
        conclusion: step3.conclusion,
        logicForm: 'modus_ponens',
        validityCheck: true,
        soundnessCheck: true,
      } as any, 'session-1');

      expect(step4.soundnessCheck).toBe(true);
    });

    it('should detect affirming the consequent fallacy', () => {
      const thought = handler.createThought({
        thought: 'Detecting fallacy in argument',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        mode: 'deductive',
        premises: ['If it is raining, then the ground is wet', 'The ground is wet'],
        conclusion: 'It is raining', // INVALID - could be sprinklers!
        validityCheck: false, // User correctly identifies as invalid
      } as any, 'session-1');

      expect(thought.validityCheck).toBe(false);

      const enhancements = handler.getEnhancements(thought);
      expect(enhancements.warnings!.some(w => w.includes('NOT valid'))).toBe(true);
    });
  });
});
