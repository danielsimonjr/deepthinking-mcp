/**
 * Scientific Mode Integration Tests - Systems Thinking
 *
 * Tests T-SCI-011 through T-SCI-028: Comprehensive integration tests
 * for the deepthinking_scientific tool with systemsthinking mode.
 *
 * Phase 11 Sprint 6: Analytical & Scientific Modes
 *
 * Includes tests for all 8 Senge Systems Archetypes:
 * - Fixes that Fail
 * - Shifting the Burden
 * - Limits to Growth
 * - Tragedy of the Commons
 * - Escalation
 * - Success to Successful
 * - Drifting Goals
 * - Growth and Underinvestment
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type SystemsThinkingThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Scientific Mode Integration - Systems Thinking', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * Helper to create basic systems thinking input
   */
  function createSystemsThinkingInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Systems thinking reasoning step',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'systemsthinking',
      ...overrides,
    } as ThinkingToolInput;
  }

  /**
   * T-SCI-011: Basic systemsthinking thought
   */
  describe('T-SCI-011: Basic Systems Thinking Thought', () => {
    it('should create a basic systems thinking thought with minimal params', () => {
      const input = createSystemsThinkingInput({
        thought: 'Analyzing system dynamics',
      });

      const thought = factory.createThought(input, 'session-sys-011');

      expect(thought.mode).toBe(ThinkingMode.SYSTEMSTHINKING);
      expect(thought.content).toBe('Analyzing system dynamics');
      expect(thought.sessionId).toBe('session-sys-011');
    });

    it('should assign unique IDs to systems thinking thoughts', () => {
      const input1 = createSystemsThinkingInput({ thought: 'First analysis' });
      const input2 = createSystemsThinkingInput({ thought: 'Second analysis' });

      const thought1 = factory.createThought(input1, 'session-sys-011');
      const thought2 = factory.createThought(input2, 'session-sys-011');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should include thoughtType for systems thinking mode', () => {
      const input = createSystemsThinkingInput({
        thought: 'Defining system boundary',
        thoughtType: 'system_definition',
      });

      const thought = factory.createThought(input, 'session-sys-011') as SystemsThinkingThought;

      expect(thought.thoughtType).toBe('system_definition');
    });
  });

  /**
   * T-SCI-012: SystemsThinking with systemComponents array
   */
  describe('T-SCI-012: System Components', () => {
    it('should include system components', () => {
      const input = createSystemsThinkingInput({
        thought: 'Identifying system components',
        thoughtType: 'component_analysis',
        components: [
          {
            id: 'stock-population',
            name: 'Population',
            type: 'stock',
            description: 'Total population in the system',
            unit: 'people',
            initialValue: 1000000,
          },
          {
            id: 'flow-births',
            name: 'Birth Rate',
            type: 'flow',
            description: 'Number of births per year',
            unit: 'people/year',
            formula: 'population * birth_rate_fraction',
          },
          {
            id: 'flow-deaths',
            name: 'Death Rate',
            type: 'flow',
            description: 'Number of deaths per year',
            unit: 'people/year',
            formula: 'population * death_rate_fraction',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-012') as SystemsThinkingThought;

      expect(thought.components).toHaveLength(3);
      expect(thought.components![0].type).toBe('stock');
      expect(thought.components![1].type).toBe('flow');
    });
  });

  /**
   * T-SCI-013: SystemsThinking with systemComponents[].role
   */
  describe('T-SCI-013: Component Roles', () => {
    it('should include component types and descriptions', () => {
      const input = createSystemsThinkingInput({
        thought: 'Analyzing component roles',
        components: [
          {
            id: 'var-growth-rate',
            name: 'Growth Rate',
            type: 'variable',
            description: 'Rate of growth influenced by multiple factors',
          },
          {
            id: 'param-carrying-capacity',
            name: 'Carrying Capacity',
            type: 'parameter',
            description: 'Maximum sustainable population',
            unit: 'people',
            initialValue: 10000000,
          },
          {
            id: 'delay-perception',
            name: 'Perception Delay',
            type: 'delay',
            description: 'Time to perceive changes in system state',
            unit: 'months',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-013') as SystemsThinkingThought;

      expect(thought.components!.find(c => c.type === 'variable')).toBeDefined();
      expect(thought.components!.find(c => c.type === 'parameter')).toBeDefined();
      expect(thought.components!.find(c => c.type === 'delay')).toBeDefined();
    });
  });

  /**
   * T-SCI-014: SystemsThinking with interactions array
   */
  describe('T-SCI-014: Interactions', () => {
    it('should define system with influencedBy relationships', () => {
      const input = createSystemsThinkingInput({
        thought: 'Mapping interactions',
        components: [
          {
            id: 'stock-inventory',
            name: 'Inventory',
            type: 'stock',
            description: 'Items in stock',
            influencedBy: ['production', 'sales'],
          },
          {
            id: 'production',
            name: 'Production',
            type: 'flow',
            description: 'Items produced',
            influencedBy: ['desired-production', 'capacity'],
          },
          {
            id: 'sales',
            name: 'Sales',
            type: 'flow',
            description: 'Items sold',
            influencedBy: ['demand', 'inventory'],
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-014') as SystemsThinkingThought;

      expect(thought.components![0].influencedBy).toContain('production');
      expect(thought.components![0].influencedBy).toContain('sales');
    });
  });

  /**
   * T-SCI-015: SystemsThinking with interactions[].type
   */
  describe('T-SCI-015: Interaction Types', () => {
    it('should capture system definition with purpose', () => {
      const input = createSystemsThinkingInput({
        thought: 'Defining system purpose and boundary',
        system: {
          id: 'supply-chain',
          name: 'Supply Chain System',
          description: 'End-to-end supply chain from supplier to customer',
          boundary: 'Includes suppliers, manufacturing, distribution; excludes end consumers',
          purpose: 'Deliver products efficiently while minimizing inventory costs',
          timeHorizon: '5 years',
        },
      });

      const thought = factory.createThought(input, 'session-sys-015') as SystemsThinkingThought;

      expect(thought.system).toBeDefined();
      expect(thought.system!.purpose).toContain('efficiently');
      expect(thought.system!.boundary).toContain('excludes');
    });
  });

  /**
   * T-SCI-016: SystemsThinking with feedbackLoops array
   */
  describe('T-SCI-016: Feedback Loops', () => {
    it('should include feedback loops', () => {
      const input = createSystemsThinkingInput({
        thought: 'Identifying feedback loops',
        thoughtType: 'feedback_identification',
        feedbackLoops: [
          {
            id: 'r1-growth',
            name: 'Population Growth',
            type: 'reinforcing',
            description: 'More people lead to more births',
            components: ['population', 'births'],
            polarity: '+',
            strength: 0.8,
          },
          {
            id: 'b1-crowding',
            name: 'Crowding Effect',
            type: 'balancing',
            description: 'More people lead to resource competition and deaths',
            components: ['population', 'resources', 'deaths'],
            polarity: '-',
            strength: 0.6,
            delay: 12,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-016') as SystemsThinkingThought;

      expect(thought.feedbackLoops).toHaveLength(2);
      expect(thought.feedbackLoops!.find(f => f.type === 'reinforcing')).toBeDefined();
      expect(thought.feedbackLoops!.find(f => f.type === 'balancing')).toBeDefined();
    });
  });

  /**
   * T-SCI-017: SystemsThinking with feedbackLoops[].type = positive
   */
  describe('T-SCI-017: Reinforcing Feedback Loop', () => {
    it('should capture reinforcing (positive) feedback loop', () => {
      const input = createSystemsThinkingInput({
        thought: 'Analyzing reinforcing loop',
        feedbackLoops: [
          {
            id: 'r-viral-growth',
            name: 'Viral Growth',
            type: 'reinforcing',
            description: 'More users attract more users through network effects',
            components: ['users', 'referrals', 'new-users'],
            polarity: '+',
            strength: 0.9,
            dominance: 'early',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-017') as SystemsThinkingThought;

      expect(thought.feedbackLoops![0].type).toBe('reinforcing');
      expect(thought.feedbackLoops![0].polarity).toBe('+');
      expect(thought.feedbackLoops![0].dominance).toBe('early');
    });
  });

  /**
   * T-SCI-018: SystemsThinking with feedbackLoops[].type = negative
   */
  describe('T-SCI-018: Balancing Feedback Loop', () => {
    it('should capture balancing (negative) feedback loop', () => {
      const input = createSystemsThinkingInput({
        thought: 'Analyzing balancing loop',
        feedbackLoops: [
          {
            id: 'b-thermostat',
            name: 'Temperature Control',
            type: 'balancing',
            description: 'Thermostat adjusts heating to maintain target temperature',
            components: ['actual-temp', 'gap', 'heating', 'temp-change'],
            polarity: '-',
            strength: 0.95,
            delay: 5,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-018') as SystemsThinkingThought;

      expect(thought.feedbackLoops![0].type).toBe('balancing');
      expect(thought.feedbackLoops![0].polarity).toBe('-');
    });
  });

  /**
   * T-SCI-019: SystemsThinking with feedbackLoops[].components
   */
  describe('T-SCI-019: Loop Components', () => {
    it('should track ordered components in feedback loop', () => {
      const input = createSystemsThinkingInput({
        thought: 'Mapping loop components',
        feedbackLoops: [
          {
            id: 'b-inventory-control',
            name: 'Inventory Adjustment',
            type: 'balancing',
            description: 'Adjust orders to maintain target inventory',
            components: ['inventory', 'gap', 'desired-orders', 'actual-orders', 'shipments'],
            polarity: '-',
            strength: 0.7,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-019') as SystemsThinkingThought;

      expect(thought.feedbackLoops![0].components).toHaveLength(5);
      expect(thought.feedbackLoops![0].components[0]).toBe('inventory');
    });
  });

  /**
   * T-SCI-020: Fixes that Fail archetype detection
   */
  describe('T-SCI-020: Fixes that Fail Archetype', () => {
    it('should model Fixes that Fail archetype', () => {
      const input = createSystemsThinkingInput({
        thought: 'Analyzing Fixes that Fail pattern',
        system: {
          id: 'software-bugs',
          name: 'Software Bug Fixing',
          description: 'Quick fixes that create more problems',
          boundary: 'Development team and codebase',
          purpose: 'Reduce defects in software',
        },
        feedbackLoops: [
          {
            id: 'b-fix-symptom',
            name: 'Symptom Fix',
            type: 'balancing',
            description: 'Quick fix addresses immediate symptom',
            components: ['problem-symptom', 'quick-fix', 'symptom-reduction'],
            polarity: '-',
            strength: 0.9,
          },
          {
            id: 'r-unintended',
            name: 'Unintended Consequences',
            type: 'reinforcing',
            description: 'Quick fixes create technical debt and more bugs',
            components: ['quick-fix', 'technical-debt', 'new-bugs', 'problem-symptom'],
            polarity: '+',
            strength: 0.6,
            delay: 30,
            dominance: 'late',
          },
        ],
        behaviors: [
          {
            id: 'beh-oscillation',
            name: 'Recurring Problems',
            description: 'Initial improvement followed by worse problems',
            pattern: 'oscillation',
            causes: ['b-fix-symptom', 'r-unintended'],
            timeframe: '3-6 months',
            unintendedConsequences: ['Technical debt accumulation', 'Developer burnout'],
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-020') as SystemsThinkingThought;

      expect(thought.feedbackLoops).toHaveLength(2);
      expect(thought.behaviors![0].pattern).toBe('oscillation');
      expect(thought.behaviors![0].unintendedConsequences).toContain('Technical debt accumulation');
    });
  });

  /**
   * T-SCI-021: Shifting the Burden archetype
   */
  describe('T-SCI-021: Shifting the Burden Archetype', () => {
    it('should model Shifting the Burden archetype', () => {
      const input = createSystemsThinkingInput({
        thought: 'Analyzing Shifting the Burden pattern',
        system: {
          id: 'stress-management',
          name: 'Stress Management System',
          description: 'Coping with work stress through symptomatic vs fundamental solutions',
          boundary: 'Individual work-life balance',
          purpose: 'Maintain health and productivity',
        },
        feedbackLoops: [
          {
            id: 'b-symptomatic',
            name: 'Symptomatic Solution',
            type: 'balancing',
            description: 'Caffeine/overtime temporarily addresses fatigue',
            components: ['stress', 'symptomatic-fix', 'perceived-productivity'],
            polarity: '-',
            strength: 0.85,
          },
          {
            id: 'b-fundamental',
            name: 'Fundamental Solution',
            type: 'balancing',
            description: 'Work-life balance addresses root cause',
            components: ['stress', 'lifestyle-change', 'actual-capacity'],
            polarity: '-',
            strength: 0.5,
            delay: 60,
          },
          {
            id: 'r-side-effect',
            name: 'Side Effect',
            type: 'reinforcing',
            description: 'Symptomatic solution reduces capacity for fundamental solution',
            components: ['symptomatic-fix', 'health-decline', 'capacity-for-change'],
            polarity: '+',
            strength: 0.4,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-021') as SystemsThinkingThought;

      expect(thought.feedbackLoops).toHaveLength(3);
      const fundamentalLoop = thought.feedbackLoops!.find(f => f.id === 'b-fundamental');
      expect(fundamentalLoop!.delay).toBe(60);
    });
  });

  /**
   * T-SCI-022: Limits to Growth archetype
   */
  describe('T-SCI-022: Limits to Growth Archetype', () => {
    it('should model Limits to Growth archetype', () => {
      const input = createSystemsThinkingInput({
        thought: 'Analyzing Limits to Growth pattern',
        system: {
          id: 'startup-growth',
          name: 'Startup Growth',
          description: 'Rapid growth eventually hitting constraints',
          boundary: 'Company operations and market',
          purpose: 'Sustainable business growth',
        },
        feedbackLoops: [
          {
            id: 'r-growth-engine',
            name: 'Growth Engine',
            type: 'reinforcing',
            description: 'Success breeds more success',
            components: ['customers', 'revenue', 'investment', 'product-quality', 'referrals'],
            polarity: '+',
            strength: 0.9,
            dominance: 'early',
          },
          {
            id: 'b-limit',
            name: 'Growth Limit',
            type: 'balancing',
            description: 'Growth slows as constraints bind',
            components: ['customers', 'support-load', 'service-quality', 'churn'],
            polarity: '-',
            strength: 0.7,
            dominance: 'late',
          },
        ],
        leveragePoints: [
          {
            id: 'lp-capacity',
            name: 'Support Capacity',
            location: 'support-load',
            description: 'Invest in support infrastructure before hitting limits',
            effectiveness: 0.8,
            difficulty: 0.5,
            type: 'parameter',
            interventionExamples: ['Hire support staff', 'Build self-service tools'],
          },
        ],
        behaviors: [
          {
            id: 'beh-s-curve',
            name: 'S-Curve Growth',
            description: 'Initial exponential growth plateaus',
            pattern: 'equilibrium',
            causes: ['r-growth-engine', 'b-limit'],
            timeframe: '2-5 years',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-022') as SystemsThinkingThought;

      expect(thought.feedbackLoops!.find(f => f.dominance === 'early')).toBeDefined();
      expect(thought.feedbackLoops!.find(f => f.dominance === 'late')).toBeDefined();
      expect(thought.leveragePoints).toHaveLength(1);
    });
  });

  /**
   * T-SCI-023: Tragedy of the Commons archetype
   */
  describe('T-SCI-023: Tragedy of the Commons Archetype', () => {
    it('should model Tragedy of the Commons archetype', () => {
      const input = createSystemsThinkingInput({
        thought: 'Analyzing Tragedy of the Commons pattern',
        system: {
          id: 'shared-resource',
          name: 'Shared Fishing Ground',
          description: 'Multiple actors depleting common resource',
          boundary: 'Fishing community and ocean ecosystem',
          purpose: 'Sustainable fishing for all',
        },
        components: [
          { id: 'fish-stock', name: 'Fish Stock', type: 'stock', description: 'Total fish population', unit: 'fish' },
          { id: 'catch-a', name: 'Fisher A Catch', type: 'flow', description: 'Fisher A catch rate', unit: 'fish/day' },
          { id: 'catch-b', name: 'Fisher B Catch', type: 'flow', description: 'Fisher B catch rate', unit: 'fish/day' },
        ],
        feedbackLoops: [
          {
            id: 'r-a-gain',
            name: 'Fisher A Gain',
            type: 'reinforcing',
            description: 'Fisher A increases effort to maximize individual gain',
            components: ['fish-stock', 'catch-a', 'income-a', 'investment-a', 'effort-a'],
            polarity: '+',
            strength: 0.7,
          },
          {
            id: 'r-b-gain',
            name: 'Fisher B Gain',
            type: 'reinforcing',
            description: 'Fisher B increases effort to maximize individual gain',
            components: ['fish-stock', 'catch-b', 'income-b', 'investment-b', 'effort-b'],
            polarity: '+',
            strength: 0.7,
          },
          {
            id: 'b-depletion',
            name: 'Resource Depletion',
            type: 'balancing',
            description: 'Total catch depletes fish stock',
            components: ['catch-a', 'catch-b', 'total-catch', 'fish-stock', 'catch-rate'],
            polarity: '-',
            strength: 0.9,
            delay: 24,
          },
        ],
        behaviors: [
          {
            id: 'beh-collapse',
            name: 'Resource Collapse',
            description: 'Overfishing leads to population crash',
            pattern: 'overshoot_collapse',
            causes: ['r-a-gain', 'r-b-gain', 'b-depletion'],
            timeframe: '10-20 years',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-023') as SystemsThinkingThought;

      expect(thought.behaviors![0].pattern).toBe('overshoot_collapse');
    });
  });

  /**
   * T-SCI-024: Escalation archetype
   */
  describe('T-SCI-024: Escalation Archetype', () => {
    it('should model Escalation archetype', () => {
      const input = createSystemsThinkingInput({
        thought: 'Analyzing Escalation pattern',
        system: {
          id: 'price-war',
          name: 'Competitive Price War',
          description: 'Two competitors in price reduction spiral',
          boundary: 'Two main market competitors',
          purpose: 'Market share acquisition',
        },
        feedbackLoops: [
          {
            id: 'r-a-response',
            name: 'Company A Response',
            type: 'reinforcing',
            description: 'A cuts prices in response to B',
            components: ['b-price', 'relative-position', 'a-price-cut', 'a-price'],
            polarity: '+',
            strength: 0.8,
          },
          {
            id: 'r-b-response',
            name: 'Company B Response',
            type: 'reinforcing',
            description: 'B cuts prices in response to A',
            components: ['a-price', 'relative-position', 'b-price-cut', 'b-price'],
            polarity: '+',
            strength: 0.8,
          },
        ],
        behaviors: [
          {
            id: 'beh-race-bottom',
            name: 'Race to Bottom',
            description: 'Both competitors reduce prices until margins collapse',
            pattern: 'decline',
            causes: ['r-a-response', 'r-b-response'],
            timeframe: '6-18 months',
            unintendedConsequences: ['Margin erosion', 'Industry profitability decline'],
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-024') as SystemsThinkingThought;

      expect(thought.feedbackLoops).toHaveLength(2);
      expect(thought.feedbackLoops!.every(f => f.type === 'reinforcing')).toBe(true);
    });
  });

  /**
   * T-SCI-025: Success to Successful archetype
   */
  describe('T-SCI-025: Success to Successful Archetype', () => {
    it('should model Success to Successful archetype', () => {
      const input = createSystemsThinkingInput({
        thought: 'Analyzing Success to Successful pattern',
        system: {
          id: 'resource-allocation',
          name: 'Project Resource Allocation',
          description: 'Resource allocation reinforcing initial advantages',
          boundary: 'Two competing projects in organization',
          purpose: 'Optimal resource allocation',
        },
        feedbackLoops: [
          {
            id: 'r-project-a',
            name: 'Project A Success',
            type: 'reinforcing',
            description: 'Success attracts more resources for A',
            components: ['a-resources', 'a-performance', 'a-visibility', 'a-resource-allocation'],
            polarity: '+',
            strength: 0.85,
          },
          {
            id: 'r-project-b',
            name: 'Project B Decline',
            type: 'reinforcing',
            description: 'Underperformance leads to resource reduction for B',
            components: ['b-resources', 'b-performance', 'b-visibility', 'b-resource-allocation'],
            polarity: '+',
            strength: 0.85,
          },
          {
            id: 'b-resource-constraint',
            name: 'Resource Constraint',
            type: 'balancing',
            description: 'Fixed total resources must be shared',
            components: ['a-resources', 'total-resources', 'b-resources'],
            polarity: '-',
            strength: 1.0,
          },
        ],
        leveragePoints: [
          {
            id: 'lp-allocation-rules',
            name: 'Allocation Rules',
            location: 'resource-allocation',
            description: 'Change allocation criteria to prevent winner-take-all',
            effectiveness: 0.9,
            difficulty: 0.6,
            type: 'structure',
            interventionExamples: ['Minimum resource floors', 'Rotation of priority'],
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-025') as SystemsThinkingThought;

      expect(thought.leveragePoints![0].type).toBe('structure');
    });
  });

  /**
   * T-SCI-026: Drifting Goals archetype
   */
  describe('T-SCI-026: Drifting Goals Archetype', () => {
    it('should model Drifting Goals archetype', () => {
      const input = createSystemsThinkingInput({
        thought: 'Analyzing Drifting Goals pattern',
        system: {
          id: 'quality-standards',
          name: 'Quality Standards System',
          description: 'Standards eroding under pressure',
          boundary: 'Product quality management',
          purpose: 'Maintain high quality standards',
        },
        feedbackLoops: [
          {
            id: 'b-correct-action',
            name: 'Corrective Action',
            type: 'balancing',
            description: 'Invest to close gap between actual and target quality',
            components: ['quality-gap', 'corrective-investment', 'actual-quality'],
            polarity: '-',
            strength: 0.5,
            delay: 30,
          },
          {
            id: 'b-goal-erosion',
            name: 'Goal Erosion',
            type: 'balancing',
            description: 'Lower the goal to close the gap',
            components: ['quality-gap', 'pressure-to-lower', 'target-quality'],
            polarity: '-',
            strength: 0.8,
          },
        ],
        behaviors: [
          {
            id: 'beh-declining-standards',
            name: 'Declining Standards',
            description: 'Quality targets gradually lowered over time',
            pattern: 'decline',
            causes: ['b-goal-erosion'],
            timeframe: '1-3 years',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-026') as SystemsThinkingThought;

      expect(thought.feedbackLoops!.find(f => f.id === 'b-goal-erosion')!.strength).toBeGreaterThan(
        thought.feedbackLoops!.find(f => f.id === 'b-correct-action')!.strength
      );
    });
  });

  /**
   * T-SCI-027: Growth and Underinvestment archetype
   */
  describe('T-SCI-027: Growth and Underinvestment Archetype', () => {
    it('should model Growth and Underinvestment archetype', () => {
      const input = createSystemsThinkingInput({
        thought: 'Analyzing Growth and Underinvestment pattern',
        system: {
          id: 'infrastructure',
          name: 'Infrastructure Investment',
          description: 'Growth limited by underinvestment in capacity',
          boundary: 'Organization capacity and demand',
          purpose: 'Sustainable growth with adequate capacity',
        },
        feedbackLoops: [
          {
            id: 'r-growth',
            name: 'Growth Engine',
            type: 'reinforcing',
            description: 'Demand drives growth',
            components: ['demand', 'revenue', 'potential-growth'],
            polarity: '+',
            strength: 0.8,
            dominance: 'early',
          },
          {
            id: 'b-capacity-limit',
            name: 'Capacity Constraint',
            type: 'balancing',
            description: 'Performance degrades as capacity is stretched',
            components: ['demand', 'capacity-utilization', 'service-quality', 'customer-satisfaction', 'demand'],
            polarity: '-',
            strength: 0.7,
            dominance: 'late',
          },
          {
            id: 'b-investment',
            name: 'Investment Response',
            type: 'balancing',
            description: 'Poor performance should trigger investment',
            components: ['service-quality', 'urgency', 'investment', 'capacity'],
            polarity: '-',
            strength: 0.4,
            delay: 180,
          },
        ],
        leveragePoints: [
          {
            id: 'lp-proactive-investment',
            name: 'Proactive Investment',
            location: 'investment',
            description: 'Invest ahead of demand curve',
            effectiveness: 0.95,
            difficulty: 0.7,
            type: 'goal',
            interventionExamples: ['Lead capacity strategy', 'Regular capacity reviews'],
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sys-027') as SystemsThinkingThought;

      expect(thought.feedbackLoops!.find(f => f.id === 'b-investment')!.delay).toBe(180);
      expect(thought.leveragePoints![0].type).toBe('goal');
    });
  });

  /**
   * T-SCI-028: SystemsThinking multi-thought system analysis
   */
  describe('T-SCI-028: Multi-Thought System Analysis', () => {
    it('should support multi-step systems analysis session', () => {
      const sessionId = 'session-sys-028-multi';

      // Step 1: System definition
      const step1 = factory.createThought(createSystemsThinkingInput({
        thought: 'Step 1: Defining system boundary and purpose',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        thoughtType: 'system_definition',
        system: {
          id: 'urban-traffic',
          name: 'Urban Traffic System',
          description: 'City traffic flow and congestion dynamics',
          boundary: 'City road network, vehicles, traffic signals',
          purpose: 'Efficient movement of people and goods',
          timeHorizon: '10 years',
        },
      }), sessionId) as SystemsThinkingThought;
      expect(step1.system!.name).toBe('Urban Traffic System');

      // Step 2: Component analysis
      const step2 = factory.createThought(createSystemsThinkingInput({
        thought: 'Step 2: Identifying key components',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        thoughtType: 'component_analysis',
        components: [
          { id: 'vehicles', name: 'Vehicles', type: 'stock', description: 'Cars on roads', unit: 'vehicles' },
          { id: 'road-capacity', name: 'Road Capacity', type: 'stock', description: 'Lane-kilometers', unit: 'km' },
          { id: 'congestion', name: 'Congestion Level', type: 'variable', description: 'Degree of congestion' },
          { id: 'public-transit', name: 'Public Transit', type: 'stock', description: 'Transit capacity' },
        ],
      }), sessionId) as SystemsThinkingThought;
      expect(step2.components).toHaveLength(4);

      // Step 3: Feedback identification
      const step3 = factory.createThought(createSystemsThinkingInput({
        thought: 'Step 3: Identifying feedback loops',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        thoughtType: 'feedback_identification',
        feedbackLoops: [
          {
            id: 'r-induced-demand',
            name: 'Induced Demand',
            type: 'reinforcing',
            description: 'More roads attract more drivers',
            components: ['road-capacity', 'travel-time', 'attractiveness', 'vehicles'],
            polarity: '+',
            strength: 0.7,
          },
          {
            id: 'b-transit-shift',
            name: 'Transit Shift',
            type: 'balancing',
            description: 'Congestion drives shift to transit',
            components: ['congestion', 'transit-appeal', 'transit-ridership', 'vehicles'],
            polarity: '-',
            strength: 0.4,
          },
        ],
      }), sessionId) as SystemsThinkingThought;
      expect(step3.feedbackLoops).toHaveLength(2);

      // Step 4: Leverage analysis
      const step4 = factory.createThought(createSystemsThinkingInput({
        thought: 'Step 4: Identifying leverage points',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        thoughtType: 'leverage_analysis',
        leveragePoints: [
          {
            id: 'lp-pricing',
            name: 'Congestion Pricing',
            location: 'vehicles',
            description: 'Price mechanism to reduce demand',
            effectiveness: 0.8,
            difficulty: 0.6,
            type: 'parameter',
            interventionExamples: ['Dynamic tolling', 'Parking pricing'],
          },
          {
            id: 'lp-transit-investment',
            name: 'Transit Investment',
            location: 'public-transit',
            description: 'Increase transit capacity and quality',
            effectiveness: 0.7,
            difficulty: 0.8,
            type: 'structure',
            interventionExamples: ['New rail lines', 'Bus rapid transit'],
          },
          {
            id: 'lp-remote-work',
            name: 'Remote Work Culture',
            location: 'vehicles',
            description: 'Reduce commuting need',
            effectiveness: 0.6,
            difficulty: 0.4,
            type: 'paradigm',
            interventionExamples: ['Work-from-home policies', 'Distributed offices'],
          },
        ],
        behaviors: [
          {
            id: 'beh-current',
            name: 'Current Trajectory',
            description: 'Congestion worsens despite road building',
            pattern: 'growth',
            causes: ['r-induced-demand'],
            timeframe: '5-10 years',
          },
        ],
      }), sessionId) as SystemsThinkingThought;
      expect(step4.leveragePoints).toHaveLength(3);
      expect(step4.leveragePoints!.map(lp => lp.type)).toContain('paradigm');
      expect(step4.nextThoughtNeeded).toBe(false);
    });
  });
});
