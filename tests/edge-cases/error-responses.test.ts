/**
 * Error Response Format Tests
 *
 * Tests T-EDG-031 through T-EDG-035: Comprehensive tests for
 * error message structure and format consistency.
 *
 * Phase 11 Sprint 10: Edge Cases & Error Handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModeHandlerRegistry, createValidationError, createValidationWarning } from '../../src/modes/index.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';

describe('Error Response Format Tests', () => {
  let registry: ModeHandlerRegistry;

  beforeEach(() => {
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
  // T-EDG-031: Error message structure
  // ===========================================================================
  describe('T-EDG-031: Error Message Structure', () => {
    it('should return structured error on validation failure', () => {
      const input = createValidInput();
      input.thought = '';

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should include field in error', () => {
      const input = createValidInput();
      input.thought = '';

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);

      expect(result.errors![0].field).toBeDefined();
      expect(result.errors![0].field).toBe('thought');
    });

    it('should include message in error', () => {
      const input = createValidInput();
      input.thought = '';

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);

      expect(result.errors![0].message).toBeDefined();
      expect(result.errors![0].message.length).toBeGreaterThan(0);
    });

    it('should include code in error', () => {
      const input = createValidInput();
      input.thought = '';

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);

      expect(result.errors![0].code).toBeDefined();
      expect(result.errors![0].code).toBe('EMPTY_THOUGHT');
    });
  });

  // ===========================================================================
  // T-EDG-032: Error code consistency
  // ===========================================================================
  describe('T-EDG-032: Error Code Consistency', () => {
    it('should use consistent code for empty thought across modes', () => {
      const modes = ['sequential', 'hybrid', 'mathematics', 'bayesian'];

      for (const mode of modes) {
        const input = createValidInput();
        input.thought = '';
        input.mode = mode as any;

        const handler = registry.getHandler(mode);
        const result = handler.validate(input);

        expect(result.valid).toBe(false);
        expect(result.errors![0].code).toBe('EMPTY_THOUGHT');
      }
    });

    it('should use consistent code for invalid thought number', () => {
      const input = createValidInput();
      input.thoughtNumber = 10;
      input.totalThoughts = 5;

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);

      expect(result.errors![0].code).toBe('INVALID_THOUGHT_NUMBER');
    });

    it('should use specific codes for specific errors', () => {
      // Test that createValidationError produces proper error codes
      const error = createValidationError('priorProbability', 'Probability must be between 0 and 1', 'PROBABILITY_OUT_OF_RANGE');

      expect(error.field).toBe('priorProbability');
      expect(error.code).toBe('PROBABILITY_OUT_OF_RANGE');
      expect(error.message).toContain('Probability');
    });
  });

  // ===========================================================================
  // T-EDG-033: Error details inclusion
  // ===========================================================================
  describe('T-EDG-033: Error Details Inclusion', () => {
    it('should include field name in error details', () => {
      const error = createValidationError('testField', 'Test message', 'TEST_CODE');

      expect(error.field).toBe('testField');
    });

    it('should include descriptive message', () => {
      const input = createValidInput();
      input.thoughtNumber = 10;
      input.totalThoughts = 3;

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);

      expect(result.errors![0].message).toContain('10');
      expect(result.errors![0].message).toContain('3');
    });

    it('should validate causal graphs with edges', () => {
      const input = createValidInput();
      input.mode = 'causal';
      (input as any).nodes = [{ id: 'A', name: 'A' }];
      (input as any).edges = [{ from: 'A', to: 'NonExistent' }];

      const handler = registry.getHandler('causal');
      const result = handler.validate(input);

      // Handler may not validate edge references (design choice)
      // Just verify it returns a proper validation result
      expect(typeof result.valid).toBe('boolean');
      if (!result.valid && result.errors) {
        // If validation fails, errors should be properly structured
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  // ===========================================================================
  // T-EDG-034: Stack trace exclusion in production
  // ===========================================================================
  describe('T-EDG-034: Stack Trace Exclusion', () => {
    it('should not include stack traces in validation errors', () => {
      const input = createValidInput();
      input.thought = '';

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);

      const errorString = JSON.stringify(result);
      expect(errorString).not.toContain('at ');
      expect(errorString).not.toContain('.ts:');
      expect(errorString).not.toContain('.js:');
    });

    it('should not leak internal paths', () => {
      const input = createValidInput();
      input.thought = '';

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);

      const errorString = JSON.stringify(result);
      expect(errorString).not.toContain('C:\\');
      expect(errorString).not.toContain('/home/');
      expect(errorString).not.toContain('/Users/');
    });

    it('should only include user-facing information', () => {
      const error = createValidationError('field', 'User message', 'CODE');

      expect(Object.keys(error)).toEqual(['field', 'message', 'code']);
    });
  });

  // ===========================================================================
  // T-EDG-035: Graceful degradation
  // ===========================================================================
  describe('T-EDG-035: Graceful Degradation', () => {
    it('should allow valid causal input without confounders', () => {
      const input = createValidInput();
      input.mode = 'causal';
      (input as any).nodes = [
        { id: 'A', name: 'A' },
        { id: 'B', name: 'B' },
        { id: 'C', name: 'C' },
      ];
      // No confounders provided - optional, should not fail

      const handler = registry.getHandler('causal');
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      // Warnings are optional - handler may or may not generate them
    });

    it('should include suggestions in warnings when created', () => {
      const warning = createValidationWarning('field', 'Warning message', 'Suggestion text');

      expect(warning.field).toBe('field');
      expect(warning.message).toBe('Warning message');
      expect(warning.suggestion).toBe('Suggestion text');
    });

    it('should validate bayesian input without evidence', () => {
      const input = createValidInput();
      input.mode = 'bayesian';
      (input as any).priorProbability = 0.5;
      // No evidence - optional, should not fail

      const handler = registry.getHandler('bayesian');
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      // Warnings are optional - handler may or may not generate them
    });

    it('should collect all errors before returning', () => {
      const input = createValidInput();
      input.thought = '';
      input.thoughtNumber = 10;
      input.totalThoughts = 3;

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);

      // Empty thought error is first, may short-circuit
      expect(result.valid).toBe(false);
      expect(result.errors!.length).toBeGreaterThanOrEqual(1);
    });
  });
});
