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
  isAbductiveThought,
  isCausalThought,
  isBayesianThought,
  isCounterfactualThought,
  isAnalogicalThought,
  type SequentialThought,
  type ShannonThought,
  type MathematicsThought,
  type PhysicsThought,
  type HybridThought,
  type AbductiveThought,
  type CausalThought,
  type BayesianThought,
  type CounterfactualThought,
  type AnalogicalThought,
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

  describe('isAbductiveThought', () => {
    it('should identify abductive thoughts correctly', () => {
      const thought: AbductiveThought = {
        id: 'test-6',
        sessionId: 'session-1',
        mode: ThinkingMode.ABDUCTIVE,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Test abductive thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        observations: [
          { id: 'obs-1', description: 'Test observation', confidence: 0.9 },
        ],
        hypotheses: [],
        evaluationCriteria: {
          parsimony: 0.7,
          explanatoryPower: 0.8,
          plausibility: 0.75,
          testability: true,
        },
        evidence: [],
      };

      expect(isAbductiveThought(thought)).toBe(true);
      expect(isCausalThought(thought)).toBe(false);
      expect(isBayesianThought(thought)).toBe(false);
    });
  });

  describe('isCausalThought', () => {
    it('should identify causal thoughts correctly', () => {
      const thought: CausalThought = {
        id: 'test-7',
        sessionId: 'session-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Test causal thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Cause', type: 'cause', description: 'Test' },
            { id: 'n2', name: 'Effect', type: 'effect', description: 'Test' },
          ],
          edges: [
            { from: 'n1', to: 'n2', strength: 0.8, confidence: 0.9 },
          ],
        },
        mechanisms: [],
      };

      expect(isCausalThought(thought)).toBe(true);
      expect(isAbductiveThought(thought)).toBe(false);
      expect(isBayesianThought(thought)).toBe(false);
    });
  });

  describe('isBayesianThought', () => {
    it('should identify Bayesian thoughts correctly', () => {
      const thought: BayesianThought = {
        id: 'test-8',
        sessionId: 'session-1',
        mode: ThinkingMode.BAYESIAN,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Test Bayesian thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        hypothesis: {
          id: 'h1',
          statement: 'Test hypothesis',
        },
        prior: {
          probability: 0.3,
          justification: 'Test',
        },
        likelihood: {
          probability: 0.7,
          description: 'Test',
        },
        evidence: [],
        posterior: {
          probability: 0.5,
          calculation: 'Bayes rule',
        },
      };

      expect(isBayesianThought(thought)).toBe(true);
      expect(isCausalThought(thought)).toBe(false);
      expect(isCounterfactualThought(thought)).toBe(false);
    });
  });

  describe('isCounterfactualThought', () => {
    it('should identify counterfactual thoughts correctly', () => {
      const thought: CounterfactualThought = {
        id: 'test-9',
        sessionId: 'session-1',
        mode: ThinkingMode.COUNTERFACTUAL,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Test counterfactual thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        actual: {
          id: 'actual',
          name: 'Actual',
          description: 'What happened',
          conditions: [],
          outcomes: [],
        },
        counterfactuals: [
          {
            id: 'cf1',
            name: 'Alternative',
            description: 'What if',
            conditions: [],
            outcomes: [],
          },
        ],
        comparison: {
          differences: [],
          insights: [],
          lessons: [],
        },
        interventionPoint: {
          description: 'Decision point',
          alternatives: [],
        },
      };

      expect(isCounterfactualThought(thought)).toBe(true);
      expect(isBayesianThought(thought)).toBe(false);
      expect(isAnalogicalThought(thought)).toBe(false);
    });
  });

  describe('isAnalogicalThought', () => {
    it('should identify analogical thoughts correctly', () => {
      const thought: AnalogicalThought = {
        id: 'test-10',
        sessionId: 'session-1',
        mode: ThinkingMode.ANALOGICAL,
        thoughtNumber: 1,
        totalThoughts: 5,
        content: 'Test analogical thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        sourceDomain: {
          id: 'source',
          name: 'Source',
          description: 'Known domain',
          entities: [],
          relations: [],
          properties: [],
        },
        targetDomain: {
          id: 'target',
          name: 'Target',
          description: 'New domain',
          entities: [],
          relations: [],
          properties: [],
        },
        mapping: [],
        insights: [],
        inferences: [],
        limitations: [],
        analogyStrength: 0.7,
      };

      expect(isAnalogicalThought(thought)).toBe(true);
      expect(isCounterfactualThought(thought)).toBe(false);
      expect(isSequentialThought(thought)).toBe(false);
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
