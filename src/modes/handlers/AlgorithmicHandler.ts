/**
 * AlgorithmicHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Algorithmic reasoning with:
 * - Algorithm design pattern classification
 * - Complexity analysis (time/space)
 * - Correctness proof structures
 * - Dynamic programming and greedy formulations
 */

import { randomUUID } from 'crypto';
import { ThinkingMode } from '../../types/core.js';
import type {
  AlgorithmicThought,
  AlgorithmicThoughtType,
  DesignPattern,
  TimeComplexity,
  SpaceComplexity,
  CorrectnessProof,
  DPFormulation,
  GreedyProof,
} from '../../types/modes/algorithmic.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * Valid algorithmic thought types
 */
const VALID_THOUGHT_TYPES: AlgorithmicThoughtType[] = [
  'algorithm_definition',
  'complexity_analysis',
  'recurrence_solving',
  'correctness_proof',
  'invariant_identification',
  'divide_and_conquer',
  'dynamic_programming',
  'greedy_choice',
  'backtracking',
  'branch_and_bound',
  'randomized_analysis',
  'amortized_analysis',
  'data_structure_design',
  'data_structure_analysis',
  'augmentation',
  'graph_traversal',
  'shortest_path',
  'minimum_spanning_tree',
  'network_flow',
  'matching',
  'string_matching',
  'computational_geometry',
  'number_theoretic',
  'approximation',
  'online_algorithm',
  'parallel_algorithm',
];

/**
 * Valid design patterns
 */
const VALID_DESIGN_PATTERNS: DesignPattern[] = [
  'brute_force',
  'divide_and_conquer',
  'dynamic_programming',
  'greedy',
  'backtracking',
  'branch_and_bound',
  'randomized',
  'approximation',
  'online',
  'parallel',
  'incremental',
  'prune_and_search',
];

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
  readonly modeName = 'Algorithmic Analysis';
  readonly description = 'Algorithm design, complexity analysis, and correctness proofs (CLRS coverage)';

  /**
   * Supported thought types for algorithmic mode
   */
  private readonly supportedThoughtTypes = VALID_THOUGHT_TYPES;

  /**
   * Create an algorithmic thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): AlgorithmicThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Process time complexity
    const timeComplexity = inputAny.timeComplexity
      ? this.normalizeTimeComplexity(inputAny.timeComplexity)
      : undefined;

    // Process space complexity
    const spaceComplexity = inputAny.spaceComplexity
      ? this.normalizeSpaceComplexity(inputAny.spaceComplexity)
      : undefined;

    // Process correctness proof
    const correctnessProof = inputAny.correctnessProof
      ? this.normalizeCorrectnessProof(inputAny.correctnessProof)
      : undefined;

    // Process DP formulation
    const dpFormulation = inputAny.dpFormulation
      ? this.normalizeDPFormulation(inputAny.dpFormulation)
      : undefined;

    // Process greedy proof
    const greedyProof = inputAny.greedyProof
      ? this.normalizeGreedyProof(inputAny.greedyProof)
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
      algorithm: inputAny.algorithm,
      clrsCategory: inputAny.clrsCategory,
      clrsAlgorithm: inputAny.clrsAlgorithm,
      designPattern: inputAny.designPattern,
      timeComplexity,
      spaceComplexity,
      recurrence: inputAny.recurrence,
      correctnessProof,
      loopInvariants: inputAny.loopInvariants,
      dpFormulation,
      greedyProof,
      graphContext: inputAny.graphContext,
      dataStructure: inputAny.dataStructure,
      amortizedAnalysis: inputAny.amortizedAnalysis,
      comparison: inputAny.comparison,
      pseudocode: inputAny.pseudocode,
      executionTrace: inputAny.executionTrace,
      keyInsight: inputAny.keyInsight,

      // Dependencies and assumptions
      dependencies: input.dependencies || [],
      assumptions: input.assumptions || [],
      uncertainty: input.uncertainty ?? 0.5,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate algorithmic-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors = [];
    const warnings = [];
    const inputAny = input as any;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Validate thought type
    if (inputAny.thoughtType && !VALID_THOUGHT_TYPES.includes(inputAny.thoughtType)) {
      warnings.push(
        createValidationWarning(
          'thoughtType',
          `Unknown thought type: ${inputAny.thoughtType}`,
          `Valid types include: ${VALID_THOUGHT_TYPES.slice(0, 5).join(', ')}...`
        )
      );
    }

    // Validate design pattern
    if (inputAny.designPattern && !VALID_DESIGN_PATTERNS.includes(inputAny.designPattern)) {
      warnings.push(
        createValidationWarning(
          'designPattern',
          `Unknown design pattern: ${inputAny.designPattern}`,
          `Valid patterns: ${VALID_DESIGN_PATTERNS.join(', ')}`
        )
      );
    }

    // Validate uncertainty
    if (input.uncertainty !== undefined) {
      if (input.uncertainty < 0 || input.uncertainty > 1) {
        errors.push(
          createValidationError(
            'uncertainty',
            `Uncertainty (${input.uncertainty}) must be between 0 and 1`,
            'UNCERTAINTY_OUT_OF_RANGE'
          )
        );
      }
    }

    // Validate DP formulation
    if (inputAny.dpFormulation) {
      const dpWarnings = this.validateDPFormulation(inputAny.dpFormulation);
      warnings.push(...dpWarnings);
    }

    // Validate correctness proof
    if (inputAny.correctnessProof) {
      const proofWarnings = this.validateCorrectnessProof(inputAny.correctnessProof);
      warnings.push(...proofWarnings);
    }

    // Suggest complexity analysis for algorithm definition
    if (inputAny.thoughtType === 'algorithm_definition' && !inputAny.timeComplexity) {
      warnings.push(
        createValidationWarning(
          'timeComplexity',
          'Algorithm definition without complexity analysis',
          'Include time complexity for complete specification'
        )
      );
    }

    // Suggest DP formulation for dynamic programming
    if (inputAny.thoughtType === 'dynamic_programming' && !inputAny.dpFormulation) {
      warnings.push(
        createValidationWarning(
          'dpFormulation',
          'DP thought without formulation',
          'Include the four-step DP formulation'
        )
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
      relatedModes: [ThinkingMode.MATHEMATICS, ThinkingMode.COMPUTABILITY, ThinkingMode.OPTIMIZATION],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        dependencyCount: thought.dependencies?.length || 0,
        assumptionCount: thought.assumptions?.length || 0,
        uncertainty: thought.uncertainty,
      },
      mentalModels: [
        'Divide and Conquer',
        'Dynamic Programming',
        'Greedy Choice Property',
        'Master Theorem',
        'Loop Invariants',
        'Amortized Analysis',
      ],
    };

    // Thought type-specific guidance
    switch (thought.thoughtType) {
      case 'algorithm_definition':
        enhancements.guidingQuestions!.push(
          'What is the input/output specification?',
          'What design pattern does this follow?',
          'Is the algorithm correct for all valid inputs?'
        );
        break;

      case 'complexity_analysis':
        enhancements.guidingQuestions!.push(
          'What is the dominant operation?',
          'Can we apply the Master Theorem?',
          'Is the analysis tight (Θ) or just upper bound (O)?'
        );
        if (thought.timeComplexity) {
          enhancements.metrics!.worstCase = thought.timeComplexity.worstCase;
          enhancements.suggestions!.push(
            `Time: ${thought.timeComplexity.worstCase}`
          );
        }
        if (thought.spaceComplexity) {
          enhancements.metrics!.spaceComplexity = thought.spaceComplexity.auxiliary;
        }
        break;

      case 'recurrence_solving':
        enhancements.guidingQuestions!.push(
          'Which method applies: Master Theorem, substitution, or recursion tree?',
          'What is the recurrence relation?',
          'Is the solution tight?'
        );
        if (thought.recurrence) {
          enhancements.suggestions!.push(
            `Recurrence: ${thought.recurrence.formula}`,
            `Solution: ${thought.recurrence.solution}`
          );
        }
        break;

      case 'correctness_proof':
        enhancements.guidingQuestions!.push(
          'What are the preconditions and postconditions?',
          'What is the loop invariant?',
          'Why does the algorithm terminate?'
        );
        if (thought.correctnessProof) {
          enhancements.suggestions!.push(
            `Proof method: ${thought.correctnessProof.method}`
          );
        }
        break;

      case 'invariant_identification':
        enhancements.guidingQuestions!.push(
          'Does the invariant hold at initialization?',
          'Is it maintained through each iteration?',
          'What does the invariant imply at termination?'
        );
        if (thought.loopInvariants) {
          enhancements.metrics!.invariantCount = thought.loopInvariants.length;
        }
        break;

      case 'divide_and_conquer':
        enhancements.guidingQuestions!.push(
          'How is the problem divided?',
          'What are the subproblems?',
          'How are solutions combined?'
        );
        enhancements.suggestions!.push(
          'Apply recurrence analysis using Master Theorem'
        );
        break;

      case 'dynamic_programming':
        enhancements.guidingQuestions!.push(
          'What is the optimal substructure?',
          'Are there overlapping subproblems?',
          'What is the recurrence relation?'
        );
        if (thought.dpFormulation) {
          enhancements.suggestions!.push(
            `State space: ${thought.dpFormulation.recursiveDefinition.stateSpace}`,
            `Complexity: ${thought.dpFormulation.complexity.total}`
          );
        }
        break;

      case 'greedy_choice':
        enhancements.guidingQuestions!.push(
          'What is the greedy choice?',
          'Why is the greedy choice safe?',
          'Is there optimal substructure?'
        );
        if (thought.greedyProof) {
          enhancements.suggestions!.push(
            'Greedy choice property verified'
          );
        }
        break;

      case 'amortized_analysis':
        enhancements.guidingQuestions!.push(
          'Which method: aggregate, accounting, or potential?',
          'What is the amortized cost per operation?',
          'Is the credit/potential always non-negative?'
        );
        if (thought.amortizedAnalysis) {
          enhancements.suggestions!.push(
            `Method: ${thought.amortizedAnalysis.method}`,
            `Amortized cost: ${thought.amortizedAnalysis.result}`
          );
        }
        break;

      case 'graph_traversal':
      case 'shortest_path':
      case 'minimum_spanning_tree':
      case 'network_flow':
        if (thought.graphContext) {
          enhancements.metrics!.graphType = thought.graphContext.graphType;
          enhancements.metrics!.weighted = thought.graphContext.weighted ? 1 : 0;
          enhancements.suggestions!.push(
            `Graph: ${thought.graphContext.graphType}, ${thought.graphContext.weighted ? 'weighted' : 'unweighted'}`
          );
        }
        break;
    }

    // Design pattern analysis
    if (thought.designPattern) {
      enhancements.metrics!.designPattern = thought.designPattern;
      enhancements.suggestions!.push(`Design pattern: ${thought.designPattern}`);
    }

    // CLRS reference
    if (thought.clrsAlgorithm) {
      enhancements.suggestions!.push(`CLRS Algorithm: ${thought.clrsAlgorithm}`);
    }
    if (thought.clrsCategory) {
      enhancements.metrics!.clrsCategory = thought.clrsCategory;
    }

    // Algorithm comparison
    if (thought.comparison) {
      enhancements.metrics!.alternativeCount = thought.comparison.algorithms.length;
    }

    // Key insight
    if (thought.keyInsight) {
      enhancements.suggestions!.push(`Key insight: ${thought.keyInsight}`);
    }

    // High uncertainty warning
    if (thought.uncertainty > 0.7) {
      enhancements.warnings!.push(
        'High uncertainty - verify analysis carefully'
      );
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as AlgorithmicThoughtType);
  }

  /**
   * Resolve thought type from input
   */
  private resolveThoughtType(inputType: string | undefined): AlgorithmicThoughtType {
    if (inputType && VALID_THOUGHT_TYPES.includes(inputType as AlgorithmicThoughtType)) {
      return inputType as AlgorithmicThoughtType;
    }
    return 'algorithm_definition';
  }

  /**
   * Normalize time complexity
   */
  private normalizeTimeComplexity(tc: any): TimeComplexity {
    return {
      bestCase: tc.bestCase || 'Ω(1)',
      averageCase: tc.averageCase || tc.worstCase || 'O(n)',
      worstCase: tc.worstCase || 'O(n)',
      amortized: tc.amortized,
      recurrence: tc.recurrence,
      closedForm: tc.closedForm,
      masterTheorem: tc.masterTheorem,
      inputSensitive: tc.inputSensitive,
    };
  }

  /**
   * Normalize space complexity
   */
  private normalizeSpaceComplexity(sc: any): SpaceComplexity {
    return {
      auxiliary: sc.auxiliary || 'O(1)',
      total: sc.total || sc.auxiliary || 'O(n)',
      inPlace: sc.inPlace ?? false,
      stackDepth: sc.stackDepth,
      cacheEfficiency: sc.cacheEfficiency,
    };
  }

  /**
   * Normalize correctness proof
   */
  private normalizeCorrectnessProof(proof: any): CorrectnessProof {
    return {
      id: proof.id || randomUUID(),
      algorithm: proof.algorithm || '',
      method: proof.method || 'loop_invariant',
      preconditions: proof.preconditions || [],
      postconditions: proof.postconditions || [],
      invariants: proof.invariants,
      inductionBase: proof.inductionBase,
      inductionStep: proof.inductionStep,
      terminationArgument: proof.terminationArgument || {
        decreasingQuantity: '',
        lowerBound: '',
        proof: '',
      },
      proofSteps: proof.proofSteps || [],
      keyInsights: proof.keyInsights || [],
    };
  }

  /**
   * Normalize DP formulation
   */
  private normalizeDPFormulation(dp: any): DPFormulation {
    return {
      id: dp.id || randomUUID(),
      problem: dp.problem || '',
      characterization: dp.characterization || {
        optimalSubstructure: '',
        subproblemDefinition: '',
      },
      recursiveDefinition: dp.recursiveDefinition || {
        stateSpace: '',
        recurrence: '',
        baseCases: [],
      },
      computationOrder: dp.computationOrder || {
        direction: 'bottom_up',
        fillOrder: '',
      },
      reconstruction: dp.reconstruction || {
        method: '',
        traceback: '',
      },
      complexity: dp.complexity || {
        states: '',
        transitionCost: '',
        total: '',
      },
      optimizations: dp.optimizations,
    };
  }

  /**
   * Normalize greedy proof
   */
  private normalizeGreedyProof(proof: any): GreedyProof {
    return {
      id: proof.id || randomUUID(),
      problem: proof.problem || '',
      greedyChoice: proof.greedyChoice || {
        description: '',
        localOptimum: '',
        globalOptimumProof: '',
      },
      optimalSubstructure: proof.optimalSubstructure || {
        description: '',
        proof: '',
      },
      exchangeArgument: proof.exchangeArgument,
      matroid: proof.matroid,
    };
  }

  /**
   * Validate DP formulation
   */
  private validateDPFormulation(dp: any): any[] {
    const warnings = [];

    if (!dp.recursiveDefinition?.recurrence) {
      warnings.push(
        createValidationWarning(
          'dpFormulation.recursiveDefinition.recurrence',
          'DP formulation without recurrence relation',
          'Specify the recurrence that defines optimal value'
        )
      );
    }

    if (!dp.recursiveDefinition?.baseCases || dp.recursiveDefinition.baseCases.length === 0) {
      warnings.push(
        createValidationWarning(
          'dpFormulation.recursiveDefinition.baseCases',
          'No base cases specified',
          'Define base cases for the recurrence'
        )
      );
    }

    if (!dp.characterization?.optimalSubstructure) {
      warnings.push(
        createValidationWarning(
          'dpFormulation.characterization.optimalSubstructure',
          'Optimal substructure not characterized',
          'Prove that optimal solution contains optimal subproblem solutions'
        )
      );
    }

    return warnings;
  }

  /**
   * Validate correctness proof
   */
  private validateCorrectnessProof(proof: any): any[] {
    const warnings = [];

    if (!proof.preconditions || proof.preconditions.length === 0) {
      warnings.push(
        createValidationWarning(
          'correctnessProof.preconditions',
          'No preconditions specified',
          'Define what the algorithm expects as input'
        )
      );
    }

    if (!proof.postconditions || proof.postconditions.length === 0) {
      warnings.push(
        createValidationWarning(
          'correctnessProof.postconditions',
          'No postconditions specified',
          'Define what the algorithm guarantees as output'
        )
      );
    }

    if (!proof.terminationArgument || !proof.terminationArgument.decreasingQuantity) {
      warnings.push(
        createValidationWarning(
          'correctnessProof.terminationArgument',
          'No termination argument',
          'Prove that the algorithm terminates'
        )
      );
    }

    if (proof.method === 'loop_invariant' && (!proof.invariants || proof.invariants.length === 0)) {
      warnings.push(
        createValidationWarning(
          'correctnessProof.invariants',
          'Loop invariant method without invariants',
          'Define the loop invariant(s)'
        )
      );
    }

    return warnings;
  }
}
