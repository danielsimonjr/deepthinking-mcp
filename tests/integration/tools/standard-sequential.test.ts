/**
 * Standard Workflows Integration Tests - Sequential Mode
 *
 * Tests T-STD-001 through T-STD-010: Comprehensive integration tests
 * for the deepthinking_standard tool with sequential mode.
 *
 * Phase 11 Sprint 2: Standard Workflows & Common Parameters
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type SequentialThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import {
  assertValidBaseThought,
  assertThoughtMode,
  assertIsRevision,
  assertValidSession,
  assertSessionHasThoughts,
} from '../../utils/assertion-helpers.js';
import {
  SAMPLE_ASSUMPTIONS,
  SAMPLE_DEPENDENCIES,
  BRANCH_DATA,
  REVISION_DATA,
  UNCERTAINTY_LEVELS,
} from '../../utils/mock-data.js';

/**
 * Create a basic sequential thought input
 */
function createSequentialThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: 'Sequential reasoning step',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'sequential',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Create a sequence of sequential thoughts
 */
function createSequentialSequence(
  count: number,
  baseOverrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput[] {
  return Array.from({ length: count }, (_, i) =>
    createSequentialThought({
      thought: `Sequential step ${i + 1}`,
      thoughtNumber: i + 1,
      totalThoughts: count,
      nextThoughtNeeded: i < count - 1,
      ...baseOverrides,
    })
  );
}

describe('Standard Workflows Integration - Sequential Mode', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-STD-001: Basic sequential thought with required params only
   */
  describe('T-STD-001: Basic Sequential Thought', () => {
    it('should create a basic sequential thought with minimal params', () => {
      const input = createSequentialThought({
        thought: 'First step in sequential reasoning',
      });

      const thought = factory.createThought(input, 'session-std-001');

      expect(thought.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(thought.content).toBe('First step in sequential reasoning');
      expect(thought.sessionId).toBe('session-std-001');
      expect(thought.thoughtNumber).toBe(1);
      expect(thought.totalThoughts).toBe(3);
      expect(thought.nextThoughtNeeded).toBe(true);
    });

    it('should assign unique IDs to sequential thoughts', () => {
      const input1 = createSequentialThought({ thought: 'First thought' });
      const input2 = createSequentialThought({ thought: 'Second thought' });

      const thought1 = factory.createThought(input1, 'session-std-001');
      const thought2 = factory.createThought(input2, 'session-std-001');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should set timestamp to current time', () => {
      const before = new Date();
      const input = createSequentialThought();
      const thought = factory.createThought(input, 'session-std-001');
      const after = new Date();

      expect(thought.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(thought.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  /**
   * T-STD-002: Sequential 3-thought session
   */
  describe('T-STD-002: Sequential 3-Thought Session', () => {
    it('should create a complete 3-thought sequential session', () => {
      const sessionId = 'session-std-002';
      const inputs = createSequentialSequence(3);

      const thoughts = inputs.map((input) => factory.createThought(input, sessionId));

      expect(thoughts).toHaveLength(3);
      thoughts.forEach((thought, i) => {
        expect(thought.mode).toBe(ThinkingMode.SEQUENTIAL);
        expect(thought.thoughtNumber).toBe(i + 1);
        expect(thought.totalThoughts).toBe(3);
        expect(thought.nextThoughtNeeded).toBe(i < 2);
      });
    });

    it('should track session progression correctly', () => {
      const sessionId = 'session-std-002b';
      const inputs = createSequentialSequence(3);
      const thoughts = inputs.map((input) => factory.createThought(input, sessionId));

      // First thought: needs more
      expect(thoughts[0].nextThoughtNeeded).toBe(true);
      // Middle thought: needs more
      expect(thoughts[1].nextThoughtNeeded).toBe(true);
      // Last thought: complete
      expect(thoughts[2].nextThoughtNeeded).toBe(false);
    });
  });

  /**
   * T-STD-003: Sequential 10-thought session
   */
  describe('T-STD-003: Sequential 10-Thought Session', () => {
    it('should handle a longer 10-thought sequential session', () => {
      const sessionId = 'session-std-003';
      const inputs = createSequentialSequence(10);

      const thoughts = inputs.map((input) => factory.createThought(input, sessionId));

      expect(thoughts).toHaveLength(10);
      thoughts.forEach((thought, i) => {
        expect(thought.mode).toBe(ThinkingMode.SEQUENTIAL);
        expect(thought.thoughtNumber).toBe(i + 1);
        expect(thought.totalThoughts).toBe(10);
      });
    });

    it('should maintain consistency across 10 thoughts', () => {
      const sessionId = 'session-std-003b';
      const inputs = createSequentialSequence(10);
      const thoughts = inputs.map((input) => factory.createThought(input, sessionId));

      // All thoughts should have the same session ID
      thoughts.forEach((thought) => {
        expect(thought.sessionId).toBe(sessionId);
      });

      // All IDs should be unique
      const ids = thoughts.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });
  });

  /**
   * T-STD-004: Sequential with assumptions array
   * Note: Sequential mode handler uses dependencies instead of assumptions for input.
   * Assumptions are validated in the input but may not be directly copied to output.
   */
  describe('T-STD-004: Sequential With Assumptions', () => {
    it('should accept assumptions in input for validation', () => {
      const input = createSequentialThought({
        thought: 'Reasoning based on assumptions',
        assumptions: SAMPLE_ASSUMPTIONS.simple,
      });

      // Validate accepts assumptions
      const result = factory.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should handle detailed assumptions array in input', () => {
      const input = createSequentialThought({
        thought: 'Complex reasoning with detailed assumptions',
        assumptions: SAMPLE_ASSUMPTIONS.detailed,
      });

      const result = factory.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should handle empty assumptions array', () => {
      const input = createSequentialThought({
        thought: 'No assumptions needed',
        assumptions: [],
      });

      const result = factory.validate(input);
      expect(result.valid).toBe(true);
    });
  });

  /**
   * T-STD-005: Sequential with uncertainty values
   * Note: Sequential mode focuses on step-by-step logic and doesn't track uncertainty
   * directly. Use Shannon mode for uncertainty tracking.
   */
  describe('T-STD-005: Sequential With Uncertainty', () => {
    it('should accept uncertainty in input for validation', () => {
      const input = createSequentialThought({
        thought: 'Reasoning step with uncertainty',
        uncertainty: UNCERTAINTY_LEVELS.none,
      });

      // Validate accepts uncertainty
      const result = factory.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should accept moderate uncertainty in input', () => {
      const input = createSequentialThought({
        thought: 'Moderately uncertain reasoning',
        uncertainty: UNCERTAINTY_LEVELS.high,
      });

      const result = factory.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should accept maximum uncertainty in input', () => {
      const input = createSequentialThought({
        thought: 'Highly uncertain speculation',
        uncertainty: UNCERTAINTY_LEVELS.maximum,
      });

      const result = factory.validate(input);
      expect(result.valid).toBe(true);
    });
  });

  /**
   * T-STD-006: Sequential with dependencies between thoughts
   */
  describe('T-STD-006: Sequential With Dependencies', () => {
    it('should include single dependency', () => {
      const input = createSequentialThought({
        thought: 'Building on previous thought',
        thoughtNumber: 2,
        dependencies: SAMPLE_DEPENDENCIES.single,
      });

      const thought = factory.createThought(input, 'session-std-006') as SequentialThought;

      expect(thought.dependencies).toEqual(SAMPLE_DEPENDENCIES.single);
    });

    it('should include chain dependencies', () => {
      const input = createSequentialThought({
        thought: 'Depends on multiple previous thoughts',
        thoughtNumber: 4,
        dependencies: SAMPLE_DEPENDENCIES.chain,
      });

      const thought = factory.createThought(input, 'session-std-006') as SequentialThought;

      expect(thought.dependencies).toEqual(SAMPLE_DEPENDENCIES.chain);
      expect(thought.dependencies?.length).toBe(3);
    });

    it('should handle complex dependency graph', () => {
      const input = createSequentialThought({
        thought: 'Complex dependencies',
        thoughtNumber: 5,
        dependencies: SAMPLE_DEPENDENCIES.complex,
      });

      const thought = factory.createThought(input, 'session-std-006') as SequentialThought;

      expect(thought.dependencies).toEqual(SAMPLE_DEPENDENCIES.complex);
    });
  });

  /**
   * T-STD-007: Sequential with branch creation mid-session
   */
  describe('T-STD-007: Sequential With Branch Creation', () => {
    it('should accept branching parameters in input', () => {
      const input = createSequentialThought({
        thought: 'Alternative reasoning path',
        thoughtNumber: 3,
        branchFrom: BRANCH_DATA.simple.branchFrom,
        branchId: BRANCH_DATA.simple.branchId,
      });

      // Verify input has branching params
      expect((input as any).branchFrom).toBe('thought-2');
      expect((input as any).branchId).toBe('branch-a');

      const thought = factory.createThought(input, 'session-std-007') as SequentialThought;

      expect(thought.mode).toBe(ThinkingMode.SEQUENTIAL);
      // branchFrom and branchId are tracked on SequentialThought type
      expect(thought.branchFrom).toBe('thought-2');
      expect(thought.branchId).toBe('branch-a');
    });

    it('should create valid thought with branch at different point', () => {
      const input = createSequentialThought({
        thought: 'Another alternative path',
        thoughtNumber: 4,
        branchFrom: BRANCH_DATA.alternative.branchFrom,
        branchId: BRANCH_DATA.alternative.branchId,
      });

      const thought = factory.createThought(input, 'session-std-007') as SequentialThought;

      expect(thought.branchFrom).toBe('thought-3');
      expect(thought.branchId).toBe('branch-b');
    });
  });

  /**
   * T-STD-008: Sequential with revision of earlier thought
   */
  describe('T-STD-008: Sequential With Revision', () => {
    it('should create a revision thought', () => {
      const input = createSequentialThought({
        thought: 'Revised reasoning',
        thoughtNumber: 2,
        isRevision: true,
        revisesThought: REVISION_DATA.simple.revisesThought,
        revisionReason: REVISION_DATA.simple.revisionReason,
      });

      const thought = factory.createThought(input, 'session-std-008') as SequentialThought;

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-1');
      expect(thought.revisionReason).toBe('Found error in logic');
    });

    it('should handle correction revision', () => {
      const input = createSequentialThought({
        thought: 'Corrected based on new evidence',
        thoughtNumber: 3,
        isRevision: true,
        revisesThought: REVISION_DATA.correction.revisesThought,
        revisionReason: REVISION_DATA.correction.revisionReason,
      });

      const thought = factory.createThought(input, 'session-std-008') as SequentialThought;

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-2');
    });

    it('should handle refinement revision', () => {
      const input = createSequentialThought({
        thought: 'Refined understanding',
        thoughtNumber: 4,
        isRevision: true,
        revisesThought: REVISION_DATA.refinement.revisesThought,
        revisionReason: REVISION_DATA.refinement.revisionReason,
      });

      const thought = factory.createThought(input, 'session-std-008') as SequentialThought;

      expect(thought.isRevision).toBe(true);
      expect(thought.revisionReason).toContain('Improved understanding');
    });
  });

  /**
   * T-STD-009: Sequential with multiple branches
   */
  describe('T-STD-009: Sequential With Multiple Branches', () => {
    it('should handle multiple branches from same point', () => {
      const sessionId = 'session-std-009';

      // Main path: thoughts 1, 2
      const main1 = createSequentialThought({ thought: 'Main step 1', thoughtNumber: 1 });
      const main2 = createSequentialThought({ thought: 'Main step 2', thoughtNumber: 2 });

      // Branch A from thought 2
      const branchA = createSequentialThought({
        thought: 'Branch A exploration',
        thoughtNumber: 3,
        branchFrom: 'thought-2',
        branchId: 'branch-a',
      });

      // Branch B also from thought 2
      const branchB = createSequentialThought({
        thought: 'Branch B exploration',
        thoughtNumber: 3,
        branchFrom: 'thought-2',
        branchId: 'branch-b',
      });

      const thoughtMain1 = factory.createThought(main1, sessionId);
      const thoughtMain2 = factory.createThought(main2, sessionId);
      const thoughtBranchA = factory.createThought(branchA, sessionId) as SequentialThought;
      const thoughtBranchB = factory.createThought(branchB, sessionId) as SequentialThought;

      // Both branches should originate from the same point
      expect(thoughtBranchA.branchFrom).toBe('thought-2');
      expect(thoughtBranchB.branchFrom).toBe('thought-2');

      // But have different branch IDs
      expect(thoughtBranchA.branchId).not.toBe(thoughtBranchB.branchId);
    });

    it('should handle nested branches', () => {
      const sessionId = 'session-std-009b';

      // First branch
      const branch1 = createSequentialThought({
        thought: 'First level branch',
        thoughtNumber: 3,
        branchFrom: 'thought-2',
        branchId: 'branch-level-1',
      });

      // Second branch from the first branch
      const branch2 = createSequentialThought({
        thought: 'Second level branch',
        thoughtNumber: 4,
        branchFrom: 'thought-3',
        branchId: 'branch-level-2',
      });

      const thought1 = factory.createThought(branch1, sessionId) as SequentialThought;
      const thought2 = factory.createThought(branch2, sessionId) as SequentialThought;

      expect(thought1.branchId).toBe('branch-level-1');
      expect(thought2.branchId).toBe('branch-level-2');
    });
  });

  /**
   * T-STD-010: Sequential session completion verification
   */
  describe('T-STD-010: Sequential Session Completion', () => {
    it('should properly mark session completion', () => {
      const sessionId = 'session-std-010';
      const inputs = [
        createSequentialThought({
          thought: 'Starting analysis',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
        }),
        createSequentialThought({
          thought: 'Continuing analysis',
          thoughtNumber: 2,
          totalThoughts: 3,
          nextThoughtNeeded: true,
        }),
        createSequentialThought({
          thought: 'Concluding analysis',
          thoughtNumber: 3,
          totalThoughts: 3,
          nextThoughtNeeded: false,
        }),
      ];

      const thoughts = inputs.map((input) => factory.createThought(input, sessionId));

      // Final thought should signal completion
      expect(thoughts[2].nextThoughtNeeded).toBe(false);
      expect(thoughts[2].thoughtNumber).toBe(thoughts[2].totalThoughts);
    });

    it('should handle early completion', () => {
      const sessionId = 'session-std-010b';
      const input = createSequentialThought({
        thought: 'Found answer early',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: false, // Early completion
      });

      const thought = factory.createThought(input, sessionId);

      expect(thought.nextThoughtNeeded).toBe(false);
      expect(thought.thoughtNumber).toBeLessThan(thought.totalThoughts);
    });

    it('should handle dynamic total adjustment', () => {
      const sessionId = 'session-std-010c';

      // Initial estimate
      const input1 = createSequentialThought({
        thought: 'Initial estimate of 3 thoughts',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      });

      // Realized need more thoughts
      const input2 = createSequentialThought({
        thought: 'Realized need more exploration',
        thoughtNumber: 2,
        totalThoughts: 5, // Adjusted estimate
        nextThoughtNeeded: true,
      });

      const thought1 = factory.createThought(input1, sessionId);
      const thought2 = factory.createThought(input2, sessionId);

      expect(thought1.totalThoughts).toBe(3);
      expect(thought2.totalThoughts).toBe(5);
    });
  });
});
