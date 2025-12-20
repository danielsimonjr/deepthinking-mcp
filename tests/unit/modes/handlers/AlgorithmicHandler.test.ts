/**
 * AlgorithmicHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for Algorithmic reasoning handler including:
 * - Algorithm design pattern classification
 * - Complexity analysis (time/space)
 * - Correctness proof structures
 * - Dynamic programming and greedy formulations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AlgorithmicHandler } from '../../../../src/modes/handlers/AlgorithmicHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('AlgorithmicHandler', () => {
  let handler: AlgorithmicHandler;

  beforeEach(() => {
    handler = new AlgorithmicHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.ALGORITHMIC);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Algorithmic Analysis');
    });

    it('should have a description', () => {
      expect(handler.description).toBeDefined();
      expect(handler.description).toContain('CLRS');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Analyzing merge sort algorithm',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'algorithmic',
    };
    const sessionId = 'test-session-algorithmic';

    it('should create an algorithmic thought with default thought type', () => {
      const thought = handler.createThought(baseInput, sessionId);

      expect(thought.id).toBeDefined();
      expect(thought.sessionId).toBe(sessionId);
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect(thought.thoughtType).toBe('algorithm_definition');
      expect(thought.content).toBe(baseInput.thought);
    });

    it('should create thought with complexity_analysis type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'complexity_analysis',
        algorithm: 'Merge Sort',
        timeComplexity: {
          bestCase: 'Θ(n log n)',
          averageCase: 'Θ(n log n)',
          worstCase: 'Θ(n log n)',
          recurrence: 'T(n) = 2T(n/2) + Θ(n)',
          closedForm: 'Θ(n log n)',
        },
        spaceComplexity: {
          auxiliary: 'O(n)',
          total: 'O(n)',
          inPlace: false,
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('complexity_analysis');
      expect(thought.timeComplexity).toBeDefined();
      expect(thought.timeComplexity!.worstCase).toBe('Θ(n log n)');
      expect(thought.spaceComplexity).toBeDefined();
      expect(thought.spaceComplexity!.inPlace).toBe(false);
    });

    it('should create thought with dynamic_programming type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'dynamic_programming',
        algorithm: 'Longest Common Subsequence',
        designPattern: 'dynamic_programming',
        dpFormulation: {
          problem: 'Find LCS of two strings X and Y',
          characterization: {
            optimalSubstructure: 'LCS[i,j] depends on LCS[i-1,j-1], LCS[i-1,j], LCS[i,j-1]',
            subproblemDefinition: 'LCS of prefixes X[1..i] and Y[1..j]',
          },
          recursiveDefinition: {
            stateSpace: 'm × n table where m = |X|, n = |Y|',
            recurrence: 'LCS[i,j] = LCS[i-1,j-1] + 1 if X[i] == Y[j], else max(LCS[i-1,j], LCS[i,j-1])',
            baseCases: ['LCS[0,j] = 0', 'LCS[i,0] = 0'],
          },
          computationOrder: {
            direction: 'bottom_up',
            fillOrder: 'row by row, left to right',
          },
          complexity: {
            states: 'O(mn)',
            transitionCost: 'O(1)',
            total: 'O(mn)',
          },
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('dynamic_programming');
      expect(thought.dpFormulation).toBeDefined();
      expect(thought.dpFormulation!.recursiveDefinition.baseCases).toHaveLength(2);
      expect(thought.dpFormulation!.complexity.total).toBe('O(mn)');
    });

    it('should create thought with greedy_choice type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'greedy_choice',
        algorithm: 'Activity Selection',
        designPattern: 'greedy',
        greedyProof: {
          problem: 'Select maximum number of non-overlapping activities',
          greedyChoice: {
            description: 'Always select the activity with earliest finish time',
            localOptimum: 'First finishing activity',
            globalOptimumProof: 'Can always include earliest-finishing activity in optimal solution',
          },
          optimalSubstructure: {
            description: 'After selecting activity a, remaining problem is activities starting after a finishes',
            proof: 'Optimal solution to subproblem + greedy choice = optimal solution',
          },
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('greedy_choice');
      expect(thought.greedyProof).toBeDefined();
      expect(thought.designPattern).toBe('greedy');
    });

    it('should create thought with correctness_proof type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'correctness_proof',
        algorithm: 'Binary Search',
        correctnessProof: {
          algorithm: 'Binary Search',
          method: 'loop_invariant',
          preconditions: ['Array is sorted', 'Target value exists'],
          postconditions: ['Returns index of target, or -1 if not found'],
          invariants: [
            {
              description: 'If target exists, it is in arr[low..high]',
              initialization: 'low=0, high=n-1 contains all elements',
              maintenance: 'Each iteration halves the search space correctly',
              termination: 'low > high means target not found',
            },
          ],
          terminationArgument: {
            decreasingQuantity: 'high - low',
            lowerBound: '-1',
            proof: 'Each iteration either finds target or decreases high-low by at least half',
          },
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('correctness_proof');
      expect(thought.correctnessProof).toBeDefined();
      expect(thought.correctnessProof!.method).toBe('loop_invariant');
      expect(thought.correctnessProof!.invariants).toHaveLength(1);
    });

    it('should create thought with graph algorithm context', () => {
      const input = {
        ...baseInput,
        thoughtType: 'shortest_path',
        algorithm: "Dijkstra's Algorithm",
        clrsCategory: 'graph_algorithms',
        clrsAlgorithm: 'DIJKSTRA',
        graphContext: {
          graphType: 'weighted_directed',
          weighted: true,
          directed: true,
          representation: 'adjacency_list',
        },
        timeComplexity: {
          worstCase: 'O((V + E) log V)',
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('shortest_path');
      expect(thought.graphContext).toBeDefined();
      expect(thought.graphContext!.weighted).toBe(true);
      expect(thought.clrsAlgorithm).toBe('DIJKSTRA');
    });

    it('should create thought with amortized analysis', () => {
      const input = {
        ...baseInput,
        thoughtType: 'amortized_analysis',
        algorithm: 'Dynamic Array Resize',
        amortizedAnalysis: {
          method: 'accounting',
          operations: ['insert'],
          actualCosts: ['O(1) usually, O(n) on resize'],
          result: 'O(1) amortized per insert',
          potentialFunction: 'Φ = 2n - capacity',
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('amortized_analysis');
      expect(thought.amortizedAnalysis).toBeDefined();
      expect(thought.amortizedAnalysis!.method).toBe('accounting');
    });

    it('should create thought with recurrence', () => {
      const input = {
        ...baseInput,
        thoughtType: 'recurrence_solving',
        algorithm: 'Quick Sort (average case)',
        recurrence: {
          formula: 'T(n) = 2T(n/2) + Θ(n)',
          method: 'master_theorem',
          solution: 'Θ(n log n)',
          derivation: 'Case 2 of Master Theorem: a=2, b=2, f(n)=Θ(n)=Θ(n^log_b(a))',
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('recurrence_solving');
      expect(thought.recurrence).toBeDefined();
      expect(thought.recurrence!.solution).toBe('Θ(n log n)');
    });

    it('should create thought with dependencies and assumptions', () => {
      const input = {
        ...baseInput,
        dependencies: ['Comparison-based sorting lower bound'],
        assumptions: ['Comparisons are O(1)', 'Random access memory'],
        uncertainty: 0.1,
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.dependencies).toHaveLength(1);
      expect(thought.assumptions).toHaveLength(2);
      expect(thought.uncertainty).toBe(0.1);
    });

    it('should default to algorithm_definition for invalid thought type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'invalid_type',
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('algorithm_definition');
    });
  });

  describe('validate', () => {
    it('should fail when thought content is empty', () => {
      const input = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'algorithmic',
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should fail when thoughtNumber exceeds totalThoughts', () => {
      const input = {
        thought: 'Analysis',
        thoughtNumber: 5,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'algorithmic',
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_THOUGHT_NUMBER')).toBe(true);
    });

    it('should fail when uncertainty is out of range', () => {
      const input = {
        thought: 'Analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'algorithmic',
        uncertainty: 1.5,
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'UNCERTAINTY_OUT_OF_RANGE')).toBe(true);
    });

    it('should warn about unknown thought type', () => {
      const input = {
        thought: 'Analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'algorithmic',
        thoughtType: 'unknown_type',
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'thoughtType')).toBe(true);
    });

    it('should warn about unknown design pattern', () => {
      const input = {
        thought: 'Analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'algorithmic',
        designPattern: 'unknown_pattern',
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'designPattern')).toBe(true);
    });

    it('should warn about algorithm_definition without time complexity', () => {
      const input = {
        thought: 'Defining algorithm',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'algorithmic',
        thoughtType: 'algorithm_definition',
        algorithm: 'Custom Algorithm',
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'timeComplexity')).toBe(true);
    });

    it('should warn about dynamic_programming without dpFormulation', () => {
      const input = {
        thought: 'DP analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'algorithmic',
        thoughtType: 'dynamic_programming',
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'dpFormulation')).toBe(true);
    });

    it('should warn about incomplete DP formulation', () => {
      const input = {
        thought: 'DP analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'algorithmic',
        dpFormulation: {
          problem: 'LCS',
          recursiveDefinition: {
            stateSpace: 'm × n',
            // Missing recurrence and baseCases
          },
          // Missing characterization
        },
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('recurrence'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('base cases'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('substructure'))).toBe(true);
    });

    it('should warn about incomplete correctness proof', () => {
      const input = {
        thought: 'Correctness proof',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'algorithmic',
        correctnessProof: {
          algorithm: 'Binary Search',
          method: 'loop_invariant',
          // Missing preconditions, postconditions, invariants, termination
        },
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('preconditions'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('postconditions'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('termination'))).toBe(true);
    });

    it('should pass validation with complete algorithmic analysis', () => {
      const input = {
        thought: 'Complete analysis',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'algorithmic',
        thoughtType: 'algorithm_definition',
        algorithm: 'Merge Sort',
        designPattern: 'divide_and_conquer',
        timeComplexity: {
          worstCase: 'O(n log n)',
        },
        uncertainty: 0.1,
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide algorithm_definition specific guidance', () => {
      const thought = handler.createThought(
        {
          thought: 'Defining algorithm',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
          thoughtType: 'algorithm_definition',
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('input/output'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('design pattern'))).toBe(true);
    });

    it('should provide complexity_analysis specific guidance', () => {
      const thought = handler.createThought(
        {
          thought: 'Complexity analysis',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
          thoughtType: 'complexity_analysis',
          timeComplexity: {
            worstCase: 'O(n log n)',
          },
          spaceComplexity: {
            auxiliary: 'O(n)',
          },
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('Master Theorem'))).toBe(true);
      expect(enhancements.metrics!.worstCase).toBe('O(n log n)');
      expect(enhancements.metrics!.spaceComplexity).toBe('O(n)');
    });

    it('should provide dynamic_programming specific guidance', () => {
      const thought = handler.createThought(
        {
          thought: 'DP analysis',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
          thoughtType: 'dynamic_programming',
          dpFormulation: {
            recursiveDefinition: {
              stateSpace: 'm × n',
              recurrence: 'LCS[i,j] = ...',
              baseCases: ['LCS[0,j] = 0'],
            },
            complexity: {
              total: 'O(mn)',
            },
          },
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('optimal substructure'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('State space'))).toBe(true);
    });

    it('should provide greedy_choice specific guidance', () => {
      const thought = handler.createThought(
        {
          thought: 'Greedy analysis',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
          thoughtType: 'greedy_choice',
          greedyProof: {
            problem: 'Activity Selection',
            greedyChoice: {
              description: 'Select earliest finishing',
            },
          },
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('greedy choice'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('Greedy choice property'))).toBe(true);
    });

    it('should provide correctness_proof specific guidance', () => {
      const thought = handler.createThought(
        {
          thought: 'Correctness proof',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
          thoughtType: 'correctness_proof',
          correctnessProof: {
            algorithm: 'Binary Search',
            method: 'loop_invariant',
          },
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('loop invariant'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('Proof method'))).toBe(true);
    });

    it('should provide recurrence_solving specific guidance', () => {
      const thought = handler.createThought(
        {
          thought: 'Solving recurrence',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
          thoughtType: 'recurrence_solving',
          recurrence: {
            formula: 'T(n) = 2T(n/2) + n',
            solution: 'Θ(n log n)',
          },
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('method'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('Recurrence'))).toBe(true);
    });

    it('should provide amortized_analysis specific guidance', () => {
      const thought = handler.createThought(
        {
          thought: 'Amortized analysis',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
          thoughtType: 'amortized_analysis',
          amortizedAnalysis: {
            method: 'potential',
            result: 'O(1) amortized',
          },
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('aggregate'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('Method'))).toBe(true);
    });

    it('should provide graph algorithm specific guidance', () => {
      const thought = handler.createThought(
        {
          thought: 'Shortest path analysis',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
          thoughtType: 'shortest_path',
          graphContext: {
            graphType: 'weighted_directed',
            weighted: true,
          },
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.graphType).toBe('weighted_directed');
      expect(enhancements.suggestions!.some((s) => s.includes('weighted'))).toBe(true);
    });

    it('should warn about high uncertainty', () => {
      const thought = handler.createThought(
        {
          thought: 'Uncertain analysis',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
          uncertainty: 0.85,
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some((w) => w.includes('High uncertainty'))).toBe(true);
    });

    it('should include algorithmic mental models', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toBeDefined();
      expect(enhancements.mentalModels!.some((m) => m.includes('Divide and Conquer'))).toBe(true);
      expect(enhancements.mentalModels!.some((m) => m.includes('Dynamic Programming'))).toBe(true);
      expect(enhancements.mentalModels!.some((m) => m.includes('Master Theorem'))).toBe(true);
    });

    it('should suggest related modes', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.MATHEMATICS);
      expect(enhancements.relatedModes).toContain(ThinkingMode.COMPUTABILITY);
    });

    it('should include CLRS references in suggestions', () => {
      const thought = handler.createThought(
        {
          thought: 'CLRS algorithm',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
          clrsAlgorithm: 'MERGE-SORT',
          clrsCategory: 'sorting',
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('CLRS'))).toBe(true);
      expect(enhancements.metrics!.clrsCategory).toBe('sorting');
    });
  });

  describe('supportsThoughtType', () => {
    const supportedTypes = [
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

    supportedTypes.forEach((type) => {
      it(`should support ${type}`, () => {
        expect(handler.supportsThoughtType(type)).toBe(true);
      });
    });

    it('should not support unknown types', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
      expect(handler.supportsThoughtType('requirements_analysis')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete algorithm analysis workflow', () => {
      const sessionId = 'e2e-algorithmic';

      // Step 1: Algorithm Definition
      const step1 = handler.createThought(
        {
          thought: 'Defining QuickSort algorithm',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'algorithmic',
          thoughtType: 'algorithm_definition',
          algorithm: 'QuickSort',
          designPattern: 'divide_and_conquer',
          clrsCategory: 'sorting',
          clrsAlgorithm: 'QUICKSORT',
          pseudocode: 'QUICKSORT(A, p, r)\n  if p < r\n    q = PARTITION(A, p, r)\n    QUICKSORT(A, p, q-1)\n    QUICKSORT(A, q+1, r)',
        } as any,
        sessionId
      );
      expect(step1.thoughtType).toBe('algorithm_definition');
      expect(step1.designPattern).toBe('divide_and_conquer');

      // Step 2: Recurrence Analysis
      const step2Input = {
        thought: 'Analyzing QuickSort recurrence',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'algorithmic',
        thoughtType: 'recurrence_solving',
        algorithm: 'QuickSort',
        recurrence: {
          formula: 'T(n) = T(k) + T(n-k-1) + Θ(n)',
          method: 'recursion_tree',
          solution: 'O(n²) worst case, O(n log n) average',
          derivation: 'Worst case: k=0 or k=n-1 always. Average: k ≈ n/2',
        },
      };
      const step2 = handler.createThought(step2Input as any, sessionId);
      expect(step2.recurrence!.solution).toContain('log n');

      // Step 3: Complexity Analysis
      const step3Input = {
        thought: 'Complete complexity analysis',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'algorithmic',
        thoughtType: 'complexity_analysis',
        algorithm: 'QuickSort',
        timeComplexity: {
          bestCase: 'Ω(n log n)',
          averageCase: 'Θ(n log n)',
          worstCase: 'O(n²)',
          recurrence: 'T(n) = 2T(n/2) + Θ(n) average',
          closedForm: 'Θ(n log n) average',
          inputSensitive: true,
        },
        spaceComplexity: {
          auxiliary: 'O(log n)',
          total: 'O(n)',
          inPlace: true,
          stackDepth: 'O(log n) average, O(n) worst',
        },
      };
      const step3 = handler.createThought(step3Input as any, sessionId);
      const validation3 = handler.validate(step3Input as any);
      expect(validation3.valid).toBe(true);
      expect(step3.timeComplexity!.worstCase).toBe('O(n²)');
      expect(step3.spaceComplexity!.inPlace).toBe(true);

      // Step 4: Loop Invariant
      const step4Input = {
        thought: 'Identifying partition invariant',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'algorithmic',
        thoughtType: 'invariant_identification',
        algorithm: 'PARTITION',
        loopInvariants: [
          {
            description: 'Elements A[p..i] ≤ pivot, elements A[i+1..j-1] > pivot',
            initialization: 'Before first iteration, no elements processed',
            maintenance: 'Each iteration correctly places element relative to pivot',
            termination: 'When j reaches r, all elements partitioned correctly',
          },
        ],
      };
      const step4 = handler.createThought(step4Input as any, sessionId);
      expect(step4.loopInvariants).toHaveLength(1);

      // Step 5: Correctness Proof
      const step5 = handler.createThought(
        {
          thought: 'Proving QuickSort correctness',
          thoughtNumber: 5,
          totalThoughts: 5,
          nextThoughtNeeded: false,
          mode: 'algorithmic',
          thoughtType: 'correctness_proof',
          algorithm: 'QuickSort',
          correctnessProof: {
            algorithm: 'QuickSort',
            method: 'induction',
            preconditions: ['Array A[p..r] with valid indices'],
            postconditions: ['A[p..r] is sorted'],
            inductionBase: 'Array of size 0 or 1 is trivially sorted',
            inductionStep: 'If PARTITION correct and recursive calls sort subarrays, then full array sorted',
            terminationArgument: {
              decreasingQuantity: 'subarray size (r - p)',
              lowerBound: '0',
              proof: 'Each recursive call processes smaller subarray until size ≤ 1',
            },
            keyInsights: [
              'Pivot is in final position after PARTITION',
              'All elements ≤ pivot are left of it, all > pivot are right',
              'Recursive calls maintain this invariant',
            ],
          },
          keyInsight: 'QuickSort is correct by strong induction on array size',
        } as any,
        sessionId
      );
      expect(step5.correctnessProof!.method).toBe('induction');
      expect(step5.keyInsight).toBeDefined();

      // Final enhancements
      const finalEnhancements = handler.getEnhancements(step5);
      expect(finalEnhancements.suggestions!.some((s) => s.includes('QuickSort'))).toBe(true);
    });

    it('should handle dynamic programming formulation workflow', () => {
      const sessionId = 'e2e-dp';

      // Complete DP formulation for 0/1 Knapsack
      const input = {
        thought: 'Complete 0/1 Knapsack DP formulation',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'algorithmic',
        thoughtType: 'dynamic_programming',
        algorithm: '0/1 Knapsack',
        designPattern: 'dynamic_programming',
        dpFormulation: {
          problem: 'Maximize value of items in knapsack with weight limit W',
          characterization: {
            optimalSubstructure: 'OPT(i,w) = max of including item i or not',
            subproblemDefinition: 'Maximum value using items 1..i with capacity w',
          },
          recursiveDefinition: {
            stateSpace: 'n × W table where n = number of items',
            recurrence: 'K[i,w] = max(K[i-1,w], K[i-1,w-w_i] + v_i) if w_i ≤ w, else K[i-1,w]',
            baseCases: ['K[0,w] = 0 for all w', 'K[i,0] = 0 for all i'],
          },
          computationOrder: {
            direction: 'bottom_up',
            fillOrder: 'row by row (increasing i), left to right (increasing w)',
          },
          reconstruction: {
            method: 'Backtrack through table to find included items',
            traceback: 'Start at K[n,W], move up if K[i,w]=K[i-1,w], else include item i',
          },
          complexity: {
            states: 'O(nW)',
            transitionCost: 'O(1)',
            total: 'O(nW)',
          },
        },
        timeComplexity: {
          worstCase: 'O(nW)',
        },
        spaceComplexity: {
          auxiliary: 'O(nW)',
          total: 'O(nW)',
        },
      };

      const thought = handler.createThought(input as any, sessionId);
      const validation = handler.validate(input as any);

      expect(validation.valid).toBe(true);
      expect(thought.dpFormulation!.recursiveDefinition.baseCases).toHaveLength(2);
      expect(thought.dpFormulation!.complexity.total).toBe('O(nW)');

      const enhancements = handler.getEnhancements(thought);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('overlapping'))).toBe(true);
    });
  });
});
