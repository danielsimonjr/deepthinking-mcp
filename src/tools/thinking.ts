/**
 * Unified thinking tool for DeepThinking MCP v3.2.0
 * Supports 18 thinking modes
 */

import { z } from 'zod';

/**
 * Zod schema for runtime validation (internal use)
 */
export const ThinkingToolSchema = z.object({
  sessionId: z.string().optional(),
  mode: z.enum(['sequential', 'shannon', 'mathematics', 'physics', 'hybrid', 'abductive', 'causal', 'bayesian', 'counterfactual', 'analogical', 'temporal', 'gametheory', 'evidential', 'firstprinciples', 'systemsthinking', 'scientificmethod', 'optimization', 'formallogic']).default('hybrid'),
  thought: z.string(),
  thoughtNumber: z.number().int().positive(),
  totalThoughts: z.number().int().positive(),
  nextThoughtNeeded: z.boolean(),
  isRevision: z.boolean().optional(),
  revisesThought: z.string().optional(),
  revisionReason: z.string().optional(),
  branchFrom: z.string().optional(),
  branchId: z.string().optional(),
  stage: z.enum(['problem_definition', 'constraints', 'model', 'proof', 'implementation']).optional(),
  uncertainty: z.number().min(0).max(1).optional(),
  dependencies: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
  thoughtType: z.string().optional(),
  mathematicalModel: z.object({
    latex: z.string(),
    symbolic: z.string(),
    ascii: z.string().optional(),
  }).optional(),
  proofStrategy: z.object({
    type: z.enum(['direct', 'contradiction', 'induction', 'construction', 'contrapositive']),
    steps: z.array(z.string()),
  }).optional(),
  tensorProperties: z.object({
    rank: z.tuple([z.number(), z.number()]),
    components: z.string(),
    latex: z.string(),
    symmetries: z.array(z.string()),
    invariants: z.array(z.string()),
    transformation: z.enum(['covariant', 'contravariant', 'mixed']),
  }).optional(),
  physicalInterpretation: z.object({
    quantity: z.string(),
    units: z.string(),
    conservationLaws: z.array(z.string()),
  }).optional(),
  // Abductive reasoning properties (v2.0)
  observations: z.array(z.object({
    id: z.string(),
    description: z.string(),
    confidence: z.number().min(0).max(1),
  })).optional(),
  hypotheses: z.array(z.object({
    id: z.string(),
    // Abductive fields
    explanation: z.string().optional(),
    assumptions: z.array(z.string()).optional(),
    predictions: z.array(z.string()).optional(),
    score: z.number().optional(),
    // Evidential fields
    name: z.string().optional(),
    description: z.string().optional(),
    mutuallyExclusive: z.boolean().optional(),
    subsets: z.array(z.string()).optional(),
  })).optional(),
  evaluationCriteria: z.object({
    parsimony: z.number(),
    explanatoryPower: z.number(),
    plausibility: z.number(),
    testability: z.boolean(),
  }).optional(),
  evidence: z.array(z.object({
    id: z.string(),
    description: z.string(),
    // Abductive fields
    hypothesisId: z.string().optional(),
    type: z.enum(['supporting', 'contradicting', 'neutral']).optional(),
    strength: z.number().min(0).max(1).optional(),
    // Evidential fields
    source: z.string().optional(),
    reliability: z.number().min(0).max(1).optional(),
    timestamp: z.number().optional(),
    supports: z.array(z.string()).optional(),
    contradicts: z.array(z.string()).optional(),
  })).optional(),
  bestExplanation: z.object({
    id: z.string(),
    explanation: z.string(),
    assumptions: z.array(z.string()),
    predictions: z.array(z.string()),
    score: z.number(),
  }).optional(),
  // Causal reasoning properties (v2.0)
  causalGraph: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['cause', 'effect', 'mediator', 'confounder']),
      description: z.string(),
    })),
    edges: z.array(z.object({
      from: z.string(),
      to: z.string(),
      strength: z.number(),
      confidence: z.number().min(0).max(1),
    })),
  }).optional(),
  interventions: z.array(z.object({
    nodeId: z.string(),
    action: z.string(),
    expectedEffects: z.array(z.object({
      nodeId: z.string(),
      expectedChange: z.string(),
      confidence: z.number(),
    })),
  })).optional(),
  mechanisms: z.array(z.object({
    from: z.string(),
    to: z.string(),
    description: z.string(),
    type: z.enum(['direct', 'indirect', 'feedback']),
  })).optional(),
  confounders: z.array(z.object({
    nodeId: z.string(),
    affects: z.array(z.string()),
    description: z.string(),
  })).optional(),
  // Bayesian reasoning properties (v2.0)
  hypothesis: z.object({
    id: z.string(),
    statement: z.string(),
  }).optional(),
  prior: z.object({
    probability: z.number().min(0).max(1),
    justification: z.string(),
  }).optional(),
  likelihood: z.object({
    probability: z.number().min(0).max(1),
    description: z.string(),
  }).optional(),
  posterior: z.object({
    probability: z.number().min(0).max(1),
    calculation: z.string(),
  }).optional(),
  bayesFactor: z.number().optional(),
  // Counterfactual reasoning properties (v2.0)
  actual: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    conditions: z.array(z.object({
      factor: z.string(),
      value: z.string(),
    })),
    outcomes: z.array(z.object({
      description: z.string(),
      impact: z.enum(['positive', 'negative', 'neutral']),
      magnitude: z.number().optional(),
    })),
  }).optional(),
  counterfactuals: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    conditions: z.array(z.object({
      factor: z.string(),
      value: z.string(),
    })),
    outcomes: z.array(z.object({
      description: z.string(),
      impact: z.enum(['positive', 'negative', 'neutral']),
      magnitude: z.number().optional(),
    })),
  })).optional(),
  comparison: z.object({
    differences: z.array(z.object({
      aspect: z.string(),
      actual: z.string(),
      counterfactual: z.string(),
      significance: z.enum(['high', 'medium', 'low']),
    })),
    insights: z.array(z.string()),
    lessons: z.array(z.string()),
  }).optional(),
  interventionPoint: z.object({
    description: z.string(),
    alternatives: z.array(z.string()),
  }).optional(),
  causalChains: z.array(z.object({
    intervention: z.string(),
    steps: z.array(z.string()),
    finalOutcome: z.string(),
  })).optional(),
  // Analogical reasoning properties (v2.0)
  sourceDomain: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    entities: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
    })),
    relations: z.array(z.object({
      id: z.string(),
      type: z.string(),
      from: z.string(),
      to: z.string(),
    })),
  }).optional(),
  targetDomain: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    entities: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
    })),
    relations: z.array(z.object({
      id: z.string(),
      type: z.string(),
      from: z.string(),
      to: z.string(),
    })),
  }).optional(),
  mapping: z.array(z.object({
    sourceEntityId: z.string(),
    targetEntityId: z.string(),
    justification: z.string(),
    confidence: z.number().min(0).max(1),
  })).optional(),
  insights: z.array(z.object({
    description: z.string(),
    sourceEvidence: z.string(),
    targetApplication: z.string(),
  })).optional(),
  inferences: z.array(z.object({
    sourcePattern: z.string(),
    targetPrediction: z.string(),
    confidence: z.number().min(0).max(1),
    needsVerification: z.boolean(),
  })).optional(),
  limitations: z.array(z.string()).optional(),
  analogyStrength: z.number().min(0).max(1).optional(),
  // Temporal reasoning properties (Phase 3, v2.1)
  timeline: z.object({
    id: z.string(),
    name: z.string(),
    timeUnit: z.enum(['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'months', 'years']),
    startTime: z.number().optional(),
    endTime: z.number().optional(),
    events: z.array(z.string()),
  }).optional(),
  events: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    timestamp: z.number(),
    duration: z.number().optional(),
    type: z.enum(['instant', 'interval']),
    properties: z.record(z.any()),
  })).optional(),
  intervals: z.array(z.object({
    id: z.string(),
    name: z.string(),
    start: z.number(),
    end: z.number(),
    overlaps: z.array(z.string()).optional(),
    contains: z.array(z.string()).optional(),
  })).optional(),
  constraints: z.array(z.object({
    id: z.string(),
    type: z.enum(['before', 'after', 'during', 'overlaps', 'meets', 'starts', 'finishes', 'equals']),
    subject: z.string(),
    object: z.string(),
    confidence: z.number().min(0).max(1),
  })).optional(),
  relations: z.array(z.object({
    id: z.string(),
    from: z.string(),
    to: z.string(),
    relationType: z.enum(['causes', 'enables', 'prevents', 'precedes', 'follows']),
    strength: z.number().min(0).max(1),
    delay: z.number().optional(),
  })).optional(),
  // Game theory properties (Phase 3, v2.2)
  game: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['normal_form', 'extensive_form', 'cooperative', 'non_cooperative']),
    numPlayers: z.number().int().min(2),
    isZeroSum: z.boolean(),
    isPerfectInformation: z.boolean(),
  }).optional(),
  players: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string().optional(),
    isRational: z.boolean(),
    availableStrategies: z.array(z.string()),
  })).optional(),
  strategies: z.array(z.object({
    id: z.string(),
    playerId: z.string(),
    name: z.string(),
    description: z.string(),
    isPure: z.boolean(),
    probability: z.number().min(0).max(1).optional(),
  })).optional(),
  payoffMatrix: z.object({
    players: z.array(z.string()),
    dimensions: z.array(z.number()),
    payoffs: z.array(z.object({
      strategyProfile: z.array(z.string()),
      payoffs: z.array(z.number()),
    })),
  }).optional(),
  nashEquilibria: z.array(z.object({
    id: z.string(),
    strategyProfile: z.array(z.string()),
    payoffs: z.array(z.number()),
    type: z.enum(['pure', 'mixed']),
    isStrict: z.boolean(),
    stability: z.number().min(0).max(1),
  })).optional(),
  dominantStrategies: z.array(z.object({
    playerId: z.string(),
    strategyId: z.string(),
    type: z.enum(['strictly_dominant', 'weakly_dominant']),
    dominatesStrategies: z.array(z.string()),
    justification: z.string(),
  })).optional(),
  gameTree: z.object({
    rootNode: z.string(),
    nodes: z.array(z.object({
      id: z.string(),
      type: z.enum(['decision', 'chance', 'terminal']),
      playerId: z.string().optional(),
      parentNode: z.string().optional(),
      childNodes: z.array(z.string()),
      action: z.string().optional(),
      probability: z.number().min(0).max(1).optional(),
      payoffs: z.array(z.number()).optional(),
    })),
    informationSets: z.array(z.object({
      id: z.string(),
      playerId: z.string(),
      nodes: z.array(z.string()),
      availableActions: z.array(z.string()),
    })).optional(),
  }).optional(),

  // Evidential properties (Phase 3, v2.3)
  frameOfDiscernment: z.array(z.string()).optional(),
  beliefFunctions: z.array(z.object({
    id: z.string(),
    source: z.string(),
    massAssignments: z.array(z.object({
      hypothesisSet: z.array(z.string()),
      mass: z.number().min(0).max(1),
      justification: z.string(),
    })),
    conflictMass: z.number().optional(),
  })).optional(),
  combinedBelief: z.object({
    id: z.string(),
    source: z.string(),
    massAssignments: z.array(z.object({
      hypothesisSet: z.array(z.string()),
      mass: z.number().min(0).max(1),
      justification: z.string(),
    })),
    conflictMass: z.number().optional(),
  }).optional(),
  plausibility: z.object({
    id: z.string(),
    assignments: z.array(z.object({
      hypothesisSet: z.array(z.string()),
      plausibility: z.number().min(0).max(1),
      belief: z.number().min(0).max(1),
      uncertaintyInterval: z.tuple([z.number(), z.number()]),
    })),
  }).optional(),
  decisions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    selectedHypothesis: z.array(z.string()),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    alternatives: z.array(z.object({
      hypothesis: z.array(z.string()),
      expectedUtility: z.number(),
      risk: z.number(),
    })),
  })).optional(),
  // First-Principles properties (Phase 3, v3.1.0)
  question: z.string().optional(),
  principles: z.array(z.object({
    id: z.string(),
    type: z.enum(['axiom', 'definition', 'observation', 'logical_inference', 'assumption']),
    statement: z.string(),
    justification: z.string(),
    dependsOn: z.array(z.string()).optional(),
    confidence: z.number().min(0).max(1).optional(),
  })).optional(),
  derivationSteps: z.array(z.object({
    stepNumber: z.number().int().positive(),
    principle: z.string(),
    inference: z.string(),
    logicalForm: z.string().optional(),
    confidence: z.number().min(0).max(1),
  })).optional(),
  conclusion: z.object({
    statement: z.string(),
    derivationChain: z.array(z.number()),
    certainty: z.number().min(0).max(1),
    limitations: z.array(z.string()).optional(),
  }).optional(),
  alternativeInterpretations: z.array(z.string()).optional(),

  // Systems Thinking properties (Phase 4, v3.2.0)
  system: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    boundary: z.string(),
    purpose: z.string(),
    timeHorizon: z.string().optional(),
  }).optional(),
  components: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['stock', 'flow', 'variable', 'parameter', 'delay']),
    description: z.string(),
    unit: z.string().optional(),
    initialValue: z.number().optional(),
    formula: z.string().optional(),
    influencedBy: z.array(z.string()).optional(),
  })).optional(),
  feedbackLoops: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['reinforcing', 'balancing']),
    description: z.string(),
    components: z.array(z.string()),
    polarity: z.enum(['+', '-']),
    strength: z.number().min(0).max(1),
    delay: z.number().optional(),
    dominance: z.enum(['early', 'middle', 'late']).optional(),
  })).optional(),
  leveragePoints: z.array(z.object({
    id: z.string(),
    name: z.string(),
    location: z.string(),
    description: z.string(),
    effectiveness: z.number().min(0).max(1),
    difficulty: z.number().min(0).max(1),
    type: z.enum(['parameter', 'feedback', 'structure', 'goal', 'paradigm']),
    interventionExamples: z.array(z.string()),
  })).optional(),
  behaviors: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    pattern: z.enum(['growth', 'decline', 'oscillation', 'equilibrium', 'chaos', 'overshoot_collapse']),
    causes: z.array(z.string()),
    timeframe: z.string(),
    unintendedConsequences: z.array(z.string()).optional(),
  })).optional(),

  // Scientific Method properties (Phase 4, v3.2.0)
  researchQuestion: z.object({
    id: z.string(),
    question: z.string(),
    background: z.string(),
    rationale: z.string(),
    significance: z.string(),
    variables: z.object({
      independent: z.array(z.string()),
      dependent: z.array(z.string()),
      control: z.array(z.string()),
    }),
  }).optional(),
  scientificHypotheses: z.array(z.object({
    id: z.string(),
    type: z.enum(['null', 'alternative', 'directional', 'non_directional']),
    statement: z.string(),
    prediction: z.string(),
    rationale: z.string(),
    testable: z.boolean(),
    falsifiable: z.boolean(),
  })).optional(),
  experiment: z.object({
    id: z.string(),
    type: z.enum(['experimental', 'quasi_experimental', 'observational', 'correlational']),
    design: z.string(),
    sampleSize: z.number().int().positive(),
    sampleSizeJustification: z.string().optional(),
    randomization: z.boolean(),
    blinding: z.enum(['none', 'single', 'double', 'triple']).optional(),
    controls: z.array(z.string()),
    procedure: z.array(z.string()),
    materials: z.array(z.string()).optional(),
    duration: z.string().optional(),
    ethicalConsiderations: z.array(z.string()).optional(),
  }).optional(),
  dataCollection: z.object({
    id: z.string(),
    method: z.array(z.string()),
    instruments: z.array(z.string()),
    dataQuality: z.object({
      completeness: z.number().min(0).max(1),
      reliability: z.number().min(0).max(1),
      validity: z.number().min(0).max(1),
    }),
    limitations: z.array(z.string()).optional(),
  }).optional(),
  statisticalAnalysis: z.object({
    id: z.string(),
    tests: z.array(z.object({
      id: z.string(),
      name: z.string(),
      hypothesisTested: z.string(),
      testStatistic: z.number(),
      pValue: z.number().min(0).max(1),
      confidenceInterval: z.tuple([z.number(), z.number()]).optional(),
      alpha: z.number().min(0).max(1),
      result: z.enum(['reject_null', 'fail_to_reject_null']),
      interpretation: z.string(),
    })),
    summary: z.string(),
    effectSize: z.object({
      type: z.string(),
      value: z.number(),
      interpretation: z.string(),
    }).optional(),
    powerAnalysis: z.object({
      power: z.number().min(0).max(1),
      alpha: z.number().min(0).max(1),
      interpretation: z.string(),
    }).optional(),
  }).optional(),
  scientificConclusion: z.object({
    id: z.string(),
    statement: z.string(),
    supportedHypotheses: z.array(z.string()),
    rejectedHypotheses: z.array(z.string()),
    confidence: z.number().min(0).max(1),
    limitations: z.array(z.string()),
    alternativeExplanations: z.array(z.string()).optional(),
    futureDirections: z.array(z.string()),
    replicationConsiderations: z.array(z.string()),
    practicalImplications: z.array(z.string()).optional(),
    theoreticalImplications: z.array(z.string()).optional(),
  }).optional(),

  // Optimization properties (Phase 4, v3.2.0)
  optimizationProblem: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['linear', 'nonlinear', 'integer', 'mixed_integer', 'constraint_satisfaction', 'multi_objective']),
    approach: z.enum(['exact', 'heuristic', 'metaheuristic', 'approximation']).optional(),
    complexity: z.string().optional(),
  }).optional(),
  decisionVariables: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['continuous', 'integer', 'binary', 'categorical']),
    unit: z.string().optional(),
    semantics: z.string(),
  })).optional(),
  optimizationConstraints: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['hard', 'soft']),
    formula: z.string(),
    variables: z.array(z.string()),
    penalty: z.number().optional(),
    rationale: z.string(),
    priority: z.number().optional(),
  })).optional(),
  objectives: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['minimize', 'maximize']),
    formula: z.string(),
    variables: z.array(z.string()),
    weight: z.number().min(0).max(1).optional(),
    units: z.string().optional(),
    idealValue: z.number().optional(),
    acceptableRange: z.tuple([z.number(), z.number()]).optional(),
  })).optional(),
  solution: z.object({
    id: z.string(),
    type: z.enum(['optimal', 'feasible', 'infeasible', 'unbounded', 'approximate']),
    variableValues: z.record(z.union([z.number(), z.string()])),
    objectiveValues: z.record(z.number()),
    quality: z.number().min(0).max(1),
    computationTime: z.number().optional(),
    iterations: z.number().optional(),
    method: z.string().optional(),
    guarantees: z.array(z.string()).optional(),
  }).optional(),
  sensitivityAnalysis: z.object({
    id: z.string(),
    robustness: z.number().min(0).max(1),
    criticalConstraints: z.array(z.string()),
    shadowPrices: z.record(z.number()).optional(),
    recommendations: z.array(z.string()),
  }).optional(),

  // Formal Logic properties (Phase 4, v3.2.0)
  propositions: z.array(z.object({
    id: z.string(),
    symbol: z.string(),
    statement: z.string(),
    truthValue: z.boolean().optional(),
    type: z.enum(['atomic', 'compound']),
    formula: z.string().optional(),
  })).optional(),
  logicalInferences: z.array(z.object({
    id: z.string(),
    rule: z.enum(['modus_ponens', 'modus_tollens', 'hypothetical_syllogism', 'disjunctive_syllogism', 'conjunction', 'simplification', 'addition', 'resolution', 'contradiction', 'excluded_middle']),
    premises: z.array(z.string()),
    conclusion: z.string(),
    justification: z.string(),
    valid: z.boolean(),
  })).optional(),
  logicalProof: z.object({
    id: z.string(),
    theorem: z.string(),
    technique: z.enum(['direct', 'contradiction', 'contrapositive', 'cases', 'induction', 'natural_deduction', 'resolution', 'semantic_tableaux']),
    steps: z.array(z.object({
      stepNumber: z.number().int().positive(),
      statement: z.string(),
      formula: z.string().optional(),
      justification: z.string(),
      rule: z.enum(['modus_ponens', 'modus_tollens', 'hypothetical_syllogism', 'disjunctive_syllogism', 'conjunction', 'simplification', 'addition', 'resolution', 'contradiction', 'excluded_middle']).optional(),
      referencesSteps: z.array(z.number()).optional(),
      isAssumption: z.boolean().optional(),
      dischargesAssumption: z.number().optional(),
    })),
    conclusion: z.string(),
    valid: z.boolean(),
    completeness: z.number().min(0).max(1),
    assumptions: z.array(z.string()).optional(),
  }).optional(),
  truthTable: z.object({
    id: z.string(),
    propositions: z.array(z.string()),
    formula: z.string().optional(),
    rows: z.array(z.object({
      rowNumber: z.number().int().positive(),
      assignments: z.record(z.boolean()),
      result: z.boolean(),
    })),
    isTautology: z.boolean(),
    isContradiction: z.boolean(),
    isContingent: z.boolean(),
  }).optional(),
  satisfiability: z.object({
    id: z.string(),
    formula: z.string(),
    satisfiable: z.boolean(),
    model: z.record(z.boolean()).optional(),
    method: z.enum(['dpll', 'cdcl', 'resolution', 'truth_table', 'other']),
    complexity: z.string().optional(),
    explanation: z.string(),
  }).optional(),

  action: z.enum(['add_thought', 'summarize', 'export', 'switch_mode', 'get_session', 'recommend_mode']).default('add_thought'),
  exportFormat: z.enum(['markdown', 'latex', 'json', 'html', 'jupyter', 'mermaid', 'dot', 'ascii']).optional(),
  newMode: z.enum(['sequential', 'shannon', 'mathematics', 'physics', 'hybrid', 'abductive', 'causal', 'bayesian', 'counterfactual', 'analogical', 'temporal', 'gametheory', 'evidential', 'firstprinciples', 'systemsthinking', 'scientificmethod', 'optimization', 'formallogic']).optional(),
  // Mode recommendation parameters (v2.4)
  problemType: z.string().optional(),
  problemCharacteristics: z.object({
    domain: z.string(),
    complexity: z.enum(['low', 'medium', 'high']),
    uncertainty: z.enum(['low', 'medium', 'high']),
    timeDependent: z.boolean(),
    multiAgent: z.boolean(),
    requiresProof: z.boolean(),
    requiresQuantification: z.boolean(),
    hasIncompleteInfo: z.boolean(),
    requiresExplanation: z.boolean(),
    hasAlternatives: z.boolean(),
  }).optional(),
  includeCombinations: z.boolean().optional(),
});

export type ThinkingToolInput = z.infer<typeof ThinkingToolSchema>;

/**
 * Tool definition using plain JSON Schema (MCP standard format)
 */
export const thinkingTool = {
  name: 'deepthinking',
  description: `Advanced deep thinking tool supporting 13 reasoning modes:

Core Modes:
- sequential: Iterative refinement and exploration
- shannon: Systematic 5-stage problem-solving
- mathematics: Theorem proving and symbolic reasoning
- physics: Tensor mathematics and field theory
- hybrid: Intelligently combines multiple approaches

Advanced Modes (v2.0):
- abductive: Inference to the best explanation, hypothesis generation
- causal: Cause-effect analysis with causal graphs
- bayesian: Probabilistic reasoning with evidence updates
- counterfactual: What-if scenario analysis
- analogical: Cross-domain pattern matching and insights

Phase 3 Modes (v2.1+):
- temporal: Event timelines, temporal constraints, causal relations over time
- gametheory: Nash equilibria, strategic analysis, payoff matrices
- evidential: Dempster-Shafer theory, belief functions, evidence combination

Actions:
- add_thought: Add a new thought to the session (default)
- summarize: Generate a summary of the session
- export: Export session in various formats (markdown, latex, json, html, jupyter, mermaid, dot, ascii)
- switch_mode: Change reasoning mode mid-session
- get_session: Retrieve session information
- recommend_mode: Get intelligent mode recommendations based on problem characteristics

Mode Recommendations (v2.4):
Use action 'recommend_mode' with either:
  • problemType: Quick recommendation (e.g., 'debugging', 'proof', 'timeline', 'strategy')
  • problemCharacteristics: Detailed analysis with 10 dimensions (domain, complexity, uncertainty, etc.)
  • includeCombinations: Set to true for synergistic mode combination suggestions

Choose the mode that best fits your problem type, or use recommend_mode to get intelligent suggestions.`,
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "Session ID (creates new if omitted)"
      },
      mode: {
        type: "string",
        enum: ["sequential", "shannon", "mathematics", "physics", "hybrid", "abductive", "causal", "bayesian", "counterfactual", "analogical", "temporal", "gametheory", "evidential"],
        description: "Thinking mode to use"
      },
      thought: {
        type: "string",
        description: "The thought content"
      },
      thoughtNumber: {
        type: "integer",
        minimum: 1,
        description: "Position in sequence"
      },
      totalThoughts: {
        type: "integer",
        minimum: 1,
        description: "Estimated total thoughts"
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Should thinking continue?"
      },
      isRevision: {
        type: "boolean",
        description: "Whether this revises previous thinking"
      },
      revisesThought: {
        type: "string",
        description: "Which thought is being reconsidered"
      },
      revisionReason: {
        type: "string",
        description: "Reason for revision"
      },
      branchFrom: {
        type: "string",
        description: "Branching point thought"
      },
      branchId: {
        type: "string",
        description: "Branch identifier"
      },
      stage: {
        type: "string",
        enum: ["problem_definition", "constraints", "model", "proof", "implementation"],
        description: "Shannon methodology stage"
      },
      uncertainty: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Uncertainty level (0-1)"
      },
      dependencies: {
        type: "array",
        items: { type: "string" },
        description: "Dependencies on other thoughts"
      },
      assumptions: {
        type: "array",
        items: { type: "string" },
        description: "Assumptions made"
      },
      thoughtType: {
        type: "string",
        description: "Type of mathematical thought"
      },
      mathematicalModel: {
        type: "object",
        properties: {
          latex: { type: "string", description: "LaTeX representation" },
          symbolic: { type: "string", description: "Symbolic representation" },
          ascii: { type: "string", description: "ASCII representation" }
        },
        required: ["latex", "symbolic"]
      },
      proofStrategy: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["direct", "contradiction", "induction", "construction", "contrapositive"]
          },
          steps: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["type", "steps"]
      },
      tensorProperties: {
        type: "object",
        properties: {
          rank: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2
          },
          components: { type: "string" },
          latex: { type: "string" },
          symmetries: {
            type: "array",
            items: { type: "string" }
          },
          invariants: {
            type: "array",
            items: { type: "string" }
          },
          transformation: {
            type: "string",
            enum: ["covariant", "contravariant", "mixed"]
          }
        },
        required: ["rank", "components", "latex", "symmetries", "invariants", "transformation"]
      },
      physicalInterpretation: {
        type: "object",
        properties: {
          quantity: { type: "string" },
          units: { type: "string" },
          conservationLaws: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["quantity", "units", "conservationLaws"]
      },
      // Temporal reasoning properties (Phase 3, v2.1)
      timeline: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          timeUnit: {
            type: "string",
            enum: ["milliseconds", "seconds", "minutes", "hours", "days", "months", "years"],
            description: "Time unit for the timeline"
          },
          startTime: { type: "number", description: "Optional start time" },
          endTime: { type: "number", description: "Optional end time" },
          events: {
            type: "array",
            items: { type: "string" },
            description: "Event IDs in this timeline"
          }
        },
        required: ["id", "name", "timeUnit", "events"],
        description: "Timeline structure for temporal reasoning"
      },
      events: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            timestamp: { type: "number", description: "Event timestamp" },
            duration: { type: "number", description: "Duration for interval events" },
            type: {
              type: "string",
              enum: ["instant", "interval"],
              description: "Event type"
            },
            properties: {
              type: "object",
              description: "Additional event properties"
            }
          },
          required: ["id", "name", "description", "timestamp", "type", "properties"]
        },
        description: "Temporal events"
      },
      intervals: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            start: { type: "number", description: "Interval start time" },
            end: { type: "number", description: "Interval end time" },
            overlaps: {
              type: "array",
              items: { type: "string" },
              description: "IDs of overlapping intervals"
            },
            contains: {
              type: "array",
              items: { type: "string" },
              description: "IDs of contained intervals"
            }
          },
          required: ["id", "name", "start", "end"]
        },
        description: "Time intervals with Allen's algebra relationships"
      },
      constraints: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: {
              type: "string",
              enum: ["before", "after", "during", "overlaps", "meets", "starts", "finishes", "equals"],
              description: "Allen's interval algebra constraint type"
            },
            subject: { type: "string", description: "Subject event/interval ID" },
            object: { type: "string", description: "Object event/interval ID" },
            confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Confidence in constraint (0-1)"
            }
          },
          required: ["id", "type", "subject", "object", "confidence"]
        },
        description: "Temporal constraints using Allen's interval algebra"
      },
      relations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            from: { type: "string", description: "Source event ID" },
            to: { type: "string", description: "Target event ID" },
            relationType: {
              type: "string",
              enum: ["causes", "enables", "prevents", "precedes", "follows"],
              description: "Type of temporal relation"
            },
            strength: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Relation strength (0-1)"
            },
            delay: { type: "number", description: "Optional time delay between events" }
          },
          required: ["id", "from", "to", "relationType", "strength"]
        },
        description: "Temporal causal/enabling relations"
      },
      // Game theory properties (Phase 3, v2.2)
      players: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            role: { type: "string" },
            isRational: { type: "boolean" },
            availableStrategies: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["id", "name", "isRational", "availableStrategies"]
        },
        description: "Players in the game"
      },
      strategies: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            playerId: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            isPure: { type: "boolean" },
            probability: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["id", "playerId", "name", "description", "isPure"]
        },
        description: "Available strategies"
      },
      payoffMatrix: {
        type: "object",
        properties: {
          players: {
            type: "array",
            items: { type: "string" }
          },
          dimensions: {
            type: "array",
            items: { type: "number" }
          },
          payoffs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strategyProfile: {
                  type: "array",
                  items: { type: "string" }
                },
                payoffs: {
                  type: "array",
                  items: { type: "number" }
                }
              },
              required: ["strategyProfile", "payoffs"]
            }
          }
        },
        required: ["players", "dimensions", "payoffs"],
        description: "Payoff matrix for the game"
      },
      // Evidential reasoning properties (Phase 3, v2.3)
      frameOfDiscernment: {
        type: "array",
        items: { type: "string" },
        description: "Frame of discernment (set of all possible hypotheses)"
      },
      beliefMasses: {
        type: "array",
        items: {
          type: "object",
          properties: {
            hypothesisSet: {
              type: "array",
              items: { type: "string" }
            },
            mass: {
              type: "number",
              minimum: 0,
              maximum: 1
            },
            justification: { type: "string" }
          },
          required: ["hypothesisSet", "mass", "justification"]
        },
        description: "Belief mass assignments (Dempster-Shafer)"
      },
      action: {
        type: "string",
        enum: ["add_thought", "summarize", "export", "switch_mode", "get_session", "recommend_mode"],
        description: "Action to perform"
      },
      exportFormat: {
        type: "string",
        enum: ["markdown", "latex", "json", "html", "jupyter", "mermaid", "dot", "ascii"],
        description: "Export format"
      },
      newMode: {
        type: "string",
        enum: ["sequential", "shannon", "mathematics", "physics", "hybrid", "abductive", "causal", "bayesian", "counterfactual", "analogical", "temporal", "gametheory", "evidential"],
        description: "New mode for switch_mode action"
      }
,
      problemType: {
        type: "string",
        description: "Simple problem type for quick recommendations (e.g., 'debugging', 'proof', 'timeline')"
      },
      problemCharacteristics: {
        type: "object",
        properties: {
          domain: { type: "string", description: "Problem domain" },
          complexity: { type: "string", enum: ["low", "medium", "high"], description: "Problem complexity" },
          uncertainty: { type: "string", enum: ["low", "medium", "high"], description: "Uncertainty level" },
          timeDependent: { type: "boolean", description: "Whether problem involves time sequences" },
          multiAgent: { type: "boolean", description: "Whether multiple agents interact" },
          requiresProof: { type: "boolean", description: "Whether formal proof is needed" },
          requiresQuantification: { type: "boolean", description: "Whether quantification is needed" },
          hasIncompleteInfo: { type: "boolean", description: "Whether information is incomplete" },
          requiresExplanation: { type: "boolean", description: "Whether explanation is needed" },
          hasAlternatives: { type: "boolean", description: "Whether alternative scenarios exist" }
        },
        required: ["domain", "complexity", "uncertainty", "timeDependent", "multiAgent", "requiresProof", "requiresQuantification", "hasIncompleteInfo", "requiresExplanation", "hasAlternatives"],
        description: "Detailed problem characteristics for comprehensive recommendations"
      },
      includeCombinations: {
        type: "boolean",
        description: "Whether to include mode combination suggestions"
      }
    },
    required: ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"]
  }
};
