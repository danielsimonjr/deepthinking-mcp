/**
 * Mode Exporter Snapshot Baseline Tests (Phase 13 Sprint 4)
 *
 * PURPOSE: Generate baseline snapshots for mode exporters BEFORE refactoring.
 * These snapshots ensure Sprints 5-9 refactoring preserves visual output.
 *
 * Tests DOT, Mermaid, and ASCII output for each mode exporter.
 * Uses minimal fixtures with required fields for each mode.
 */

import { describe, it, expect } from 'vitest';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { VisualExportOptions } from '../../../../../src/export/visual/types.js';

// Import all mode exporters
import {
  exportSequentialDependencyGraph,
  exportShannonStageFlow,
  exportMathematicsDerivation,
  exportPhysicsVisualization,
  exportHybridOrchestration,
  exportCausalGraph,
  exportTemporalTimeline,
  exportCounterfactualScenarios,
  exportBayesianNetwork,
  exportEvidentialBeliefs,
  exportGameTree,
  exportOptimizationSolution,
  exportAbductiveHypotheses,
  exportAnalogicalMapping,
  exportFirstPrinciplesDerivation,
  exportMetaReasoningVisualization,
  exportSystemsThinkingCausalLoops,
  exportScientificMethodExperiment,
  exportFormalLogicProof,
  exportEngineeringAnalysis,
  exportComputability,
} from '../../../../../src/export/visual/modes/index.js';

// ============================================================================
// Format Options
// ============================================================================

const dotOptions: VisualExportOptions = { format: 'dot', includeLabels: true, includeMetrics: true };
const mermaidOptions: VisualExportOptions = { format: 'mermaid', includeLabels: true, includeMetrics: true };
const asciiOptions: VisualExportOptions = { format: 'ascii', includeLabels: true, includeMetrics: true };

// ============================================================================
// Base fixture factory
// ============================================================================

const baseFields = {
  sessionId: 'test-session',
  thoughtNumber: 1,
  totalThoughts: 1,
  timestamp: new Date('2025-01-01T00:00:00Z'),
  nextThoughtNeeded: false,
};

// ============================================================================
// Sequential Mode
// ============================================================================

const sequentialThought = {
  ...baseFields,
  id: 'seq-1',
  mode: ThinkingMode.SEQUENTIAL,
  content: 'Sequential reasoning step',
  dependencies: [],
  subtasks: [
    { id: 's1', description: 'Step 1', status: 'completed' },
    { id: 's2', description: 'Step 2', status: 'in_progress' },
  ],
} as any;

describe('Sequential Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportSequentialDependencyGraph(sequentialThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportSequentialDependencyGraph(sequentialThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportSequentialDependencyGraph(sequentialThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Shannon Mode
// ============================================================================

const shannonThought = {
  ...baseFields,
  id: 'shannon-1',
  mode: ThinkingMode.SHANNON,
  content: 'Information analysis',
  stage: 'encoding',
  uncertainty: 0.5,
  dependencies: ['data-source'],
  assumptions: ['Channel is reliable'],
  informationMetrics: {
    entropy: 2.5,
    redundancy: 0.3,
    channelCapacity: 1000,
    noiseLevel: 0.1,
    compressionRatio: 0.7,
  },
} as any;

describe('Shannon Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportShannonStageFlow(shannonThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportShannonStageFlow(shannonThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportShannonStageFlow(shannonThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Mathematics Mode
// ============================================================================

const mathematicsThought = {
  ...baseFields,
  id: 'math-1',
  mode: ThinkingMode.MATHEMATICS,
  content: 'Prove theorem',
  mathematicalContent: {
    theorems: [{ name: 'Test Theorem', statement: 'If P then Q', proof: 'By assumption' }],
    proofSteps: [
      { stepNumber: 1, statement: 'Assume P', justification: 'Hypothesis' },
      { stepNumber: 2, statement: 'Therefore Q', justification: 'Modus ponens' },
    ],
  },
} as any;

describe('Mathematics Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportMathematicsDerivation(mathematicsThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportMathematicsDerivation(mathematicsThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportMathematicsDerivation(mathematicsThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Physics Mode
// ============================================================================

const physicsThought = {
  ...baseFields,
  id: 'phys-1',
  mode: ThinkingMode.PHYSICS,
  content: 'Physics analysis',
  physicalSystem: {
    name: 'Pendulum',
    components: [{ name: 'mass', type: 'point mass' }],
    constraints: ['Conservation of energy'],
    equations: ['E = mgh'],
  },
} as any;

describe('Physics Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportPhysicsVisualization(physicsThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportPhysicsVisualization(physicsThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportPhysicsVisualization(physicsThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Hybrid Mode
// ============================================================================

const hybridThought = {
  ...baseFields,
  id: 'hybrid-1',
  mode: ThinkingMode.HYBRID,
  content: 'Hybrid reasoning',
  primaryMode: 'sequential',
  secondaryFeatures: ['causal-links', 'temporal-ordering'],
  hybridComponents: {
    activeModes: [ThinkingMode.SEQUENTIAL, ThinkingMode.CAUSAL],
    modeContributions: { sequential: 0.6, causal: 0.4 },
    integrationStrategy: 'parallel',
    synthesisApproach: 'weighted',
  },
} as any;

describe('Hybrid Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportHybridOrchestration(hybridThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportHybridOrchestration(hybridThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportHybridOrchestration(hybridThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Causal Mode
// ============================================================================

const causalThought = {
  ...baseFields,
  id: 'causal-1',
  mode: ThinkingMode.CAUSAL,
  content: 'Causal analysis',
  causalGraph: {
    nodes: [
      { id: 'c1', name: 'Cause', type: 'cause', description: 'Root cause' },
      { id: 'e1', name: 'Effect', type: 'effect', description: 'Final effect' },
    ],
    edges: [{ from: 'c1', to: 'e1', strength: 0.8, confidence: 0.9 }],
  },
  mechanisms: [],
} as any;

describe('Causal Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportCausalGraph(causalThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportCausalGraph(causalThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportCausalGraph(causalThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Temporal Mode
// ============================================================================

const temporalThought = {
  ...baseFields,
  id: 'temp-1',
  mode: ThinkingMode.TEMPORAL,
  content: 'Temporal analysis',
  timeline: {
    events: [
      { id: 'e1', time: '2025-01-01', description: 'Event 1', certainty: 1.0 },
      { id: 'e2', time: '2025-01-02', description: 'Event 2', certainty: 0.8 },
    ],
    relationships: [{ from: 'e1', to: 'e2', type: 'before', confidence: 0.9 }],
  },
} as any;

describe('Temporal Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportTemporalTimeline(temporalThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  // Temporal mode uses Gantt chart for Mermaid, not flowchart
  it('Mermaid format', () => {
    const result = exportTemporalTimeline(temporalThought, mermaidOptions);
    expect(result).toContain('gantt');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportTemporalTimeline(temporalThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Counterfactual Mode
// ============================================================================

const counterfactualThought = {
  ...baseFields,
  id: 'cf-1',
  mode: ThinkingMode.COUNTERFACTUAL,
  content: 'Counterfactual analysis',
  interventionPoint: { description: 'Change X to Y', impact: 'high' },
  scenarios: [
    {
      id: 's1',
      description: 'What if scenario',
      antecedent: 'If X had happened',
      consequent: 'Then Y would follow',
      plausibility: 0.7,
    },
  ],
  comparisons: [],
} as any;

describe('Counterfactual Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportCounterfactualScenarios(counterfactualThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportCounterfactualScenarios(counterfactualThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportCounterfactualScenarios(counterfactualThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Bayesian Mode
// ============================================================================

const bayesianThought = {
  ...baseFields,
  id: 'bayes-1',
  mode: ThinkingMode.BAYESIAN,
  content: 'Bayesian update',
  hypothesis: { id: 'h1', statement: 'Test hypothesis' },
  prior: { probability: 0.3, justification: 'Base rate' },
  likelihood: { probability: 0.8, description: 'P(E|H)' },
  evidence: [],
  posterior: { probability: 0.67, calculation: 'Bayes rule' },
} as any;

describe('Bayesian Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportBayesianNetwork(bayesianThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportBayesianNetwork(bayesianThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportBayesianNetwork(bayesianThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Evidential Mode
// ============================================================================

const evidentialThought = {
  ...baseFields,
  id: 'evid-1',
  mode: ThinkingMode.EVIDENTIAL,
  content: 'Evidence analysis',
  evidencePieces: [
    { id: 'ev1', description: 'Evidence 1', weight: 0.8, reliability: 0.9 },
  ],
  supportedHypotheses: [{ hypothesis: 'H1', supportScore: 0.75 }],
  conflictingEvidence: [],
} as any;

describe('Evidential Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportEvidentialBeliefs(evidentialThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportEvidentialBeliefs(evidentialThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportEvidentialBeliefs(evidentialThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Game Theory Mode
// ============================================================================

const gameTheoryThought = {
  ...baseFields,
  id: 'game-1',
  mode: ThinkingMode.GAMETHEORY,
  content: 'Game analysis',
  players: [
    { id: 'p1', name: 'Player 1', strategies: ['A', 'B'] },
    { id: 'p2', name: 'Player 2', strategies: ['X', 'Y'] },
  ],
  payoffMatrix: [[1, 2], [3, 4]],
  equilibria: [{ type: 'nash', strategies: { p1: 'A', p2: 'X' } }],
} as any;

describe('Game Theory Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportGameTree(gameTheoryThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportGameTree(gameTheoryThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportGameTree(gameTheoryThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Optimization Mode
// ============================================================================

const optimizationThought = {
  ...baseFields,
  id: 'opt-1',
  mode: ThinkingMode.OPTIMIZATION,
  content: 'Optimization problem',
  objectiveFunction: 'maximize f(x)',
  constraints: ['x >= 0'],
  variables: [{ name: 'x', type: 'continuous', bounds: [0, 100] }],
  currentSolution: { x: 50 },
  optimality: 0.95,
} as any;

describe('Optimization Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportOptimizationSolution(optimizationThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportOptimizationSolution(optimizationThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportOptimizationSolution(optimizationThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Abductive Mode
// ============================================================================

const abductiveThought = {
  ...baseFields,
  id: 'abd-1',
  mode: ThinkingMode.ABDUCTIVE,
  content: 'Abductive reasoning',
  observations: ['Observation 1', 'Observation 2'],
  hypotheses: [
    { id: 'h1', description: 'Hypothesis 1', plausibility: 0.8, explanatoryPower: 0.9 },
  ],
  bestExplanation: 'Hypothesis 1',
} as any;

describe('Abductive Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportAbductiveHypotheses(abductiveThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportAbductiveHypotheses(abductiveThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportAbductiveHypotheses(abductiveThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Analogical Mode
// ============================================================================

const analogicalThought = {
  ...baseFields,
  id: 'ana-1',
  mode: ThinkingMode.ANALOGICAL,
  content: 'Analogical reasoning',
  sourceDomain: { name: 'Source', elements: ['A', 'B'], relations: [{ from: 'A', to: 'B', type: 'causes' }] },
  targetDomain: { name: 'Target', elements: ['X', 'Y'], relations: [] },
  mappings: [{ source: 'A', target: 'X', strength: 0.9, justification: 'Similar role' }],
  insights: ['Insight from analogy'],
} as any;

describe('Analogical Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportAnalogicalMapping(analogicalThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportAnalogicalMapping(analogicalThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportAnalogicalMapping(analogicalThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// First Principles Mode
// ============================================================================

const firstPrinciplesThought = {
  ...baseFields,
  id: 'fp-1',
  mode: ThinkingMode.FIRSTPRINCIPLES,
  content: 'First principles analysis',
  fundamentalPrinciples: [
    { id: 'p1', statement: 'Principle 1', domain: 'general', certainty: 1.0 },
  ],
  derivationSteps: [
    { stepNumber: 1, statement: 'From principle 1', fromPrinciples: ['p1'], justification: 'Direct' },
  ],
  derivedConclusion: { statement: 'Conclusion', confidence: 0.9 },
} as any;

describe('First Principles Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportFirstPrinciplesDerivation(firstPrinciplesThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportFirstPrinciplesDerivation(firstPrinciplesThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportFirstPrinciplesDerivation(firstPrinciplesThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Meta Reasoning Mode
// ============================================================================

const metaReasoningThought = {
  ...baseFields,
  id: 'meta-1',
  mode: ThinkingMode.METAREASONING,
  content: 'Meta reasoning',
  currentStrategy: { name: 'Strategy 1', effectiveness: 0.8, description: 'Test strategy' },
  strategyEvaluation: { accuracy: 0.9, efficiency: 0.85, appropriateness: 0.8 },
  adaptations: [],
} as any;

describe('Meta Reasoning Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportMetaReasoningVisualization(metaReasoningThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportMetaReasoningVisualization(metaReasoningThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportMetaReasoningVisualization(metaReasoningThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Systems Thinking Mode
// ============================================================================

const systemsThinkingThought = {
  ...baseFields,
  id: 'sys-1',
  mode: ThinkingMode.SYSTEMSTHINKING,
  content: 'Systems analysis',
  systemModel: {
    stocks: [{ id: 's1', name: 'Population', initialValue: 1000 }],
    flows: [{ id: 'f1', name: 'Birth Rate', from: null, to: 's1', rate: 0.02 }],
    feedbackLoops: [{ id: 'loop1', type: 'reinforcing', elements: ['s1', 'f1'] }],
  },
  emergentProperties: ['Property 1'],
  interventionPoints: [],
} as any;

describe('Systems Thinking Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportSystemsThinkingCausalLoops(systemsThinkingThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportSystemsThinkingCausalLoops(systemsThinkingThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportSystemsThinkingCausalLoops(systemsThinkingThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Scientific Method Mode
// ============================================================================

const scientificMethodThought = {
  ...baseFields,
  id: 'sci-1',
  mode: ThinkingMode.SCIENTIFICMETHOD,
  content: 'Scientific method',
  hypothesis: { statement: 'Test hypothesis', testable: true, falsifiable: true },
  experimentDesign: { methodology: 'Controlled', variables: { independent: ['x'], dependent: ['y'], controlled: ['z'] } },
  observations: [{ id: 'o1', description: 'Observation 1', value: 42 }],
  analysis: { method: 'Statistical', results: 'Significant' },
  conclusion: { statement: 'Hypothesis supported', confidence: 0.95 },
} as any;

describe('Scientific Method Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportScientificMethodExperiment(scientificMethodThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportScientificMethodExperiment(scientificMethodThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportScientificMethodExperiment(scientificMethodThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Formal Logic Mode
// ============================================================================

const formalLogicThought = {
  ...baseFields,
  id: 'logic-1',
  mode: ThinkingMode.FORMALLOGIC,
  content: 'Formal logic proof',
  premises: [
    { id: 'p1', statement: 'All A are B', type: 'universal' },
    { id: 'p2', statement: 'x is A', type: 'particular' },
  ],
  derivationSteps: [
    { stepNumber: 1, statement: 'x is B', justification: 'Universal instantiation', fromPremises: ['p1', 'p2'] },
  ],
  conclusion: { statement: 'x is B', validityStatus: 'valid' },
} as any;

describe('Formal Logic Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportFormalLogicProof(formalLogicThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportFormalLogicProof(formalLogicThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportFormalLogicProof(formalLogicThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Engineering Mode
// ============================================================================

const engineeringThought = {
  ...baseFields,
  id: 'eng-1',
  mode: ThinkingMode.ENGINEERING,
  content: 'Engineering analysis',
  analysisType: 'system',
  designChallenge: 'Build a scalable architecture',
  requirements: {
    requirements: [
      { id: 'r1', title: 'Requirement 1', description: 'Desc 1', priority: 'high', type: 'functional', status: 'verified' },
    ],
  },
  designDecisions: {
    decisions: [
      { id: 'd1', description: 'Decision 1', rationale: 'Best option', tradeoffs: [] },
    ],
  },
  constraints: ['Budget limit', 'Time constraint'],
  implementation: { status: 'in_progress', completeness: 0.5 },
} as any;

describe('Engineering Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportEngineeringAnalysis(engineeringThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportEngineeringAnalysis(engineeringThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportEngineeringAnalysis(engineeringThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Computability Mode
// ============================================================================

const computabilityThought = {
  ...baseFields,
  id: 'comp-1',
  mode: ThinkingMode.COMPUTABILITY,
  content: 'Computability analysis',
  problemClass: 'decidable',
  turingMachines: [
    {
      id: 'tm1',
      name: 'Test TM',
      states: ['q0', 'q1', 'halt'],
      alphabet: ['0', '1', 'B'],
      transitions: [{ from: 'q0', read: '0', write: '1', move: 'R', to: 'q1' }],
      initialState: 'q0',
      acceptStates: ['halt'],
    },
  ],
  complexityAnalysis: { timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
} as any;

describe('Computability Mode Exporter Snapshots', () => {
  it('DOT format', () => {
    const result = exportComputability(computabilityThought, dotOptions);
    expect(result).toContain('digraph');
    expect(result).toMatchSnapshot();
  });

  it('Mermaid format', () => {
    const result = exportComputability(computabilityThought, mermaidOptions);
    expect(result).toContain('graph');
    expect(result).toMatchSnapshot();
  });

  it('ASCII format', () => {
    const result = exportComputability(computabilityThought, asciiOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});
