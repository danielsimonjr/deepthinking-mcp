/**
 * AlgorithmicHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Algorithmic reasoning with:
 * - Algorithm design pattern classification
 * - Complexity analysis (time/space)
 * - Correctness proof structures
 * - Dynamic programming and greedy formulations
 */

import { randomUUID } from "crypto";
import { ThinkingMode } from "../../types/core.js";
import type {
  AlgorithmDescription,
  AlgorithmicThought,
  AlgorithmicThoughtType,
  AlgorithmComparison,
  AmortizedAnalysis,
  CorrectnessProof,
  DataStructureSpec,
  DesignPattern,
  DPFormulation,
  GraphAlgorithmContext,
  GreedyProof,
  LoopInvariant,
  Recurrence,
  SpaceComplexity,
  TimeComplexity,
} from "../../types/modes/algorithmic.js";
import type { ThinkingToolInput } from "../../tools/thinking.js";
import type { EngineeringInput } from "../../tools/schemas/modes/engineering.js";
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from "./ModeHandler.js";
import {
  droppedValueWarning,
  inputWarningsField,
  unrecognisedValueWarning,
} from "./input-warnings.js";

/**
 * Valid algorithmic thought types
 */
const VALID_THOUGHT_TYPES: AlgorithmicThoughtType[] = [
  "algorithm_definition",
  "complexity_analysis",
  "recurrence_solving",
  "correctness_proof",
  "invariant_identification",
  "divide_and_conquer",
  "dynamic_programming",
  "greedy_choice",
  "backtracking",
  "branch_and_bound",
  "randomized_analysis",
  "amortized_analysis",
  "data_structure_design",
  "data_structure_analysis",
  "augmentation",
  "graph_traversal",
  "shortest_path",
  "minimum_spanning_tree",
  "network_flow",
  "matching",
  "string_matching",
  "computational_geometry",
  "number_theoretic",
  "approximation",
  "online_algorithm",
  "parallel_algorithm",
];

/**
 * Valid design patterns
 */
const VALID_DESIGN_PATTERNS: DesignPattern[] = [
  "brute_force",
  "divide_and_conquer",
  "dynamic_programming",
  "greedy",
  "backtracking",
  "branch_and_bound",
  "randomized",
  "approximation",
  "online",
  "parallel",
  "incremental",
  "prune_and_search",
];

/** The thought type that stands in for an unrecognised or absent one. */
const DEFAULT_THOUGHT_TYPE: AlgorithmicThoughtType = "algorithm_definition";

/**
 * Values that the thought type names for the vocabulary members. A member that
 * is absent takes the first value (`weightProperty` takes none); an unrecognised
 * value is kept as sent and reported.
 */
const PROOF_METHODS = [
  "loop_invariant",
  "induction",
  "contradiction",
  "direct",
  "structural",
] as const;
const AMORTIZED_METHODS = ["aggregate", "accounting", "potential"] as const;
const GRAPH_TYPES = ["directed", "undirected", "mixed"] as const;
const GRAPH_REPRESENTATIONS = [
  "adjacency_list",
  "adjacency_matrix",
  "edge_list",
  "implicit",
] as const;
const WEIGHT_PROPERTIES = [
  "non_negative",
  "positive",
  "arbitrary",
  "unit",
] as const;
const SOLUTION_METHODS = [
  "master_theorem",
  "substitution",
  "recursion_tree",
  "generating_function",
] as const;
const COMPUTATION_DIRECTIONS = [
  "bottom_up",
  "top_down",
  "bidirectional",
] as const;

/**
 * Resolve a vocabulary member: return the value as sent, or the default when it
 * is absent, and record a sentence for a value that is not recognised.
 */
type Vocabulary = (
  field: string,
  value: unknown,
  recognised: readonly string[],
  fallback?: string,
) => string | undefined;

/** What a request carries in one field, as the Zod schema of the tool types it. */
type Sent<K extends keyof EngineeringInput> = NonNullable<EngineeringInput[K]>;

/** The request fields that this handler reads, typed by the Zod schema that lets them through. */
type AlgorithmicRequest = Pick<
  EngineeringInput,
  | "thoughtType"
  | "designPattern"
  | "algorithm"
  | "clrsCategory"
  | "clrsAlgorithm"
  | "timeComplexity"
  | "spaceComplexity"
  | "recurrence"
  | "correctnessProof"
  | "loopInvariants"
  | "dpFormulation"
  | "greedyProof"
  | "graphContext"
  | "dataStructure"
  | "amortizedAnalysis"
  | "comparison"
  | "pseudocode"
  | "executionTrace"
  | "keyInsight"
>;

/** A string, or the empty string for anything else. */
const text = (value: unknown): string =>
  typeof value === "string" ? value : "";

/** The strings of a list, or an empty list for anything else. */
const texts = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

/** Map the entries of a list; an absent list is an empty one and an absent entry is `{}`. */
const entries = <I, T>(
  value: readonly I[] | undefined,
  map: (entry: I, index: number) => T,
): T[] =>
  Array.isArray(value)
    ? value.map((entry, i) => map(entry ?? ({} as I), i))
    : [];

/** The underscore form of a design pattern as sent: `divide-and-conquer` is `divide_and_conquer`. */
const underscored = (value: unknown): string =>
  typeof value === "string" ? value.replace(/-/g, "_") : "";

/**
 * AlgorithmicHandler - Specialized handler for algorithmic reasoning
 *
 * Provides:
 * - Algorithm classification by design pattern
 * - Time and space complexity analysis
 * - Loop invariant and correctness proofs
 * - DP and greedy formulation support
 */
export class AlgorithmicHandler implements ModeHandler {
  readonly mode = ThinkingMode.ALGORITHMIC;
  readonly modeName = "Algorithmic Analysis";
  readonly description =
    "Algorithm design, complexity analysis, and correctness proofs (CLRS coverage)";

  /**
   * Supported thought types for algorithmic mode
   */
  private readonly supportedThoughtTypes = VALID_THOUGHT_TYPES;

  /**
   * Create an algorithmic thought from input
   */
  createThought(
    input: ThinkingToolInput,
    sessionId: string,
  ): AlgorithmicThought {
    const req = input as unknown as AlgorithmicRequest;

    // Sentences for the values replaced, read differently or ignored below;
    // validateCommon() reports each one in the `validation` field of the answer.
    const notes: (string | undefined)[] = [];
    const vocabulary: Vocabulary = (field, value, recognised, fallback) => {
      notes.push(unrecognisedValueWarning(field, value, recognised));
      return typeof value === "string" && value !== "" ? value : fallback;
    };

    // Resolve thought type
    notes.push(
      unrecognisedValueWarning(
        "thoughtType",
        req.thoughtType,
        VALID_THOUGHT_TYPES,
        DEFAULT_THOUGHT_TYPE,
      ),
    );
    const thoughtType = this.resolveThoughtType(req.thoughtType);

    // Resolve design pattern
    const designPattern = this.resolveDesignPattern(req.designPattern, notes);

    // Process time complexity
    const timeComplexity = req.timeComplexity
      ? this.normalizeTimeComplexity(req.timeComplexity)
      : undefined;

    // Process space complexity
    const spaceComplexity = req.spaceComplexity
      ? this.normalizeSpaceComplexity(req.spaceComplexity)
      : undefined;

    // Process recurrence
    const recurrence = req.recurrence
      ? this.normalizeRecurrence(req.recurrence, vocabulary)
      : undefined;

    // Process correctness proof
    const correctnessProof = req.correctnessProof
      ? this.normalizeCorrectnessProof(req.correctnessProof, vocabulary)
      : undefined;

    // Process DP formulation
    const dpFormulation = req.dpFormulation
      ? this.normalizeDPFormulation(req.dpFormulation, vocabulary)
      : undefined;

    // Process greedy proof
    const greedyProof = req.greedyProof
      ? this.normalizeGreedyProof(req.greedyProof)
      : undefined;

    // Process graph context
    const graphContext = req.graphContext
      ? this.normalizeGraphContext(req.graphContext, vocabulary)
      : undefined;

    // Process amortized analysis
    const amortizedAnalysis = req.amortizedAnalysis
      ? this.normalizeAmortizedAnalysis(req.amortizedAnalysis, vocabulary)
      : undefined;

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.ALGORITHMIC,

      // Core algorithmic fields
      thoughtType,
      algorithm: req.algorithm
        ? this.normalizeAlgorithm(req.algorithm, req.pseudocode)
        : undefined,
      // Stored as sent: the handler does not check these two against the CLRS lists
      clrsCategory: req.clrsCategory as AlgorithmicThought["clrsCategory"],
      clrsAlgorithm: req.clrsAlgorithm as AlgorithmicThought["clrsAlgorithm"],
      designPattern,
      timeComplexity,
      spaceComplexity,
      recurrence,
      correctnessProof,
      loopInvariants: Array.isArray(req.loopInvariants)
        ? entries(req.loopInvariants, (inv) => this.normalizeLoopInvariant(inv))
        : undefined,
      dpFormulation,
      greedyProof,
      graphContext,
      dataStructure: req.dataStructure
        ? this.normalizeDataStructure(req.dataStructure)
        : undefined,
      amortizedAnalysis,
      comparison: req.comparison
        ? this.normalizeComparison(req.comparison)
        : undefined,
      pseudocode: req.pseudocode,
      executionTrace: req.executionTrace
        ? this.normalizeExecutionTrace(req.executionTrace)
        : undefined,
      keyInsight: req.keyInsight,

      // Dependencies and assumptions
      dependencies: input.dependencies || [],
      assumptions: input.assumptions || [],
      uncertainty: input.uncertainty ?? 0.5,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,

      ...inputWarningsField(notes),
    };
  }

  /**
   * Validate algorithmic-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors = [];
    const warnings = [];
    const req = input as unknown as AlgorithmicRequest;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError(
          "thought",
          "Thought content is required",
          "EMPTY_THOUGHT",
        ),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          "thoughtNumber",
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          "INVALID_THOUGHT_NUMBER",
        ),
      ]);
    }

    // Validate thought type
    if (
      req.thoughtType &&
      !VALID_THOUGHT_TYPES.includes(req.thoughtType as AlgorithmicThoughtType)
    ) {
      warnings.push(
        createValidationWarning(
          "thoughtType",
          `Unknown thought type: ${req.thoughtType}`,
          `Valid types include: ${VALID_THOUGHT_TYPES.slice(0, 5).join(", ")}...`,
        ),
      );
    }

    // Validate design pattern (a hyphenated known value is read as its underscore form)
    if (
      req.designPattern &&
      !VALID_DESIGN_PATTERNS.includes(
        underscored(req.designPattern) as DesignPattern,
      )
    ) {
      warnings.push(
        createValidationWarning(
          "designPattern",
          `Unknown design pattern: ${req.designPattern}`,
          `Valid patterns: ${VALID_DESIGN_PATTERNS.join(", ")}`,
        ),
      );
    }

    // Validate uncertainty
    if (input.uncertainty !== undefined) {
      if (input.uncertainty < 0 || input.uncertainty > 1) {
        errors.push(
          createValidationError(
            "uncertainty",
            `Uncertainty (${input.uncertainty}) must be between 0 and 1`,
            "UNCERTAINTY_OUT_OF_RANGE",
          ),
        );
      }
    }

    // Validate DP formulation
    if (req.dpFormulation) {
      const dpWarnings = this.validateDPFormulation(req.dpFormulation);
      warnings.push(...dpWarnings);
    }

    // Validate correctness proof
    if (req.correctnessProof) {
      const proofWarnings = this.validateCorrectnessProof(req.correctnessProof);
      warnings.push(...proofWarnings);
    }

    // Suggest complexity analysis for algorithm definition
    if (req.thoughtType === "algorithm_definition" && !req.timeComplexity) {
      warnings.push(
        createValidationWarning(
          "timeComplexity",
          "Algorithm definition without complexity analysis",
          "Include time complexity for complete specification",
        ),
      );
    }

    // Suggest DP formulation for dynamic programming
    if (req.thoughtType === "dynamic_programming" && !req.dpFormulation) {
      warnings.push(
        createValidationWarning(
          "dpFormulation",
          "DP thought without formulation",
          "Include the four-step DP formulation",
        ),
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get algorithmic-specific enhancements
   */
  getEnhancements(thought: AlgorithmicThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [
        ThinkingMode.MATHEMATICS,
        ThinkingMode.COMPUTABILITY,
        ThinkingMode.OPTIMIZATION,
      ],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        dependencyCount: thought.dependencies?.length || 0,
        assumptionCount: thought.assumptions?.length || 0,
        uncertainty: thought.uncertainty,
      },
      mentalModels: [
        "Divide and Conquer",
        "Dynamic Programming",
        "Greedy Choice Property",
        "Master Theorem",
        "Loop Invariants",
        "Amortized Analysis",
      ],
    };

    // Thought type-specific guidance
    switch (thought.thoughtType) {
      case "algorithm_definition":
        enhancements.guidingQuestions!.push(
          "What is the input/output specification?",
          "What design pattern does this follow?",
          "Is the algorithm correct for all valid inputs?",
        );
        break;

      case "complexity_analysis":
        enhancements.guidingQuestions!.push(
          "What is the dominant operation?",
          "Can we apply the Master Theorem?",
          "Is the analysis tight (Θ) or just upper bound (O)?",
        );
        if (thought.timeComplexity) {
          enhancements.metrics!.worstCase = thought.timeComplexity.worstCase;
          enhancements.suggestions!.push(
            `Time: ${thought.timeComplexity.worstCase}`,
          );
        }
        if (thought.spaceComplexity) {
          enhancements.metrics!.spaceComplexity =
            thought.spaceComplexity.auxiliary;
        }
        break;

      case "recurrence_solving":
        enhancements.guidingQuestions!.push(
          "Which method applies: Master Theorem, substitution, or recursion tree?",
          "What is the recurrence relation?",
          "Is the solution tight?",
        );
        if (thought.recurrence) {
          enhancements.suggestions!.push(
            `Recurrence: ${thought.recurrence.formula}`,
          );
          if (thought.recurrence.solution) {
            enhancements.suggestions!.push(
              `Solution: ${thought.recurrence.solution}`,
            );
          }
        }
        break;

      case "correctness_proof":
        enhancements.guidingQuestions!.push(
          "What are the preconditions and postconditions?",
          "What is the loop invariant?",
          "Why does the algorithm terminate?",
        );
        if (thought.correctnessProof) {
          enhancements.suggestions!.push(
            `Proof method: ${thought.correctnessProof.method}`,
          );
        }
        break;

      case "invariant_identification":
        enhancements.guidingQuestions!.push(
          "Does the invariant hold at initialization?",
          "Is it maintained through each iteration?",
          "What does the invariant imply at termination?",
        );
        if (thought.loopInvariants) {
          enhancements.metrics!.invariantCount = thought.loopInvariants.length;
        }
        break;

      case "divide_and_conquer":
        enhancements.guidingQuestions!.push(
          "How is the problem divided?",
          "What are the subproblems?",
          "How are solutions combined?",
        );
        enhancements.suggestions!.push(
          "Apply recurrence analysis using Master Theorem",
        );
        break;

      case "dynamic_programming":
        enhancements.guidingQuestions!.push(
          "What is the optimal substructure?",
          "Are there overlapping subproblems?",
          "What is the recurrence relation?",
        );
        if (thought.dpFormulation) {
          enhancements.suggestions!.push(
            `State space: ${thought.dpFormulation.recursiveDefinition.stateSpace}`,
            `Complexity: ${thought.dpFormulation.complexity.total}`,
          );
        }
        break;

      case "greedy_choice":
        enhancements.guidingQuestions!.push(
          "What is the greedy choice?",
          "Why is the greedy choice safe?",
          "Is there optimal substructure?",
        );
        if (thought.greedyProof) {
          enhancements.suggestions!.push("Greedy choice property verified");
        }
        break;

      case "amortized_analysis":
        enhancements.guidingQuestions!.push(
          "Which method: aggregate, accounting, or potential?",
          "What is the amortized cost per operation?",
          "Is the credit/potential always non-negative?",
        );
        if (thought.amortizedAnalysis) {
          enhancements.suggestions!.push(
            `Method: ${thought.amortizedAnalysis.method}`,
            `Amortized cost: ${thought.amortizedAnalysis.result}`,
          );
        }
        break;

      case "graph_traversal":
      case "shortest_path":
      case "minimum_spanning_tree":
      case "network_flow":
        if (thought.graphContext) {
          enhancements.metrics!.graphType = thought.graphContext.graphType;
          enhancements.metrics!.weighted = thought.graphContext.weighted
            ? 1
            : 0;
          enhancements.suggestions!.push(
            `Graph: ${thought.graphContext.graphType}, ${thought.graphContext.weighted ? "weighted" : "unweighted"}`,
          );
        }
        break;
    }

    // Design pattern analysis
    if (thought.designPattern) {
      enhancements.metrics!.designPattern = thought.designPattern;
      enhancements.suggestions!.push(
        `Design pattern: ${thought.designPattern}`,
      );
    }

    // CLRS reference
    if (thought.clrsAlgorithm) {
      enhancements.suggestions!.push(
        `CLRS Algorithm: ${thought.clrsAlgorithm}`,
      );
    }
    if (thought.clrsCategory) {
      enhancements.metrics!.clrsCategory = thought.clrsCategory;
    }

    // Algorithm comparison
    if (thought.comparison) {
      enhancements.metrics!.alternativeCount =
        thought.comparison.algorithms.length;
    }

    // Key insight
    if (thought.keyInsight) {
      enhancements.suggestions!.push(`Key insight: ${thought.keyInsight}`);
    }

    // High uncertainty warning
    if (thought.uncertainty > 0.7) {
      enhancements.warnings!.push(
        "High uncertainty - verify analysis carefully",
      );
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(
      thoughtType as AlgorithmicThoughtType,
    );
  }

  /**
   * Resolve thought type from input
   */
  private resolveThoughtType(
    inputType: string | undefined,
  ): AlgorithmicThoughtType {
    if (
      inputType &&
      VALID_THOUGHT_TYPES.includes(inputType as AlgorithmicThoughtType)
    ) {
      return inputType as AlgorithmicThoughtType;
    }
    return DEFAULT_THOUGHT_TYPE;
  }

  /**
   * Resolve the design pattern from input.
   *
   * The underscore spelling is the one the type, this handler and the validator
   * use. A hyphenated known value is read as its underscore form and a sentence
   * names both spellings. An unknown value is not stored: the field has no
   * default, so a guess would claim a pattern the client did not name.
   */
  private resolveDesignPattern(
    value: unknown,
    notes: (string | undefined)[],
  ): DesignPattern | undefined {
    if (value === undefined || value === null || value === "") return undefined;
    if (VALID_DESIGN_PATTERNS.includes(value as DesignPattern)) {
      return value as DesignPattern;
    }
    const pattern = underscored(value);
    if (VALID_DESIGN_PATTERNS.includes(pattern as DesignPattern)) {
      notes.push(
        `designPattern ${JSON.stringify(value)} uses hyphens; it is read as ${JSON.stringify(pattern)}, the spelling that is stored.`,
      );
      return pattern as DesignPattern;
    }
    notes.push(
      droppedValueWarning("designPattern", value, VALID_DESIGN_PATTERNS),
    );
    return undefined;
  }

  /**
   * Normalize time complexity
   */
  private normalizeTimeComplexity(tc: Sent<"timeComplexity">): TimeComplexity {
    return {
      bestCase: text(tc.bestCase),
      averageCase: text(tc.averageCase),
      worstCase: text(tc.worstCase),
      amortized: tc.amortized,
      recurrence: tc.recurrence,
      closedForm: tc.closedForm,
      // The schema bounds `case` to 1 to 3
      masterTheorem: tc.masterTheorem as TimeComplexity["masterTheorem"],
      inputSensitive: tc.inputSensitive,
    };
  }

  /**
   * Normalize space complexity
   */
  private normalizeSpaceComplexity(
    sc: Sent<"spaceComplexity">,
  ): SpaceComplexity {
    return {
      auxiliary: text(sc.auxiliary),
      total: text(sc.total),
      inPlace: sc.inPlace ?? false,
      stackDepth: sc.stackDepth,
      cacheEfficiency: sc.cacheEfficiency,
    };
  }

  /**
   * Normalize the algorithm under analysis.
   *
   * `id` and the required text members are filled; the optional blocks
   * (`practical`, `clrsReference`) are kept as sent. `designPattern`,
   * `timeComplexity` and `spaceComplexity` of the specification are the fields of
   * the thought, so the description leaves them out.
   */
  private normalizeAlgorithm(
    a: Sent<"algorithm">,
    pseudocode: unknown,
  ): AlgorithmDescription {
    return {
      id: a.id || randomUUID(),
      name: text(a.name),
      description: text(a.description),
      category: text(a.category),
      input: {
        description: text(a.input?.description),
        constraints: texts(a.input?.constraints),
        dataStructure: text(a.input?.dataStructure),
      },
      output: {
        description: text(a.output?.description),
        properties: texts(a.output?.properties),
      },
      pseudocode: text(a.pseudocode) || text(pseudocode),
      practical: a.practical,
      alternatives: a.alternatives,
      advantages: a.advantages,
      disadvantages: a.disadvantages,
      clrsReference: a.clrsReference,
    };
  }

  /**
   * Normalize a recurrence.
   *
   * One shape serves two modes: recursive mode sends `closedForm` and
   * `complexity`, which are kept, and algorithmic mode sends the solution
   * members.
   */
  private normalizeRecurrence(
    rec: Sent<"recurrence">,
    vocabulary: Vocabulary,
  ): Recurrence {
    return {
      id: rec.id || randomUUID(),
      formula: text(rec.formula),
      baseCase: text(rec.baseCase),
      solutionMethod: vocabulary(
        "recurrence.solutionMethod",
        rec.solutionMethod,
        SOLUTION_METHODS,
        SOLUTION_METHODS[0],
      ) as Recurrence["solutionMethod"],
      solution: text(rec.solution),
      solutionProof: rec.solutionProof,
      recursionTree: rec.recursionTree
        ? {
            levelWork: text(rec.recursionTree.levelWork),
            levels: text(rec.recursionTree.levels),
            totalWork: text(rec.recursionTree.totalWork),
          }
        : undefined,
      closedForm: rec.closedForm,
      complexity: rec.complexity,
    };
  }

  /**
   * Normalize a loop invariant: the three parts of the proof exist, empty
   * where the client sent nothing.
   */
  private normalizeLoopInvariant(
    inv: Sent<"loopInvariants">[number],
  ): LoopInvariant {
    return {
      id: inv.id || randomUUID(),
      description: text(inv.description),
      initialization: {
        statement: text(inv.initialization?.statement),
        proof: text(inv.initialization?.proof),
      },
      maintenance: {
        statement: text(inv.maintenance?.statement),
        proof: text(inv.maintenance?.proof),
      },
      termination: {
        statement: text(inv.termination?.statement),
        proof: text(inv.termination?.proof),
        conclusionFollows: text(inv.termination?.conclusionFollows),
      },
      loopVariable: text(inv.loopVariable),
      loopBounds: text(inv.loopBounds),
    };
  }

  /**
   * Normalize correctness proof
   */
  private normalizeCorrectnessProof(
    proof: Sent<"correctnessProof">,
    vocabulary: Vocabulary,
  ): CorrectnessProof {
    return {
      id: proof.id || randomUUID(),
      algorithm: proof.algorithm || "",
      method: vocabulary(
        "correctnessProof.method",
        proof.method,
        PROOF_METHODS,
        PROOF_METHODS[0],
      ) as CorrectnessProof["method"],
      preconditions: proof.preconditions || [],
      postconditions: proof.postconditions || [],
      invariants: Array.isArray(proof.invariants)
        ? entries(proof.invariants, (inv) => this.normalizeLoopInvariant(inv))
        : undefined,
      inductionBase: proof.inductionBase,
      inductionStep: proof.inductionStep,
      terminationArgument: {
        decreasingQuantity: text(proof.terminationArgument?.decreasingQuantity),
        lowerBound: text(proof.terminationArgument?.lowerBound),
        proof: text(proof.terminationArgument?.proof),
      },
      proofSteps: proof.proofSteps || [],
      keyInsights: proof.keyInsights || [],
    };
  }

  /**
   * Normalize DP formulation
   */
  private normalizeDPFormulation(
    dp: Sent<"dpFormulation">,
    vocabulary: Vocabulary,
  ): DPFormulation {
    return {
      id: dp.id || randomUUID(),
      problem: dp.problem || "",
      characterization: {
        optimalSubstructure: text(dp.characterization?.optimalSubstructure),
        subproblemDefinition: text(dp.characterization?.subproblemDefinition),
      },
      recursiveDefinition: {
        stateSpace: text(dp.recursiveDefinition?.stateSpace),
        recurrence: text(dp.recursiveDefinition?.recurrence),
        baseCases: texts(dp.recursiveDefinition?.baseCases),
      },
      computationOrder: {
        direction: vocabulary(
          "dpFormulation.computationOrder.direction",
          dp.computationOrder?.direction,
          COMPUTATION_DIRECTIONS,
          COMPUTATION_DIRECTIONS[0],
        ) as DPFormulation["computationOrder"]["direction"],
        fillOrder: text(dp.computationOrder?.fillOrder),
      },
      reconstruction: {
        method: text(dp.reconstruction?.method),
        traceback: text(dp.reconstruction?.traceback),
      },
      complexity: {
        states: text(dp.complexity?.states),
        transitionCost: text(dp.complexity?.transitionCost),
        total: text(dp.complexity?.total),
      },
      optimizations: dp.optimizations,
    };
  }

  /**
   * Normalize greedy proof
   */
  private normalizeGreedyProof(proof: Sent<"greedyProof">): GreedyProof {
    return {
      id: proof.id || randomUUID(),
      problem: proof.problem || "",
      greedyChoice: {
        description: text(proof.greedyChoice?.description),
        localOptimum: text(proof.greedyChoice?.localOptimum),
        globalOptimumProof: text(proof.greedyChoice?.globalOptimumProof),
      },
      optimalSubstructure: {
        description: text(proof.optimalSubstructure?.description),
        proof: text(proof.optimalSubstructure?.proof),
      },
      exchangeArgument: proof.exchangeArgument
        ? {
            assumption: text(proof.exchangeArgument.assumption),
            modification: text(proof.exchangeArgument.modification),
            noWorse: text(proof.exchangeArgument.noWorse),
            conclusion: text(proof.exchangeArgument.conclusion),
          }
        : undefined,
      matroid: proof.matroid
        ? {
            groundSet: text(proof.matroid.groundSet),
            independentSets: text(proof.matroid.independentSets),
            proof: text(proof.matroid.proof),
          }
        : undefined,
    };
  }

  /**
   * Normalize the graph the algorithm runs on. `weightProperty` is optional and
   * has no default; `properties` is a bag of optional flags and is kept as sent.
   */
  private normalizeGraphContext(
    g: Sent<"graphContext">,
    vocabulary: Vocabulary,
  ): GraphAlgorithmContext {
    return {
      graphType: vocabulary(
        "graphContext.graphType",
        g.graphType,
        GRAPH_TYPES,
        GRAPH_TYPES[0],
      ) as GraphAlgorithmContext["graphType"],
      weighted: g.weighted ?? false,
      properties: g.properties,
      representation: vocabulary(
        "graphContext.representation",
        g.representation,
        GRAPH_REPRESENTATIONS,
        GRAPH_REPRESENTATIONS[0],
      ) as GraphAlgorithmContext["representation"],
      source: g.source,
      sink: g.sink,
      weightProperty: vocabulary(
        "graphContext.weightProperty",
        g.weightProperty,
        WEIGHT_PROPERTIES,
      ) as GraphAlgorithmContext["weightProperty"],
    };
  }

  /**
   * Normalize a data structure specification
   */
  private normalizeDataStructure(ds: Sent<"dataStructure">): DataStructureSpec {
    return {
      id: ds.id || randomUUID(),
      name: text(ds.name),
      description: text(ds.description),
      operations: entries(ds.operations, (op) => ({
        name: text(op.name),
        description: text(op.description),
        worstCase: text(op.worstCase),
        amortized: op.amortized,
        averageCase: op.averageCase,
      })),
      spaceUsage: text(ds.spaceUsage),
      representation: text(ds.representation),
      invariants: texts(ds.invariants),
      augmentation: ds.augmentation
        ? {
            additionalData: text(ds.augmentation.additionalData),
            purpose: text(ds.augmentation.purpose),
            maintenanceCost: text(ds.augmentation.maintenanceCost),
          }
        : undefined,
      tradeoffs: Array.isArray(ds.tradeoffs)
        ? entries(ds.tradeoffs, (t) => ({
            versus: text(t.versus),
            advantages: texts(t.advantages),
            disadvantages: texts(t.disadvantages),
          }))
        : undefined,
    };
  }

  /**
   * Normalize an amortized analysis
   */
  private normalizeAmortizedAnalysis(
    a: Sent<"amortizedAnalysis">,
    vocabulary: Vocabulary,
  ): AmortizedAnalysis {
    return {
      id: a.id || randomUUID(),
      dataStructure: text(a.dataStructure),
      operation: text(a.operation),
      method: vocabulary(
        "amortizedAnalysis.method",
        a.method,
        AMORTIZED_METHODS,
        AMORTIZED_METHODS[0],
      ) as AmortizedAnalysis["method"],
      aggregate: a.aggregate
        ? {
            totalCost: text(a.aggregate.totalCost),
            perOperation: text(a.aggregate.perOperation),
          }
        : undefined,
      accounting: a.accounting
        ? {
            actualCost: text(a.accounting.actualCost),
            amortizedCost: text(a.accounting.amortizedCost),
            credit: text(a.accounting.credit),
            creditInvariant: text(a.accounting.creditInvariant),
          }
        : undefined,
      potential: a.potential
        ? {
            potentialFunction: text(a.potential.potentialFunction),
            initialPotential: text(a.potential.initialPotential),
            amortizedCost: text(a.potential.amortizedCost),
            proof: text(a.potential.proof),
          }
        : undefined,
      result: text(a.result),
    };
  }

  /**
   * Normalize a comparison of algorithms
   */
  private normalizeComparison(c: Sent<"comparison">): AlgorithmComparison {
    return {
      algorithms: texts(c.algorithms),
      criteria: entries(c.criteria, (criterion) => ({
        criterion: text(criterion.criterion),
        values: criterion.values ?? {},
        winner: criterion.winner,
      })),
      recommendation: entries(c.recommendation, (r) => ({
        useCase: text(r.useCase),
        bestAlgorithm: text(r.bestAlgorithm),
        reasoning: text(r.reasoning),
      })),
    };
  }

  /**
   * Normalize an execution trace; a step with no number takes its position.
   */
  private normalizeExecutionTrace(
    trace: Sent<"executionTrace">,
  ): NonNullable<AlgorithmicThought["executionTrace"]> {
    return {
      input: text(trace.input),
      steps: entries(trace.steps, (step, i) => ({
        step: typeof step.step === "number" ? step.step : i + 1,
        state: text(step.state),
        action: text(step.action),
      })),
      output: text(trace.output),
    };
  }

  /**
   * Validate DP formulation
   */
  private validateDPFormulation(
    dp: Sent<"dpFormulation">,
  ): ReturnType<typeof createValidationWarning>[] {
    const warnings = [];

    if (!dp.recursiveDefinition?.recurrence) {
      warnings.push(
        createValidationWarning(
          "dpFormulation.recursiveDefinition.recurrence",
          "DP formulation without recurrence relation",
          "Specify the recurrence that defines optimal value",
        ),
      );
    }

    if (
      !dp.recursiveDefinition?.baseCases ||
      dp.recursiveDefinition.baseCases.length === 0
    ) {
      warnings.push(
        createValidationWarning(
          "dpFormulation.recursiveDefinition.baseCases",
          "No base cases specified",
          "Define base cases for the recurrence",
        ),
      );
    }

    if (!dp.characterization?.optimalSubstructure) {
      warnings.push(
        createValidationWarning(
          "dpFormulation.characterization.optimalSubstructure",
          "Optimal substructure not characterized",
          "Prove that optimal solution contains optimal subproblem solutions",
        ),
      );
    }

    return warnings;
  }

  /**
   * Validate correctness proof
   */
  private validateCorrectnessProof(
    proof: Sent<"correctnessProof">,
  ): ReturnType<typeof createValidationWarning>[] {
    const warnings = [];

    if (!proof.preconditions || proof.preconditions.length === 0) {
      warnings.push(
        createValidationWarning(
          "correctnessProof.preconditions",
          "No preconditions specified",
          "Define what the algorithm expects as input",
        ),
      );
    }

    if (!proof.postconditions || proof.postconditions.length === 0) {
      warnings.push(
        createValidationWarning(
          "correctnessProof.postconditions",
          "No postconditions specified",
          "Define what the algorithm guarantees as output",
        ),
      );
    }

    if (
      !proof.terminationArgument ||
      !proof.terminationArgument.decreasingQuantity
    ) {
      warnings.push(
        createValidationWarning(
          "correctnessProof.terminationArgument",
          "No termination argument",
          "Prove that the algorithm terminates",
        ),
      );
    }

    if (
      proof.method === "loop_invariant" &&
      (!proof.invariants || proof.invariants.length === 0)
    ) {
      warnings.push(
        createValidationWarning(
          "correctnessProof.invariants",
          "Loop invariant method without invariants",
          "Define the loop invariant(s)",
        ),
      );
    }

    return warnings;
  }
}
