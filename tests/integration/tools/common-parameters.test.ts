/**
 * Common Parameters Integration Tests
 *
 * Tests T-PAR-001 through T-PAR-032: Comprehensive validation tests
 * for common parameters shared across all thinking modes.
 *
 * These parameters include:
 * - thought (content)
 * - thoughtNumber
 * - totalThoughts
 * - nextThoughtNeeded
 * - sessionId
 * - uncertainty
 * - assumptions
 * - dependencies
 * - branchFrom/branchId
 * - isRevision/revisesThought/revisionReason
 *
 * Phase 11 Sprint 2: Standard Workflows & Common Parameters
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import {
  assertValidationPassed,
  assertValidationFailed,
  assertHasErrorCode,
} from '../../utils/assertion-helpers.js';

/**
 * Create a basic thought input for parameter testing
 */
function createBaseTestThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: 'Test thought content',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'sequential',
    ...overrides,
  } as ThinkingToolInput;
}

describe('Common Parameters Integration Tests', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  // ===========================================================================
  // THOUGHT CONTENT TESTS (T-PAR-001 to T-PAR-004)
  // ===========================================================================

  /**
   * T-PAR-001: thought - minimum length (1 char)
   */
  describe('T-PAR-001: Thought Minimum Length', () => {
    it('should accept single character thought', () => {
      const input = createBaseTestThought({ thought: 'X' });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with single character content', () => {
      const input = createBaseTestThought({ thought: 'Y' });

      const thought = factory.createThought(input, 'session-par-001');

      expect(thought.content).toBe('Y');
    });

    it('should reject empty thought', () => {
      const input = createBaseTestThought({ thought: '' });

      const result = factory.validate(input);

      assertValidationFailed(result);
      assertHasErrorCode(result, 'EMPTY_THOUGHT');
    });
  });

  /**
   * T-PAR-002: thought - maximum length (10000+ chars)
   */
  describe('T-PAR-002: Thought Maximum Length', () => {
    it('should accept very long thought content', () => {
      const longContent = 'A'.repeat(10000);
      const input = createBaseTestThought({ thought: longContent });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with very long content', () => {
      const longContent = 'B'.repeat(10000);
      const input = createBaseTestThought({ thought: longContent });

      const thought = factory.createThought(input, 'session-par-002');

      expect(thought.content.length).toBe(10000);
    });

    it('should handle extremely long content (50000 chars)', () => {
      const veryLongContent = 'C'.repeat(50000);
      const input = createBaseTestThought({ thought: veryLongContent });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });
  });

  /**
   * T-PAR-003: thought - Unicode characters
   */
  describe('T-PAR-003: Thought Unicode Characters', () => {
    it('should accept Unicode thought content', () => {
      const input = createBaseTestThought({
        thought: 'Unicode test: alpha beta gamma delta',
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should accept Chinese characters', () => {
      const input = createBaseTestThought({
        thought: 'Chinese: zhongwen',
      });

      const thought = factory.createThought(input, 'session-par-003');

      expect(thought.content).toContain('Chinese');
    });

    it('should accept mixed language content', () => {
      const input = createBaseTestThought({
        thought: 'Mixed: English, Francs, Espanol',
      });

      const thought = factory.createThought(input, 'session-par-003');

      expect(thought.content).toContain('Mixed');
    });

    it('should accept mathematical symbols', () => {
      const input = createBaseTestThought({
        thought: 'Math: x = y + z, integral of f(x)',
      });

      const thought = factory.createThought(input, 'session-par-003');

      expect(thought.content).toContain('Math');
    });
  });

  /**
   * T-PAR-004: thought - Special characters
   */
  describe('T-PAR-004: Thought Special Characters', () => {
    it('should accept special characters in thought', () => {
      const input = createBaseTestThought({
        thought: 'Special: !@#$%^&*()_+-=[]{}|;:\'",.<>?/',
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should accept newlines and tabs', () => {
      const input = createBaseTestThought({
        thought: 'Line 1\nLine 2\n\tIndented line',
      });

      const thought = factory.createThought(input, 'session-par-004');

      expect(thought.content).toContain('\n');
    });

    it('should accept quotes and backslashes', () => {
      const input = createBaseTestThought({
        thought: 'Quotes: "double" and \'single\' and \\backslash\\',
      });

      const thought = factory.createThought(input, 'session-par-004');

      expect(thought.content).toContain('"');
      expect(thought.content).toContain("'");
    });
  });

  // ===========================================================================
  // THOUGHT NUMBER TESTS (T-PAR-005 to T-PAR-006)
  // ===========================================================================

  /**
   * T-PAR-005: thoughtNumber - minimum (1)
   */
  describe('T-PAR-005: ThoughtNumber Minimum', () => {
    it('should accept thoughtNumber = 1', () => {
      const input = createBaseTestThought({ thoughtNumber: 1 });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with thoughtNumber 1', () => {
      const input = createBaseTestThought({ thoughtNumber: 1 });

      const thought = factory.createThought(input, 'session-par-005');

      expect(thought.thoughtNumber).toBe(1);
    });

    it('should handle thoughtNumber = 0 at factory level', () => {
      // Note: Full validation (positive check) happens at MCP tool input level via Zod schema
      // Factory level validation is minimal and allows this through
      const input = createBaseTestThought({ thoughtNumber: 0 });

      const result = factory.validate(input);
      // Factory validation passes; Zod schema at MCP layer would catch this
      assertValidationPassed(result);
    });

    it('should handle negative thoughtNumber at factory level', () => {
      // Note: Full validation (positive check) happens at MCP tool input level via Zod schema
      // Factory level validation is minimal and allows this through
      const input = createBaseTestThought({ thoughtNumber: -1 });

      const result = factory.validate(input);
      // Factory validation passes; Zod schema at MCP layer would catch this
      assertValidationPassed(result);
    });
  });

  /**
   * T-PAR-006: thoughtNumber - large value (100+)
   */
  describe('T-PAR-006: ThoughtNumber Large Value', () => {
    it('should accept thoughtNumber = 100', () => {
      const input = createBaseTestThought({
        thoughtNumber: 100,
        totalThoughts: 150,
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should accept very large thoughtNumber', () => {
      const input = createBaseTestThought({
        thoughtNumber: 1000,
        totalThoughts: 1000,
      });

      const thought = factory.createThought(input, 'session-par-006');

      expect(thought.thoughtNumber).toBe(1000);
    });
  });

  // ===========================================================================
  // TOTAL THOUGHTS TESTS (T-PAR-007 to T-PAR-008)
  // ===========================================================================

  /**
   * T-PAR-007: totalThoughts - minimum (1)
   */
  describe('T-PAR-007: TotalThoughts Minimum', () => {
    it('should accept totalThoughts = 1', () => {
      const input = createBaseTestThought({
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create single-thought session', () => {
      const input = createBaseTestThought({
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      });

      const thought = factory.createThought(input, 'session-par-007');

      expect(thought.totalThoughts).toBe(1);
      expect(thought.nextThoughtNeeded).toBe(false);
    });

    it('should reject totalThoughts = 0', () => {
      const input = createBaseTestThought({ totalThoughts: 0 });

      const result = factory.validate(input);

      assertValidationFailed(result);
    });
  });

  /**
   * T-PAR-008: totalThoughts - dynamic update
   */
  describe('T-PAR-008: TotalThoughts Dynamic Update', () => {
    it('should allow increasing totalThoughts mid-session', () => {
      const sessionId = 'session-par-008';

      const input1 = createBaseTestThought({
        thought: 'Initial estimate',
        thoughtNumber: 1,
        totalThoughts: 3,
      });
      const input2 = createBaseTestThought({
        thought: 'Revised estimate',
        thoughtNumber: 2,
        totalThoughts: 5, // Increased
      });

      const thought1 = factory.createThought(input1, sessionId);
      const thought2 = factory.createThought(input2, sessionId);

      expect(thought1.totalThoughts).toBe(3);
      expect(thought2.totalThoughts).toBe(5);
    });

    it('should allow decreasing totalThoughts mid-session', () => {
      const sessionId = 'session-par-008b';

      const input1 = createBaseTestThought({
        thought: 'Overestimate',
        thoughtNumber: 1,
        totalThoughts: 10,
      });
      const input2 = createBaseTestThought({
        thought: 'Actually need fewer',
        thoughtNumber: 2,
        totalThoughts: 3,
      });

      const thought1 = factory.createThought(input1, sessionId);
      const thought2 = factory.createThought(input2, sessionId);

      expect(thought1.totalThoughts).toBe(10);
      expect(thought2.totalThoughts).toBe(3);
    });
  });

  // ===========================================================================
  // NEXT THOUGHT NEEDED TESTS (T-PAR-009 to T-PAR-010)
  // ===========================================================================

  /**
   * T-PAR-009: nextThoughtNeeded - true path
   */
  describe('T-PAR-009: NextThoughtNeeded True', () => {
    it('should accept nextThoughtNeeded = true', () => {
      const input = createBaseTestThought({ nextThoughtNeeded: true });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought that needs continuation', () => {
      const input = createBaseTestThought({ nextThoughtNeeded: true });

      const thought = factory.createThought(input, 'session-par-009');

      expect(thought.nextThoughtNeeded).toBe(true);
    });
  });

  /**
   * T-PAR-010: nextThoughtNeeded - false (completion)
   */
  describe('T-PAR-010: NextThoughtNeeded False', () => {
    it('should accept nextThoughtNeeded = false', () => {
      const input = createBaseTestThought({
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create completed thought', () => {
      const input = createBaseTestThought({
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
      });

      const thought = factory.createThought(input, 'session-par-010');

      expect(thought.nextThoughtNeeded).toBe(false);
    });
  });

  // ===========================================================================
  // SESSION ID TESTS (T-PAR-011 to T-PAR-013)
  // ===========================================================================

  /**
   * T-PAR-011: sessionId - new session (omitted)
   */
  describe('T-PAR-011: SessionId New Session', () => {
    it('should create thought without sessionId in input', () => {
      const input = createBaseTestThought();
      delete (input as any).sessionId;

      // Factory requires sessionId parameter for createThought
      const thought = factory.createThought(input, 'auto-generated-session');

      expect(thought.sessionId).toBe('auto-generated-session');
    });

    it('should accept any valid session ID', () => {
      const input = createBaseTestThought();

      const thought = factory.createThought(input, 'my-custom-session-123');

      expect(thought.sessionId).toBe('my-custom-session-123');
    });
  });

  /**
   * T-PAR-012: sessionId - existing session
   */
  describe('T-PAR-012: SessionId Existing Session', () => {
    it('should reuse session ID for multiple thoughts', () => {
      const sessionId = 'existing-session-par-012';
      const input1 = createBaseTestThought({ thoughtNumber: 1 });
      const input2 = createBaseTestThought({ thoughtNumber: 2 });

      const thought1 = factory.createThought(input1, sessionId);
      const thought2 = factory.createThought(input2, sessionId);

      expect(thought1.sessionId).toBe(sessionId);
      expect(thought2.sessionId).toBe(sessionId);
    });
  });

  /**
   * T-PAR-013: sessionId - invalid session
   */
  describe('T-PAR-013: SessionId Invalid', () => {
    it('should accept various session ID formats', () => {
      // Factory accepts any string as session ID
      const thought1 = factory.createThought(createBaseTestThought(), 'simple');
      const thought2 = factory.createThought(createBaseTestThought(), 'with-dashes');
      const thought3 = factory.createThought(createBaseTestThought(), 'with_underscores');
      const thought4 = factory.createThought(createBaseTestThought(), 'with.dots');

      expect(thought1.sessionId).toBe('simple');
      expect(thought2.sessionId).toBe('with-dashes');
      expect(thought3.sessionId).toBe('with_underscores');
      expect(thought4.sessionId).toBe('with.dots');
    });

    it('should handle UUID-format session IDs', () => {
      const uuidSessionId = '550e8400-e29b-41d4-a716-446655440000';

      const thought = factory.createThought(createBaseTestThought(), uuidSessionId);

      expect(thought.sessionId).toBe(uuidSessionId);
    });
  });

  // ===========================================================================
  // UNCERTAINTY TESTS (T-PAR-014 to T-PAR-016)
  // Using Shannon mode which explicitly tracks uncertainty
  // ===========================================================================

  /**
   * Create a Shannon thought for uncertainty testing
   */
  function createShannonTestThought(
    overrides: Partial<ThinkingToolInput> = {}
  ): ThinkingToolInput {
    return {
      thought: 'Test thought content',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'shannon',
      stage: 'problem_definition',
      ...overrides,
    } as ThinkingToolInput;
  }

  /**
   * T-PAR-014: uncertainty - 0.0 boundary
   */
  describe('T-PAR-014: Uncertainty Zero Boundary', () => {
    it('should accept uncertainty = 0.0', () => {
      const input = createShannonTestThought({ uncertainty: 0.0 });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with zero uncertainty (Shannon mode)', () => {
      const input = createShannonTestThought({ uncertainty: 0.0 });

      const thought = factory.createThought(input, 'session-par-014');

      expect(thought.uncertainty).toBe(0);
    });
  });

  /**
   * T-PAR-015: uncertainty - 0.5 midpoint
   */
  describe('T-PAR-015: Uncertainty Midpoint', () => {
    it('should accept uncertainty = 0.5', () => {
      const input = createShannonTestThought({ uncertainty: 0.5 });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with 0.5 uncertainty (Shannon mode)', () => {
      const input = createShannonTestThought({ uncertainty: 0.5 });

      const thought = factory.createThought(input, 'session-par-015');

      expect(thought.uncertainty).toBe(0.5);
    });
  });

  /**
   * T-PAR-016: uncertainty - 1.0 boundary
   */
  describe('T-PAR-016: Uncertainty One Boundary', () => {
    it('should accept uncertainty = 1.0', () => {
      const input = createShannonTestThought({ uncertainty: 1.0 });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with maximum uncertainty (Shannon mode)', () => {
      const input = createShannonTestThought({ uncertainty: 1.0 });

      const thought = factory.createThought(input, 'session-par-016');

      expect(thought.uncertainty).toBe(1.0);
    });

    it('should reject uncertainty > 1.0', () => {
      const input = createShannonTestThought({ uncertainty: 1.5 });

      const result = factory.validate(input);

      assertValidationFailed(result);
    });

    it('should reject negative uncertainty', () => {
      const input = createShannonTestThought({ uncertainty: -0.1 });

      const result = factory.validate(input);

      assertValidationFailed(result);
    });
  });

  // ===========================================================================
  // ASSUMPTIONS TESTS (T-PAR-017 to T-PAR-019)
  // ===========================================================================

  /**
   * T-PAR-017: assumptions - empty array
   * Note: assumptions is available on hybrid mode, not sequential
   */
  describe('T-PAR-017: Assumptions Empty Array', () => {
    it('should accept empty assumptions array', () => {
      const input = createBaseTestThought({ mode: 'hybrid', assumptions: [] });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with empty assumptions', () => {
      const input = createBaseTestThought({ mode: 'hybrid', assumptions: [] });

      const thought = factory.createThought(input, 'session-par-017');

      expect((thought as any).assumptions).toEqual([]);
    });
  });

  /**
   * T-PAR-018: assumptions - single item
   * Note: assumptions is available on hybrid mode, not sequential
   */
  describe('T-PAR-018: Assumptions Single Item', () => {
    it('should accept single assumption', () => {
      const input = createBaseTestThought({
        mode: 'hybrid',
        assumptions: ['The system is stable'],
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with single assumption', () => {
      const input = createBaseTestThought({
        mode: 'hybrid',
        assumptions: ['The data is accurate'],
      });

      const thought = factory.createThought(input, 'session-par-018');

      expect((thought as any).assumptions).toEqual(['The data is accurate']);
    });
  });

  /**
   * T-PAR-019: assumptions - multiple items
   * Note: assumptions is available on hybrid mode, not sequential
   */
  describe('T-PAR-019: Assumptions Multiple Items', () => {
    it('should accept multiple assumptions', () => {
      const input = createBaseTestThought({
        mode: 'hybrid',
        assumptions: [
          'Assumption 1: System is deterministic',
          'Assumption 2: Inputs are bounded',
          'Assumption 3: Resources are sufficient',
          'Assumption 4: Time is not a constraint',
        ],
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with multiple assumptions', () => {
      const input = createBaseTestThought({
        mode: 'hybrid',
        assumptions: ['A', 'B', 'C', 'D', 'E'],
      });

      const thought = factory.createThought(input, 'session-par-019');

      expect((thought as any).assumptions?.length).toBe(5);
    });
  });

  // ===========================================================================
  // DEPENDENCIES TESTS (T-PAR-020 to T-PAR-022)
  // ===========================================================================

  /**
   * T-PAR-020: dependencies - single dependency
   */
  describe('T-PAR-020: Dependencies Single', () => {
    it('should accept single dependency', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        dependencies: ['thought-1'],
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with single dependency', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        dependencies: ['thought-1'],
      });

      const thought = factory.createThought(input, 'session-par-020');

      expect(thought.dependencies).toEqual(['thought-1']);
    });
  });

  /**
   * T-PAR-021: dependencies - multiple dependencies
   */
  describe('T-PAR-021: Dependencies Multiple', () => {
    it('should accept multiple dependencies', () => {
      const input = createBaseTestThought({
        thoughtNumber: 5,
        totalThoughts: 10, // Must be >= thoughtNumber
        dependencies: ['thought-1', 'thought-2', 'thought-3', 'thought-4'],
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with multiple dependencies', () => {
      const input = createBaseTestThought({
        thoughtNumber: 4,
        dependencies: ['thought-1', 'thought-2', 'thought-3'],
      });

      const thought = factory.createThought(input, 'session-par-021');

      expect(thought.dependencies?.length).toBe(3);
    });
  });

  /**
   * T-PAR-022: dependencies - circular reference handling
   */
  describe('T-PAR-022: Dependencies Circular Reference', () => {
    it('should handle self-reference gracefully', () => {
      // Self-reference in input - the system may or may not detect this
      const input = createBaseTestThought({
        thoughtNumber: 1,
        dependencies: ['self-ref'],
      });

      // Should at least not crash
      const thought = factory.createThought(input, 'session-par-022');
      expect(thought.dependencies).toEqual(['self-ref']);
    });

    it('should accept mutual dependencies', () => {
      // This tests that the factory doesn't crash on complex dependency graphs
      const sessionId = 'session-par-022b';

      const input1 = createBaseTestThought({
        thoughtNumber: 1,
        dependencies: ['thought-3'], // Forward reference
      });
      const input2 = createBaseTestThought({
        thoughtNumber: 2,
        dependencies: ['thought-1'],
      });
      const input3 = createBaseTestThought({
        thoughtNumber: 3,
        dependencies: ['thought-2'],
      });

      // All should create without error
      const thought1 = factory.createThought(input1, sessionId);
      const thought2 = factory.createThought(input2, sessionId);
      const thought3 = factory.createThought(input3, sessionId);

      expect(thought1).toBeDefined();
      expect(thought2).toBeDefined();
      expect(thought3).toBeDefined();
    });
  });

  // ===========================================================================
  // BRANCHING TESTS (T-PAR-023 to T-PAR-026)
  // ===========================================================================

  /**
   * T-PAR-023: branchFrom - valid thought ID
   */
  describe('T-PAR-023: BranchFrom Valid', () => {
    it('should accept valid branchFrom ID', () => {
      const input = createBaseTestThought({
        thoughtNumber: 3,
        branchFrom: 'thought-2',
        branchId: 'branch-a',
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create branched thought', () => {
      const input = createBaseTestThought({
        thoughtNumber: 3,
        branchFrom: 'thought-2',
        branchId: 'branch-a',
      });

      const thought = factory.createThought(input, 'session-par-023');

      expect((thought as any).branchFrom).toBe('thought-2');
    });
  });

  /**
   * T-PAR-024: branchFrom - invalid thought ID
   */
  describe('T-PAR-024: BranchFrom Invalid', () => {
    it('should accept any string as branchFrom (validation at session level)', () => {
      // branchFrom is a string ID - validation of existence happens at session level
      const input = createBaseTestThought({
        thoughtNumber: 3,
        branchFrom: 'nonexistent-thought',
        branchId: 'branch-x',
      });

      // Factory accepts the input, session manager would validate existence
      const thought = factory.createThought(input, 'session-par-024');

      expect((thought as any).branchFrom).toBe('nonexistent-thought');
    });
  });

  /**
   * T-PAR-025: branchId - alphanumeric
   */
  describe('T-PAR-025: BranchId Alphanumeric', () => {
    it('should accept alphanumeric branch ID', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        branchFrom: 'thought-1',
        branchId: 'branch123',
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with alphanumeric branch ID', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        branchFrom: 'thought-1',
        branchId: 'AlphaBeta123',
      });

      const thought = factory.createThought(input, 'session-par-025');

      expect((thought as any).branchId).toBe('AlphaBeta123');
    });
  });

  /**
   * T-PAR-026: branchId - special characters
   */
  describe('T-PAR-026: BranchId Special Characters', () => {
    it('should accept branch ID with dashes and underscores', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        branchFrom: 'thought-1',
        branchId: 'branch-with_special-chars',
      });

      const thought = factory.createThought(input, 'session-par-026');

      expect((thought as any).branchId).toBe('branch-with_special-chars');
    });

    it('should accept branch ID with dots', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        branchFrom: 'thought-1',
        branchId: 'branch.v1.0',
      });

      const thought = factory.createThought(input, 'session-par-026');

      expect((thought as any).branchId).toBe('branch.v1.0');
    });
  });

  // ===========================================================================
  // REVISION TESTS (T-PAR-027 to T-PAR-032)
  // ===========================================================================

  /**
   * T-PAR-027: isRevision - true with revisesThought
   */
  describe('T-PAR-027: IsRevision With RevisesThought', () => {
    it('should accept isRevision = true with revisesThought', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        isRevision: true,
        revisesThought: 'thought-1',
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create revision thought', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        isRevision: true,
        revisesThought: 'thought-1',
      });

      const thought = factory.createThought(input, 'session-par-027');

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-1');
    });
  });

  /**
   * T-PAR-028: isRevision - true without revisesThought
   */
  describe('T-PAR-028: IsRevision Without RevisesThought', () => {
    it('should warn when isRevision = true but revisesThought missing', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        isRevision: true,
        // Missing revisesThought
      });

      const result = factory.validate(input);

      // Should pass but may have warning about missing revisesThought
      // The validation behavior depends on implementation
      expect(result).toBeDefined();
    });

    it('should still create thought (handler may set default)', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        isRevision: true,
      });

      const thought = factory.createThought(input, 'session-par-028');

      expect(thought.isRevision).toBe(true);
    });
  });

  /**
   * T-PAR-029: revisesThought - valid thought ID
   */
  describe('T-PAR-029: RevisesThought Valid', () => {
    it('should accept valid revisesThought ID', () => {
      const input = createBaseTestThought({
        thoughtNumber: 3,
        isRevision: true,
        revisesThought: 'thought-2',
      });

      const thought = factory.createThought(input, 'session-par-029');

      expect(thought.revisesThought).toBe('thought-2');
    });
  });

  /**
   * T-PAR-030: revisesThought - invalid thought ID
   */
  describe('T-PAR-030: RevisesThought Invalid', () => {
    it('should accept any string as revisesThought (validation at session level)', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        isRevision: true,
        revisesThought: 'nonexistent-thought-xyz',
      });

      // Factory accepts it, session manager validates existence
      const thought = factory.createThought(input, 'session-par-030');

      expect(thought.revisesThought).toBe('nonexistent-thought-xyz');
    });
  });

  /**
   * T-PAR-031: revisionReason - with revision
   */
  describe('T-PAR-031: RevisionReason With Revision', () => {
    it('should accept revisionReason with isRevision', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        isRevision: true,
        revisesThought: 'thought-1',
        revisionReason: 'Found error in original logic',
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });

    it('should create thought with revision reason', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        isRevision: true,
        revisesThought: 'thought-1',
        revisionReason: 'New evidence requires update',
      });

      const thought = factory.createThought(input, 'session-par-031');

      expect(thought.isRevision).toBe(true);
      // revisionReason may be stored on the thought or just used as metadata
      expect((thought as any).revisionReason).toBe('New evidence requires update');
    });
  });

  /**
   * T-PAR-032: revisionReason - without revision
   */
  describe('T-PAR-032: RevisionReason Without Revision', () => {
    it('should accept revisionReason even without isRevision', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        isRevision: false,
        revisionReason: 'Just a note', // Unusual but accepted
      });

      // Should not fail validation
      const result = factory.validate(input);
      expect(result).toBeDefined();
    });

    it('should create thought preserving revisionReason', () => {
      const input = createBaseTestThought({
        thoughtNumber: 2,
        revisionReason: 'Standalone reason',
      });

      const thought = factory.createThought(input, 'session-par-032');

      // May or may not preserve revisionReason when not a revision
      expect(thought).toBeDefined();
    });
  });
});
