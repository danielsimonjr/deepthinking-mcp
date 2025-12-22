/**
 * Counterfactual Mode Integration Tests
 *
 * Tests T-CSL-021 through T-CSL-030: Comprehensive integration tests
 * for the deepthinking_causal tool with counterfactual mode.
 *
 * Phase 11 Sprint 5: Causal & Strategic Modes Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type CounterfactualThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import { assertValidProbability } from '../../utils/assertion-helpers.js';

// ============================================================================
// COUNTERFACTUAL MODE MOCK DATA
// ============================================================================

const SAMPLE_CONDITIONS = {
  actual: [
    { factor: 'Decision', value: 'Chose path A' },
    { factor: 'Resources', value: 'Limited budget' },
    { factor: 'Time', value: 'Tight deadline' },
  ],
  counterfactual: [
    { factor: 'Decision', value: 'Chose path B', isIntervention: true },
    { factor: 'Resources', value: 'Limited budget' },
    { factor: 'Time', value: 'Tight deadline' },
  ],
};

const SAMPLE_OUTCOMES = {
  actual: [
    { description: 'Project completed on time', impact: 'positive' as const, magnitude: 0.7 },
    { description: 'Budget overrun by 10%', impact: 'negative' as const, magnitude: 0.3 },
  ],
  counterfactual: [
    { description: 'Project delayed by 2 weeks', impact: 'negative' as const, magnitude: 0.5 },
    { description: 'Budget savings of 15%', impact: 'positive' as const, magnitude: 0.4 },
  ],
};

const SAMPLE_SCENARIO_ACTUAL = {
  id: 'actual-1',
  name: 'Actual Outcome',
  description: 'What actually happened in the project',
  conditions: SAMPLE_CONDITIONS.actual,
  outcomes: SAMPLE_OUTCOMES.actual,
  likelihood: 1.0,
};

const SAMPLE_SCENARIO_CF1 = {
  id: 'cf-1',
  name: 'Alternative 1',
  description: 'What if we had chosen path B',
  conditions: SAMPLE_CONDITIONS.counterfactual,
  outcomes: SAMPLE_OUTCOMES.counterfactual,
  likelihood: 0.6,
};

const SAMPLE_SCENARIO_CF2 = {
  id: 'cf-2',
  name: 'Alternative 2',
  description: 'What if we had more resources',
  conditions: [
    { factor: 'Decision', value: 'Chose path A' },
    { factor: 'Resources', value: 'Adequate budget', isIntervention: true },
    { factor: 'Time', value: 'Tight deadline' },
  ],
  outcomes: [
    { description: 'Project completed early', impact: 'positive' as const, magnitude: 0.8 },
    { description: 'Higher quality output', impact: 'positive' as const, magnitude: 0.6 },
  ],
  likelihood: 0.4,
};

const SAMPLE_COMPARISON = {
  differences: [
    { aspect: 'Timeline', actual: 'On time', counterfactual: 'Delayed 2 weeks' },
    { aspect: 'Budget', actual: '10% overrun', counterfactual: '15% savings' },
  ],
  insights: [
    'Path A prioritizes time over cost',
    'Path B prioritizes cost over time',
  ],
  lessons: [
    'Consider stakeholder priorities when choosing approach',
    'Build buffer for unexpected costs in Path A',
  ],
};

const SAMPLE_INTERVENTION_POINT = {
  description: 'Decision point between paths A and B',
  timing: 'Week 1 of project',
  feasibility: 0.9,
  expectedImpact: 0.7,
};

const SAMPLE_CAUSAL_CHAINS = [
  {
    id: 'chain-1',
    events: ['Decision made', 'Resources allocated', 'Work began', 'Completion'],
    branchingPoint: 'Decision made',
    divergence: 'Choice of approach',
  },
];

// ============================================================================
// COUNTERFACTUAL THOUGHT FACTORIES
// ============================================================================

function createBaseCounterfactualInput(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: 'Analyzing counterfactual scenario',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'counterfactual',
    actual: SAMPLE_SCENARIO_ACTUAL,
    counterfactuals: [SAMPLE_SCENARIO_CF1],
    comparison: SAMPLE_COMPARISON,
    interventionPoint: SAMPLE_INTERVENTION_POINT,
    ...overrides,
  } as ThinkingToolInput;
}

// ============================================================================
// TESTS
// ============================================================================

describe('Counterfactual Mode Integration Tests', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-CSL-021: Basic counterfactual thought
   */
  describe('T-CSL-021: Basic Counterfactual Thought', () => {
    it('should create a basic counterfactual thought with minimal params', () => {
      const input = createBaseCounterfactualInput({
        thought: 'Exploring what-if scenario',
      });

      const thought = factory.createThought(input, 'session-cf-021');

      expect(thought.mode).toBe(ThinkingMode.COUNTERFACTUAL);
      expect(thought.content).toBe('Exploring what-if scenario');
      expect(thought.sessionId).toBe('session-cf-021');
    });

    it('should assign unique IDs to counterfactual thoughts', () => {
      const input1 = createBaseCounterfactualInput({ thought: 'First counterfactual' });
      const input2 = createBaseCounterfactualInput({ thought: 'Second counterfactual' });

      const thought1 = factory.createThought(input1, 'session-cf-021');
      const thought2 = factory.createThought(input2, 'session-cf-021');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-CSL-022: Counterfactual with counterfactual.actual
   */
  describe('T-CSL-022: Counterfactual with Actual Scenario', () => {
    it('should include actual scenario in thought', () => {
      const input = createBaseCounterfactualInput();

      const thought = factory.createThought(input, 'session-cf-022') as CounterfactualThought;

      expect(thought.actual).toBeDefined();
      expect(thought.actual.id).toBe('actual-1');
      expect(thought.actual.name).toBe('Actual Outcome');
    });

    it('should preserve actual scenario conditions', () => {
      const input = createBaseCounterfactualInput();

      const thought = factory.createThought(input, 'session-cf-022') as CounterfactualThought;

      expect(thought.actual.conditions).toHaveLength(3);
      expect(thought.actual.conditions[0].factor).toBe('Decision');
      expect(thought.actual.conditions[0].value).toBe('Chose path A');
    });

    it('should preserve actual scenario outcomes', () => {
      const input = createBaseCounterfactualInput();

      const thought = factory.createThought(input, 'session-cf-022') as CounterfactualThought;

      expect(thought.actual.outcomes).toHaveLength(2);
      expect(thought.actual.outcomes[0].impact).toBe('positive');
    });
  });

  /**
   * T-CSL-023: Counterfactual with counterfactual.hypothetical
   */
  describe('T-CSL-023: Counterfactual with Hypothetical Scenarios', () => {
    it('should include hypothetical counterfactual scenarios', () => {
      const input = createBaseCounterfactualInput();

      const thought = factory.createThought(input, 'session-cf-023') as CounterfactualThought;

      expect(thought.counterfactuals).toBeDefined();
      expect(thought.counterfactuals).toHaveLength(1);
      expect(thought.counterfactuals[0].id).toBe('cf-1');
    });

    it('should preserve hypothetical scenario likelihood', () => {
      const input = createBaseCounterfactualInput();

      const thought = factory.createThought(input, 'session-cf-023') as CounterfactualThought;

      expect(thought.counterfactuals[0].likelihood).toBe(0.6);
      assertValidProbability(thought.counterfactuals[0].likelihood!);
    });
  });

  /**
   * T-CSL-024: Counterfactual with counterfactual.consequence
   */
  describe('T-CSL-024: Counterfactual with Consequences', () => {
    it('should include counterfactual outcomes (consequences)', () => {
      const input = createBaseCounterfactualInput();

      const thought = factory.createThought(input, 'session-cf-024') as CounterfactualThought;

      const cfOutcomes = thought.counterfactuals[0].outcomes;
      expect(cfOutcomes).toHaveLength(2);
      expect(cfOutcomes[0].description).toBe('Project delayed by 2 weeks');
      expect(cfOutcomes[0].impact).toBe('negative');
    });

    it('should capture outcome magnitudes', () => {
      const input = createBaseCounterfactualInput();

      const thought = factory.createThought(input, 'session-cf-024') as CounterfactualThought;

      const cfOutcomes = thought.counterfactuals[0].outcomes;
      expect(cfOutcomes[0].magnitude).toBe(0.5);
      expect(cfOutcomes[1].magnitude).toBe(0.4);
    });
  });

  /**
   * T-CSL-025: Counterfactual world state tracking
   */
  describe('T-CSL-025: Counterfactual World State Tracking', () => {
    it('should track conditions across actual and counterfactual worlds', () => {
      const input = createBaseCounterfactualInput();

      const thought = factory.createThought(input, 'session-cf-025') as CounterfactualThought;

      // Actual world state
      const actualDecision = thought.actual.conditions.find(c => c.factor === 'Decision');
      expect(actualDecision?.value).toBe('Chose path A');

      // Counterfactual world state
      const cfDecision = thought.counterfactuals[0].conditions.find(c => c.factor === 'Decision');
      expect(cfDecision?.value).toBe('Chose path B');
    });

    it('should identify intervention points in conditions', () => {
      const input = createBaseCounterfactualInput();

      const thought = factory.createThought(input, 'session-cf-025') as CounterfactualThought;

      const interventionCondition = thought.counterfactuals[0].conditions.find(
        c => (c as any).isIntervention === true
      );
      expect(interventionCondition).toBeDefined();
      expect(interventionCondition?.factor).toBe('Decision');
    });
  });

  /**
   * T-CSL-026: Counterfactual multiple alternatives
   */
  describe('T-CSL-026: Counterfactual Multiple Alternatives', () => {
    it('should handle multiple counterfactual scenarios', () => {
      const input = createBaseCounterfactualInput({
        counterfactuals: [SAMPLE_SCENARIO_CF1, SAMPLE_SCENARIO_CF2],
      });

      const thought = factory.createThought(input, 'session-cf-026') as CounterfactualThought;

      expect(thought.counterfactuals).toHaveLength(2);
      expect(thought.counterfactuals[0].id).toBe('cf-1');
      expect(thought.counterfactuals[1].id).toBe('cf-2');
    });

    it('should preserve distinct outcomes for each alternative', () => {
      const input = createBaseCounterfactualInput({
        counterfactuals: [SAMPLE_SCENARIO_CF1, SAMPLE_SCENARIO_CF2],
      });

      const thought = factory.createThought(input, 'session-cf-026') as CounterfactualThought;

      // First alternative: negative outcome
      expect(thought.counterfactuals[0].outcomes[0].impact).toBe('negative');

      // Second alternative: positive outcome
      expect(thought.counterfactuals[1].outcomes[0].impact).toBe('positive');
    });
  });

  /**
   * T-CSL-027: Counterfactual consequence analysis
   */
  describe('T-CSL-027: Counterfactual Consequence Analysis', () => {
    it('should include comparison analysis', () => {
      const input = createBaseCounterfactualInput();

      const thought = factory.createThought(input, 'session-cf-027') as CounterfactualThought;

      expect(thought.comparison).toBeDefined();
      expect(thought.comparison.differences).toHaveLength(2);
      expect(thought.comparison.insights).toHaveLength(2);
      expect(thought.comparison.lessons).toHaveLength(2);
    });

    it('should capture key differences between scenarios', () => {
      const input = createBaseCounterfactualInput();

      const thought = factory.createThought(input, 'session-cf-027') as CounterfactualThought;

      const timelineDiff = thought.comparison.differences.find(d => d.aspect === 'Timeline');
      expect(timelineDiff?.actual).toBe('On time');
      expect(timelineDiff?.counterfactual).toBe('Delayed 2 weeks');
    });
  });

  /**
   * T-CSL-028: Counterfactual with causal graph
   */
  describe('T-CSL-028: Counterfactual with Causal Chain', () => {
    it('should include causal chains in counterfactual analysis', () => {
      const input = createBaseCounterfactualInput({
        causalChains: SAMPLE_CAUSAL_CHAINS,
      });

      const thought = factory.createThought(input, 'session-cf-028') as CounterfactualThought;

      expect(thought.causalChains).toHaveLength(1);
      expect(thought.causalChains![0].branchingPoint).toBe('Decision made');
    });

    it('should capture causal chain events', () => {
      const input = createBaseCounterfactualInput({
        causalChains: SAMPLE_CAUSAL_CHAINS,
      });

      const thought = factory.createThought(input, 'session-cf-028') as CounterfactualThought;

      expect(thought.causalChains![0].events).toHaveLength(4);
      expect(thought.causalChains![0].events).toContain('Decision made');
      expect(thought.causalChains![0].events).toContain('Completion');
    });
  });

  /**
   * T-CSL-029: Counterfactual multi-thought scenario
   */
  describe('T-CSL-029: Counterfactual Multi-Thought Scenario', () => {
    it('should support multi-step counterfactual analysis', () => {
      const sessionId = 'session-cf-029';

      // Step 1: Establish actual scenario
      const step1 = createBaseCounterfactualInput({
        thought: 'Establishing actual scenario',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      });
      const thought1 = factory.createThought(step1, sessionId) as CounterfactualThought;
      expect(thought1.actual).toBeDefined();

      // Step 2: Generate counterfactual alternatives
      const step2 = createBaseCounterfactualInput({
        thought: 'Generating counterfactual alternatives',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        counterfactuals: [SAMPLE_SCENARIO_CF1, SAMPLE_SCENARIO_CF2],
      });
      const thought2 = factory.createThought(step2, sessionId) as CounterfactualThought;
      expect(thought2.counterfactuals).toHaveLength(2);

      // Step 3: Compare and draw conclusions
      const step3 = createBaseCounterfactualInput({
        thought: 'Drawing conclusions from counterfactual analysis',
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
        comparison: {
          differences: SAMPLE_COMPARISON.differences,
          insights: [...SAMPLE_COMPARISON.insights, 'Resource availability is a key factor'],
          lessons: [...SAMPLE_COMPARISON.lessons, 'Always consider multiple alternatives'],
        },
      });
      const thought3 = factory.createThought(step3, sessionId) as CounterfactualThought;
      expect(thought3.comparison.insights).toHaveLength(3);
      expect(thought3.comparison.lessons).toHaveLength(3);
    });
  });

  /**
   * T-CSL-030: Counterfactual branching alternatives
   */
  describe('T-CSL-030: Counterfactual Branching Alternatives', () => {
    it('should capture branching point for counterfactual divergence', () => {
      const input = createBaseCounterfactualInput({
        causalChains: [
          {
            id: 'chain-branch',
            events: ['Initial state', 'Decision point', 'Path A outcome', 'Final state'],
            branchingPoint: 'Decision point',
            divergence: 'Path A vs Path B',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-cf-030') as CounterfactualThought;

      expect(thought.causalChains![0].divergence).toBe('Path A vs Path B');
    });

    it('should include intervention point details', () => {
      const input = createBaseCounterfactualInput();

      const thought = factory.createThought(input, 'session-cf-030') as CounterfactualThought;

      expect(thought.interventionPoint).toBeDefined();
      expect(thought.interventionPoint.description).toContain('Decision point');
      expect(thought.interventionPoint.timing).toBe('Week 1 of project');
      assertValidProbability(thought.interventionPoint.feasibility);
      assertValidProbability(thought.interventionPoint.expectedImpact);
    });

    it('should support thought branching for alternative analysis', () => {
      const sessionId = 'session-cf-030-branch';

      // Main thought
      const mainInput = createBaseCounterfactualInput({
        thought: 'Main counterfactual analysis',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
      });
      const mainThought = factory.createThought(mainInput, sessionId);

      // Branch to explore different alternative
      const branchInput = createBaseCounterfactualInput({
        thought: 'Exploring alternative branching path',
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false,
        branchFrom: mainThought.id,
        branchId: 'branch-alt-1',
        counterfactuals: [SAMPLE_SCENARIO_CF2],
      });
      const branchThought = factory.createThought(branchInput, sessionId) as CounterfactualThought;

      expect(branchThought.mode).toBe(ThinkingMode.COUNTERFACTUAL);
      expect(branchThought.counterfactuals[0].id).toBe('cf-2');
    });
  });
});
