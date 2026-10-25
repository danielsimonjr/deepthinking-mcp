/**
 * Engineering Mode Schemas (v8.4.0)
 * Phase 12: ALGORITHMIC mode with CLRS coverage
 * Phase 15: Aligned with JSON schema for complete validation
 * v9.3.4: Added recursive mode (was unreachable through any MCP tool)
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import {
  IdSchema,
  NameSchema,
  TextSchema,
  IdArraySchema,
  TextArraySchema,
  ConfidenceSchema,
  boundedRecord,
} from "../shared.js";
import { MAX_LENGTHS } from "../../../utils/sanitization.js";

// ============================================================
// ENGINEERING ANALYSIS (what EngineeringHandler reads)
// ============================================================
//
// EngineeringHandler reads `analysisType`, `designChallenge`, `requirements`,
// `tradeStudy`, `fmea`, `designDecisions` and `assessment`. Zod strips a key
// that its schema does not declare, so until these were declared the handler
// never saw them. Rules for what is declared:
//   - A field the handler reads, or keeps on the stored thought, is declared.
//   - A field the handler computes (`rpn`, `summary`, `weightedScore`) is not:
//     the handler replaces what a client sends.
//   - Vocabulary fields (`analysisType`, `source`, `priority`, `status`, ...) are
//     bounded strings, NOT enums: the handler resolves an unrecognised value or
//     keeps it as sent, and a Zod enum would turn that into a hard rejection.
//   - Every field is optional except where the handler dereferences it
//     (`coverage`, `assessment`): it defaults the rest.

/** One requirement of a traceability matrix. */
const RequirementSchema = z.object({
  id: IdSchema.optional(),
  title: NameSchema.optional(),
  description: TextSchema.optional(),
  /** stakeholder, regulatory, standard, derived, assumption or constraint. */
  source: IdSchema.optional(),
  /** must, should, could or wont. */
  priority: IdSchema.optional(),
  /** draft, approved, implemented, verified, deferred or rejected. */
  status: IdSchema.optional(),
  rationale: TextSchema.optional(),
  /** inspection, analysis, demonstration or test. */
  verificationMethod: IdSchema.optional(),
  verificationCriteria: TextArraySchema.optional(),
  tracesTo: IdArraySchema.optional(),
  satisfiedBy: IdArraySchema.optional(),
  relatedTo: IdArraySchema.optional(),
});

/** Requirements traceability matrix; the handler computes `coverage` when it is omitted. */
const RequirementsSchema = z.object({
  requirements: z
    .array(RequirementSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  coverage: z
    .object({
      total: z.number().int().min(0),
      verified: z.number().int().min(0),
      tracedToSource: z.number().int().min(0),
      allocatedToDesign: z.number().int().min(0),
    })
    .optional(),
});

/** An alternative that a trade study compares. */
const TradeAlternativeSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  description: TextSchema.optional(),
  pros: TextArraySchema.optional(),
  cons: TextArraySchema.optional(),
  estimatedCost: z.number().optional(),
  /** low, medium or high. */
  riskLevel: IdSchema.optional(),
});

/**
 * A criterion with a weight. A criterion can also be sent as a bare string, which
 * the handler keeps as sent and weighs at 0: see `TradeStudySchema.criteria`.
 */
const TradeCriterionSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  description: TextSchema.optional(),
  /** 0 to 1; the weights of a study should sum to 1. */
  weight: z.number().optional(),
  unit: IdSchema.optional(),
  higherIsBetter: z.boolean().optional(),
});

/** The score of one alternative on one criterion. */
const TradeScoreSchema = z.object({
  alternativeId: IdSchema.optional(),
  criteriaId: IdSchema.optional(),
  score: z.number().optional(),
  rationale: TextSchema.optional(),
});

/**
 * Trade study.
 *
 * `criteria` takes a string or an object. Before this schema declared the
 * objects, `criteria` was a list of strings, and the handler read it as a list of
 * objects: a string criterion has no `id` and no `weight`, so it weighs 0. The
 * string form stays accepted, and the handler says in `validation.issues` that a
 * string has no weight.
 */
const TradeStudySchema = z.object({
  title: NameSchema.optional(),
  objective: TextSchema.optional(),
  alternatives: z
    .array(TradeAlternativeSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  criteria: z
    .array(z.union([IdSchema, TradeCriterionSchema]))
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  scores: z
    .array(TradeScoreSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  /** Id of the recommended alternative. */
  recommendation: IdSchema.optional(),
  justification: TextSchema.optional(),
  sensitivityNotes: TextSchema.optional(),
});

/** Ratings stay bounded 1-10 when supplied; the handler defaults each one to 1. */
const RatingSchema = z.number().int().min(1).max(10);

/** One failure mode; the handler computes `rpn` as severity x occurrence x detection. */
const FailureModeSchema = z.object({
  id: IdSchema.optional(),
  component: NameSchema.optional(),
  function: TextSchema.optional(),
  failureMode: TextSchema.optional(),
  cause: TextSchema.optional(),
  effect: TextSchema.optional(),
  systemEffect: TextSchema.optional(),
  severity: RatingSchema.optional(),
  occurrence: RatingSchema.optional(),
  detection: RatingSchema.optional(),
  currentControls: TextSchema.optional(),
  mitigation: TextSchema.optional(),
  responsible: NameSchema.optional(),
  targetDate: IdSchema.optional(),
  /** open, in-progress, completed or verified. */
  mitigationStatus: IdSchema.optional(),
});

/** Failure mode and effects analysis; the handler computes `summary`. */
const FmeaSchema = z.object({
  title: NameSchema.optional(),
  system: NameSchema.optional(),
  failureModes: z
    .array(FailureModeSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  /** RPN at or above which action is required; the handler defaults it to 100. */
  rpnThreshold: z.number().optional(),
});

/** An option that a design decision weighed. */
const DecisionAlternativeSchema = z.object({
  option: NameSchema.optional(),
  description: TextSchema.optional(),
  pros: TextArraySchema.optional(),
  cons: TextArraySchema.optional(),
});

/** One design decision record. */
const DesignDecisionSchema = z.object({
  id: IdSchema.optional(),
  title: NameSchema.optional(),
  date: IdSchema.optional(),
  /** proposed, accepted, rejected, deprecated or superseded. */
  status: IdSchema.optional(),
  context: TextSchema.optional(),
  decision: TextSchema.optional(),
  alternatives: z
    .array(DecisionAlternativeSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  rationale: TextSchema.optional(),
  consequences: TextArraySchema.optional(),
  supersededBy: IdSchema.optional(),
  relatedDecisions: IdArraySchema.optional(),
  stakeholders: TextArraySchema.optional(),
});

/** Design decision log. */
const DesignDecisionsSchema = z.object({
  decisions: z
    .array(DesignDecisionSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  projectName: NameSchema.optional(),
});

/** Overall assessment; the handler stores it as sent and reads all four fields. */
const AssessmentSchema = z.object({
  confidence: ConfidenceSchema,
  keyRisks: TextArraySchema,
  nextSteps: TextArraySchema,
  openIssues: TextArraySchema,
});

// ============================================================
// ALGORITHMIC ANALYSIS (what AlgorithmicHandler reads)
// ============================================================
//
// AlgorithmicHandler reads `algorithm`, `clrsCategory`, `clrsAlgorithm`,
// `designPattern`, `timeComplexity`, `spaceComplexity`, `recurrence`,
// `correctnessProof`, `loopInvariants`, `dpFormulation`, `greedyProof`,
// `graphContext`, `dataStructure`, `amortizedAnalysis`, `comparison`,
// `pseudocode`, `executionTrace` and `keyInsight`. Zod strips a key that its
// schema does not declare, so until these were declared the handler never saw
// them. Rules for what is declared:
//   - Every field the handler reads is declared and bounded, whether or not the
//     advertised schema lists it. The tool size cap limits what `tools/list`
//     returns, never what a call may carry: `advertised-omissions.ts` (tests)
//     pins the declared paths that the advertisement leaves out.
//   - A member is optional. The handler fills what the thought type requires.
//   - Vocabulary members (`method`, `graphType`, `representation`, ...) are
//     bounded strings, NOT enums: the handler keeps an unrecognised value as
//     sent and says so in `inputWarnings`, and a Zod enum would turn that into
//     a hard rejection. `designPattern` is the one exception: the handler does
//     not store an unknown value (see the field).
//   - `algorithm` declares the plain members of an `AlgorithmSpec`. Its
//     `designPattern`, `timeComplexity`, `spaceComplexity` and `correctnessProof`
//     are the top-level fields of the same names, which the handler resolves.

/** The three parts of one loop-invariant argument. */
const InvariantStepSchema = z.object({
  statement: TextSchema.optional(),
  proof: TextSchema.optional(),
});

/** One loop invariant with the three parts of its proof. */
const LoopInvariantSchema = z.object({
  id: IdSchema.optional(),
  description: TextSchema.optional(),
  initialization: InvariantStepSchema.optional(),
  maintenance: InvariantStepSchema.optional(),
  termination: z
    .object({
      statement: TextSchema.optional(),
      proof: TextSchema.optional(),
      conclusionFollows: TextSchema.optional(),
    })
    .optional(),
  loopVariable: IdSchema.optional(),
  loopBounds: IdSchema.optional(),
});

/** Time complexity: the cases, and the recurrence behind them. */
const TimeComplexitySchema = z.object({
  bestCase: IdSchema.optional(),
  averageCase: IdSchema.optional(),
  worstCase: IdSchema.optional(),
  amortized: IdSchema.optional(),
  recurrence: IdSchema.optional(),
  closedForm: IdSchema.optional(),
  masterTheorem: z
    .object({
      a: z.number().optional(),
      b: z.number().optional(),
      f: IdSchema.optional(),
      /** Which case of the master theorem applies. */
      case: z.number().int().min(1).max(3).optional(),
    })
    .optional(),
  inputSensitive: z
    .object({
      parameter: IdSchema.optional(),
      complexity: IdSchema.optional(),
    })
    .optional(),
});

/** Space complexity. */
const SpaceComplexitySchema = z.object({
  auxiliary: IdSchema.optional(),
  total: IdSchema.optional(),
  inPlace: z.boolean().optional(),
  stackDepth: IdSchema.optional(),
  cacheEfficiency: z
    .object({
      cacheOblivious: z.boolean().optional(),
      cacheComplexity: IdSchema.optional(),
    })
    .optional(),
});

/**
 * Correctness proof. `method` is one of loop_invariant, induction,
 * contradiction, direct or structural; the handler defaults it to
 * loop_invariant.
 */
const CorrectnessProofSchema = z.object({
  id: IdSchema.optional(),
  algorithm: NameSchema.optional(),
  method: IdSchema.optional(),
  preconditions: TextArraySchema.optional(),
  postconditions: TextArraySchema.optional(),
  invariants: z
    .array(LoopInvariantSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  inductionBase: TextSchema.optional(),
  inductionStep: TextSchema.optional(),
  terminationArgument: z
    .object({
      decreasingQuantity: TextSchema.optional(),
      lowerBound: TextSchema.optional(),
      proof: TextSchema.optional(),
    })
    .optional(),
  proofSteps: TextArraySchema.optional(),
  keyInsights: TextArraySchema.optional(),
});

/** The plain members of an algorithm specification. */
const AlgorithmSpecSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  description: TextSchema.optional(),
  /** For example Sorting, Graph or String. */
  category: IdSchema.optional(),
  pseudocode: TextSchema.optional(),
  input: z
    .object({
      description: TextSchema.optional(),
      constraints: TextArraySchema.optional(),
      dataStructure: IdSchema.optional(),
    })
    .optional(),
  output: z
    .object({
      description: TextSchema.optional(),
      properties: TextArraySchema.optional(),
    })
    .optional(),
  practical: z
    .object({
      cacheEfficient: z.boolean().optional(),
      parallelizable: z.boolean().optional(),
      stable: z.boolean().optional(),
      online: z.boolean().optional(),
      deterministic: z.boolean().optional(),
      adaptive: z.boolean().optional(),
    })
    .optional(),
  alternatives: TextArraySchema.optional(),
  advantages: TextArraySchema.optional(),
  disadvantages: TextArraySchema.optional(),
  clrsReference: z
    .object({
      chapter: z.number().int().min(0).optional(),
      section: z.number().int().min(0).optional(),
      page: z.number().int().min(0).optional(),
    })
    .optional(),
});

/** The four steps of a dynamic-programming formulation. */
const DPFormulationSchema = z.object({
  id: IdSchema.optional(),
  problem: TextSchema.optional(),
  characterization: z
    .object({
      optimalSubstructure: TextSchema.optional(),
      subproblemDefinition: TextSchema.optional(),
    })
    .optional(),
  recursiveDefinition: z
    .object({
      stateSpace: TextSchema.optional(),
      recurrence: TextSchema.optional(),
      baseCases: TextArraySchema.optional(),
    })
    .optional(),
  computationOrder: z
    .object({
      /** bottom_up, top_down or bidirectional. */
      direction: IdSchema.optional(),
      fillOrder: TextSchema.optional(),
    })
    .optional(),
  reconstruction: z
    .object({
      method: TextSchema.optional(),
      traceback: TextSchema.optional(),
    })
    .optional(),
  complexity: z
    .object({
      states: IdSchema.optional(),
      transitionCost: IdSchema.optional(),
      total: IdSchema.optional(),
    })
    .optional(),
  optimizations: z
    .object({
      spaceOptimization: TextSchema.optional(),
      memoization: z.boolean().optional(),
      monotonicity: TextSchema.optional(),
    })
    .optional(),
});

/** Proof of the greedy-choice property. */
const GreedyProofSchema = z.object({
  id: IdSchema.optional(),
  problem: TextSchema.optional(),
  greedyChoice: z
    .object({
      description: TextSchema.optional(),
      localOptimum: TextSchema.optional(),
      globalOptimumProof: TextSchema.optional(),
    })
    .optional(),
  optimalSubstructure: z
    .object({
      description: TextSchema.optional(),
      proof: TextSchema.optional(),
    })
    .optional(),
  exchangeArgument: z
    .object({
      assumption: TextSchema.optional(),
      modification: TextSchema.optional(),
      noWorse: TextSchema.optional(),
      conclusion: TextSchema.optional(),
    })
    .optional(),
  matroid: z
    .object({
      groundSet: TextSchema.optional(),
      independentSets: TextSchema.optional(),
      proof: TextSchema.optional(),
    })
    .optional(),
});

/**
 * Graph the algorithm runs on. `graphType` is directed, undirected or mixed;
 * `representation` is adjacency_list, adjacency_matrix, edge_list or implicit;
 * `weightProperty` is non_negative, positive, arbitrary or unit.
 */
const GraphContextSchema = z.object({
  graphType: IdSchema.optional(),
  weighted: z.boolean().optional(),
  properties: z
    .object({
      connected: z.boolean().optional(),
      acyclic: z.boolean().optional(),
      bipartite: z.boolean().optional(),
      planar: z.boolean().optional(),
      sparse: z.boolean().optional(),
      dense: z.boolean().optional(),
    })
    .optional(),
  representation: IdSchema.optional(),
  source: IdSchema.optional(),
  sink: IdSchema.optional(),
  weightProperty: IdSchema.optional(),
});

/** One operation of a data structure and its cost. */
const DataStructureOperationSchema = z.object({
  name: NameSchema.optional(),
  description: TextSchema.optional(),
  worstCase: IdSchema.optional(),
  amortized: IdSchema.optional(),
  averageCase: IdSchema.optional(),
});

/** A data structure under analysis. */
const DataStructureSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  description: TextSchema.optional(),
  operations: z
    .array(DataStructureOperationSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  spaceUsage: IdSchema.optional(),
  representation: TextSchema.optional(),
  invariants: TextArraySchema.optional(),
  augmentation: z
    .object({
      additionalData: TextSchema.optional(),
      purpose: TextSchema.optional(),
      maintenanceCost: IdSchema.optional(),
    })
    .optional(),
  tradeoffs: z
    .array(
      z.object({
        versus: NameSchema.optional(),
        advantages: TextArraySchema.optional(),
        disadvantages: TextArraySchema.optional(),
      }),
    )
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
});

/** Amortized analysis. `method` is aggregate, accounting or potential. */
const AmortizedAnalysisSchema = z.object({
  id: IdSchema.optional(),
  dataStructure: NameSchema.optional(),
  operation: NameSchema.optional(),
  method: IdSchema.optional(),
  aggregate: z
    .object({
      totalCost: IdSchema.optional(),
      perOperation: IdSchema.optional(),
    })
    .optional(),
  accounting: z
    .object({
      actualCost: IdSchema.optional(),
      amortizedCost: IdSchema.optional(),
      credit: TextSchema.optional(),
      creditInvariant: TextSchema.optional(),
    })
    .optional(),
  potential: z
    .object({
      potentialFunction: TextSchema.optional(),
      initialPotential: TextSchema.optional(),
      amortizedCost: TextSchema.optional(),
      proof: TextSchema.optional(),
    })
    .optional(),
  result: IdSchema.optional(),
});

/** Comparison of algorithms by criterion, with a recommendation per use case. */
const ComparisonSchema = z.object({
  algorithms: IdArraySchema.optional(),
  criteria: z
    .array(
      z.object({
        criterion: NameSchema.optional(),
        /** The value of each algorithm on this criterion, by algorithm name. */
        values: boundedRecord(IdSchema, IdSchema).optional(),
        winner: NameSchema.optional(),
      }),
    )
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  recommendation: z
    .array(
      z.object({
        useCase: TextSchema.optional(),
        bestAlgorithm: NameSchema.optional(),
        reasoning: TextSchema.optional(),
      }),
    )
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
});

/** A worked run of the algorithm on one input. */
const ExecutionTraceSchema = z.object({
  input: TextSchema.optional(),
  steps: z
    .array(
      z.object({
        step: z.number().int().min(0).optional(),
        state: TextSchema.optional(),
        action: TextSchema.optional(),
      }),
    )
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  output: TextSchema.optional(),
});

// ============================================================
// RECURSIVE DECOMPOSITION (v9.3.4)
// ============================================================
//
// `recursive` had a full handler (RecursiveHandler), a registered validator and
// a place in FULLY_IMPLEMENTED_MODES, but no tool accepted the value, so no MCP
// client could ever select it. It belongs here because recursion IS algorithm
// design: RecursiveHandler's strategies (divide_and_conquer,
// decrease_and_conquer, transform_and_conquer, dynamic_programming) are the
// CLRS design patterns `algorithmic` already advertises, and its `recurrence`
// carries a closed form and a complexity, as the algorithmic `recurrence` does.
//
// Vocabulary fields (`thoughtType`, `strategy`, subproblem `status`) are
// bounded strings, NOT enums: RecursiveHandler warns on or silently defaults an
// unrecognised value. A Zod enum would turn that into a hard rejection.

/** One subproblem produced by the decomposition. */
const SubproblemSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  description: TextSchema.optional(),
  /** Problem size: numeric (n/2) or symbolic ("n-1"). */
  size: z.union([IdSchema, z.number()]).optional(),
  depth: z.number().int().min(0).optional(),
  parentId: IdSchema.optional(),
  status: IdSchema.optional(),
  result: TextSchema.optional(),
});

/** A terminating case of the recursion. */
const BaseCaseSchema = z.object({
  id: IdSchema.optional(),
  condition: TextSchema.optional(),
  result: TextSchema.optional(),
  verified: z.boolean().optional(),
});

/**
 * The recurrence relation and, if solved, its solution. One shape serves two
 * modes: `recursive` reads `formula`, `baseCase`, `closedForm` and `complexity`;
 * `algorithmic` reads `formula`, `baseCase`, `solutionMethod`, `solution`,
 * `solutionProof` and `recursionTree`. `solutionMethod` is master_theorem,
 * substitution, recursion_tree or generating_function.
 */
const RecurrenceRelationSchema = z.object({
  id: IdSchema.optional(),
  formula: TextSchema.optional(),
  baseCase: TextSchema.optional(),
  closedForm: TextSchema.optional(),
  complexity: IdSchema.optional(),
  solutionMethod: IdSchema.optional(),
  solution: TextSchema.optional(),
  solutionProof: TextSchema.optional(),
  recursionTree: z
    .object({
      levelWork: TextSchema.optional(),
      levels: TextSchema.optional(),
      totalWork: TextSchema.optional(),
    })
    .optional(),
});

/**
 * Engineering reasoning schema (+ Recursive decomposition)
 */
export const EngineeringSchema = BaseThoughtSchema.extend({
  mode: z.enum(["engineering", "algorithmic", "recursive"]),

  /** Mode-specific step label; every handler here resolves it leniently. */
  thoughtType: IdSchema.optional(),

  // Engineering mode. `analysisType` is a bounded string: an unrecognised value
  // falls back to "comprehensive" and a warning says so.
  analysisType: IdSchema.optional(),
  designChallenge: TextSchema.optional(),
  requirements: RequirementsSchema.optional(),
  tradeStudy: TradeStudySchema.optional(),
  fmea: FmeaSchema.optional(),
  designDecisions: DesignDecisionsSchema.optional(),
  assessment: AssessmentSchema.optional(),

  // Algorithmic mode (CLRS). `designPattern` is a bounded string: the handler
  // reads a hyphenated known value as its underscore form and does not store an
  // unknown one, and a Zod enum would turn either into a hard rejection.
  designPattern: IdSchema.optional(),
  algorithm: AlgorithmSpecSchema.optional(),
  clrsCategory: IdSchema.optional(),
  clrsAlgorithm: IdSchema.optional(),
  timeComplexity: TimeComplexitySchema.optional(),
  spaceComplexity: SpaceComplexitySchema.optional(),
  correctnessProof: CorrectnessProofSchema.optional(),
  loopInvariants: z
    .array(LoopInvariantSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  dpFormulation: DPFormulationSchema.optional(),
  greedyProof: GreedyProofSchema.optional(),
  graphContext: GraphContextSchema.optional(),
  dataStructure: DataStructureSchema.optional(),
  amortizedAnalysis: AmortizedAnalysisSchema.optional(),
  comparison: ComparisonSchema.optional(),
  pseudocode: TextSchema.optional(),
  executionTrace: ExecutionTraceSchema.optional(),
  keyInsight: TextSchema.optional(),

  // Recursive mode; `recurrence` is shared with algorithmic mode
  subproblems: z
    .array(SubproblemSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  baseCases: z
    .array(BaseCaseSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  baseCaseReached: z.boolean().optional(),
  currentDepth: z.number().int().min(0).optional(),
  maxDepth: z.number().int().min(0).optional(),
  recurrence: RecurrenceRelationSchema.optional(),
  strategy: IdSchema.optional(),
  divisionFactor: z.number().optional(),
});

/**
 * The request that `deepthinking_engineering` accepts, as `EngineeringSchema`
 * types it. `AlgorithmicHandler` reads its fields through this type.
 */
export type EngineeringInput = z.infer<typeof EngineeringSchema>;
