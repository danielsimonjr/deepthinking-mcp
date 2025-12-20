/**
 * FormalLogicHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for Formal Logic reasoning handler including:
 * - Logical validity checking
 * - Inference rule validation
 * - Proposition-conclusion consistency
 * - Proof construction
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormalLogicHandler } from '../../../../src/modes/handlers/FormalLogicHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('FormalLogicHandler', () => {
  let handler: FormalLogicHandler;

  beforeEach(() => {
    handler = new FormalLogicHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.FORMALLOGIC);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Formal Logic');
    });

    it('should have a description', () => {
      expect(handler.description).toBeDefined();
      expect(handler.description).toContain('logic');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Let P be "It is raining" and Q be "The ground is wet"',
      thoughtNumber: 1,
      totalThoughts: 4,
      nextThoughtNeeded: true,
      mode: 'formallogic',
    };
    const sessionId = 'test-session-logic';

    it('should create a formal logic thought with default thought type', () => {
      const thought = handler.createThought(baseInput, sessionId);

      expect(thought.id).toBeDefined();
      expect(thought.sessionId).toBe(sessionId);
      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought.thoughtType).toBe('proposition_definition');
      expect(thought.content).toBe(baseInput.thought);
    });

    it('should create thought with proposition_definition type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'proposition_definition',
        propositions: [
          { id: 'P', symbol: 'P', statement: 'It is raining', value: true },
          { id: 'Q', symbol: 'Q', statement: 'The ground is wet', value: undefined },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('proposition_definition');
      expect(thought.propositions).toHaveLength(2);
      expect(thought.propositions![0].symbol).toBe('P');
    });

    it('should create thought with inference_derivation type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'inference_derivation',
        propositions: [
          { id: 'P', symbol: 'P', statement: 'It is raining', value: true },
          { id: 'Q', symbol: 'Q', statement: 'The ground is wet' },
          { id: 'P->Q', symbol: 'P → Q', statement: 'If it is raining then the ground is wet', value: true },
        ],
        logicalInferences: [
          {
            id: 'inf1',
            rule: 'modus_ponens',
            premises: ['P', 'P->Q'],
            conclusion: 'Q',
            valid: true,
          },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('inference_derivation');
      expect(thought.logicalInferences).toHaveLength(1);
      expect(thought.logicalInferences![0].rule).toBe('modus_ponens');
      expect(thought.logicalInferences![0].valid).toBe(true);
    });

    it('should create thought with proof_construction type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'proof_construction',
        propositions: [
          { id: 'P', symbol: 'P', statement: 'Premise 1' },
          { id: 'Q', symbol: 'Q', statement: 'Conclusion' },
        ],
        proof: {
          goal: 'Q',
          steps: [
            { stepNumber: 1, statement: 'P', justification: 'Given' },
            { stepNumber: 2, statement: 'P → Q', justification: 'Assumption' },
            { stepNumber: 3, statement: 'Q', justification: 'Modus Ponens (1, 2)' },
          ],
          completeness: 1,
          valid: true,
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('proof_construction');
      expect(thought.proof).toBeDefined();
      expect(thought.proof!.steps).toHaveLength(3);
      expect(thought.proof!.valid).toBe(true);
    });

    it('should create thought with satisfiability_check type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'satisfiability_check',
        propositions: [
          { id: 'P', symbol: 'P', statement: 'X > 0' },
          { id: 'Q', symbol: 'Q', statement: 'X < 0' },
        ],
        satisfiability: {
          formula: 'P ∧ Q',
          satisfiable: false,
          explanation: 'P and Q are contradictory',
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('satisfiability_check');
      expect(thought.satisfiability).toBeDefined();
      expect(thought.satisfiability!.satisfiable).toBe(false);
    });

    it('should create thought with validity_verification type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'validity_verification',
        truthTable: {
          variables: ['P', 'Q'],
          rows: [
            { P: true, Q: true, result: true },
            { P: true, Q: false, result: false },
            { P: false, Q: true, result: true },
            { P: false, Q: false, result: true },
          ],
          formula: 'P → Q',
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('validity_verification');
      expect(thought.truthTable).toBeDefined();
      expect(thought.truthTable!.rows).toHaveLength(4);
    });

    it('should default to proposition_definition for invalid thought type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'invalid_type',
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('proposition_definition');
    });
  });

  describe('validate', () => {
    it('should warn when no propositions are defined', () => {
      const input: ThinkingToolInput = {
        thought: 'Starting logical analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'formallogic',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'propositions')).toBe(true);
    });

    it('should warn about invalid inferences', () => {
      const input = {
        thought: 'Attempting inference',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'formallogic',
        propositions: [{ id: 'P', symbol: 'P' }],
        logicalInferences: [
          {
            id: 'inf1',
            rule: 'affirming_consequent',
            premises: ['P', 'P->Q'],
            conclusion: 'P',
            valid: false,
          },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('invalid'))).toBe(true);
    });

    it('should warn about incomplete proof', () => {
      const input = {
        thought: 'Building proof',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'formallogic',
        propositions: [{ id: 'P', symbol: 'P' }],
        proof: {
          goal: 'Q',
          steps: [{ stepNumber: 1, statement: 'P', justification: 'Given' }],
          completeness: 0.5,
          valid: true,
        },
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('50%'))).toBe(true);
    });

    it('should warn about invalid proof', () => {
      const input = {
        thought: 'Invalid proof attempt',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'formallogic',
        propositions: [{ id: 'P', symbol: 'P' }],
        proof: {
          goal: 'Q',
          steps: [],
          completeness: 0,
          valid: false,
        },
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('invalid'))).toBe(true);
    });

    it('should pass validation with well-formed logic', () => {
      const input = {
        thought: 'Valid proof',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'formallogic',
        propositions: [
          { id: 'P', symbol: 'P', statement: 'Premise', value: true },
          { id: 'Q', symbol: 'Q', statement: 'Conclusion' },
        ],
        logicalInferences: [
          {
            id: 'inf1',
            rule: 'modus_ponens',
            premises: ['P', 'P->Q'],
            conclusion: 'Q',
            valid: true,
          },
        ],
        proof: {
          goal: 'Q',
          steps: [
            { stepNumber: 1, statement: 'P', justification: 'Given' },
            { stepNumber: 2, statement: 'P → Q', justification: 'Given' },
            { stepNumber: 3, statement: 'Q', justification: 'MP (1,2)' },
          ],
          completeness: 1,
          valid: true,
        },
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      // No warnings for invalid inferences or incomplete proofs
      expect(result.warnings.filter((w) => w.message.includes('invalid')).length).toBe(0);
    });
  });

  describe('getEnhancements', () => {
    it('should provide suggestions when no propositions', () => {
      const thought = handler.createThought(
        {
          thought: 'Starting logic',
          thoughtNumber: 1,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          mode: 'formallogic',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.toLowerCase().includes('proposition'))).toBe(true);
    });

    it('should suggest inference application when propositions exist', () => {
      const thought = handler.createThought(
        {
          thought: 'Propositions defined',
          thoughtNumber: 2,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          mode: 'formallogic',
          propositions: [{ id: 'P', symbol: 'P' }],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.toLowerCase().includes('inference'))).toBe(true);
    });

    it('should suggest continuing proof when incomplete', () => {
      const thought = handler.createThought(
        {
          thought: 'Building proof',
          thoughtNumber: 3,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'formallogic',
          propositions: [{ id: 'P', symbol: 'P' }],
          proof: {
            goal: 'Q',
            steps: [],
            completeness: 0.3,
          },
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.toLowerCase().includes('proof'))).toBe(true);
    });

    it('should list available inference rules', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'formallogic',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('modus_ponens'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('modus_tollens'))).toBe(true);
    });

    it('should include logic mental models', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'formallogic',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toBeDefined();
      expect(enhancements.mentalModels!.some((m) => m.includes('Propositional'))).toBe(true);
      expect(enhancements.mentalModels!.some((m) => m.includes('Truth Tables'))).toBe(true);
    });

    it('should include guiding questions', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'formallogic',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.length).toBeGreaterThan(0);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('inference rule'))).toBe(true);
    });

    it('should suggest related modes', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'formallogic',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.DEDUCTIVE);
      expect(enhancements.relatedModes).toContain(ThinkingMode.MATHEMATICS);
    });

    it('should calculate metrics correctly', () => {
      const thought = handler.createThought(
        {
          thought: 'Complete proof',
          thoughtNumber: 4,
          totalThoughts: 4,
          nextThoughtNeeded: false,
          mode: 'formallogic',
          propositions: [
            { id: 'P', symbol: 'P' },
            { id: 'Q', symbol: 'Q' },
          ],
          logicalInferences: [
            { id: 'inf1', rule: 'mp', valid: true },
            { id: 'inf2', rule: 'mt', valid: true },
            { id: 'inf3', rule: 'bad', valid: false },
          ],
          proof: {
            goal: 'Q',
            steps: [{ stepNumber: 1 }, { stepNumber: 2 }, { stepNumber: 3 }],
            completeness: 0.8,
          },
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.propositionCount).toBe(2);
      expect(enhancements.metrics!.inferenceCount).toBe(3);
      expect(enhancements.metrics!.validInferences).toBe(2);
      expect(enhancements.metrics!.proofStepCount).toBe(3);
      expect(enhancements.metrics!.proofCompleteness).toBe(0.8);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support proposition_definition', () => {
      expect(handler.supportsThoughtType('proposition_definition')).toBe(true);
    });

    it('should support inference_derivation', () => {
      expect(handler.supportsThoughtType('inference_derivation')).toBe(true);
    });

    it('should support proof_construction', () => {
      expect(handler.supportsThoughtType('proof_construction')).toBe(true);
    });

    it('should support satisfiability_check', () => {
      expect(handler.supportsThoughtType('satisfiability_check')).toBe(true);
    });

    it('should support validity_verification', () => {
      expect(handler.supportsThoughtType('validity_verification')).toBe(true);
    });

    it('should not support unknown types', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
      expect(handler.supportsThoughtType('hypothesis_generation')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete proof workflow', () => {
      const sessionId = 'e2e-formallogic';

      // Step 1: Define propositions
      const step1 = handler.createThought(
        {
          thought: 'Defining propositions for argument: If Socrates is a man, and all men are mortal, then Socrates is mortal',
          thoughtNumber: 1,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          mode: 'formallogic',
          thoughtType: 'proposition_definition',
          propositions: [
            { id: 'P', symbol: 'P', statement: 'Socrates is a man', value: true },
            { id: 'Q', symbol: 'Q', statement: 'Socrates is mortal' },
            { id: 'P->Q', symbol: '∀x(Man(x) → Mortal(x))', statement: 'All men are mortal', value: true },
          ],
        } as any,
        sessionId
      );
      expect(step1.thoughtType).toBe('proposition_definition');
      expect(step1.propositions).toHaveLength(3);

      // Step 2: Apply inference
      const step2Input = {
        thought: 'Applying modus ponens to derive conclusion',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'formallogic',
        thoughtType: 'inference_derivation',
        propositions: step1.propositions,
        logicalInferences: [
          {
            id: 'inf1',
            rule: 'modus_ponens',
            premises: ['P', 'P->Q'],
            conclusion: 'Q',
            valid: true,
          },
        ],
      };
      const step2 = handler.createThought(step2Input as any, sessionId);
      const validation2 = handler.validate(step2Input as any);
      expect(validation2.valid).toBe(true);
      expect(step2.logicalInferences![0].valid).toBe(true);

      // Step 3: Construct proof
      const step3Input = {
        thought: 'Constructing formal proof',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'formallogic',
        thoughtType: 'proof_construction',
        propositions: step1.propositions,
        logicalInferences: step2.logicalInferences,
        proof: {
          goal: 'Socrates is mortal',
          steps: [
            { stepNumber: 1, statement: 'Man(Socrates)', justification: 'Premise' },
            { stepNumber: 2, statement: '∀x(Man(x) → Mortal(x))', justification: 'Premise' },
            { stepNumber: 3, statement: 'Man(Socrates) → Mortal(Socrates)', justification: 'Universal Instantiation (2)' },
            { stepNumber: 4, statement: 'Mortal(Socrates)', justification: 'Modus Ponens (1, 3)' },
          ],
          completeness: 1,
          valid: true,
        },
      };
      const step3 = handler.createThought(step3Input as any, sessionId);
      const validation3 = handler.validate(step3Input as any);
      expect(validation3.valid).toBe(true);
      expect(step3.proof!.valid).toBe(true);
      expect(step3.proof!.completeness).toBe(1);

      // Step 4: Verify validity with truth table
      const step4 = handler.createThought(
        {
          thought: 'Verifying argument validity',
          thoughtNumber: 4,
          totalThoughts: 4,
          nextThoughtNeeded: false,
          mode: 'formallogic',
          thoughtType: 'validity_verification',
          propositions: step1.propositions,
          proof: step3.proof,
        } as any,
        sessionId
      );
      expect(step4.thoughtType).toBe('validity_verification');

      // Final enhancements should show complete proof
      const finalEnhancements = handler.getEnhancements(step4);
      expect(finalEnhancements.metrics!.proofCompleteness).toBe(1);
    });

    it('should detect logical fallacies', () => {
      const sessionId = 'e2e-fallacy';

      // Attempt affirming the consequent (fallacy)
      const input = {
        thought: 'Testing logical fallacy detection',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        mode: 'formallogic',
        thoughtType: 'inference_derivation',
        propositions: [
          { id: 'P', symbol: 'P', statement: 'It is raining' },
          { id: 'Q', symbol: 'Q', statement: 'Ground is wet', value: true },
          { id: 'P->Q', symbol: 'P → Q', statement: 'If rain then wet ground', value: true },
        ],
        logicalInferences: [
          {
            id: 'inf1',
            rule: 'affirming_consequent',
            premises: ['Q', 'P->Q'],
            conclusion: 'P', // Invalid: Q is true, P->Q is true, but P is not necessarily true
            valid: false,
          },
        ],
      };

      const thought = handler.createThought(input as any, sessionId);
      const validation = handler.validate(input as any);

      // Should warn about the invalid inference
      expect(validation.warnings.some((w) => w.message.includes('invalid'))).toBe(true);
      expect(thought.logicalInferences![0].valid).toBe(false);
    });
  });
});
