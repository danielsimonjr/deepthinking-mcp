/**
 * Unit tests for core types and type guards
 */

import { describe, it, expect } from 'vitest';
import {
  ThinkingMode,
  ShannonStage,
  isSequentialThought,
  isShannonThought,
  isMathematicsThought,
  isPhysicsThought,
  isHybridThought,
  type SequentialThought,
  type ShannonThought,
  type MathematicsThought,
  type PhysicsThought,
  type HybridThought,
} from '../../src/types/core.js';

describe('Type Guards', () => {
  describe('isSequentialThought', () => {
    it('should identify sequential thoughts correctly', () => {
      const thought: SequentialThought = {
        id: 'test-1',
        sessionId: 'session-1',
        mode: ThinkingMode.SEQUENTIAL,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Test sequential thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
      };

      expect(isSequentialThought(thought)).toBe(true);
      expect(isShannonThought(thought)).toBe(false);
      expect(isMathematicsThought(thought)).toBe(false);
    });
  });

  describe('isShannonThought', () => {
    it('should identify Shannon thoughts correctly', () => {
      const thought: ShannonThought = {
        id: 'test-2',
        sessionId: 'session-1',
        mode: ThinkingMode.SHANNON,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Test Shannon thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        stage: ShannonStage.PROBLEM_DEFINITION,
        uncertainty: 0.2,
        dependencies: [],
        assumptions: ['Test assumption'],
      };

      expect(isShannonThought(thought)).toBe(true);
      expect(isSequentialThought(thought)).toBe(false);
      expect(isPhysicsThought(thought)).toBe(false);
    });
  });

  describe('isMathematicsThought', () => {
    it('should identify mathematics thoughts correctly', () => {
      const thought: MathematicsThought = {
        id: 'test-3',
        sessionId: 'session-1',
        mode: ThinkingMode.MATHEMATICS,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Test mathematics thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        thoughtType: 'theorem_statement',
        dependencies: [],
        assumptions: [],
        uncertainty: 0.1,
      };

      expect(isMathematicsThought(thought)).toBe(true);
      expect(isShannonThought(thought)).toBe(false);
      expect(isSequentialThought(thought)).toBe(false);
    });
  });

  describe('isPhysicsThought', () => {
    it('should identify physics thoughts correctly', () => {
      const thought: PhysicsThought = {
        id: 'test-4',
        sessionId: 'session-1',
        mode: ThinkingMode.PHYSICS,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Test physics thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        thoughtType: 'tensor_formulation',
        dependencies: [],
        assumptions: [],
        uncertainty: 0.15,
        tensorProperties: {
          rank: [2, 0],
          components: 'F^{μν}',
          latex: 'F^{\\mu\\nu}',
          symmetries: ['antisymmetric'],
          invariants: ['F_{μν}F^{μν}'],
          transformation: 'contravariant',
        },
      };

      expect(isPhysicsThought(thought)).toBe(true);
      expect(isMathematicsThought(thought)).toBe(false);
      expect(isSequentialThought(thought)).toBe(false);
    });
  });

  describe('isHybridThought', () => {
    it('should identify hybrid thoughts correctly', () => {
      const thought: HybridThought = {
        id: 'test-5',
        sessionId: 'session-1',
        mode: ThinkingMode.HYBRID,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Test hybrid thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        primaryMode: 'mathematics',
        secondaryFeatures: ['tensor_support'],
      };

      expect(isHybridThought(thought)).toBe(true);
      expect(isSequentialThought(thought)).toBe(false);
      expect(isPhysicsThought(thought)).toBe(false);
    });
  });
});

describe('Thought Structures', () => {
  describe('SequentialThought', () => {
    it('should support revision tracking', () => {
      const thought: SequentialThought = {
        id: 'test-rev-1',
        sessionId: 'session-1',
        mode: ThinkingMode.SEQUENTIAL,
        thoughtNumber: 2,
        totalThoughts: 5,
        content: 'Revised thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        isRevision: true,
        revisesThought: 'test-1',
        revisionReason: 'Found better approach',
      };

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('test-1');
      expect(thought.revisionReason).toBeDefined();
    });
  });

  describe('MathematicsThought', () => {
    it('should support proof strategies', () => {
      const thought: MathematicsThought = {
        id: 'test-math-1',
        sessionId: 'session-1',
        mode: ThinkingMode.MATHEMATICS,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Proof by induction',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        thoughtType: 'proof_construction',
        dependencies: [],
        assumptions: ['n ≥ 0'],
        uncertainty: 0.05,
        proofStrategy: {
          type: 'induction',
          steps: ['Base case: n = 0', 'Inductive hypothesis', 'Inductive step'],
          baseCase: 'P(0) is true',
          inductiveStep: 'P(k) → P(k+1)',
          completeness: 0.9,
        },
      };

      expect(thought.proofStrategy?.type).toBe('induction');
      expect(thought.proofStrategy?.completeness).toBe(0.9);
    });

    it('should support mathematical models', () => {
      const thought: MathematicsThought = {
        id: 'test-math-2',
        sessionId: 'session-1',
        mode: ThinkingMode.MATHEMATICS,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Define the equation',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        thoughtType: 'theorem_statement',
        dependencies: [],
        assumptions: [],
        uncertainty: 0.1,
        mathematicalModel: {
          latex: 'a^2 + b^2 = c^2',
          symbolic: 'a**2 + b**2 == c**2',
          complexity: 'O(1)',
        },
      };

      expect(thought.mathematicalModel?.latex).toBe('a^2 + b^2 = c^2');
      expect(thought.mathematicalModel?.symbolic).toBe('a**2 + b**2 == c**2');
    });
  });

  describe('PhysicsThought', () => {
    it('should support tensor properties', () => {
      const thought: PhysicsThought = {
        id: 'test-phys-1',
        sessionId: 'session-1',
        mode: ThinkingMode.PHYSICS,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Define electromagnetic tensor',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        thoughtType: 'tensor_formulation',
        dependencies: [],
        assumptions: ['Flat spacetime'],
        uncertainty: 0.1,
        tensorProperties: {
          rank: [2, 0],
          components: 'F^{μν} = ∂^μ A^ν - ∂^ν A^μ',
          latex: 'F^{\\mu\\nu}',
          symmetries: ['antisymmetric'],
          invariants: ['F_{μν}F^{μν}', 'ε^{μνρσ}F_{μν}F_{ρσ}'],
          transformation: 'contravariant',
          indexStructure: '^μν',
        },
        physicalInterpretation: {
          quantity: 'Electromagnetic field strength',
          units: 'GeV^2',
          conservationLaws: ['Energy-momentum', 'Charge'],
        },
      };

      expect(thought.tensorProperties?.rank).toEqual([2, 0]);
      expect(thought.tensorProperties?.symmetries).toContain('antisymmetric');
      expect(thought.physicalInterpretation?.quantity).toBe('Electromagnetic field strength');
    });
  });
});
