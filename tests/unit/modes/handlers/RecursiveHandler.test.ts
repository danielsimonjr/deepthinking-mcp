/**
 * RecursiveHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for the Recursive reasoning handler:
 * - Problem decomposition tracking
 * - Base case identification
 * - Recursion depth monitoring
 * - Subproblem relationship analysis
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RecursiveHandler } from '../../../../src/modes/handlers/RecursiveHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('RecursiveHandler', () => {
  let handler: RecursiveHandler;

  beforeEach(() => {
    handler = new RecursiveHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.RECURSIVE);
    });

    it('should have correct modeName', () => {
      expect(handler.modeName).toBe('Recursive Reasoning');
    });

    it('should have descriptive description', () => {
      expect(handler.description).toContain('decomposition');
      expect(handler.description).toContain('base case');
      expect(handler.description).toContain('recursive');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Decomposing the problem into subproblems',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'recursive',
    };

    it('should create thought with default thought type', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.RECURSIVE);
      expect(thought.thoughtType).toBe('problem_decomposition');
      expect(thought.content).toBe(baseInput.thought);
      expect(thought.sessionId).toBe('session-123');
    });

    it('should create thought with specified thought type', () => {
      const input = { ...baseInput, thoughtType: 'base_case_identification' } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.thoughtType).toBe('base_case_identification');
    });

    it('should create thought with default strategy', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.strategy).toBe('divide_and_conquer');
    });

    it('should create thought with specified strategy', () => {
      const input = { ...baseInput, strategy: 'dynamic_programming' } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.strategy).toBe('dynamic_programming');
    });

    it('should process subproblems', () => {
      const input = {
        ...baseInput,
        subproblems: [
          { name: 'Left half', description: 'Process left portion', size: 'n/2', depth: 1 },
          { name: 'Right half', description: 'Process right portion', size: 'n/2', depth: 1 },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.subproblems).toHaveLength(2);
      expect(thought.subproblems![0].name).toBe('Left half');
      expect(thought.subproblems![0].id).toBeDefined();
      expect(thought.subproblems![0].status).toBe('pending');
    });

    it('should process base cases', () => {
      const input = {
        ...baseInput,
        baseCases: [
          { condition: 'n <= 1', result: 'return n', verified: true },
          { condition: 'array is empty', result: 'return empty', verified: false },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.baseCases).toHaveLength(2);
      expect(thought.baseCases![0].condition).toBe('n <= 1');
      expect(thought.baseCases![0].verified).toBe(true);
    });

    it('should process recurrence relation', () => {
      const input = {
        ...baseInput,
        recurrence: {
          formula: 'T(n) = 2T(n/2) + O(n)',
          baseCase: 'T(1) = O(1)',
          closedForm: 'O(n log n)',
          complexity: 'O(n log n)',
        },
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.recurrence).toBeDefined();
      expect(thought.recurrence!.formula).toBe('T(n) = 2T(n/2) + O(n)');
      expect(thought.recurrence!.closedForm).toBe('O(n log n)');
    });

    it('should calculate depth from subproblems', () => {
      const input = {
        ...baseInput,
        subproblems: [
          { name: 'Sub1', depth: 2 },
          { name: 'Sub2', depth: 3 },
          { name: 'Sub3', depth: 1 },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.currentDepth).toBe(4); // max(2,3,1) + 1
    });

    it('should set baseCaseReached when verified base case exists', () => {
      const input = {
        ...baseInput,
        baseCases: [
          { condition: 'n == 0', result: '0', verified: true },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.baseCaseReached).toBe(true);
    });

    it('should handle division factor', () => {
      const input = { ...baseInput, divisionFactor: 3 } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.divisionFactor).toBe(3);
    });
  });

  describe('validate', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Recursive analysis',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'recursive',
    };

    it('should return valid for well-formed input', () => {
      const result = handler.validate(baseInput);
      expect(result.valid).toBe(true);
    });

    it('should fail for empty thought', () => {
      const input = { ...baseInput, thought: '' };
      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should fail for thought number exceeding total', () => {
      const input = { ...baseInput, thoughtNumber: 6, totalThoughts: 5 };
      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_THOUGHT_NUMBER')).toBe(true);
    });

    it('should warn for unknown thought type', () => {
      const input = { ...baseInput, thoughtType: 'invalid_type' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'thoughtType')).toBe(true);
    });

    it('should warn for unknown strategy', () => {
      const input = { ...baseInput, strategy: 'invalid_strategy' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'strategy')).toBe(true);
    });

    it('should warn when current depth exceeds max depth', () => {
      const input = { ...baseInput, currentDepth: 15, maxDepth: 10 } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('exceeds max depth'))).toBe(true);
    });

    it('should warn about missing base cases for solution combination', () => {
      const input = { ...baseInput, thoughtType: 'solution_combination' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('without base cases'))).toBe(true);
    });

    it('should warn about missing subproblems for decomposition', () => {
      const input = { ...baseInput, thoughtType: 'problem_decomposition' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('without subproblems'))).toBe(true);
    });

    it('should warn about low division factor', () => {
      const input = { ...baseInput, divisionFactor: 1 } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('should be >= 2'))).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    const createThought = (overrides: any = {}) => {
      const baseInput: ThinkingToolInput = {
        thought: 'Recursive reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'recursive',
        ...overrides,
      };
      return handler.createThought(baseInput, 'session-123');
    };

    it('should include related modes', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.ALGORITHMIC);
      expect(enhancements.relatedModes).toContain(ThinkingMode.MATHEMATICS);
      expect(enhancements.relatedModes).toContain(ThinkingMode.OPTIMIZATION);
    });

    it('should include mental models', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Divide and Conquer');
      expect(enhancements.mentalModels).toContain('Mathematical Induction');
      expect(enhancements.mentalModels).toContain('Master Theorem');
    });

    it('should calculate metrics', () => {
      const thought = createThought({
        subproblems: [{ name: 'Sub1' }, { name: 'Sub2' }],
        baseCases: [{ condition: 'n=1', result: '1', verified: true }],
        currentDepth: 3,
        maxDepth: 10,
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.subproblemCount).toBe(2);
      expect(enhancements.metrics!.baseCaseCount).toBe(1);
      expect(enhancements.metrics!.currentDepth).toBe(3);
      expect(enhancements.metrics!.maxDepth).toBe(10);
    });

    it('should provide strategy info', () => {
      const thought = createThought({ strategy: 'divide_and_conquer' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('divide and conquer'))).toBe(true);
    });

    it('should provide decomposition guidance', () => {
      const thought = createThought({
        thoughtType: 'problem_decomposition',
        subproblems: [
          { name: 'Sub1', status: 'solved' },
          { name: 'Sub2', status: 'pending' },
        ],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('divided into smaller'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('1 solved'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('1 pending'))).toBe(true);
    });

    it('should provide base case identification guidance', () => {
      const thought = createThought({
        thoughtType: 'base_case_identification',
        baseCases: [
          { condition: 'n=0', result: '0', verified: true },
          { condition: 'n=1', result: '1', verified: false },
        ],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('smallest/simplest'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('1/2 verified'))).toBe(true);
    });

    it('should provide recursive step guidance with recurrence', () => {
      const thought = createThought({
        thoughtType: 'recursive_step',
        recurrence: {
          formula: 'T(n) = T(n-1) + O(1)',
          closedForm: 'O(n)',
        },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('recurrence relation'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('Recurrence:'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('Closed form:'))).toBe(true);
    });

    it('should warn about high recursion depth', () => {
      const thought = createThought({
        currentDepth: 9,
        maxDepth: 10,
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some((w) => w.includes('nearing limit'))).toBe(true);
    });

    it('should warn about missing base cases', () => {
      const thought = createThought({
        currentDepth: 3,
        baseCases: [],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some((w) => w.includes('No base cases'))).toBe(true);
    });

    it('should suggest memoization for dynamic programming', () => {
      const thought = createThought({ strategy: 'dynamic_programming' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('memoization'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support problem_decomposition', () => {
      expect(handler.supportsThoughtType('problem_decomposition')).toBe(true);
    });

    it('should support base_case_identification', () => {
      expect(handler.supportsThoughtType('base_case_identification')).toBe(true);
    });

    it('should support recursive_step', () => {
      expect(handler.supportsThoughtType('recursive_step')).toBe(true);
    });

    it('should support subproblem_solution', () => {
      expect(handler.supportsThoughtType('subproblem_solution')).toBe(true);
    });

    it('should support solution_combination', () => {
      expect(handler.supportsThoughtType('solution_combination')).toBe(true);
    });

    it('should support termination_analysis', () => {
      expect(handler.supportsThoughtType('termination_analysis')).toBe(true);
    });

    it('should not support unknown types', () => {
      expect(handler.supportsThoughtType('unknown')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle merge sort decomposition', () => {
      const sessionId = 'merge-sort-session';

      // Step 1: Problem decomposition
      const step1Input = {
        thought: 'Decompose array [38, 27, 43, 3, 9, 82, 10] into halves',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'recursive',
        thoughtType: 'problem_decomposition',
        strategy: 'divide_and_conquer',
        subproblems: [
          { name: 'Left half', description: '[38, 27, 43]', size: 'n/2', depth: 1, status: 'pending' },
          { name: 'Right half', description: '[3, 9, 82, 10]', size: 'n/2', depth: 1, status: 'pending' },
        ],
        divisionFactor: 2,
      } as any;

      const thought1 = handler.createThought(step1Input, sessionId);
      expect(thought1.thoughtType).toBe('problem_decomposition');
      expect(thought1.subproblems).toHaveLength(2);
      expect(thought1.divisionFactor).toBe(2);

      // Step 2: Base case identification
      const step2Input = {
        thought: 'Base case: array of size 1 or 0 is already sorted',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'recursive',
        thoughtType: 'base_case_identification',
        strategy: 'divide_and_conquer',
        baseCases: [
          { condition: 'n <= 1', result: 'return array as-is', verified: true },
        ],
      } as any;

      const thought2 = handler.createThought(step2Input, sessionId);
      expect(thought2.baseCases).toHaveLength(1);
      expect(thought2.baseCases![0].verified).toBe(true);

      // Step 3: Recursive step
      const step3Input = {
        thought: 'Recursively sort left and right halves, then merge',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'recursive',
        thoughtType: 'recursive_step',
        strategy: 'divide_and_conquer',
        recurrence: {
          formula: 'T(n) = 2T(n/2) + O(n)',
          baseCase: 'T(1) = O(1)',
          closedForm: 'O(n log n)',
          complexity: 'O(n log n)',
        },
      } as any;

      const thought3 = handler.createThought(step3Input, sessionId);
      expect(thought3.recurrence!.formula).toBe('T(n) = 2T(n/2) + O(n)');

      // Step 4: Termination analysis
      const step4Input = {
        thought: 'Verify termination: each recursive call halves the input size',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'recursive',
        thoughtType: 'termination_analysis',
        strategy: 'divide_and_conquer',
        currentDepth: 0,
        maxDepth: Math.ceil(Math.log2(7)), // log2(7) ≈ 3
      } as any;

      const thought4 = handler.createThought(step4Input, sessionId);
      const enhancements = handler.getEnhancements(thought4);

      expect(thought4.thoughtType).toBe('termination_analysis');
      expect(enhancements.guidingQuestions!.some((q) => q.includes('termination guaranteed'))).toBe(true);
    });

    it('should handle Fibonacci with dynamic programming', () => {
      const sessionId = 'fib-session';

      const input = {
        thought: 'Computing Fibonacci using dynamic programming to avoid redundant computation',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'recursive',
        thoughtType: 'recursive_step',
        strategy: 'dynamic_programming',
        baseCases: [
          { condition: 'n == 0', result: '0', verified: true },
          { condition: 'n == 1', result: '1', verified: true },
        ],
        recurrence: {
          formula: 'F(n) = F(n-1) + F(n-2)',
          baseCase: 'F(0)=0, F(1)=1',
          closedForm: '(phi^n - psi^n) / sqrt(5)',
          complexity: 'O(n) with memoization',
        },
      } as any;

      const thought = handler.createThought(input, sessionId);
      const validation = handler.validate(input);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.strategy).toBe('dynamic_programming');
      expect(validation.valid).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('memoization'))).toBe(true);
    });
  });
});
