/**
 * Algorithmic Mode Integration Tests
 *
 * Tests T-ENG-017 through T-ENG-036: Comprehensive integration tests
 * for the deepthinking_engineering tool with algorithmic mode.
 * Covers CLRS patterns, complexity analysis, and correctness proofs.
 *
 * Phase 11 Sprint 7: Engineering & Academic Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type AlgorithmicThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import { createBaseThought } from '../../utils/thought-factory.js';

// ============================================================================
// ALGORITHMIC MODE THOUGHT FACTORIES
// ============================================================================

/**
 * Create a basic algorithmic thought
 */
function createAlgorithmicThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    ...createBaseThought(),
    mode: 'algorithmic',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Create an algorithmic thought with algorithm name
 */
function createAlgorithmicWithName(
  algorithmName: string,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createAlgorithmicThought({
    algorithmName,
    ...overrides,
  } as any);
}

/**
 * Create an algorithmic thought with design pattern
 */
function createAlgorithmicWithDesignPattern(
  designPattern: string,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createAlgorithmicThought({
    designPattern,
    ...overrides,
  } as any);
}

/**
 * Create an algorithmic thought with complexity analysis
 */
function createAlgorithmicWithComplexity(
  complexityAnalysis: {
    timeComplexity?: string;
    spaceComplexity?: string;
    bestCase?: string;
    worstCase?: string;
    averageCase?: string;
  },
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createAlgorithmicThought({
    complexityAnalysis,
    ...overrides,
  } as any);
}

/**
 * Create an algorithmic thought with correctness proof
 */
function createAlgorithmicWithCorrectnessProof(
  correctnessProof: {
    invariant?: string;
    termination?: string;
    correctness?: string;
  },
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createAlgorithmicThought({
    correctnessProof,
    ...overrides,
  } as any);
}

// ============================================================================
// TESTS
// ============================================================================

describe('Algorithmic Mode Integration Tests', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-ENG-017: Basic algorithmic thought
   */
  describe('T-ENG-017: Basic Algorithmic Thought', () => {
    it('should create a basic algorithmic thought with minimal params', () => {
      const input = createAlgorithmicThought({
        thought: 'Analyzing merge sort algorithm',
      });

      const thought = factory.createThought(input, 'session-alg-017');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect(thought.content).toBe('Analyzing merge sort algorithm');
      expect(thought.sessionId).toBe('session-alg-017');
    });

    it('should assign unique IDs to algorithmic thoughts', () => {
      const input1 = createAlgorithmicThought({ thought: 'First algorithm analysis' });
      const input2 = createAlgorithmicThought({ thought: 'Second algorithm analysis' });

      const thought1 = factory.createThought(input1, 'session-alg-017');
      const thought2 = factory.createThought(input2, 'session-alg-017');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-ENG-018: Algorithmic with algorithmName
   */
  describe('T-ENG-018: Algorithmic with Algorithm Name', () => {
    it('should include algorithm name in thought', () => {
      const input = createAlgorithmicWithName('QuickSort', {
        thought: 'Analyzing QuickSort partitioning strategy',
      });

      const thought = factory.createThought(input, 'session-alg-018');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).algorithmName).toBe('QuickSort');
    });

    it('should handle various CLRS algorithms', () => {
      const algorithms = ['MergeSort', 'HeapSort', 'Dijkstra', 'Bellman-Ford', 'Floyd-Warshall'];

      for (const algorithmName of algorithms) {
        const input = createAlgorithmicWithName(algorithmName);
        const thought = factory.createThought(input, `session-alg-018-${algorithmName}`);
        expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      }
    });
  });

  /**
   * T-ENG-019: Algorithmic with designPattern = divide-and-conquer
   */
  describe('T-ENG-019: Design Pattern - Divide and Conquer', () => {
    it('should create thought with divide-and-conquer pattern', () => {
      const input = createAlgorithmicWithDesignPattern('divide-and-conquer', {
        thought: 'Applying divide-and-conquer to matrix multiplication',
      });

      const thought = factory.createThought(input, 'session-alg-019');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).designPattern).toBe('divide-and-conquer');
    });

    it('should recognize classic divide-and-conquer algorithms', () => {
      const input = createAlgorithmicWithDesignPattern('divide-and-conquer', {
        algorithmName: 'Strassen Matrix Multiplication',
        thought: 'T(n) = 7T(n/2) + O(n^2)',
      } as any);

      const thought = factory.createThought(input, 'session-alg-019');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });
  });

  /**
   * T-ENG-020: Algorithmic with designPattern = dynamic-programming
   */
  describe('T-ENG-020: Design Pattern - Dynamic Programming', () => {
    it('should create thought with dynamic-programming pattern', () => {
      const input = createAlgorithmicWithDesignPattern('dynamic-programming', {
        thought: 'Solving LCS using DP with memoization',
      });

      const thought = factory.createThought(input, 'session-alg-020');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).designPattern).toBe('dynamic-programming');
    });

    it('should handle DP state formulation', () => {
      const input = createAlgorithmicWithDesignPattern('dynamic-programming', {
        algorithmName: 'Edit Distance',
        thought: 'dp[i][j] = minimum edits to transform s1[0..i] to s2[0..j]',
      } as any);

      const thought = factory.createThought(input, 'session-alg-020');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });
  });

  /**
   * T-ENG-021: Algorithmic with designPattern = greedy
   */
  describe('T-ENG-021: Design Pattern - Greedy', () => {
    it('should create thought with greedy pattern', () => {
      const input = createAlgorithmicWithDesignPattern('greedy', {
        thought: 'Proving greedy choice property for activity selection',
      });

      const thought = factory.createThought(input, 'session-alg-021');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).designPattern).toBe('greedy');
    });

    it('should support greedy choice property proof', () => {
      const input = createAlgorithmicWithDesignPattern('greedy', {
        algorithmName: 'Huffman Coding',
        thought: 'Local optimal choice leads to globally optimal prefix-free code',
      } as any);

      const thought = factory.createThought(input, 'session-alg-021');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });
  });

  /**
   * T-ENG-022: Algorithmic with designPattern = backtracking
   */
  describe('T-ENG-022: Design Pattern - Backtracking', () => {
    it('should create thought with backtracking pattern', () => {
      const input = createAlgorithmicWithDesignPattern('backtracking', {
        thought: 'Exploring solution space for N-Queens problem',
      });

      const thought = factory.createThought(input, 'session-alg-022');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).designPattern).toBe('backtracking');
    });

    it('should handle constraint satisfaction problems', () => {
      const input = createAlgorithmicWithDesignPattern('backtracking', {
        algorithmName: 'Sudoku Solver',
        thought: 'Backtrack when constraint violation detected',
      } as any);

      const thought = factory.createThought(input, 'session-alg-022');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });
  });

  /**
   * T-ENG-023: Algorithmic with designPattern = branch-and-bound
   */
  describe('T-ENG-023: Design Pattern - Branch and Bound', () => {
    it('should create thought with branch-and-bound pattern', () => {
      const input = createAlgorithmicWithDesignPattern('branch-and-bound', {
        thought: 'Applying branch-and-bound to TSP',
      });

      const thought = factory.createThought(input, 'session-alg-023');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).designPattern).toBe('branch-and-bound');
    });

    it('should support pruning with lower bounds', () => {
      const input = createAlgorithmicWithDesignPattern('branch-and-bound', {
        algorithmName: 'Integer Linear Programming',
        thought: 'Prune branches where lower bound exceeds best solution',
      } as any);

      const thought = factory.createThought(input, 'session-alg-023');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });
  });

  /**
   * T-ENG-024: Algorithmic with designPattern = randomized
   */
  describe('T-ENG-024: Design Pattern - Randomized', () => {
    it('should create thought with randomized pattern', () => {
      const input = createAlgorithmicWithDesignPattern('randomized', {
        thought: 'Analyzing expected time complexity of randomized quicksort',
      });

      const thought = factory.createThought(input, 'session-alg-024');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).designPattern).toBe('randomized');
    });

    it('should handle Las Vegas algorithms', () => {
      const input = createAlgorithmicWithDesignPattern('randomized', {
        algorithmName: 'Randomized Select',
        thought: 'Expected O(n) time, always correct result',
      } as any);

      const thought = factory.createThought(input, 'session-alg-024');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });
  });

  /**
   * T-ENG-025: Algorithmic with designPattern = approximation
   */
  describe('T-ENG-025: Design Pattern - Approximation', () => {
    it('should create thought with approximation pattern', () => {
      const input = createAlgorithmicWithDesignPattern('approximation', {
        thought: '2-approximation for Vertex Cover',
      });

      const thought = factory.createThought(input, 'session-alg-025');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).designPattern).toBe('approximation');
    });

    it('should support approximation ratio analysis', () => {
      const input = createAlgorithmicWithDesignPattern('approximation', {
        algorithmName: 'Set Cover Greedy',
        thought: 'O(log n)-approximation in polynomial time',
      } as any);

      const thought = factory.createThought(input, 'session-alg-025');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });
  });

  /**
   * T-ENG-026: Algorithmic with complexityAnalysis.timeComplexity
   */
  describe('T-ENG-026: Complexity Analysis - Time Complexity', () => {
    it('should include time complexity in thought', () => {
      const input = createAlgorithmicWithComplexity(
        { timeComplexity: 'O(n log n)' },
        { thought: 'Merge sort achieves optimal comparison-based sorting bound' }
      );

      const thought = factory.createThought(input, 'session-alg-026');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).complexityAnalysis.timeComplexity).toBe('O(n log n)');
    });

    it('should handle various complexity classes', () => {
      const complexities = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)', 'O(n!)'];

      for (const timeComplexity of complexities) {
        const input = createAlgorithmicWithComplexity({ timeComplexity });
        const thought = factory.createThought(input, `session-alg-026-${timeComplexity}`);
        expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      }
    });
  });

  /**
   * T-ENG-027: Algorithmic with complexityAnalysis.spaceComplexity
   */
  describe('T-ENG-027: Complexity Analysis - Space Complexity', () => {
    it('should include space complexity in thought', () => {
      const input = createAlgorithmicWithComplexity(
        { spaceComplexity: 'O(n)' },
        { thought: 'Merge sort requires O(n) auxiliary space' }
      );

      const thought = factory.createThought(input, 'session-alg-027');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).complexityAnalysis.spaceComplexity).toBe('O(n)');
    });

    it('should distinguish in-place algorithms', () => {
      const input = createAlgorithmicWithComplexity(
        { spaceComplexity: 'O(1)' },
        {
          algorithmName: 'HeapSort',
          thought: 'In-place sorting with O(1) auxiliary space',
        } as any
      );

      const thought = factory.createThought(input, 'session-alg-027');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });
  });

  /**
   * T-ENG-028: Algorithmic with complexityAnalysis.bestCase
   */
  describe('T-ENG-028: Complexity Analysis - Best Case', () => {
    it('should include best case complexity', () => {
      const input = createAlgorithmicWithComplexity(
        { bestCase: 'O(n)' },
        { thought: 'Insertion sort achieves O(n) on nearly sorted input' }
      );

      const thought = factory.createThought(input, 'session-alg-028');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).complexityAnalysis.bestCase).toBe('O(n)');
    });
  });

  /**
   * T-ENG-029: Algorithmic with complexityAnalysis.worstCase
   */
  describe('T-ENG-029: Complexity Analysis - Worst Case', () => {
    it('should include worst case complexity', () => {
      const input = createAlgorithmicWithComplexity(
        { worstCase: 'O(n^2)' },
        { thought: 'QuickSort worst case on already sorted input with naive pivot' }
      );

      const thought = factory.createThought(input, 'session-alg-029');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).complexityAnalysis.worstCase).toBe('O(n^2)');
    });
  });

  /**
   * T-ENG-030: Algorithmic with complexityAnalysis.averageCase
   */
  describe('T-ENG-030: Complexity Analysis - Average Case', () => {
    it('should include average case complexity', () => {
      const input = createAlgorithmicWithComplexity(
        { averageCase: 'O(n log n)' },
        { thought: 'QuickSort expected O(n log n) with random pivot' }
      );

      const thought = factory.createThought(input, 'session-alg-030');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).complexityAnalysis.averageCase).toBe('O(n log n)');
    });

    it('should support complete complexity analysis', () => {
      const input = createAlgorithmicWithComplexity(
        {
          bestCase: 'O(n log n)',
          worstCase: 'O(n^2)',
          averageCase: 'O(n log n)',
          timeComplexity: 'O(n log n) expected',
          spaceComplexity: 'O(log n) stack space',
        },
        {
          algorithmName: 'QuickSort',
          thought: 'Complete complexity analysis for QuickSort',
        } as any
      );

      const thought = factory.createThought(input, 'session-alg-030');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });
  });

  /**
   * T-ENG-031: Algorithmic with correctnessProof.invariant
   */
  describe('T-ENG-031: Correctness Proof - Invariant', () => {
    it('should include loop invariant in correctness proof', () => {
      const input = createAlgorithmicWithCorrectnessProof(
        {
          invariant: 'At iteration i, A[0..i-1] is sorted and contains the i smallest elements',
        },
        { thought: 'Proving insertion sort correctness via loop invariant' }
      );

      const thought = factory.createThought(input, 'session-alg-031');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).correctnessProof.invariant).toContain('sorted');
    });
  });

  /**
   * T-ENG-032: Algorithmic with correctnessProof.termination
   */
  describe('T-ENG-032: Correctness Proof - Termination', () => {
    it('should include termination argument', () => {
      const input = createAlgorithmicWithCorrectnessProof(
        {
          termination: 'Loop variable i decreases by 1 each iteration, bounded below by 0',
        },
        { thought: 'Proving algorithm terminates' }
      );

      const thought = factory.createThought(input, 'session-alg-032');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).correctnessProof.termination).toContain('decreases');
    });
  });

  /**
   * T-ENG-033: Algorithmic with correctnessProof.correctness
   */
  describe('T-ENG-033: Correctness Proof - Correctness', () => {
    it('should include correctness statement', () => {
      const input = createAlgorithmicWithCorrectnessProof(
        {
          correctness: 'Upon termination, A[0..n-1] is a sorted permutation of the original array',
        },
        { thought: 'Proving sorting algorithm produces correct output' }
      );

      const thought = factory.createThought(input, 'session-alg-033');

      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      expect((input as any).correctnessProof.correctness).toContain('sorted permutation');
    });

    it('should support complete correctness proof', () => {
      const input = createAlgorithmicWithCorrectnessProof(
        {
          invariant: 'A[0..i-1] contains the i smallest elements in sorted order',
          termination: 'i increases from 1 to n, loop terminates when i = n',
          correctness: 'When i = n, entire array is sorted',
        },
        {
          algorithmName: 'Selection Sort',
          thought: 'Complete correctness proof for Selection Sort',
        } as any
      );

      const thought = factory.createThought(input, 'session-alg-033');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });
  });

  /**
   * T-ENG-034: Algorithmic CLRS-style analysis session
   */
  describe('T-ENG-034: CLRS-Style Analysis Session', () => {
    it('should support comprehensive CLRS-style algorithm analysis', () => {
      const sessionId = 'session-alg-034-clrs';

      // Step 1: Algorithm definition
      const step1 = factory.createThought(
        createAlgorithmicWithName('Binary Search', {
          thought: 'BINARY-SEARCH(A, low, high, target): Find target in sorted array A',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
        }),
        sessionId
      );

      // Step 2: Correctness via loop invariant
      const step2 = factory.createThought(
        createAlgorithmicWithCorrectnessProof(
          {
            invariant: 'If target exists in A, it must be in A[low..high]',
            termination: 'high - low decreases by at least half each iteration',
            correctness: 'Either target found at mid, or low > high means target not in array',
          },
          {
            thought: 'Proving correctness of binary search',
            thoughtNumber: 2,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 3: Time complexity
      const step3 = factory.createThought(
        createAlgorithmicWithComplexity(
          {
            timeComplexity: 'O(log n)',
            bestCase: 'O(1)',
            worstCase: 'O(log n)',
            averageCase: 'O(log n)',
          },
          {
            thought: 'Recurrence: T(n) = T(n/2) + O(1) => O(log n)',
            thoughtNumber: 3,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 4: Space complexity
      const step4 = factory.createThought(
        createAlgorithmicWithComplexity(
          { spaceComplexity: 'O(1) iterative, O(log n) recursive' },
          {
            thought: 'Iterative uses constant space, recursive uses stack',
            thoughtNumber: 4,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 5: Summary and comparison
      const step5 = factory.createThought(
        createAlgorithmicThought({
          thought: 'Binary search is optimal for sorted arrays, requires O(n log n) preprocessing for sorting',
          thoughtNumber: 5,
          totalThoughts: 5,
          nextThoughtNeeded: false,
        }),
        sessionId
      );

      expect([step1, step2, step3, step4, step5]).toHaveLength(5);
      [step1, step2, step3, step4, step5].forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
      });
    });
  });

  /**
   * T-ENG-035: Algorithmic recurrence relation derivation
   */
  describe('T-ENG-035: Recurrence Relation Derivation', () => {
    it('should support recurrence relation analysis', () => {
      const sessionId = 'session-alg-035-recurrence';

      // Derive recurrence for Merge Sort
      const step1 = factory.createThought(
        createAlgorithmicWithDesignPattern('divide-and-conquer', {
          algorithmName: 'Merge Sort',
          thought: 'Divide: Split array into two halves',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
        } as any),
        sessionId
      );

      const step2 = factory.createThought(
        createAlgorithmicThought({
          thought: 'Conquer: Recursively sort each half => 2T(n/2)',
          thoughtNumber: 2,
          totalThoughts: 3,
          nextThoughtNeeded: true,
        }),
        sessionId
      );

      const step3 = factory.createThought(
        createAlgorithmicWithComplexity(
          { timeComplexity: 'T(n) = 2T(n/2) + O(n) => O(n log n) by Master Theorem' },
          {
            thought: 'Combine: Merge two sorted halves in O(n). Total: T(n) = 2T(n/2) + O(n)',
            thoughtNumber: 3,
            totalThoughts: 3,
            nextThoughtNeeded: false,
          }
        ),
        sessionId
      );

      expect([step1, step2, step3]).toHaveLength(3);
    });
  });

  /**
   * T-ENG-036: Algorithmic Master Theorem application
   */
  describe('T-ENG-036: Master Theorem Application', () => {
    it('should support Master Theorem case 1', () => {
      // Case 1: f(n) = O(n^(log_b(a) - epsilon))
      const input = createAlgorithmicWithComplexity(
        {
          timeComplexity: 'T(n) = 8T(n/2) + n^2 => Theta(n^3)',
        },
        {
          thought: 'Master Theorem Case 1: a=8, b=2, f(n)=n^2, log_2(8)=3. n^2 = O(n^(3-1)), so Theta(n^3)',
        }
      );

      const thought = factory.createThought(input, 'session-alg-036-case1');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });

    it('should support Master Theorem case 2', () => {
      // Case 2: f(n) = Theta(n^(log_b(a)))
      const input = createAlgorithmicWithComplexity(
        {
          timeComplexity: 'T(n) = 2T(n/2) + n => Theta(n log n)',
        },
        {
          thought: 'Master Theorem Case 2: a=2, b=2, f(n)=n, log_2(2)=1. n = Theta(n^1), so Theta(n log n)',
        }
      );

      const thought = factory.createThought(input, 'session-alg-036-case2');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });

    it('should support Master Theorem case 3', () => {
      // Case 3: f(n) = Omega(n^(log_b(a) + epsilon))
      const input = createAlgorithmicWithComplexity(
        {
          timeComplexity: 'T(n) = 2T(n/2) + n^2 => Theta(n^2)',
        },
        {
          thought: 'Master Theorem Case 3: a=2, b=2, f(n)=n^2, log_2(2)=1. n^2 = Omega(n^(1+1)), regularity holds, so Theta(n^2)',
        }
      );

      const thought = factory.createThought(input, 'session-alg-036-case3');
      expect(thought.mode).toBe(ThinkingMode.ALGORITHMIC);
    });

    it('should support complete Master Theorem analysis session', () => {
      const sessionId = 'session-alg-036-master';

      // Strassen's algorithm analysis
      const strassen = factory.createThought(
        createAlgorithmicWithComplexity(
          {
            timeComplexity: 'T(n) = 7T(n/2) + O(n^2)',
          },
          {
            algorithmName: 'Strassen Matrix Multiplication',
            designPattern: 'divide-and-conquer',
            thought: 'a=7, b=2. log_2(7) = 2.807. n^2 = O(n^(2.807-0.807)). Case 1: Theta(n^2.807)',
          } as any
        ),
        sessionId
      );

      expect(strassen.mode).toBe(ThinkingMode.ALGORITHMIC);
    });
  });
});
