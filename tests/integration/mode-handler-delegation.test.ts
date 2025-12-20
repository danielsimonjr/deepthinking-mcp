/**
 * Mode Handler Delegation Integration Tests - Phase 15 (v8.4.0)
 *
 * Comprehensive tests for all 33 modes that verify:
 * - ThoughtFactory correctly delegates to specialized handlers
 * - All modes have specialized handlers registered
 * - Registry properly tracks handler registrations
 * - Integration between handlers and thought creation
 * - Mode-specific features are properly preserved
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../src/modes/registry.js';
import { ThinkingMode } from '../../src/types/core.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';

describe('Mode Handler Delegation', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    // Reset registry before each test
    ModeHandlerRegistry.resetInstance();
    // Create factory with auto-registration
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  describe('Specialized Handler Registration', () => {
    it('should auto-register all 33 specialized handlers on construction', () => {
      const stats = factory.getStats();

      // Phase 10 Sprint 3 v8.4.0: All 33 modes + GenericModeHandler fallback = 34 handlers
      expect(stats.specializedHandlers).toBeGreaterThanOrEqual(33);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.CAUSAL);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.BAYESIAN);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.GAMETHEORY);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.COUNTERFACTUAL);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.SYNTHESIS);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.SYSTEMSTHINKING);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.CRITIQUE);
      // Also verify some of the newly added handlers
      expect(stats.modesWithHandlers).toContain(ThinkingMode.SEQUENTIAL);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.HYBRID);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.RECURSIVE);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.MODAL);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.CUSTOM);
    });

    it('should report specialized handler status correctly for all modes', () => {
      // Phase 10 Sprint 3 v8.4.0: All modes now have specialized handlers
      expect(factory.hasSpecializedHandler(ThinkingMode.CAUSAL)).toBe(true);
      expect(factory.hasSpecializedHandler(ThinkingMode.BAYESIAN)).toBe(true);
      expect(factory.hasSpecializedHandler(ThinkingMode.GAMETHEORY)).toBe(true);
      expect(factory.hasSpecializedHandler(ThinkingMode.COUNTERFACTUAL)).toBe(true);
      expect(factory.hasSpecializedHandler(ThinkingMode.SYNTHESIS)).toBe(true);
      expect(factory.hasSpecializedHandler(ThinkingMode.SYSTEMSTHINKING)).toBe(true);
      expect(factory.hasSpecializedHandler(ThinkingMode.CRITIQUE)).toBe(true);
      expect(factory.hasSpecializedHandler(ThinkingMode.SEQUENTIAL)).toBe(true);
      expect(factory.hasSpecializedHandler(ThinkingMode.HYBRID)).toBe(true);
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

    it('should report correct status for all modes (all have specialized handlers now)', () => {
      // Phase 10 Sprint 3 v8.4.0: Sequential now has a specialized handler
      const sequentialStatus = factory.getModeStatus(ThinkingMode.SEQUENTIAL);

      expect(sequentialStatus.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(sequentialStatus.hasSpecializedHandler).toBe(true);
      expect(sequentialStatus.isFullyImplemented).toBe(true);
    });

    it('should report fully implemented status for modes with handlers', () => {
      const counterfactualStatus = factory.getModeStatus(ThinkingMode.COUNTERFACTUAL);

      expect(counterfactualStatus.isFullyImplemented).toBe(true);
      expect(counterfactualStatus.hasSpecializedHandler).toBe(true);
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
      const factoryWithRegistryForAll = new ThoughtFactory({
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

  describe('All 33 Modes Delegation', () => {
    const allModes = [
      // Core modes
      'sequential',
      'shannon',
      'hybrid',
      // Fundamental modes
      'inductive',
      'deductive',
      'abductive',
      // Math/Physics modes
      'mathematics',
      'physics',
      'computability',
      // Analytical modes
      'analogical',
      'firstprinciples',
      'metareasoning',
      'cryptanalytic',
      // Scientific modes
      'scientificmethod',
      'formallogic',
      'temporal',
      // Strategic modes
      'causal',
      'bayesian',
      'counterfactual',
      'gametheory',
      // Systems modes
      'systemsthinking',
      'optimization',
      // Evidential modes
      'evidential',
      // Engineering modes
      'engineering',
      'algorithmic',
      // Academic modes
      'synthesis',
      'argumentation',
      'critique',
      'analysis',
      // Advanced modes
      'recursive',
      'modal',
      'stochastic',
      'constraint',
      // Custom mode
      'custom',
    ];

    it('should have specialized handlers for all 33 modes', () => {
      const stats = factory.getStats();
      // 33 specialized handlers + GenericModeHandler fallback = 34
      expect(stats.specializedHandlers).toBeGreaterThanOrEqual(33);

      for (const mode of allModes) {
        const modeEnum = mode.toUpperCase() as keyof typeof ThinkingMode;
        if (ThinkingMode[modeEnum]) {
          expect(
            factory.hasSpecializedHandler(ThinkingMode[modeEnum]),
            `Mode ${mode} should have specialized handler`
          ).toBe(true);
        }
      }
    });

    describe('Core modes delegation', () => {
      it('should delegate SEQUENTIAL mode', () => {
        const input: ThinkingToolInput = {
          thought: 'Sequential step',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'sequential',
        };

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.SEQUENTIAL);
      });

      it('should delegate SHANNON mode with stages', () => {
        const input = {
          thought: 'Shannon methodology',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'shannon',
          stage: 'problem_definition',
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.SHANNON);
        expect((thought as any).stage).toBe('problem_definition');
      });

      it('should delegate HYBRID mode with active modes', () => {
        const input = {
          thought: 'Hybrid analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'hybrid',
          activeModes: ['inductive', 'deductive'],
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.HYBRID);
        expect((thought as any).activeModes).toBeDefined();
      });
    });

    describe('Fundamental modes delegation', () => {
      it('should delegate INDUCTIVE mode with observations', () => {
        const input = {
          thought: 'Inductive reasoning',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'inductive',
          observations: ['Observation 1', 'Observation 2'],
          sampleSize: 100,
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.INDUCTIVE);
        expect((thought as any).observations).toHaveLength(2);
      });

      it('should delegate DEDUCTIVE mode with premises', () => {
        const input = {
          thought: 'Deductive reasoning',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'deductive',
          premises: ['All men are mortal', 'Socrates is a man'],
          conclusion: 'Socrates is mortal',
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.DEDUCTIVE);
        expect((thought as any).premises).toHaveLength(2);
      });

      it('should delegate ABDUCTIVE mode with hypotheses', () => {
        const input = {
          thought: 'Abductive reasoning',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'abductive',
          hypotheses: [
            { id: 'h1', explanation: 'Hypothesis 1' },
            { id: 'h2', explanation: 'Hypothesis 2' },
          ],
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.ABDUCTIVE);
        expect((thought as any).hypotheses).toHaveLength(2);
      });
    });

    describe('Math/Physics modes delegation', () => {
      it('should delegate MATHEMATICS mode with proof strategy', () => {
        const input = {
          thought: 'Mathematical proof',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'mathematics',
          proofStrategy: {
            type: 'direct',
            steps: ['Step 1', 'Step 2'],
          },
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
        expect((thought as any).proofStrategy).toBeDefined();
      });

      it('should delegate PHYSICS mode with tensor properties', () => {
        const input = {
          thought: 'Physics analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'physics',
          tensorProperties: {
            rank: [1, 0],
            components: 'v^i',
            latex: 'v^i',
            transformation: 'contravariant',
          },
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.PHYSICS);
        expect((thought as any).tensorProperties).toBeDefined();
      });

      it('should delegate COMPUTABILITY mode with Turing machine', () => {
        const input = {
          thought: 'Computability analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'computability',
          turingMachine: {
            states: ['q0', 'q1', 'qf'],
            alphabet: ['0', '1', '_'],
            transitions: [],
            initialState: 'q0',
            acceptStates: ['qf'],
          },
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.COMPUTABILITY);
        // The handler processes the Turing machine - verify mode is correct
        expect(thought.content).toBe('Computability analysis');
      });
    });

    describe('Analytical modes delegation', () => {
      it('should delegate ANALOGICAL mode with mappings', () => {
        const input = {
          thought: 'Analogical reasoning',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'analogical',
          sourceAnalogy: { domain: 'Source', elements: ['a', 'b'] },
          targetAnalogy: { domain: 'Target', elements: ['x', 'y'] },
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.ANALOGICAL);
        expect((thought as any).sourceDomain).toBeDefined();
      });

      it('should delegate FIRSTPRINCIPLES mode', () => {
        const input = {
          thought: 'First principles analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'firstprinciples',
          fundamentals: ['Axiom 1', 'Axiom 2'],
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.FIRSTPRINCIPLES);
      });

      it('should delegate METAREASONING mode', () => {
        const input = {
          thought: 'Meta-level reasoning',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'metareasoning',
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.METAREASONING);
      });

      it('should delegate CRYPTANALYTIC mode with decibans', () => {
        const input = {
          thought: 'Cryptanalytic analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'cryptanalytic',
          hypotheses: [
            { id: 'h1', description: 'Hypothesis 1', priorOdds: 1 },
          ],
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.CRYPTANALYTIC);
      });
    });

    describe('Scientific modes delegation', () => {
      it('should delegate SCIENTIFICMETHOD mode', () => {
        const input = {
          thought: 'Scientific method',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'scientificmethod',
          hypothesis: 'Test hypothesis',
          predictions: ['Prediction 1'],
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.SCIENTIFICMETHOD);
      });

      it('should delegate FORMALLOGIC mode', () => {
        const input = {
          thought: 'Formal logic',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'formallogic',
          premises: ['P1', 'P2'],
          inference: 'modus_ponens',
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.FORMALLOGIC);
      });

      it('should delegate TEMPORAL mode with timeline', () => {
        const input = {
          thought: 'Temporal analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'temporal',
          timeline: {
            id: 't1',
            name: 'Main Timeline',
            timeUnit: 'days',
            events: ['e1'],
          },
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.TEMPORAL);
        expect((thought as any).timeline).toBeDefined();
      });
    });

    describe('Systems and strategic modes delegation', () => {
      it('should delegate SYSTEMSTHINKING mode', () => {
        const input = {
          thought: 'Systems analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'systemsthinking',
          systemComponents: [
            { id: 'c1', name: 'Component 1' },
          ],
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.SYSTEMSTHINKING);
      });

      it('should delegate OPTIMIZATION mode', () => {
        const input = {
          thought: 'Optimization problem',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'optimization',
          objectiveFunction: 'maximize profit',
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.OPTIMIZATION);
      });

      it('should delegate COUNTERFACTUAL mode', () => {
        const input = {
          thought: 'Counterfactual analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'counterfactual',
          counterfactual: {
            actual: 'What happened',
            hypothetical: 'What if',
            consequence: 'Result',
          },
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.COUNTERFACTUAL);
        // Verify counterfactual mode is properly delegated
        expect(thought.content).toBe('Counterfactual analysis');
      });
    });

    describe('Engineering modes delegation', () => {
      it('should delegate ENGINEERING mode with requirements', () => {
        const input = {
          thought: 'Engineering analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'engineering',
          requirementId: 'REQ-001',
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      });

      it('should delegate ALGORITHMIC mode', () => {
        const input = {
          thought: 'Algorithm analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
          algorithmName: 'quicksort',
          designPattern: 'divide-and-conquer',
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      });
    });

    describe('Academic modes delegation', () => {
      it('should delegate SYNTHESIS mode with sources', () => {
        const input = {
          thought: 'Literature synthesis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'synthesis',
          sources: [
            { id: 's1', citation: 'Author (2020)', keyFindings: ['Finding 1'] },
          ],
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      });

      it('should delegate ARGUMENTATION mode with Toulmin model', () => {
        const input = {
          thought: 'Argumentation',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'argumentation',
          claim: 'Main claim',
          data: ['Evidence 1'],
          warrant: 'Reasoning',
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      });

      it('should delegate CRITIQUE mode', () => {
        const input = {
          thought: 'Critical analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'critique',
          strengths: ['Strength 1'],
          weaknesses: ['Weakness 1'],
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      });

      it('should delegate ANALYSIS mode', () => {
        const input = {
          thought: 'Qualitative analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'analysis',
          analysisMethod: 'thematic',
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      });
    });

    describe('Advanced modes delegation', () => {
      it('should delegate RECURSIVE mode', () => {
        const input = {
          thought: 'Recursive problem decomposition',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'recursive',
          recursionDepth: 3,
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.RECURSIVE);
      });

      it('should delegate MODAL mode with possible worlds', () => {
        const input = {
          thought: 'Modal logic analysis',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'modal',
          logicSystem: 'S5',
          domain: 'epistemic',
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.MODAL);
      });

      it('should delegate STOCHASTIC mode with Markov chain', () => {
        const input = {
          thought: 'Stochastic process',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'stochastic',
          processType: 'discrete_time',
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.STOCHASTIC);
      });

      it('should delegate CONSTRAINT mode', () => {
        const input = {
          thought: 'Constraint satisfaction',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'constraint',
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.CONSTRAINT);
      });

      it('should delegate EVIDENTIAL mode with Dempster-Shafer', () => {
        const input = {
          thought: 'Evidential reasoning',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'evidential',
          frameOfDiscernment: ['H1', 'H2'],
          massFunction: { H1: 0.6, H2: 0.3, 'H1,H2': 0.1 },
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.EVIDENTIAL);
      });
    });

    describe('Custom mode delegation', () => {
      it('should delegate CUSTOM mode', () => {
        const input = {
          thought: 'Custom reasoning',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'custom',
          customModeName: 'My Custom Mode',
          customFields: [
            { name: 'field1', type: 'string', value: 'test' },
          ],
        } as any;

        const thought = factory.createThought(input, 'session-1');

        expect(thought.mode).toBe(ThinkingMode.CUSTOM);
        expect((thought as any).customModeName).toBe('My Custom Mode');
      });
    });
  });

  describe('Validation for All Modes', () => {
    const modeValidationTests = [
      { mode: 'sequential', validInput: { thought: 'Valid' } },
      { mode: 'shannon', validInput: { thought: 'Valid', stage: 'problem_definition' } },
      { mode: 'hybrid', validInput: { thought: 'Valid' } },
      { mode: 'inductive', validInput: { thought: 'Valid' } },
      { mode: 'deductive', validInput: { thought: 'Valid' } },
      { mode: 'abductive', validInput: { thought: 'Valid' } },
      { mode: 'mathematics', validInput: { thought: 'Valid' } },
      { mode: 'physics', validInput: { thought: 'Valid' } },
      { mode: 'computability', validInput: { thought: 'Valid' } },
      { mode: 'analogical', validInput: { thought: 'Valid' } },
      { mode: 'firstprinciples', validInput: { thought: 'Valid' } },
      { mode: 'metareasoning', validInput: { thought: 'Valid' } },
      { mode: 'cryptanalytic', validInput: { thought: 'Valid' } },
      { mode: 'scientificmethod', validInput: { thought: 'Valid' } },
      { mode: 'formallogic', validInput: { thought: 'Valid' } },
      { mode: 'temporal', validInput: { thought: 'Valid' } },
      { mode: 'causal', validInput: { thought: 'Valid' } },
      { mode: 'bayesian', validInput: { thought: 'Valid' } },
      { mode: 'counterfactual', validInput: { thought: 'Valid' } },
      { mode: 'gametheory', validInput: { thought: 'Valid' } },
      { mode: 'systemsthinking', validInput: { thought: 'Valid' } },
      { mode: 'optimization', validInput: { thought: 'Valid' } },
      { mode: 'evidential', validInput: { thought: 'Valid' } },
      { mode: 'engineering', validInput: { thought: 'Valid' } },
      { mode: 'algorithmic', validInput: { thought: 'Valid' } },
      { mode: 'synthesis', validInput: { thought: 'Valid' } },
      { mode: 'argumentation', validInput: { thought: 'Valid' } },
      { mode: 'critique', validInput: { thought: 'Valid' } },
      { mode: 'analysis', validInput: { thought: 'Valid' } },
      { mode: 'recursive', validInput: { thought: 'Valid' } },
      { mode: 'modal', validInput: { thought: 'Valid' } },
      { mode: 'stochastic', validInput: { thought: 'Valid' } },
      { mode: 'constraint', validInput: { thought: 'Valid' } },
      { mode: 'custom', validInput: { thought: 'Valid' } },
    ];

    it.each(modeValidationTests)(
      'should validate $mode mode with valid input',
      ({ mode, validInput }) => {
        const input: ThinkingToolInput = {
          ...validInput,
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode,
        } as any;

        const result = factory.validate(input);

        expect(result.valid).toBe(true);
      }
    );

    it.each(modeValidationTests)(
      'should reject $mode mode with empty thought',
      ({ mode }) => {
        const input: ThinkingToolInput = {
          thought: '',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode,
        } as any;

        const result = factory.validate(input);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'EMPTY_THOUGHT')).toBe(true);
      }
    );
  });

  describe('Performance: All Modes Thought Creation', () => {
    it('should create thoughts for all 33 modes in under 100ms total', () => {
      const modes = [
        'sequential', 'shannon', 'hybrid', 'inductive', 'deductive', 'abductive',
        'mathematics', 'physics', 'computability', 'analogical', 'firstprinciples',
        'metareasoning', 'cryptanalytic', 'scientificmethod', 'formallogic', 'temporal',
        'causal', 'bayesian', 'counterfactual', 'gametheory', 'systemsthinking',
        'optimization', 'evidential', 'engineering', 'algorithmic', 'synthesis',
        'argumentation', 'critique', 'analysis', 'recursive', 'modal', 'stochastic',
        'constraint', 'custom',
      ];

      const start = performance.now();

      for (const mode of modes) {
        const input: ThinkingToolInput = {
          thought: `Testing ${mode} performance`,
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode,
        } as any;

        factory.createThought(input, `perf-session-${mode}`);
      }

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });
});
