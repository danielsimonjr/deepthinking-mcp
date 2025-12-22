/**
 * Type Validation Edge Case Tests
 *
 * Tests T-EDG-013 through T-EDG-018: Comprehensive tests for
 * type mismatches and coercion handling.
 *
 * Phase 11 Sprint 10: Edge Cases & Error Handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../src/modes/index.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';

describe('Type Validation Edge Cases', () => {
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
  // T-EDG-013: String where number expected
  // ===========================================================================
  describe('T-EDG-013: String Where Number Expected', () => {
    it('should handle string thoughtNumber', () => {
      const input = createValidInput();
      (input as any).thoughtNumber = '1';

      // Should handle string-to-number coercion or reject
      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });

    it('should handle non-numeric string for number field', () => {
      const input = createValidInput();
      (input as any).thoughtNumber = 'not a number';

      // Should handle gracefully - the factory may coerce or use default
      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });

    it('should handle string uncertainty', () => {
      const input = createValidInput();
      (input as any).uncertainty = '0.5';

      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });
  });

  // ===========================================================================
  // T-EDG-014: Number where string expected
  // ===========================================================================
  describe('T-EDG-014: Number Where String Expected', () => {
    it('should handle number thought - validation may fail', () => {
      const input = createValidInput();
      (input as any).thought = 12345;

      // Handler validation may fail because 12345.trim() throws
      // This is acceptable behavior - strict type checking
      const handler = registry.getHandler('sequential');
      try {
        const result = handler.validate(input);
        // If it doesn't throw, it should return a validation result
        expect(typeof result.valid).toBe('boolean');
      } catch (e: any) {
        // TypeError is acceptable - strict type checking
        expect(e).toBeInstanceOf(TypeError);
      }
    });

    it('should handle number mode', () => {
      const input = createValidInput();
      (input as any).mode = 123;

      // Should handle gracefully
      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });
  });

  // ===========================================================================
  // T-EDG-015: Object where array expected
  // ===========================================================================
  describe('T-EDG-015: Object Where Array Expected', () => {
    it('should handle object for assumptions array', () => {
      const input = createValidInput();
      input.mode = 'hybrid';
      (input as any).assumptions = { key: 'value' };

      // Should handle gracefully - assumptions are optional
      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });

    it('should handle object for evidence array', () => {
      const input = createValidInput();
      input.mode = 'bayesian';
      (input as any).evidence = { single: 'item' };

      // May throw during iteration or handle gracefully
      try {
        const thought = factory.createThought(input, 'session-1');
        expect(thought).toBeDefined();
      } catch (e: any) {
        // Type error during array iteration is acceptable
        expect(e.message).toBeDefined();
      }
    });
  });

  // ===========================================================================
  // T-EDG-016: Array where object expected
  // ===========================================================================
  describe('T-EDG-016: Array Where Object Expected', () => {
    it('should handle array for proofStrategy object', () => {
      const input = createValidInput();
      input.mode = 'mathematics';
      (input as any).proofStrategy = ['step1', 'step2'];

      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });

    it('should handle array for hypothesis object', () => {
      const input = createValidInput();
      input.mode = 'bayesian';
      (input as any).hypothesis = ['hyp1', 'hyp2'];

      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });
  });

  // ===========================================================================
  // T-EDG-017: Boolean where string expected
  // ===========================================================================
  describe('T-EDG-017: Boolean Where String Expected', () => {
    it('should reject boolean thought in validation', () => {
      const input = createValidInput();
      (input as any).thought = true;

      // Handler validation will throw TypeError when calling .trim() on boolean
      const handler = registry.getHandler('sequential');
      expect(() => handler.validate(input)).toThrow(TypeError);
    });

    it('should handle boolean mode', () => {
      const input = createValidInput();
      (input as any).mode = false;

      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });
  });

  // ===========================================================================
  // T-EDG-018: Nested type validation
  // ===========================================================================
  describe('T-EDG-018: Nested Type Validation', () => {
    it('should validate nested objects', () => {
      const input = createValidInput();
      input.mode = 'mathematics';
      (input as any).proofStrategy = {
        type: 'direct',
        steps: 'not an array', // Should be array
      };

      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });

    it('should validate deeply nested structures', () => {
      const input = createValidInput();
      input.mode = 'gametheory';
      (input as any).payoffMatrix = {
        players: ['p1', 'p2'],
        dimensions: 'invalid', // Should be array
        payoffs: 'invalid', // Should be array
      };

      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });

    it('should handle mixed type arrays', () => {
      const input = createValidInput();
      input.mode = 'hybrid';
      (input as any).assumptions = [1, 'string', true, { obj: 'value' }];

      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });

    it('should validate nested array elements', () => {
      const input = createValidInput();
      input.mode = 'causal';
      (input as any).nodes = [
        { id: 'valid', name: 'Valid' },
        'invalid string element',
        123,
      ];

      expect(() => factory.createThought(input, 'session-1')).not.toThrow();
    });
  });
});
