/**
 * Scientific Mode Integration Tests - Formal Logic
 *
 * Tests T-SCI-029 through T-SCI-038: Comprehensive integration tests
 * for the deepthinking_scientific tool with formallogic mode.
 *
 * Phase 11 Sprint 6: Analytical & Scientific Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type FormalLogicThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Scientific Mode Integration - Formal Logic', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * Helper to create basic formal logic input
   */
  function createFormalLogicInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Formal logic reasoning step',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'formallogic',
      ...overrides,
    } as ThinkingToolInput;
  }

  /**
   * T-SCI-029: Basic formallogic thought
   */
  describe('T-SCI-029: Basic Formal Logic Thought', () => {
    it('should create a basic formal logic thought with minimal params', () => {
      const input = createFormalLogicInput({
        thought: 'Analyzing logical structure',
      });

      const thought = factory.createThought(input, 'session-fml-029');

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought.content).toBe('Analyzing logical structure');
      expect(thought.sessionId).toBe('session-fml-029');
    });

    it('should assign unique IDs to formal logic thoughts', () => {
      const input1 = createFormalLogicInput({ thought: 'First proposition' });
      const input2 = createFormalLogicInput({ thought: 'Second proposition' });

      const thought1 = factory.createThought(input1, 'session-fml-029');
      const thought2 = factory.createThought(input2, 'session-fml-029');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should include thoughtType for formal logic mode', () => {
      const input = createFormalLogicInput({
        thought: 'Defining propositions',
        thoughtType: 'proposition_definition',
      });

      const thought = factory.createThought(input, 'session-fml-029') as FormalLogicThought;

      expect(thought.thoughtType).toBe('proposition_definition');
    });
  });

  /**
   * T-SCI-030: FormalLogic with premises array
   */
  describe('T-SCI-030: Formal Logic with Premises Array', () => {
    it('should create thought with premises array', () => {
      const input = createFormalLogicInput({
        thought: 'Establishing premises for argument',
        premises: ['All humans are mortal', 'Socrates is human'],
      });

      const thought = factory.createThought(input, 'session-fml-030') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      // Premises should be stored in the thought structure
      expect(thought.content).toContain('Establishing premises');
    });

    it('should handle multiple premises in a logical argument', () => {
      const input = createFormalLogicInput({
        thought: 'Building syllogism from multiple premises',
        premises: [
          'If P then Q',
          'If Q then R',
          'P is true',
        ],
      });

      const thought = factory.createThought(input, 'session-fml-030');

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
    });
  });

  /**
   * T-SCI-031: FormalLogic with conclusion
   */
  describe('T-SCI-031: Formal Logic with Conclusion', () => {
    it('should create thought with logical conclusion', () => {
      const input = createFormalLogicInput({
        thought: 'Deriving conclusion from premises',
        conclusion: 'Therefore, Socrates is mortal',
      });

      const thought = factory.createThought(input, 'session-fml-031') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought.content).toContain('Deriving conclusion');
    });

    it('should create thought with premises leading to conclusion', () => {
      const input = createFormalLogicInput({
        thought: 'Complete logical argument',
        premises: ['All A are B', 'All B are C'],
        conclusion: 'Therefore, all A are C',
      });

      const thought = factory.createThought(input, 'session-fml-031');

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
    });
  });

  /**
   * T-SCI-032: FormalLogic with inference type
   */
  describe('T-SCI-032: Formal Logic with Inference Type', () => {
    it('should create thought with modus ponens inference', () => {
      const input = createFormalLogicInput({
        thought: 'Applying modus ponens inference',
        inference: 'modus_ponens',
      });

      const thought = factory.createThought(input, 'session-fml-032') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
    });

    it('should create thought with modus tollens inference', () => {
      const input = createFormalLogicInput({
        thought: 'Applying modus tollens',
        inference: 'modus_tollens',
      });

      const thought = factory.createThought(input, 'session-fml-032');

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
    });

    it('should create thought with hypothetical syllogism', () => {
      const input = createFormalLogicInput({
        thought: 'Chain reasoning via hypothetical syllogism',
        inference: 'hypothetical_syllogism',
      });

      const thought = factory.createThought(input, 'session-fml-032');

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
    });
  });

  /**
   * T-SCI-033: FormalLogic propositional logic
   */
  describe('T-SCI-033: Formal Logic Propositional Logic', () => {
    it('should create thought with propositional logic formulas', () => {
      const input = createFormalLogicInput({
        thought: 'Working with propositional formulas',
        thoughtType: 'proposition_definition',
        propositions: [
          { id: 'P', symbol: 'P', statement: 'It is raining', type: 'atomic' },
          { id: 'Q', symbol: 'Q', statement: 'The ground is wet', type: 'atomic' },
        ],
      });

      const thought = factory.createThought(input, 'session-fml-033') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought.thoughtType).toBe('proposition_definition');
    });

    it('should create thought with compound propositions', () => {
      const input = createFormalLogicInput({
        thought: 'Building compound proposition P implies Q',
        thoughtType: 'proposition_definition',
        propositions: [
          { id: 'P_implies_Q', symbol: 'P->Q', statement: 'If raining then wet', type: 'compound', formula: 'P -> Q' },
        ],
      });

      const thought = factory.createThought(input, 'session-fml-033') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
    });
  });

  /**
   * T-SCI-034: FormalLogic predicate logic
   */
  describe('T-SCI-034: Formal Logic Predicate Logic', () => {
    it('should create thought with predicate logic structure', () => {
      const input = createFormalLogicInput({
        thought: 'Analyzing predicate logic with quantifiers',
        thoughtType: 'inference_derivation',
        logicalInferences: [
          {
            id: 'inf-1',
            rule: 'modus_ponens',
            premises: ['forall x: Human(x) -> Mortal(x)', 'Human(socrates)'],
            conclusion: 'Mortal(socrates)',
            justification: 'Universal instantiation and modus ponens',
            valid: true,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-fml-034') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought.thoughtType).toBe('inference_derivation');
    });

    it('should create thought with existential quantifier', () => {
      const input = createFormalLogicInput({
        thought: 'Reasoning with existential quantification',
        thoughtType: 'inference_derivation',
      });

      const thought = factory.createThought(input, 'session-fml-034') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
    });
  });

  /**
   * T-SCI-035: FormalLogic proof construction
   */
  describe('T-SCI-035: Formal Logic Proof Construction', () => {
    it('should create thought with direct proof construction', () => {
      const input = createFormalLogicInput({
        thought: 'Constructing direct proof',
        thoughtType: 'proof_construction',
        proof: {
          id: 'proof-1',
          theorem: 'If n is even, then n^2 is even',
          technique: 'direct',
          steps: [
            { stepNumber: 1, statement: 'Let n be even', justification: 'Assumption' },
            { stepNumber: 2, statement: 'n = 2k for some integer k', justification: 'Definition of even' },
            { stepNumber: 3, statement: 'n^2 = 4k^2 = 2(2k^2)', justification: 'Algebraic manipulation' },
            { stepNumber: 4, statement: 'Therefore n^2 is even', justification: 'Definition of even' },
          ],
          conclusion: 'n^2 is even',
          valid: true,
          completeness: 1.0,
        },
      });

      const thought = factory.createThought(input, 'session-fml-035') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought.thoughtType).toBe('proof_construction');
    });

    it('should create thought with proof by contradiction', () => {
      const input = createFormalLogicInput({
        thought: 'Constructing proof by contradiction',
        thoughtType: 'proof_construction',
        proof: {
          id: 'proof-2',
          theorem: 'sqrt(2) is irrational',
          technique: 'contradiction',
          steps: [
            { stepNumber: 1, statement: 'Assume sqrt(2) is rational', justification: 'Assumption for contradiction', isAssumption: true },
            { stepNumber: 2, statement: 'Then sqrt(2) = a/b in lowest terms', justification: 'Definition of rational' },
            { stepNumber: 3, statement: '2 = a^2/b^2, so 2b^2 = a^2', justification: 'Squaring both sides' },
            { stepNumber: 4, statement: 'a^2 is even, so a is even', justification: 'Property of even squares' },
            { stepNumber: 5, statement: 'Contradiction with a/b being in lowest terms', justification: 'Both a and b are even' },
          ],
          conclusion: 'sqrt(2) is irrational',
          valid: true,
          completeness: 1.0,
        },
      });

      const thought = factory.createThought(input, 'session-fml-035') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought.thoughtType).toBe('proof_construction');
    });
  });

  /**
   * T-SCI-036: FormalLogic validity verification
   */
  describe('T-SCI-036: Formal Logic Validity Verification', () => {
    it('should create thought for validity verification', () => {
      const input = createFormalLogicInput({
        thought: 'Verifying validity of logical argument',
        thoughtType: 'validity_verification',
      });

      const thought = factory.createThought(input, 'session-fml-036') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought.thoughtType).toBe('validity_verification');
    });

    it('should create thought with truth table analysis', () => {
      const input = createFormalLogicInput({
        thought: 'Using truth table to verify tautology',
        thoughtType: 'validity_verification',
        truthTable: {
          id: 'tt-1',
          propositions: ['P', 'Q'],
          formula: '(P -> Q) <-> (!P || Q)',
          rows: [
            { rowNumber: 1, assignments: { P: true, Q: true }, result: true },
            { rowNumber: 2, assignments: { P: true, Q: false }, result: true },
            { rowNumber: 3, assignments: { P: false, Q: true }, result: true },
            { rowNumber: 4, assignments: { P: false, Q: false }, result: true },
          ],
          isTautology: true,
          isContradiction: false,
          isContingent: false,
        },
      });

      const thought = factory.createThought(input, 'session-fml-036') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought.thoughtType).toBe('validity_verification');
    });
  });

  /**
   * T-SCI-037: FormalLogic multi-step proof
   */
  describe('T-SCI-037: Formal Logic Multi-Step Proof', () => {
    it('should create multi-thought proof construction session', () => {
      // First thought: establish premises
      const input1 = createFormalLogicInput({
        thought: 'Establishing premises for chain proof',
        thoughtNumber: 1,
        totalThoughts: 4,
        thoughtType: 'proposition_definition',
        propositions: [
          { id: 'P', symbol: 'P', statement: 'All mammals are warm-blooded', type: 'atomic' },
          { id: 'Q', symbol: 'Q', statement: 'All whales are mammals', type: 'atomic' },
          { id: 'R', symbol: 'R', statement: 'Moby Dick is a whale', type: 'atomic' },
        ],
      });

      const thought1 = factory.createThought(input1, 'session-fml-037') as FormalLogicThought;

      expect(thought1.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought1.thoughtNumber).toBe(1);

      // Second thought: derive intermediate conclusion
      const input2 = createFormalLogicInput({
        thought: 'Deriving that whales are warm-blooded',
        thoughtNumber: 2,
        totalThoughts: 4,
        thoughtType: 'inference_derivation',
        logicalInferences: [
          {
            id: 'inf-1',
            rule: 'hypothetical_syllogism',
            premises: ['Q', 'P'],
            conclusion: 'All whales are warm-blooded',
            justification: 'Transitivity of subset relation',
            valid: true,
          },
        ],
      });

      const thought2 = factory.createThought(input2, 'session-fml-037') as FormalLogicThought;

      expect(thought2.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought2.thoughtNumber).toBe(2);

      // Third thought: apply to specific instance
      const input3 = createFormalLogicInput({
        thought: 'Applying to Moby Dick',
        thoughtNumber: 3,
        totalThoughts: 4,
        thoughtType: 'inference_derivation',
        logicalInferences: [
          {
            id: 'inf-2',
            rule: 'modus_ponens',
            premises: ['R', 'Whales are warm-blooded'],
            conclusion: 'Moby Dick is warm-blooded',
            justification: 'Modus ponens with universal instantiation',
            valid: true,
          },
        ],
      });

      const thought3 = factory.createThought(input3, 'session-fml-037') as FormalLogicThought;

      expect(thought3.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought3.thoughtNumber).toBe(3);

      // Fourth thought: complete proof
      const input4 = createFormalLogicInput({
        thought: 'Completing the proof',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        thoughtType: 'proof_construction',
        proof: {
          id: 'proof-chain',
          theorem: 'Moby Dick is warm-blooded',
          technique: 'direct',
          steps: [
            { stepNumber: 1, statement: 'All mammals are warm-blooded', justification: 'Premise P' },
            { stepNumber: 2, statement: 'All whales are mammals', justification: 'Premise Q' },
            { stepNumber: 3, statement: 'Moby Dick is a whale', justification: 'Premise R' },
            { stepNumber: 4, statement: 'All whales are warm-blooded', justification: 'Hypothetical syllogism (1, 2)', referencesSteps: [1, 2] },
            { stepNumber: 5, statement: 'Moby Dick is warm-blooded', justification: 'Modus ponens (3, 4)', referencesSteps: [3, 4] },
          ],
          conclusion: 'Moby Dick is warm-blooded',
          valid: true,
          completeness: 1.0,
        },
      });

      const thought4 = factory.createThought(input4, 'session-fml-037') as FormalLogicThought;

      expect(thought4.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought4.thoughtNumber).toBe(4);
      expect(thought4.nextThoughtNeeded).toBe(false);
    });
  });

  /**
   * T-SCI-038: FormalLogic with contradiction detection
   */
  describe('T-SCI-038: Formal Logic Contradiction Detection', () => {
    it('should create thought for satisfiability check', () => {
      const input = createFormalLogicInput({
        thought: 'Checking satisfiability of formula set',
        thoughtType: 'satisfiability_check',
        satisfiability: {
          id: 'sat-1',
          formula: 'P AND NOT P',
          satisfiable: false,
          method: 'dpll',
          explanation: 'Formula is unsatisfiable - direct contradiction P and not P',
        },
      });

      const thought = factory.createThought(input, 'session-fml-038') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought.thoughtType).toBe('satisfiability_check');
    });

    it('should create thought detecting contradiction in premises', () => {
      const input = createFormalLogicInput({
        thought: 'Detecting contradiction in set of premises',
        thoughtType: 'satisfiability_check',
        propositions: [
          { id: 'P1', symbol: 'P1', statement: 'All birds can fly', type: 'atomic' },
          { id: 'P2', symbol: 'P2', statement: 'Penguins are birds', type: 'atomic' },
          { id: 'P3', symbol: 'P3', statement: 'Penguins cannot fly', type: 'atomic' },
        ],
        satisfiability: {
          id: 'sat-2',
          formula: 'P1 AND P2 AND P3',
          satisfiable: false,
          method: 'resolution',
          explanation: 'Contradiction: P1 and P2 imply penguins can fly, but P3 states they cannot',
        },
      });

      const thought = factory.createThought(input, 'session-fml-038') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought.thoughtType).toBe('satisfiability_check');
    });

    it('should create thought with satisfiable formula', () => {
      const input = createFormalLogicInput({
        thought: 'Checking satisfiability - formula is satisfiable',
        thoughtType: 'satisfiability_check',
        satisfiability: {
          id: 'sat-3',
          formula: 'P OR Q',
          satisfiable: true,
          model: { P: true, Q: false },
          method: 'truth_table',
          explanation: 'Formula is satisfiable with P=true, Q=false',
        },
      });

      const thought = factory.createThought(input, 'session-fml-038') as FormalLogicThought;

      expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      expect(thought.thoughtType).toBe('satisfiability_check');
    });
  });
});
