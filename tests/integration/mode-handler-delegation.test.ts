/**
 * Mode Handler Delegation Integration Tests - Phase 10 Sprint 2
 *
 * Tests that verify:
 * - RefactoredThoughtFactory correctly delegates to specialized handlers
 * - Non-migrated modes fall back to GenericModeHandler
 * - Registry properly tracks handler registrations
 * - Integration between handlers and thought creation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RefactoredThoughtFactory } from '../../src/services/RefactoredThoughtFactory.js';
import { ModeHandlerRegistry } from '../../src/modes/handlers/registry.js';
import { ThinkingMode } from '../../src/types/core.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';

describe('Mode Handler Delegation', () => {
  let factory: RefactoredThoughtFactory;

  beforeEach(() => {
    // Reset registry before each test
    ModeHandlerRegistry.resetInstance();
    // Create factory with auto-registration
    factory = new RefactoredThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  describe('Specialized Handler Registration', () => {
    it('should auto-register specialized handlers on construction', () => {
      const stats = factory.getStats();

      expect(stats.specializedHandlers).toBe(3);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.CAUSAL);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.BAYESIAN);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.GAMETHEORY);
    });

    it('should report specialized handler status correctly', () => {
      expect(factory.hasSpecializedHandler(ThinkingMode.CAUSAL)).toBe(true);
      expect(factory.hasSpecializedHandler(ThinkingMode.BAYESIAN)).toBe(true);
      expect(factory.hasSpecializedHandler(ThinkingMode.GAMETHEORY)).toBe(true);
      expect(factory.hasSpecializedHandler(ThinkingMode.SEQUENTIAL)).toBe(false);
      expect(factory.hasSpecializedHandler(ThinkingMode.HYBRID)).toBe(false);
    });
  });

  describe('Delegation to Specialized Handlers', () => {
    it('should delegate CAUSAL mode to CausalHandler', () => {
      const input: ThinkingToolInput = {
        thought: 'Testing causal delegation',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        causalGraph: {
          nodes: [
            { id: 'A', name: 'Cause', type: 'cause', description: 'Test cause' },
            { id: 'B', name: 'Effect', type: 'effect', description: 'Test effect' },
          ],
          edges: [
            { from: 'A', to: 'B', strength: 0.8, confidence: 0.9 },
          ],
        },
      } as any;

      const thought = factory.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.CAUSAL);
      expect((thought as any).causalGraph).toBeDefined();
      expect((thought as any).causalGraph.nodes).toHaveLength(2);
    });

    it('should delegate BAYESIAN mode to BayesianHandler', () => {
      const input: ThinkingToolInput = {
        thought: 'Testing Bayesian delegation',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: 0.5,
        evidence: [
          {
            id: 'e1',
            description: 'Test evidence',
            likelihoodGivenHypothesis: 0.8,
            likelihoodGivenNotHypothesis: 0.2,
          },
        ],
      } as any;

      const thought = factory.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.BAYESIAN);
      expect((thought as any).prior).toBeDefined();
      expect((thought as any).posterior).toBeDefined();
      // Posterior should be calculated automatically
      expect((thought as any).posterior.probability).toBeGreaterThan(0.5);
    });

    it('should delegate GAMETHEORY mode to GameTheoryHandler', () => {
      const input: ThinkingToolInput = {
        thought: 'Testing game theory delegation',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['C', 'D'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['C', 'D'] },
        ],
        strategies: [],
        payoffMatrix: {
          players: ['p1', 'p2'],
          dimensions: [2, 2],
          payoffs: [
            { strategyProfile: ['C', 'C'], payoffs: [3, 3] },
            { strategyProfile: ['C', 'D'], payoffs: [0, 5] },
            { strategyProfile: ['D', 'C'], payoffs: [5, 0] },
            { strategyProfile: ['D', 'D'], payoffs: [1, 1] },
          ],
        },
      } as any;

      const thought = factory.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.GAMETHEORY);
      expect((thought as any).players).toHaveLength(2);
      expect((thought as any).payoffMatrix).toBeDefined();
      // Nash equilibria should be calculated automatically
      expect((thought as any).nashEquilibria).toBeDefined();
    });
  });

  describe('Fallback to Legacy Factory', () => {
    it('should fall back to legacy factory for non-migrated modes', () => {
      const input: ThinkingToolInput = {
        thought: 'Testing sequential mode fallback',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      };

      const thought = factory.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(thought.content).toBe('Testing sequential mode fallback');
    });

    it('should fall back for HYBRID mode', () => {
      const input: ThinkingToolInput = {
        thought: 'Testing hybrid mode fallback',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const thought = factory.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should fall back for MATHEMATICS mode', () => {
      const input: ThinkingToolInput = {
        thought: 'Testing mathematics mode fallback',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
      };

      const thought = factory.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
    });
  });

  describe('Mode Status Reporting', () => {
    it('should report correct status for specialized modes', () => {
      const causalStatus = factory.getModeStatus(ThinkingMode.CAUSAL);

      expect(causalStatus.mode).toBe(ThinkingMode.CAUSAL);
      expect(causalStatus.hasSpecializedHandler).toBe(true);
    });

    it('should report correct status for non-specialized modes', () => {
      const sequentialStatus = factory.getModeStatus(ThinkingMode.SEQUENTIAL);

      expect(sequentialStatus.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(sequentialStatus.hasSpecializedHandler).toBe(false);
      expect(sequentialStatus.isFullyImplemented).toBe(true); // Sequential is fully implemented
    });

    it('should include note for experimental modes', () => {
      const counterfactualStatus = factory.getModeStatus(ThinkingMode.COUNTERFACTUAL);

      expect(counterfactualStatus.isFullyImplemented).toBe(false);
      expect(counterfactualStatus.note).toBeDefined();
      expect(counterfactualStatus.note).toContain('experimental');
    });
  });

  describe('Validation Delegation', () => {
    it('should validate through CausalHandler for causal mode', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        causalGraph: {
          nodes: [
            { id: 'A', name: 'Node', type: 'cause', description: 'Test' },
          ],
          edges: [
            { from: 'A', to: 'B', strength: 0.8, confidence: 0.9 }, // B doesn't exist
          ],
        },
      } as any;

      const result = factory.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_EDGE_TARGET')).toBe(true);
    });

    it('should validate through BayesianHandler for Bayesian mode', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: 1.5, // Invalid
      } as any;

      const result = factory.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'PROBABILITY_OUT_OF_RANGE')).toBe(true);
    });

    it('should validate through GameTheoryHandler for game theory mode', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['nonexistent'] },
        ],
        strategies: [
          { id: 's1', playerId: 'p1', name: 'Strategy 1', description: 'Test', isPure: true },
        ],
      } as any;

      const result = factory.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_STRATEGY_REFERENCE')).toBe(true);
    });
  });

  describe('useRegistryForAll Mode', () => {
    it('should use generic handler from registry when useRegistryForAll is true', () => {
      ModeHandlerRegistry.resetInstance();
      const factoryWithRegistryForAll = new RefactoredThoughtFactory({
        autoRegisterHandlers: true,
        useRegistryForAll: true,
      });

      const input: ThinkingToolInput = {
        thought: 'Testing registry for all',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential', // No specialized handler
      };

      const thought = factoryWithRegistryForAll.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.SEQUENTIAL);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent thought creation across different modes', async () => {
      const inputs = [
        {
          thought: 'Causal thought',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'causal',
        },
        {
          thought: 'Bayesian thought',
          thoughtNumber: 2,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'bayesian',
        },
        {
          thought: 'Game theory thought',
          thoughtNumber: 3,
          totalThoughts: 3,
          nextThoughtNeeded: false,
          mode: 'gametheory',
        },
      ] as ThinkingToolInput[];

      const thoughts = await Promise.all(
        inputs.map((input, i) =>
          Promise.resolve(factory.createThought(input, `session-${i}`))
        )
      );

      expect(thoughts).toHaveLength(3);
      expect(thoughts[0].mode).toBe(ThinkingMode.CAUSAL);
      expect(thoughts[1].mode).toBe(ThinkingMode.BAYESIAN);
      expect(thoughts[2].mode).toBe(ThinkingMode.GAMETHEORY);
    });
  });

  describe('Handler Integration', () => {
    it('should preserve all specialized handler features in created thoughts', () => {
      // Create a complex Bayesian thought
      const input: ThinkingToolInput = {
        thought: 'Complex Bayesian analysis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: 0.3,
        evidence: [
          {
            id: 'e1',
            description: 'Strong evidence',
            likelihoodGivenHypothesis: 0.95,
            likelihoodGivenNotHypothesis: 0.05,
          },
        ],
      } as any;

      const thought = factory.createThought(input, 'session-1') as any;

      // Verify all handler features are present
      expect(thought.prior.probability).toBe(0.3);
      expect(thought.evidence).toHaveLength(1);
      expect(thought.posterior.probability).toBeGreaterThan(thought.prior.probability);
      expect(thought.bayesFactor).toBeCloseTo(19, 0); // 0.95/0.05
    });

    it('should correctly handle cycle detection in causal graphs', () => {
      const input: ThinkingToolInput = {
        thought: 'Cycle test',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        causalGraph: {
          nodes: [
            { id: 'A', name: 'A', type: 'cause', description: 'Node A' },
            { id: 'B', name: 'B', type: 'effect', description: 'Node B' },
            { id: 'C', name: 'C', type: 'mediator', description: 'Node C' },
          ],
          edges: [
            { from: 'A', to: 'B', strength: 0.5, confidence: 0.8 },
            { from: 'B', to: 'C', strength: 0.5, confidence: 0.8 },
            { from: 'C', to: 'A', strength: 0.5, confidence: 0.8 }, // Creates cycle
          ],
        },
      } as any;

      const result = factory.validate(input);

      // Cycles should be warned, not errors
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('cycle'))).toBe(true);
    });

    it('should find Nash equilibria in game theory thoughts', () => {
      const input: ThinkingToolInput = {
        thought: 'Nash equilibrium test',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['C', 'D'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['C', 'D'] },
        ],
        strategies: [],
        payoffMatrix: {
          players: ['p1', 'p2'],
          dimensions: [2, 2],
          payoffs: [
            { strategyProfile: ['C', 'C'], payoffs: [3, 3] },
            { strategyProfile: ['C', 'D'], payoffs: [0, 5] },
            { strategyProfile: ['D', 'C'], payoffs: [5, 0] },
            { strategyProfile: ['D', 'D'], payoffs: [1, 1] },
          ],
        },
      } as any;

      const thought = factory.createThought(input, 'session-1') as any;

      // Prisoner's Dilemma: (D,D) is the unique Nash equilibrium
      expect(thought.nashEquilibria).toBeDefined();
      expect(thought.nashEquilibria.length).toBeGreaterThan(0);

      const nash = thought.nashEquilibria[0];
      expect(nash.strategyProfile).toEqual(['D', 'D']);
      expect(nash.type).toBe('pure');
    });
  });
});
