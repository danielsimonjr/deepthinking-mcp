/**
 * Analytical Mode Integration Tests - First Principles Reasoning
 *
 * Tests T-ANL-013 through T-ANL-020: Comprehensive integration tests
 * for the deepthinking_analytical tool with firstprinciples mode.
 *
 * Phase 11 Sprint 6: Analytical & Scientific Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type FirstPrinciplesThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Analytical Mode Integration - First Principles Reasoning', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * Helper to create basic first principles input
   */
  function createFirstPrinciplesInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'First principles reasoning step',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'firstprinciples',
      ...overrides,
    } as ThinkingToolInput;
  }

  /**
   * T-ANL-013: Basic firstprinciples thought
   */
  describe('T-ANL-013: Basic First Principles Thought', () => {
    it('should create a basic first principles thought with minimal params', () => {
      const input = createFirstPrinciplesInput({
        thought: 'Breaking down to fundamental truths',
      });

      const thought = factory.createThought(input, 'session-fp-013');

      expect(thought.mode).toBe(ThinkingMode.FIRSTPRINCIPLES);
      expect(thought.content).toBe('Breaking down to fundamental truths');
      expect(thought.sessionId).toBe('session-fp-013');
    });

    it('should assign unique IDs to first principles thoughts', () => {
      const input1 = createFirstPrinciplesInput({ thought: 'First axiom' });
      const input2 = createFirstPrinciplesInput({ thought: 'Second axiom' });

      const thought1 = factory.createThought(input1, 'session-fp-013');
      const thought2 = factory.createThought(input2, 'session-fp-013');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should set timestamp correctly', () => {
      const before = new Date();
      const input = createFirstPrinciplesInput();
      const thought = factory.createThought(input, 'session-fp-013');
      const after = new Date();

      expect(thought.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(thought.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  /**
   * T-ANL-014: FirstPrinciples with fundamentals array
   */
  describe('T-ANL-014: Fundamentals Array', () => {
    it('should include foundational principles', () => {
      const input = createFirstPrinciplesInput({
        thought: 'Identifying fundamental axioms',
        question: 'What are the basic principles of thermodynamics?',
        principles: [
          {
            id: 'fp-1',
            type: 'axiom',
            statement: 'Energy cannot be created or destroyed',
            justification: 'Conservation of energy principle',
          },
          {
            id: 'fp-2',
            type: 'axiom',
            statement: 'Entropy of an isolated system tends to increase',
            justification: 'Second law of thermodynamics',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-fp-014') as FirstPrinciplesThought;

      expect(thought.question).toBe('What are the basic principles of thermodynamics?');
      expect(thought.principles).toHaveLength(2);
      expect(thought.principles[0].type).toBe('axiom');
    });

    it('should handle different principle types', () => {
      const input = createFirstPrinciplesInput({
        thought: 'Different types of principles',
        principles: [
          { id: 'p1', type: 'axiom', statement: 'Self-evident truth', justification: 'Axiom' },
          { id: 'p2', type: 'definition', statement: 'Term definition', justification: 'Definition' },
          { id: 'p3', type: 'observation', statement: 'Observed fact', justification: 'Empirical', confidence: 0.9 },
          { id: 'p4', type: 'assumption', statement: 'Working assumption', justification: 'Assumed', confidence: 0.7 },
        ],
      });

      const thought = factory.createThought(input, 'session-fp-014') as FirstPrinciplesThought;

      expect(thought.principles).toHaveLength(4);
      expect(thought.principles.map(p => p.type)).toContain('axiom');
      expect(thought.principles.map(p => p.type)).toContain('definition');
      expect(thought.principles.map(p => p.type)).toContain('observation');
      expect(thought.principles.map(p => p.type)).toContain('assumption');
    });
  });

  /**
   * T-ANL-015: FirstPrinciples with derivedInsights array
   */
  describe('T-ANL-015: Derived Insights Array', () => {
    it('should include derivation steps leading to insights', () => {
      const input = createFirstPrinciplesInput({
        thought: 'Deriving insights from fundamentals',
        principles: [
          {
            id: 'fp-1',
            type: 'axiom',
            statement: 'All matter is composed of atoms',
            justification: 'Atomic theory',
          },
        ],
        derivationSteps: [
          {
            stepNumber: 1,
            principle: 'fp-1',
            inference: 'Therefore, complex structures emerge from atomic interactions',
            confidence: 0.95,
          },
          {
            stepNumber: 2,
            principle: 'fp-1',
            inference: 'Chemical bonds form due to electron sharing or transfer',
            confidence: 0.9,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-fp-015') as FirstPrinciplesThought;

      expect(thought.derivationSteps).toHaveLength(2);
      expect(thought.derivationSteps[0].inference).toContain('atomic interactions');
    });

    it('should support logical form in derivation steps', () => {
      const input = createFirstPrinciplesInput({
        thought: 'Formal derivation',
        derivationSteps: [
          {
            stepNumber: 1,
            principle: 'p1',
            inference: 'If A then B',
            logicalForm: 'A -> B',
            confidence: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-fp-015') as FirstPrinciplesThought;

      expect(thought.derivationSteps[0].logicalForm).toBe('A -> B');
    });
  });

  /**
   * T-ANL-016: FirstPrinciples assumption decomposition
   */
  describe('T-ANL-016: Assumption Decomposition', () => {
    it('should decompose complex assumptions into fundamentals', () => {
      const input = createFirstPrinciplesInput({
        thought: 'Decomposing assumption: Renewable energy is better',
        question: 'Why might renewable energy be preferable?',
        principles: [
          {
            id: 'obs-1',
            type: 'observation',
            statement: 'Fossil fuels produce CO2 when burned',
            justification: 'Chemical combustion reaction',
            confidence: 1.0,
          },
          {
            id: 'obs-2',
            type: 'observation',
            statement: 'CO2 is a greenhouse gas',
            justification: 'Spectroscopic absorption properties',
            confidence: 1.0,
          },
          {
            id: 'obs-3',
            type: 'observation',
            statement: 'Greenhouse gases cause warming',
            justification: 'Radiative forcing physics',
            confidence: 0.95,
          },
          {
            id: 'def-1',
            type: 'definition',
            statement: 'Renewable energy sources regenerate naturally',
            justification: 'Definition of renewable',
          },
          {
            id: 'obs-4',
            type: 'observation',
            statement: 'Solar and wind do not produce CO2 during operation',
            justification: 'Direct observation of operation',
            confidence: 1.0,
          },
        ],
        derivationSteps: [
          {
            stepNumber: 1,
            principle: 'obs-1,obs-2,obs-3',
            inference: 'Fossil fuel use contributes to global warming',
            confidence: 0.95,
          },
          {
            stepNumber: 2,
            principle: 'def-1,obs-4',
            inference: 'Renewable energy operation does not contribute to warming',
            confidence: 0.98,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-fp-016') as FirstPrinciplesThought;

      expect(thought.principles.length).toBeGreaterThanOrEqual(5);
      expect(thought.derivationSteps).toHaveLength(2);
    });
  });

  /**
   * T-ANL-017: FirstPrinciples axiom identification
   */
  describe('T-ANL-017: Axiom Identification', () => {
    it('should identify core axioms', () => {
      const input = createFirstPrinciplesInput({
        thought: 'Identifying mathematical axioms',
        question: 'What are the axioms of arithmetic?',
        principles: [
          {
            id: 'pa-1',
            type: 'axiom',
            statement: '0 is a natural number',
            justification: 'Peano Axiom 1',
            latex: '0 \\in \\mathbb{N}',
          },
          {
            id: 'pa-2',
            type: 'axiom',
            statement: 'Every natural number has a successor',
            justification: 'Peano Axiom 2',
            latex: '\\forall n \\in \\mathbb{N}, S(n) \\in \\mathbb{N}',
          },
          {
            id: 'pa-3',
            type: 'axiom',
            statement: 'No natural number has 0 as its successor',
            justification: 'Peano Axiom 3',
            latex: '\\forall n \\in \\mathbb{N}, S(n) \\neq 0',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-fp-017') as FirstPrinciplesThought;

      expect(thought.principles.every(p => p.type === 'axiom')).toBe(true);
      expect(thought.principles[0].latex).toBeDefined();
    });

    it('should include principle dependencies', () => {
      const input = createFirstPrinciplesInput({
        thought: 'Principles with dependencies',
        principles: [
          {
            id: 'base',
            type: 'axiom',
            statement: 'Base axiom',
            justification: 'Fundamental',
          },
          {
            id: 'derived',
            type: 'logical_inference',
            statement: 'Derived principle',
            justification: 'Follows from base',
            dependsOn: ['base'],
          },
        ],
      });

      const thought = factory.createThought(input, 'session-fp-017') as FirstPrinciplesThought;

      expect(thought.principles[1].dependsOn).toContain('base');
    });
  });

  /**
   * T-ANL-018: FirstPrinciples multi-thought derivation
   */
  describe('T-ANL-018: Multi-Thought Derivation', () => {
    it('should support multi-step derivation across thoughts', () => {
      const sessionId = 'session-fp-018-multi';

      // Step 1: Establish foundational principles
      const step1Input = createFirstPrinciplesInput({
        thought: 'Step 1: Establishing foundations for rocketry',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        question: 'Why do rockets work in space?',
        principles: [
          {
            id: 'n3',
            type: 'axiom',
            statement: 'For every action there is an equal and opposite reaction',
            justification: 'Newton Third Law',
          },
          {
            id: 'n2',
            type: 'axiom',
            statement: 'F = ma',
            justification: 'Newton Second Law',
            latex: 'F = ma',
          },
        ],
      });
      const step1 = factory.createThought(step1Input, sessionId) as FirstPrinciplesThought;
      expect(step1.principles).toHaveLength(2);

      // Step 2: First derivation
      const step2Input = createFirstPrinciplesInput({
        thought: 'Step 2: Deriving thrust mechanism',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        derivationSteps: [
          {
            stepNumber: 1,
            principle: 'n3',
            inference: 'Ejecting mass creates opposite force on rocket',
            confidence: 1.0,
          },
        ],
      });
      const step2 = factory.createThought(step2Input, sessionId) as FirstPrinciplesThought;
      expect(step2.derivationSteps).toHaveLength(1);

      // Step 3: Second derivation
      const step3Input = createFirstPrinciplesInput({
        thought: 'Step 3: Deriving acceleration',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        derivationSteps: [
          {
            stepNumber: 2,
            principle: 'n2',
            inference: 'Force on rocket causes acceleration (F/m)',
            confidence: 1.0,
            latex: 'a = F/m',
          },
        ],
      });
      const step3 = factory.createThought(step3Input, sessionId) as FirstPrinciplesThought;
      expect(step3.derivationSteps[0].latex).toBe('a = F/m');

      // Step 4: Conclusion
      const step4Input = createFirstPrinciplesInput({
        thought: 'Step 4: Concluding analysis',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        conclusion: {
          statement: 'Rockets work in space by ejecting mass, creating thrust via Newton laws',
          derivationChain: [1, 2],
          certainty: 0.99,
          limitations: ['Assumes ideal conditions', 'Relativistic effects ignored'],
        },
      });
      const step4 = factory.createThought(step4Input, sessionId) as FirstPrinciplesThought;
      expect(step4.conclusion.certainty).toBe(0.99);
      expect(step4.conclusion.limitations).toHaveLength(2);
    });
  });

  /**
   * T-ANL-019: FirstPrinciples with branching alternatives
   */
  describe('T-ANL-019: Branching Alternatives', () => {
    it('should support alternative interpretations', () => {
      const input = createFirstPrinciplesInput({
        thought: 'Exploring alternative foundational approaches',
        question: 'What is the foundation of consciousness?',
        principles: [
          {
            id: 'cogito',
            type: 'axiom',
            statement: 'I think, therefore I am',
            justification: 'Descartes first principle',
          },
        ],
        alternativeInterpretations: [
          'Consciousness may be an emergent property of complex information processing',
          'Consciousness may be fundamental to the universe (panpsychism)',
          'Consciousness may be an illusion or epiphenomenon',
        ],
      });

      const thought = factory.createThought(input, 'session-fp-019') as FirstPrinciplesThought;

      expect(thought.alternativeInterpretations).toHaveLength(3);
    });

    it('should support branching from a thought', () => {
      const input = createFirstPrinciplesInput({
        thought: 'Branching to alternative axiom system',
        branchFrom: 'thought-1',
        branchId: 'euclidean-vs-non-euclidean',
        principles: [
          {
            id: 'parallel-alt',
            type: 'axiom',
            statement: 'Through a point, infinitely many parallels exist',
            justification: 'Hyperbolic geometry axiom (alternative to Euclid fifth postulate)',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-fp-019') as FirstPrinciplesThought;

      expect(thought.mode).toBe(ThinkingMode.FIRSTPRINCIPLES);
      // branchFrom/branchId are input parameters tracked at session level
      expect(thought.id).toBeDefined();
      expect(thought.principles).toHaveLength(1);
    });
  });

  /**
   * T-ANL-020: FirstPrinciples with revision
   */
  describe('T-ANL-020: Revision', () => {
    it('should support revision of first principles analysis', () => {
      const sessionId = 'session-fp-020-rev';

      // Original thought
      const originalInput = createFirstPrinciplesInput({
        thought: 'Original analysis of gravity',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        principles: [
          {
            id: 'newton-gravity',
            type: 'axiom',
            statement: 'Gravitational force is proportional to masses and inversely to distance squared',
            justification: 'Newtonian gravity',
          },
        ],
      });
      const original = factory.createThought(originalInput, sessionId) as FirstPrinciplesThought;

      // Revision with Einstein's insight
      const revisionInput = createFirstPrinciplesInput({
        thought: 'Revising gravity understanding with general relativity',
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false,
        isRevision: true,
        revisesThought: original.id,
        revisionReason: 'Newton gravity is approximation; spacetime curvature is more fundamental',
        principles: [
          {
            id: 'gr-principle',
            type: 'axiom',
            statement: 'Mass-energy tells spacetime how to curve; spacetime tells matter how to move',
            justification: 'General Relativity equivalence principle',
            latex: 'G_{\\mu\\nu} = 8\\pi T_{\\mu\\nu}',
          },
        ],
        conclusion: {
          statement: 'Gravity is not a force but geometry of spacetime',
          derivationChain: [1],
          certainty: 0.98,
          limitations: ['Does not include quantum effects'],
        },
      });
      const revision = factory.createThought(revisionInput, sessionId) as FirstPrinciplesThought;

      expect(revision.isRevision).toBe(true);
      expect(revision.revisesThought).toBe(original.id);
      expect(revision.principles[0].latex).toContain('G_{\\mu\\nu}');
    });
  });
});
