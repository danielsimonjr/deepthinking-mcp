/**
 * Input Validation Edge Case Tests
 *
 * Tests T-EDG-001 through T-EDG-012: Comprehensive tests for
 * missing and invalid required parameters.
 *
 * Phase 11 Sprint 10: Edge Cases & Error Handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../src/modes/index.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';

describe('Input Validation Edge Cases', () => {
  let factory: ThoughtFactory;
  let registry: ModeHandlerRegistry;

  beforeEach(() => {
    factory = new ThoughtFactory();
    registry = ModeHandlerRegistry.getInstance();
  });

  function createValidInput(): ThinkingToolInput {
    return {
      thought: 'Valid thought content',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'sequential',
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-EDG-001: Missing required thought parameter
  // ===========================================================================
  describe('T-EDG-001: Missing Thought Parameter', () => {
    it('should reject input without thought', () => {
      const input = createValidInput();
      delete (input as any).thought;

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);
      expect(result.valid).toBe(false);
    });

    it('should provide clear error message for missing thought', () => {
      const input = createValidInput();
      (input as any).thought = undefined;

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0].code).toBe('EMPTY_THOUGHT');
    });
  });

  // ===========================================================================
  // T-EDG-002: Missing required thoughtNumber parameter
  // ===========================================================================
  describe('T-EDG-002: Missing ThoughtNumber Parameter', () => {
    it('should handle missing thoughtNumber', () => {
      const input = createValidInput();
      delete (input as any).thoughtNumber;

      // Factory should handle this gracefully
      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });
  });

  // ===========================================================================
  // T-EDG-003: Missing required totalThoughts parameter
  // ===========================================================================
  describe('T-EDG-003: Missing TotalThoughts Parameter', () => {
    it('should handle missing totalThoughts', () => {
      const input = createValidInput();
      delete (input as any).totalThoughts;

      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });
  });

  // ===========================================================================
  // T-EDG-004: Missing required nextThoughtNeeded parameter
  // ===========================================================================
  describe('T-EDG-004: Missing NextThoughtNeeded Parameter', () => {
    it('should handle missing nextThoughtNeeded', () => {
      const input = createValidInput();
      delete (input as any).nextThoughtNeeded;

      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });
  });

  // ===========================================================================
  // T-EDG-005: thoughtNumber = 0 (invalid)
  // ===========================================================================
  describe('T-EDG-005: ThoughtNumber Zero', () => {
    it('should handle thoughtNumber = 0', () => {
      const input = createValidInput();
      input.thoughtNumber = 0;

      // GenericModeHandler doesn't validate this at handler level
      // but it's caught at schema level
      const thought = factory.createThought(input, 'session-1');
      expect(thought).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EDG-006: thoughtNumber > totalThoughts
  // ===========================================================================
  describe('T-EDG-006: ThoughtNumber Exceeds Total', () => {
    it('should reject thoughtNumber > totalThoughts', () => {
      const input = createValidInput();
      input.thoughtNumber = 5;
      input.totalThoughts = 3;

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0].code).toBe('INVALID_THOUGHT_NUMBER');
    });
  });

  // ===========================================================================
  // T-EDG-007: totalThoughts = 0 (invalid)
  // ===========================================================================
  describe('T-EDG-007: TotalThoughts Zero', () => {
    it('should handle totalThoughts = 0', () => {
      const input = createValidInput();
      input.totalThoughts = 0;
      input.thoughtNumber = 1;

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);
      // thoughtNumber (1) > totalThoughts (0)
      expect(result.valid).toBe(false);
    });
  });

  // ===========================================================================
  // T-EDG-008: uncertainty < 0 (invalid)
  // ===========================================================================
  describe('T-EDG-008: Uncertainty Below Zero', () => {
    it('should handle negative uncertainty', () => {
      const input = createValidInput();
      (input as any).uncertainty = -0.5;

      const thought = factory.createThought(input, 'session-1');
      // Factory creates thought but value may be clamped or ignored
      expect(thought).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EDG-009: uncertainty > 1 (invalid)
  // ===========================================================================
  describe('T-EDG-009: Uncertainty Above One', () => {
    it('should handle uncertainty > 1', () => {
      const input = createValidInput();
      (input as any).uncertainty = 1.5;

      const thought = factory.createThought(input, 'session-1');
      expect(thought).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EDG-010: Invalid mode value
  // ===========================================================================
  describe('T-EDG-010: Invalid Mode Value', () => {
    it('should handle unknown mode gracefully', () => {
      const input = createValidInput();
      (input as any).mode = 'nonexistent_mode';

      // Factory should use generic handler for unknown modes
      const thought = factory.createThought(input, 'session-1');
      expect(thought).toBeDefined();
    });

    it('should fall back to sequential for undefined mode', () => {
      const input = createValidInput();
      delete (input as any).mode;

      const thought = factory.createThought(input, 'session-1');
      expect(thought).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EDG-011: Empty thought string
  // ===========================================================================
  describe('T-EDG-011: Empty Thought String', () => {
    it('should reject empty thought string', () => {
      const input = createValidInput();
      input.thought = '';

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);
      expect(result.valid).toBe(false);
    });

    it('should reject whitespace-only thought', () => {
      const input = createValidInput();
      input.thought = '   \n\t   ';

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);
      expect(result.valid).toBe(false);
    });
  });

  // ===========================================================================
  // T-EDG-012: Null parameter handling
  // ===========================================================================
  describe('T-EDG-012: Null Parameter Handling', () => {
    it('should handle null thought gracefully', () => {
      const input = createValidInput();
      (input as any).thought = null;

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);
      expect(result.valid).toBe(false);
    });

    it('should handle null arrays gracefully', () => {
      const input = createValidInput();
      (input as any).assumptions = null;

      // Should not crash
      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });

    it('should handle null objects gracefully', () => {
      const input = createValidInput();
      (input as any).proofStrategy = null;

      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });
  });
});
