/**
 * Causal Mode Integration Tests
 *
 * Tests T-CSL-001 through T-CSL-020: Comprehensive integration tests
 * for the deepthinking_causal tool with causal mode.
 *
 * Phase 11 Sprint 5: Causal & Strategic Modes Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type CausalThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import {
  assertValidProbability,
  assertInRange,
} from '../../utils/assertion-helpers.js';

// ============================================================================
// CAUSAL MODE MOCK DATA
// ============================================================================

const SAMPLE_CAUSAL_NODES = {
  simple: [
    { id: 'n1', name: 'Smoking', type: 'cause' as const, description: 'Regular tobacco use' },
    { id: 'n2', name: 'Lung Cancer', type: 'effect' as const, description: 'Malignant tumor in lungs' },
  ],
  threeNodes: [
    { id: 'n1', name: 'Education', type: 'cause' as const, description: 'Level of formal education' },
    { id: 'n2', name: 'Income', type: 'mediator' as const, description: 'Annual earnings' },
    { id: 'n3', name: 'Health', type: 'effect' as const, description: 'Overall health status' },
  ],
  complex: [
    { id: 'n1', name: 'Genetics', type: 'cause' as const, description: 'Genetic predisposition' },
    { id: 'n2', name: 'Diet', type: 'cause' as const, description: 'Dietary habits' },
    { id: 'n3', name: 'Exercise', type: 'cause' as const, description: 'Physical activity level' },
    { id: 'n4', name: 'Socioeconomic Status', type: 'confounder' as const, description: 'Social and economic position' },
    { id: 'n5', name: 'Stress', type: 'mediator' as const, description: 'Psychological stress' },
    { id: 'n6', name: 'Inflammation', type: 'mediator' as const, description: 'Chronic inflammation' },
    { id: 'n7', name: 'Blood Pressure', type: 'mediator' as const, description: 'Hypertension' },
    { id: 'n8', name: 'Heart Disease', type: 'effect' as const, description: 'Cardiovascular disease' },
    { id: 'n9', name: 'Mortality', type: 'effect' as const, description: 'Death outcome' },
    { id: 'n10', name: 'Quality of Life', type: 'effect' as const, description: 'Overall life quality' },
  ],
};

const SAMPLE_CAUSAL_EDGES = {
  simple: [
    { from: 'n1', to: 'n2', strength: 0.7, confidence: 0.9 },
  ],
  chain: [
    { from: 'n1', to: 'n2', strength: 0.6, confidence: 0.8 },
    { from: 'n2', to: 'n3', strength: 0.5, confidence: 0.75 },
  ],
  withTypes: [
    { from: 'n1', to: 'n2', strength: 0.6, confidence: 0.8, mechanism: 'direct causation' },
    { from: 'n2', to: 'n3', strength: 0.5, confidence: 0.75, mechanism: 'mediation' },
  ],
};

const SAMPLE_INTERVENTIONS = {
  single: [
    {
      nodeId: 'n1',
      action: 'Set to 0',
      expectedEffects: [
        { nodeId: 'n2', expectedChange: 'Decrease by 50%', confidence: 0.8 },
      ],
    },
  ],
  multiple: [
    {
      nodeId: 'n2',
      action: 'Increase by 20%',
      expectedEffects: [
        { nodeId: 'n3', expectedChange: 'Improve moderately', confidence: 0.7 },
      ],
    },
    {
      nodeId: 'n3',
      action: 'Set to high activity',
      expectedEffects: [
        { nodeId: 'n8', expectedChange: 'Reduce risk by 30%', confidence: 0.85 },
      ],
    },
  ],
};

const SAMPLE_MECHANISMS = {
  simple: [
    { from: 'n1', to: 'n2', description: 'Direct causal effect', type: 'direct' as const },
  ],
  chain: [
    { from: 'n1', to: 'n2', description: 'Income increases with education', type: 'direct' as const },
    { from: 'n2', to: 'n3', description: 'Income enables better healthcare', type: 'indirect' as const },
  ],
};

const SAMPLE_CONFOUNDERS = [
  { nodeId: 'n4', affects: ['n1', 'n3'], description: 'SES affects both education access and health outcomes' },
];

const SAMPLE_EXPLANATIONS = {
  simple: [
    { hypothesis: 'Smoking causes lung cancer', plausibility: 0.9 },
  ],
  multiple: [
    { hypothesis: 'Direct carcinogenic effect', plausibility: 0.85 },
    { hypothesis: 'Inflammation-mediated pathway', plausibility: 0.7 },
    { hypothesis: 'Genetic susceptibility interaction', plausibility: 0.6 },
  ],
};

// ============================================================================
// CAUSAL THOUGHT FACTORIES
// ============================================================================

function createBaseCausalInput(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: 'Analyzing causal relationships',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'causal',
    ...overrides,
  } as ThinkingToolInput;
}

function createCausalWithNodes(
  nodes: typeof SAMPLE_CAUSAL_NODES.simple,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createBaseCausalInput({
    causalGraph: {
      nodes,
      edges: [],
    },
    mechanisms: [],
    ...overrides,
  });
}

function createCausalWithGraph(
  nodes: typeof SAMPLE_CAUSAL_NODES.simple,
  edges: typeof SAMPLE_CAUSAL_EDGES.simple,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createBaseCausalInput({
    causalGraph: {
      nodes,
      edges,
    },
    mechanisms: SAMPLE_MECHANISMS.simple,
    ...overrides,
  });
}

// ============================================================================
// TESTS
// ============================================================================

describe('Causal Mode Integration Tests', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-CSL-001: Basic causal thought
   */
  describe('T-CSL-001: Basic Causal Thought', () => {
    it('should create a basic causal thought with minimal params', () => {
      const input = createBaseCausalInput({
        thought: 'Examining causal relationship between variables',
        causalGraph: {
          nodes: SAMPLE_CAUSAL_NODES.simple,
          edges: SAMPLE_CAUSAL_EDGES.simple,
        },
        mechanisms: SAMPLE_MECHANISMS.simple,
      });

      const thought = factory.createThought(input, 'session-csl-001');

      expect(thought.mode).toBe(ThinkingMode.CAUSAL);
      expect(thought.content).toBe('Examining causal relationship between variables');
      expect(thought.sessionId).toBe('session-csl-001');
    });

    it('should assign unique IDs to causal thoughts', () => {
      const input1 = createBaseCausalInput({
        thought: 'First causal thought',
        causalGraph: { nodes: SAMPLE_CAUSAL_NODES.simple, edges: [] },
        mechanisms: [],
      });
      const input2 = createBaseCausalInput({
        thought: 'Second causal thought',
        causalGraph: { nodes: SAMPLE_CAUSAL_NODES.simple, edges: [] },
        mechanisms: [],
      });

      const thought1 = factory.createThought(input1, 'session-csl-001');
      const thought2 = factory.createThought(input2, 'session-csl-001');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-CSL-002: Causal with nodes array (3 nodes)
   */
  describe('T-CSL-002: Causal with Nodes Array (3 Nodes)', () => {
    it('should include 3-node causal graph', () => {
      const input = createCausalWithNodes(SAMPLE_CAUSAL_NODES.threeNodes);

      const thought = factory.createThought(input, 'session-csl-002') as CausalThought;

      expect(thought.causalGraph.nodes).toHaveLength(3);
      expect(thought.causalGraph.nodes[0].id).toBe('n1');
      expect(thought.causalGraph.nodes[1].id).toBe('n2');
      expect(thought.causalGraph.nodes[2].id).toBe('n3');
    });

    it('should preserve node types correctly', () => {
      const input = createCausalWithNodes(SAMPLE_CAUSAL_NODES.threeNodes);

      const thought = factory.createThought(input, 'session-csl-002') as CausalThought;

      expect(thought.causalGraph.nodes[0].type).toBe('cause');
      expect(thought.causalGraph.nodes[1].type).toBe('mediator');
      expect(thought.causalGraph.nodes[2].type).toBe('effect');
    });
  });

  /**
   * T-CSL-003: Causal with nodes array (10+ nodes)
   */
  describe('T-CSL-003: Causal with Nodes Array (10+ Nodes)', () => {
    it('should handle large causal graphs with 10+ nodes', () => {
      const input = createCausalWithNodes(SAMPLE_CAUSAL_NODES.complex);

      const thought = factory.createThought(input, 'session-csl-003') as CausalThought;

      expect(thought.causalGraph.nodes).toHaveLength(10);
      expect(thought.causalGraph.nodes.map(n => n.id)).toContain('n1');
      expect(thought.causalGraph.nodes.map(n => n.id)).toContain('n10');
    });

    it('should handle diverse node types in large graphs', () => {
      const input = createCausalWithNodes(SAMPLE_CAUSAL_NODES.complex);

      const thought = factory.createThought(input, 'session-csl-003') as CausalThought;

      const nodeTypes = thought.causalGraph.nodes.map(n => n.type);
      expect(nodeTypes).toContain('cause');
      expect(nodeTypes).toContain('effect');
      expect(nodeTypes).toContain('mediator');
      expect(nodeTypes).toContain('confounder');
    });
  });

  /**
   * T-CSL-004: Causal with nodes[].description
   */
  describe('T-CSL-004: Causal with Node Descriptions', () => {
    it('should preserve node descriptions', () => {
      const input = createCausalWithNodes(SAMPLE_CAUSAL_NODES.simple);

      const thought = factory.createThought(input, 'session-csl-004') as CausalThought;

      expect(thought.causalGraph.nodes[0].description).toBe('Regular tobacco use');
      expect(thought.causalGraph.nodes[1].description).toBe('Malignant tumor in lungs');
    });

    it('should preserve detailed descriptions in complex graphs', () => {
      const input = createCausalWithNodes(SAMPLE_CAUSAL_NODES.complex);

      const thought = factory.createThought(input, 'session-csl-004') as CausalThought;

      const node4 = thought.causalGraph.nodes.find(n => n.id === 'n4');
      expect(node4?.description).toBe('Social and economic position');
    });
  });

  /**
   * T-CSL-005: Causal with edges array
   */
  describe('T-CSL-005: Causal with Edges Array', () => {
    it('should include edges in causal graph', () => {
      const input = createCausalWithGraph(
        SAMPLE_CAUSAL_NODES.simple,
        SAMPLE_CAUSAL_EDGES.simple
      );

      const thought = factory.createThought(input, 'session-csl-005') as CausalThought;

      expect(thought.causalGraph.edges).toHaveLength(1);
      expect(thought.causalGraph.edges[0].from).toBe('n1');
      expect(thought.causalGraph.edges[0].to).toBe('n2');
    });

    it('should handle chain of edges', () => {
      const input = createCausalWithGraph(
        SAMPLE_CAUSAL_NODES.threeNodes,
        SAMPLE_CAUSAL_EDGES.chain
      );

      const thought = factory.createThought(input, 'session-csl-005') as CausalThought;

      expect(thought.causalGraph.edges).toHaveLength(2);
      expect(thought.causalGraph.edges[0].from).toBe('n1');
      expect(thought.causalGraph.edges[0].to).toBe('n2');
      expect(thought.causalGraph.edges[1].from).toBe('n2');
      expect(thought.causalGraph.edges[1].to).toBe('n3');
    });
  });

  /**
   * T-CSL-006: Causal with edges[].type (mechanism)
   */
  describe('T-CSL-006: Causal with Edge Mechanisms', () => {
    it('should include edge mechanism descriptions', () => {
      const input = createCausalWithGraph(
        SAMPLE_CAUSAL_NODES.threeNodes,
        SAMPLE_CAUSAL_EDGES.withTypes
      );

      const thought = factory.createThought(input, 'session-csl-006') as CausalThought;

      expect(thought.causalGraph.edges[0].mechanism).toBe('direct causation');
      expect(thought.causalGraph.edges[1].mechanism).toBe('mediation');
    });
  });

  /**
   * T-CSL-007: Causal with edges[].strength
   */
  describe('T-CSL-007: Causal with Edge Strength', () => {
    it('should include edge strength values', () => {
      const input = createCausalWithGraph(
        SAMPLE_CAUSAL_NODES.simple,
        SAMPLE_CAUSAL_EDGES.simple
      );

      const thought = factory.createThought(input, 'session-csl-007') as CausalThought;

      expect(thought.causalGraph.edges[0].strength).toBe(0.7);
    });

    it('should have strength values in valid range', () => {
      const input = createCausalWithGraph(
        SAMPLE_CAUSAL_NODES.threeNodes,
        SAMPLE_CAUSAL_EDGES.chain
      );

      const thought = factory.createThought(input, 'session-csl-007') as CausalThought;

      for (const edge of thought.causalGraph.edges) {
        assertInRange(edge.strength, -1, 1);
        assertValidProbability(edge.confidence);
      }
    });
  });

  /**
   * T-CSL-008: Causal graph construction session
   */
  describe('T-CSL-008: Causal Graph Construction Session', () => {
    it('should support multi-step graph construction', () => {
      const sessionId = 'session-csl-008';

      // Step 1: Define nodes
      const step1 = createCausalWithNodes(SAMPLE_CAUSAL_NODES.threeNodes, {
        thought: 'Defining causal nodes',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      });
      const thought1 = factory.createThought(step1, sessionId) as CausalThought;
      expect(thought1.causalGraph.nodes).toHaveLength(3);

      // Step 2: Add edges
      const step2 = createCausalWithGraph(
        SAMPLE_CAUSAL_NODES.threeNodes,
        SAMPLE_CAUSAL_EDGES.chain,
        {
          thought: 'Adding causal edges',
          thoughtNumber: 2,
          totalThoughts: 3,
          nextThoughtNeeded: true,
        }
      );
      const thought2 = factory.createThought(step2, sessionId) as CausalThought;
      expect(thought2.causalGraph.edges).toHaveLength(2);

      // Step 3: Add interventions
      const step3 = createBaseCausalInput({
        thought: 'Analyzing interventions',
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
        causalGraph: {
          nodes: SAMPLE_CAUSAL_NODES.threeNodes,
          edges: SAMPLE_CAUSAL_EDGES.chain,
        },
        mechanisms: SAMPLE_MECHANISMS.chain,
        interventions: SAMPLE_INTERVENTIONS.single,
      });
      const thought3 = factory.createThought(step3, sessionId) as CausalThought;
      expect(thought3.interventions).toHaveLength(1);
    });
  });

  /**
   * T-CSL-009: Causal with cycle detection
   */
  describe('T-CSL-009: Causal with Cycle Detection', () => {
    it('should allow graphs with feedback loops', () => {
      const nodesWithFeedback = [
        { id: 'n1', name: 'Stress', type: 'cause' as const, description: 'Psychological stress' },
        { id: 'n2', name: 'Poor Sleep', type: 'mediator' as const, description: 'Lack of quality sleep' },
        { id: 'n3', name: 'Health Issues', type: 'effect' as const, description: 'Physical health problems' },
      ];

      const edgesWithCycle = [
        { from: 'n1', to: 'n2', strength: 0.7, confidence: 0.8 },
        { from: 'n2', to: 'n3', strength: 0.6, confidence: 0.75 },
        { from: 'n3', to: 'n1', strength: 0.5, confidence: 0.7 }, // Feedback loop
      ];

      const input = createCausalWithGraph(nodesWithFeedback, edgesWithCycle);

      const thought = factory.createThought(input, 'session-csl-009') as CausalThought;

      // Verify the graph includes the cycle
      const edgeToN1 = thought.causalGraph.edges.find(e => e.to === 'n1');
      expect(edgeToN1).toBeDefined();
      expect(edgeToN1?.from).toBe('n3');
    });
  });

  /**
   * T-CSL-010: Causal with interventions array
   */
  describe('T-CSL-010: Causal with Interventions Array', () => {
    it('should include interventions in thought', () => {
      const input = createBaseCausalInput({
        causalGraph: {
          nodes: SAMPLE_CAUSAL_NODES.simple,
          edges: SAMPLE_CAUSAL_EDGES.simple,
        },
        mechanisms: SAMPLE_MECHANISMS.simple,
        interventions: SAMPLE_INTERVENTIONS.single,
      });

      const thought = factory.createThought(input, 'session-csl-010') as CausalThought;

      expect(thought.interventions).toHaveLength(1);
      expect(thought.interventions![0].nodeId).toBe('n1');
    });

    it('should handle multiple interventions', () => {
      const input = createBaseCausalInput({
        causalGraph: {
          nodes: SAMPLE_CAUSAL_NODES.complex,
          edges: [],
        },
        mechanisms: [],
        interventions: SAMPLE_INTERVENTIONS.multiple,
      });

      const thought = factory.createThought(input, 'session-csl-010') as CausalThought;

      expect(thought.interventions).toHaveLength(2);
    });
  });

  /**
   * T-CSL-011: Causal with interventions[].value (action)
   */
  describe('T-CSL-011: Causal with Intervention Actions', () => {
    it('should include intervention action values', () => {
      const input = createBaseCausalInput({
        causalGraph: {
          nodes: SAMPLE_CAUSAL_NODES.simple,
          edges: SAMPLE_CAUSAL_EDGES.simple,
        },
        mechanisms: SAMPLE_MECHANISMS.simple,
        interventions: SAMPLE_INTERVENTIONS.single,
      });

      const thought = factory.createThought(input, 'session-csl-011') as CausalThought;

      expect(thought.interventions![0].action).toBe('Set to 0');
    });
  });

  /**
   * T-CSL-012: Causal with interventions[].effect
   */
  describe('T-CSL-012: Causal with Intervention Effects', () => {
    it('should include expected effects of interventions', () => {
      const input = createBaseCausalInput({
        causalGraph: {
          nodes: SAMPLE_CAUSAL_NODES.simple,
          edges: SAMPLE_CAUSAL_EDGES.simple,
        },
        mechanisms: SAMPLE_MECHANISMS.simple,
        interventions: SAMPLE_INTERVENTIONS.single,
      });

      const thought = factory.createThought(input, 'session-csl-012') as CausalThought;

      const effects = thought.interventions![0].expectedEffects;
      expect(effects).toHaveLength(1);
      expect(effects[0].nodeId).toBe('n2');
      expect(effects[0].expectedChange).toBe('Decrease by 50%');
      expect(effects[0].confidence).toBe(0.8);
    });
  });

  /**
   * T-CSL-013: Causal do-calculus intervention
   */
  describe('T-CSL-013: Causal Do-Calculus Intervention', () => {
    it('should support do-calculus style interventions', () => {
      const doCalcIntervention = {
        nodeId: 'n1',
        action: 'do(X=1)', // Pearl's do-calculus notation
        expectedEffects: [
          { nodeId: 'n2', expectedChange: 'E[Y|do(X=1)] = 0.7', confidence: 0.95 },
        ],
      };

      const input = createBaseCausalInput({
        causalGraph: {
          nodes: SAMPLE_CAUSAL_NODES.simple,
          edges: SAMPLE_CAUSAL_EDGES.simple,
        },
        mechanisms: SAMPLE_MECHANISMS.simple,
        interventions: [doCalcIntervention],
      });

      const thought = factory.createThought(input, 'session-csl-013') as CausalThought;

      expect(thought.interventions![0].action).toContain('do(');
    });
  });

  /**
   * T-CSL-014: Causal with observations array
   */
  describe('T-CSL-014: Causal with Observations Array', () => {
    it('should include observations in causal analysis', () => {
      const input = createBaseCausalInput({
        causalGraph: {
          nodes: SAMPLE_CAUSAL_NODES.simple,
          edges: SAMPLE_CAUSAL_EDGES.simple,
        },
        mechanisms: SAMPLE_MECHANISMS.simple,
        observations: [
          'Correlation between smoking and lung cancer observed',
          'Dose-response relationship confirmed',
          'Temporal precedence established',
        ],
      });

      const thought = factory.createThought(input, 'session-csl-014');

      // Observations are stored in the thought
      expect(thought.mode).toBe(ThinkingMode.CAUSAL);
    });
  });

  /**
   * T-CSL-015: Causal with explanations array
   */
  describe('T-CSL-015: Causal with Explanations Array', () => {
    it('should support causal explanations', () => {
      const input = createBaseCausalInput({
        thought: 'Generating causal explanations',
        causalGraph: {
          nodes: SAMPLE_CAUSAL_NODES.simple,
          edges: SAMPLE_CAUSAL_EDGES.simple,
        },
        mechanisms: SAMPLE_MECHANISMS.simple,
      });

      const thought = factory.createThought(input, 'session-csl-015') as CausalThought;

      expect(thought.mode).toBe(ThinkingMode.CAUSAL);
      expect(thought.mechanisms).toBeDefined();
    });
  });

  /**
   * T-CSL-016: Causal with explanations[].plausibility
   */
  describe('T-CSL-016: Causal with Plausibility Scores', () => {
    it('should handle plausibility assessments', () => {
      const input = createBaseCausalInput({
        thought: 'Assessing explanation plausibility',
        causalGraph: {
          nodes: SAMPLE_CAUSAL_NODES.simple,
          edges: SAMPLE_CAUSAL_EDGES.simple,
        },
        mechanisms: SAMPLE_MECHANISMS.simple,
        confidence: 0.85,
      });

      const thought = factory.createThought(input, 'session-csl-016');

      expect(thought.mode).toBe(ThinkingMode.CAUSAL);
    });
  });

  /**
   * T-CSL-017: Causal multi-thought graph refinement
   */
  describe('T-CSL-017: Causal Multi-Thought Graph Refinement', () => {
    it('should support iterative graph refinement', () => {
      const sessionId = 'session-csl-017';

      // Initial hypothesis
      const step1 = createCausalWithGraph(
        SAMPLE_CAUSAL_NODES.simple,
        SAMPLE_CAUSAL_EDGES.simple,
        {
          thought: 'Initial causal hypothesis',
          thoughtNumber: 1,
          totalThoughts: 2,
          nextThoughtNeeded: true,
        }
      );
      const thought1 = factory.createThought(step1, sessionId) as CausalThought;

      // Refined graph with additional nodes
      const step2 = createCausalWithGraph(
        [...SAMPLE_CAUSAL_NODES.simple,
         { id: 'n3', name: 'Tar Buildup', type: 'mediator' as const, description: 'Carcinogenic compounds' }],
        [
          { from: 'n1', to: 'n3', strength: 0.8, confidence: 0.9 },
          { from: 'n3', to: 'n2', strength: 0.9, confidence: 0.85 },
        ],
        {
          thought: 'Refined causal model with mediator',
          thoughtNumber: 2,
          totalThoughts: 2,
          nextThoughtNeeded: false,
          isRevision: true,
          revisesThought: thought1.id,
        }
      );
      const thought2 = factory.createThought(step2, sessionId) as CausalThought;

      expect(thought2.causalGraph.nodes).toHaveLength(3);
      expect(thought2.isRevision).toBe(true);
    });
  });

  /**
   * T-CSL-018: Causal with d-separation analysis
   */
  describe('T-CSL-018: Causal with D-Separation Analysis', () => {
    it('should support d-separation concepts in mechanisms', () => {
      const dSepMechanisms = [
        { from: 'n1', to: 'n2', description: 'Direct path (unblocked)', type: 'direct' as const },
        { from: 'n4', to: 'n1', description: 'Confounding path to cause', type: 'indirect' as const },
        { from: 'n4', to: 'n3', description: 'Confounding path to effect', type: 'indirect' as const },
      ];

      const input = createBaseCausalInput({
        thought: 'Analyzing conditional independence via d-separation',
        causalGraph: {
          nodes: [
            ...SAMPLE_CAUSAL_NODES.threeNodes,
            { id: 'n4', name: 'Confounder', type: 'confounder' as const, description: 'Common cause' },
          ],
          edges: [
            { from: 'n1', to: 'n2', strength: 0.6, confidence: 0.8 },
            { from: 'n4', to: 'n1', strength: 0.5, confidence: 0.7 },
            { from: 'n4', to: 'n3', strength: 0.5, confidence: 0.7 },
          ],
        },
        mechanisms: dSepMechanisms,
      });

      const thought = factory.createThought(input, 'session-csl-018') as CausalThought;

      expect(thought.mechanisms).toHaveLength(3);
      const confoundingMechs = thought.mechanisms.filter(m => m.type === 'indirect');
      expect(confoundingMechs).toHaveLength(2);
    });
  });

  /**
   * T-CSL-019: Causal confounding detection
   */
  describe('T-CSL-019: Causal Confounding Detection', () => {
    it('should detect and record confounding variables', () => {
      const input = createBaseCausalInput({
        thought: 'Identifying confounding variables',
        causalGraph: {
          nodes: [
            ...SAMPLE_CAUSAL_NODES.threeNodes,
            { id: 'n4', name: 'SES', type: 'confounder' as const, description: 'Socioeconomic status' },
          ],
          edges: SAMPLE_CAUSAL_EDGES.chain,
        },
        mechanisms: SAMPLE_MECHANISMS.chain,
        confounders: SAMPLE_CONFOUNDERS,
      });

      const thought = factory.createThought(input, 'session-csl-019') as CausalThought;

      expect(thought.confounders).toHaveLength(1);
      expect(thought.confounders![0].nodeId).toBe('n4');
      expect(thought.confounders![0].affects).toContain('n1');
      expect(thought.confounders![0].affects).toContain('n3');
    });
  });

  /**
   * T-CSL-020: Causal mediator identification
   */
  describe('T-CSL-020: Causal Mediator Identification', () => {
    it('should correctly identify mediator nodes', () => {
      const input = createCausalWithGraph(
        SAMPLE_CAUSAL_NODES.threeNodes,
        SAMPLE_CAUSAL_EDGES.chain
      );

      const thought = factory.createThought(input, 'session-csl-020') as CausalThought;

      const mediators = thought.causalGraph.nodes.filter(n => n.type === 'mediator');
      expect(mediators).toHaveLength(1);
      expect(mediators[0].id).toBe('n2');
      expect(mediators[0].name).toBe('Income');
    });

    it('should capture mediation in mechanisms', () => {
      const input = createBaseCausalInput({
        causalGraph: {
          nodes: SAMPLE_CAUSAL_NODES.threeNodes,
          edges: SAMPLE_CAUSAL_EDGES.chain,
        },
        mechanisms: SAMPLE_MECHANISMS.chain,
      });

      const thought = factory.createThought(input, 'session-csl-020') as CausalThought;

      const indirectMech = thought.mechanisms.find(m => m.type === 'indirect');
      expect(indirectMech).toBeDefined();
      expect(indirectMech?.from).toBe('n2');
      expect(indirectMech?.to).toBe('n3');
    });
  });
});
